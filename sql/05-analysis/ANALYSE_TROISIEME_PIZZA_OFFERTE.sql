-- ========================================================================
-- ANALYSE TROISIEME PIZZA OFFERTE - OFFRE 1
-- DATE: 2025-10-21
-- ========================================================================

-- Lister toutes les pizzas actuellement dans "Troisième Pizza"
SELECT
  option_name,
  price_modifier,
  icon,
  display_order
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza'
ORDER BY option_name;

-- Compter le nombre total
SELECT
  COUNT(*) AS total_pizzas_troisieme
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza';
