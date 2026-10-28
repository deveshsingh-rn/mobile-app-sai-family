import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function loadReducerModule(name) {
  const source = readFileSync(new URL(`../store/experiences/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(() => loadReducerModule("types"), module, module.exports);
  return module.exports;
}
const { experiencesReducer } = loadReducerModule("reducer");
const post = (id, authorId, repostedBy) => ({ id, authorId, repostedBy });

test("a successful block removes original posts and reposts from every cached feed immediately", () => {
  const blocked = post("blocked-post", "blocked");
  const safe = post("safe-post", "safe");
  const repost = post("repost", "safe", { id: "blocked" });
  const initial = experiencesReducer(undefined, { type: "init" });
  const state = { ...initial, feed: [blocked, safe, repost], searchResults: [blocked, safe], bookmarkedFeed: [blocked, safe], detail: blocked, comments: [{ id: "comment" }] };
  const next = experiencesReducer(state, { type: "sangha/BLOCK_DEVOTEE_SUCCESS", payload: { id: "blocked" } });
  for (const field of ["feed", "searchResults", "bookmarkedFeed"]) assert.deepEqual(next[field], [safe]);
  assert.equal(next.detail, null);
  assert.deepEqual(next.comments, []);
});

test("a delayed feed response cannot restore blocked content, and logout resets account-specific filtering", () => {
  let state = experiencesReducer(undefined, { type: "sangha/BLOCK_DEVOTEE_SUCCESS", payload: { id: "blocked" } });
  const incoming = { type: "FETCH_EXPERIENCES_SUCCESS", payload: { results: [post("b", "blocked"), post("s", "safe")], pagination: { offset: 0, limit: 20, hasMore: false } } };
  state = experiencesReducer(state, incoming);
  assert.deepEqual(state.feed.map((item) => item.id), ["s"]);
  state = experiencesReducer(state, { type: "devotee-account/LOGOUT_SUCCESS" });
  assert.deepEqual(experiencesReducer(state, incoming).feed.map((item) => item.id), ["b", "s"]);
});
