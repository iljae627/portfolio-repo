"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function SyncPanel() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function sync() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/cron/sync", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "이미 동기화가 진행 중입니다.");
      const names = { github: "GitHub", technical: "기술 블로그", naver: "네이버" };
      setMessage(data.sources.map(x => `${names[x.key]}: ${x.status === 'ok' ? `확인 ${x.scanned}건 · 신규 ${x.added}건 · 갱신 ${x.updated}건` : "실패, 기존 기록 유지"}`).join(" / "));
      router.refresh();
    } catch (error) { setMessage(error.message || "동기화에 실패했습니다."); }
    finally { setBusy(false); }
  }
  return <section className="setup-notice" aria-label="블로그 자동 동기화">
    <h2>블로그 자동 동기화</h2>
    <p>매일 오전 9시대에 GitHub·기술 블로그·네이버의 공개 기록을 확인합니다. 새 글과 변경 사항은 아카이브에 반영됩니다.</p>
    <button className="button dark" disabled={busy} onClick={sync}>{busy ? "출처 확인 중…" : "지금 동기화"}</button>
    <p role="status" aria-live="polite">{message}</p>
    <a href="/sources" className="text-link">최근 동기화 결과 보기 ↗</a>
  </section>;
}
