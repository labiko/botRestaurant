-- Vérifier les configurations de paiement Stripe
SELECT
  r.id,
  r.name,
  r.phone,
  rpc.provider,
  rpc.is_active as payment_active,
  rpc.api_key_public,
  rpc.auto_send_on_order
FROM france_restaurants r
LEFT JOIN restaurant_payment_configs rpc ON rpc.restaurant_id = r.id
WHERE r.is_active = true
ORDER BY r.id;
