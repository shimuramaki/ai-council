import { createSupabaseClient } from "@/lib/supabase";
import type { CouncilModelKey } from "@/lib/models";

export type ModelResult = { text: string } | { error: string };

export type CouncilResponse = {
  id?: string;
  question: string;
  responses: Record<CouncilModelKey, ModelResult>;
  summary: ModelResult;
  created_at?: string;
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
  return {
    id: row.id,
    question: row.question,
    responses: {
      gpt: textToResult(row.response_gpt),
      gemini: textToResult(row.response_gemini),
      claude: textToResult(row.response_claude),
    },
    summary: textToResult(row.summary),
    created_at: row.created_at,
  };
}

export async function saveCouncilHistory(
  question: string,
  responses: Record<CouncilModelKey, ModelResult>,
  summary: ModelResult
): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("council_history")
    .insert({
      question,
      response_gpt: resultToText(responses.gpt),
      response_gemini: resultToText(responses.gemini),
      response_claude: resultToText(responses.claude),
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
    .select("id, question, response_gpt, response_gemini, response_claude, summary, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Failed to get history:", error?.message);
    return null;
  }

  return rowToCouncilResponse(data);
}
