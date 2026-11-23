/** Pure helpers for the resumable video upload (no React Native imports, so they run in node tests). */

/** `Content-Range` for one chunk: bytes <first>-<last>/<total>. */
export function chunkContentRange(offset: number, length: number, totalBytes: number) {
  return `bytes ${offset}-${offset + length - 1}/${totalBytes}`;
}

/** `Content-Range` that asks the session "how many bytes do you have?" without sending any. */
export function statusContentRange(totalBytes: number) {
  return `bytes */${totalBytes}`;
}

/**
 * The next byte the storage service expects, from its `Range: bytes=0-<last>` answer.
 * No Range header means it has stored nothing yet.
 */
export function nextOffsetFromRange(range: string | null | undefined) {
  const last = /^bytes=0-(\d+)$/.exec(range?.trim() ?? "")?.[1];
  return last === undefined ? 0 : Number(last) + 1;
}

export type ResumableStep =
  | { kind: "done" }
  /** Stored up to `offset`; send the next chunk from there. */
  | { kind: "continue"; offset: number }
  /** The session no longer exists: a new upload has to be started. */
  | { kind: "expired" }
  /** Temporary trouble on the storage side: wait, ask for the status, go on. */
  | { kind: "retry" }
  /** The request itself was refused; repeating it will not help. */
  | { kind: "refused" };

/** What to do after the storage service answers a chunk (or a status question). */
export function resumableStep(status: number, range: string | null | undefined, totalBytes: number): ResumableStep {
  if (status === 200 || status === 201) return { kind: "done" };
  if (status === 308) {
    // Never trust an offset beyond the file: clamp so a bad header cannot make us read past the end.
    return { kind: "continue", offset: Math.min(nextOffsetFromRange(range), totalBytes) };
  }
  if (status === 404 || status === 410) return { kind: "expired" };
  if (status === 408 || status === 429 || status >= 500) return { kind: "retry" };
  return { kind: "refused" };
}

/** Bytes to send from `offset`: a full chunk, or whatever is left at the end of the file. */
export function chunkLength(offset: number, chunkBytes: number, totalBytes: number) {
  return Math.max(0, Math.min(chunkBytes, totalBytes - offset));
}
