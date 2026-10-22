import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { projects, completedProjects, allProjects } from "../lib/projects.js";
import { archiveRecords } from '../lib/archive.mjs';
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
      p.source ? archive.some((x) => x.url === p.source) : p.evidenceLabel,
      p.slug,
    );
});
test('six ongoing projects stay separate from completed work without losing old detail URLs', () => {
  assert.deepEqual(projects.map(p=>p.slug), ['digital-forensics', 'android-security', 'distribution-server', 'stock-trading', 'pokemon-fan-studio', 'pokemon-rng']);
  assert.ok(completedProjects.some(p=>p.slug==='collector' && p.role.includes('Rekor')));
  assert.ok(completedProjects.every(p=>!projects.some(active=>active.slug===p.slug)));
  for (const slug of ['cce-2026','defcon-bbbq','infosec-hub']) assert.ok(allProjects.some(p=>p.slug===slug));
});
test('archive separates the active server repository while retaining completed study and Collector records', () => {
  const visible = archiveRecords(archive, projects);
  assert.ok(!visible.some(x=>x.id==='repo-DS-3DS_-private_distribution_server'));
  assert.ok(visible.some(x=>x.id==='blog-hextree-android-track'));
  assert.ok(visible.some(x=>x.id==='manual-collector-team-project' && x.summary.includes('Rekor')));
});
