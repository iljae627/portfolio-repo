import { ArrowUpRight, ScanLine, Binary, Braces } from "lucide-react";
import { milestones } from "@/lib/projects";
export const metadata = { title: "소개", description: "정일재의 관심 분야와 활동 이력." };
export default function About() { return <main id="main" className="about-page"><h1 className="sr-only">소개</h1>
      <section id="about" className="about-section">
        <div className="shell about-grid">
          <div>
            <span className="eyebrow">저를 소개합니다</span>
            <h2>
              정보보호를 공부하는
              <br />
              정일재입니다.
            </h2>
            <p>
              중부대학교 정보보호학과에서 공부하고 있습니다. 디지털 포렌식과 Android 보안에 관심이 있어
              관련 실습과 CTF에 참여하고 있습니다.
            </p>
            <p>
              패킷·바이너리·앱을 분석한 과정과 개인 개발 프로젝트를
              블로그에 정리합니다. 실습 중 겪은 오류와 해결 방법도 함께
              기록하고 있습니다.
            </p>
            <a href="mailto:iljae627@gmail.com" className="text-link">
              이메일 보내기 <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="approach-list">
            {[
              [
                ScanLine,
                "01",
                "디지털 포렌식 공부",
                "파일과 디스크, Windows·클라우드 로그를 분석하는 방법을 공부합니다.",
                "Wireshark / Autopsy / MinIO",
              ],
              [
                Binary,
                "02",
                "리버싱·모바일 보안 실습",
                "GDB로 바이너리를 분석하고, Frida·JADX로 Android 앱을 실습합니다.",
                "GDB / Frida / JADX / AFL++",
              ],
              [
                Braces,
                "03",
                "개인 도구와 서버 개발",
                "반복 작업용 스크립트, 포켓몬 배포 서버와 웹 도구를 개발합니다.",
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
              AWARD
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
      <section id="contact" className="contact-section">
        <div className="shell">
          <span className="eyebrow">연락처</span>
          <h2>프로젝트·활동 문의</h2>
          <a className="contact-email" href="mailto:iljae627@gmail.com">
            iljae627@gmail.com <ArrowUpRight />
          </a>
          <p>
            보안 학습이나 개발 프로젝트 관련 연락은 이메일로 보내 주세요.
          </p>
        </div>
      </section>
<div className="shell about-social"><a href="https://github.com/iljae627" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://iljae627.github.io" target="_blank" rel="noreferrer">기술 블로그 ↗</a><a href="https://blog.naver.com/iljae627" target="_blank" rel="noreferrer">네이버 블로그 ↗</a></div></main>; }
