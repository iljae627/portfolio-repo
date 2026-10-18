import { authConfigured } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import AdminPanel from "@/components/AdminPanel";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "활동 관리",
  robots: { index: false, follow: false },
};
export default async function Admin({ searchParams }) {
  const params = await searchParams;
  const configured = authConfigured();
  let allowed = false;
  let error = false;
  if (configured)
    try {
      allowed = await isAdmin();
    } catch {
      error = true;
    }
  return (
    <main id="main" className="shell section admin-page">
      <span className="eyebrow">포트폴리오 관리</span>
      <h1>활동 기록 관리</h1>
      <p className="muted">
        GitHub 계정으로 로그인하고 새로운 활동을 아카이브에 추가합니다.
      </p>
      {params?.error && (
        <p role="alert">
          {params.error === "AccessDenied"
            ? "등록된 관리자 GitHub 계정으로 로그인해 주세요."
            : "로그인을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요."}
        </p>
      )}
      {!configured ? (
        <div className="setup-notice">
          <h2>연결 설정이 필요합니다.</h2>
          <p>
            MongoDB와 GitHub OAuth 환경변수가 설정되면 관리자 로그인이
            활성화됩니다. 공개 포트폴리오와 아카이브는 지금도 사용할 수
            있습니다.
          </p>
          <p>
            설정 항목: MONGODB_URI, AUTH_SECRET, AUTH_URL, AUTH_GITHUB_ID,
            AUTH_GITHUB_SECRET, ADMIN_GITHUB_ID
          </p>
          <a href="/archive" className="text-link">
            공개 아카이브 보기 ↗
          </a>
        </div>
      ) : error ? (
        <div className="setup-notice" role="alert">
          <h2>인증 서비스에 연결할 수 없습니다.</h2>
          <p>MongoDB 연결 및 OAuth 환경변수를 확인한 뒤 다시 시도하세요.</p>
        </div>
      ) : (
        <AdminPanel allowed={allowed} />
      )}
    </main>
  );
}
