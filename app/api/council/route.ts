import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openrouter";
import { MODELS, SUMMARIZER_MODEL, type CouncilModelKey } from "@/lib/models";
import { COUNCIL_SYSTEM_PROMPT } from "@/lib/prompts";
import { saveCouncilHistory, type ModelResult } from "@/lib/history";

function buildSummaryPrompt(
  question: string,
  responses: Record<CouncilModelKey, ModelResult>
): string {
  const format = (key: CouncilModelKey) => {
    const r = responses[key];
    return "error" in r ? `[エラー] ${r.error}` : r.text;
  };

  return `以下は同じ質問に対する3つのAIモデルの回答です。

## 質問
${question}

## ChatGPT (${MODELS.gpt.id}) の回答
${format("gpt")}

## Gemini (${MODELS.gemini.id}) の回答
${format("gemini")}

## Claude (${MODELS.claude.id}) の回答
${format("claude")}

---

上記3つの意見を踏まえ、共通点・相違点を整理し、実用的な結論をまとめてください。
日本語で回答してください。`;
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "質問を入力してください" }, { status: 400 });
    }

    const trimmed = question.trim();
    const userMessage = { role: "user" as const, content: trimmed };
    const councilMessages = [
      { role: "system" as const, content: COUNCIL_SYSTEM_PROMPT },
      userMessage,
    ];

    const [gpt, gemini, claude] = await Promise.all([
      chatCompletion(MODELS.gpt.id, councilMessages),
      chatCompletion(MODELS.gemini.id, councilMessages),
      chatCompletion(MODELS.claude.id, councilMessages),
    ]);

    const responses = { gpt, gemini, claude };

    const summary = await chatCompletion(SUMMARIZER_MODEL, [
      { role: "system", content: COUNCIL_SYSTEM_PROMPT },
      { role: "user", content: buildSummaryPrompt(trimmed, responses) },
    ]);

    const historyId = await saveCouncilHistory(trimmed, responses, summary);

    return NextResponse.json({
      question: trimmed,
      responses,
      summary,
      historyId,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
