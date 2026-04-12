-- إنشاء جدول waitlist
create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  phone       text not null,
  role        text not null check (role in ('job_seeker', 'recruiter')),
  created_at  timestamptz default now(),
  ip_hash     text,
  source      text default 'landing_page'
);

-- تفعيل RLS
alter table waitlist enable row level security;

-- السماح بـ INSERT فقط للـ anon (بدون قراءة أو تعديل)
create policy "insert_only"
  on waitlist for insert
  to anon
  with check (true);
