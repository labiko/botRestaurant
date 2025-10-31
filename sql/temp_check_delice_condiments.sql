-- Vérifier les options CONDIMENTS pour DELICE (855)
SELECT
  option_group,
  option_name,
  price_modifier,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = 855
  AND option_group = 'Condiments'
ORDER BY display_order;

-- Vérifier les options SAUCE pour DELICE (855)
SELECT
  option_group,
  option_name,
  price_modifier,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = 855
  AND option_group = 'Sauce'
ORDER BY display_order;

-- Voir ALL options pour DELICE groupées
SELECT
  option_group,
  COUNT(*) as nb_options,
  STRING_AGG(option_name, ', ' ORDER BY display_order) as liste_options
FROM france_product_options
WHERE product_id = 855
GROUP BY option_group
ORDER BY option_group;
