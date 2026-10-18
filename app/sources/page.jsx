import snapshot from "@/data/source-snapshot.json";
export const metadata = { title: "출처 및 기록" };
export default function Sources() {
  return (
    <main id="main" className="shell section prose">
      <span className="eyebrow">SOURCES & EDITORIAL NOTES</span>
      <h1>기록의 근거</h1>
      <p>
        수집 기준일: {snapshot.collectedAt}. 이 페이지는 공개 활동 기록을
        포트폴리오 관점에서 다시 정리한 것입니다.
      </p>
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
      <h2>표현 원칙</h2>
      <p>
        대회 순위는 팀 성과로 표시하고, 본인의 역할은 회고에 적힌 범위에서
        설명합니다. 교육용 취약 앱 실습과 원데이 분석은 학습 기록이며 신규
        취약점 발견이나 버그바운티 수상으로 소개하지 않습니다. 코드가 없는
        아이디어·공모전 제안은 구현 완료 프로젝트로 표시하지 않습니다.
      </p>
      <h2>숫자와 최신성</h2>
      <p>
        글과 저장소 숫자는 수집 시점 기준입니다. 블로그와 GitHub 기록은 중복되는
        활동이 있을 수 있으므로 합계를 독립적인 프로젝트 개수로 해석하지
        않습니다. 관리자에서 추가한 활동은 MongoDB에서 불러오며, 기본 공개
        기록은 검증된 스냅샷으로 함께 제공합니다.
      </p>
      <h2>프로필</h2>
      <p>
        기존 포트폴리오와 공개 블로그를 근거로 중부대학교 정보보호학과 재학 및
        사이버 수사·디지털 포렌식 분야의 진로 관심을 반영했습니다. 학번·거주지
        상세 등 소개에 필요하지 않은 정보는 게시하지 않았습니다.
      </p>
    </main>
  );
}
