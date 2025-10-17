-- 1. Vérifier les assignments créés
SELECT
  fda.id,
  fda.order_id,
  fda.driver_id,
  fda.assignment_status,
  fda.responded_at,
  fda.expires_at,
  fda.response_time_seconds,
  fda.created_at,
  fdd.first_name || ' ' || fdd.last_name as driver_name,
  fdd.phone_number,
  fo.order_number
FROM france_delivery_assignments fda
JOIN france_delivery_drivers fdd ON fda.driver_id = fdd.id
JOIN france_orders fo ON fda.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%'
ORDER BY fda.created_at ASC;

-- 2. Vérifier les actions de notification
SELECT
  dda.id,
  dda.order_id,
  dda.driver_id,
  dda.action_type,
  dda.action_timestamp,
  dda.details,
  fdd.first_name || ' ' || fdd.last_name as driver_name,
  fo.order_number
FROM delivery_driver_actions dda
JOIN france_delivery_drivers fdd ON dda.driver_id = fdd.id
JOIN france_orders fo ON dda.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%'
ORDER BY dda.action_timestamp ASC;
