-- Vérifier les restaurants avec Stripe activé
SELECT
  id,
  name,
  phone,
  payment_methods,
  stripe_account_id,
  is_active
FROM france_restaurants
WHERE is_active = true
ORDER BY id;
