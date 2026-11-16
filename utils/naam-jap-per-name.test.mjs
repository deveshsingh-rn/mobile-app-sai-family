import assert from "node:assert/strict";
import test from "node:test";

import {
  EARLIER_JAAP_ID,
  getNaamBreakdown,
  recordNaamCount,
  rollPerNameToNewDay,
  sanitizePerName,
  undoNaamCount,
} from "./naam-jap-per-name.ts";

const saiRam = { id: "sai-ram", label: "Sai Ram" };
const omSai = { id: "om-sai", label: "Om Sai" };

test("counts each Naam separately and undo removes from the Naam actually counted", () => {
  let state = { perName: {}, undoStack: [] };
  state = recordNaamCount(state.perName, state.undoStack, saiRam);
  state = recordNaamCount(state.perName, state.undoStack, saiRam);
  state = recordNaamCount(state.perName, state.undoStack, omSai);

  assert.equal(state.perName["sai-ram"].total, 2);
  assert.equal(state.perName["om-sai"].today, 1);

  // Devotee switched Naam after counting; undo must still remove the Om Sai count.
  state = undoNaamCount(state.perName, state.undoStack);
  assert.equal(state.perName["om-sai"].total, 0);
  assert.equal(state.perName["sai-ram"].total, 2);
  assert.deepEqual(state.undoStack, ["sai-ram", "sai-ram"]);
});

test("breakdown sorts by count, keeps removed Naams, and shows pre-update counts as Earlier Jaap", () => {
  const perName = {
    "sai-ram": { label: "Sai Ram", today: 3, total: 300, history: [] },
    "om-sai": { label: "Om Sai", today: 5, total: 50, history: [] },
    deleted: { label: "Old Naam", today: 0, total: 20, history: [] },
  };
  const input = { perName, jaapNames: [saiRam, omSai], todayCount: 8, totalCount: 1000 };

  const lifetime = getNaamBreakdown(input, "lifetime", 108);
  assert.deepEqual(lifetime.map((row) => row.id), ["sai-ram", "om-sai", "deleted", EARLIER_JAAP_ID]);
  assert.equal(lifetime.find((row) => row.id === "deleted").removed, true);
  assert.equal(lifetime.at(-1).count, 1000 - 370);
  assert.equal(lifetime.reduce((sum, row) => sum + row.count, 0), 1000);
  assert.equal(lifetime[0].malas, 2);

  const today = getNaamBreakdown(input, "today", 108);
  assert.deepEqual(today.map((row) => row.id), ["om-sai", "sai-ram"]);
});

test("new day moves each Naam's today count into its history", () => {
  const rolled = rollPerNameToNewDay(
    { "sai-ram": { label: "Sai Ram", today: 7, total: 70, history: [] } },
    "2026-11-15"
  );
  assert.equal(rolled["sai-ram"].today, 0);
  assert.equal(rolled["sai-ram"].total, 70);
  assert.deepEqual(rolled["sai-ram"].history, [{ count: 7, date: "2026-11-15" }]);
});

test("old saves without per-Naam data load safely", () => {
  assert.deepEqual(sanitizePerName(undefined), {});
  assert.deepEqual(sanitizePerName({ x: { label: 5 } }), {});
  assert.equal(sanitizePerName({ x: { label: "Sai", today: 4, total: 1 } }).x.total, 4);
});
