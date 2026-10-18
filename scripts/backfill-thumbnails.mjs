import { MongoClient } from 'mongodb';
import { readFile, writeFile } from 'node:fs/promises';
import { enrichThumbnails } from '../lib/thumbnails.mjs';
const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'iljae_portfolio');
  const activities = db.collection('activities');
  const course = {
    id: 'activity-web-server-security-course', source: '활동 기록',
    title: '웹서버보안프로그래밍 · Next.js와 MongoDB 실습',
    url: 'https://my-app2-xyz-iljae.vercel.app/', date: '2026-10-18',
    category: '전공 학습 & 멘토링', tags: ['Next.js', 'React', 'MongoDB', '웹서버보안프로그래밍'],
    summary: '웹서버보안프로그래밍 수업에서 Next.js로 공지사항 게시판을 구현하고 MongoDB에 데이터를 저장했습니다. Server·Client Component, 파일 기반 라우팅, 비동기 데이터 조회와 Suspense, Route Handler를 실습하고 Vercel에 배포했습니다.',
  };
  await activities.updateOne({id: course.id}, {$set: course, $setOnInsert: {published: true, createdAt: new Date()}}, {upsert: true});
  const rows = await activities.find({source: {$in: ['GitHub', '기술 블로그', '네이버 블로그']}}).toArray();
  const enriched = await enrichThumbnails(rows, rows);
  const updates = enriched.filter(row => row.thumbnailCheckedAt).map(row => ({updateOne: {filter: {id: row.id}, update: {$set: {thumbnail: row.thumbnail, thumbnailCheckedAt: row.thumbnailCheckedAt}}}}));
  if (updates.length) await activities.bulkWrite(updates);
  const path = new URL('../data/archive.json', import.meta.url);
  const snapshot = JSON.parse(await readFile(path, 'utf8'));
  const imageMap = new Map(enriched.map(row => [row.id, row.thumbnail]));
  for (const row of snapshot) if (imageMap.has(row.id)) row.thumbnail = imageMap.get(row.id) || null;
  if (!snapshot.some(row => row.id === course.id)) snapshot.push(course);
  await writeFile(path, JSON.stringify(snapshot, null, 2) + '\n');
  const result = {checked: updates.length, total: rows.length, thumbnails: enriched.filter(row => row.thumbnail).length,
    sources: ['GitHub','기술 블로그','네이버 블로그'].map(source => ({source, images: enriched.filter(row => row.source === source && row.thumbnail).length})),
    course: course.id};
  await writeFile(new URL('../../thumbnail-backfill-results.json', import.meta.url), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally { await client.close(); }
