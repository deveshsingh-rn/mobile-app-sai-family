import assert from "node:assert/strict";
import test from "node:test";
import { createVoiceCaptureStop } from "./voice-capture-stop.ts";

test("submit, transcript and socket cleanup stop a capture only once", async () => {
  let calls = 0;
  let finish;
  const stop = createVoiceCaptureStop(() => {
    calls++;
    return new Promise((resolve) => { finish = resolve; });
  });
  const submitted = stop();
  assert.equal(stop(), submitted);
  await Promise.resolve();
  assert.equal(calls, 1);
  let playbackReady = false;
  const playback = stop().then(() => { playbackReady = true; });
  assert.equal(playbackReady, false);
  finish();
  await playback;
  await stop();
  assert.equal(playbackReady, true);
  assert.equal(calls, 1);
});

test("a new capture gets its own stop operation", async () => {
  let calls = 0;
  const nativeStop = async () => { calls++; };
  await createVoiceCaptureStop(nativeStop)();
  await createVoiceCaptureStop(nativeStop)();
  assert.equal(calls, 2);
});
