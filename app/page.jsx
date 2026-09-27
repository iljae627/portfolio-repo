import WorkGrid from "@/components/WorkGrid";
import { projects } from "@/lib/projects";
export default function Home() { return <main id="main"><section><h1>정일재의 보안 포트폴리오</h1><p>프로젝트와 활동 기록을 소개합니다.</p></section><section id="work"><h2>Selected Work</h2><WorkGrid projects={projects} /></section></main>; }
