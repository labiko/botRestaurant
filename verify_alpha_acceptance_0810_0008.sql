-- ========================================================================
-- VÉRIFICATION ACCEPTATION PAR ALPHA
-- Commande: 0810-0008
-- Livreur: Alpha (driver_id=21)
-- ========================================================================

-- 1. État de la commande après acceptation
SELECT
  id,
  order_number,
  status,
  driver_id,
  driver_assignment_status,
  assignment_started_at,
  updated_at
FROM france_orders
WHERE order_number LIKE '0810-0008%';

-- 2. État des tokens (celui d'Alpha doit être "used", celui de Hadja "suspended")
SELECT
  dt.id,
  dt.driver_id,
  dt.used,
  dt.suspended,
  dt.expires_at,
  fdd.first_name || ' ' || fdd.last_name as driver_name
FROM delivery_tokens dt
JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%'
ORDER BY dt.driver_id;

-- 3. État des assignments (Alpha="accepted", Hadja devrait être rejetée automatiquement)
SELECT
  fda.id,
  fda.driver_id,
  fda.assignment_status,
  fda.responded_at,
  fda.response_time_seconds,
  fdd.first_name || ' ' || fdd.last_name as driver_name
FROM france_delivery_assignments fda
JOIN france_delivery_drivers fdd ON fda.driver_id = fdd.id
JOIN france_orders fo ON fda.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%'
ORDER BY fda.driver_id;

-- 4. Actions enregistrées (doit inclure "accepted" pour Alpha)
SELECT
  dda.id,
  dda.driver_id,
  dda.action_type,
  dda.action_timestamp,
  dda.details,
  fdd.first_name || ' ' || fdd.last_name as driver_name
FROM delivery_driver_actions dda
JOIN france_delivery_drivers fdd ON dda.driver_id = fdd.id
JOIN france_orders fo ON dda.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%'
ORDER BY dda.action_timestamp ASC;

-- 5. RÉSUMÉ ATTENDU
SELECT
  'Commande assignée à' as verification,
  CASE
    WHEN driver_id = 21 THEN '✅ ALPHA (CORRECT)'
    WHEN driver_id = 19 THEN '❌ HADJA (ERREUR)'
    ELSE '❌ Autre livreur (ERREUR)'
  END as resultat
FROM france_orders
WHERE order_number LIKE '0810-0008%'

UNION ALL

SELECT
  'Token Alpha (id=64)' as verification,
  CASE
    WHEN used = true THEN '✅ UTILISÉ (CORRECT)'
    ELSE '❌ NON UTILISÉ (ERREUR)'
  END as resultat
FROM delivery_tokens
WHERE id = 64

UNION ALL

SELECT
  'Token Hadja (id=63)' as verification,
  CASE
    WHEN suspended = true THEN '✅ SUSPENDU (CORRECT)'
    ELSE '❌ NON SUSPENDU (ERREUR)'
  END as resultat
FROM delivery_tokens
WHERE id = 63

UNION ALL

SELECT
  'Assignment Alpha (id=71)' as verification,
  CASE
    WHEN assignment_status = 'accepted' THEN '✅ ACCEPTÉ (CORRECT)'
    ELSE '❌ ' || assignment_status || ' (ERREUR)'
  END as resultat
FROM france_delivery_assignments
WHERE id = 71;
