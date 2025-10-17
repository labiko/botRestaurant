-- Vérifier l'état des sessions et leurs restaurant_id
SELECT
  id,
  phone_number,
  restaurant_id,
  bot_state,
  current_step,
  expires_at,
  created_at,
  updated_at,
  CASE
    WHEN restaurant_id IS NULL THEN '❌ NULL'
    WHEN restaurant_id = 0 THEN '❌ ZERO'
    WHEN restaurant_id = 1 THEN '⚠️ FALLBACK (1)'
    ELSE '✅ VALIDE'
  END as restaurant_status,
  CASE
    WHEN expires_at > NOW() THEN '✅ ACTIVE'
    ELSE '❌ EXPIRÉE'
  END as session_status
FROM france_user_sessions
ORDER BY updated_at DESC
LIMIT 10;