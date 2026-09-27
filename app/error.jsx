"use client";
export default function ErrorPage({ reset }) {
  return (
    <main id="main" className="shell section prose">
      <h1>페이지를 불러오지 못했습니다.</h1>
      <p>잠시 뒤 다시 시도해 주세요.</p>
      <button className="button dark" onClick={reset}>
        다시 시도
      </button>
    </main>
  );
}
