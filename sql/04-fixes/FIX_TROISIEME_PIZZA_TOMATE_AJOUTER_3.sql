-- ========================================================================
-- FIX URGENT : AJOUTER 3 PIZZAS MANQUANTES DANS TROISIEME PIZZA TOMATE
-- DATE: 2025-10-21
-- ========================================================================
-- PROBLÈME :
--   - Troisième Pizza (OFFERTE) a seulement 27 pizzas
--   - Manque : 4 SAISONS, 4 FROMAGES, 4 JAMBONS
--   - Les autres option_groups ont déjà les 30 pizzas
--
-- SOLUTION :
--   Ajouter uniquement ces 3 pizzas dans "Troisième Pizza"
--   avec price_modifier = 0.00 (OFFERTE)
-- ========================================================================

BEGIN;

-- Vérification avant
SELECT
  COUNT(*) as total_avant,
  '27' as attendu_avant
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza';

-- AJOUT 4 SAISONS
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
)
SELECT
  p.id AS product_id,
  'Troisième Pizza' AS option_group,
  '4 SAISONS' AS option_name,
  'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives' AS composition,
  0.00 AS price_modifier,
  '🍕' AS icon,
  9 AS display_order,
  true AS is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND NOT EXISTS (
    SELECT 1 FROM france_product_options po2
    WHERE po2.product_id = p.id
      AND po2.option_group = 'Troisième Pizza'
      AND po2.option_name = '4 SAISONS'
  );

-- AJOUT 4 FROMAGES
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
)
SELECT
  p.id AS product_id,
  'Troisième Pizza' AS option_group,
  '4 FROMAGES' AS option_name,
  'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan' AS composition,
  0.00 AS price_modifier,
  '🍕' AS icon,
  12 AS display_order,
  true AS is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND NOT EXISTS (
    SELECT 1 FROM france_product_options po2
    WHERE po2.product_id = p.id
      AND po2.option_group = 'Troisième Pizza'
      AND po2.option_name = '4 FROMAGES'
  );

-- AJOUT 4 JAMBONS
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
)
SELECT
  p.id AS product_id,
  'Troisième Pizza' AS option_group,
  '4 JAMBONS' AS option_name,
  'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons' AS composition,
  0.00 AS price_modifier,
  '🍕' AS icon,
  16 AS display_order,
  true AS is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND NOT EXISTS (
    SELECT 1 FROM france_product_options po2
    WHERE po2.product_id = p.id
      AND po2.option_group = 'Troisième Pizza'
      AND po2.option_name = '4 JAMBONS'
  );

-- Vérification finale
SELECT
  COUNT(*) as total_apres,
  '30' as attendu_apres
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza';

-- Vérifier présence des 3 pizzas ajoutées
SELECT
  po.option_name,
  po.price_modifier,
  'DOIT etre 0.00' as verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza'
  AND po.option_name IN ('4 SAISONS', '4 FROMAGES', '4 JAMBONS')
ORDER BY po.option_name;

COMMIT;

-- ========================================================================
-- RESULTAT ATTENDU :
-- Troisième Pizza passe de 27 à 30 pizzas
-- Les 3 nouvelles : 4 SAISONS, 4 FROMAGES, 4 JAMBONS (toutes à 0.00€)
-- ========================================================================
