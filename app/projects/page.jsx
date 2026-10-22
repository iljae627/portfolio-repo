import WorkGrid from "@/components/WorkGrid";
import { projects } from "@/lib/projects";
export const metadata = { title: "프로젝트", description: "정일재가 현재 개발하거나 계속 공부하는 여섯 가지 프로젝트." };
export default function Projects() {
  return <main id="main" className="shell collection-page projects-page">
    <div className="collection-heading"><span>IN PROGRESS</span><h1>프로젝트.</h1><p className="collection-description">지금 만들고, 계속 공부하는 여섯 가지.</p></div>
    <WorkGrid projects={projects} />
  </main>;
}
