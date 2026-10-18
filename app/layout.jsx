import "./globals.css";
import Header from "@/components/Header";
import Link from "next/link";
const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata = {
  metadataBase: new URL(site),
  title: { default: "정일재 — Security, traced.", template: "%s | 정일재" },
  description:
    "흔적을 읽고, 원리를 파고들고, 직접 만듭니다. 정일재의 디지털 포렌식·보안 연구·개발 포트폴리오.",
  openGraph: {
    title: "정일재 — Security, traced.",
    description: "Digital Forensics · Security Research · Development",
    locale: "ko_KR",
    type: "website",
  },
};
export default function Layout({ children }) {
  return (
    <html lang="ko">
      <body>
        <a href="#main" className="skip-link">
          본문으로 이동
        </a>
        <Header />
        {children}
        <footer className="footer shell">
          <Link href="/" className="wordmark">
            정일재<span>.</span>
          </Link>
          <p>작은 단서에서 시작해, 끝까지 이해하기.</p>
          <div>
            <span>© 2026 JUNG ILJAE</span>
            <Link href="/sources">출처 및 기록</Link>
            <Link href="/admin">관리자 ↗</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
