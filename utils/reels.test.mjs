import assert from "node:assert/strict";
import test from "node:test";

import {
  doubleTapZone,
  formatPlaybackTime,
  isInAppPlayableVideoUrl,
  mergeReelPages,
  seekTimeFromTouch,
  setReelSeed,
  takeReelSeed,
} from "./reels.ts";

test("only bucket / file URLs play in the app; YouTube and placeholders do not", () => {
  assert.equal(isInAppPlayableVideoUrl("https://storage.googleapis.com/saifamily-bucket/leela-feed/video/2026/a.mp4?X-Goog-Signature=x"), true);
  assert.equal(isInAppPlayableVideoUrl("https://sai.blob.core.windows.net/sai-media/leela-feed/video/2026/b.mov"), true);
  assert.equal(isInAppPlayableVideoUrl("https://www.youtube.com/watch?v=abc"), false);
  assert.equal(isInAppPlayableVideoUrl("https://youtu.be/abc"), false);
  assert.equal(isInAppPlayableVideoUrl("https://m.youtube.com/watch?v=abc"), false);
  assert.equal(isInAppPlayableVideoUrl("processing://youtube"), false);
  assert.equal(isInAppPlayableVideoUrl(""), false);
  assert.equal(isInAppPlayableVideoUrl(null), false);
});

test("formats playback time like video players do", () => {
  assert.equal(formatPlaybackTime(0), "0:00");
  assert.equal(formatPlaybackTime(75.9), "1:15");
  assert.equal(formatPlaybackTime(3725), "1:02:05");
  assert.equal(formatPlaybackTime(Number.NaN), "0:00");
  assert.equal(formatPlaybackTime(-4), "0:00");
});

test("double tap: sides seek, middle likes", () => {
  assert.equal(doubleTapZone(20, 400), "back");
  assert.equal(doubleTapZone(200, 400), "like");
  assert.equal(doubleTapZone(390, 400), "forward");
  assert.equal(doubleTapZone(10, 0), "like");
});

test("seek bar maps a touch to a clamped time", () => {
  assert.equal(seekTimeFromTouch(150, 300, 60), 30);
  assert.equal(seekTimeFromTouch(-20, 300, 60), 0);
  assert.equal(seekTimeFromTouch(999, 300, 60), 60);
  assert.equal(seekTimeFromTouch(10, 300, 0), 0);
});

test("pages merge without duplicates and the seed is handed over once", () => {
  assert.deepEqual(mergeReelPages([{ id: "a" }, { id: "b" }], [{ id: "b" }, { id: "c" }]).map((r) => r.id), ["a", "b", "c"]);
  setReelSeed({ id: "x" });
  assert.deepEqual(takeReelSeed(), { id: "x" });
  assert.equal(takeReelSeed(), null);
});
