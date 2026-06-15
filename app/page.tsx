"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CouncilResult } from "@/components/CouncilResult";
import type { CouncilResponse } from "@/lib/history";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CouncilResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/council", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "リクエストに失敗しました");
        return;
      }

      setResult(data);
    } catch {
      setError("通信エラーが起きました。もう一度試してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <AppHeader active="home" />

      <section className="input-section">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask();
          }}
          placeholder="質問を入力… (⌘/Ctrl + Enter で送信)"
          rows={3}
          disabled={loading}
        />
        <button className="send" onClick={ask} disabled={loading || !input.trim()}>
          {loading ? "審議中…" : "Council に聞く"}
        </button>
      </section>

      {error && <div className="banner error">{error}</div>}

      {result && <CouncilResult result={result} />}

      {!result && !loading && !error && (
        <section className="empty">
          <p className="lead">1つの質問を、3つの視点で。</p>
          <p className="sub">
            ChatGPT · Gemini · Claude が同時に回答し、Claude が最終結論をまとめます。
          </p>
        </section>
      )}
    </main>
  );
}
