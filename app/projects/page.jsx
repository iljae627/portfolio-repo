import WorkGrid from "@/components/WorkGrid";
import { projects } from "@/lib/projects";
export const metadata = { title: "프로젝트", description: "정일재의 보안 연구와 개발 프로젝트." };
export default function Projects() {
  return <main id="main" className="shell collection-page projects-page">
    <div className="collection-heading"><span>SELECTED WORK</span><h1>프로젝트.</h1></div>
    <WorkGrid projects={projects} />
  </main>;
}
