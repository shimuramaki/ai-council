import { MODELS, MODEL_KEYS, type CouncilModelKey } from "@/lib/models";
import type { CouncilRound } from "@/lib/history";
import type { ModelResult } from "@/lib/history";
import { MarkdownContent } from "@/components/MarkdownContent";

function resultText(r: ModelResult | undefined): string {
  if (!r) return "";
  return "error" in r ? r.error : r.text;
}

function isError(r: ModelResult | undefined): boolean {
  return !!r && "error" in r;
}

type RoundStatus = "waiting" | "processing" | "done";

type Props = {
  title: string;
  round: CouncilRound | null;
  status: RoundStatus;
};

export function CouncilRoundSection({ title, round, status }: Props) {
  return (
    <section className="round-section">
      <header className="round-head">
        <h3 className="round-title">{title}</h3>
        <span className={"round-badge" + (status === "processing" ? " active" : status === "done" ? " done" : "")}>
          {status === "processing" ? "処理中" : status === "done" ? "完了" : "待機中"}
        </span>
      </header>
      <div className="columns">
        {MODEL_KEYS.map((key) => {
          const model = MODELS[key];
          const response = round?.responses[key];
          return (
            <article key={key} className="column">
              <header className="col-head">
                <h2>{model.label}</h2>
                <span className="model-id">{model.subtitle}</span>
              </header>
              <div className={"col-body" + (isError(response) ? " err" : "")}>
                {status === "processing" && !response ? (
                  <div className="typing">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : isError(response) ? (
                  resultText(response)
                ) : response ? (
                  <MarkdownContent content={resultText(response)} />
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
