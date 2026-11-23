/**
 * Pure helpers for the in-app video player / Reels screen. No React Native imports, so they
 * can be unit-tested with node (utils/reels.test.mjs).
 */

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export const SEEK_STEP_SECONDS = 10;
export const HOLD_TO_FAST_RATE = 2;

/** True when the in-app player can play this URL (a file in our storage, not a YouTube page). */
export function isInAppPlayableVideoUrl(url?: string | null) {
  if (!url) return false;
  const value = url.trim().toLowerCase();
  if (!value.startsWith("https://") && !value.startsWith("http://")) return false;
  return !/(^|\/\/|\.)(youtube\.com|youtu\.be)(\/|:|$)/.test(value);
}

/** 75 → "1:15", 3725 → "1:02:05", NaN / negative → "0:00". */
export function formatPlaybackTime(totalSeconds: number) {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = String(safe % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}` : `${minutes}:${seconds}`;
}

/**
 * Where a double tap landed: left 30% = back 10 s, right 30% = forward 10 s, middle = like.
 * (YouTube-style seeking on the sides, Instagram-style like in the middle.)
 */
export function doubleTapZone(x: number, width: number): "back" | "like" | "forward" {
  if (!(width > 0)) return "like";
  const ratio = x / width;
  if (ratio < 0.3) return "back";
  if (ratio > 0.7) return "forward";
  return "like";
}

/** Seek target from a touch on the progress bar, clamped to the video. */
export function seekTimeFromTouch(x: number, barWidth: number, duration: number) {
  if (!(barWidth > 0) || !(duration > 0)) return 0;
  const ratio = Math.min(1, Math.max(0, x / barWidth));
  return ratio * duration;
}

/** Appends a new page, skipping ids already shown (pages can overlap after a refresh). */
export function mergeReelPages<T extends { id: string }>(existing: T[], incoming: T[]) {
  const seen = new Set(existing.map((item) => item.id));
  return [...existing, ...incoming.filter((item) => !seen.has(item.id))];
}

/**
 * The reel the user tapped in the feed, handed to the Reels screen so it can show it
 * immediately (no loading spinner) and then load the following reels after it.
 */
let pendingSeed: unknown = null;

export function setReelSeed(item: unknown) {
  pendingSeed = item;
}

/** Returns the seed once, then clears it. */
export function takeReelSeed<T>() {
  const seed = pendingSeed as T | null;
  pendingSeed = null;
  return seed;
}
