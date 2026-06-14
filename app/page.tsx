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

      <style jsx>{`
        .wrap {
          max-width: 1200px;
          margin: 0 auto;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          font-family: "Hiragino Kaku Gothic ProN", system-ui, sans-serif;
          padding: 0 20px 40px;
        }
        .top {
          padding: 24px 0 20px;
          border-bottom: 1px solid #1f1f26;
        }
        .brand {
          font-weight: 700;
          font-size: 22px;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f4f4f6;
          margin: 0;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6b8afd, #a78bfa);
          box-shadow: 0 0 14px rgba(107, 138, 253, 0.55);
        }
        .tagline {
          margin: 6px 0 0 20px;
          color: #6f6f7a;
          font-size: 14px;
        }
        .input-section {
          display: flex;
          gap: 12px;
          padding: 20px 0;
          align-items: flex-start;
        }
        textarea {
          flex: 1;
          resize: vertical;
          min-height: 72px;
          background: #14141a;
          border: 1px solid #25252f;
          border-radius: 12px;
          padding: 14px 16px;
          color: #e6e6ec;
          font-size: 15px;
          font-family: inherit;
          line-height: 1.6;
          outline: none;
        }
        textarea:focus {
          border-color: #6b8afd;
        }
        textarea:disabled {
          opacity: 0.6;
        }
        .send {
          background: linear-gradient(135deg, #6b8afd, #a78bfa);
          color: #0a0a12;
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          white-space: nowrap;
        }
        .send:disabled {
          opacity: 0.45;
          cursor: default;
        }
        .banner {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .banner.error {
          background: #2a1518;
          border: 1px solid #5c2a32;
          color: #f0a0a8;
        }
        .question-box {
          background: #14141a;
          border: 1px solid #25252f;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 20px;
        }
        .label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6b8afd;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }
        .question-box p {
          margin: 0;
          color: #e6e6ec;
          line-height: 1.7;
          white-space: pre-wrap;
        }
        .columns {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .column {
          background: #0e0e13;
          border: 1px solid #25252f;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          min-height: 280px;
          overflow: hidden;
        }
        .col-head {
          padding: 14px 16px;
          border-bottom: 1px solid #1f1f26;
          background: #14141a;
        }
        .col-head h2 {
          margin: 0;
          font-size: 16px;
          color: #f4f4f6;
        }
        .model-id {
          font-size: 12px;
          color: #6f6f7a;
        }
        .col-body {
          flex: 1;
          padding: 16px;
          color: #d8d8e0;
          font-size: 14px;
          line-height: 1.75;
          overflow-y: auto;
        }
        .col-body.err {
          color: #f0a0a8;
          white-space: pre-wrap;
        }
        .summary {
          background: linear-gradient(180deg, #12121a 0%, #0e0e13 100%);
          border: 1px solid #3a3a5c;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .summary-head {
          padding: 16px 20px;
          border-bottom: 1px solid #2a2a40;
          background: rgba(107, 138, 253, 0.08);
        }
        .summary-head h2 {
          margin: 0;
          font-size: 18px;
          color: #c4d0ff;
        }
        .summary-body {
          padding: 20px;
          color: #e6e6ec;
          font-size: 15px;
          line-height: 1.8;
        }
        .summary-body.err {
          color: #f0a0a8;
          white-space: pre-wrap;
        }
        .empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 20px;
        }
        .lead {
          font-size: 26px;
          font-weight: 700;
          color: #f4f4f6;
          margin: 0;
        }
        .sub {
          color: #6f6f7a;
          margin: 10px 0 0;
          max-width: 480px;
          line-height: 1.6;
        }
        .typing span {
          display: inline-block;
          width: 7px;
          height: 7px;
          margin: 0 2px;
          border-radius: 50%;
          background: #6f6f7a;
          animation: blink 1.2s infinite both;
        }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
        @media (max-width: 900px) {
          .columns {
            grid-template-columns: 1fr;
          }
          .input-section {
            flex-direction: column;
          }
          .send {
            width: 100%;
          }
        }
      `}</style>
      <style jsx global>{`
        :root { color-scheme: dark; }
        body { margin: 0; background: #0a0a0e; }
      `}</style>
    </main>
  );
}
