import { MODELS, type CouncilModelKey } from "@/lib/models";
import type { CouncilResponse } from "@/lib/history";
import { MarkdownContent } from "@/components/MarkdownContent";

const MODEL_KEYS: CouncilModelKey[] = ["gpt", "gemini", "claude"];

function resultText(r: CouncilResponse["responses"]["gpt"] | CouncilResponse["summary"]): string {
  return "error" in r ? r.error : r.text;
}

function isError(r: CouncilResponse["responses"]["gpt"] | CouncilResponse["summary"]): boolean {
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

      <section className="summary">
        <header className="summary-head">
          <h2>結論</h2>
          <span className="model-id">Claude Opus 4.6 が3つの意見を統合</span>
        </header>
        <div className={"summary-body" + (isError(result.summary) ? " err" : "")}>
          {isError(result.summary) ? (
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
                {isError(response) ? (
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
  );
}
