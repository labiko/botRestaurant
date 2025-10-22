-- ========================================================================
-- INSERTION CATÉGORIE SMASH BURGERS - PLAN B MELUN
-- DATE: 2025-10-22
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: SMASH BURGERS
-- Total: 1 produit composite + 42 options
-- ========================================================================
-- Workflow en 4 étapes (identique à CLASSIC BURGERS):
--   Step 1: Choix du burger (4 options avec prix)
--   Step 2: Condiments (optionnel, décocher si non désiré)
--   Step 3: 1 Sauce (obligatoire, 13 options)
--   Step 4: Ingrédients supplémentaires (optionnel, payant)
-- ========================================================================
-- ⚠️ IMPORTANT : Prix identiques sur place ET livraison (pas de +1€)
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. CRÉATION DE LA CATÉGORIE
-- ========================================================================

INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order, is_active)
VALUES (22, 'SMASH BURGERS', 'smash-burgers', '🍔', 3, true);

-- ========================================================================
-- 2. INSERTION DU PRODUIT COMPOSITE
-- ========================================================================
-- 1 produit avec workflow en 4 étapes
-- Prix de base: 0.00€ (les prix sont dans les options Step 1)
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22),
  'SMASH BURGER',
  'Smash burger avec choix de composition, condiments, sauce et ingrédients supplémentaires',
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
        "prompt": "votre smash burger",
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
        "max_selections": 4
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
  '🔥',
  true,
  1
);

-- ========================================================================
-- 3. STEP 1 - CHOIX DU BURGER (4 options avec prix)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Choix Burger', 'SMASH CLASSIC', 'Smashed beef, cheddar, salade, tomates, oignons, cornichons, sauce maison', 7.00, '🍔', 1, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Choix Burger', 'SMASH BACON', 'Smashed beef, cheddar, bacon, salade, tomates, oignons, cornichons, sauce maison', 8.00, '🥓', 2, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Choix Burger', 'SMASH AVOCADO', 'Double smashed beef, cheddar, salade, tomates, oignons, avocat, cornichons, sauce maison', 9.00, '🥑', 3, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Choix Burger', 'SMASH CHICKEN BEEF', 'Fried chicken, smashed steak, cheddar, salade, tomates, oignons, sauce maison', 9.00, '🍗', 4, true);

-- ========================================================================
-- 4. STEP 2 - CONDIMENTS (4 options gratuites, optionnelles)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Condiments', 'cornichons', '', 0.00, '🥒', 1, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Condiments', 'oignons', '', 0.00, '🧅', 2, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Condiments', 'salade', '', 0.00, '🥬', 3, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Condiments', 'tomates', '', 0.00, '🍅', 4, true);

-- ========================================================================
-- 5. STEP 3 - SAUCES (13 options gratuites)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', '', 0.00, '🍔', 1, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', '', 0.00, '🌶️', 2, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', '', 0.00, '🟡', 3, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', '', 0.00, '🐟', 4, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'POIVRE', '', 0.00, '⚫', 5, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', '', 0.00, '⚔️', 6, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', '', 0.00, '⚪', 7, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', '', 0.00, '🔥', 8, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'HARISSA', '', 0.00, '🌶️', 9, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', '', 0.00, '🔴', 10, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', '', 0.00, '🟡', 11, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', '', 0.00, '🇩🇿', 12, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', '', 0.00, '🇪🇸', 13, true);

-- ========================================================================
-- 6. STEP 4 - INGRÉDIENTS SUPPLÉMENTAIRES (22 options payantes)
-- ========================================================================

-- LÉGUMES (5 options à 1.00€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'oignons rouges', '', 1.00, '🧅', 1, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'olives', '', 1.00, '🫒', 2, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poivrons', '', 1.00, '🫑', 3, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'salade', '', 1.00, '🥬', 4, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'tomates', '', 1.00, '🍅', 5, true);

-- VIANDES/POISSONS (11 options à 1.50€ ou 2.00€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'bacon', '', 1.50, '🥓', 6, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'crevettes', '', 1.50, '🦐', 7, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'escalope', '', 1.50, '🍗', 8, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'oeuf', '', 1.50, '🥚', 9, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet', '', 1.50, '🍗', 10, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet curry', '', 1.50, '🍛', 11, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet tandoori', '', 1.50, '🍗', 12, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'saumon', '', 1.50, '🐟', 13, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'steak 120gr', '', 2.00, '🥩', 14, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'steak 90gr', '', 2.00, '🥩', 15, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'tenders', '', 1.50, '🍗', 16, true);

-- FROMAGES (6 options à 1.00€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'boursin', '', 1.00, '🧀', 17, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'cheddar', '', 1.00, '🧀', 18, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'chèvre', '', 1.00, '🐐', 19, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'mozzarella', '', 1.00, '🧀', 20, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'raclette', '', 1.00, '🧀', 21, true),
((SELECT id FROM france_products WHERE name = 'SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'reblochon', '', 1.00, '🧀', 22, true);

-- ========================================================================
-- 7. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie
SELECT id, name, slug, icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'smash-burgers';

-- Vérifier le produit
SELECT p.name, p.product_type, p.workflow_type, p.requires_steps
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22
  AND c.slug = 'smash-burgers';

-- Vérifier le total d'options (doit être 42)
SELECT COUNT(*) as total_options, '42 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = 'SMASH BURGER'
  AND p.restaurant_id = 22;

-- Vérifier la répartition par groupe
SELECT po.option_group, COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = 'SMASH BURGER'
  AND p.restaurant_id = 22
GROUP BY po.option_group
ORDER BY
  CASE po.option_group
    WHEN 'Choix Burger' THEN 1
    WHEN 'Condiments' THEN 2
    WHEN 'Sauces' THEN 3
    WHEN 'Ingredients Supplementaires' THEN 4
  END;

-- Vérifier les prix des burgers
SELECT po.option_name, po.price_modifier
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = 'SMASH BURGER'
  AND p.restaurant_id = 22
  AND po.option_group = 'Choix Burger'
ORDER BY po.display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 1 catégorie "SMASH BURGERS" créée
-- 1 produit composite "SMASH BURGER" créé
-- 42 options ajoutées :
--   - 4 choix de burgers (7.00€ à 9.00€)
--   - 4 condiments (gratuits)
--   - 13 sauces (gratuites)
--   - 22 ingrédients supplémentaires (1.00€ à 2.00€)
--
-- Workflow en 4 steps :
--   Step 1: Choix du smash burger (obligatoire, 1 parmi 4)
--   Step 2: Condiments (optionnel, max 4)
--   Step 3: Sauce (obligatoire, 1 parmi 13)
--   Step 4: Ingrédients supplémentaires (optionnel, max 10)
-- ========================================================================
