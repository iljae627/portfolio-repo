import snapshot from "@/data/source-snapshot.json";
import { getSyncStatus } from "@/lib/sync-status";
export const dynamic = "force-dynamic";
export const metadata = { title: "출처 및 기록" };
export default async function Sources() {
  const sync = await getSyncStatus();
  const names = { github: "GitHub", technical: "기술 블로그", naver: "네이버 블로그" };
  const time = (date) => date ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(date)) : "아직 없음";
  return (
    <main id="main" className="shell section prose">
      <span className="eyebrow">출처와 동기화 현황</span>
      <h1>기록의 근거</h1>
      <h2>확인한 공개 자료</h2>
      <ul>
        <li>
          <a href="https://github.com/iljae627">GitHub</a>: 공개 저장소{" "}
          {snapshot.publicRepositories}개 메타데이터, 주요 프로젝트 README.
        </li>
        <li>
          <a href="https://iljae627.github.io">기술 블로그</a>: 공개 검색
          인덱스에 포함된 {snapshot.technicalPosts}개 글의 본문과 메타데이터.
        </li>
        <li>
          <a href="https://blog.naver.com/iljae627">네이버 블로그</a>: 공개 글{" "}
          {snapshot.naverPostTitles}건의 모바일 페이지 본문과 목록, RSS. 본문
          텍스트를 수집하여 전공 학습 및 멘토링 흐름을 정리했습니다.
        </li>
        <li>
          <a href="https://portfolio-final-nu-hazel.vercel.app/">
            기존 포트폴리오
          </a>
          : 소개, 전공, 자격증·프로젝트 이력.
        </li>
      </ul>
      <h2>매일 자동으로 확인하는 기록</h2>
      <p>매일 한국 시간 오전 9시대에 공개 자료를 확인합니다. GitHub는 새 저장소와 메타데이터 변경, 기술 블로그는 검색 인덱스의 글과 수정 내용, 네이버는 공개 글 목록과 RSS를 반영합니다. 본문 전체를 복제하지 않고 제목·날짜·요약·태그·원문 링크와 본문에 첨부된 이미지의 썸네일을 제공합니다. 새 글과 수정된 글의 이미지를 확인하고, 기존 글의 이미지는 매주 다시 확인합니다.</p>
      <p>같은 기록은 중복 추가하지 않습니다. 출처 오류가 발생하면 기존 기록을 유지하고 다음 실행에서 다시 확인합니다. 원문 삭제·비공개 전환에 따른 자동 삭제는 하지 않으며, 대표 작업 소개와 이력은 검토 후 별도로 수정합니다.</p>
      {sync.length ? <ul>{sync.map(row => <li key={row._id}>
        {names[row._id]} — 최근 확인: {time(row.checkedAt)} · {row.status === "ok" ? `정상 (${row.scanned}건 확인, 신규 ${row.added}건, 갱신 ${row.updated}건)` : "연결 오류, 기존 기록 유지"} · 최근 성공: {time(row.lastSuccessAt)}
      </li>)}</ul> : <p>아직 동기화 기록이 없거나 상태를 불러올 수 없습니다.</p>}
    </main>
  );
}
