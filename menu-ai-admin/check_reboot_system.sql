-- 1. Vérifier si le job pg_cron existe et est actif
SELECT 
  jobname,
  schedule,
  active,
  command
FROM cron.job 
WHERE jobname LIKE '%reboot%';

-- 2. Vérifier la config du reboot planifié
SELECT * FROM green_api_scheduled_reboots;

-- 3. Vérifier les entrées récentes dans la queue de reboot
SELECT 
  id,
  scheduled_for,
  status,
  trigger_type,
  created_at,
  processed_at,
  error_message
FROM green_api_reboot_queue
ORDER BY created_at DESC
LIMIT 10;

-- 4. Vérifier les logs de pg_cron (dernières 20 minutes)
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '20 minutes'
ORDER BY start_time DESC;
