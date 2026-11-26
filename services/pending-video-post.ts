import { useSyncExternalStore } from "react";

import { createExperienceSuccess, fetchExperiencesRequest } from "@/store/experiences/actions";
import { flattenExperience } from "@/store/experiences/saga";
import type { Experience } from "@/store/experiences/types";
import { AppState } from "react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

import {
  abortChunkedUpload,
  UploadCancelledError,
  uploadVideoInChunks,
  type ChunkedUploadSession,
} from "./chunked-upload";
import { uploadFileDirect } from "./direct-upload";
import { abortResumableUpload, uploadVideoResumable, type ResumableUploadSession } from "./resumable-upload";
import { apiCreateExperience } from "./experiences";

/**
 * A video post that is still uploading.
 *
 * The moment the devotee taps Publish, the post screen closes and this pending post appears at the
 * top of THEIR feed with a live percentage. The upload continues while they use the app. Only when
 * it reaches 100% is the post created on the server, so other devotees see it only then.
 * One video uploads at a time.
 */

export type PendingVideoPost = {
  id: string;
  content: string;
  location?: string;
  category: string;
  video: { uri: string; mimeType: string; sizeBytes: number; durationMs?: number | null };
  /** uploading (sentBytes 0 = still preparing) → publishing → published (shown briefly) | failed */
  status: "uploading" | "publishing" | "published" | "failed";
  sentBytes: number;
  totalBytes: number;
  startedAt: number;
  /** Bytes already stored when this attempt started, so the speed counts only this attempt. */
  startedBytes: number;
  /** Failed only: true when the next try continues from the stored bytes instead of from 0. */
  canResume?: boolean;
  error?: string;
};

// Redux dispatch from the calling screen (kept loose: this module must not import the store).
type Dispatch = (action: any) => unknown;

const KEEP_AWAKE_TAG = "video-upload";
/** Automatic retries after a failure (when the app comes back to the foreground). */
const MAX_AUTO_RETRIES = 3;
/** How long the "Your video is live" state stays on the card before the real post replaces it. */
const LIVE_MOMENT_MS = 2500;

let pending: PendingVideoPost | null = null;
let controller: AbortController | null = null;
/** Parts already stored for the pending post, so a retry continues instead of starting over. */
let session: ChunkedUploadSession | null = null;
/** The resumable upload session of the pending post (preferred path), for the same purpose. */
let resumableSession: ResumableUploadSession | null = null;

/** Forgets both kinds of saved progress; with `release`, also frees what is stored on the server. */
function dropSessions(release: boolean) {
  if (release && session) void abortChunkedUpload(session.plan.uploadId);
  if (release && resumableSession) void abortResumableUpload(resumableSession);
  session = null;
  resumableSession = null;
}
let autoRetries = 0;
/** Video already in storage but the post was not created yet: a retry only publishes. */
let uploadedKey: string | null = null;
let dispatchRef: Dispatch | null = null;
const listeners = new Set<() => void>();

