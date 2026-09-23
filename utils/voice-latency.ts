export type VoiceTiming = {
  connectedAt?: number;
  firstAnswerAt?: number;
  firstAudioChunkAt?: number;
  firstPlaybackAt?: number;
  inputEndedAt?: number;
  firstMicChunkAt?: number;
  firstTranscriptAt?: number;
  sessionCreatedAt?: number;
  socketOpenedAt?: number;
  startedAt?: number;
  tapAt?: number;
  micReadyAt?: number;
  lastSpeechAt?: number;
  submitRequestedAt?: number;
  finalTranscriptAt?: number;
  turnCompletedAt?: number;
};

export function voiceLatencySnapshot(timing: VoiceTiming) {
  const elapsed = (end?: number, start?: number) =>
    end !== undefined && start !== undefined && end >= start ? end - start : null;
  return {
    micReadyMs: elapsed(timing.micReadyAt, timing.tapAt),
    detectedSilenceMs: elapsed(timing.submitRequestedAt, timing.lastSpeechAt),
    micStopAndSubmitMs: elapsed(timing.inputEndedAt, timing.submitRequestedAt),
    submitToTranscriptMs: elapsed(timing.finalTranscriptAt, timing.inputEndedAt),
    submitToTextMs: elapsed(timing.firstAnswerAt, timing.inputEndedAt),
    submitToFirstAudioMs: elapsed(timing.firstAudioChunkAt, timing.inputEndedAt),
    audioDownloadMs: elapsed(timing.turnCompletedAt, timing.firstAudioChunkAt),
    replyCompleteToPlaybackMs: elapsed(timing.firstPlaybackAt, timing.turnCompletedAt),
    submitToPlaybackMs: elapsed(timing.firstPlaybackAt, timing.inputEndedAt),
    detectedSpeechEndToPlaybackMs: elapsed(timing.firstPlaybackAt, timing.lastSpeechAt),
  };
}
