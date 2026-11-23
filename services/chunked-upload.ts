import { fetch as expoFetch } from "expo/fetch";
import { File, Paths } from "expo-file-system";

import {
  needsFreshLinks,
  parseStorageError,
  PART_RETRIES,
  partRanges,
  retryDelayMs,
  UPLOAD_CONCURRENCY,
  type PartRange,
} from "@/utils/chunk-upload";
import { apiClient } from "./api";
import { DirectUploadError } from "./direct-upload";

/**
 * Chunked video upload: the file is read in 5 MB parts, the parts go straight to the storage
 * bucket three at a time, and the backend joins them into one video.
 *
 * - A dropped connection costs one part, not the whole video: a failed part is retried up to
 *   3 times (1 s, 2 s, 4 s), the others keep going.
 * - Only the parts being sent are in memory (3 × 5 MB), never the whole file.
 * - Returns the storage key for POST /api/experiences { mediaKey }, or null when the backend has
 *   no chunked upload (older server / Azure storage) so the caller can fall back.
 */

type UploadPlan = {
  uploadId: string;
  partBytes: number;
  partCount: number;
  sizeBytes: number;
  parts: { index: number; uploadUrl: string; headers: Record<string, string> }[];
};

export type ChunkedUploadProgress = { sentBytes: number; totalBytes: number; partsDone: number; partCount: number };

