import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
export default function Home() {
  return (
    <main id="main" className="minimal-home shell">
      <section className="minimal-intro" aria-labelledby="intro-title">
        <p className="minimal-name">정일재 · 정보보호</p>
        <div className="character-float"><Image src="/images/portfolio/hero-seal.png" alt="환하게 웃는 회색 캐릭터" width={225} height={225} priority /></div>
        <h1 id="intro-title">흔적을 읽고,<br /><span>원리를 파고듭니다.</span></h1>
        <p className="minimal-description">분석하고, 만들고, 기록합니다.</p>
        <div className="minimal-actions">
          <Link className="button dark" href="/projects">프로젝트 <ArrowRight size={16} /></Link>
          <Link className="minimal-secondary" href="/archive">아카이브 <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  );
}
