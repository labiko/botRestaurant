-- Vérifier la structure steps_config du CHICKEN BOX
SELECT 
  name,
  steps_config::text as steps_config_raw
FROM france_products 
WHERE name = 'CHICKEN BOX' 
  AND restaurant_id = 1;