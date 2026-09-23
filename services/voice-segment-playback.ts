import type { AudioPlayer, AudioStatus } from "expo-audio";
import type { VoiceAudioSegment } from "@/utils/voice-segment-queue";

function checkCancelled(signal: AbortSignal) {
  if (signal.aborted) throw new Error("Voice playback cancelled");
}

function waitForStatus(
  player: AudioPlayer,
  signal: AbortSignal,
  timeoutMs: number,
  done: (status: AudioStatus) => boolean,
  start?: () => void
) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(new Error("Voice playback cancelled")); return; }
    let settled = false;
    let subscription: { remove: () => void } | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      subscription?.remove();
      if (timer) clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve();
    };
    const abort = () => finish(new Error("Voice playback cancelled"));
    signal.addEventListener("abort", abort, { once: true });
    subscription = player.addListener("playbackStatusUpdate", (status) => {
      if (status.playbackState === "error") finish(new Error("Voice audio could not be played"));
      else if (done(status)) finish();
    });
    timer = setTimeout(() => finish(new Error("Voice audio playback timed out")), timeoutMs);
    try { start?.(); } catch (error) { finish(error instanceof Error ? error : new Error(String(error))); }
  });
}

// Each segment is a complete MP3 file, never a fragment of an MP3 stream.
export async function playVoiceSegment(segment: VoiceAudioSegment, signal: AbortSignal, onStarted: () => void) {
  const [Audio, FileSystem] = await Promise.all([import("expo-audio"), import("expo-file-system/legacy")]);
  checkCancelled(signal);
  if (!FileSystem.cacheDirectory) throw new Error("Audio cache is unavailable");
  const turnId = segment.turnId.replace(/[^a-zA-Z0-9_-]/g, "");
  const uri = `${FileSystem.cacheDirectory}sai-sentence-${turnId}-${segment.index}.mp3`;
  let player: AudioPlayer | undefined;
  try {
    await FileSystem.writeAsStringAsync(uri, segment.data, { encoding: FileSystem.EncodingType.Base64 });
    checkCancelled(signal);
    await Audio.setAudioModeAsync({
      allowsRecording: false, interruptionMode: "doNotMix", playsInSilentMode: true,
      shouldPlayInBackground: false, shouldRouteThroughEarpiece: false,
    });
    checkCancelled(signal);
    player = Audio.createAudioPlayer(uri, { updateInterval: 100, keepAudioSessionActive: false });
    if (!player.isLoaded) await waitForStatus(player, signal, 8000, (status) => status.isLoaded);
    checkCancelled(signal);
    let started = false;
    await waitForStatus(player, signal, 60_000, (status) => {
      if (status.playing && !started) { started = true; onStarted(); }
      return status.didJustFinish;
    }, () => player?.play());
  } finally {
    try { player?.pause(); player?.remove(); } catch { /* Player may already be released. */ }
    await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
  }
}
