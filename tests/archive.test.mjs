import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeArchive } from "../lib/archive.mjs";
test("database records override the snapshot without duplicate IDs", () => {
  const result = mergeArchive(
    [{ id: "a", date: "2026-01-01", title: "old", fork: true }],
    [{ id: "a", date: "2026-01-01", title: "new" }],
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "new");
  assert.equal(result[0].fork, true);
});
test("retains fallback records and sorts newly published activities first", () => {
  const result = mergeArchive(
    [{ id: "a", date: "2026-01-01" }],
    [{ id: "b", date: "2026-10-18" }],
  );
  assert.deepEqual(
    result.map((x) => x.id),
    ["b", "a"],
  );
});
