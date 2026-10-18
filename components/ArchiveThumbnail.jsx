"use client";
import { useState } from "react";
import { archiveFallback } from "@/lib/archive-visuals.mjs";
export default function ArchiveThumbnail({ item }) {
  const [flipped, setFlipped] = useState(false);
  const [failed, setFailed] = useState(false);
  const fallback = archiveFallback(item.source);
  const original = Boolean(item.thumbnail?.url) && !failed;
  const image = original ? item.thumbnail.url : fallback.src;
  return (
    <button type="button" className={`archive-thumbnail ${original ? 'article-thumbnail' : `logo-thumbnail logo-${fallback.type}`}`} aria-pressed={flipped}
      aria-label={`${item.title} 이미지 설명 ${flipped ? '닫기' : '보기'}: ${item.summary || item.category}`}
      onClick={() => setFlipped(value => !value)}>
      <span className="thumbnail-inner">
        <span className="thumbnail-front" aria-hidden="true">
          {/* Source images use no referrer, including Naver's public image CDN. */}
          <img src={image} alt="" width={96} height={96} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
        </span>
        <span className="thumbnail-back" aria-hidden="true"><strong>{item.category}</strong><span>{item.summary || item.title}</span></span>
      </span>
    </button>
  );
}
