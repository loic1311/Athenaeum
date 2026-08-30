-- Athenaeum V1.0.3 — minimale synchronisatieherstelling
-- Voer DIT bestand eerst volledig uit in Supabase > SQL Editor.
-- Het gebruikt geen pg_cron of pg_net en kan dus niet daarop vastlopen.

create table if not exists public.athenaeum_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_key text not null default 'main',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, profile_key)
);

alter table public.athenaeum_state enable row level security;

-- Zorg dat de browserclient de tabel via de Data API mag aanspreken.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.athenaeum_state to authenticated;

drop policy if exists "state select own" on public.athenaeum_state;
drop policy if exists "state insert own" on public.athenaeum_state;
drop policy if exists "state update own" on public.athenaeum_state;
drop policy if exists "state delete own" on public.athenaeum_state;

create policy "state select own"
on public.athenaeum_state
for select
to authenticated
using (auth.uid() = user_id);

create policy "state insert own"
on public.athenaeum_state
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "state update own"
on public.athenaeum_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "state delete own"
on public.athenaeum_state
for delete
to authenticated
using (auth.uid() = user_id);

-- Vraag PostgREST expliciet om het schema opnieuw in te lezen.
notify pgrst, 'reload schema';

-- Controle: deze query moet exact één regel teruggeven met tabelnaam athenaeum_state.
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'athenaeum_state';
