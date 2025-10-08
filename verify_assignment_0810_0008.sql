-- ========================================================================
-- VÉRIFICATION COMPLÈTE DE L'ASSIGNATION AUTOMATIQUE
-- Commande: 0810-0008
-- ========================================================================

-- 1. État de la commande
SELECT
  id,
  order_number,
  status,
  driver_id,
  driver_assignment_status,
  assignment_started_at,
  restaurant_id,
  created_at,
  updated_at
FROM france_orders
WHERE order_number LIKE '0810-0008%';

-- 2. Tokens générés pour cette commande
SELECT
  dt.id,
  dt.token,
  dt.order_id,
  dt.driver_id,
  dt.used,
  dt.suspended,
  dt.reactivated,
  dt.expires_at,
  dt.absolute_expires_at,
  dt.created_at,
  fdd.first_name || ' ' || fdd.last_name as driver_name,
  fdd.phone_number
FROM delivery_tokens dt
JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%'
ORDER BY dt.created_at ASC;

-- 3. Assignments créés dans france_delivery_assignments
SELECT
  fda.id,
  fda.order_id,
  fda.driver_id,
  fda.assignment_status,
  fda.notification_method,
  fda.responded_at,
  fda.response_time_seconds,
  fda.created_at,
  fdd.first_name || ' ' || fdd.last_name as driver_name,
  fo.order_number
FROM france_delivery_assignments fda
JOIN france_delivery_drivers fdd ON fda.driver_id = fdd.id
JOIN france_orders fo ON fda.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%'
ORDER BY fda.created_at ASC;

-- 4. Actions des livreurs (notifications, acceptation, etc.)
SELECT
  dda.id,
  dda.order_id,
  dda.driver_id,
  dda.action_type,
  dda.details,
  fdd.first_name || ' ' || fdd.last_name as driver_name,
  fo.order_number
FROM delivery_driver_actions dda
JOIN france_delivery_drivers fdd ON dda.driver_id = fdd.id
JOIN france_orders fo ON dda.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%'
ORDER BY dda.id ASC;

-- 5. Livreurs actifs du restaurant 16
SELECT
  id,
  first_name,
  last_name,
  phone_number,
  is_active,
  is_online,
  restaurant_id
FROM france_delivery_drivers
WHERE restaurant_id = 16
  AND is_active = true
ORDER BY id;

-- 6. RÉSUMÉ : Combien de tokens et assignments créés ?
SELECT
  'Tokens' as type,
  COUNT(*) as count
FROM delivery_tokens dt
JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%'

UNION ALL

SELECT
  'Assignments' as type,
  COUNT(*) as count
FROM france_delivery_assignments fda
JOIN france_orders fo ON fda.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%'

UNION ALL

SELECT
  'Livreurs actifs' as type,
  COUNT(*) as count
FROM france_delivery_drivers
WHERE restaurant_id = 16
  AND is_active = true
  AND is_online = true;
