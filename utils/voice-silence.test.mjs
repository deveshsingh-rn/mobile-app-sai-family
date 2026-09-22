import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyVoiceActivity,
  hasFinishedSpeaking,
  recordAudioActivity,
  recordTranscriptActivity,
} from "./voice-silence.ts";

test("does not submit before speech starts", () => {
  let activity = emptyVoiceActivity();
  for (let now = 100; now <= 5000; now += 100) {
    activity = recordAudioActivity(activity, 25, now);
  }
  assert.equal(hasFinishedSpeaking(activity, 5000), false);
});

test("keeps listening through a long softly spoken sentence", () => {
  let activity = emptyVoiceActivity();
  for (let now = 100; now <= 6500; now += 100) {
    activity = recordAudioActivity(activity, now % 700 === 0 ? 60 : 190, now);
    assert.equal(hasFinishedSpeaking(activity, now), false);
  }
  for (let now = 6600; now <= 8400; now += 100) {
    activity = recordAudioActivity(activity, 20, now);
    assert.equal(hasFinishedSpeaking(activity, now), false);
  }
  activity = recordAudioActivity(activity, 20, 8500);
  assert.equal(hasFinishedSpeaking(activity, 8500), true);
});

test("an Azure partial transcript extends the listening window", () => {
  let activity = recordAudioActivity(emptyVoiceActivity(), 200, 100);
  activity = recordAudioActivity(activity, 200, 200);
  activity = recordTranscriptActivity(activity, 1800);
  activity = recordAudioActivity(activity, 20, 3000);
  assert.equal(hasFinishedSpeaking(activity, 3000), false);
  activity = recordAudioActivity(activity, 20, 3800);
  assert.equal(hasFinishedSpeaking(activity, 3800), true);
});

test("a natural pause resets when the devotee resumes speaking", () => {
  let activity = recordAudioActivity(emptyVoiceActivity(), 240, 100);
  activity = recordAudioActivity(activity, 240, 200);
  for (let now = 300; now <= 1700; now += 100) {
    activity = recordAudioActivity(activity, 20, now);
  }
  assert.equal(hasFinishedSpeaking(activity, 1700), false);
  activity = recordAudioActivity(activity, 70, 1800);
  activity = recordAudioActivity(activity, 70, 1900);
  activity = recordAudioActivity(activity, 20, 3500);
  assert.equal(hasFinishedSpeaking(activity, 3500), false);
  activity = recordAudioActivity(activity, 20, 3900);
  assert.equal(hasFinishedSpeaking(activity, 3900), true);
});
