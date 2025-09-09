-- Vérifier comment le workflow TACOS récupère les boissons avec icônes
SELECT 
  p.name,
  p.workflow_type,
  po.option_name,
  po.option_group,
  po.display_order
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id
WHERE p.name ILIKE '%TACOS%' 
  AND p.restaurant_id = 1
ORDER BY po.display_order
LIMIT 20;