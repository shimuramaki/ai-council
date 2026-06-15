import { NextRequest } from "next/server";
import { chatCompletion } from "@/lib/openrouter";
import { MODELS, SUMMARIZER_MODEL, MODEL_KEYS, type CouncilModelKey } from "@/lib/models";
import { COUNCIL_SYSTEM_PROMPT, buildRound2Messages, buildSummaryPrompt } from "@/lib/prompts";
import { saveCouncilHistory, type ModelResult } from "@/lib/history";
import type { CouncilStreamEvent } from "@/lib/types";

async function runRound1(question: string): Promise<Record<CouncilModelKey, ModelResult>> {
  const messages = [
    { role: "system" as const, content: COUNCIL_SYSTEM_PROMPT },
    { role: "user" as const, content: question },
  ];

  const results = await Promise.all(
    MODEL_KEYS.map((key) => chatCompletion(MODELS[key].id, messages))
  );

  return Object.fromEntries(MODEL_KEYS.map((key, i) => [key, results[i]])) as Record<
    CouncilModelKey,
    ModelResult
  >;
}

async function runRound2(
  question: string,
  round1Responses: Record<CouncilModelKey, ModelResult>
): Promise<Record<CouncilModelKey, ModelResult>> {
  const results = await Promise.all(
    MODEL_KEYS.map((key) =>
      chatCompletion(MODELS[key].id, buildRound2Messages(question, key, round1Responses))
    )
  );

  return Object.fromEntries(MODEL_KEYS.map((key, i) => [key, results[i]])) as Record<
    CouncilModelKey,
    ModelResult
  >;
}

function encodeEvent(event: CouncilStreamEvent): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(event) + "\n");
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: "質問を入力してください" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const trimmed = question.trim();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: CouncilStreamEvent) => {
          controller.enqueue(encodeEvent(event));
        };

        try {
          send({ phase: "round1", status: "processing" });
          const round1Responses = await runRound1(trimmed);
          send({ phase: "round1", status: "complete", responses: round1Responses });

          send({ phase: "round2", status: "processing" });
          const round2Responses = await runRound2(trimmed, round1Responses);
          send({ phase: "round2", status: "complete", responses: round2Responses });

          send({ phase: "summary", status: "processing" });
          const summary = await chatCompletion(SUMMARIZER_MODEL, [
            { role: "system", content: COUNCIL_SYSTEM_PROMPT },
            { role: "user", content: buildSummaryPrompt(trimmed, round2Responses) },
          ]);

          const historyId = await saveCouncilHistory(
            trimmed,
            { roundNumber: 1, responses: round1Responses },
            { roundNumber: 2, responses: round2Responses },
            summary
          );

          send({
            phase: "complete",
            question: trimmed,
            round1: { roundNumber: 1, responses: round1Responses },
            round2: { roundNumber: 2, responses: round2Responses },
            summary,
            historyId: historyId ?? undefined,
          });
        } catch (e) {
          send({ phase: "error", error: String(e) });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
