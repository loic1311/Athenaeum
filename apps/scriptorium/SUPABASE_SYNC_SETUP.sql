-- Scriptorium v6 optional cloud sync
create table if not exists public.scriptorium_sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.scriptorium_sync enable row level security;

drop policy if exists "read own scriptorium" on public.scriptorium_sync;
drop policy if exists "insert own scriptorium" on public.scriptorium_sync;
drop policy if exists "update own scriptorium" on public.scriptorium_sync;

create policy "read own scriptorium"
on public.scriptorium_sync for select
using (auth.uid() = user_id);

create policy "insert own scriptorium"
on public.scriptorium_sync for insert
with check (auth.uid() = user_id);

create policy "update own scriptorium"
on public.scriptorium_sync for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
