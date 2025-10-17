-- Vérifier les numéros de téléphone des 2 livreurs
SELECT
  id,
  first_name,
  last_name,
  phone_number,
  country_code,
  is_active,
  is_online,
  restaurant_id
FROM france_delivery_drivers
WHERE id IN (19, 21)
ORDER BY id;
