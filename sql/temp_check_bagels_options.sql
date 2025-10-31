-- Compter options par groupe pour VEGETARIEN (851)
SELECT
  option_group,
  COUNT(*) as nb_options,
  MIN(price_modifier) as prix_min,
  MAX(price_modifier) as prix_max
FROM france_product_options
WHERE product_id = 851
GROUP BY option_group
ORDER BY option_group;

-- Compter options par groupe pour menu promo (857)
SELECT
  option_group,
  COUNT(*) as nb_options,
  MIN(price_modifier) as prix_min,
  MAX(price_modifier) as prix_max
FROM france_product_options
WHERE product_id = 857
GROUP BY option_group
ORDER BY option_group;
