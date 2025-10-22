-- ========================================================================
-- INSERTION POULET CROUSTY - PLAN B MELUN
-- DATE: 2025-10-22
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: POULET CROUSTY
-- Objectif : Créer la catégorie et 4 produits POULET CROUSTY
-- Total: 1 catégorie + 4 produits + 64 options
-- ========================================================================
-- Structure :
--   - POULET CROUSTY L SEUL (9.40€) - 2 steps : boisson + sauce
--   - POULET CROUSTY L MENU (10.40€) - 1 step : sauce
--   - POULET CROUSTY XL SEUL (16.40€) - 2 steps : boisson + sauce
--   - POULET CROUSTY XL MENU (18.40€) - 1 step : sauce
-- ========================================================================
-- ⚠️ IMPORTANT : Prix identiques sur place ET livraison (pas de +1€)
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. CRÉATION DE LA CATÉGORIE
-- ========================================================================

INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order, is_active) VALUES
(22, 'POULET CROUSTY', 'poulet-crousty', '🍗', 10, true);

-- ========================================================================
-- 2. INSERTION DES 4 PRODUITS (COMPOSITE)
-- ========================================================================

-- ========================================================================
-- 2.1. POULET CROUSTY L SEUL - 9.40€
-- ========================================================================
-- Workflow 2 étapes : Boisson 33cl + Sauce
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'poulet-crousty' AND restaurant_id = 22),
  'POULET CROUSTY L SEUL',
  'Poulet crousty taille L avec boisson 33cl et sauce au choix',
  'composite',
  9.40,
  9.40,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boisson 33cl"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre sauce",
        "option_groups": ["Sauce"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  1
);

-- ========================================================================
-- 2.2. POULET CROUSTY L MENU - 10.40€
-- ========================================================================
-- Workflow 1 étape : Sauce seulement (boisson déjà incluse)
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'poulet-crousty' AND restaurant_id = 22),
  'POULET CROUSTY L MENU',
  'Poulet crousty taille L avec boisson et sauce au choix',
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
        "prompt": "votre sauce",
        "option_groups": ["Sauce"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  2
);

-- ========================================================================
-- 2.3. POULET CROUSTY XL SEUL - 16.40€
-- ========================================================================
-- Workflow 2 étapes : Boisson 33cl + Sauce
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'poulet-crousty' AND restaurant_id = 22),
  'POULET CROUSTY XL SEUL',
  'Poulet crousty taille XL avec boisson 33cl et sauce au choix',
  'composite',
  16.40,
  16.40,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boisson 33cl"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre sauce",
        "option_groups": ["Sauce"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  3
);

-- ========================================================================
-- 2.4. POULET CROUSTY XL MENU - 18.40€
-- ========================================================================
-- Workflow 1 étape : Sauce seulement (boisson déjà incluse)
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'poulet-crousty' AND restaurant_id = 22),
  'POULET CROUSTY XL MENU',
  'Poulet crousty taille XL avec boisson et sauce au choix',
  'composite',
  18.40,
  18.40,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre sauce",
        "option_groups": ["Sauce"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  4
);

-- ========================================================================
-- 3. OPTIONS - BOISSONS 33CL (13 options pour SEUL uniquement)
-- ========================================================================

-- Boissons pour POULET CROUSTY L SEUL
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'COCA COLA 33CL', NULL, 0.00, '🥤', 1, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'COCA COLA ZERO 33CL', NULL, 0.00, '🥤', 2, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'COCA COLA CHERRY 33CL', NULL, 0.00, '🥤', 3, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'ICE TEA 33CL', NULL, 0.00, '🧃', 4, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'OASIS 33CL', NULL, 0.00, '🍹', 5, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'PERRIER 33CL', NULL, 0.00, '💧', 6, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'SCHWEPPES AGRUM 33CL', NULL, 0.00, '💚', 7, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'TROPICO 33CL', NULL, 0.00, '🌴', 8, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'FANTA ORANGE 33CL', NULL, 0.00, '🟠', 9, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'FANTA EXOTIQUE 33CL', NULL, 0.00, '🟠', 10, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'SPRITE 33CL', NULL, 0.00, '💚', 11, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', '7 UP MOJITO 33CL', NULL, 0.00, '🍸', 12, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'EAU 33CL', NULL, 0.00, '💧', 13, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

