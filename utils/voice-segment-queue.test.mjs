import assert from "node:assert/strict";
import test from "node:test";
import { VoiceSegmentQueue } from "./voice-segment-queue.ts";

const tick = () => new Promise((resolve) => setImmediate(resolve));
const segment = (index, turnId = "turn-1") => ({ turnId, index, data: "audio" });

test("starts before turn_complete, plays in order, and completes only after playback drains", async () => {
  const played = [];
  const release = [];
  let complete = 0;
  const queue = new VoiceSegmentQueue("turn-1", {
    play: async (item, signal, onStarted) => {
      played.push(item.index); onStarted();
      await new Promise((resolve) => release.push(resolve));
    },
    onStarted() {}, onWaiting() {}, onComplete: () => complete++, onError: assert.fail,
  });
  queue.enqueue(segment(0));
  queue.enqueue(segment(1));
  queue.enqueue(segment(1));
  await tick();
  assert.deepEqual(played, [0]);
  queue.finish(2);
  assert.equal(complete, 0);
  release.shift()(); await tick();
  assert.deepEqual(played, [0, 1]);
  release.shift()(); await tick();
  assert.equal(complete, 1);
});

test("stop aborts active playback and prevents queued or late audio from starting", async () => {
  let played = 0;
  let activeSignal;
  const queue = new VoiceSegmentQueue("turn-1", {
    play: async (_, signal) => {
      played++; activeSignal = signal;
      await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
    },
    onStarted() {}, onWaiting: assert.fail, onComplete: assert.fail, onError: assert.fail,
  });
  queue.enqueue(segment(0)); queue.enqueue(segment(1));
  await tick(); queue.stop(); queue.enqueue(segment(2)); queue.finish(3);
  await tick();
  assert.equal(activeSignal.aborted, true);
  assert.equal(played, 1);
});

test("rejects missing or out-of-order segments and ignores other turns", async () => {
  const errors = [];
  const queue = new VoiceSegmentQueue("turn-1", {
    play: async () => assert.fail("must not play"),
    onStarted() {}, onWaiting() {}, onComplete: assert.fail, onError: (error) => errors.push(error),
  });
  queue.enqueue(segment(0, "old-turn")); queue.enqueue(segment(2));
  await tick();
  assert.equal(errors.length, 1);
});

test("a playback error stops remaining segments without reporting successful completion", async () => {
  let plays = 0;
  const errors = [];
  const queue = new VoiceSegmentQueue("turn-1", {
    play: async () => { plays++; throw new Error("decode failed"); },
    onStarted() {}, onWaiting() {}, onComplete: assert.fail, onError: (error) => errors.push(error),
  });
  queue.enqueue(segment(0)); queue.enqueue(segment(1)); queue.finish(2);
  await tick();
  assert.equal(plays, 1); assert.equal(errors.length, 1);
});
