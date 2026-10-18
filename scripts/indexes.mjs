import { MongoClient } from "mongodb";
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "iljae_portfolio");
  await db.collection("activities").createIndex({ id: 1 }, { unique: true });
  await db.collection("activities").createIndex({ published: 1, date: -1 });
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db
    .collection("sessions")
    .createIndex({ sessionToken: 1 }, { unique: true });
  await db
    .collection("sessions")
    .createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
  await db
    .collection("accounts")
    .createIndex({ provider: 1, providerAccountId: 1 }, { unique: true });
  await db
    .collection("verification_tokens")
    .createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
  console.log("Portfolio and authentication indexes created.");
} finally {
  await client.close();
}
