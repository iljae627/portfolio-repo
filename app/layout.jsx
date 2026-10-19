import "./globals.css";
import Header from "@/components/Header";
import Link from "next/link";
const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata = {
  metadataBase: new URL(site),
  title: { default: "정일재 — 정보보호 포트폴리오", template: "%s | 정일재" },
  description:
    "정일재의 포트폴리오. 디지털 포렌식, Android 보안, CTF 학습과 개인 개발 프로젝트를 정리했습니다.",
  openGraph: {
    title: "정일재 — 정보보호 포트폴리오",
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
          <div>
            <span>© 2026 정일재</span>
            <Link href="/sources">출처 및 기록</Link>
            <Link href="/admin">관리자 ↗</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
