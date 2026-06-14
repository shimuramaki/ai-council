const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function chatCompletion(
  model: string,
  messages: ChatMessage[]
): Promise<{ text: string } | { error: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { error: "OPENROUTER_API_KEY が設定されていません (.env.local を確認)" };
  }

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Council",
      },
      body: JSON.stringify({ model, messages }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error?.message ?? `API error (${res.status})` };
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      return { error: "(応答なし)" };
    }

    return { text };
  } catch (e) {
    return { error: String(e) };
  }
}
