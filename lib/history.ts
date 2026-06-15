import { createSupabaseClient } from "@/lib/supabase";
import type { CouncilModelKey } from "@/lib/models";

export type ModelResult = { text: string } | { error: string };

export type CouncilRound = {
  roundNumber: 1 | 2;
  responses: Record<CouncilModelKey, ModelResult>;
};

export type CouncilResponse = {
  id?: string;
  question: string;
  round1: CouncilRound;
  round2?: CouncilRound;
  summary: ModelResult;
  created_at?: string;
  historyId?: string;
};

export type HistoryListItem = {
  id: string;
  question: string;
  created_at: string;
};

type HistoryRow = {
  id: string;
  question: string;
  response_gpt: string | null;
  response_gemini: string | null;
  response_claude: string | null;
  round1_gpt: string | null;
  round1_gemini: string | null;
  round1_claude: string | null;
  round2_gpt: string | null;
  round2_gemini: string | null;
  round2_claude: string | null;
  summary: string | null;
  created_at: string;
};

function resultToText(r: ModelResult): string {
  return "error" in r ? `[エラー] ${r.error}` : r.text;
}

function textToResult(text: string | null): ModelResult {
  if (!text) return { error: "(回答なし)" };
  if (text.startsWith("[エラー]")) return { error: text.slice("[エラー] ".length) };
  return { text };
}

function rowToCouncilResponse(row: HistoryRow): CouncilResponse {
  const hasRound2 = !!(row.round2_gpt || row.round2_gemini || row.round2_claude);

  const round1: CouncilRound = {
    roundNumber: 1,
    responses: {
      gpt: textToResult(row.round1_gpt ?? row.response_gpt),
      gemini: textToResult(row.round1_gemini ?? row.response_gemini),
      claude: textToResult(row.round1_claude ?? row.response_claude),
    },
  };

  const round2: CouncilRound | undefined = hasRound2
    ? {
        roundNumber: 2,
        responses: {
          gpt: textToResult(row.round2_gpt),
          gemini: textToResult(row.round2_gemini),
          claude: textToResult(row.round2_claude),
        },
      }
    : undefined;

  return {
    id: row.id,
    question: row.question,
    round1,
    round2,
    summary: textToResult(row.summary),
    created_at: row.created_at,
  };
}

export async function saveCouncilHistory(
  question: string,
  round1: CouncilRound,
  round2: CouncilRound,
  summary: ModelResult
): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("council_history")
    .insert({
      question,
      round1_gpt: resultToText(round1.responses.gpt),
      round1_gemini: resultToText(round1.responses.gemini),
      round1_claude: resultToText(round1.responses.claude),
      round2_gpt: resultToText(round2.responses.gpt),
      round2_gemini: resultToText(round2.responses.gemini),
      round2_claude: resultToText(round2.responses.claude),
      response_gpt: resultToText(round2.responses.gpt),
      response_gemini: resultToText(round2.responses.gemini),
      response_claude: resultToText(round2.responses.claude),
      summary: resultToText(summary),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to save history:", error.message);
    return null;
  }

  return data.id;
}

export async function listCouncilHistory(): Promise<HistoryListItem[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("council_history")
    .select("id, question, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list history:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCouncilHistory(id: string): Promise<CouncilResponse | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("council_history")
    .select(
      "id, question, response_gpt, response_gemini, response_claude, round1_gpt, round1_gemini, round1_claude, round2_gpt, round2_gemini, round2_claude, summary, created_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Failed to get history:", error?.message);
    return null;
  }

  return rowToCouncilResponse(data);
}
