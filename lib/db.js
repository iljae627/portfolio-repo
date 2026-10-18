import "server-only";
import { MongoClient } from "mongodb";

export function getMongoClient() {
  if (!process.env.MONGODB_URI) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!globalThis.__portfolioMongo) {
    globalThis.__portfolioMongo = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      timeoutMS: 10000,
    });
  }
  return globalThis.__portfolioMongo;
}
export async function getDb() {
  const client = getMongoClient();
  await client.connect();
  return client.db(process.env.MONGODB_DB || "iljae_portfolio");
}
