import { XMLParser } from "fast-xml-parser";

const BLOG = "https://iljae627.github.io";
const parser = new XMLParser({ ignoreAttributes: true, processEntities: true });
const list = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
export function plain(value, limit = 500) {
  return String(value ?? "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/\s+/g, " ").trim().slice(0, limit);
}
export async function readPublic(url, fetcher = fetch) {
  const response = await fetcher(url, {
    headers: { "User-Agent": "ILJAE-Portfolio-Sync/1.0 (+https://iljae627-portfolio.vercel.app/sources)", Accept: "application/json, application/xml, text/xml;q=0.9, */*;q=0.5" },
    signal: AbortSignal.timeout(15000), cache: "no-store", redirect: "error",
  });
  if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
  const body = await response.text();
  if (Buffer.byteLength(body) > 8_000_000) throw new Error("Upstream response too large");
  return body;
}
export function parseTechnical(body) {
  const rows = JSON.parse(body);
  if (!Array.isArray(rows) || !rows.length) throw new Error("Invalid technical blog index");
  return rows.map((row) => {
    const url = new URL(row.url, BLOG);
    if (url.origin !== BLOG || !/^\/posts\/[^/]+\/$/.test(url.pathname)) throw new Error("Unexpected blog URL");
    const date = String(row.date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !row.title) throw new Error("Invalid blog entry");
    return { id: `blog-${url.pathname.split('/')[2]}`, title: plain(row.title, 140), url: url.href,
      source: "기술 블로그", category: plain(row.categories || "Blog & Technical Documentation", 100),
      date, summary: plain(row.content, 160) + "…", tags: (Array.isArray(row.tags) ? row.tags : String(row.tags || "").split(/,\s*/)).filter(Boolean).slice(0, 8) };
  });
}
export async function collectTechnical(fetcher) {
  return parseTechnical(await readPublic(`${BLOG}/assets/js/data/search.json`, fetcher));
}
export async function collectGitHub(fetcher) {
  const records = [];
  for (let page = 1; page <= 10; page++) {
    const rows = JSON.parse(await readPublic(`https://api.github.com/users/iljae627/repos?per_page=100&page=${page}&sort=full_name`, fetcher));
    if (!Array.isArray(rows)) throw new Error("Invalid GitHub response");
    for (const row of rows) {
      if (row.private || row.owner?.login?.toLowerCase() !== "iljae627") continue;
      if (!/^https:\/\/github\.com\/iljae627\/[^/]+$/.test(row.html_url) || !row.id || !row.updated_at) throw new Error("Invalid repository");
      records.push({ id: `repo-${row.name}`, remoteId: String(row.id), title: plain(row.name, 140), url: row.html_url,
        source: "GitHub", category: "Development", tags: row.language ? [row.language] : [],
        summary: plain(row.description || "공개 소스 저장소 · 코드와 변경 이력 보기", 500),
        date: row.updated_at.slice(0, 10), fork: Boolean(row.fork) });
    }
    if (rows.length < 100) return records;
  }
  throw new Error("GitHub pagination limit exceeded");
}
export function parseNaverList(body) {
  // Naver occasionally emits invalid JSON escapes in titles.
  const data = JSON.parse(body.replace(/\\(?!["\\/bfnrtu])/g, "\\\\"));
  if (data.resultCode !== "S" || !Array.isArray(data.postList)) throw new Error("Invalid Naver list");
  return data;
}
export function parseNaverFeed(body) {
  if (/<!DOCTYPE|<!ENTITY/i.test(body)) throw new Error("XML entities are not accepted");
  const channel = parser.parse(body)?.rss?.channel;
  if (!channel) throw new Error("Invalid Naver RSS");
  return list(channel.item).map((row) => {
    const url = new URL(String(row.link));
    if (url.hostname !== "blog.naver.com") throw new Error("Unexpected Naver URL");
    const id = url.pathname.match(/^\/iljae627\/(\d+)$/)?.[1];
    if (!id || !Number.isFinite(Date.parse(row.pubDate))) throw new Error("Invalid Naver item");
    return { id: `naver-${id}`, title: plain(row.title, 140), url: `https://blog.naver.com/iljae627/${id}`,
      source: "네이버 블로그", category: "전공 학습 & 멘토링",
      date: new Date(Date.parse(row.pubDate) + 9 * 3600000).toISOString().slice(0, 10), summary: plain(row.description, 160) };
  });
}
export async function collectNaver(fetcher) {
  let feed = [];
  try { feed = parseNaverFeed(await readPublic("https://rss.blog.naver.com/iljae627.xml", fetcher)); } catch { /* Full public list remains the primary source. */ }
  const records = new Map(feed.map((row) => [row.id, row]));
  let total;
  for (let page = 1; page <= 20; page++) {
    const data = parseNaverList(await readPublic(`https://blog.naver.com/PostTitleListAsync.naver?blogId=iljae627&currentPage=${page}&countPerPage=30`, fetcher));
    total ??= Number(data.totalCount);
    if (!Number.isFinite(total) || total < 0 || total > 600) throw new Error("Unexpected Naver post count");
    for (const row of data.postList) {
      if (row.isPostNotOpen === "1" || row.openType && row.openType !== "2") continue;
      const id = `naver-${row.logNo}`;
      const match = String(row.addDate).match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
      const date = match ? `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}` : records.get(id)?.date;
      if (!/^\d+$/.test(String(row.logNo)) || !date) throw new Error("Invalid Naver date or ID");
      records.set(id, { ...records.get(id), id, title: plain(decodeURIComponent(row.title.replace(/\+/g, " ")), 140),
        url: `https://blog.naver.com/iljae627/${row.logNo}`, date, source: "네이버 블로그", category: "전공 학습 & 멘토링" });
    }
    if (page * 30 >= total) return [...records.values()];
    if (!data.postList.length) throw new Error("Incomplete Naver pagination");
  }
  throw new Error("Naver pagination limit exceeded");
}
export const collectors = { github: collectGitHub, technical: collectTechnical, naver: collectNaver };
