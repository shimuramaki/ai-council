import type { CouncilModelKey } from "./models";
import type { ModelResult, CouncilRound } from "./history";

export type CouncilPhase = "round1" | "round2" | "summary" | "complete" | "error";

export type CouncilStreamEvent =
  | { phase: "round1"; status: "processing" }
  | { phase: "round1"; status: "complete"; responses: Record<CouncilModelKey, ModelResult> }
  | { phase: "round2"; status: "processing" }
  | { phase: "round2"; status: "complete"; responses: Record<CouncilModelKey, ModelResult> }
  | { phase: "summary"; status: "processing" }
  | {
      phase: "complete";
      question: string;
      round1: CouncilRound;
      round2: CouncilRound;
      summary: ModelResult;
      historyId?: string;
    }
  | { phase: "error"; error: string };
