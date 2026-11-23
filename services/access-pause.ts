import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * "Access paused" state: set when the backend's bot guard answers AUTOMATION_DETECTED, or when the
 * app's own automation trap is activated. Kept in AsyncStorage so closing and reopening the app
 * does not clear it. The server holds the real lock; this is what the person (or bot) sees.
 */

const STORAGE_KEY = "@sai-family/access-paused-until/v1";
const DEFAULT_PAUSE_SECONDS = 15 * 60;
const MAX_PAUSE_SECONDS = 24 * 60 * 60;

type Listener = (pausedUntil: number) => void;

let pausedUntil = 0;
const listeners = new Set<Listener>();

function publish() {
  listeners.forEach((listener) => listener(pausedUntil));
}

export function getAccessPausedUntil() {
  return pausedUntil;
}

export function subscribeAccessPause(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Reads a pause saved by an earlier app session. */
export async function loadAccessPause() {
  try {
    const stored = Number(await AsyncStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored) && stored > Date.now()) {
      pausedUntil = stored;
      publish();
    }
  } catch {
    // Storage unavailable: start unpaused.
  }
  return pausedUntil;
}

export function pauseAccess(seconds?: number) {
  const safeSeconds = Math.min(
    MAX_PAUSE_SECONDS,
    Math.max(60, Number.isFinite(seconds) && seconds ? Number(seconds) : DEFAULT_PAUSE_SECONDS)
  );
  const until = Date.now() + safeSeconds * 1000;
  if (until <= pausedUntil) return;

  pausedUntil = until;
  publish();
  void AsyncStorage.setItem(STORAGE_KEY, String(until)).catch(() => undefined);
}

export function clearAccessPauseIfExpired() {
  if (pausedUntil && pausedUntil <= Date.now()) {
    pausedUntil = 0;
    publish();
    void AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }
}
