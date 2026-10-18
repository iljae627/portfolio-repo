import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/projects";
import ProjectVisual from "@/components/ProjectVisual";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  return { title: p?.name || "프로젝트", description: p?.short };
}
export default async function Project({ params }) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <main id="main" className="shell detail section">
      <Link href="/#work" className="text-link">
        <ArrowLeft size={16} /> 모든 프로젝트
      </Link>
      <div className="detail-hero">
        <div>
          <span className="eyebrow">
            {p.category} / {p.date}
          </span>
          <h1>
            {p.title.split("\n").map((t, i) => (
              <span key={i}>
                {t}
                <br />
              </span>
            ))}
          </h1>
          <p className="hero-desc">{p.name}</p>
          <div className="tags">
            {p.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
        <ProjectVisual project={p} />
      </div>
      <div className="detail-body">
        <aside>
          <span className="mono muted">담당 역할</span>
          <p>{p.role}</p>
          <a
            className="button dark"
            href={p.source}
            target="_blank"
            rel="noreferrer"
          >
            원문 근거 보기 <ArrowUpRight size={16} />
          </a>
        </aside>
        <div>
          <section>
            <span className="eyebrow">문제</span>
            <h2>어떤 문제였나요?</h2>
            <p>{p.problem}</p>
          </section>
          <section>
            <span className="eyebrow">분석 과정</span>
            <h2>어떻게 접근했나요?</h2>
            <ol>
              {p.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </section>
          <section>
            <span className="eyebrow">결과와 기록</span>
            <h2>무엇을 남겼나요?</h2>
            <p>{p.result}</p>
            <p className="evidence-note">{p.caveat}</p>
            {p.related?.map((u, i) => (
              <a
                href={u}
                key={u}
                className="related-link"
                target="_blank"
                rel="noreferrer"
              >
                연관 분석 기록 {i + 1} <ArrowUpRight size={15} />
              </a>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
