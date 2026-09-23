export const VOICE_SILENCE_SUBMIT_MS = 2000;

export type VoiceActivity = {
  detected: boolean;
  lastSoundAt: number;
  peakRms: number;
  voicedFrames: number;
  recentRms: number[];
};

export const emptyVoiceActivity = (): VoiceActivity => ({
  detected: false,
  lastSoundAt: 0,
  peakRms: 0,
  voicedFrames: 0,
  recentRms: [],
});

export function recordTranscriptActivity(activity: VoiceActivity, now: number): VoiceActivity {
  return { ...activity, detected: true, lastSoundAt: now };
}

export function recordAudioActivity(activity: VoiceActivity, rms: number, now: number): VoiceActivity {
  if (!Number.isFinite(rms) || rms < 0) return activity;
  const peakRms = Math.max(activity.peakRms * 0.995, rms);
  const recentRms = [...activity.recentRms.slice(-19), rms];
  const sorted = [...recentRms].sort((a, b) => a - b);
  // Estimate room noise without treating an uninterrupted sentence as silence.
  const noiseFloor = Math.min(sorted[Math.floor(sorted.length * 0.1)], peakRms * 0.2);
  const quietThreshold = Math.max(45, noiseFloor * 1.8, peakRms * 0.12);
  const soundDetected = rms >= (activity.detected ? quietThreshold : 150);
  const voicedFrames = soundDetected ? activity.voicedFrames + 1 : 0;
  const detected = activity.detected || voicedFrames >= 2;

  return {
    detected,
    lastSoundAt: detected && soundDetected ? now : activity.lastSoundAt,
    peakRms,
    voicedFrames,
    recentRms,
  };
}

export function hasFinishedSpeaking(activity: VoiceActivity, now: number): boolean {
  return activity.detected && activity.lastSoundAt > 0 &&
    now - activity.lastSoundAt >= VOICE_SILENCE_SUBMIT_MS;
}
