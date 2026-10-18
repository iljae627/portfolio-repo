import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { syncSources } from "@/lib/sync.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
function cronAllowed(request) {
  const secret = process.env.CRON_SECRET;
  const actual = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret || ""}`);
  return Boolean(secret) && actual.length === expected.length && timingSafeEqual(actual, expected);
}
async function execute() {
  try {
    const result = await syncSources(await getDb());
    revalidatePath("/"); revalidatePath("/archive"); revalidatePath("/sources");
    return Response.json(result, { status: result.status === "busy" ? 409 : result.status === "partial" ? 207 : 200, headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("[portfolio-sync] Database unavailable");
    return Response.json({ error: "동기화에 실패했습니다. 잠시 후 다시 시도하세요." }, { status: 503 });
  }
}
export async function GET(request) {
  if (!cronAllowed(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return execute();
}
export async function POST(request) {
  if (!process.env.AUTH_URL || request.headers.get("origin") !== new URL(process.env.AUTH_URL).origin)
    return Response.json({ error: "Forbidden" }, { status: 403 });
  try {
    if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  } catch { return Response.json({ error: "Authentication unavailable" }, { status: 503 }); }
  return execute();
}
