import test from "node:test";
import assert from "node:assert/strict";
import { parseTechnical, parseNaverList, parseNaverFeed, collectGitHub, collectNaver, readPublic } from "../lib/collectors.mjs";
const response = body => ({ ok: true, text: async () => typeof body === 'string' ? body : JSON.stringify(body) });
test("technical index keeps snapshot IDs and rejects foreign links", () => {
  const row = { url: "/posts/new-post/", title: "<b>New</b>", date: "2026-10-18 12:00:00 +0900", tags: "a, b", content: "<p>Text</p>" };
  assert.equal(parseTechnical(JSON.stringify([row]))[0].id, "blog-new-post");
  assert.throws(() => parseTechnical(JSON.stringify([{ ...row, url: "https://evil.test/posts/new-post/" }])));
});
test("Naver legacy JSON and XML guards", () => {
  assert.equal(parseNaverList('{"resultCode":"S","postList":[],"x":"\\q"}').x, "\\q");
  assert.throws(() => parseNaverFeed('<!DOCTYPE rss [<!ENTITY x "unsafe">]><rss/>'));
  assert.throws(() => parseNaverFeed('<rss><channel><item><link>https://evil.test/iljae627/1</link></item></channel></rss>'));
});
test("Naver paginates beyond RSS and keeps existing canonical IDs", async () => {
  const calls = [];
  const records = await collectNaver(async url => {
    calls.push(url);
    if (url.includes('rss.')) return response('<rss><channel/></rss>');
    const page = new URL(url).searchParams.get('currentPage');
    return response({ resultCode: "S", totalCount: 31, postList: Array.from({ length: page === '1' ? 30 : 1 }, (_, i) => ({ logNo: String((page === '1' ? 0 : 30) + i + 1), title: "New+Post", addDate: "2026. 10. 18.", openType: "2" })) });
  });
  assert.equal(records.length, 31); assert.equal(records[30].id, 'naver-31'); assert.equal(calls.length, 3);
});
test("GitHub rejects private and foreign owner records", async () => {
  const row = { id: 1, name: "test", owner: { login: "iljae627" }, html_url: "https://github.com/iljae627/test", updated_at: "2026-10-18T00:00:00Z" };
  const rows = await collectGitHub(async () => response([row, { ...row, private: true }, { ...row, owner: { login: 'other' } }]));
  assert.equal(rows.length, 1); assert.equal(rows[0].remoteId, '1');
});
test("upstream failures do not parse error pages as records", async () => {
  await assert.rejects(readPublic('https://api.github.com/users/iljae627/repos', async () => ({ ok: false, status: 429 })), /429/);
  assert.throws(() => parseTechnical('<html>blocked</html>'));
});
