import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { projects, allProjects, secureCommerce } from "@/lib/projects";
import ProjectVisual from "@/components/ProjectVisual";
import styles from "./project-detail.module.css";

export function generateStaticParams() {
  return allProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = allProjects.find((item) => item.slug === slug);
  return { title: project?.name || "프로젝트", description: project?.short };
}

function getSources(project) {
  if (project.links) return project.links;
  const related = (project.related ?? []).map((url, index) => ({
    url, title: "연관 분석 기록 " + (index + 1),
  }));
  return [
    ...(project.source ? [{ url: project.source, title: "프로젝트 원문" }] : []),
    ...related,
  ];
}

export default async function Project({ params }) {
  const { slug } = await params;
  const project = allProjects.find((item) => item.slug === slug);
  if (!project) notFound();

  const ongoing = projects.some((item) => item.slug === slug);
  const inProjects = ongoing || slug === secureCommerce.slug;
  const collection = inProjects ? { href: "/projects", title: "프로젝트" } : { href: "/archive", title: "활동 아카이브" };
  const sources = getSources(project);
  const contents = [
    ["overview", "프로젝트 개요"],
    ...(project.inspiration ? [["background", "시작한 계기"]] : []),
    ["approach", "접근과 작업 과정"],
    ["outcome", ongoing ? "현재까지의 기록" : "결과와 검증"],
    ...(project.next?.length ? [["next", "다음 작업"]] : []),
    ...(sources.length ? [["sources", "관련 자료"]] : []),
  ];

  return (
    <main id="main" className={"shell " + styles.page}>
      <Link className={styles.back} href={collection.href}><ArrowLeft size={16} aria-hidden="true" />{collection.title}</Link>
      <header className={styles.hero}>
        <div className={styles.intro}>
          <p className={styles.category}>{project.category}</p>
          <h1>{project.title.replaceAll("\n", " ")}</h1>
          <p className={styles.summary}>{project.short}</p>
          <ul className={styles.tags} aria-label="사용 기술">
            {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </div>
        <div className={styles.visual}><ProjectVisual project={project} /></div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <dl className={styles.facts}>
            <div><dt>담당 역할</dt><dd>{project.role}</dd></div>
            <div><dt>{ongoing ? "진행 상태" : "활동 기록"}</dt><dd>{ongoing ? project.status : project.date}</dd></div>
            {project.evidenceLabel && <div><dt>기록 범위</dt><dd>{project.evidenceLabel}</dd></div>}
          </dl>
          <nav className={styles.contents} aria-label="상세 페이지 목차">
            <p>이 페이지에서</p>
            <ul>{contents.map(([id, title]) => <li key={id}><a href={"#" + id}>{title}</a></li>)}</ul>
          </nav>
        </aside>

        <article className={styles.article}>
          <section id="overview">
            <h2>{contents[0][1]}</h2>
            <p>{project.problem}</p>
          </section>
          {project.inspiration && <section id="background">
            <h2>시작한 계기</h2>
            <p>{project.inspiration.text}</p>
            <a className={styles.inlineLink} href={project.inspiration.url} target="_blank" rel="noreferrer">{project.inspiration.title} <ArrowUpRight size={16} aria-hidden="true" /></a>
          </section>}
          <section id="approach">
            <h2>접근과 작업 과정</h2>
            <ol className={styles.steps}>{project.approach.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>
          <section id="outcome">
            <h2>{ongoing ? "현재까지의 기록" : "결과와 검증"}</h2>
            <p>{project.result}</p>
            {project.caveat && <p className={styles.note}>{project.caveat}</p>}
          </section>
          {project.next?.length > 0 && <section id="next">
            <h2>다음 작업</h2>
            <ul className={styles.next}>{project.next.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>}
          {sources.length > 0 && <section id="sources">
            <h2>관련 자료</h2>
            <ul className={styles.sources}>{sources.map(({url,title}) => (
              <li key={url}><a href={url} target="_blank" rel="noreferrer"><span>{title}</span><ArrowUpRight size={17} aria-hidden="true" /></a></li>
            ))}</ul>
          </section>}
          <Link className={styles.back} href={collection.href}><ArrowLeft size={16} aria-hidden="true" />{collection.title} 목록</Link>
        </article>
      </div>
    </main>
  );
}
