import assert from "node:assert/strict";
import test from "node:test";

import {
  estimateUploadSeconds,
  formatBytes,
  formatEta,
  formatVideoDuration,
  partRanges,
  retryDelayMs,
  uploadStats,
} from "./chunk-upload.ts";

const MB = 1024 * 1024;

test("splits a file into ordered parts that cover every byte exactly once", () => {
  const ranges = partRanges(12 * MB + 100, 5 * MB);
  assert.deepEqual(ranges.map((r) => r.index), [0, 1, 2]);
  assert.deepEqual(ranges.map((r) => r.start), [0, 5 * MB, 10 * MB]);
  assert.equal(ranges.at(-1).length, 2 * MB + 100);
  assert.equal(ranges.reduce((sum, r) => sum + r.length, 0), 12 * MB + 100);
  assert.equal(partRanges(5 * MB, 5 * MB).length, 1);
  assert.deepEqual(partRanges(0, 5 * MB), []);
});

test("formats size, duration and waiting time for people", () => {
  assert.equal(formatBytes(18.4 * MB), "18.4 MB");
  assert.equal(formatBytes(150 * MB), "150 MB");
  assert.equal(formatBytes(900 * 1024), "900 KB");
  assert.equal(formatVideoDuration(84_000), "1:24");
  assert.equal(formatVideoDuration(null), "0:00");
  assert.equal(formatEta(22), "about 20 sec");
  assert.equal(formatEta(95), "about 2 min");
});

test("estimates upload time from size and uplink speed", () => {
  // 60 MB at 5 Mbit/s: 60 × 1,048,576 × 8 ÷ 5,000,000 ≈ 101 s
  assert.equal(estimateUploadSeconds(60 * MB, 5), 101);
  assert.equal(estimateUploadSeconds(0, 5), 0);
});

test("live stats give fraction, speed and time left", () => {
  const stats = uploadStats(10 * MB, 40 * MB, 8000);
  assert.equal(stats.fraction, 0.25);
  assert.equal(Math.round(stats.megabitsPerSecond * 10) / 10, 10.5);
  assert.equal(stats.remainingSeconds, 24);
  assert.equal(uploadStats(0, 40 * MB, 100).remainingSeconds, null);
});

test("retries back off 1 s, 2 s, 4 s with jitter", () => {
  assert.equal(retryDelayMs(1, () => 0), 1000);
  assert.equal(retryDelayMs(2, () => 0), 2000);
  assert.equal(retryDelayMs(3, () => 1), 5200);
});