function set(next: PendingVideoPost | null) {
  pending = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getPendingVideoPost = () => pending;

/** React hook: the pending post (or null), re-rendering as the upload progresses. */
export function usePendingVideoPost() {
  return useSyncExternalStore(subscribe, getPendingVideoPost, getPendingVideoPost);
}

async function run() {
  const job = pending;
  if (!job) return;
  controller = new AbortController();
  const signal = controller.signal;
  const stillThisJob = () => pending?.id === job.id;

  // A long upload must not be cut by the screen locking (iOS suspends the app when it does).
  void activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);

  try {
    const onProgress = ({ sentBytes, totalBytes }: { sentBytes: number; totalBytes: number }) => {
      if (stillThisJob()) set({ ...pending!, sentBytes, totalBytes });
    };

    // Preferred: one resumable session (continues from the exact byte after any interruption).
    // Skipped only when this post already has parts stored by the older parts-based upload.
    let mediaKey = uploadedKey
      ? uploadedKey
      : session
      ? null
      : await uploadVideoResumable(job.video, {
          onProgress,
          onSession: (next) => {
            if (stillThisJob()) resumableSession = next;
          },
          resume: resumableSession,
          signal,
        });

    // Server without resumable upload: 5 MB parts joined by the backend.
    if (!mediaKey) {
      mediaKey = await uploadVideoInChunks(job.video, {
        onProgress,
        onSession: (next) => {
          if (stillThisJob()) session = next;
        },
        resume: session,
        signal,
      });
    }

    // Server without chunked upload: one direct upload, same progress numbers.
    if (!mediaKey) {
      mediaKey = await uploadFileDirect(job.video, (fraction) => {
        if (stillThisJob()) set({ ...pending!, sentBytes: Math.round(fraction * job.totalBytes) });
      });
    }
    if (!stillThisJob() || signal.aborted) return;
    uploadedKey = mediaKey;

    set({ ...pending!, sentBytes: job.totalBytes, status: "publishing" });
    const response = await apiCreateExperience({
      category: job.category,
      content: job.content,
      location: job.location,
      media: mediaKey ? { type: "video", uri: job.video.uri } : { mimeType: job.video.mimeType, type: "video", uri: job.video.uri },
      mediaKey: mediaKey ?? undefined,
    });
    if (!stillThisJob()) return;

    // Now it exists on the server. Show "live" on the card for a moment, then the real post.
    dropSessions(false);
    uploadedKey = null;
    autoRetries = 0;
    set({ ...pending!, status: "published" });
    const dispatch = dispatchRef;
    setTimeout(() => {
      dispatch?.(createExperienceSuccess(flattenExperience(response.experience) as Experience));
      dispatch?.(fetchExperiencesRequest({ limit: 10, offset: 0 }));
      if (stillThisJob()) set(null);
    }, LIVE_MOMENT_MS);
  } catch (error) {
    if (!stillThisJob()) return;
    if (error instanceof UploadCancelledError || signal.aborted) {
      dropSessions(false);
      uploadedKey = null;
      set(null);
      return;
    }
    const backendMessage = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
    set({
      ...pending!,
      canResume: Boolean(uploadedKey || resumableSession || session),
      error:
        backendMessage ||
        (error instanceof Error && error.name === "DirectUploadError"
          ? error.message
          : "The upload did not finish. Check your connection and try again."),
      status: "failed",
    });
  } finally {
    controller = null;
    void deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
  }
}

// Coming back to the app after an interruption (call, screen lock, app switch): continue by itself.
AppState.addEventListener("change", (state) => {
  if (state === "active" && pending?.status === "failed" && autoRetries < MAX_AUTO_RETRIES) {
    autoRetries += 1;
    retryPendingVideoPost();
  }
});

/** Starts uploading; returns false when another video is still uploading. */
export function startPendingVideoPost(
  input: Pick<PendingVideoPost, "category" | "content" | "location" | "video">,
  dispatch: Dispatch
) {
  if (pending && pending.status !== "failed" && pending.status !== "published") return false;
  dropSessions(true); // discard the failed upload it replaces
  uploadedKey = null;
  autoRetries = 0;
  dispatchRef = dispatch;
  set({
    ...input,
    id: `pending-${Date.now()}`,
    sentBytes: 0,
    startedAt: Date.now(),
    startedBytes: 0,
    status: "uploading",
    totalBytes: input.video.sizeBytes,
  });
  void run();
  return true;
}

export function retryPendingVideoPost() {
  if (pending?.status !== "failed") return;
  // Resumes from the parts already stored (see `session`); progress continues from there.
  set({ ...pending, canResume: undefined, error: undefined, startedAt: Date.now(), startedBytes: pending.sentBytes, status: "uploading" });
  void run();
}

/** Cancels an upload in progress, or discards a failed one. */
export function cancelPendingVideoPost() {
  if (!pending || pending.status === "published") return;
  if (controller) controller.abort();
  // Uploading: the uploader frees its own session when it sees the abort. Failed: free it here.
  dropSessions(!controller);
  uploadedKey = null;
  autoRetries = 0;
  set(null);
}
