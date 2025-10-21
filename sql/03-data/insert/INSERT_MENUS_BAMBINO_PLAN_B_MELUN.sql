-- ========================================================================
-- INSERTION MENUS BAMBINO - PLAN B MELUN
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: MENUS BAMBINO
-- Produits: 2 (1 composite + 1 simple)
-- Prix: Identiques sur place et livraison (pas de +1€)
-- Format: universal_workflow_v2 avec france_product_options
-- ========================================================================

BEGIN;

-- 1️⃣ CRÉATION CATÉGORIE
INSERT INTO france_menu_categories (
  restaurant_id,
  name,
  slug,
  description,
  display_order,
  icon,
  is_active
) VALUES (
  22,                                    -- Plan B Melun
  'MENUS BAMBINO',
  'menus-bambino',
  'Menus enfants avec surprise',
  1,
  '👶',
  true
) RETURNING id;

-- 2️⃣ PRODUIT 1 : BAMBINO TEX MEX (COMPOSITE)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-bambino' AND restaurant_id = 22),
  'BAMBINO TEX MEX',
  '4 Nuggets ou 4 Mozza Sticks + Frites + Sauce (ketchup/mayonnaise) + 1 Kinder Surprise + 1 Capri Sun',
  'composite',
  5.50,
  5.50,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre choix",
        "option_groups": ["Choix principal"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗👶',
  true,
  1
) RETURNING id;

-- 3️⃣ OPTIONS POUR BAMBINO TEX MEX
-- Option 1 : Mozzarella Sticks
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  icon,
  display_order,
  is_active
) VALUES (
  (SELECT id FROM france_products WHERE name = 'BAMBINO TEX MEX' AND restaurant_id = 22),
  'Choix principal',
  '4 Mozzarella Sticks',
  0.00,
  '🧀',
  1,
  true
);

-- Option 2 : Nuggets
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  icon,
  display_order,
  is_active
) VALUES (
  (SELECT id FROM france_products WHERE name = 'BAMBINO TEX MEX' AND restaurant_id = 22),
  'Choix principal',
  '4 Nuggets',
  0.00,
  '🍗',
  2,
  true
);

-- 4️⃣ PRODUIT 2 : BAMBINO CHEESE (SIMPLE)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-bambino' AND restaurant_id = 22),
  'BAMBINO CHEESE',
  'Cheese burger + Frites + Sauce (ketchup/mayonnaise) + 1 Kinder Surprise + 1 Capri Sun',
  'simple',
  5.50,
  5.50,
  '🍔👶',
  true,
  2
);

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT
  id,
  name,
  slug,
  display_order,
  icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'menus-bambino';

-- Vérifier les produits créés
SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.product_type,
  p.workflow_type,
  p.requires_steps,
  p.icon,
  p.display_order,
  c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22
  AND c.slug = 'menus-bambino'
ORDER BY p.display_order;

-- Vérifier le workflow et les options du BAMBINO TEX MEX
SELECT
  p.id as product_id,
  p.name as product_name,
  p.workflow_type,
  p.steps_config,
  po.option_group,
  po.option_name,
  po.price_modifier,
  po.icon as option_icon,
  po.display_order
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = 'BAMBINO TEX MEX'
ORDER BY po.option_group, po.display_order;

-- Transaction validée automatiquement en cas de succès
COMMIT;

-- En cas d'erreur : ROLLBACK;

-- ========================================================================
-- NOTES IMPORTANTES :
-- ========================================================================
-- 1. Prix identiques sur place et livraison : 5.50€
-- 2. BAMBINO TEX MEX : Format universal_workflow_v2
--    - Steps config référence "Choix principal"
--    - Options stockées dans france_product_options
--    - 2 options : Mozzarella Sticks et Nuggets (price_modifier = 0)
-- 3. BAMBINO CHEESE : Simple (ajout direct)
-- 4. Restaurant : Plan B Melun (id=22)
-- ========================================================================
