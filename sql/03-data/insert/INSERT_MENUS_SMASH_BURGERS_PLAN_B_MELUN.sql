-- ========================================================================
-- INSERTION CATÉGORIE MENUS SMASH BURGERS - PLAN B MELUN
-- DATE: 2025-10-22
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: MENUS SMASH BURGERS
-- Total: 1 produit composite + 54 options
-- ========================================================================
-- Workflow en 6 étapes (identique à MENUS CLASSIC BURGERS):
--   Step 1: Choix du burger (4 options avec prix)
--   Step 2: Condiments (optionnel, décocher si non désiré)
--   Step 3: 1 Sauce (obligatoire, 13 options)
--   Step 4: Accompagnement (FRITES ou FRITES CHEDDAR BACON)
--   Step 5: Boisson 33cl (12 boissons au choix)
--   Step 6: Ingrédients supplémentaires (optionnel, payant)
-- ========================================================================
-- ⚠️ IMPORTANT : Prix identiques sur place ET livraison (pas de +1€)
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. CRÉATION DE LA CATÉGORIE
-- ========================================================================

INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order, is_active)
VALUES (22, 'MENUS SMASH BURGERS', 'menus-smash-burgers', '🍔', 4, true);

-- ========================================================================
-- 2. INSERTION DU PRODUIT COMPOSITE
-- ========================================================================
-- 1 produit avec workflow en 6 étapes
-- Prix de base: 0.00€ (les prix sont dans les options Step 1)
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22),
  'MENU SMASH BURGER',
  'Menu complet avec smash burger + Frites + 1 Boisson 33cl au choix',
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
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnements"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 5,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boissons 33cl"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 6,
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
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Choix Burger', 'SMASH CLASSIC', 'Smashed beef, cheddar, bacon, salade, tomates, oignons, cornichons, sauce maison + Frites + 1 Boisson 33cl au choix', 9.00, '🍔', 1, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Choix Burger', 'SMASH BACON', 'Double smashed beef, cheddar, salade, tomates, oignons, avocat, cornichons, sauce maison + Frites + 1 Boisson 33cl au choix', 10.00, '🥓', 2, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Choix Burger', 'SMASH AVOCADO', 'Fried chicken, smashed steak, cheddar, salade, tomates, oignons, sauce maison + Frites + 1 Boisson 33cl au choix', 11.00, '🥑', 3, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Choix Burger', 'SMASH CHICKEN BEEF', 'Fried chicken, smashed steak, cheddar, salade, tomates, oignons, sauce maison + Frites + 1 Boisson 33cl au choix', 11.00, '🍗', 4, true);

-- ========================================================================
-- 4. STEP 2 - CONDIMENTS (4 options gratuites, optionnelles)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Condiments', 'cornichons', '', 0.00, '🥒', 1, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Condiments', 'oignons', '', 0.00, '🧅', 2, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Condiments', 'salade', '', 0.00, '🥬', 3, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Condiments', 'tomates', '', 0.00, '🍅', 4, true);

-- ========================================================================
-- 5. STEP 3 - SAUCES (13 options gratuites)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', '', 0.00, '🍔', 1, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', '', 0.00, '🌶️', 2, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', '', 0.00, '🟡', 3, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', '', 0.00, '🐟', 4, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'POIVRE', '', 0.00, '⚫', 5, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', '', 0.00, '⚔️', 6, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', '', 0.00, '⚪', 7, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', '', 0.00, '🔥', 8, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'HARISSA', '', 0.00, '🌶️', 9, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', '', 0.00, '🔴', 10, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', '', 0.00, '🟡', 11, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', '', 0.00, '🇩🇿', 12, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', '', 0.00, '🇪🇸', 13, true);

-- ========================================================================
-- 6. STEP 4 - ACCOMPAGNEMENTS (2 options)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Accompagnements', 'FRITES', '', 0.00, '🍟', 1, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Accompagnements', 'FRITES CHEDDAR BACON', '', 2.50, '🍟', 2, true);

