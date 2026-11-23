import assert from "node:assert/strict";
import test from "node:test";

import { chunkContentRange, chunkLength, nextOffsetFromRange, resumableStep, statusContentRange } from "./resumable-upload.ts";

const MiB = 1024 * 1024;

test("builds the Content-Range of a chunk and of a status question", () => {
  assert.equal(chunkContentRange(0, 4 * MiB, 10 * MiB), "bytes 0-4194303/10485760");
  assert.equal(chunkContentRange(8 * MiB, 2 * MiB, 10 * MiB), "bytes 8388608-10485759/10485760");
  assert.equal(statusContentRange(10 * MiB), "bytes */10485760");
});

test("reads the next expected byte from the Range answer", () => {
  assert.equal(nextOffsetFromRange("bytes=0-4194303"), 4 * MiB);
  assert.equal(nextOffsetFromRange(null), 0);
  assert.equal(nextOffsetFromRange(""), 0);
  assert.equal(nextOffsetFromRange("garbage"), 0);
});

test("a 308 continues from what was stored, even when less than what was sent", () => {
  assert.deepEqual(resumableStep(308, "bytes=0-4194303", 10 * MiB), { kind: "continue", offset: 4 * MiB });
  assert.deepEqual(resumableStep(308, "bytes=0-1048575", 10 * MiB), { kind: "continue", offset: MiB });
  assert.deepEqual(resumableStep(308, null, 10 * MiB), { kind: "continue", offset: 0 });
  assert.deepEqual(resumableStep(308, "bytes=0-99999999", 10 * MiB), { kind: "continue", offset: 10 * MiB });
});

test("classifies the other answers", () => {
  assert.deepEqual(resumableStep(200, null, MiB), { kind: "done" });
  assert.deepEqual(resumableStep(201, null, MiB), { kind: "done" });
  assert.deepEqual(resumableStep(404, null, MiB), { kind: "expired" });
  assert.deepEqual(resumableStep(410, null, MiB), { kind: "expired" });
  for (const status of [408, 429, 500, 502, 503, 504]) assert.deepEqual(resumableStep(status, null, MiB), { kind: "retry" });
  for (const status of [400, 403, 412]) assert.deepEqual(resumableStep(status, null, MiB), { kind: "refused" });
});

test("walking a file chunk by chunk covers every byte exactly once", () => {
  const total = 10 * MiB + 123;
  let offset = 0;
  const lengths = [];
  while (offset < total) {
    const length = chunkLength(offset, 4 * MiB, total);
    lengths.push(length);
    offset += length;
  }
  assert.deepEqual(lengths, [4 * MiB, 4 * MiB, 2 * MiB + 123]);
  assert.equal(chunkLength(total, 4 * MiB, total), 0);
});