-- Boissons pour POULET CROUSTY XL SEUL
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'COCA COLA 33CL', NULL, 0.00, '🥤', 1, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'COCA COLA ZERO 33CL', NULL, 0.00, '🥤', 2, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'COCA COLA CHERRY 33CL', NULL, 0.00, '🥤', 3, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'ICE TEA 33CL', NULL, 0.00, '🧃', 4, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'OASIS 33CL', NULL, 0.00, '🍹', 5, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'PERRIER 33CL', NULL, 0.00, '💧', 6, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'SCHWEPPES AGRUM 33CL', NULL, 0.00, '💚', 7, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'TROPICO 33CL', NULL, 0.00, '🌴', 8, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'FANTA ORANGE 33CL', NULL, 0.00, '🟠', 9, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'FANTA EXOTIQUE 33CL', NULL, 0.00, '🟠', 10, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'SPRITE 33CL', NULL, 0.00, '💚', 11, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', '7 UP MOJITO 33CL', NULL, 0.00, '🍸', 12, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 33cl', 'EAU 33CL', NULL, 0.00, '💧', 13, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

-- ========================================================================
-- 4. OPTIONS - SAUCES (3 options pour TOUS les produits)
-- ========================================================================

-- Sauces pour POULET CROUSTY L SEUL
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SUCREE', NULL, 0.00, '🍯', 1, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SALEE', NULL, 0.00, '🧂', 2, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SUCREE SALEE', NULL, 0.00, '🍯', 3, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L SEUL' AND p.restaurant_id = 22;

-- Sauces pour POULET CROUSTY L MENU
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SUCREE', NULL, 0.00, '🍯', 1, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L MENU' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SALEE', NULL, 0.00, '🧂', 2, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L MENU' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SUCREE SALEE', NULL, 0.00, '🍯', 3, true
FROM france_products p WHERE p.name = 'POULET CROUSTY L MENU' AND p.restaurant_id = 22;

-- Sauces pour POULET CROUSTY XL SEUL
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SUCREE', NULL, 0.00, '🍯', 1, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SALEE', NULL, 0.00, '🧂', 2, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SUCREE SALEE', NULL, 0.00, '🍯', 3, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL SEUL' AND p.restaurant_id = 22;

-- Sauces pour POULET CROUSTY XL MENU
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SUCREE', NULL, 0.00, '🍯', 1, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL MENU' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SALEE', NULL, 0.00, '🧂', 2, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL MENU' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Sauce', 'SUCREE SALEE', NULL, 0.00, '🍯', 3, true
FROM france_products p WHERE p.name = 'POULET CROUSTY XL MENU' AND p.restaurant_id = 22;

-- ========================================================================
-- 5. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie
SELECT id, name, slug FROM france_menu_categories WHERE slug = 'poulet-crousty' AND restaurant_id = 22;

-- Vérifier les 4 produits
SELECT name, price_on_site_base, price_delivery_base, product_type FROM france_products
WHERE restaurant_id = 22 AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'poulet-crousty' AND restaurant_id = 22)
ORDER BY display_order;

-- Vérifier le total d'options (doit être 64)
SELECT COUNT(*) as total_options, '64 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'poulet-crousty' AND restaurant_id = 22);

-- Vérifier la répartition par produit
SELECT p.name, COUNT(po.id) as nb_options
FROM france_products p
LEFT JOIN france_product_options po ON po.product_id = p.id
WHERE p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'poulet-crousty' AND restaurant_id = 22)
GROUP BY p.name, p.display_order
ORDER BY p.display_order;

-- Vérifier la répartition par groupe
SELECT po.option_group, COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'poulet-crousty' AND restaurant_id = 22)
GROUP BY po.option_group
ORDER BY po.option_group;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 1 catégorie "POULET CROUSTY" créée
-- 4 produits créés :
--   1. POULET CROUSTY L SEUL (9.40€) - 16 options (13 boissons + 3 sauces)
--   2. POULET CROUSTY L MENU (10.40€) - 3 options (3 sauces)
--   3. POULET CROUSTY XL SEUL (16.40€) - 16 options (13 boissons + 3 sauces)
--   4. POULET CROUSTY XL MENU (18.40€) - 3 options (3 sauces)
-- Total : 64 options
--
-- Workflows :
--   - SEUL : 2 steps (boisson + sauce)
--   - MENU : 1 step (sauce seulement)
-- ========================================================================
