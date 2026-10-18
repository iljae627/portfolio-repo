"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import ArchiveThumbnail from "./ArchiveThumbnail";
export default function ArchiveExplorer({ items }) {
  const params = useSearchParams();
  const [source, setSource] = useState(params.get("source") || "전체");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체 분야");
  const [page, setPage] = useState(1);
  const sources = ["전체", ...new Set(items.map((x) => x.source))];
  const categories = ["전체 분야", ...new Set(items.map((x) => x.category))];
  const filtered = items.filter(
    (x) =>
      (source === "전체" || source === x.source) &&
      (category === "전체 분야" || category === x.category) &&
      `${x.title} ${x.summary} ${x.tags.join(" ")}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const current = Math.min(page, pages);
  return (
    <>
      <div className="archive-controls">
        <label className="search">
          <Search size={19} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="제목, 기술, 키워드로 검색"
            aria-label="활동 검색"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
              aria-label="검색어 지우기"
            >
              ×
            </button>
          )}
        </label>
        <label className="category-select">
          <span className="sr-only">분야 선택</span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="archive-tabs filters">
        {sources.map((s) => (
          <button
            key={s}
            aria-pressed={source === s}
            onClick={() => {
              setSource(s);
              setPage(1);
            }}
          >
            {s}
            <span>
              {s === "전체"
                ? items.length
                : items.filter((x) => x.source === s).length}
            </span>
          </button>
        ))}
      </div>
      <div className="archive-result mono" aria-live="polite">
        {filtered.length} RECORDS{" "}
        <span>
          {current} / {pages}
        </span>
      </div>
      <div className="archive-list">
        {filtered.slice((current - 1) * 12, current * 12).map((x) => (
          <article className="archive-entry" key={x.id}>
          <ArchiveThumbnail item={x} />
          <a className="archive-link" href={x.url} target="_blank" rel="noreferrer">
            <div className="archive-item-meta">
              <span
                className={`source-badge ${x.source === "GitHub" ? "github" : ""}`}
              >
                {x.source}
              </span>
              <time className="mono muted">{x.date}</time>
            </div>
            <div className="archive-item-content">
              <span className="mono muted">
                {x.category}
                {x.fork ? " / FORK" : ""}
              </span>
              <h2>{x.title}</h2>
              <p>{x.summary}</p>
              <div className="tags">
                {x.tags.slice(0, 4).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
            <ArrowUpRight size={19} />
          </a>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <Search />
          <h2>일치하는 기록이 없습니다.</h2>
          <p>다른 키워드를 입력하거나 필터를 초기화해 보세요.</p>
          <button
            className="button dark"
            onClick={() => {
              setQuery("");
              setSource("전체");
              setCategory("전체 분야");
              setPage(1);
            }}
          >
            필터 초기화
          </button>
        </div>
      )}
      <div className="pagination">
        <button
          aria-label="이전 페이지"
          disabled={current === 1}
          onClick={() => setPage(current - 1)}
        >
          <ArrowLeft size={16} /> 이전
        </button>
        <span>
          {current} / {pages}
        </span>
        <button
          aria-label="다음 페이지"
          disabled={current === pages}
          onClick={() => setPage(current + 1)}
        >
          다음 <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}
