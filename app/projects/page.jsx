import WorkGrid from "@/components/WorkGrid";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects, secureCommerce } from "@/lib/projects";
import styles from "./projects.module.css";
export const metadata = { title: "프로젝트", description: "정일재의 팀 프로젝트와 현재 개발·학습 중인 프로젝트." };
export default function Projects() {
  return <main id="main" className="shell collection-page projects-page">
    <div className="collection-heading"><h1>프로젝트.</h1><p className="collection-description">팀에서 만든 결과물과 지금 개발하고 공부하는 기록.</p></div>
    <section aria-labelledby="team-project">
      <h2 id="team-project" className={styles.title}>팀 프로젝트</h2>
      <Link className={styles.feature} href={"/work/" + secureCommerce.slug}>
        <div><strong>{secureCommerce.name}</strong><p>{secureCommerce.short}</p></div>
        <ArrowUpRight size={22} aria-hidden="true" />
      </Link>
    </section>
    <h2 className={styles.title}>개발·학습 중인 프로젝트</h2>
    <WorkGrid projects={projects} />
  </main>;
}
