import TraceVisual from "@/components/TraceVisual";
import WorkGrid from "@/components/WorkGrid";
import { projects } from "@/lib/projects";
export default function Home() { return <main id="main"><section className="hero"><div><h1>흔적을 읽고, 원리를 파고듭니다.</h1><p>정일재의 보안 연구와 개발 기록</p></div><TraceVisual /></section><section id="work"><h2>Selected Work</h2><WorkGrid projects={projects} /></section></main>; }
