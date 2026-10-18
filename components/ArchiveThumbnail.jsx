"use client";
import { useState } from "react";
export default function ArchiveThumbnail({ item }) {
  const [flipped, setFlipped] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!item.thumbnail?.url || failed) return null;
  return (
    <button type="button" className="archive-thumbnail" aria-pressed={flipped}
      aria-label={`${item.title} 이미지 설명 ${flipped ? '닫기' : '보기'}: ${item.summary || item.category}`}
      onClick={() => setFlipped(!flipped)}>
      <span className="thumbnail-inner">
        <span className="thumbnail-front" aria-hidden="true">
          {/* Source images use no referrer, including Naver's public image CDN. */}
          <img src={item.thumbnail.url} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
          <span className="thumbnail-hint">뒤집어 보기 ↻</span>
        </span>
        <span className="thumbnail-back" aria-hidden="true"><strong>{item.category}</strong><span>{item.summary || item.title}</span></span>
      </span>
    </button>
  );
}
