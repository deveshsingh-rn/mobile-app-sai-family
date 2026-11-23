import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";

import { PART_RETRIES, retryDelayMs } from "@/utils/chunk-upload";
import { chunkContentRange, chunkLength, resumableStep, statusContentRange, type ResumableStep } from "@/utils/resumable-upload";
import { apiClient } from "./api";
import { UploadCancelledError, type ChunkedUploadProgress } from "./chunked-upload";
import { DirectUploadError } from "./direct-upload";

/**
 * Resumable video upload (the storage service's own protocol for large files on mobile networks).
 *
 *   1. Our API opens an upload session on the bucket and returns its session URI.
 *   2. The file goes to that URI in consecutive chunks. The answer to each chunk says how many
 *      bytes are stored, and that number — not our own count — decides what is sent next.
 *   3. After any interruption (signal lost, app in the background, phone locked) we ask the session
 *      how far it got and continue from that byte. Nothing already stored is sent again.
 *   4. Our API checks the finished object and returns the key for POST /api/experiences.
 *
 * One chunk is in memory at a time. Returns null when the backend has no resumable upload
 * (older server / other storage) so the caller can fall back to the parts-based upload.
 */

export type ResumableUploadSession = { uploadId: string; sessionUri: string; chunkBytes: number; sizeBytes: number };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function readChunk(uri: string, offset: number, length: number) {
  const handle = new File(uri).open();
  try {
    handle.offset = offset;
    return handle.readBytes(length);
  } finally {
    handle.close();
  }
}

type Answer = { step: ResumableStep; status: number; body: string };

async function put(session: ResumableUploadSession, contentRange: string, bytes: Uint8Array<ArrayBuffer>, signal?: AbortSignal): Promise<Answer> {
  const response = await expoFetch(session.sessionUri, {
    body: bytes,
    headers: { "Content-Range": contentRange },
    method: "PUT",
    signal,
  });
  const step = resumableStep(response.status, response.headers.get("range"), session.sizeBytes);
  const body = step.kind === "refused" ? await response.text().catch(() => "") : "";
  return { body, status: response.status, step };
}

/** Asks the session how many bytes it has stored. */
const queryStatus = (session: ResumableUploadSession, signal?: AbortSignal) =>
  put(session, statusContentRange(session.sizeBytes), new Uint8Array(0), signal);

export async function abortResumableUpload(session: ResumableUploadSession) {
  // Tell the bucket to drop the unfinished bytes, and our API to forget the upload.
  await expoFetch(session.sessionUri, { method: "DELETE" }).catch(() => undefined);
  await apiClient.delete(`/api/media/resumable-uploads/${session.uploadId}`).catch(() => undefined);
}

export async function uploadVideoResumable(
  file: { uri: string; mimeType: string; sizeBytes: number },
  options: {
    onProgress?: (progress: ChunkedUploadProgress) => void;
    /** Called once the session exists (and with null when it is gone), so a retry can resume. */
    onSession?: (session: ResumableUploadSession | null) => void;
    /** Continue this earlier upload instead of starting a new one. */
    resume?: ResumableUploadSession | null;
    /** Internal: set after one automatic restart of an expired session. */
    restarted?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<string | null> {
  const { onProgress, onSession, signal } = options;
  const cancelled = () => Boolean(signal?.aborted);

  let session: ResumableUploadSession;
  let resuming = false;
  if (options.resume && options.resume.sizeBytes === file.sizeBytes) {
    session = options.resume;
    resuming = true;
  } else {
    try {
      const { data } = await apiClient.post<ResumableUploadSession>("/api/media/resumable-uploads", {
        contentType: file.mimeType,
        sizeBytes: file.sizeBytes,
      });
      session = data;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 501 || status === 404) return null;
      throw error;
    }
    onSession?.(session);
  }

  const total = session.sizeBytes;
  const chunkCount = Math.max(1, Math.ceil(total / session.chunkBytes));
  const report = (offset: number) =>
    onProgress?.({ partCount: chunkCount, partsDone: Math.min(chunkCount, Math.floor(offset / session.chunkBytes)), sentBytes: offset, totalBytes: total });

  const restartFresh = () => {
    onSession?.(null);
    if (options.restarted) throw new DirectUploadError("The upload took too long and expired. Please try again.");
    return uploadVideoResumable(file, { ...options, restarted: true, resume: null });
  };

  try {
    let offset = 0;
    let finished = false;
    // After an interruption, the session's own count is the truth.
    let askFirst = resuming;
    let failures = 0;

    while (!finished) {
      if (cancelled()) throw new UploadCancelledError();
      let answer: Answer;
      try {
        if (askFirst) {
          answer = await queryStatus(session, signal);
        } else {
          const length = chunkLength(offset, session.chunkBytes, total);
          answer = await put(session, chunkContentRange(offset, length, total), readChunk(file.uri, offset, length), signal);
        }
      } catch (error) {
        // No answer at all (connection dropped): wait, then ask the session where it is.
        if (cancelled()) throw new UploadCancelledError();
        failures += 1;
        if (failures > PART_RETRIES) throw error;
        console.warn(`[resumable-upload] no answer at byte ${offset} (try ${failures}):`, error instanceof Error ? error.message : error);
        await sleep(retryDelayMs(failures));
        askFirst = true;
        continue;
      }

      const { step } = answer;
      if (step.kind === "done") {
        finished = true;
      } else if (step.kind === "continue") {
        if (step.offset > offset || askFirst) failures = 0; // progress was made
        offset = step.offset;
        askFirst = false;
        report(offset);
        // Every byte is stored but the object was not finalised: asking again finalises it.
        if (offset >= total) askFirst = true;
      } else if (step.kind === "expired") {
        return await restartFresh();
      } else if (step.kind === "retry") {
        failures += 1;
        if (failures > PART_RETRIES) throw new Error(`storage answered ${answer.status}`);
        await sleep(retryDelayMs(failures));
        askFirst = true;
      } else {
        console.warn(`[resumable-upload] refused at byte ${offset}: ${answer.status} ${answer.body.slice(0, 300)}`);
        throw new DirectUploadError(`The upload was refused (status ${answer.status}).`, answer.status);
      }
    }
    report(total);

    const { data } = await apiClient.post<{ key: string }>(`/api/media/resumable-uploads/${session.uploadId}/complete`);
    onSession?.(null);
    return data.key;
  } catch (error) {
    if (cancelled()) {
      void abortResumableUpload(session);
      onSession?.(null);
      throw new UploadCancelledError();
    }
    if (error instanceof DirectUploadError) throw error;
    const response = (error as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } })?.response;
    console.warn("[resumable-upload] failed:", response?.status, response?.data?.error?.code, error instanceof Error ? error.message : error);
    if (response?.status === 404) {
      // Our API no longer knows this upload (24 h): the next try starts a new one.
      onSession?.(null);
      throw new DirectUploadError("The upload took too long and expired. Please try again.");
    }
    // Not cancelled: the session stays, so "Try again" continues from the stored bytes.
    throw new DirectUploadError(
      response?.data?.error?.message || "The upload did not finish. Please check your connection and try again."
    );
  }
}
