import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";

import { PART_RETRIES, partRanges, retryDelayMs, UPLOAD_CONCURRENCY, type PartRange } from "@/utils/chunk-upload";
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

function readPart(uri: string, range: PartRange) {
  const handle = new File(uri).open();
  try {
    handle.offset = range.start;
    return handle.readBytes(range.length);
  } finally {
    handle.close();
  }
}

export async function uploadVideoInChunks(
  file: { uri: string; mimeType: string; sizeBytes: number },
  options: { onProgress?: (progress: ChunkedUploadProgress) => void; signal?: AbortSignal } = {}
): Promise<string | null> {
  const { onProgress, signal } = options;
  const cancelled = () => Boolean(signal?.aborted);

  let plan: UploadPlan;
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

  const ranges = partRanges(plan.sizeBytes, plan.partBytes);
  const done = new Set<number>();
  let sentBytes = 0;
  const report = () => onProgress?.({ partCount: plan.partCount, partsDone: done.size, sentBytes, totalBytes: plan.sizeBytes });

  const sendPart = async (range: PartRange) => {
    const target = plan.parts[range.index];
    for (let attempt = 1; ; attempt += 1) {
      if (cancelled()) throw new UploadCancelledError();
      try {
        const response = await expoFetch(target.uploadUrl, {
          body: readPart(file.uri, range),
          headers: target.headers,
          method: "PUT",
          signal,
        });
        if (response.status >= 200 && response.status < 300) return;
        // 4xx (bad signature, too large) will not improve by retrying.
        if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
          throw new DirectUploadError("The upload was refused. Please try again.", response.status);
        }
        throw new Error(`part ${range.index} status ${response.status}`);
      } catch (error) {
        if (cancelled()) throw new UploadCancelledError();
        if (error instanceof DirectUploadError || attempt > PART_RETRIES) throw error;
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
    await uploadParts(ranges);

    for (let attempt = 1; ; attempt += 1) {
      try {
        const { data } = await apiClient.post<{ key: string }>(`/api/media/chunked-uploads/${plan.uploadId}/complete`);
        return data.key;
      } catch (error) {
        const response = (error as { response?: { status?: number; data?: { error?: { missingParts?: number[] } } } })?.response;
        const missing = response?.data?.error?.missingParts;
        if (response?.status === 409 && missing?.length && attempt <= 2) {
          await uploadParts(ranges.filter((range) => missing.includes(range.index)));
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    // Free the parts already uploaded. Best effort; the server also expires the session.
    void apiClient.delete(`/api/media/chunked-uploads/${plan.uploadId}`).catch(() => undefined);
    if (cancelled()) throw new UploadCancelledError();
    if (error instanceof DirectUploadError) throw error;
    throw new DirectUploadError("The upload did not finish. Please check your connection and try again.");
  }
}
