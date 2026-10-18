import { Suspense } from "react";
import { getArchive } from "@/lib/content";
import ArchiveExplorer from "@/components/ArchiveExplorer";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "활동 아카이브",
  description:
    "기술 블로그, 전공 학습 노트, GitHub 저장소를 검색하는 정일재의 활동 아카이브.",
};
export default async function Archive() {
  const { items } = await getArchive();
  return (
    <main id="main" className="shell section archive-page">
      <span className="eyebrow">활동 아카이브</span>
      <div className="archive-title">
        <h1>
          호기심이 남긴 기록<span className="lime-dot">.</span>
        </h1>
        <p>
          기술 분석과 대회 회고부터 전공 공부까지.
          <br />
          배움의 과정을 연결합니다.
        </p>
      </div>
      <Suspense fallback={<p>아카이브를 불러오는 중입니다.</p>}>
        <ArchiveExplorer items={items} />
      </Suspense>
    </main>
  );
}
