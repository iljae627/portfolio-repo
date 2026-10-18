import test from 'node:test';
import assert from 'node:assert/strict';
import {safeThumbnail, extractThumbnail, enrichThumbnails} from '../lib/thumbnails.mjs';
test('thumbnail URLs reject credentials, untrusted hosts and non-HTTPS schemes', () => {
  for (const url of ['http://iljae627.github.io/a.png','https://iljae627.github.io.evil.test/a.png','https://secret@iljae627.github.io/a.png','https://localhost/a.png','data:image/png;base64,a']) assert.equal(safeThumbnail(url, 'https://iljae627.github.io'), null);
  assert.equal(safeThumbnail('/assets/img/demo.png', 'https://iljae627.github.io/posts/test/'), 'https://iljae627.github.io/assets/img/demo.png');
});
test('finds content images without using navigation avatars or GitHub Open Graph cards', () => {
  const html = '<html><img src="https://iljae627.github.io/avatar_img.png"><div class="content"><img data-src="/assets/img/actual.png" alt="실습 화면"></div></article></html>';
  assert.equal(extractThumbnail(html, 'https://iljae627.github.io/posts/test/', '기술 블로그').alt, '실습 화면');
  assert.equal(extractThumbnail('<html><meta property="og:image" content="https://opengraph.githubassets.com/card"></html>', 'https://github.com/iljae627/test', 'GitHub'), null);
  assert.equal(extractThumbnail('<html><meta property="og:image" content="https://blogfiles.pstatic.net/photo.jpg"></html>', 'https://m.blog.naver.com/iljae627/1', '네이버 블로그').url, 'https://blogfiles.pstatic.net/photo.jpg');
});
test('new images are enriched, fresh records skipped, upstream failures preserve saved images', async () => {
  const row = {id:'blog-demo', url:'https://iljae627.github.io/posts/demo/', source:'기술 블로그', date:'2026-10-18'};
  const old = {...row, thumbnail:{url:'https://iljae627.github.io/old.png'}, thumbnailCheckedAt:new Date()};
  let calls = 0;
  const fetcher = async () => { calls++; return {ok:true,text:async()=>'<html><div class="content"><img src="/actual.png"></div></article></html>'}; };
  const result = await enrichThumbnails([row], [], fetcher);
  assert.equal(result[0].thumbnail.url, 'https://iljae627.github.io/actual.png');
  await enrichThumbnails([row], [old], fetcher); assert.equal(calls, 1);
  const failed = await enrichThumbnails([row], [], async()=>{throw Error('timeout');});
  assert.equal('thumbnail' in failed[0], false);
  assert.deepEqual({...old,...failed[0]}.thumbnail, old.thumbnail);
  const foreign = await enrichThumbnails([{...row,url:'https://evil.test/post'}], [], fetcher); assert.equal(calls, 1); assert.equal('thumbnail' in foreign[0], false);
});
