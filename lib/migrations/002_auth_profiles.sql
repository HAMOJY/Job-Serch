-- ============================================================
-- Migration 002: profiles table + RLS + triggers
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Profiles table
create table public.profiles (
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

-- 2. Row Level Security
alter table public.profiles enable row level security;

create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'job_seeker')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
