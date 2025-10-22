-- ========================================================================
-- INSERTION CATÉGORIE CLASSIC BURGERS - PLAN B MELUN (VERSION 2)
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Modèle: Identique au workflow SANDWICHS BAGUETTE
-- Objectif : Créer la catégorie CLASSIC BURGERS avec 1 produit composite
-- Total: 1 produit + 43 options (5 choix burger + 3 condiments + 13 sauces + 22 ingrédients)
-- ========================================================================
-- Workflow en 4 étapes:
--   Step 1: Choix du burger (5 options avec prix différents)
--   Step 2: Condiments optionnels (3 options gratuites, max 3)
--   Step 3: 1 sauce obligatoire (13 sauces gratuites)
--   Step 4: Ingrédients supplémentaires optionnels (22 ingrédients payants, max 10)
-- ========================================================================
-- ⚠️ IMPORTANT : Prix identiques sur place ET livraison (pas de +1€)
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. CRÉATION CATÉGORIE CLASSIC BURGERS
-- ========================================================================
INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order, is_active)
VALUES (22, 'CLASSIC BURGERS', 'classic-burgers', '🍔', 2, true)
ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- ========================================================================
-- 2. INSERTION DU PRODUIT CLASSIC BURGER (COMPOSITE)
-- ========================================================================
-- Produit unique avec workflow en 4 steps (comme SANDWICH BAGUETTE)
-- Prix de base: 0.00€ (les prix sont dans les options du step 1)
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22),
  'CLASSIC BURGER',
  'Burger au choix avec condiments et sauce',
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
        "prompt": "votre burger",
        "option_groups": ["Choix Burger"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "vos condiments (optionnel)",
        "option_groups": ["Condiments"],
        "required": false,
        "max_selections": 3
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "votre sauce",
        "option_groups": ["Sauces"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 4,
        "type": "options_selection",
        "prompt": "vos ingrédients supplémentaires (optionnel)",
        "option_groups": ["Ingredients Supplementaires"],
        "required": false,
        "max_selections": 10
      }
    ]
  }'::json,
  '🍔',
  true,
  1
);

-- ========================================================================
-- 3. STEP 1 - CHOIX BURGER (5 options avec price_modifier)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Choix Burger', 'CHICKEN', 'Pain classic, poulet pané, oignons rouges, tomates, salade, cheddar', 6.00, '🍗', 1, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Choix Burger', 'CHEESE', 'Pain classic, steak 90 grs, tomates, salade, oignons rouges, cheddar', 6.00, '🧀', 2, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Choix Burger', 'DOUBLE CHEESE', 'Pain classic, 2 steaks 90 grs, oignons rouges, tomates, salade, double cheddar', 7.00, '🧀', 3, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Choix Burger', 'TOWER', 'Pain classic, tenders, galette de pommes de terre, salade, tomates, oignons rouges', 7.50, '🗼', 4, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Choix Burger', 'BIG MAC', '2 Steaks du boucher 45g, 2 cheddars, salade, tomates, oignons rouges', 7.50, '🍔', 5, true);

-- ========================================================================
-- 4. STEP 2 - CONDIMENTS (3 options gratuites)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Condiments', 'Oignons rouges', 'Oignons rouges frais', 0.00, '🧅', 1, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Condiments', 'Salade', 'Salade fraîche', 0.00, '🥗', 2, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Condiments', 'Tomates', 'Tomates fraîches', 0.00, '🍅', 3, true);

-- ========================================================================
-- 5. STEP 3 - SAUCES (13 sauces gratuites)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🌶️', 4, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '🥛', 6, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '🌶️', 8, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🌭', 10, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🥫', 13, true);

-- ========================================================================
-- 6. STEP 4 - INGRÉDIENTS SUPPLÉMENTAIRES (22 options payantes)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
-- LÉGUMES (5 options @ 1.00€)
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'oignons rouges', 'Oignons rouges supplémentaires', 1.00, '🧅', 1, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'olives', 'Olives supplémentaires', 1.00, '🫒', 2, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poivrons', 'Poivrons supplémentaires', 1.00, '🫑', 3, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'salade', 'Salade supplémentaire', 1.00, '🥗', 4, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'tomates', 'Tomates supplémentaires', 1.00, '🍅', 5, true),
-- VIANDES/POISSONS (11 options @ 1.50€-2.00€)
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'bacon', 'Bacon supplémentaire', 1.50, '🥓', 6, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'crevettes', 'Crevettes supplémentaires', 1.50, '🦐', 7, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'escalope', 'Escalope supplémentaire', 1.50, '🍗', 8, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'oeuf', 'Œuf supplémentaire', 1.50, '🥚', 9, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet', 'Poulet supplémentaire', 1.50, '🍗', 10, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet curry', 'Poulet curry supplémentaire', 1.50, '🍛', 11, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet tandoori', 'Poulet tandoori supplémentaire', 1.50, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'saumon', 'Saumon supplémentaire', 1.50, '🐟', 13, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'steak 120gr', 'Steak 120gr supplémentaire', 2.00, '🥩', 14, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'steak 90gr', 'Steak 90gr supplémentaire', 2.00, '🥩', 15, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'tenders', 'Tenders supplémentaires', 1.50, '🍗', 16, true),
-- FROMAGES (6 options @ 1.00€)
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'boursin', 'Boursin supplémentaire', 1.00, '🧀', 17, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'cheddar', 'Cheddar supplémentaire', 1.00, '🧀', 18, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'chèvre', 'Chèvre supplémentaire', 1.00, '🐐', 19, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'mozzarella', 'Mozzarella supplémentaire', 1.00, '🧀', 20, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'raclette', 'Raclette supplémentaire', 1.00, '🧀', 21, true),
((SELECT id FROM france_products WHERE name = 'CLASSIC BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'classic-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'reblochon', 'Reblochon supplémentaire', 1.00, '🧀', 22, true);

-- ========================================================================
-- 7. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie
SELECT name, slug, icon FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'classic-burgers';

-- Vérifier le produit
SELECT p.name, p.price_on_site_base, p.price_delivery_base, p.product_type
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22 AND c.slug = 'classic-burgers';

-- Vérifier le total d'options (doit être 43)
SELECT COUNT(*) as total_options, '43 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22 AND c.slug = 'classic-burgers';

-- Vérifier la répartition par type d'options
SELECT po.option_group, COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22 AND c.slug = 'classic-burgers'
GROUP BY po.option_group
ORDER BY po.option_group;

-- Vérifier les prix des choix de burgers
SELECT po.option_name, po.price_modifier
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22 AND c.slug = 'classic-burgers' AND po.option_group = 'Choix Burger'
ORDER BY po.display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 1 catégorie CLASSIC BURGERS créée
-- 1 produit composite "CLASSIC BURGER" ajouté (prix base 0€)
-- 43 options ajoutées :
--   - 5 choix de burgers (6.00€ à 7.50€)
--   - 3 condiments (gratuits)
--   - 13 sauces (gratuites)
--   - 22 ingrédients supplémentaires (1.00€ à 2.00€)
--
-- Workflow en 4 steps (modèle SANDWICH BAGUETTE):
--   Step 1: Choix burger (obligatoire, 1 parmi 5)
--   Step 2: Condiments (optionnel, max 3 parmi 3)
--   Step 3: Sauce (obligatoire, 1 parmi 13)
--   Step 4: Ingrédients supplémentaires (optionnel, max 10 parmi 22)
-- ========================================================================
