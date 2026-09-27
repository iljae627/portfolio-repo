import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="shell section prose">
      <span className="eyebrow">404 / TRACE NOT FOUND</span>
      <h1>이 기록은 찾지 못했습니다.</h1>
      <p>주소를 확인하거나 다른 활동을 탐색해 보세요.</p>
      <Link className="button dark" href="/archive">
        아카이브로 이동 →
      </Link>
    </main>
  );
}
