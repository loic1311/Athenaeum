-- ATHENAEUM V1.0.11
-- Split heavy Scriptorium records out of public.athenaeum_state.
-- This migration has already been applied to the configured Athenaeum Supabase project.

create table if not exists public.athenaeum_scriptorium_works (
  user_id uuid not null references auth.users(id) on delete cascade,
  work_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, work_id)
);

create table if not exists public.athenaeum_scriptorium_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  setting_key text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, setting_key)
);

alter table public.athenaeum_scriptorium_works enable row level security;
alter table public.athenaeum_scriptorium_settings enable row level security;

drop policy if exists "scriptorium works select own" on public.athenaeum_scriptorium_works;
drop policy if exists "scriptorium works insert own" on public.athenaeum_scriptorium_works;
drop policy if exists "scriptorium works update own" on public.athenaeum_scriptorium_works;
drop policy if exists "scriptorium works delete own" on public.athenaeum_scriptorium_works;
create policy "scriptorium works select own" on public.athenaeum_scriptorium_works for select using (auth.uid()=user_id);
create policy "scriptorium works insert own" on public.athenaeum_scriptorium_works for insert with check (auth.uid()=user_id);
create policy "scriptorium works update own" on public.athenaeum_scriptorium_works for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "scriptorium works delete own" on public.athenaeum_scriptorium_works for delete using (auth.uid()=user_id);

drop policy if exists "scriptorium settings select own" on public.athenaeum_scriptorium_settings;
drop policy if exists "scriptorium settings insert own" on public.athenaeum_scriptorium_settings;
drop policy if exists "scriptorium settings update own" on public.athenaeum_scriptorium_settings;
drop policy if exists "scriptorium settings delete own" on public.athenaeum_scriptorium_settings;
create policy "scriptorium settings select own" on public.athenaeum_scriptorium_settings for select using (auth.uid()=user_id);
create policy "scriptorium settings insert own" on public.athenaeum_scriptorium_settings for insert with check (auth.uid()=user_id);
create policy "scriptorium settings update own" on public.athenaeum_scriptorium_settings for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "scriptorium settings delete own" on public.athenaeum_scriptorium_settings for delete using (auth.uid()=user_id);

insert into public.athenaeum_scriptorium_works(user_id,work_id,payload,updated_at)
select s.user_id,w->>'id',w,
       case when coalesce((w->>'updated_at')::bigint,0)>0
            then to_timestamp(((w->>'updated_at')::bigint)/1000.0)
            else s.updated_at end
from public.athenaeum_state s
cross join lateral jsonb_array_elements(coalesce(s.payload->'scriptorium'->'works','[]'::jsonb)) w
where nullif(w->>'id','') is not null
on conflict (user_id,work_id) do update
set payload=excluded.payload,
    updated_at=greatest(public.athenaeum_scriptorium_works.updated_at,excluded.updated_at);

insert into public.athenaeum_scriptorium_settings(user_id,setting_key,payload,updated_at)
select s.user_id,st->>'key',st,
       case when coalesce((st->>'updated_at')::bigint,0)>0
            then to_timestamp(((st->>'updated_at')::bigint)/1000.0)
            else s.updated_at end
from public.athenaeum_state s
cross join lateral jsonb_array_elements(coalesce(s.payload->'scriptorium'->'settings','[]'::jsonb)) st
where nullif(st->>'key','') is not null
on conflict (user_id,setting_key) do update
set payload=excluded.payload,
    updated_at=greatest(public.athenaeum_scriptorium_settings.updated_at,excluded.updated_at);

update public.athenaeum_state
set payload=payload-'scriptorium',updated_at=now()
where payload?'scriptorium';

create or replace function public.athenaeum_strip_heavy_scriptorium()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
begin
  if new.payload?'scriptorium' then
    new.payload:=new.payload-'scriptorium';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_athenaeum_strip_heavy_scriptorium on public.athenaeum_state;
create trigger trg_athenaeum_strip_heavy_scriptorium
before insert or update of payload on public.athenaeum_state
for each row execute function public.athenaeum_strip_heavy_scriptorium();

grant select,insert,update,delete on public.athenaeum_scriptorium_works to authenticated;
grant select,insert,update,delete on public.athenaeum_scriptorium_settings to authenticated;

notify pgrst,'reload schema';
