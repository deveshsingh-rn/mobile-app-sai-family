import assert from "node:assert/strict";
import test from "node:test";

import { getNaamJapSwipeDirection } from "./naam-jap-gesture.ts";

test("accepts a short right swipe", () => {
  assert.equal(
    getNaamJapSwipeDirection({ dx: 15, dy: 2, vx: 0.1, vy: 0 }),
    "right"
  );
});

test("accepts a short upward swipe", () => {
  assert.equal(
    getNaamJapSwipeDirection({ dx: 1, dy: -15, vx: 0, vy: -0.1 }),
    "up"
  );
});

test("accepts quick small gestures but rejects taps, left and down gestures", () => {
  assert.equal(
    getNaamJapSwipeDirection({ dx: 8, dy: 1, vx: 0.4, vy: 0 }),
    "right"
  );
  assert.equal(
    getNaamJapSwipeDirection({ dx: 1, dy: -8, vx: 0, vy: -0.4 }),
    "up"
  );
  assert.equal(
    getNaamJapSwipeDirection({ dx: 3, dy: -3, vx: 0, vy: 0 }),
    null
  );
  assert.equal(
    getNaamJapSwipeDirection({ dx: -20, dy: 0, vx: -1, vy: 0 }),
    null
  );
  assert.equal(
    getNaamJapSwipeDirection({ dx: 0, dy: 20, vx: 0, vy: 1 }),
    null
  );
});
