-- ========================================================================
-- INSERTION CATÉGORIE PIZZAS TOMATE - PLAN B MELUN
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: PIZZAS TOMATE 🍅
-- Contenu:
--   - 2 Offres promotionnelles (composite)
--   - 17 Pizzas individuelles (simple)
-- Total: 19 produits
-- ========================================================================

BEGIN;

-- 1️⃣ CRÉATION CATÉGORIE PIZZAS TOMATE
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
  'PIZZAS TOMATE',
  'pizzas-tomate',
  'Nos pizzas et offres spéciales',
  5,
  '🍅',
  true
);

-- ========================================================================
-- OFFRE 1 : 2 PIZZAS ACHETEES = LA 3EME OFFERTE
-- ========================================================================

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
  (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22),
  '2 PIZZAS ACHETEES LA 3EME OFFERTE',
  '2 Pizzas Senior au choix + 1 Pizza Senior OFFERTE',
  'composite',
  27.00,
  27.00,
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

-- 3️⃣ OPTIONS OFFRE 1 - PIZZAS SAUCE TOMATE (17 pizzas) - PREMIÈRE PIZZA
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 0.00, '🍅', 1, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 0.00, '🍅', 2, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'NAPOLITAINE', 'Sauce tomate, mozzarella, anchois, olives', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 0.00, '🍅', 4, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 0.00, '🍅', 5, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 0.00, '🍅', 6, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 0.00, '🍅', 7, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 0.00, '🍅', 8, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 0.00, '🍅', 9, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 0.00, '🍅', 10, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 0.00, '🍅', 11, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🍅', 12, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 0.00, '🍅', 13, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 0.00, '🍅', 14, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 0.00, '🍅', 15, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 0.00, '🍅', 16, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 0.00, '🍅', 17, true);

-- 4️⃣ OPTIONS OFFRE 1 - PIZZAS CRÈME FRAÎCHE (13 pizzas) - PREMIÈRE PIZZA
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 0.50, '🥛', 18, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 0.50, '🥛', 19, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 0.50, '🥛', 20, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 0.50, '🥛', 21, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'CHÈVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 0.50, '🥛', 22, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 0.50, '🥛', 23, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 0.50, '🥛', 24, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 0.50, '🥛', 25, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 0.50, '🥛', 26, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 0.50, '🥛', 27, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 0.50, '🥛', 28, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 0.50, '🥛', 29, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22), 'Première Pizza', 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 0.50, '🥛', 30, true);

-- 5️⃣ OPTIONS OFFRE 1 - DEUXIÈME PIZZA (30 pizzas - identiques)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT
  product_id,
  'Deuxième Pizza' as option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22)
  AND option_group = 'Première Pizza';

-- 6️⃣ OPTIONS OFFRE 1 - TROISIÈME PIZZA OFFERTE (30 pizzas - price_modifier = prix négatif pour offrir)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT
  product_id,
  'Troisième Pizza' as option_group,
  option_name,
  composition,
  CASE
    WHEN price_modifier = 0.00 THEN -13.50  -- Pizzas tomate offerte
    ELSE -14.00  -- Pizzas crème offerte
  END as price_modifier,
  icon,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22)
  AND option_group = 'Première Pizza';

-- ========================================================================
-- OFFRE 2 : 1 PIZZA ACHETEE = LA 2EME A 3 EURO
-- ========================================================================

-- 7️⃣ PRODUIT OFFRE 2
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
  (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22),
  '1 PIZZA ACHETEE LA 2EME A 3 EURO',
  '1 Pizza Senior au choix + 1 Pizza Senior à 3€',
  'composite',
  16.50,
  16.50,
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

-- 8️⃣ OPTIONS OFFRE 2 - PIZZA 1 (30 pizzas - même liste que Offre 1)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT
  (SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND restaurant_id = 22) as product_id,
  'Pizza 1' as option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22)
  AND option_group = 'Première Pizza';

-- 9️⃣ OPTIONS OFFRE 2 - PIZZA 2 (30 pizzas - prix fixe 3€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT
  (SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND restaurant_id = 22) as product_id,
  'Pizza 2' as option_group,
  option_name,
  composition,
  CASE
    WHEN price_modifier = 0.00 THEN -10.50  -- Pizza tomate : 13.50 - 10.50 = 3€
    ELSE -11.00  -- Pizza crème : 14.00 - 11.00 = 3€
  END as price_modifier,
  icon,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22)
  AND option_group = 'Première Pizza';

-- ========================================================================
-- PIZZAS INDIVIDUELLES (17 pizzas)
-- ========================================================================

-- 🔟 PIZZA INDIVIDUELLE : MARGUERITA (prix spécial 10.50€)
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22),
  'MARGUERITA',
  'Sauce tomate, mozzarella',
  'simple',
  10.50,
  10.50,
  '🍕',
  true,
  3
);

-- 1️⃣1️⃣ PIZZAS INDIVIDUELLES (16 pizzas à 13.50€)
INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, icon, is_active, display_order) VALUES
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 'simple', 13.50, 13.50, '🍕', true, 4),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 'simple', 13.50, 13.50, '🍕', true, 5),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 'simple', 13.50, 13.50, '🍕', true, 6),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 'simple', 13.50, 13.50, '🍕', true, 7),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 'simple', 13.50, 13.50, '🍕', true, 8),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 'simple', 13.50, 13.50, '🍕', true, 9),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 'simple', 13.50, 13.50, '🍕', true, 10),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 'simple', 13.50, 13.50, '🍕', true, 11),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 'simple', 13.50, 13.50, '🍕', true, 12),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 'simple', 13.50, 13.50, '🍕', true, 13),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 'simple', 13.50, 13.50, '🍕', true, 14),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 'simple', 13.50, 13.50, '🍕', true, 15),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 'simple', 13.50, 13.50, '🍕', true, 16),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 'simple', 13.50, 13.50, '🍕', true, 17),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 'simple', 13.50, 13.50, '🍕', true, 18),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22), 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 'simple', 13.50, 13.50, '🍕', true, 19);

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT id, name, slug, display_order, icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'pizzas-tomate';

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
WHERE p.restaurant_id = 22 AND c.slug = 'pizzas-tomate'
ORDER BY p.display_order;

-- Vérifier les options OFFRE 1
SELECT
  option_group,
  COUNT(*) as nb_options
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22)
GROUP BY option_group
ORDER BY option_group;

-- Vérifier les options OFFRE 2
SELECT
  option_group,
  COUNT(*) as nb_options
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND restaurant_id = 22)
GROUP BY option_group
ORDER BY option_group;

-- Compter total produits
SELECT COUNT(*) as total_produits
FROM france_products
WHERE restaurant_id = 22
  AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-tomate' AND restaurant_id = 22);

-- Transaction validée automatiquement en cas de succès
COMMIT;

-- En cas d'erreur : ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- Catégorie : PIZZAS TOMATE 🍅
--
-- Produits :
-- 1. OFFRE 1 : 2 PIZZAS ACHETEES LA 3EME OFFERTE (27.00€)
--    - 3 steps avec 30 pizzas chacun
--    - Total : 90 options
--
-- 2. OFFRE 2 : 1 PIZZA ACHETEE LA 2EME A 3 EURO (16.50€)
--    - 2 steps avec 30 pizzas chacun
--    - Total : 60 options
--
-- 3. MARGUERITA : 10.50€ (pizza simple)
-- 4-19. 16 pizzas individuelles : 13.50€ chacune
--
-- TOTAL : 19 produits dans la catégorie
-- ========================================================================
