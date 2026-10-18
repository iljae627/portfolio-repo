import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getArchive } from "@/lib/content";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { authConfigured } from "@/lib/auth";
import { activitySchema } from "@/lib/validation.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const content = await getArchive();
  return Response.json(content, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request) {
  if (!authConfigured())
    return Response.json(
      { error: "관리자 기능이 설정되지 않았습니다." },
      { status: 503 },
    );
  if (
    request.headers.get("origin") !==
    new URL(process.env.AUTH_URL).origin
  )
    return Response.json(
      { error: "허용되지 않은 요청입니다." },
      { status: 403 },
    );
  try {
    if (!(await isAdmin()))
      return Response.json(
        { error: "관리자 로그인이 필요합니다." },
        { status: 401 },
      );
    if (Number(request.headers.get("content-length") || 0) > 8192)
      return Response.json({ error: "요청이 너무 큽니다." }, { status: 413 });
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 8192)
      return Response.json({ error: "요청이 너무 큽니다." }, { status: 413 });
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return Response.json(
        { error: "JSON 형식을 확인하세요." },
        { status: 400 },
      );
    }
    const result = activitySchema.safeParse(body);
    if (!result.success)
      return Response.json(
        { error: "제목, 요약, 날짜, HTTPS 링크와 태그를 확인하세요." },
        { status: 400 },
      );
    const db = await getDb();
    const record = {
      ...result.data,
      id: randomUUID(),
      source: "활동 기록",
      published: true,
      createdAt: new Date(),
    };
    await db.collection("activities").insertOne(record);
    revalidatePath("/");
    revalidatePath("/archive");
    return Response.json({ ok: true, id: record.id }, { status: 201 });
  } catch {
    return Response.json(
      { error: "저장에 실패했습니다. 데이터베이스 연결을 확인하세요." },
      { status: 503 },
    );
  }
}
