export const VOICE_SILENCE_SUBMIT_MS = 2000;

export type VoiceActivity = {
  detected: boolean;
  lastSoundAt: number;
  peakRms: number;
  voicedFrames: number;
};

export const emptyVoiceActivity = (): VoiceActivity => ({
  detected: false,
  lastSoundAt: 0,
  peakRms: 0,
  voicedFrames: 0,
});

export function recordTranscriptActivity(activity: VoiceActivity, now: number): VoiceActivity {
  return { ...activity, detected: true, lastSoundAt: now };
}

export function recordAudioActivity(activity: VoiceActivity, rms: number, now: number): VoiceActivity {
  const peakRms = Math.max(activity.peakRms * 0.995, rms);
  const quietThreshold = Math.max(45, Math.min(80, peakRms * 0.08));
  const soundDetected = rms >= (activity.detected ? quietThreshold : 150);
  const voicedFrames = soundDetected ? activity.voicedFrames + 1 : 0;
  const detected = activity.detected || voicedFrames >= 2;

  return {
    detected,
    lastSoundAt: detected && soundDetected ? now : activity.lastSoundAt,
    peakRms,
    voicedFrames,
  };
}

export function hasFinishedSpeaking(activity: VoiceActivity, now: number): boolean {
  return activity.detected && activity.lastSoundAt > 0 &&
    now - activity.lastSoundAt >= VOICE_SILENCE_SUBMIT_MS;
}
