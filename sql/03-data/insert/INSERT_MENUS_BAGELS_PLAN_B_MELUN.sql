-- ========================================================================
-- INSERTION MENUS BAGELS - PLAN B MELUN
-- DATE: 2025-10-22
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: MENUS BAGELS
-- Objectif : Créer la catégorie et 6 menus bagels complets
-- Total: 1 catégorie + 6 produits + 59 options (6 + 4 + 13 + 2 + 12 + 22)
-- ========================================================================
-- Workflow en 6 étapes:
--   Step 1: Choix Bagel (obligatoire, 1 parmi 6)
--   Step 2: Condiments (optionnel, max 4)
--   Step 3: Sauce (obligatoire, 1 parmi 13)
--   Step 4: Accompagnement (obligatoire, 1 parmi 2)
--   Step 5: Boisson 33cl (obligatoire, 1 parmi 12)
--   Step 6: Ingredients Supplementaires (optionnel, max 10)
-- ========================================================================
-- ⚠️ IMPORTANT : Prix identiques sur place ET livraison (pas de +1€)
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. CRÉATION DE LA CATÉGORIE
-- ========================================================================

INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order, is_active) VALUES
(22, 'MENUS BAGELS', 'menus-bagels', '🥯', 7, true);

-- ========================================================================
-- 2. INSERTION DES 6 PRODUITS BAGELS (COMPOSITE)
-- ========================================================================

-- VEGETARIEN - 9.00€
INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22),
  'VEGETARIEN',
  'Galette de pommes de terre, courgettes grillées, emmental, salade, tomates fraîches, oignons rouges, cornichons + Frites + 1 Boisson 33cl au choix',
  'composite',
  9.00,
  9.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre bagel",
        "option_groups": ["Choix Bagel"],
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
        "option_groups": ["Sauce"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 4,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 5,
        "type": "options_selection",
        "prompt": "votre boisson",
        "option_groups": ["Boisson 33cl"],
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
  '🥗',
  true,
  1
);

-- CHEVRE MIEL - 9.90€
INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22),
  'CHEVRE MIEL',
  'Steak 120 grs, oignons rouges, lardons, chèvre, miel, sauce maison, salade, tomates, cornichons + Frites + 1 Boisson 33cl au choix',
  'composite',
  9.90,
  9.90,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre bagel",
        "option_groups": ["Choix Bagel"],
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
        "option_groups": ["Sauce"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 4,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 5,
        "type": "options_selection",
        "prompt": "votre boisson",
        "option_groups": ["Boisson 33cl"],
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
  '🐐',
  true,
  2
);

-- PRIMEUR - 9.90€
INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22),
  'PRIMEUR',
  'Steak 120 grs, oignons rouges, cornichons, bacon, aubergine, cheddar, salade, tomates + Frites + 1 Boisson 33cl au choix',
  'composite',
  9.90,
  9.90,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre bagel",
        "option_groups": ["Choix Bagel"],
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
        "option_groups": ["Sauce"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 4,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 5,
        "type": "options_selection",
        "prompt": "votre boisson",
        "option_groups": ["Boisson 33cl"],
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
  '🥒',
  true,
  3
);

-- SAUMON - 10.40€
INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22),
  'SAUMON',
  'Saumon fumé, philadelphia, avocat, tomates, salade, oignons rouges, cornichons + Frites + 1 Boisson 33cl au choix',
  'composite',
  10.40,
  10.40,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre bagel",
        "option_groups": ["Choix Bagel"],
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
        "option_groups": ["Sauce"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 4,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 5,
        "type": "options_selection",
        "prompt": "votre boisson",
        "option_groups": ["Boisson 33cl"],
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
  '🐟',
  true,
  4
);

-- DELICE - 9.90€
INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22),
  'DELICE',
  'Escalope de poulet, oignons rouges, mozzarella, tomates, salade, cornichons + Frites + 1 Boisson 33cl au choix',
  'composite',
  9.90,
  9.90,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre bagel",
        "option_groups": ["Choix Bagel"],
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
        "option_groups": ["Sauce"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 4,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 5,
        "type": "options_selection",
        "prompt": "votre boisson",
        "option_groups": ["Boisson 33cl"],
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
  '🍗',
  true,
  5
);

-- DU CHEF - 10.90€
INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22),
  'DU CHEF',
  'Steak 120 grs, oignons rouges, courgettes grillées, cornichons, jaune d''oeuf, emmental, salade, tomates + Frites + 1 Boisson 33cl au choix',
  'composite',
  10.90,
  10.90,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre bagel",
        "option_groups": ["Choix Bagel"],
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
        "option_groups": ["Sauce"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 4,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 5,
        "type": "options_selection",
        "prompt": "votre boisson",
        "option_groups": ["Boisson 33cl"],
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
  '👨‍🍳',
  true,
  6
);

-- ========================================================================
-- 3. STEP 1 - CHOIX BAGEL (6 options)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Choix Bagel', 'VEGETARIEN', 'Galette de pommes de terre, courgettes grillées, emmental, salade, tomates fraîches, oignons rouges, cornichons', 0.00, '🥗', 1, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Choix Bagel', 'CHEVRE MIEL', 'Steak 120 grs, oignons rouges, lardons, chèvre, miel, sauce maison, salade, tomates, cornichons', 0.00, '🐐', 2, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Choix Bagel', 'PRIMEUR', 'Steak 120 grs, oignons rouges, cornichons, bacon, aubergine, cheddar, salade, tomates', 0.00, '🥒', 3, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Choix Bagel', 'SAUMON', 'Saumon fumé, philadelphia, avocat, tomates, salade, oignons rouges, cornichons', 0.00, '🐟', 4, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Choix Bagel', 'DELICE', 'Escalope de poulet, oignons rouges, mozzarella, tomates, salade, cornichons', 0.00, '🍗', 5, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Choix Bagel', 'DU CHEF', 'Steak 120 grs, oignons rouges, courgettes grillées, cornichons, jaune d''oeuf, emmental, salade, tomates', 0.00, '👨‍🍳', 6, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

