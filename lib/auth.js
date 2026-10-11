import "server-only";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "./db";

export function authConfigured() {
  return Boolean(process.env.MONGODB_URI && process.env.AUTH_SECRET && process.env.AUTH_URL && process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET && process.env.ADMIN_GITHUB_ID);
}
let instance;
export function getAuth() {
  if (!authConfigured()) throw new Error("AUTH_NOT_CONFIGURED");
  if (!instance) {
    instance = NextAuth({
      adapter: MongoDBAdapter(getMongoClient().connect(), { databaseName: process.env.MONGODB_DB || "iljae_portfolio" }),
      secret: process.env.AUTH_SECRET,
      trustHost: true,
      providers: [GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET })],
      session: { strategy: "database", maxAge: 60 * 60 * 8, updateAge: 60 * 60 },
      pages: { signIn: "/admin", error: "/admin" },
      callbacks: {
        async signIn({ account, profile }) {
          return account?.provider === "github" && String(profile?.id) === process.env.ADMIN_GITHUB_ID;
        },
        async session({ session, user }) {
          session.user.id = user.id;
          return session;
        },
      },
    });
  }
  return instance;
}
