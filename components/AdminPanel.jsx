"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { KeyRound, ArrowUpRight } from "lucide-react";
export default function AdminPanel({ allowed }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function login() {
    setBusy(true);
    setMessage("");
    try {
      await signIn("github", { redirectTo: "/admin" });
    } catch {
      setMessage("로그인에 실패했습니다. 연결 설정을 확인하세요.");
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await signOut({ redirect: false });
      router.refresh();
    } catch {
      setMessage("로그아웃에 실패했습니다. 다시 시도하세요.");
    } finally {
      setBusy(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.get("title"),
          summary: data.get("summary"),
          date: data.get("date"),
          category: data.get("category"),
          url: data.get("url"),
          tags: String(data.get("tags"))
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage("활동을 저장했습니다. 공개 아카이브에서 확인할 수 있습니다.");
      form.reset();
      router.refresh();
    } catch (error) {
      setMessage(error.message || "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-panel">
      {allowed ? (
        <>
          <div className="admin-session">
            <span>관리자 계정으로 로그인됨</span>
            <button onClick={logout} disabled={busy}>
              로그아웃
            </button>
          </div>
          <form onSubmit={submit} className="activity-form">
            <label>
              활동 제목
              <input name="title" required minLength={2} maxLength={140} />
            </label>
            <label>
              요약
              <textarea
                name="summary"
                required
                minLength={5}
                maxLength={500}
                rows={4}
              />
            </label>
            <div className="form-grid">
              <label>
                활동 날짜
                <input name="date" type="date" required />
              </label>
              <label>
                분야
                <select name="category">
                  {[
                    "Development",
                    "CTF & Wargame",
                    "Research & Conference",
                    "Bug Bounty",
                    "전공 학습 & 멘토링",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              원문 링크 (HTTPS)
              <input
                name="url"
                type="url"
                pattern="https://.*"
                required
                maxLength={2048}
              />
            </label>
            <label>
              태그 (쉼표로 구분, 최대 8개)
              <input
                name="tags"
                placeholder="Python, Forensics"
                maxLength={320}
              />
            </label>
            <button className="button dark" disabled={busy}>
              {busy ? "저장 중…" : "활동 게시하기"}
            </button>
          </form>
        </>
      ) : (
        <div className="setup-notice">
          <h2>
            관리자 로그인
          </h2>
          <p>
            등록된 GitHub 계정의 고유 ID를 서버에서 확인합니다. 다른 계정은
            활동을 게시할 수 없습니다.
          </p>
          {(
            <button className="button dark" onClick={login} disabled={busy}>
              <KeyRound size={18} />
              {busy ? "연결 중…" : "GitHub로 로그인"}
              <ArrowUpRight size={16} />
            </button>
          )}
        </div>
      )}
      <p role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
