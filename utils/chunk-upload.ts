/**
 * Pure helpers for chunked video upload (no React Native imports; tested with node).
 */

export const UPLOAD_CONCURRENCY = 3;
/** A part is retried this many times (1 s, 2 s, 4 s, 8 s, 16 s) before the upload is marked failed. */
export const PART_RETRIES = 5;

export type PartRange = { index: number; start: number; length: number };

/** Byte ranges of each part, in order. The last part is the remainder. */
export function partRanges(sizeBytes: number, partBytes: number): PartRange[] {
  if (!(sizeBytes > 0) || !(partBytes > 0)) return [];
  const count = Math.ceil(sizeBytes / partBytes);
  return Array.from({ length: count }, (_, index) => {
    const start = index * partBytes;
    return { index, length: Math.min(partBytes, sizeBytes - start), start };
  });
}

/** 18_400_000 → "17.5 MB"; 900_000 → "879 KB". */
export function formatBytes(bytes: number) {
  if (!(bytes > 0)) return "0 KB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** 84_000 ms → "1:24". */
export function formatVideoDuration(milliseconds?: number | null) {
  const total = milliseconds && milliseconds > 0 ? Math.round(milliseconds / 1000) : 0;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Rough upload time for a file at a given uplink speed (megabits per second). */
export function estimateUploadSeconds(bytes: number, megabitsPerSecond: number) {
  if (!(bytes > 0) || !(megabitsPerSecond > 0)) return 0;
  return Math.ceil((bytes * 8) / (megabitsPerSecond * 1_000_000));
}

/** 95 → "about 2 min"; 20 → "about 20 sec". */
export function formatEta(seconds: number) {
  if (!(seconds > 0)) return "a moment";
  if (seconds < 60) return `about ${Math.max(5, Math.round(seconds / 5) * 5)} sec`;
  return `about ${Math.round(seconds / 60)} min`;
}

/** Live numbers for the progress screen from bytes sent so far and elapsed time. */
export function uploadStats(sentBytes: number, totalBytes: number, elapsedMs: number) {
  const fraction = totalBytes > 0 ? Math.min(1, sentBytes / totalBytes) : 0;
  const bytesPerSecond = elapsedMs > 500 ? (sentBytes / elapsedMs) * 1000 : 0;
  const remainingSeconds = bytesPerSecond > 0 ? Math.ceil((totalBytes - sentBytes) / bytesPerSecond) : null;
  return { bytesPerSecond, fraction, megabitsPerSecond: (bytesPerSecond * 8) / 1_000_000, remainingSeconds };
}

/** Wait before retry n (1-based): 1 s, 2 s, 4 s … plus up to 30% jitter. */
export function retryDelayMs(attempt: number, random: () => number = Math.random) {
  const base = 1000 * 2 ** Math.max(0, attempt - 1);
  return Math.round(base * (1 + random() * 0.3));
}
