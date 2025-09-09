-- Chercher comment les boissons 33CL avec icônes sont stockées
SELECT 
  po.option_name,
  po.option_group
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE po.option_name ILIKE '%MIRANDA%' 
   OR po.option_name ILIKE '%33CL%'
   OR po.option_name ILIKE '%🥤%'
LIMIT 10;