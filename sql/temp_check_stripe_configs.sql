-- Vérifier les configurations de paiement Stripe
SELECT
  r.id,
  r.name,
  r.phone,
  rpc.provider,
  rpc.is_enabled,
  rpc.config
FROM france_restaurants r
LEFT JOIN restaurant_payment_configs rpc ON rpc.restaurant_id = r.id
WHERE r.is_active = true
  AND (rpc.provider = 'stripe' OR rpc.provider IS NULL)
ORDER BY r.id;
