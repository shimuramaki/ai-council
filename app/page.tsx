"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CouncilResult } from "@/components/CouncilResult";
import { CouncilRoundSection } from "@/components/CouncilRoundSection";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { CouncilResponse, CouncilRound, ModelResult } from "@/lib/history";
import type { CouncilStreamEvent, CouncilPhase } from "@/lib/types";

type ProcessingPhase = CouncilPhase | "idle";

const PHASE_LABELS: Record<Exclude<ProcessingPhase, "idle" | "complete" | "error">, string> = {
  round1: "1ラウンド目 — 3つのAIが独立して回答中…",
  round2: "2ラウンド目 — 他AIの回答を踏まえて再考中…",
  summary: "最終結論をまとめ中…",
};

function resultText(r: ModelResult | null): string {
  if (!r) return "";
  return "error" in r ? r.error : r.text;
}

function isError(r: ModelResult | null): boolean {
  return !!r && "error" in r;
}

function roundStatus(
  phase: ProcessingPhase,
  roundPhase: "round1" | "round2",
  round: CouncilRound | null
): "waiting" | "processing" | "done" {
  if (round) return "done";
  if (phase === roundPhase) return "processing";
  const order = ["idle", "round1", "round2", "summary", "complete", "error"] as const;
  const phaseIdx = order.indexOf(phase as (typeof order)[number]);
  const roundIdx = order.indexOf(roundPhase);
  if (phaseIdx > roundIdx) return "done";
  return "waiting";
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<ProcessingPhase>("idle");
  const [result, setResult] = useState<CouncilResponse | null>(null);
  const [round1, setRound1] = useState<CouncilRound | null>(null);
  const [round2, setRound2] = useState<CouncilRound | null>(null);
  const [summary, setSummary] = useState<ModelResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleStreamEvent(event: CouncilStreamEvent) {
    switch (event.phase) {
      case "round1":
        setPhase("round1");
        if (event.status === "complete") {
          setRound1({ roundNumber: 1, responses: event.responses });
        }
        break;
      case "round2":
        setPhase("round2");
        if (event.status === "complete") {
          setRound2({ roundNumber: 2, responses: event.responses });
        }
        break;
      case "summary":
        setPhase("summary");
        break;
      case "complete":
        setPhase("complete");
        setRound1(event.round1);
        setRound2(event.round2);
        setSummary(event.summary);
        setResult({
          question: event.question,
          round1: event.round1,
          round2: event.round2,
          summary: event.summary,
          historyId: event.historyId,
        });
        break;
      case "error":
        setPhase("error");
        setError(event.error);
        break;
    }
  }

  async function ask() {
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setRound1(null);
    setRound2(null);
    setSummary(null);
    setPhase("round1");

    try {
      const res = await fetch("/api/council", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "リクエストに失敗しました");
        setPhase("error");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("ストリームの読み取りに失敗しました");
        setPhase("error");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          handleStreamEvent(JSON.parse(line) as CouncilStreamEvent);
        }
      }

      if (buffer.trim()) {
        handleStreamEvent(JSON.parse(buffer) as CouncilStreamEvent);
      }
    } catch {
      setError("通信エラーが起きました。もう一度試してください。");
      setPhase("error");
    } finally {
      setLoading(false);
    }
  }

  const showLive = loading || result || round1 || round2 || summary;
  const questionText = result?.question ?? input.trim();

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

      {loading && phase !== "idle" && phase !== "complete" && phase !== "error" && (
        <div className="status-bar">
          <span className="status-dot" />
          {PHASE_LABELS[phase]}
        </div>
      )}

      {error && <div className="banner error">{error}</div>}

      {showLive && !result && (
        <>
          <section className="question-box">
            <span className="label">質問</span>
            <p>{questionText}</p>
          </section>

          <CouncilRoundSection
            title="1ラウンド目"
            round={round1}
            status={roundStatus(phase, "round1", round1)}
          />

          <CouncilRoundSection
            title="2ラウンド目（再考）"
            round={round2}
            status={roundStatus(phase, "round2", round2)}
          />

          {(summary || phase === "summary") && (
            <section className="summary">
              <header className="summary-head">
                <h2>最終結論</h2>
                <span className="model-id">2ラウンド目の回答をもとに Claude が統合</span>
              </header>
              <div className={"summary-body" + (isError(summary) ? " err" : "")}>
                {phase === "summary" && !summary ? (
                  <div className="typing">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : isError(summary) ? (
                  resultText(summary)
                ) : summary ? (
                  <MarkdownContent content={resultText(summary)} />
                ) : null}
              </div>
            </section>
          )}
        </>
      )}

      {result && (
        <>
          <CouncilResult result={result} />
          {result.historyId && (
            <p className="saved-note">履歴に保存しました</p>
          )}
        </>
      )}

      {!showLive && !loading && !error && (
        <section className="empty">
          <p className="lead">1つの質問を、2ラウンドで深く。</p>
          <p className="sub">
            1ラウンド目: ChatGPT · Gemini · Claude が独立して回答。
            <br />
            2ラウンド目: 他AIの意見を見て再考。
            <br />
            最後に Claude が最終結論をまとめます。
          </p>
        </section>
      )}
    </main>
  );
}
