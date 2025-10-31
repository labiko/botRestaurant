-- Vérifier les options pour le produit 782
SELECT
  option_group,
  option_name,
  price_modifier,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = 782
ORDER BY option_group, display_order
LIMIT 30;
