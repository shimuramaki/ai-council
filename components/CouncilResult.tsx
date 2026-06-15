import type { CouncilResponse } from "@/lib/history";
import { MarkdownContent } from "@/components/MarkdownContent";
import { CouncilRoundSection } from "@/components/CouncilRoundSection";

function resultText(r: CouncilResponse["summary"]): string {
  return "error" in r ? r.error : r.text;
}

function isError(r: CouncilResponse["summary"]): boolean {
  return "error" in r;
}

type Props = {
  result: CouncilResponse;
};

export function CouncilResult({ result }: Props) {
  return (
    <>
      <section className="question-box">
        <span className="label">質問</span>
        <p>{result.question}</p>
      </section>

      <CouncilRoundSection title="1ラウンド目" round={result.round1} status="done" />

      {result.round2 && (
        <CouncilRoundSection title="2ラウンド目（再考）" round={result.round2} status="done" />
      )}

      <section className="summary">
        <header className="summary-head">
          <h2>最終結論</h2>
          <span className="model-id">
            {result.round2
              ? "2ラウンド目の回答をもとに Claude が統合"
              : "Claude Opus 4.6 が3つの意見を統合"}
          </span>
        </header>
        <div className={"summary-body" + (isError(result.summary) ? " err" : "")}>
          {isError(result.summary) ? (
            resultText(result.summary)
          ) : (
            <MarkdownContent content={resultText(result.summary)} />
          )}
        </div>
      </section>
    </>
  );
}
