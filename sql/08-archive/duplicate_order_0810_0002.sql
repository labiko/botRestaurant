-- ========================================================================
-- DUPLIQUER LA COMMANDE 0810-0002 POUR TEST
-- ========================================================================

BEGIN;

-- Insérer une copie de la commande avec nouveau numéro et status 'en_attente'
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
  order_number,
  customer_country_code,
  audio_played
)
SELECT
  restaurant_id,
  phone_number,
  customer_name,
  items,
  total_amount + 1, -- +1€ pour livraison
  'livraison', -- Mode livraison pour test assignation
  '37 Rue de Paris, 75001 Paris', -- Adresse de test
  'livraison', -- Paiement à la livraison
  'cash',
  'pending', -- Status initial (nouvelle commande)
  '0810-' || LPAD(CAST((SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 6) AS INTEGER)), 0) + 1 FROM france_orders WHERE order_number LIKE '0810-%') AS TEXT), 4, '0'), -- Générer nouveau numéro
  customer_country_code,
  false -- Audio non joué
FROM france_orders
WHERE order_number = '0810-0002';

-- Afficher le résultat
SELECT
  id,
  order_number,
  status,
  delivery_mode,
  total_amount,
  delivery_address,
  created_at
FROM france_orders
WHERE order_number LIKE '0810-%'
ORDER BY id DESC
LIMIT 3;

COMMIT;
