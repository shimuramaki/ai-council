export const MODELS = {
  gpt: {
    id: "openai/gpt-5.4",
    label: "ChatGPT",
    subtitle: "GPT-5.4",
  },
  gemini: {
    id: "google/gemini-3.1-pro-preview",
    label: "Gemini",
    subtitle: "3.1 Pro Preview",
  },
  claude: {
    id: "anthropic/claude-opus-4.6",
    label: "Claude",
    subtitle: "Opus 4.6",
  },
} as const;

export const SUMMARIZER_MODEL = MODELS.claude.id;

export type CouncilModelKey = keyof typeof MODELS;

export const MODEL_KEYS: CouncilModelKey[] = ["gpt", "gemini", "claude"];
