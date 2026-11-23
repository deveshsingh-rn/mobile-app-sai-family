import assert from "node:assert/strict";
import test from "node:test";

import { cardAspectRatio, DEFAULT_CARD_ASPECT, MAX_CARD_ASPECT, MIN_CARD_ASPECT } from "./media-layout.ts";

test("cards follow the media shape within Instagram-like limits", () => {
  assert.equal(cardAspectRatio(1080, 1080), 1);
  assert.equal(cardAspectRatio(1600, 1200), 4 / 3);
  // Phone portrait 9:16 → tallest allowed card (4:5); the rest is shown, not cut (contain + blur).
  assert.equal(cardAspectRatio(1080, 1920), MIN_CARD_ASPECT);
  // Panorama → widest allowed card.
  assert.equal(cardAspectRatio(4000, 1000), MAX_CARD_ASPECT);
});

test("unknown size gives a neutral default", () => {
  assert.equal(cardAspectRatio(0, 0), DEFAULT_CARD_ASPECT);
  assert.equal(cardAspectRatio(undefined, 500), DEFAULT_CARD_ASPECT);
});
