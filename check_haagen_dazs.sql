-- Vérifier la configuration du produit HÄAGEN-DAZS
SELECT 
  name,
  product_type,
  workflow_type,
  requires_steps,
  steps_config,
  base_price,
  price_on_site_base,
  price_delivery_base
FROM france_products 
WHERE name ILIKE '%HÄAGEN%' 
  AND restaurant_id = 1;