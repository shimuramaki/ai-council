"use client";

import { useState } from "react";
import { MODELS, type CouncilModelKey } from "@/lib/models";
import { MarkdownContent } from "@/components/MarkdownContent";

type ModelResult = { text: string } | { error: string };

type CouncilResponse = {
  question: string;
  responses: Record<CouncilModelKey, ModelResult>;
  summary: ModelResult;
};

const MODEL_KEYS: CouncilModelKey[] = ["gpt", "gemini", "claude"];

function resultText(r: ModelResult | undefined): string {
  if (!r) return "";
  return "error" in r ? r.error : r.text;
}

function isError(r: ModelResult | undefined): boolean {
  return !!r && "error" in r;
}

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
      <header className="top">
        <div className="brand">
          <span className="dot" />
          AI Council
        </div>
        <p className="tagline">3つのAIに同時に聞き、Claudeが結論をまとめる</p>
      </header>

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

      {result && (
        <>
          <section className="question-box">
            <span className="label">質問</span>
            <p>{result.question}</p>
          </section>

          <section className="summary">
            <header className="summary-head">
              <h2>結論</h2>
              <span className="model-id">Claude Opus 4.6 が3つの意見を統合</span>
            </header>
            <div className={"summary-body" + (isError(result.summary) ? " err" : "")}>
              {loading && !result.summary ? (
                <div className="typing"><span /><span /><span /></div>
              ) : isError(result.summary) ? (
                resultText(result.summary)
              ) : (
                <MarkdownContent content={resultText(result.summary)} />
              )}
            </div>
          </section>

          <section className="columns">
            {MODEL_KEYS.map((key) => {
              const model = MODELS[key];
              const response = result.responses[key];
              return (
                <article key={key} className="column">
                  <header className="col-head">
                    <h2>{model.label}</h2>
                    <span className="model-id">{model.subtitle}</span>
                  </header>
                  <div className={"col-body" + (isError(response) ? " err" : "")}>
                    {loading && !response ? (
                      <div className="typing"><span /><span /><span /></div>
                    ) : isError(response) ? (
                      resultText(response)
                    ) : (
                      <MarkdownContent content={resultText(response)} />
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}

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
