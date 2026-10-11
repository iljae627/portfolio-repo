import { test } from "node:test";
import assert from "node:assert/strict";
import { activitySchema } from "../lib/validation.mjs";
const valid = {
  title: "보안 분석 기록",
  summary: "테스트 환경에서 분석한 내용입니다.",
  date: "2026-10-18",
  category: "Development",
  url: "https://example.com/report",
  tags: ["Python"],
};
test("accepts a valid published activity", () =>
  assert.equal(activitySchema.safeParse(valid).success, true));
test("rejects script and insecure URL schemes", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://example.com",
    "data:text/html,hi",
  ])
    assert.equal(activitySchema.safeParse({ ...valid, url }).success, false);
});
test("rejects impossible dates and excess tags", () => {
  assert.equal(
    activitySchema.safeParse({ ...valid, date: "2026-02-31" }).success,
    false,
  );
  assert.equal(
    activitySchema.safeParse({ ...valid, tags: Array(9).fill("x") }).success,
    false,
  );
});
test("rejects injected fields and operator-shaped titles", () => {
  assert.equal(
    activitySchema.safeParse({ ...valid, published: true }).success,
    false,
  );
  assert.equal(
    activitySchema.safeParse({ ...valid, title: { $ne: null } }).success,
    false,
  );
});
