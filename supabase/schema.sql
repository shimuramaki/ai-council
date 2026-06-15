-- AI Council の質問・回答履歴テーブル
-- Supabase ダッシュボード → SQL Editor でこの内容を実行してください

create table if not exists public.council_history (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  response_gpt text,
  response_gemini text,
  response_claude text,
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists council_history_created_at_idx
  on public.council_history (created_at desc);

alter table public.council_history enable row level security;

-- 匿名ユーザーでも読み書きできる（ログイン機能なしのため）
create policy "Allow public insert on council_history"
  on public.council_history
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow public select on council_history"
  on public.council_history
  for select
  to anon, authenticated
  using (true);
