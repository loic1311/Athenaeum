alter table public.athenaeum_webpush_devices
  add column reminder_minutes smallint[]
    check (cardinality(reminder_minutes) between 1 and 24),
  add column reminder_days smallint[] not null default array[1,2,3,4,5,6,7]::smallint[]
    check (cardinality(reminder_days) between 1 and 7 and reminder_days <@ array[1,2,3,4,5,6,7]::smallint[]),
  add column sent_day date,
  add column sent_minutes smallint[] not null default '{}';

create function public.athenaeum_webpush_set_schedule(
  p_user uuid, p_subscription jsonb, p_zone text, p_minutes smallint[], p_days smallint[]
) returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  address text := p_subscription->>'endpoint';
begin
  if p_minutes is null or cardinality(p_minutes) not between 1 and 24
    or exists (select 1 from unnest(p_minutes) t where t is null or t not between 0 and 1439)
    or cardinality(p_minutes) <> (select count(distinct t) from unnest(p_minutes) t)
    or p_days is null or cardinality(p_days) not between 1 and 7
    or not (p_days <@ array[1,2,3,4,5,6,7]::smallint[])
    or cardinality(p_days) <> (select count(distinct d) from unnest(p_days) d)
  then return false; end if;

  if not public.athenaeum_webpush_register(p_user, p_subscription, p_zone, least(3,cardinality(p_minutes))::smallint)
    then return false;
  end if;

  update public.athenaeum_webpush_devices
  set reminder_minutes = p_minutes, reminder_days = p_days
  where endpoint = address and user_id = p_user;
  return found;
end;
$$;
revoke all on function public.athenaeum_webpush_set_schedule(uuid,jsonb,text,smallint[],smallint[]) from public, anon, authenticated;
grant execute on function public.athenaeum_webpush_set_schedule(uuid,jsonb,text,smallint[],smallint[]) to service_role;

-- The selected clock minute is the identity of a reminder, even if the user adds or reorders other times.
create function public.athenaeum_webpush_due_times(p_now timestamptz default now())
returns table (subscription jsonb, minute smallint, day date, studied_yesterday boolean)
language sql security invoker set search_path = '' as $$
  with ready as (
    select device.endpoint, local_clock.value::date as today, slot.minute
    from public.athenaeum_webpush_devices device
    cross join lateral (select p_now at time zone device.timezone as value) local_clock
    cross join lateral (select extract(hour from local_clock.value)::int * 60 + extract(minute from local_clock.value)::int as minute) clock
    cross join lateral (
      select chosen_time.minute
      from unnest(coalesce(device.reminder_minutes, (array[570,930,1230]::smallint[])[(4-device.daily_limit):3])) as chosen_time(minute)
      where chosen_time.minute <= clock.minute and chosen_time.minute > clock.minute - 5
        and (device.sent_day is distinct from local_clock.value::date or not (chosen_time.minute = any(device.sent_minutes)))
        and (device.last_day is distinct from local_clock.value::date
          or not (chosen_time.minute = any((array[570,930,1230]::smallint[])[1:coalesce(device.last_slot,0)])))
      order by chosen_time.minute
      limit 1
    ) slot
    where extract(isodow from local_clock.value)::smallint = any(device.reminder_days)
      and not exists (
        select 1 from public.athenaeum_learning progress where progress.user_id = device.user_id
          and progress.record_id = 'streak-day-' || to_char(local_clock.value, 'YYYY-MM-DD')
          and progress.kind = 'prefs' and progress.payload->>'name' = 'streak-day'
      )
    order by device.sent_day nulls first, slot.minute, device.endpoint
    limit 32 for update of device skip locked
  )
  update public.athenaeum_webpush_devices as device
  set sent_day = ready.today, sent_minutes = case when device.sent_day = ready.today
    then array_append(device.sent_minutes, ready.minute) else array[ready.minute] end
  from ready where device.endpoint = ready.endpoint
  returning device.subscription, ready.minute, ready.today, exists (
    select 1 from public.athenaeum_learning progress where progress.user_id = device.user_id
      and progress.record_id = 'streak-day-' || to_char(ready.today - 1, 'YYYY-MM-DD')
      and progress.kind = 'prefs' and progress.payload->>'name' = 'streak-day'
  );
$$;
revoke all on function public.athenaeum_webpush_due_times(timestamptz) from public, anon, authenticated;
grant execute on function public.athenaeum_webpush_due_times(timestamptz) to service_role;

select cron.alter_job(jobid, schedule := '* * * * *')
from cron.job where jobname = 'athenaeum-webpush-dispatch';
