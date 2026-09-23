import assert from "node:assert/strict";
import test from "node:test";
import { voiceLatencySnapshot } from "./voice-latency.ts";

test("separates silence, submission, backend delivery and playback delays", () => {
  const metrics = voiceLatencySnapshot({
    tapAt: 0, micReadyAt: 1000, lastSpeechAt: 10000,
    submitRequestedAt: 12000, inputEndedAt: 12100,
    finalTranscriptAt: 12600, firstAnswerAt: 14100,
    firstAudioChunkAt: 15100, turnCompletedAt: 16100, firstPlaybackAt: 16500,
  });
  assert.equal(metrics.detectedSilenceMs, 2000);
  assert.equal(metrics.micStopAndSubmitMs, 100);
  assert.equal(metrics.submitToTextMs, 2000);
  assert.equal(metrics.audioDownloadMs, 1000);
  assert.equal(metrics.replyCompleteToPlaybackMs, 400);
  assert.equal(metrics.submitToPlaybackMs, 4400);
  assert.equal(metrics.detectedSpeechEndToPlaybackMs, 6500);
});

test("unknown or out-of-order timings are null, not misleading zeroes", () => {
  assert.equal(voiceLatencySnapshot({}).submitToPlaybackMs, null);
  assert.equal(voiceLatencySnapshot({ firstPlaybackAt: 10, turnCompletedAt: 20 }).replyCompleteToPlaybackMs, null);
});
