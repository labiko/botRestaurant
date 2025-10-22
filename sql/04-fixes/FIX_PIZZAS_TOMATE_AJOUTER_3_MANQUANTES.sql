-- ========================================================================
-- CORRECTION PIZZAS TOMATE - AJOUT DES 3 PIZZAS MANQUANTES
-- DATE: 2025-10-21
-- ========================================================================
-- PROBLÈME IDENTIFIÉ :
--   - Actuellement 27 pizzas dans les offres
--   - DOIT avoir 30 pizzas (17 tomate + 13 crème)
--   - 3 pizzas MANQUANTES : 4 SAISONS, 4 FROMAGES, 4 JAMBONS
--
-- SOLUTION :
--   - AJOUTER ces 3 pizzas dans TOUTES les options des offres :
--     • Première Pizza (price_modifier selon type)
--     • Deuxième Pizza (price_modifier selon type)
--     • Troisième Pizza (price_modifier = 0.00 OFFERTE)
--     • Pizza 1 (price_modifier selon type)
--     • Pizza 2 (price_modifier = 3.00)
--
-- RÉSULTAT : 27 + 3 = 30 pizzas ✅
-- ========================================================================

BEGIN;

-- ========================================================================
-- ÉTAPE 1 : VÉRIFICATIONS AVANT MODIFICATION
-- ========================================================================

-- Compter pizzas actuelles dans chaque option_group
SELECT
  po.option_group,
  COUNT(*) AS total_actuel
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name IN ('2 PIZZAS ACHETEES LA 3EME OFFERTE', '1 PIZZA ACHETEE LA 2EME A 3 EURO')
GROUP BY po.option_group
ORDER BY po.option_group;

-- Vérifier absence des 3 pizzas
SELECT
  po.option_group,
  COUNT(*) AS count_4saisons
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND po.option_name IN ('4 SAISONS', '4 FROMAGES', '4 JAMBONS')
GROUP BY po.option_group
ORDER BY po.option_group;

-- ========================================================================
-- ÉTAPE 2 : AJOUT DE 4 SAISONS (pizza tomate à 13.50€)
-- ========================================================================

-- Offre 1 - Première Pizza (13.50€)
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
  'Première Pizza' AS option_group,
  '4 SAISONS' AS option_name,
  'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives' AS composition,
  13.50 AS price_modifier,
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
      AND po2.option_group = 'Première Pizza'
      AND po2.option_name = '4 SAISONS'
  );

-- Offre 1 - Deuxième Pizza (13.50€)
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
  'Deuxième Pizza' AS option_group,
  '4 SAISONS' AS option_name,
  'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives' AS composition,
  13.50 AS price_modifier,
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
      AND po2.option_group = 'Deuxième Pizza'
      AND po2.option_name = '4 SAISONS'
  );

-- Offre 1 - Troisième Pizza OFFERTE (0.00€)
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

-- Offre 2 - Pizza 1 (13.50€)
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
  'Pizza 1' AS option_group,
  '4 SAISONS' AS option_name,
  'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives' AS composition,
  13.50 AS price_modifier,
  '🍕' AS icon,
  9 AS display_order,
  true AS is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '1 PIZZA ACHETEE LA 2EME A 3 EURO'
  AND NOT EXISTS (
    SELECT 1 FROM france_product_options po2
    WHERE po2.product_id = p.id
      AND po2.option_group = 'Pizza 1'
      AND po2.option_name = '4 SAISONS'
  );

-- Offre 2 - Pizza 2 à 3€
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
  'Pizza 2' AS option_group,
  '4 SAISONS' AS option_name,
  'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives' AS composition,
  3.00 AS price_modifier,
  '🍕' AS icon,
  9 AS display_order,
  true AS is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '1 PIZZA ACHETEE LA 2EME A 3 EURO'
  AND NOT EXISTS (
    SELECT 1 FROM france_product_options po2
    WHERE po2.product_id = p.id
      AND po2.option_group = 'Pizza 2'
      AND po2.option_name = '4 SAISONS'
  );

-- ========================================================================
-- ÉTAPE 3 : AJOUT DE 4 FROMAGES (pizza tomate à 13.50€)
-- ========================================================================

-- Offre 1 - Première Pizza (13.50€)
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
  'Première Pizza' AS option_group,
  '4 FROMAGES' AS option_name,
  'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan' AS composition,
  13.50 AS price_modifier,
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
      AND po2.option_group = 'Première Pizza'
      AND po2.option_name = '4 FROMAGES'
  );

-- Offre 1 - Deuxième Pizza (13.50€)
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
  'Deuxième Pizza' AS option_group,
  '4 FROMAGES' AS option_name,
  'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan' AS composition,
  13.50 AS price_modifier,
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
      AND po2.option_group = 'Deuxième Pizza'
      AND po2.option_name = '4 FROMAGES'
  );

-- Offre 1 - Troisième Pizza OFFERTE (0.00€)
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

-- Offre 2 - Pizza 1 (13.50€)
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
  'Pizza 1' AS option_group,
  '4 FROMAGES' AS option_name,
  'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan' AS composition,
  13.50 AS price_modifier,
  '🍕' AS icon,
  12 AS display_order,
  true AS is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '1 PIZZA ACHETEE LA 2EME A 3 EURO'
  AND NOT EXISTS (
    SELECT 1 FROM france_product_options po2
    WHERE po2.product_id = p.id
      AND po2.option_group = 'Pizza 1'
      AND po2.option_name = '4 FROMAGES'
  );

