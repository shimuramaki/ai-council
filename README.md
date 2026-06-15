# AI Council

1つの質問を **ChatGPT・Gemini・Claude** に2ラウンドで審議させ、最後に Claude が最終結論をまとめる。

## 審議フロー

1. **1ラウンド目** — 3つのAIが独立して回答
2. **2ラウンド目** — 各AIに他2つの回答を見せ、再考させる
3. **最終結論** — 2ラウンド目の回答をもとに Claude が統合

## セットアップ

1. 依存インストール
   ```bash
   npm install
   ```

2. 環境変数
   ```bash
   cp .env.local.example .env.local
   ```
   - `OPENROUTER_API_KEY` — 必須
   - `SUPABASE_URL` + `SUPABASE_ANON_KEY` — 履歴保存用（任意）

3. Supabase テーブル（履歴保存する場合）
   - 新規: `supabase/schema.sql` を SQL Editor で実行
   - 既存DB: 追加で `supabase/migrations/002_add_rounds.sql` を実行

4. 起動
   ```bash
   npm run dev
   ```
   → http://localhost:3000
