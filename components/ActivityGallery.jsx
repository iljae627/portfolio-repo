import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { media } from "@/lib/media";
export default function ActivityGallery() {
  return <div className="activity-gallery" aria-label="블로그에서 가져온 활동 이미지">
    {[['debugger', 'Python 디버거 개발', 'Python 디버거 구현 기록'],
      ['nextrise', 'NextRise 2026 방문', 'NextRise 2026 현장 기록']].map(([key, title, label]) => {
      const item = media[key];
      return <a className={`gallery-card gallery-${key}`} href={item.page} key={key} target="_blank" rel="noreferrer">
        <div className="gallery-image">
          <Image src={item.src} alt={item.alt} fill sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1200px) 55vw, 660px" loading={key === 'debugger' ? 'eager' : 'lazy'} />
        </div>
        <div className="gallery-caption"><div><span>{label}</span><strong>{title}</strong></div><ArrowUpRight size={19}/></div>
      </a>;
    })}
  </div>;
}
