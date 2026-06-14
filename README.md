# AI Council

1つの質問を **ChatGPT・Gemini・Claude** に同時送信し、3つの回答を横並びで表示。最後に Claude が3つの意見を統合した結論を出す。

## 構成

```
app/
  page.tsx              ← 3列UI + 結論表示
  layout.tsx
  api/
    council/route.ts    ← 3モデル並列 → Claude でまとめ
lib/
  models.ts             ← モデルID定義
  openrouter.ts         ← OpenRouter fetch 共通処理
```

## 使うモデル（OpenRouter）

| 役割 | モデル ID |
|------|-----------|
| ChatGPT | `openai/gpt-5.4` |
| Gemini | `google/gemini-3.1-pro-preview` |
| Claude | `anthropic/claude-opus-4.6` |
| まとめ役 | `anthropic/claude-opus-4.6` |

## セットアップ

1. 依存インストール
   ```bash
   npm install
   ```

2. 環境変数
   ```bash
   cp .env.local.example .env.local
   ```
   `.env.local` に `OPENROUTER_API_KEY` を設定（[openrouter.ai](https://openrouter.ai) で発行）

3. 起動
   ```bash
   npm run dev
   ```
   → http://localhost:3000

## 動作フロー

1. ユーザーが質問を入力して送信
2. `/api/council` が OpenRouter 経由で3モデルに `Promise.all` で同時リクエスト
3. 3つの回答を Claude に渡し、統合結論を生成
4. フロントで3列 + 結論を表示
