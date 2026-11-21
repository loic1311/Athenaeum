create schema academy_private;
revoke all on schema academy_private from public, anon, authenticated;
grant usage on schema academy_private to authenticated;

create table public.athenaeum_learning (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_id text not null check (record_id ~ '^[a-zA-Z0-9/-]{1,160}$'),
  kind text not null check (kind in ('review', 'result', 'draft', 'deck', 'prefs', 'reset')),
  changed_ms bigint not null check (changed_ms > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 250000),
  saved_at timestamptz not null default clock_timestamp(),
  primary key (user_id, record_id)
);
create index athenaeum_learning_changes on public.athenaeum_learning (user_id, saved_at, record_id);

alter table public.athenaeum_learning enable row level security;
revoke all on public.athenaeum_learning from public, anon, authenticated;
grant select on public.athenaeum_learning to authenticated;
create policy "Read own learning records" on public.athenaeum_learning
  for select to authenticated using ((select auth.uid()) = user_id);

-- Writes go through private functions so that older devices cannot bypass the reset marker.
create function academy_private.save_learning(p_records jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  learner uuid := auth.uid();
  reset_ms bigint;
begin
  if learner is null then raise exception 'Account required'; end if;
  if p_records is null or jsonb_typeof(p_records) <> 'array' or octet_length(p_records::text) > 1000000 then
    raise exception 'Invalid learning records';
  end if;
  if jsonb_array_length(p_records) > 150 then raise exception 'Too many learning records'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(learner::text, 21031));
  select coalesce(max(changed_ms), 0) into reset_ms
    from public.athenaeum_learning where user_id = learner and record_id = 'reset';
  if exists (select 1 from public.athenaeum_learning where user_id = learner offset 60000 limit 1) then
    raise exception 'Learning storage limit reached';
  end if;

  insert into public.athenaeum_learning as current (user_id, record_id, kind, changed_ms, payload)
    select learner, item.record_id, item.kind, item.changed_ms, item.payload
    from jsonb_to_recordset(p_records) as item(record_id text, kind text, changed_ms bigint, payload jsonb)
    where item.kind <> 'reset' and item.record_id <> 'reset' and item.changed_ms > reset_ms
      and item.changed_ms < (extract(epoch from clock_timestamp()) * 1000)::bigint + 86400000
    on conflict (user_id, record_id) do update
      set changed_ms = excluded.changed_ms, payload = excluded.payload, saved_at = clock_timestamp()
      where current.changed_ms < excluded.changed_ms and current.kind = excluded.kind;
end;
$$;
revoke all on function academy_private.save_learning(jsonb) from public, anon, authenticated;
grant execute on function academy_private.save_learning(jsonb) to authenticated;

create function public.athenaeum_save_learning(p_records jsonb) returns void
language sql security invoker set search_path = '' as $$ select academy_private.save_learning(p_records); $$;
revoke all on function public.athenaeum_save_learning(jsonb) from public, anon, authenticated;
grant execute on function public.athenaeum_save_learning(jsonb) to authenticated;

create function academy_private.clear_learning() returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  learner uuid := auth.uid();
  wiped_at bigint;
begin
  if learner is null then raise exception 'Account required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(learner::text, 21031));
  wiped_at := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  delete from public.athenaeum_learning where user_id = learner;
  insert into public.athenaeum_learning (user_id, record_id, kind, changed_ms, payload)
    values (learner, 'reset', 'reset', wiped_at, '{}');
  return wiped_at;
end;
$$;
revoke all on function academy_private.clear_learning() from public, anon, authenticated;
grant execute on function academy_private.clear_learning() to authenticated;

create function public.athenaeum_clear_learning() returns bigint
language sql security invoker set search_path = '' as $$ select academy_private.clear_learning(); $$;
revoke all on function public.athenaeum_clear_learning() from public, anon, authenticated;
grant execute on function public.athenaeum_clear_learning() to authenticated;
