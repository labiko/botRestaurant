-- Vérifier quel restaurant correspond au numéro 33620951645
SELECT
  id,
  name,
  phone,
  whatsapp_number,
  is_active
FROM france_restaurants
WHERE phone = '33620951645' OR whatsapp_number = '33620951645'
   OR phone = '+33620951645' OR whatsapp_number = '+33620951645';

-- Voir aussi tous les restaurants actifs pour comparaison
SELECT
  id,
  name,
  phone,
  whatsapp_number,
  is_active
FROM france_restaurants
WHERE is_active = true
ORDER BY id;