-- ================================================================
-- fix_all_idempotent.sql
-- شغّل هذا السكريبت كاملاً في Supabase SQL Editor
-- آمن للتشغيل أكثر من مرة — يتجاهل ما هو موجود مسبقاً
-- ================================================================

-- ════════════════════════════════════════
-- 001: waitlist
-- ════════════════════════════════════════

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  phone       text not null,
  role        text not null check (role in ('job_seeker', 'recruiter')),
  created_at  timestamptz default now(),
  ip_hash     text,
  source      text default 'landing_page'
);

alter table public.waitlist enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'waitlist' and policyname = 'insert_only'
  ) then
    execute 'create policy "insert_only" on public.waitlist for insert to anon with check (true)';
  end if;
end $$;

-- ════════════════════════════════════════
-- 002: profiles
-- ════════════════════════════════════════

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  phone         text,
  role          text not null check (role in ('job_seeker', 'recruiter')),
  avatar_url    text,
  bio           text,
  location      text,
  job_title     text,
  linkedin_url  text,
  github_url    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'profiles: select own'
  ) then
    execute 'create policy "profiles: select own" on public.profiles for select using (auth.uid() = id)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'profiles: update own'
  ) then
    execute 'create policy "profiles: update own" on public.profiles for update using (auth.uid() = id)';
  end if;
end $$;

-- trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'job_seeker')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- trigger: keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ════════════════════════════════════════
-- 003: cv_analyses
-- ════════════════════════════════════════

create table if not exists public.cv_analyses (
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

alter table public.cv_analyses enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'cv_analyses' and policyname = 'cv_analyses: select own'
  ) then
    execute 'create policy "cv_analyses: select own" on public.cv_analyses for select using (auth.uid() = user_id)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'cv_analyses' and policyname = 'cv_analyses: insert own'
  ) then
    execute 'create policy "cv_analyses: insert own" on public.cv_analyses for insert with check (auth.uid() = user_id)';
  end if;
end $$;

-- Storage policies (bucket 'cvs' يجب أن يكون موجوداً مسبقاً)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage' and policyname = 'cvs: upload own'
  ) then
    execute $policy$
      create policy "cvs: upload own"
        on storage.objects for insert
        with check (
          bucket_id = 'cvs'
          and (storage.foldername(name))[1] = auth.uid()::text
        )
    $policy$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage' and policyname = 'cvs: read own'
  ) then
    execute $policy$
      create policy "cvs: read own"
        on storage.objects for select
        using (
          bucket_id = 'cvs'
          and (storage.foldername(name))[1] = auth.uid()::text
        )
    $policy$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage' and policyname = 'cvs: delete own'
  ) then
    execute $policy$
      create policy "cvs: delete own"
        on storage.objects for delete
        using (
          bucket_id = 'cvs'
          and (storage.foldername(name))[1] = auth.uid()::text
        )
    $policy$;
  end if;
end $$;

-- Enforce one-analysis-per-user at DB level (prevents race condition)
create unique index if not exists cv_analyses_one_per_user
  on public.cv_analyses (user_id)
  where status = 'done';
