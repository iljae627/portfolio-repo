import "server-only";
import archive from "@/data/archive.json";
import { getDb } from "./db";
import { mergeArchive } from "./archive.mjs";
export async function getArchive() {
  if (!process.env.MONGODB_URI) return { items: archive, storage: "snapshot" };
  try {
    const db = await getDb();
    const rows = await db
      .collection("activities")
      .find(
        { published: true },
        {
          projection: {
            _id: 0,
            title: 1,
            summary: 1,
            date: 1,
            category: 1,
            url: 1,
            tags: 1,
            id: 1,
            source: 1,
          },
        },
      )
      .sort({ date: -1 })
      .limit(1000)
      .toArray();
    return {
      items: mergeArchive(archive, rows),
      storage: "mongodb",
    };
  } catch {
    console.error(
      "[portfolio] MongoDB read failed; serving verified content snapshot.",
    );
    return { items: archive, storage: "snapshot-unavailable" };
  }
}
