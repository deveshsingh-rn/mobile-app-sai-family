import type { AudioPlayer } from "expo-audio";

import { apiClient } from "./api";

/**
 * Sai Baba's voice for Naam Jap.
 *
 * - First use of a Naam: backend returns a cached MP3 URL (generated once globally), we download it
 *   into the app's document directory. After that the clip plays offline with zero network.
 * - One reusable player: each count replays the same clip; if it is still speaking, that count's
 *   audio is skipped so fast counters never stack or stutter.
 */

const LOCAL_CACHE_VERSION = "v1";
const inFlight = new Map<string, Promise<string>>();

function cacheKey(label: string) {
  // FNV-1a 32-bit: stable, tiny, good enough to name ≤30 local files.
  const text = `${LOCAL_CACHE_VERSION}|${label.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-IN")}`;
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function messageFromError(error: unknown) {
  const data = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
  return data?.error?.message || "Baba's voice could not be prepared. Please check your internet and try again.";
}

async function localNaamVoicePath(label: string) {
  const FileSystem = await import("expo-file-system/legacy");
  if (!FileSystem.documentDirectory) throw new Error("Audio storage is unavailable on this device.");
  const directory = `${FileSystem.documentDirectory}naam-voice/`;
  return { FileSystem, directory, uri: `${directory}${cacheKey(label)}.mp3` };
}

/** True when this Naam's Baba-voice clip is already saved on the phone. */
export async function hasNaamVoiceFile(label: string) {
  try {
    const { FileSystem, uri } = await localNaamVoicePath(label);
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists && (info.size ?? 0) > 0;
  } catch {
    return false;
  }
}

/** Remove a Naam's saved clip (called when the Naam is deleted or renamed). */
export async function deleteNaamVoiceFile(label: string) {
  try {
    const { FileSystem, uri } = await localNaamVoicePath(label);
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Best effort: a leftover ~24 KB file is harmless.
  }
}

/** Returns a local file:// URI for this Naam in Baba's voice, downloading it once if needed. */
export async function ensureNaamVoiceFile(label: string): Promise<string> {
  const { FileSystem, directory, uri } = await localNaamVoicePath(label);
  const existing = await FileSystem.getInfoAsync(uri);
  if (existing.exists && (existing.size ?? 0) > 0) return uri;

  const pending = inFlight.get(uri);
  if (pending) return pending;

  const work = (async () => {
    try {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true }).catch(() => undefined);
      const { data } = await apiClient.post<{ url: string }>(
        "/api/ai/naam-voice",
        { naam: label },
        { timeout: 45000 }
      );
      if (!data?.url) throw new Error("empty url");
      const download = await FileSystem.downloadAsync(data.url, uri);
      if (download.status !== 200) {
        await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
        throw new Error(`download ${download.status}`);
      }
      return uri;
    } catch (error) {
      throw new Error(messageFromError(error));
    } finally {
      inFlight.delete(uri);
    }
  })();
  inFlight.set(uri, work);
  return work;
}

export type NaamVoicePlayer = {
  /** Plays the clip; returns false if skipped because the previous clip is still speaking. */
  play: (uri: string) => boolean;
  release: () => void;
};

export async function createNaamVoicePlayer(): Promise<NaamVoicePlayer> {
  const Audio = await import("expo-audio");
  await Audio.setAudioModeAsync({
    allowsRecording: false,
    interruptionMode: "mixWithOthers",
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  }).catch(() => undefined);

  let player: AudioPlayer | null = null;
  let playerUri: string | null = null;

  const release = () => {
    try {
      player?.pause();
      player?.remove();
    } catch {
      // Player may already be released.
    }
    player = null;
    playerUri = null;
  };

  return {
    play(uri: string) {
      if (!player || playerUri !== uri) {
        release();
        const created = Audio.createAudioPlayer(uri, { updateInterval: 250 });
        player = created;
        playerUri = uri;
        if (created.isLoaded) {
          created.play();
        } else {
          // First play of this clip: wait until the file is loaded, then speak.
          const subscription = created.addListener("playbackStatusUpdate", (status) => {
            if (!status.isLoaded) return;
            subscription.remove();
            if (player === created) created.play();
          });
        }
        return true;
      }

      if (player.playing) return false;

      const current = player;
      void current
        .seekTo(0)
        .then(() => {
          if (player === current) current.play();
        })
        .catch(() => undefined);
      return true;
    },
    release,
  };
}
