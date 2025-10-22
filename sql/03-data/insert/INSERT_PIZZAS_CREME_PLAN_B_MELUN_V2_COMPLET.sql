-- ========================================================================
-- INSERTION CATÉGORIE PIZZAS CRÈME FRAÎCHE - PLAN B MELUN (VERSION COMPLÈTE)
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: PIZZAS CRÈME FRAÎCHE 🥛
-- Contenu:
--   - 2 Offres promotionnelles (composite) avec 30 pizzas chacune
--   - 13 Pizzas individuelles crème (simple)
-- Total: 15 produits + 150 options
--
-- ⚠️ IMPORTANT : Ce script insère MANUELLEMENT les 30 pizzas avec
--    compositions EXACTES du fichier log.log
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

-- 3️⃣ OPTIONS OFFRE 1 - PREMIÈRE PIZZA (30 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 13.50, '🍕', 1, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 13.50, '🍕', 2, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'NAPOLITAINE', 'Sauce tomate, mozzarella, anchois, olives', 13.50, '🍕', 3, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 13.50, '🍕', 4, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 13.50, '🍕', 5, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 13.50, '🍕', 6, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 13.50, '🍕', 7, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 13.50, '🍕', 8, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 13.50, '🍕', 9, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 13.50, '🍕', 10, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 13.50, '🍕', 11, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 13.50, '🍕', 12, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 13.50, '🍕', 13, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 13.50, '🍕', 14, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 13.50, '🍕', 15, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 13.50, '🍕', 16, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 13.50, '🍕', 17, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 14.00, '🍕', 18, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 14.00, '🍕', 19, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 14.00, '🍕', 20, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 14.00, '🍕', 21, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'CHEVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 14.00, '🍕', 22, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 14.00, '🍕', 23, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 14.00, '🍕', 24, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 14.00, '🍕', 25, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 14.00, '🍕', 26, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 14.00, '🍕', 27, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 14.00, '🍕', 28, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 14.00, '🍕', 29, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Première Pizza', 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 14.00, '🍕', 30, true);

-- 4️⃣ OPTIONS OFFRE 1 - DEUXIÈME PIZZA (30 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 13.50, '🍕', 1, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 13.50, '🍕', 2, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'NAPOLITAINE', 'Sauce tomate, mozzarella, anchois, olives', 13.50, '🍕', 3, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 13.50, '🍕', 4, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 13.50, '🍕', 5, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 13.50, '🍕', 6, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 13.50, '🍕', 7, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 13.50, '🍕', 8, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 13.50, '🍕', 9, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 13.50, '🍕', 10, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 13.50, '🍕', 11, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 13.50, '🍕', 12, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 13.50, '🍕', 13, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 13.50, '🍕', 14, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 13.50, '🍕', 15, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 13.50, '🍕', 16, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 13.50, '🍕', 17, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 14.00, '🍕', 18, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 14.00, '🍕', 19, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 14.00, '🍕', 20, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 14.00, '🍕', 21, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'CHEVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 14.00, '🍕', 22, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 14.00, '🍕', 23, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 14.00, '🍕', 24, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 14.00, '🍕', 25, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 14.00, '🍕', 26, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 14.00, '🍕', 27, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 14.00, '🍕', 28, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 14.00, '🍕', 29, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Deuxième Pizza', 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 14.00, '🍕', 30, true);

