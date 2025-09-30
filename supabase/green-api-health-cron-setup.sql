-- ========================================
-- CONFIGURATION PG_CRON POUR GREEN API HEALTH MONITOR
-- Exécution automatique toutes les 15 minutes
-- ========================================

-- IMPORTANT: Ce script doit être exécuté dans le SQL Editor Supabase DEV
-- après avoir déployé la fonction Edge "green-api-health-monitor"

-- ========================================
-- ÉTAPE 1: Activer l'extension pg_cron (déjà activé par défaut sur Supabase)
-- ========================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ========================================
-- ÉTAPE 2: Supprimer le job s'il existe déjà (pour éviter les doublons)
-- ========================================
SELECT cron.unschedule('green-api-health-check');

-- ========================================
-- ÉTAPE 3: Créer le job cron
-- Pattern: */1 * * * * = Toutes les 1 minute (TEST)
-- ⚠️ ATTENTION: Pour production, revenir à */15 * * * *
-- ========================================

-- REMPLACER [YOUR-SUPABASE-ANON-KEY] par la vraie clé ANON du projet DEV

SELECT cron.schedule(
  'green-api-health-check',           -- Nom du job
  '*/1 * * * *',                       -- ⚠️ TEST: Toutes les 1 minute
  $$
  SELECT net.http_post(
    url := 'https://lphvdoyhwaelmwdfkfuh.supabase.co/functions/v1/green-api-health-monitor',
    headers := '{"Authorization": "Bearer [YOUR-SUPABASE-ANON-KEY]"}'::jsonb
  );
  $$
);

-- ========================================
-- VÉRIFICATIONS
-- ========================================

-- Voir tous les jobs actifs
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'green-api-health-check';

-- Voir l'historique d'exécution (20 derniers)
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
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname = 'green-api-health-check')
ORDER BY start_time DESC
LIMIT 20;

-- ========================================
-- COMMANDES UTILES (à garder en commentaire)
-- ========================================

-- Désactiver le job (sans le supprimer)
-- UPDATE cron.job SET active = false WHERE jobname = 'green-api-health-check';

-- Réactiver le job
-- UPDATE cron.job SET active = true WHERE jobname = 'green-api-health-check';

-- Supprimer complètement le job
-- SELECT cron.unschedule('green-api-health-check');

-- Tester manuellement l'exécution (sans attendre 15 min)
-- SELECT net.http_post(
--   url := 'https://lphvdoyhwaelmwdfkfuh.supabase.co/functions/v1/green-api-health-monitor',
--   headers := '{"Authorization": "Bearer [YOUR-SUPABASE-ANON-KEY]"}'::jsonb
-- );

-- ========================================
-- NOTES IMPORTANTES
-- ========================================

-- 1. La clé ANON est publique et peut être utilisée en client-side
-- 2. L'Edge Function utilise SUPABASE_SERVICE_ROLE_KEY en interne
-- 3. Les logs sont stockés dans green_api_health_logs
-- 4. Les erreurs critiques envoient des alertes WhatsApp au support
-- 5. Le job s'exécute toutes les 15 minutes automatiquement