-- ========================================================================
-- 4. STEP 2 - CONDIMENTS (4 options - optionnel)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Condiments', 'Ketchup', NULL, 0.00, '🍅', 1, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Condiments', 'Mayonnaise', NULL, 0.00, '🥚', 2, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Condiments', 'Moutarde', NULL, 0.00, '🌭', 3, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Condiments', 'Harissa', NULL, 0.00, '🌶️', 4, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

-- ========================================================================
-- 5. STEP 3 - SAUCE (13 options - obligatoire)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Algérienne', NULL, 0.00, '🟡', 1, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Biggy', NULL, 0.00, '🟠', 2, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Barbecue', NULL, 0.00, '🍖', 3, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Blanche', NULL, 0.00, '⚪', 4, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Burger', NULL, 0.00, '🍔', 5, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Samouraï', NULL, 0.00, '⚔️', 6, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Andalouse', NULL, 0.00, '🔴', 7, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Curry', NULL, 0.00, '🟨', 8, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Poivre', NULL, 0.00, '⚫', 9, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Maison', NULL, 0.00, '🏠', 10, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Ketchup', NULL, 0.00, '🍅', 11, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Mayonnaise', NULL, 0.00, '🥚', 12, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'Tartare', NULL, 0.00, '🐟', 13, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

-- ========================================================================
-- 6. STEP 4 - ACCOMPAGNEMENT (2 options - obligatoire)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'Frites', NULL, 0.00, '🍟', 1, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'Frites cheddar bacon', NULL, 2.50, '🧀', 2, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

-- ========================================================================
-- 7. STEP 5 - BOISSON 33CL (12 options - obligatoire)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Coca Cola', NULL, 0.00, '🥤', 1, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Coca Zero', NULL, 0.00, '🥤', 2, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Ice Tea', NULL, 0.00, '🧃', 3, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Ice Tea Pêche', NULL, 0.00, '🍑', 4, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Orangina', NULL, 0.00, '🍊', 5, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Fanta', NULL, 0.00, '🟠', 6, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Schweppes', NULL, 0.00, '💚', 7, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Oasis', NULL, 0.00, '🍹', 8, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Tropico', NULL, 0.00, '🌴', 9, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Perrier', NULL, 0.00, '💧', 10, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Sprite', NULL, 0.00, '💚', 11, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'Eau minérale', NULL, 0.00, '💧', 12, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

-- ========================================================================
-- 8. STEP 6 - INGREDIENTS SUPPLEMENTAIRES (22 options - optionnel)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Cheddar', NULL, 1.00, '🧀', 1, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Bacon', NULL, 1.50, '🥓', 2, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Oeuf', NULL, 1.00, '🍳', 3, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Oignons', NULL, 0.50, '🧅', 4, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Champignons', NULL, 1.00, '🍄', 5, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Cornichons', NULL, 0.50, '🥒', 6, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Salade', NULL, 0.50, '🥬', 7, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Tomates', NULL, 0.50, '🍅', 8, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Oignons frits', NULL, 1.00, '🧅', 9, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Avocat', NULL, 2.00, '🥑', 10, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Raclette', NULL, 2.00, '🧀', 11, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Mozzarella', NULL, 1.50, '🧀', 12, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Chèvre', NULL, 1.50, '🐐', 13, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Emmental', NULL, 1.00, '🧀', 14, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Steak 120g', NULL, 3.00, '🥩', 15, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Double steak', NULL, 5.50, '🥩', 16, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Nuggets', NULL, 2.50, '🍗', 17, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Tenders', NULL, 3.00, '🍗', 18, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Lardons', NULL, 1.50, '🥓', 19, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Courgettes grillées', NULL, 1.00, '🥒', 20, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Aubergine', NULL, 1.00, '🍆', 21, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Ingredients Supplementaires', 'Galette pommes de terre', NULL, 1.50, '🥔', 22, true
FROM france_products p WHERE p.name IN ('VEGETARIEN', 'CHEVRE MIEL', 'PRIMEUR', 'SAUMON', 'DELICE', 'DU CHEF') AND p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

-- ========================================================================
-- 9. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie
SELECT id, name, slug FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22;

-- Vérifier les 6 produits
SELECT name, price_on_site_base, price_delivery_base, product_type FROM france_products
WHERE restaurant_id = 22 AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22)
ORDER BY display_order;

-- Vérifier le total d'options (doit être 59)
SELECT COUNT(*) as total_options, '59 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22);

-- Vérifier la répartition par groupe
SELECT po.option_group, COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-bagels' AND restaurant_id = 22)
GROUP BY po.option_group
ORDER BY po.option_group;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 1 catégorie "MENUS BAGELS" créée
-- 6 produits créés (VEGETARIEN, CHEVRE MIEL, PRIMEUR, SAUMON, DELICE, DU CHEF)
-- 59 options ajoutées :
--   - 6 choix bagel (step 1)
--   - 4 condiments optionnels (step 2)
--   - 13 sauces (step 3)
--   - 2 accompagnements (step 4)
--   - 12 boissons 33cl (step 5)
--   - 22 ingrédients supplémentaires (step 6)
-- ========================================================================
