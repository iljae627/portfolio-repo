// Only fetch the owner's known public pages. Image URLs never become fetch targets here.
import { plain } from './collectors.mjs';

export function safeThumbnail(value, base) {
  try {
    const url = new URL(value.replace(/&amp;/g, '&'), base);
    const host = url.hostname;
    const allowed = host === 'iljae627.github.io' || host === 'raw.githubusercontent.com'
      || host === 'github.com' || host === 'private-user-images.githubusercontent.com'
      || host === 'user-images.githubusercontent.com' || host === 'camo.githubusercontent.com'
      || host === 'github-production-user-asset-6210df.s3.amazonaws.com'
      || host === 'postfiles.pstatic.net' || host === 'blogfiles.pstatic.net'
      || host === 'mblogthumb-phinf.pstatic.net' || host === 'blogthumb.pstatic.net';
    if (!allowed || url.protocol !== 'https:' || url.port || url.username || url.password) return null;
    if (/avatar|gravatar|badge|shields\.io|favicon|emoticon|profile|buddy|icon_emoji/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), m[2] ?? m[3]]));
export function extractThumbnail(html, page, source) {
  // Prefer actual article images, rather than site logos, avatars, or navigation images.
  let body;
  if (source === 'GitHub') body = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/i)?.[0];
  else if (source === '기술 블로그') body = html.match(/<div[^>]*class="[^"]*\bcontent\b[^"]*"[^>]*>[\s\S]*?(?:<\/article>|<div[^>]*id="tail-wrapper")/i)?.[0];
  else body = html.match(/<div[^>]*(?:class="[^"]*se-main-container|id="postViewArea)[\s\S]*/i)?.[0];
  for (const tag of (body || '').match(/<img\b[^>]*>/gi) || []) {
    const a = attrs(tag);
    if (Number(a.width) === 1 || Number(a.height) === 1) continue;
    const url = safeThumbnail(a['data-lazy-src'] || a['data-src'] || a.src || '', page);
    if (url) return { url, alt: plain(a.alt || '원문에 첨부된 이미지', 140) };
  }
  // Naver exposes its first content image in Open Graph even for legacy editors.
  if (source === '네이버 블로그') for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const a = attrs(tag);
    if ((a.property || a.name) === 'og:image') {
      const url = safeThumbnail(a.content || '', page);
      if (url) return { url, alt: '네이버 블로그 원문 첨부 이미지' };
    }
  }
  return null;
}
export async function enrichThumbnails(records, existing = [], fetcher = fetch) {
  const previous = new Map(existing.map(row => [row.id, row]));
  const deadline = Date.now() + 35000;
  let cursor = 0;
  const output = [...records];
  await Promise.all(Array.from({length: 4}, async () => {
    while (cursor < output.length && Date.now() < deadline) {
      const index = cursor++;
      const row = output[index], old = previous.get(row.id);
      // Refresh new/changed articles immediately; revisit older images weekly.
      if (old?.thumbnailCheckedAt && old.date === row.date && old.title === row.title && old.url === row.url
        && (row.summary === undefined || row.summary === old.summary)
        && Date.now() - new Date(old.thumbnailCheckedAt) < 7 * 86400000) continue;
      let page;
      if (/^https:\/\/iljae627\.github\.io\/posts\/[^/]+\/$/.test(row.url)) page = row.url;
      else if (/^https:\/\/blog\.naver\.com\/iljae627\/\d+$/.test(row.url)) page = row.url.replace('blog.naver.com', 'm.blog.naver.com');
      else if (/^https:\/\/github\.com\/iljae627\/[^/?#]+$/.test(row.url)) page = row.url;
      else continue;
      try {
        const response = await fetcher(page, {signal: AbortSignal.timeout(8000), redirect: 'error', cache: 'no-store', headers: {'User-Agent': 'Mozilla/5.0 (compatible; ILJAE-Portfolio/1.0)', Accept: 'text/html'}});
        if (!response.ok) continue;
        const html = await response.text();
        if (html.length > 8_000_000 || !/<(?:article|html)\b/i.test(html)) continue;
        output[index] = {...row, thumbnail: extractThumbnail(html, page, row.source), thumbnailCheckedAt: new Date()};
      } catch { /* Preserve the last working image on upstream errors. */ }
    }
  }));
  return output;
}
