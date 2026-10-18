import "server-only";
import { getDb } from "./db";
export async function getSyncStatus() {
  if (!process.env.MONGODB_URI) return [];
  try {
    const db = await getDb();
    const rows = await db.collection("sync_state").find(
      { _id: { $in: ["github", "technical", "naver"] } },
      { projection: { _id: 1, status: 1, lastSuccessAt: 1, checkedAt: 1, scanned: 1, added: 1, updated: 1 } },
    ).toArray();
    return rows;
  } catch { return []; }
}
