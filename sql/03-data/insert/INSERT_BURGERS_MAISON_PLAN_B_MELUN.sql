-- ========================================================================
-- INSERTION CATÉGORIE BURGERS MAISON - PLAN B MELUN
-- DATE: 2025-10-22
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: BURGERS MAISON (burgers individuels SANS frites ni boisson)
-- Total: 1 produit composite + 50 options
-- ========================================================================
-- Workflow en 4 étapes (identique à SMASH BURGERS):
--   Step 1: Choix du burger (10 options avec prix)
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
VALUES (22, 'BURGERS MAISON', 'burgers-maison', '🍔', 6, true);

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
  (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22),
  'BURGER MAISON',
  'Burger maison avec choix de composition, condiments, sauce et ingrédients supplémentaires',
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
        "prompt": "votre burger maison",
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
  '🏠',
  true,
  1
);

-- ========================================================================
-- 3. STEP 1 - CHOIX DU BURGER (10 options avec prix)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Choix Burger', 'CLASSIC', 'Steak 120 grs, sauce maison, double cheddar, cornichons, oignons rouges, tomates, salade', 8.00, '🍔', 1, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Choix Burger', 'EXOTIC', 'Steak 120 grs, sauce maison, ananas grillé, cheddar, cornichons, oignons rouges, tomates, salade', 9.00, '🍍', 2, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Choix Burger', 'CHICAGO', 'Steak 120 grs, miel, chèvre, sauce maison, double cheddar, cornichons, oignons rouges, tomates, salade', 9.00, '🍯', 3, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Choix Burger', 'PLAN B', 'Steak 120 grs, escalope, boursin, poulet parfumé, double cheddar, cornichons, oignons rouges, tomates, salade', 9.00, '🏠', 4, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Choix Burger', 'MOZZA', 'Steak 120 grs, pommes caramélisées, cornichons, oignons rouges, salade, tranches de mozzarella, tomates, sauce maison', 9.00, '🧀', 5, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Choix Burger', 'BACON', 'Steak 120 grs, oeuf, bacon, sauce maison, double cheddar, cornichons, oignons rouges, tomates, salade', 9.00, '🥓', 6, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Choix Burger', 'RACLETTE', 'Steak 120 grs, aubergines grillées, sauce maison, raclette, cheddar, cornichons, oignons rouges, tomates, salade', 9.00, '🧀', 7, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Choix Burger', 'VEGETARIEN', 'Sauce avocat, galette pommes de terre, courgette grillée, salade, tomates, oignons', 7.50, '🥑', 8, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Choix Burger', 'ORIENTAL', '2 Steaks 120 grs grillés, cheddar, pain fait maison, emmental, poivrons grillés, oignons frits, tomates fraîches, salade', 12.50, '🌍', 9, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Choix Burger', 'XXL', '3 Steaks 120 grs, triple cheddar, sauce maison, cornichons, oignons rouges, tomates, salade', 12.50, '🔥', 10, true);

-- ========================================================================
-- 4. STEP 2 - CONDIMENTS (4 options gratuites, optionnelles)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Condiments', 'cornichons', '', 0.00, '🥒', 1, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Condiments', 'oignons rouges', '', 0.00, '🧅', 2, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Condiments', 'salade', '', 0.00, '🥬', 3, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Condiments', 'tomates', '', 0.00, '🍅', 4, true);

-- ========================================================================
-- 5. STEP 3 - SAUCES (13 options gratuites)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', '', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', '', 0.00, '🍔', 2, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', '', 0.00, '🟡', 3, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', '', 0.00, '🐟', 4, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'POIVRE', '', 0.00, '⚫', 5, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', '', 0.00, '⚔️', 6, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', '', 0.00, '⚪', 7, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', '', 0.00, '🔥', 8, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'HARISSA', '', 0.00, '🌶️', 9, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', '', 0.00, '🔴', 10, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', '', 0.00, '🟡', 11, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', '', 0.00, '🇩🇿', 12, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', '', 0.00, '🇪🇸', 13, true);

-- ========================================================================
-- 6. STEP 4 - INGRÉDIENTS SUPPLÉMENTAIRES (23 options payantes)
-- ========================================================================

-- LÉGUMES (6 options à 1.00€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'cornichons', '', 1.00, '🥒', 1, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'oignons rouges', '', 1.00, '🧅', 2, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'olives', '', 1.00, '🫒', 3, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poivrons', '', 1.00, '🫑', 4, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'salade', '', 1.00, '🥬', 5, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'tomates', '', 1.00, '🍅', 6, true);

-- VIANDES/POISSONS (11 options à 1.50€ ou 2.00€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'bacon', '', 1.50, '🥓', 7, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'crevettes', '', 1.50, '🦐', 8, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'escalope', '', 1.50, '🍗', 9, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'oeuf', '', 1.50, '🥚', 10, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet', '', 1.50, '🍗', 11, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet curry', '', 1.50, '🍛', 12, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet tandoori', '', 1.50, '🍗', 13, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'saumon', '', 1.50, '🐟', 14, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'steak 120gr', '', 2.00, '🥩', 15, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'steak 90gr', '', 2.00, '🥩', 16, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'tenders', '', 1.50, '🍗', 17, true);

-- FROMAGES (6 options à 1.00€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'boursin', '', 1.00, '🧀', 18, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'cheddar', '', 1.00, '🧀', 19, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'chèvre', '', 1.00, '🐐', 20, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'mozzarella', '', 1.00, '🧀', 21, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'raclette', '', 1.00, '🧀', 22, true),
((SELECT id FROM france_products WHERE name = 'BURGER MAISON' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'burgers-maison' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'reblochon', '', 1.00, '🧀', 23, true);

-- ========================================================================
-- 7. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie
SELECT id, name, slug, icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'burgers-maison';

-- Vérifier le produit
SELECT p.name, p.product_type, p.workflow_type, p.requires_steps
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22
  AND c.slug = 'burgers-maison';

-- Vérifier le total d'options (doit être 50)
SELECT COUNT(*) as total_options, '50 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = 'BURGER MAISON'
  AND p.restaurant_id = 22;

-- Vérifier la répartition par groupe
SELECT po.option_group, COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = 'BURGER MAISON'
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
WHERE p.name = 'BURGER MAISON'
  AND p.restaurant_id = 22
  AND po.option_group = 'Choix Burger'
ORDER BY po.display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 1 catégorie "BURGERS MAISON" créée
-- 1 produit composite "BURGER MAISON" créé
-- 50 options ajoutées :
--   - 10 choix de burgers (7.50€ à 12.50€)
--   - 4 condiments (gratuits)
--   - 13 sauces (gratuites)
--   - 23 ingrédients supplémentaires (1.00€ à 2.00€)
--
-- Workflow en 4 steps :
--   Step 1: Choix du burger maison (obligatoire, 1 parmi 10)
--   Step 2: Condiments (optionnel, max 4)
--   Step 3: Sauce (obligatoire, 1 parmi 13)
--   Step 4: Ingrédients supplémentaires (optionnel, max 10)
-- ========================================================================
