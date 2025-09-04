-- Script pour dupliquer la commande existante avec nouveau numéro et statut en_attente
-- Pour tester le workflow complet du système de notification livreurs

-- Générer un nouveau numéro de commande
WITH new_order_number AS (
  SELECT '0409-' || LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 10000)::TEXT, 4, '0') AS order_num
)

-- Insérer la commande dupliquée
INSERT INTO france_orders (
  restaurant_id,
  phone_number, 
  customer_name,
  items,
  total_amount,
  delivery_mode,
  delivery_address,
  payment_mode,
  payment_method,
  status,
  notes,
  order_number,
  created_at,
  updated_at,
  delivery_address_id,
  delivery_validation_code,
  driver_id,
  estimated_delivery_time,
  driver_assignment_status,
  delivery_started_at,
  assignment_timeout_at
)
SELECT 
  restaurant_id,
  phone_number,
  customer_name,
  items,
  total_amount,
  delivery_mode,
  delivery_address,
  payment_mode,
  payment_method,
  'en_attente' AS status, -- Nouveau statut pour test
  'COMMANDE DE TEST - Duplication pour tester workflow notifications livreurs' AS notes,
  (SELECT order_num FROM new_order_number) AS order_number, -- Nouveau numéro
  NOW() AS created_at,
  NOW() AS updated_at,
  delivery_address_id,
  (FLOOR(RANDOM() * 9000) + 1000)::TEXT AS delivery_validation_code, -- Nouveau code
  NULL AS driver_id, -- Pas de livreur assigné
  NULL AS estimated_delivery_time,
  'none' AS driver_assignment_status,
  NULL AS delivery_started_at,
  NULL AS assignment_timeout_at
FROM france_orders 
WHERE id = 19; -- ID de la commande source

-- Afficher la nouvelle commande créée
SELECT 
  id,
  order_number,
  status,
  delivery_mode,
  total_amount,
  phone_number,
  delivery_address,
  notes,
  created_at
FROM france_orders 
WHERE notes LIKE 'COMMANDE DE TEST%'
ORDER BY created_at DESC 
LIMIT 1;