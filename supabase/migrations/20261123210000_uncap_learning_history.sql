-- Keep per-request validation, account isolation and stale-write protection.
create or replace function academy_private.save_learning(p_records jsonb)
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
