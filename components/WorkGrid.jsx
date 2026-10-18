"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProjectVisual from "./ProjectVisual";
export default function WorkGrid({ projects }) {
  const [filter, setFilter] = useState("all");
  const tabs = [
    ["all", "전체"],
    ["research", "보안 연구"],
    ["competition", "대회"],
    ["development", "개발"],
  ];
  const visible = projects.filter((p) => filter === "all" || p.type === filter);
  return (
    <>
      <div className="work-toolbar">
        <div className="filters" aria-label="프로젝트 분야">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
              <span>
                {id === "all"
                  ? projects.length
                  : projects.filter((p) => p.type === id).length}
              </span>
            </button>
          ))}
        </div>
        <span className="mono muted">관심에서 경험으로, 여섯 가지 작업</span>
      </div>
      <div className="project-grid" aria-live="polite">
        {visible.map((p) => (
          <Link className="project-card" href={`/work/${p.slug}`} key={p.slug}>
            <ProjectVisual project={p} />
            <div className="project-info">
              <div className="meta">
                <span>{p.category}</span>
                <span>{p.date}</span>
              </div>
              <h3>
                {p.name}
                <ArrowUpRight size={20} />
              </h3>
              <p>{p.short}</p>
              <div className="tags">
                {p.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
