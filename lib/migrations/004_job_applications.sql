-- ================================================================
-- 004: job_applications
-- شغّل هذا السكريبت في Supabase SQL Editor
-- آمن للتشغيل أكثر من مرة
-- ================================================================

create table if not exists public.job_applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  -- Job info (stored from external source)
  job_title       text not null,
  company         text not null,
  job_location    text,
  job_url         text,
  job_description text,
  -- AI-generated application package
  cover_letter    text,
  qa_answers      jsonb,        -- [{question, answer}]
  email_subject   text,
  email_body      text,
  linkedin_message text,
  -- Status tracking
  status          text not null default 'prepared'
                    check (status in ('prepared', 'emailed', 'applied', 'interview', 'rejected')),
  notes           text,
  applied_at      timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.job_applications enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'job_applications' and policyname = 'job_applications: select own'
  ) then
    execute 'create policy "job_applications: select own" on public.job_applications for select using (auth.uid() = user_id)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'job_applications' and policyname = 'job_applications: insert own'
  ) then
    execute 'create policy "job_applications: insert own" on public.job_applications for insert with check (auth.uid() = user_id)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'job_applications' and policyname = 'job_applications: update own'
  ) then
    execute 'create policy "job_applications: update own" on public.job_applications for update using (auth.uid() = user_id)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'job_applications' and policyname = 'job_applications: delete own'
  ) then
    execute 'create policy "job_applications: delete own" on public.job_applications for delete using (auth.uid() = user_id)';
  end if;
end $$;

-- Auto-update updated_at
drop trigger if exists job_applications_set_updated_at on public.job_applications;
create trigger job_applications_set_updated_at
  before update on public.job_applications
  for each row execute procedure public.set_updated_at();
