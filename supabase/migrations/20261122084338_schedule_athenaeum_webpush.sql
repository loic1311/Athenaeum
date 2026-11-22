select cron.schedule('athenaeum-webpush-dispatch', '*/5 * * * *', $job$
  select net.http_post(
    url := 'https://gtvgqmzkwawuhcnlkzfk.supabase.co/functions/v1/athenaeum-webpush',
    headers := jsonb_build_object('Content-Type', 'application/json', 'X-Athenaeum-Scheduler', decrypted_secret),
    body := '{"action":"dispatch"}'::jsonb,
    timeout_milliseconds := 45000
  )
  from vault.decrypted_secrets
  where name = 'athenaeum_webpush_scheduler'
$job$);

-- Keep the previous job available for an explicit rollback.
select cron.alter_job(jobid, active := false)
from cron.job where jobname = 'athenaeum-telegram-scheduler' and active;
