-- Vérifier si les icônes TACOS sont en base de données
SELECT 
  name,
  steps_config::text as steps_config_raw
FROM france_products 
WHERE name ILIKE '%TACOS%' 
  AND restaurant_id = 1
LIMIT 1;