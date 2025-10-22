-- ========================================================================
-- INSERTION CATÉGORIE PIZZAS CRÈME FRA

ÎCHE - PLAN B MELUN
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: PIZZAS CRÈME FRAÎCHE 🥛
-- Contenu:
--   - 2 Offres promotionnelles (composite) - MÊMES QUE PIZZAS TOMATE
--   - 13 Pizzas individuelles crème (simple)
-- Total: 15 produits
-- ========================================================================

BEGIN;

-- 1️⃣ CRÉATION CATÉGORIE PIZZAS CRÈME FRAÎCHE
INSERT INTO france_menu_categories (
  restaurant_id,
  name,
  slug,
  description,
  display_order,
  icon,
  is_active
) VALUES (
  22,
  'PIZZAS CRÈME FRAÎCHE',
  'pizzas-creme-fraiche',
  'Nos pizzas base crème et offres spéciales',
  6,
  '🥛',
  true
);

-- ========================================================================
-- OFFRE 1 : 2 PIZZAS ACHETEES = LA 3EME OFFERTE
-- ========================================================================
-- Note: Cette offre utilise les MÊMES 27 pizzas que PIZZAS TOMATE
-- Les options sont partagées entre les deux catégories

-- 2️⃣ PRODUIT OFFRE 1
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  workflow_type,
  requires_steps,
  steps_config,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22),
  '2 PIZZAS ACHETEES LA 3EME OFFERTE',
  '2 Pizzas Senior au choix + 1 Pizza Senior OFFERTE',
  'composite',
  0.00,
  0.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre première pizza",
        "option_groups": ["Première Pizza"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre deuxième pizza",
        "option_groups": ["Deuxième Pizza"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "votre troisième pizza (OFFERTE)",
        "option_groups": ["Troisième Pizza"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🎁🍕',
  true,
  1
);

-- 3️⃣ OPTIONS OFFRE 1 - Copie depuis PIZZAS TOMATE
-- PREMIÈRE PIZZA (27 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT
  (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)) as product_id,
  option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22))
  AND option_group = 'Première Pizza';

-- DEUXIÈME PIZZA (27 pizzas - copie de Première)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT
  (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)) as product_id,
  option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22))
  AND option_group = 'Deuxième Pizza';

-- TROISIÈME PIZZA OFFERTE (27 pizzas - copie de Première avec price_modifier = 0)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT
  (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)) as product_id,
  option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22))
  AND option_group = 'Troisième Pizza';

-- ========================================================================
-- OFFRE 2 : 1 PIZZA ACHETEE = LA 2EME A 3 EURO
-- ========================================================================

-- 4️⃣ PRODUIT OFFRE 2
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  workflow_type,
  requires_steps,
  steps_config,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22),
  '1 PIZZA ACHETEE LA 2EME A 3 EURO',
  '1 Pizza Senior au choix + 1 Pizza Senior à 3€',
  'composite',
  0.00,
  0.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre première pizza",
        "option_groups": ["Pizza 1"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre deuxième pizza (à 3€)",
        "option_groups": ["Pizza 2"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🎁🍕',
  true,
  2
);

-- 5️⃣ OPTIONS OFFRE 2 - Copie depuis PIZZAS TOMATE
-- PIZZA 1 (27 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT
  (SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)) as product_id,
  option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22))
  AND option_group = 'Pizza 1';

-- PIZZA 2 (27 pizzas à 3€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT
  (SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)) as product_id,
  option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22))
  AND option_group = 'Pizza 2';

-- ========================================================================
-- PIZZAS INDIVIDUELLES CRÈME (13 pizzas à 14.00€)
-- ========================================================================

INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, icon, is_active, display_order) VALUES
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 'simple', 14.00, 14.00, '🍕', true, 3),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 'simple', 14.00, 14.00, '🍕', true, 4),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 'simple', 14.00, 14.00, '🍕', true, 5),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 'simple', 14.00, 14.00, '🍕', true, 6),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'CHÈVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 'simple', 14.00, 14.00, '🍕', true, 7),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 'simple', 14.00, 14.00, '🍕', true, 8),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 'simple', 14.00, 14.00, '🍕', true, 9),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 'simple', 14.00, 14.00, '🍕', true, 10),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 'simple', 14.00, 14.00, '🍕', true, 11),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 'simple', 14.00, 14.00, '🍕', true, 12),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 'simple', 14.00, 14.00, '🍕', true, 13),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 'simple', 14.00, 14.00, '🍕', true, 14),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22), 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 'simple', 14.00, 14.00, '🍕', true, 15);

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT id, name, slug, display_order, icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'pizzas-creme-fraiche';

-- Vérifier les produits créés
SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.product_type,
  p.workflow_type,
  p.display_order,
  c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22 AND c.slug = 'pizzas-creme-fraiche'
ORDER BY p.display_order;

-- Vérifier les options OFFRE 1
SELECT
  option_group,
  COUNT(*) as nb_options
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22))
GROUP BY option_group
ORDER BY option_group;

-- Vérifier les options OFFRE 2
SELECT
  option_group,
  COUNT(*) as nb_options
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22))
GROUP BY option_group
ORDER BY option_group;

-- Compter total produits
SELECT COUNT(*) as total_produits
FROM france_products
WHERE restaurant_id = 22
  AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22);

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- Catégorie : PIZZAS CRÈME FRAÎCHE 🥛
--
-- Produits :
-- 1. OFFRE 1 : 2 PIZZAS ACHETEES LA 3EME OFFERTE (0.00€ base + prix pizzas)
--    - 3 steps avec 27 pizzas chacun
--    - Total : 81 options
--
-- 2. OFFRE 2 : 1 PIZZA ACHETEE LA 2EME A 3 EURO (0.00€ base + prix pizzas)
--    - 2 steps avec 27 pizzas chacun
--    - Total : 54 options
--
-- 3-15. 13 pizzas individuelles crème : 14.00€ chacune
--
-- TOTAL : 15 produits dans la catégorie
-- ========================================================================
