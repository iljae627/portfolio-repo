import { getAuth, authConfigured } from "@/lib/auth";
export const runtime = "nodejs";
async function handler(request) {
  if (!authConfigured())
    return Response.json(
      { error: "인증 환경변수 설정이 필요합니다." },
      { status: 503 },
    );
  try {
    const handlers = getAuth().handlers;
    return await handlers[request.method](request);
  } catch {
    return Response.json(
      { error: "인증 서비스 연결에 실패했습니다." },
      { status: 503 },
    );
  }
}
export const GET = handler;
export const POST = handler;
