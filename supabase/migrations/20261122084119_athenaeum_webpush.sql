-- Device subscriptions are only read and written through the authenticated Edge Function.
create table public.athenaeum_webpush_devices (
  endpoint text primary key check (length(endpoint) between 16 and 1200),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription jsonb not null check (octet_length(subscription::text) < 3500),
  timezone text not null check (length(timezone) between 1 and 80),
  daily_limit smallint not null check (daily_limit between 1 and 3),
  last_day date,
  last_slot smallint check (last_slot between 1 and 3),
  tested_at timestamptz
);
create index athenaeum_webpush_user on public.athenaeum_webpush_devices (user_id);
alter table public.athenaeum_webpush_devices enable row level security;
revoke all on public.athenaeum_webpush_devices from public, anon, authenticated;
grant select, insert, update, delete on public.athenaeum_webpush_devices to service_role;

select vault.create_secret(
  replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  'athenaeum_webpush_scheduler', 'Authenticates the Athenaeum Web Push scheduler'
);

create function academy_private.webpush_secrets(p_public text default null, p_private text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  vapid jsonb;
  dispatcher text;
begin
  if p_public is not null and p_private is not null then
    perform pg_catalog.pg_advisory_xact_lock(21033);
    if not exists (select 1 from vault.secrets where name = 'athenaeum_webpush_vapid') then
      perform vault.create_secret(
        jsonb_build_object('public_key', p_public, 'private_key', p_private)::text,
        'athenaeum_webpush_vapid', 'Athenaeum Web Push signing keys'
      );
    end if;
  end if;
  select decrypted_secret::jsonb into vapid from vault.decrypted_secrets where name = 'athenaeum_webpush_vapid';
  select decrypted_secret into dispatcher from vault.decrypted_secrets where name = 'athenaeum_webpush_scheduler';
  return jsonb_build_object('vapid', vapid, 'dispatcher', dispatcher);
end;
$$;
grant usage on schema academy_private to service_role;
revoke all on function academy_private.webpush_secrets(text,text) from public, anon, authenticated;
grant execute on function academy_private.webpush_secrets(text,text) to service_role;

create function public.athenaeum_webpush_secrets(p_public text default null, p_private text default null)
returns jsonb language sql security invoker set search_path = ''
as $$ select academy_private.webpush_secrets(p_public, p_private); $$;
revoke all on function public.athenaeum_webpush_secrets(text,text) from public, anon, authenticated;
grant execute on function public.athenaeum_webpush_secrets(text,text) to service_role;

create function public.athenaeum_webpush_register(p_user uuid, p_subscription jsonb, p_zone text, p_limit smallint)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  address text := p_subscription->>'endpoint';
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_zone) then return false; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text, 21034));
  if (select count(*) from public.athenaeum_webpush_devices where user_id = p_user and endpoint <> address) >= 8 then
    return false;
  end if;
  insert into public.athenaeum_webpush_devices as device (endpoint, user_id, subscription, timezone, daily_limit)
    values (address, p_user, p_subscription, p_zone, p_limit)
  on conflict (endpoint) do update set subscription = excluded.subscription, timezone = excluded.timezone,
    daily_limit = excluded.daily_limit
  where device.user_id = excluded.user_id;
  return found;
end;
$$;
revoke all on function public.athenaeum_webpush_register(uuid,jsonb,text,smallint) from public, anon, authenticated;
grant execute on function public.athenaeum_webpush_register(uuid,jsonb,text,smallint) to service_role;

-- Claim each device slot at most once, even with overlapping dispatches.
create function public.athenaeum_webpush_due(p_now timestamptz default now())
returns table (subscription jsonb, slot smallint, day date, studied_yesterday boolean)
language sql security invoker set search_path = '' as $$
  with ready as (
    select device.endpoint, local_time.value::date as today, slot.number as slot
    from public.athenaeum_webpush_devices device
    cross join lateral (select p_now at time zone device.timezone as value) local_time
    cross join lateral (
      select (case
        when local_time.value::time >= time '20:30' and local_time.value::time < time '21:00' then 3
        when local_time.value::time >= time '15:30' and local_time.value::time < time '16:00' then 2
        when local_time.value::time >= time '09:30' and local_time.value::time < time '10:00' then 1
      end)::smallint as number
    ) slot
    where device.daily_limit >= 4 - slot.number
      and (device.last_day is distinct from local_time.value::date or device.last_slot < slot.number)
      and not exists (
        select 1 from public.athenaeum_learning progress where progress.user_id = device.user_id
          and progress.record_id = 'streak-day-' || to_char(local_time.value, 'YYYY-MM-DD')
          and progress.kind = 'prefs' and progress.payload->>'name' = 'streak-day'
      )
    order by device.last_day nulls first, device.endpoint
    limit 32 for update of device skip locked
  )
  update public.athenaeum_webpush_devices as device
  set last_day = ready.today, last_slot = ready.slot
  from ready where device.endpoint = ready.endpoint
  returning device.subscription, ready.slot, ready.today, exists (
    select 1 from public.athenaeum_learning progress where progress.user_id = device.user_id
      and progress.record_id = 'streak-day-' || to_char(ready.today - 1, 'YYYY-MM-DD')
      and progress.kind = 'prefs' and progress.payload->>'name' = 'streak-day'
  );
$$;
revoke all on function public.athenaeum_webpush_due(timestamptz) from public, anon, authenticated;
grant execute on function public.athenaeum_webpush_due(timestamptz) to service_role;
