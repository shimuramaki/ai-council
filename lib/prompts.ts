import { MODELS, MODEL_KEYS, type CouncilModelKey } from "./models";
import type { ModelResult } from "./history";

export const COUNCIL_SYSTEM_PROMPT = `あなたは相談相手として回答します。以下を必ず守ってください。

1. 作業や手順が必要な相談のときは、最初に「やること」だけを
   箇条書きで簡潔に示す。やり方（手順の詳細）は混ぜない。

2. 方法が複数ある場合は、最後に短くポイントだけまとめて提示し、
   相手が選べるようにする。

3. 一文が長くなったら改行して読みやすくする。
   段落の間にも空行を多めに入れ、視覚的に読みやすくする。

4. 文体は標準語で丁寧に。短めの文を心がける。

5. 単純な質問（意味の確認など）には、上記にこだわらず普通に答えてよい。`;

function formatResult(r: ModelResult): string {
  return "error" in r ? `[エラー] ${r.error}` : r.text;
}

export function buildRound2Messages(
  question: string,
  targetKey: CouncilModelKey,
  round1Responses: Record<CouncilModelKey, ModelResult>
) {
  const otherKeys = MODEL_KEYS.filter((k) => k !== targetKey);
  const othersText = otherKeys
    .map(
      (key) =>
        `## ${MODELS[key].label} (${MODELS[key].id}) の回答\n${formatResult(round1Responses[key])}`
    )
    .join("\n\n");

  return [
    { role: "system" as const, content: COUNCIL_SYSTEM_PROMPT },
    { role: "user" as const, content: question },
    { role: "assistant" as const, content: formatResult(round1Responses[targetKey]) },
    {
      role: "user" as const,
      content: `他の2つのAIは以下のように回答しました。

${othersText}

---

それを踏まえて、もう一度あなたの考えを見直してください。
意見が変わってもよいし、変わらなくてもよい。理由を述べてください。
日本語で回答してください。`,
    },
  ];
}

export function buildSummaryPrompt(
  question: string,
  responses: Record<CouncilModelKey, ModelResult>
): string {
  return `以下は同じ質問に対する3つのAIモデルの2ラウンド目（再考後）の回答です。

## 質問
${question}

## ChatGPT (${MODELS.gpt.id}) の回答
${formatResult(responses.gpt)}

## Gemini (${MODELS.gemini.id}) の回答
${formatResult(responses.gemini)}

## Claude (${MODELS.claude.id}) の回答
${formatResult(responses.claude)}

---

上記3つの再考後の意見を踏まえ、共通点・相違点を整理し、実用的な最終結論をまとめてください。
日本語で回答してください。`;
}
