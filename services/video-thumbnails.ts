import { createVideoPlayer, type VideoThumbnail } from "expo-video";

/**
 * First-frame thumbnails for videos stored in our bucket (YouTube videos already have one).
 *
 * Generated on the phone with expo-video: a hidden player loads just the start of the file,
 * grabs one frame and is released. Videos are handled one at a time (no bursts while scrolling)
 * and results are cached for the app session, so each video is processed once.
 */

export type VideoPoster = { thumbnail: VideoThumbnail; width: number; height: number };

const cache = new Map<string, VideoPoster | null>();
const pending = new Map<string, Promise<VideoPoster | null>>();
let queue: Promise<unknown> = Promise.resolve();

const LOAD_TIMEOUT_MS = 15_000;
const MAX_CACHE = 60;

/** Bucket URLs carry a daily signature; cache by the object path so a new signature reuses it. */
function cacheKey(url: string) {
  return url.split("?")[0];
}

export function getCachedVideoPoster(url: string) {
  return cache.get(cacheKey(url));
}

async function generate(url: string): Promise<VideoPoster | null> {
  const player = createVideoPlayer(url);
  player.muted = true;
  try {
    if (player.status !== "readyToPlay") {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          subscription.remove();
          reject(new Error("timeout"));
        }, LOAD_TIMEOUT_MS);
        const subscription = player.addListener("statusChange", ({ status }) => {
          if (status === "readyToPlay" || status === "error") {
            clearTimeout(timer);
            subscription.remove();
            if (status === "readyToPlay") resolve();
            else reject(new Error("load error"));
          }
        });
      });
    }
    const [thumbnail] = await player.generateThumbnailsAsync([0.5], { maxWidth: 720 });
    return thumbnail ? { thumbnail, width: thumbnail.width, height: thumbnail.height } : null;
  } catch {
    return null;
  } finally {
    player.release();
  }
}

export function loadVideoPoster(url: string): Promise<VideoPoster | null> {
  const key = cacheKey(url);
  if (cache.has(key)) return Promise.resolve(cache.get(key) ?? null);
  const running = pending.get(key);
  if (running) return running;

  const job = queue.then(() => generate(url)).then((poster) => {
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
    cache.set(key, poster);
    pending.delete(key);
    return poster;
  });
  queue = job.catch(() => undefined);
  pending.set(key, job);
  return job;
}
