-- Activer Stripe pour Plan B Melun
BEGIN;

-- Vérifier l'état actuel
SELECT
  r.id,
  r.name,
  r.phone,
  rpc.provider,
  rpc.is_active as payment_active,
  rpc.auto_send_on_order
FROM france_restaurants r
JOIN restaurant_payment_configs rpc ON rpc.restaurant_id = r.id
WHERE r.id = 22;

-- Activer Stripe
UPDATE restaurant_payment_configs
SET is_active = true
WHERE restaurant_id = 22 AND provider = 'stripe';

-- Vérifier après activation
SELECT
  r.id,
  r.name,
  r.phone,
  rpc.provider,
  rpc.is_active as payment_active,
  rpc.auto_send_on_order,
  '✅ Stripe activé pour tests' as statut
FROM france_restaurants r
JOIN restaurant_payment_configs rpc ON rpc.restaurant_id = r.id
WHERE r.id = 22;

COMMIT;