-- ========================================================================
-- 7. STEP 5 - BOISSONS 33CL (12 options gratuites)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'COCA COLA', '', 0.00, '🥤', 1, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'COCA ZERO', '', 0.00, '🥤', 2, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'COCA CHERRY', '', 0.00, '🥤', 3, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'FANTA EXOTIQUE', '', 0.00, '🥤', 4, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'FANTA ORANGE', '', 0.00, '🥤', 5, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'SPRITE', '', 0.00, '🥤', 6, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', '7 UP MOJITO', '', 0.00, '🥤', 7, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'OASIS', '', 0.00, '🥤', 8, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'ICE TEA', '', 0.00, '🥤', 9, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'TROPICO', '', 0.00, '🥤', 10, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'PERRIER', '', 0.00, '💧', 11, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Boissons 33cl', 'EAU', '', 0.00, '💧', 12, true);

-- ========================================================================
-- 8. STEP 6 - INGRÉDIENTS SUPPLÉMENTAIRES (22 options payantes)
-- ========================================================================

-- LÉGUMES (5 options à 1.00€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'oignons rouges', '', 1.00, '🧅', 1, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'olives', '', 1.00, '🫒', 2, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poivrons', '', 1.00, '🫑', 3, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'salade', '', 1.00, '🥬', 4, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'tomates', '', 1.00, '🍅', 5, true);

-- VIANDES/POISSONS (11 options à 1.50€ ou 2.00€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'bacon', '', 1.50, '🥓', 6, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'crevettes', '', 1.50, '🦐', 7, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'escalope', '', 1.50, '🍗', 8, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'oeuf', '', 1.50, '🥚', 9, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet', '', 1.50, '🍗', 10, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet curry', '', 1.50, '🍛', 11, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'poulet tandoori', '', 1.50, '🍗', 12, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'saumon', '', 1.50, '🐟', 13, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'steak 120gr', '', 2.00, '🥩', 14, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'steak 90gr', '', 2.00, '🥩', 15, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'tenders', '', 1.50, '🍗', 16, true);

-- FROMAGES (6 options à 1.00€)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'boursin', '', 1.00, '🧀', 17, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'cheddar', '', 1.00, '🧀', 18, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'chèvre', '', 1.00, '🐐', 19, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'mozzarella', '', 1.00, '🧀', 20, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'raclette', '', 1.00, '🧀', 21, true),
((SELECT id FROM france_products WHERE name = 'MENU SMASH BURGER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Ingredients Supplementaires', 'reblochon', '', 1.00, '🧀', 22, true);

-- ========================================================================
-- 9. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie
SELECT id, name, slug, icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'menus-smash-burgers';

-- Vérifier le produit
SELECT p.name, p.product_type, p.workflow_type, p.requires_steps
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22
  AND c.slug = 'menus-smash-burgers';

-- Vérifier le total d'options (doit être 54)
SELECT COUNT(*) as total_options, '54 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = 'MENU SMASH BURGER'
  AND p.restaurant_id = 22;

-- Vérifier la répartition par groupe
SELECT po.option_group, COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = 'MENU SMASH BURGER'
  AND p.restaurant_id = 22
GROUP BY po.option_group
ORDER BY
  CASE po.option_group
    WHEN 'Choix Burger' THEN 1
    WHEN 'Condiments' THEN 2
    WHEN 'Sauces' THEN 3
    WHEN 'Accompagnements' THEN 4
    WHEN 'Boissons 33cl' THEN 5
    WHEN 'Ingredients Supplementaires' THEN 6
  END;

-- Vérifier les prix des burgers
SELECT po.option_name, po.price_modifier
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = 'MENU SMASH BURGER'
  AND p.restaurant_id = 22
  AND po.option_group = 'Choix Burger'
ORDER BY po.display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 1 catégorie "MENUS SMASH BURGERS" créée
-- 1 produit composite "MENU SMASH BURGER" créé
-- 54 options ajoutées :
--   - 4 choix de burgers (9.00€ à 11.00€)
--   - 4 condiments (gratuits)
--   - 13 sauces (gratuites)
--   - 2 accompagnements (FRITES gratuit, FRITES CHEDDAR BACON +2.50€)
--   - 12 boissons 33cl (gratuites)
--   - 22 ingrédients supplémentaires (1.00€ à 2.00€)
--
-- Workflow en 6 steps :
--   Step 1: Choix du smash burger (obligatoire, 1 parmi 4)
--   Step 2: Condiments (optionnel, max 4)
--   Step 3: Sauce (obligatoire, 1 parmi 13)
--   Step 4: Accompagnement (obligatoire, 1 parmi 2)
--   Step 5: Boisson 33cl (obligatoire, 1 parmi 12)
--   Step 6: Ingrédients supplémentaires (optionnel, max 10)
-- ========================================================================
