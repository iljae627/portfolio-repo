import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { projects, allProjects } from "@/lib/projects";
import ProjectVisual from "@/components/ProjectVisual";
export function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = allProjects.find((p) => p.slug === slug);
  return { title: p?.name || "프로젝트", description: p?.short };
}
export default async function Project({ params }) {
  const { slug } = await params;
  const p = allProjects.find((x) => x.slug === slug);
  if (!p) notFound();
  const ongoing = projects.some(x => x.slug === slug);
  return (
    <main id="main" className="shell detail section">
      <Link href={ongoing ? '/projects' : '/archive'} className="text-link">
        <ArrowLeft size={16} /> {ongoing ? '모든 프로젝트' : '활동 아카이브'}
      </Link>
      <div className="detail-hero">
        <div>
          <span className="eyebrow">
            {p.category} / {ongoing ? p.status : p.date}
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
          {p.source && <a
            className="button dark"
            href={p.source}
            target="_blank"
            rel="noreferrer"
          >
            공개 기록 보기 <ArrowUpRight size={16} />
          </a>}
          {p.evidenceLabel && <p className="image-credit">{p.evidenceLabel}</p>}
        </aside>
        <div>
          {p.inspiration && <section>
            <span className="eyebrow">시작한 계기</span><h2>호기심이 시작된 글</h2>
            <p>{p.inspiration.text}</p>
            <a className="related-link" href={p.inspiration.url} target="_blank" rel="noreferrer">{p.inspiration.title} <ArrowUpRight size={15} /></a>
            <p className="image-credit">위 통신 흐름도는 제공해 주신 참고 이미지이며, manatails의 원문 분석을 소개하는 자료입니다.</p>
          </section>}
          <section>
            <span className="eyebrow">{ongoing ? '관심과 목표' : '문제'}</span>
            <h2>{ongoing ? '무엇을 만들고, 공부하나요?' : '어떤 문제였나요?'}</h2>
            <p>{p.problem}</p>
          </section>
          <section>
            <span className="eyebrow">분석 과정</span>
            <h2>{ongoing ? '어떻게 이어 가고 있나요?' : '어떻게 접근했나요?'}</h2>
            <ol>
              {p.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </section>
          <section>
            <span className="eyebrow">{ongoing ? '현재까지의 기록' : '결과와 기록'}</span>
            <h2>{ongoing ? '지금 어디까지 왔나요?' : '무엇을 남겼나요?'}</h2>
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
          {p.next && <section><span className="eyebrow">다음 단계</span><h2>이어서 할 일</h2><ul>{p.next.map(item => <li key={item}>{item}</li>)}</ul></section>}
        </div>
      </div>
    </main>
  );
}