export class UploadCancelledError extends Error {
  constructor() {
    super("Upload cancelled");
    this.name = "UploadCancelledError";
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type PartResult = { status: number; body: string };

/** Transport 1: raw bytes with expo/fetch. */
async function putWithFetch(url: string, headers: Record<string, string>, bytes: Uint8Array<ArrayBuffer>, signal?: AbortSignal): Promise<PartResult> {
  const response = await expoFetch(url, { body: bytes, headers, method: "PUT", signal });
  return { body: response.ok ? "" : await response.text().catch(() => ""), status: response.status };
}

/**
 * Transport 2: the OS's own file uploader (the one the whole-file direct upload uses). The part is
 * written to a temporary file and streamed from disk. Used when transport 1 is refused, because
 * the two build their requests differently.
 */
async function putWithNativeUploader(url: string, headers: Record<string, string>, bytes: Uint8Array<ArrayBuffer>, name: string): Promise<PartResult> {
  const FileSystem = await import("expo-file-system/legacy");
  const temp = new File(Paths.cache, name);
  try {
    if (temp.exists) temp.delete();
    temp.create();
    temp.write(bytes);
    const result = await FileSystem.uploadAsync(url, temp.uri, {
      headers,
      httpMethod: "PUT",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });
    return { body: result.status >= 200 && result.status < 300 ? "" : result.body ?? "", status: result.status };
  } finally {
    try {
      if (temp.exists) temp.delete();
    } catch {
      // A leftover temp part in the cache folder is cleaned by the OS.
    }
  }
}

function readPart(uri: string, range: PartRange) {
  const handle = new File(uri).open();
  try {
    handle.offset = range.start;
    return handle.readBytes(range.length);
  } finally {
    handle.close();
  }
}

/** Everything needed to continue an interrupted upload: the server plan and the parts already stored. */
export type ChunkedUploadSession = { plan: UploadPlan; done: number[] };

export async function abortChunkedUpload(uploadId: string) {
  await apiClient.delete(`/api/media/chunked-uploads/${uploadId}`).catch(() => undefined);
}

export async function uploadVideoInChunks(
  file: { uri: string; mimeType: string; sizeBytes: number },
  options: {
    onProgress?: (progress: ChunkedUploadProgress) => void;
    /** Called when the plan exists and after every stored part, so a retry can resume. */
    onSession?: (session: ChunkedUploadSession) => void;
    /** Continue this earlier upload instead of starting a new one. */
    resume?: ChunkedUploadSession | null;
    /** Internal: set after one automatic restart with new links, so it happens at most once. */
    restarted?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<string | null> {
  const { onProgress, onSession, resume, signal } = options;
  const cancelled = () => Boolean(signal?.aborted);

  let plan: UploadPlan;
  if (resume && resume.plan.sizeBytes === file.sizeBytes) {
    plan = resume.plan;
  } else {
    try {
      const { data } = await apiClient.post<UploadPlan>("/api/media/chunked-uploads", {
        contentType: file.mimeType,
        sizeBytes: file.sizeBytes,
      });
      plan = data;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 501 || status === 404) return null;
      throw error;
    }
  }

  const ranges = partRanges(plan.sizeBytes, plan.partBytes);
  const done = new Set<number>(resume && plan === resume.plan ? resume.done : []);
  let sentBytes = ranges.filter((range) => done.has(range.index)).reduce((sum, range) => sum + range.length, 0);
  const report = () => {
    onProgress?.({ partCount: plan.partCount, partsDone: done.size, sentBytes, totalBytes: plan.sizeBytes });
    onSession?.({ done: [...done], plan });
  };

  const sendPart = async (range: PartRange) => {
    const target = plan.parts[range.index];
    let useNativeUploader = false;
    for (let attempt = 1; ; attempt += 1) {
      if (cancelled()) throw new UploadCancelledError();
      try {
        const bytes = readPart(file.uri, range);
        const result = useNativeUploader
          ? await putWithNativeUploader(target.uploadUrl, target.headers, bytes, `upload-part-${plan.uploadId}-${range.index}.bin`)
          : await putWithFetch(target.uploadUrl, target.headers, bytes, signal);
        if (result.status >= 200 && result.status < 300) return;

        const { code, message } = parseStorageError(result.body);
        console.warn(
          `[chunked-upload] part ${range.index + 1}/${plan.partCount} (${bytes.byteLength} bytes, ${useNativeUploader ? "native" : "fetch"}) → ${result.status} ${code ?? ""} ${message ?? ""}`
        );
        if (needsFreshLinks(result.status, code)) {
          throw new DirectUploadError("The upload links expired.", result.status, code ?? "ExpiredToken");
        }
        if (result.status >= 400 && result.status < 500 && result.status !== 408 && result.status !== 429) {
          // Refused: try the other transport once before giving up on this part.
          if (!useNativeUploader) {
            useNativeUploader = true;
            continue;
          }
          throw new DirectUploadError(
            `The upload was refused (part ${range.index + 1}: ${code ?? `status ${result.status}`}).`,
            result.status,
            code
          );
        }
        throw new Error(`part ${range.index} status ${result.status}`);
      } catch (error) {
        if (cancelled()) throw new UploadCancelledError();
        if (error instanceof DirectUploadError || attempt > PART_RETRIES) {
          console.warn(`[chunked-upload] part ${range.index + 1}/${plan.partCount} failed after ${attempt} tries:`, error instanceof Error ? error.message : error);
          throw error;
        }
        await sleep(retryDelayMs(attempt));
      }
    }
  };

  const uploadParts = async (list: PartRange[]) => {
    const queue = [...list];
    const worker = async () => {
      for (let range = queue.shift(); range; range = queue.shift()) {
        await sendPart(range);
        if (!done.has(range.index)) {
          done.add(range.index);
          sentBytes += range.length;
        }
        report();
      }
    };
    await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, list.length) }, worker));
  };

  try {
    report();
    await uploadParts(ranges.filter((range) => !done.has(range.index)));

    for (let attempt = 1; ; attempt += 1) {
      try {
        const { data } = await apiClient.post<{ key: string }>(`/api/media/chunked-uploads/${plan.uploadId}/complete`);
        return data.key;
      } catch (error) {
        const response = (error as { response?: { status?: number; data?: { error?: { missingParts?: number[] } } } })?.response;
        const missing = response?.data?.error?.missingParts;
        if (response?.status === 409 && missing?.length && attempt <= 2) {
          missing.forEach((index) => done.delete(index));
          sentBytes = ranges.filter((range) => done.has(range.index)).reduce((sum, range) => sum + range.length, 0);
          await uploadParts(ranges.filter((range) => missing.includes(range.index)));
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    if (cancelled()) {
      void abortChunkedUpload(plan.uploadId);
      throw new UploadCancelledError();
    }
    // Not cancelled: keep the stored parts on the server so "Try again" resumes from here.
    const response = (error as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } })?.response;
    console.warn("[chunked-upload] failed:", response?.status, response?.data?.error?.code, error instanceof Error ? error.message : error);
    if (error instanceof DirectUploadError && needsFreshLinks(error.status ?? 0, error.code)) {
      // Links expired (they last 60 minutes): drop this session and start a new one right away.
      void abortChunkedUpload(plan.uploadId);
      onSession?.({ done: [], plan: { ...plan, sizeBytes: -1 } });
      if (!options.restarted) {
        return uploadVideoInChunks(file, { ...options, restarted: true, resume: null });
      }
      throw new DirectUploadError("The upload links expired. Please try again.", error.status, error.code);
    }
    if (error instanceof DirectUploadError) throw error;
    if (response?.status === 404) {
      // The server session expired (2 h): the next try must start a new upload.
      onSession?.({ done: [], plan: { ...plan, sizeBytes: -1 } });
      throw new DirectUploadError("The upload took too long and expired. Please try again.");
    }
    throw new DirectUploadError(
      response?.data?.error?.message || "The upload did not finish. Please check your connection and try again."
    );
  }
}
