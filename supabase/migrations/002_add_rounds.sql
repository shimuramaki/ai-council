-- 既存の council_history テーブルに2ラウンド用カラムを追加
-- Supabase ダッシュボード → SQL Editor で実行してください

alter table public.council_history add column if not exists round1_gpt text;
alter table public.council_history add column if not exists round1_gemini text;
alter table public.council_history add column if not exists round1_claude text;
alter table public.council_history add column if not exists round2_gpt text;
alter table public.council_history add column if not exists round2_gemini text;
alter table public.council_history add column if not exists round2_claude text;

-- 旧データ（1ラウンドのみ）を round1 に移行
update public.council_history
set
  round1_gpt = response_gpt,
  round1_gemini = response_gemini,
  round1_claude = response_claude
where round1_gpt is null
  and (response_gpt is not null or response_gemini is not null or response_claude is not null);
