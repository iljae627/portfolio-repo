import { randomUUID } from "node:crypto";
import { enrichThumbnails } from "./thumbnails.mjs";
import { collectors } from "./collectors.mjs";

export async function syncSources(db, sources = collectors) {
  const state = db.collection("sync_state");
  const token = randomUUID();
  const startedAt = new Date();
  await state.updateOne({ _id: "daily" }, { $setOnInsert: { lockedUntil: new Date(0) } }, { upsert: true });
  const lock = await state.findOneAndUpdate({ _id: "daily", lockedUntil: { $lte: startedAt } },
    { $set: { token, lockedUntil: new Date(+startedAt + 300000), startedAt } }, { returnDocument: "after" });
  if (!lock) return { status: "busy", sources: [] };
  try {
    const results = await Promise.all(Object.entries(sources).map(async ([key, collect]) => {
      try {
        let records = await collect();
        const collection = db.collection("activities");
        const existing = await collection.find({ source: { $in: [...new Set(records.map(x => x.source))] } }).toArray();
        if (sources === collectors) records = await enrichThumbnails(records, existing);
        const byId = new Map(existing.map(x => [x.id, x]));
        const byRemote = new Map(existing.filter(x => x.remoteId).map(x => [x.remoteId, x]));
        const operations = []; let added = 0, updated = 0;
        for (const record of records) {
          const previous = byId.get(record.id) || (record.remoteId && byRemote.get(record.remoteId));
          const value = { ...record, id: previous?.id || record.id };
          if (previous && Object.entries(value).every(([field, data]) => JSON.stringify(previous[field]) === JSON.stringify(data))) continue;
          const defaults = { createdAt: new Date(), published: true };
          if (!('summary' in value)) defaults.summary = "전공 수업 및 학습 기록. 원문에서 학습 내용을 확인할 수 있습니다.";
          if (!('tags' in value)) defaults.tags = ["전공 학습"];
          operations.push({ updateOne: { filter: { id: value.id }, update: { $set: { ...value, syncedAt: new Date() }, $setOnInsert: defaults }, upsert: true } });
          previous ? updated++ : added++;
        }
        if (operations.length) await collection.bulkWrite(operations, { ordered: false });
        const result = { key, status: "ok", scanned: records.length, added, updated, checkedAt: new Date() };
        await state.updateOne({ _id: key }, { $set: { ...result, lastSuccessAt: result.checkedAt } }, { upsert: true });
        return result;
      } catch (error) {
        // Never log upstream bodies or connection strings.
        console.error(`[portfolio-sync] ${key} failed (${error?.name || "Error"})`);
        const result = { key, status: "error", checkedAt: new Date(), error: "출처 연결 또는 저장 실패. 기존 기록을 유지합니다." };
        await state.updateOne({ _id: key }, { $set: result }, { upsert: true });
        return result;
      }
    }));
    const status = results.every(x => x.status === "ok") ? "ok" : "partial";
    await state.updateOne({ _id: "daily", token }, { $set: { status, finishedAt: new Date() } });
    return { status, sources: results };
  } finally {
    await state.updateOne({ _id: "daily", token }, { $set: { lockedUntil: new Date(0) }, $unset: { token: "" } });
  }
}
