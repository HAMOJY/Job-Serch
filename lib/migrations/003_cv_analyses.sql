-- ================================================================
-- 003_cv_analyses.sql
-- Run manually in Supabase Dashboard → SQL Editor
-- PREREQUISITE: 002_auth_profiles.sql must be applied first
-- PREREQUISITE: Create storage bucket 'cvs' (private) in Dashboard
--               Storage → Buckets → New bucket → name: cvs → Private
-- ================================================================

-- Table
create table public.cv_analyses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  filename        text not null,
  file_path       text not null,
  score           integer not null check (score between 0 and 100),
  categories      jsonb not null,
  recommendations jsonb not null,
  status          text not null default 'done'
                    check (status in ('done', 'error')),
  error_msg       text,
  created_at      timestamptz default now()
);

-- RLS
alter table public.cv_analyses enable row level security;

create policy "cv_analyses: select own"
  on public.cv_analyses for select
  using (auth.uid() = user_id);

create policy "cv_analyses: insert own"
  on public.cv_analyses for insert
  with check (auth.uid() = user_id);

-- Storage bucket RLS (bucket 'cvs' must already exist)
create policy "cvs: upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "cvs: read own"
  on storage.objects for select
  using (
    bucket_id = 'cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
