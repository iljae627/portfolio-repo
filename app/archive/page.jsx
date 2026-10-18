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
    <main id="main" className="shell collection-page archive-page">
      <div className="collection-heading"><span>ARCHIVE</span><h1>활동 아카이브.</h1><p className="collection-description">마친 프로젝트와 대회, 하나씩 남긴 학습 기록.</p></div>
      <Suspense fallback={<p>아카이브를 불러오는 중입니다.</p>}>
        <ArchiveExplorer items={items} />
      </Suspense>
    </main>
  );
}
