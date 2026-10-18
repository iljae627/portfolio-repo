import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
const records = JSON.parse(
  await readFile(new URL("../data/archive.json", import.meta.url), "utf8"),
);
const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "iljae_portfolio");
  const result = await db.collection("activities").bulkWrite(
    records.map((item) => ({
      updateOne: {
        filter: { id: item.id },
        update: {
          $set: { ...item, published: true },
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    })),
  );
  console.log(
    `Imported ${records.length} source records (${result.upsertedCount} new, ${result.modifiedCount} updated).`,
  );
} finally {
  await client.close();
}
