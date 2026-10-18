import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  ScanLine,
  Binary,
  Braces,
} from "lucide-react";
import WorkGrid from "@/components/WorkGrid";
import { projects, milestones } from "@/lib/projects";
import { getArchive } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { items } = await getArchive();
  const technicalPosts = items.filter(item => item.source === "기술 블로그").length;
  const naverPosts = items.filter(item => item.source === "네이버 블로그").length;
  return (
    <main id="main">
      <section className="hero shell">
        <span className="hero-label">정일재 · 정보보호 포트폴리오</span>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-intro">안녕하세요, 정일재입니다.</p>
            <h1>
              흔적을 읽고,
              <br />
              <span className="hero-accent">원리를 파고듭니다.</span>
            </h1>
            <p className="hero-desc">
              디지털 포렌식에서 리버스 엔지니어링까지.
              <br />
              작은 단서를 연결해 시스템을 이해하고,
              <br />
              분석에 필요한 도구를 직접 만듭니다.
            </p>
            <div className="hero-actions">
              <a href="#work" className="button dark">
                프로젝트 살펴보기 <ArrowDown size={16} />
              </a>
              <Link href="/archive" className="text-link">
                학습 기록 보기 <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-base">
          <div>
            <a
              href="https://github.com/iljae627"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ArrowUpRight size={13} />
            </a>
            <a
              href="https://iljae627.github.io"
              target="_blank"
              rel="noreferrer"
            >
              Tech Blog <ArrowUpRight size={13} />
            </a>
            <a
              href="https://blog.naver.com/iljae627"
              target="_blank"
              rel="noreferrer"
            >
              Study Notes <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </section>
      <section className="numbers">
        <div className="shell number-grid">
          <div>
              <span className="mono">함께 만든 성과</span>
            <p>
              <strong>17</strong>
              <span>위</span>
            </p>
            <a href="https://iljae627.github.io/posts/cce2026/">
              CCE 2026 본선 · 팀 성과 <ArrowUpRight size={13} />
            </a>
          </div>
          <div>
              <span className="mono">직접 탐구한 과정</span>
            <p>
              <strong>
                14<span>/14</span>
              </strong>
            </p>
            <a href="https://iljae627.github.io/posts/hextree-android-track/">
              HexTree Android Track <ArrowUpRight size={13} />
            </a>
          </div>
          <div>
              <span className="mono">분석을 남긴 기록</span>
            <p>
              <strong>{technicalPosts}</strong>
              <span>편</span>
            </p>
            <Link href="/archive?source=기술 블로그">
              기술 블로그의 분석과 기록 <ArrowUpRight size={13} />
            </Link>
          </div>
          <div>
              <span className="mono">꾸준히 쌓은 학습</span>
            <p>
              <strong>{naverPosts}</strong>
              <span>편</span>
            </p>
            <Link href="/archive?source=네이버 블로그">
              전공 수업과 학습 노트 <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </section>
      <section id="work" className="section shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">프로젝트</span>
            <h2>
              질문에서 시작한 작업들<span className="lime-dot">.</span>
            </h2>
          </div>
          <p>
            대회에서 부딪히고, 실험으로 확인하고,
            <br />
            다음에 다시 꺼내볼 수 있도록 기록합니다.
          </p>
        </div>
        <WorkGrid projects={projects} />
      </section>
      <section id="about" className="about-section">
        <div className="shell about-grid">
          <div>
            <span className="eyebrow">저를 소개합니다</span>
            <h2>
              답을 찾는 것에서,
              <br />
              이유를 이해하는 쪽으로.
            </h2>
            <p>
              중부대학교 정보보호학과에서 공부하고 있습니다. 시스템에 남은
              흔적을 읽는 일에 관심이 많고, 사이버 수사와 디지털 포렌식 분야를
              목표로 경험을 쌓고 있습니다.
            </p>
            <p>
              개발로 시작한 호기심은 패킷과 바이너리, 앱과 가상머신으로
              이어졌습니다. 잘된 결과뿐 아니라 막힌 지점과 실패한 가설도 함께
              기록합니다.
            </p>
            <a href="mailto:iljae627@gmail.com" className="text-link">
              함께 이야기 나누기 <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="approach-list">
            {[
              [
                ScanLine,
                "01",
                "흔적을 읽습니다.",
                "메모리·로그·패킷의 단서를 모아 사건의 흐름을 복원합니다.",
                "Wireshark / Autopsy / MinIO",
              ],
              [
                Binary,
                "02",
                "경계를 실험합니다.",
                "바이너리와 모바일 앱을 분석하고, 가설을 실습 환경에서 확인합니다.",
                "GDB / Frida / JADX / AFL++",
              ],
              [
                Braces,
                "03",
                "필요한 것을 만듭니다.",
                "자동화 스크립트와 서버, 이해를 돕는 웹 인터페이스를 개발합니다.",
                "Python / C·C++ / JavaScript",
              ],
            ].map(([Icon, n, title, desc, tools]) => (
              <div className="approach" key={n}>
                <div className="approach-icon">
                  <Icon size={24} strokeWidth={1.4} />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <span className="mono tools">{tools}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section shell journey">
        <div className="section-head">
          <div>
            <span className="eyebrow">걸어온 길</span>
            <h2>
              경험이 쌓이는 방향<span className="lime-dot">.</span>
            </h2>
          </div>
          <span className="mono muted">2021년부터 지금까지</span>
        </div>
        <div className="timeline">
          {milestones.map((m) => (
            <a href={m.url} key={m.title} target="_blank" rel="noreferrer">
              <time className="mono">{m.date}</time>
              <div>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </div>
              <ArrowUpRight size={20} />
            </a>
          ))}
        </div>
      </section>
      <section className="journal shell">
        <div>
          <span className="eyebrow">배움을 나누는 일</span>
          <h2>
            기록은 다음 분석의
            <br />
            출발점이 됩니다.
          </h2>
          <p>
            CTF, 모바일 보안, 포렌식, 개발, 그리고 매일의 전공 공부.
            <br />
            흩어진 기록을 한 곳에서 찾아보세요.
          </p>
          <Link href="/archive" className="button dark">
            전체 활동 아카이브 <ArrowRight size={16} />
          </Link>
        </div>
        <div className="journal-list">
          {[
            [
              "모바일 보안",
              "Android Challenge 1–12",
              "allsafe-android-writeup",
            ],
            ["스마트 컨트랙트", "Ethernaut Level 0–40", "ethernaut-all-clear"],
            [
              "퍼징",
              "Fuzzing101: 크래시에서 원인까지",
              "fuzzing101-three-exercises",
            ],
          ].map(([category, title, slug]) => (
            <a
              key={slug}
              href={`https://iljae627.github.io/posts/${slug}/`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="mono muted">{category}</span>
              <h3>
                {title}
                <ArrowUpRight size={18} />
              </h3>
            </a>
          ))}
        </div>
      </section>
      <section id="contact" className="contact-section">
        <div className="shell">
          <span className="eyebrow">다음 경험을 함께</span>
          <h2>함께 풀어볼 문제가 있나요?</h2>
          <a className="contact-email" href="mailto:iljae627@gmail.com">
            iljae627@gmail.com <ArrowUpRight />
          </a>
          <p>
            보안 연구, 개발 프로젝트, 그리고 새로운 배움에 관한 이야기를
            기다립니다.
          </p>
        </div>
      </section>
    </main>
  );
}
