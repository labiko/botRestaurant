-- Voir les sauces disponibles pour VEGETARIEN
SELECT
  option_name,
  price_modifier,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = 851
  AND option_group = 'Sauce'
ORDER BY display_order;

-- Voir les options du menu promo
SELECT
  option_group,
  option_name,
  price_modifier,
  display_order
FROM france_product_options
WHERE product_id = 857
ORDER BY option_group, display_order;