-- 5️⃣ OPTIONS OFFRE 1 - TROISIÈME PIZZA OFFERTE (30 pizzas à 0.00€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 0.00, '🍕', 1, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 0.00, '🍕', 2, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'NAPOLITAINE', 'Sauce tomate, mozzarella, anchois, olives', 0.00, '🍕', 3, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 0.00, '🍕', 4, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 0.00, '🍕', 5, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 0.00, '🍕', 6, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 0.00, '🍕', 7, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 0.00, '🍕', 8, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 0.00, '🍕', 9, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 0.00, '🍕', 10, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 0.00, '🍕', 11, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🍕', 12, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 0.00, '🍕', 13, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 0.00, '🍕', 14, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 0.00, '🍕', 15, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 0.00, '🍕', 16, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 0.00, '🍕', 17, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 0.00, '🍕', 18, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 0.00, '🍕', 19, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 0.00, '🍕', 20, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 0.00, '🍕', 21, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'CHEVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 0.00, '🍕', 22, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 0.00, '🍕', 23, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🍕', 24, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 0.00, '🍕', 25, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 0.00, '🍕', 26, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 0.00, '🍕', 27, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 0.00, '🍕', 28, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 0.00, '🍕', 29, true),
((SELECT id FROM france_products WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Troisième Pizza', 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 0.00, '🍕', 30, true);

-- ========================================================================
-- OFFRE 2 : 1 PIZZA ACHETEE = LA 2EME A 3 EURO
-- ========================================================================

-- 6️⃣ PRODUIT OFFRE 2
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

-- 7️⃣ OPTIONS OFFRE 2 - PIZZA 1 (30 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 13.50, '🍕', 1, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 13.50, '🍕', 2, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'NAPOLITAINE', 'Sauce tomate, mozzarella, anchois, olives', 13.50, '🍕', 3, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 13.50, '🍕', 4, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 13.50, '🍕', 5, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 13.50, '🍕', 6, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 13.50, '🍕', 7, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 13.50, '🍕', 8, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 13.50, '🍕', 9, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 13.50, '🍕', 10, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 13.50, '🍕', 11, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 13.50, '🍕', 12, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 13.50, '🍕', 13, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 13.50, '🍕', 14, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 13.50, '🍕', 15, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 13.50, '🍕', 16, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 13.50, '🍕', 17, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 14.00, '🍕', 18, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 14.00, '🍕', 19, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 14.00, '🍕', 20, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 14.00, '🍕', 21, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'CHEVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 14.00, '🍕', 21, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 14.00, '🍕', 23, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 14.00, '🍕', 24, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 14.00, '🍕', 25, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 14.00, '🍕', 26, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 14.00, '🍕', 27, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 14.00, '🍕', 28, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 14.00, '🍕', 29, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 1', 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 14.00, '🍕', 30, true);

-- 8️⃣ OPTIONS OFFRE 2 - PIZZA 2 à 3€ (30 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 3.00, '🍕', 1, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 3.00, '🍕', 2, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'NAPOLITAINE', 'Sauce tomate, mozzarella, anchois, olives', 3.00, '🍕', 3, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 3.00, '🍕', 4, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 3.00, '🍕', 5, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 3.00, '🍕', 6, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 3.00, '🍕', 7, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 3.00, '🍕', 8, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 3.00, '🍕', 9, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 3.00, '🍕', 10, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 3.00, '🍕', 11, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 3.00, '🍕', 12, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 3.00, '🍕', 13, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 3.00, '🍕', 14, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 3.00, '🍕', 15, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 3.00, '🍕', 16, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 3.00, '🍕', 17, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 3.00, '🍕', 18, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 3.00, '🍕', 19, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 3.00, '🍕', 20, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 3.00, '🍕', 21, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'CHEVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 3.00, '🍕', 22, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 3.00, '🍕', 23, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 3.00, '🍕', 24, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 3.00, '🍕', 25, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 3.00, '🍕', 26, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 3.00, '🍕', 27, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 3.00, '🍕', 28, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 3.00, '🍕', 29, true),
((SELECT id FROM france_products WHERE name = '1 PIZZA ACHETEE LA 2EME A 3 EURO' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22)), 'Pizza 2', 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 3.00, '🍕', 30, true);

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

-- Vérifier les options par option_group (doit être 30 partout)
SELECT
  po.option_group,
  COUNT(*) as nb_options,
  '30 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22 AND c.slug = 'pizzas-creme-fraiche'
GROUP BY po.option_group
ORDER BY po.option_group;

-- Compter total produits (doit être 15)
SELECT COUNT(*) as total_produits, '15 attendu' AS verification
FROM france_products
WHERE restaurant_id = 22
  AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'pizzas-creme-fraiche' AND restaurant_id = 22);

COMMIT;

-- ========================================================================
-- RÉSULTAT FINAL ATTENDU :
-- ========================================================================
-- Catégorie : PIZZAS CRÈME FRAÎCHE 🥛
--
-- Produits :
-- 1. OFFRE 1 : 2 PIZZAS ACHETEES LA 3EME OFFERTE (0.00€ base + prix pizzas)
--    - Première Pizza : 30 pizzas (17 tomate 13.50€ + 13 crème 14.00€)
--    - Deuxième Pizza : 30 pizzas (17 tomate 13.50€ + 13 crème 14.00€)
--    - Troisième Pizza : 30 pizzas (toutes à 0.00€ OFFERTE)
--    - Total : 90 options
--
-- 2. OFFRE 2 : 1 PIZZA ACHETEE LA 2EME A 3 EURO (0.00€ base + prix pizzas)
--    - Pizza 1 : 30 pizzas (17 tomate 13.50€ + 13 crème 14.00€)
--    - Pizza 2 : 30 pizzas (toutes à 3.00€)
--    - Total : 60 options
--
-- 3-15. 13 pizzas individuelles crème : 14.00€ chacune
--
-- TOTAL : 15 produits + 150 options dans la catégorie
-- ========================================================================
