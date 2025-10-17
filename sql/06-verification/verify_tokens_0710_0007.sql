-- Vérifier les tokens de la commande 0710-0007
SELECT
  dt.id,
  dt.token,
  dt.order_id,
  dt.driver_id,
  dt.used,
  dt.suspended,
  dt.expires_at,
  dt.created_at,
  fdd.first_name || ' ' || fdd.last_name as driver_name,
  fo.order_number
FROM delivery_tokens dt
JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number LIKE '0710-0007%'
ORDER BY dt.created_at DESC;

-- Vérifier aussi les actions d'acceptation
SELECT
  dda.id,
  dda.order_id,
  dda.driver_id,
  dda.action_type,
  dda.details,
  dda.created_at,
  fdd.first_name || ' ' || fdd.last_name as driver_name,
  fo.order_number
FROM delivery_driver_actions dda
JOIN france_delivery_drivers fdd ON dda.driver_id = fdd.id
JOIN france_orders fo ON dda.order_id = fo.id
WHERE fo.order_number LIKE '0710-0007%'
ORDER BY dda.created_at DESC;
