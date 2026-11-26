import assert from "node:assert/strict";
import test from "node:test";

import { accountActionForErrorCode, loginPromptCopy } from "./login-prompt.ts";

test("every action has a title and a message; unknown falls back", () => {
  for (const action of ["like", "comment", "repost", "bookmark", "post", "rsvp", "ai_limit", "default"]) {
    const copy = loginPromptCopy(action);
    assert.ok(copy.title.length > 0 && copy.message.length > 0, action);
  }
  assert.deepEqual(loginPromptCopy(undefined), loginPromptCopy("default"));
  assert.deepEqual(loginPromptCopy("nope"), loginPromptCopy("default"));
});

test("maps backend guest codes to the login sheet, and nothing else", () => {
  assert.equal(accountActionForErrorCode(403, "ACCOUNT_REQUIRED"), "default");
  assert.equal(accountActionForErrorCode(429, "GUEST_AI_LIMIT"), "ai_limit");
  assert.equal(accountActionForErrorCode(429, "GUEST_AI_BUDGET"), "ai_limit");
  assert.equal(accountActionForErrorCode(503, "GUEST_AI_UNAVAILABLE"), "ai_limit");
  assert.equal(accountActionForErrorCode(403, "AUTOMATION_DETECTED"), null);
  assert.equal(accountActionForErrorCode(401, "UNAUTHENTICATED"), null);
  assert.equal(accountActionForErrorCode(403, "FORBIDDEN"), null);
});
