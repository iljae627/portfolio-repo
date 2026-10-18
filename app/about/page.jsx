import { ArrowUpRight, ScanLine, Binary, Braces } from "lucide-react";
import { milestones } from "@/lib/projects";
export const metadata = { title: "소개", description: "정일재의 관심 분야와 활동 이력." };
export default function About() { return <main id="main" className="about-page"><h1 className="sr-only">소개</h1>
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
<div className="shell about-social"><a href="https://github.com/iljae627" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://iljae627.github.io" target="_blank" rel="noreferrer">기술 블로그 ↗</a><a href="https://blog.naver.com/iljae627" target="_blank" rel="noreferrer">네이버 블로그 ↗</a></div></main>; }
