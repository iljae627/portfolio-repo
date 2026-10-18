import "server-only";
import { getAuth, authConfigured } from "./auth";
import { getDb } from "./db";
import { ObjectId } from "mongodb";

export async function isAdmin() {
  if (!authConfigured()) return false;
  const session = await getAuth().auth();
  if (!session) return false;
  const db = await getDb();
  const ids = [session.user.id];
  if (ObjectId.isValid(session.user.id))
    ids.push(new ObjectId(session.user.id));
  return Boolean(
    await db.collection("accounts").findOne({
      userId: { $in: ids },
      provider: "github",
      providerAccountId: process.env.ADMIN_GITHUB_ID,
    }),
  );
}
