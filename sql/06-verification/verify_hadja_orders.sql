-- Vérifier les commandes assignées à Hadja (driver_id=19)
SELECT
  id,
  order_number,
  driver_id,
  status,
  created_at,
  updated_at
FROM france_orders
WHERE driver_id = 19
  AND status IN ('assignee', 'en_livraison')
ORDER BY created_at DESC;

-- Vérifier aussi la commande 0810-0007 spécifiquement
SELECT
  id,
  order_number,
  driver_id,
  status,
  created_at,
  updated_at
FROM france_orders
WHERE order_number LIKE '0810-0007%'
OR order_number LIKE '0710-0007%';
