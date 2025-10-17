-- Vérifier les actions d'acceptation
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
WHERE fo.order_number LIKE '0710-0007%'
ORDER BY dda.id DESC;