-- Offre 2 - Pizza 2 à 3€
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
  'Pizza 2' AS option_group,
  '4 FROMAGES' AS option_name,
  'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan' AS composition,
  3.00 AS price_modifier,
  '🍕' AS icon,
  12 AS display_order,
  true AS is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '1 PIZZA ACHETEE LA 2EME A 3 EURO'
  AND NOT EXISTS (
    SELECT 1 FROM france_product_options po2
    WHERE po2.product_id = p.id
      AND po2.option_group = 'Pizza 2'
      AND po2.option_name = '4 FROMAGES'
  );

-- ========================================================================
-- ÉTAPE 4 : AJOUT DE 4 JAMBONS (pizza tomate à 13.50€)
-- ========================================================================

-- Offre 1 - Première Pizza (13.50€)
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
  'Première Pizza' AS option_group,
  '4 JAMBONS' AS option_name,
  'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons' AS composition,
  13.50 AS price_modifier,
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
      AND po2.option_group = 'Première Pizza'
      AND po2.option_name = '4 JAMBONS'
  );

-- Offre 1 - Deuxième Pizza (13.50€)
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
  'Deuxième Pizza' AS option_group,
  '4 JAMBONS' AS option_name,
  'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons' AS composition,
  13.50 AS price_modifier,
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
      AND po2.option_group = 'Deuxième Pizza'
      AND po2.option_name = '4 JAMBONS'
  );

-- Offre 1 - Troisième Pizza OFFERTE (0.00€)
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

-- Offre 2 - Pizza 1 (13.50€)
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
  'Pizza 1' AS option_group,
  '4 JAMBONS' AS option_name,
  'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons' AS composition,
  13.50 AS price_modifier,
  '🍕' AS icon,
  16 AS display_order,
  true AS is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '1 PIZZA ACHETEE LA 2EME A 3 EURO'
  AND NOT EXISTS (
    SELECT 1 FROM france_product_options po2
    WHERE po2.product_id = p.id
      AND po2.option_group = 'Pizza 1'
      AND po2.option_name = '4 JAMBONS'
  );

-- Offre 2 - Pizza 2 à 3€
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
  'Pizza 2' AS option_group,
  '4 JAMBONS' AS option_name,
  'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons' AS composition,
  3.00 AS price_modifier,
  '🍕' AS icon,
  16 AS display_order,
  true AS is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '1 PIZZA ACHETEE LA 2EME A 3 EURO'
  AND NOT EXISTS (
    SELECT 1 FROM france_product_options po2
    WHERE po2.product_id = p.id
      AND po2.option_group = 'Pizza 2'
      AND po2.option_name = '4 JAMBONS'
  );

-- ========================================================================
-- ÉTAPE 5 : VÉRIFICATIONS FINALES
-- ========================================================================

-- 1. Compter total par option_group (doit être 30 partout)
SELECT
  po.option_group,
  COUNT(*) AS total_final,
  '30 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name IN ('2 PIZZAS ACHETEES LA 3EME OFFERTE', '1 PIZZA ACHETEE LA 2EME A 3 EURO')
GROUP BY po.option_group
ORDER BY po.option_group;

-- 2. Vérifier présence des 3 pizzas ajoutées
SELECT
  po.option_group,
  po.option_name,
  po.price_modifier,
  'DOIT être présent' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND po.option_name IN ('4 SAISONS', '4 FROMAGES', '4 JAMBONS')
ORDER BY po.option_group, po.option_name;

-- 3. Détail complet Troisième Pizza (doit avoir 30 pizzas)
SELECT
  po.option_name,
  po.price_modifier,
  po.composition
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'pizzas-tomate'
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza'
ORDER BY po.option_name;

COMMIT;

-- ========================================================================
-- RÉSULTAT FINAL ATTENDU :
-- ========================================================================
-- Chaque option_group doit avoir exactement 30 pizzas :
--   - Première Pizza : 30 pizzas
--   - Deuxième Pizza : 30 pizzas
--   - Troisième Pizza : 30 pizzas (price_modifier = 0.00)
--   - Pizza 1 : 30 pizzas
--   - Pizza 2 : 30 pizzas (price_modifier = 3.00)
--
-- Les 30 pizzas sont :
-- 17 TOMATE (13.50€) : REGINA, BARBECUE, NAPOLITAINE, TEXAS, TORINO, SPECIALE,
--                      CAMPIONE, CHICKEN, 4 SAISONS ✅, SUPER, PAYSANNE,
--                      4 FROMAGES ✅, VEGETARIENNE, ORIENTALE, VENEZIA,
--                      4 JAMBONS ✅, INDIENNE
--
-- 13 CRÈME (14.00€) : PRONTO, OSLO, TARTIFLETTE, SELSA, CHEVRE MIEL, TEXANE,
--                     MIA, BOURSIN, RACLETTE, FERMIERE POULET,
--                     FERMIERE VIANDE HACHEE, GORGONZOLA, CAMPAGNARDE
-- ========================================================================
