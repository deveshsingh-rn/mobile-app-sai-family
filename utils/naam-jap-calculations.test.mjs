import assert from "node:assert/strict";
import test from "node:test";

import {
  getMinimumMalaGoal,
  getNaamJapMetrics,
  incrementNaamJapData,
  NAAM_PER_MALA,
  undoNaamJapData,
} from "./naam-jap-calculations.ts";

const state = (overrides = {}) => ({
  sessionCount: 0,
  targetMalas: 1,
  todayCount: 0,
  totalCount: 0,
  ...overrides,
});

test("uses 108 Naam consistently for every Mala boundary", () => {
  const before = state({ sessionCount: 107, todayCount: 107, totalCount: 107 });
  const completed = incrementNaamJapData(before);

  assert.equal(NAAM_PER_MALA, 108);
  assert.deepEqual(getNaamJapMetrics(completed), {
    completedLifetimeMalas: 1,
    completedTodayMalas: 1,
    currentMalaCount: 108,
    goalReached: true,
    sessionGoalCount: 108,
    sessionProgress: 1,
  });
  assert.equal(incrementNaamJapData(completed), completed);
});

test("starts the next current-Mala count at one for multi-Mala goals", () => {
  const metrics = getNaamJapMetrics(
    state({ sessionCount: 109, targetMalas: 2, todayCount: 109, totalCount: 325 })
  );

  assert.equal(metrics.currentMalaCount, 1);
  assert.equal(metrics.completedTodayMalas, 1);
  assert.equal(metrics.completedLifetimeMalas, 3);
  assert.equal(metrics.sessionGoalCount, 216);
  assert.equal(metrics.goalReached, false);
});

test("undo keeps session, today and lifetime counts aligned", () => {
  assert.deepEqual(
    undoNaamJapData(
      state({ sessionCount: 12, targetMalas: 2, todayCount: 20, totalCount: 220 })
    ),
    state({ sessionCount: 11, targetMalas: 2, todayCount: 19, totalCount: 219 })
  );
});

test("a Mala goal cannot be reduced below completed session progress", () => {
  assert.equal(getMinimumMalaGoal(0), 1);
  assert.equal(getMinimumMalaGoal(108), 1);
  assert.equal(getMinimumMalaGoal(109), 2);
  assert.equal(getMinimumMalaGoal(216), 2);
});
