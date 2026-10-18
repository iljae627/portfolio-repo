import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { projects } from "../lib/projects.js";
const archive = JSON.parse(
  await readFile(new URL("../data/archive.json", import.meta.url)),
);
test("all collected records have unique identifiers and HTTPS sources", () => {
  assert.equal(new Set(archive.map((x) => x.id)).size, archive.length);
  for (const x of archive) {
    assert.equal(new URL(x.url).protocol, "https:");
    assert.ok(x.title && x.date);
  }
});
test("source snapshot contains 51 technical posts, 101 Naver titles and 17 repositories", () => {
  for (const [source, count] of [
    ["기술 블로그", 51],
    ["네이버 블로그", 101],
    ["GitHub", 17],
  ])
    assert.equal(archive.filter((x) => x.source === source).length, count);
});
test("project sources resolve to collected evidence", () => {
  for (const p of projects)
    assert.ok(
      archive.some((x) => x.url === p.source),
      p.slug,
    );
});
