-- ========================================================================
-- VERSION: V2
-- DATE: 2025-01-22
-- PROBLÈME RÉSOLU: Workflows correctement structurés selon fichier de specs
-- CHANGEMENTS:
--   - 29 produits (6 simples + 14 avec sauce + 9 workflows spéciaux)
--   - DUO MIXTE 8PCS (8.50€): 1 step (2 tex mex)
--   - MENU DUO MIXTE 8PCS (11.20€): 2 steps (2 tex mex + 5 boissons)
--   - MENU 8 ONION RINGS: 2 steps (sauce + 12 boissons)
--   - 6 MENUS: 3 steps (accompagnement + sauce + 12 boissons)
-- ========================================================================
-- SCRIPT: Insertion catégorie TEX MEX V2 - Plan B Melun
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- CATÉGORIE: TEX MEX
-- TOTAL OPTIONS: ~322
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. CRÉATION CATÉGORIE
-- ========================================================================

INSERT INTO france_menu_categories (
  restaurant_id,
  name,
  slug,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  'TEX MEX',
  'tex-mex',
  '🌮',
  true,
  15
) ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- ========================================================================
-- 2. INSERTION PRODUITS SIMPLES (6 produits)
-- ========================================================================

-- 2.1. PETITE FRITES
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'PETITE FRITES',
  'Accompagnées de sauce maison.',
  'simple',
  2.30,
  2.30,
  '🍟',
  true,
  1
);

-- 2.2. GRANDE FRITES
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'GRANDE FRITES',
  'Accompagnées de sauce maison.',
  'simple',
  3.00,
  3.00,
  '🍟',
  true,
  2
);

-- 2.3. FRITES CHEDDAR BACON L
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'FRITES CHEDDAR BACON L',
  '',
  'simple',
  4.00,
  4.00,
  '🍟',
  true,
  3
);

-- 2.4. FRITES CHEDDAR BACON XL
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'FRITES CHEDDAR BACON XL',
  '',
  'simple',
  6.50,
  6.50,
  '🍟',
  true,
  4
);

-- 2.5. BAMBINO TEX MEX
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'BAMBINO TEX MEX',
  '4 Nuggets ou 4 mozza sticks + Frites + 1 kinder surprise + 1 Caprisun.',
  'simple',
  5.50,
  5.50,
  '🧒',
  true,
  5
);

-- 2.6. BAMBINO CHEESE
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'BAMBINO CHEESE',
  '1 Cheese burger + Frites + 1 kinder surprise + 1 Caprisun.',
  'simple',
  5.50,
  5.50,
  '🧒',
  true,
  6
);

-- ========================================================================
-- 3. INSERTION PRODUITS 1 STEP SAUCE (14 produits - À 5.00€)
-- ========================================================================

-- 3.1. 4 TENDERS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '4 TENDERS',
  '4 Pièces.',
  'composite',
  5.00,
  5.00,
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
  7
);

-- 3.2. 4 CHICKEN WINGS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '4 CHICKEN WINGS',
  '4 Pièces.',
  'composite',
  5.00,
  5.00,
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
  8
);

-- 3.3. 4 NUGGETS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '4 NUGGETS',
  '4 Pièces.',
  'composite',
  5.00,
  5.00,
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
  9
);

-- 3.4. 4 MOZZA STICKS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '4 MOZZA STICKS',
  '',
  'composite',
  5.00,
  5.00,
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
  '🧀',
  true,
  10
);

-- 3.5. DUO MIXTE 4PCS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'DUO MIXTE 4PCS',
  '4 Pièces mixte.',
  'composite',
  5.00,
  5.00,
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
  11
);

-- 3.6. 4 JALAPENOS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '4 JALAPENOS',
  '4 Pièces.',
  'composite',
  5.00,
  5.00,
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
  '🌶️',
  true,
  12
);

-- 3.7. 4 ONION RINGS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '4 ONION RINGS',
  '4 Pièces.',
  'composite',
  5.00,
  5.00,
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
  '🧅',
  true,
  13
);

-- 3.8. 4 BOUCHEES CAMEMBERT
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '4 BOUCHEES CAMEMBERT',
  '4 Pièces.',
  'composite',
  5.00,
  5.00,
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
  '🧀',
  true,
  14
);

-- ========================================================================
-- 4. INSERTION PRODUITS 1 STEP SAUCE (6 produits - À 8.50€)
-- ========================================================================

-- 4.1. 8 TENDERS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '8 TENDERS',
  '8 Pièces.',
  'composite',
  8.50,
  8.50,
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
  15
);

-- 4.2. 8 CHICKEN WINGS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '8 CHICKEN WINGS',
  '8 Pièces.',
  'composite',
  8.50,
  8.50,
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
  16
);

-- 4.3. 8 NUGGETS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '8 NUGGETS',
  '8 Pièces.',
  'composite',
  8.50,
  8.50,
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
  17
);

-- 4.4. 8 MOZZA STICKS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '8 MOZZA STICKS',
  '',
  'composite',
  8.50,
  8.50,
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
  '🧀',
  true,
  18
);

-- 4.5. 8 JALAPENOS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '8 JALAPENOS',
  '',
  'composite',
  8.50,
  8.50,
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
  '🌶️',
  true,
  19
);

-- 4.6. 8 BOUCHEES CAMEMBERT
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  '8 BOUCHEES CAMEMBERT',
  '8 Pièces.',
  'composite',
  8.50,
  8.50,
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
  '🧀',
  true,
  20
);

-- ========================================================================
-- 5. TYPE 3A : DUO MIXTE 8PCS (8.50€) - 1 STEP (2 tex mex)
-- ========================================================================

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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'DUO MIXTE 8PCS',
  '8 Pièces mixte.',
  'composite',
  8.50,
  8.50,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "vos 2 tex mex",
        "option_groups": ["Tex Mex"],
        "required": true,
        "max_selections": 2
      }
    ]
  }'::json,
  '🍗',
  true,
  21
);

-- ========================================================================
-- 6. TYPE 3B : MENU DUO MIXTE 8PCS (11.20€) - 2 STEPS
-- ========================================================================

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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'MENU DUO MIXTE 8PCS',
  '8 Pièces mixte + Frites + 1 Boisson 33cl au choix.',
  'composite',
  11.20,
  11.20,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "vos 2 tex mex",
        "option_groups": ["Tex Mex"],
        "required": true,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boisson 33cl"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  22
);

-- ========================================================================
-- 7. TYPE 3C : MENU 8 ONION RINGS (11.20€) - 2 STEPS
-- ========================================================================

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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'MENU 8 ONION RINGS',
  '8 Pièces + Frites + 1 Boisson 33cl au choix.',
  'composite',
  11.20,
  11.20,
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
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boisson 33cl"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🧅',
  true,
  23
);

-- ========================================================================
-- 8. TYPE 4 : MENUS 3 STEPS (6 produits à 11.20€)
-- ========================================================================

-- 8.1. MENU 8 TENDERS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'MENU 8 TENDERS',
  '8 Pièces + Frites + 1 Boisson 33cl au choix.',
  'composite',
  11.20,
  11.20,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
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
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boisson 33cl"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  24
);

-- 8.2. MENU 8 JALAPENOS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'MENU 8 JALAPENOS',
  '8 Pièces + Frites + 1 Boisson 33cl au choix.',
  'composite',
  11.20,
  11.20,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
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
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boisson 33cl"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🌶️',
  true,
  25
);

-- 8.3. MENU 8 CHICKEN WINGS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'MENU 8 CHICKEN WINGS',
  '8 Pièces + Frites + 1 Boisson 33cl au choix.',
  'composite',
  11.20,
  11.20,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
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
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boisson 33cl"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  26
);

-- 8.4. MENU 8 NUGGETS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'MENU 8 NUGGETS',
  '8 Pièces + Frites + 1 Boisson 33cl au choix.',
  'composite',
  11.20,
  11.20,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
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
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boisson 33cl"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  27
);

-- 8.5. MENU 8 BOUCHEES CAMEMBERT
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'MENU 8 BOUCHEES CAMEMBERT',
  '8 Pièces + Frites + 1 Boisson 33cl au choix.',
  'composite',
  11.20,
  11.20,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
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
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boisson 33cl"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🧀',
  true,
  28
);

-- 8.6. MENU 8 MOZZA STICKS
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
  (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22),
  'MENU 8 MOZZA STICKS',
  '8 Pièces + Frites + 1 Boisson 33cl au choix.',
  'composite',
  11.20,
  11.20,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre accompagnement",
        "option_groups": ["Accompagnement"],
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
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "votre boisson 33cl",
        "option_groups": ["Boisson 33cl"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🧀',
  true,
  29
);

-- ========================================================================
-- 9. INSERTION OPTIONS - SAUCES (14 options pour 14 produits + 7 menus = 21 produits)
-- ========================================================================

DO $$
DECLARE
  product_record RECORD;
  sauces TEXT[][] := ARRAY[
    ['ANDALOUSE', '🍯'],
    ['CHILI THAI', '🌶️'],
    ['BIGGY BURGER', '🍔'],
    ['MOUTARDE', '🟡'],
    ['CURRY', '🟡'],
    ['FISH TO FISH', '🐟'],
    ['ALGERIENNE', '🌶️'],
    ['MAYONNAISE', '🥚'],
    ['HARISSA', '🌶️'],
    ['KETCHUP', '🍅'],
    ['BARBECUE', '🍖'],
    ['BLANCHE', '🥛'],
    ['SAMOURAI', '🌶️'],
    ['POIVRE', '⚫']
  ];
  i INTEGER;
BEGIN
  -- Produits avec sauce : 14 produits (4 TENDERS à 8 BOUCHEES CAMEMBERT) + 7 menus (MENU 8 ONION RINGS + 6 MENUS 3 steps)
  FOR product_record IN
    SELECT id, name
    FROM france_products
    WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22)
      AND product_type = 'composite'
      AND name NOT LIKE 'DUO MIXTE%' -- Exclure les DUO MIXTE qui ont workflow tex mex
      AND name <> 'MENU DUO MIXTE 8PCS' -- Exclure le MENU DUO MIXTE qui a workflow tex mex
    ORDER BY display_order
  LOOP
    FOR i IN 1..array_length(sauces, 1) LOOP
      INSERT INTO france_product_options (
        product_id,
        option_group,
        option_name,
        price_modifier,
        icon,
        is_active,
        display_order
      ) VALUES (
        product_record.id,
        'Sauce',
        sauces[i][1],
        0.00,
        sauces[i][2],
        true,
        i
      );
    END LOOP;
  END LOOP;
END $$;

-- ========================================================================
-- 10. INSERTION OPTIONS - TEX MEX (4 options pour DUO MIXTE 8PCS et MENU DUO MIXTE 8PCS)
-- ========================================================================

DO $$
DECLARE
  product_record RECORD;
  tex_mex TEXT[][] := ARRAY[
    ['4 MOZZARELLA STICKS', '🧀'],
    ['4 NUGGETS', '🍗'],
    ['4 CHICKEN WINGS', '🍗'],
    ['4 TENDERS', '🍗']
  ];
  i INTEGER;
BEGIN
  -- DUO MIXTE 8PCS (8.50€) et MENU DUO MIXTE 8PCS (11.20€)
  FOR product_record IN
    SELECT id, name
    FROM france_products
    WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22)
      AND (name = 'DUO MIXTE 8PCS' OR name = 'MENU DUO MIXTE 8PCS')
    ORDER BY display_order
  LOOP
    FOR i IN 1..array_length(tex_mex, 1) LOOP
      INSERT INTO france_product_options (
        product_id,
        option_group,
        option_name,
        price_modifier,
        icon,
        is_active,
        display_order
      ) VALUES (
        product_record.id,
        'Tex Mex',
        tex_mex[i][1],
        0.00,
        tex_mex[i][2],
        true,
        i
      );
    END LOOP;
  END LOOP;
END $$;

-- ========================================================================
-- 11. INSERTION OPTIONS - BOISSONS 33CL DUO MIXTE (5 options pour MENU DUO MIXTE 8PCS uniquement)
-- ========================================================================

DO $$
DECLARE
  product_id_menu_duo INTEGER;
  boissons TEXT[][] := ARRAY[
    ['COCA COLA 33CL', '🥤'],
    ['ICE TEA 33CL', '🧃'],
    ['PERRIER 33CL', '💧'],
    ['COCA COLA ZERO 33CL', '🥤'],
    ['OASIS 33CL', '🧃']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_menu_duo
  FROM france_products
  WHERE name = 'MENU DUO MIXTE 8PCS' AND restaurant_id = 22;

  FOR i IN 1..array_length(boissons, 1) LOOP
    INSERT INTO france_product_options (
      product_id,
      option_group,
      option_name,
      price_modifier,
      icon,
      is_active,
      display_order
    ) VALUES (
      product_id_menu_duo,
      'Boisson 33cl',
      boissons[i][1],
      0.00,
      boissons[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- ========================================================================
-- 12. INSERTION OPTIONS - BOISSONS 33CL STANDARD (12 options pour 7 menus)
-- ========================================================================

DO $$
DECLARE
  product_record RECORD;
  boissons TEXT[][] := ARRAY[
    ['COCA COLA 33CL', '🥤'],
    ['COCA COLA ZERO 33CL', '🥤'],
    ['COCA COLA CHERRY 33CL', '🥤'],
    ['FANTA ORANGE 33CL', '🥤'],
    ['FANTA EXOTIQUE 33CL', '🥤'],
    ['ICE TEA 33CL', '🧃'],
    ['OASIS 33CL', '🧃'],
    ['7 UP MOJITO 33CL', '🥤'],
    ['PERRIER 33CL', '💧'],
    ['TROPICO 33CL', '🧃'],
    ['SPRITE 33CL', '🥤'],
    ['EAU 33CL', '💧']
  ];
  i INTEGER;
BEGIN
  -- MENU 8 ONION RINGS + 6 MENUS 3 steps
  FOR product_record IN
    SELECT id, name
    FROM france_products
    WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22)
      AND name LIKE 'MENU%'
      AND name <> 'MENU DUO MIXTE 8PCS' -- Exclure MENU DUO MIXTE qui a seulement 5 boissons
    ORDER BY display_order
  LOOP
    FOR i IN 1..array_length(boissons, 1) LOOP
      INSERT INTO france_product_options (
        product_id,
        option_group,
        option_name,
        price_modifier,
        icon,
        is_active,
        display_order
      ) VALUES (
        product_record.id,
        'Boisson 33cl',
        boissons[i][1],
        0.00,
        boissons[i][2],
        true,
        i
      );
    END LOOP;
  END LOOP;
END $$;

-- ========================================================================
-- 13. INSERTION OPTIONS - ACCOMPAGNEMENTS (2 options pour 6 menus 3 steps)
-- ========================================================================

DO $$
DECLARE
  product_record RECORD;
  accompagnements TEXT[][] := ARRAY[
    ['FRITES', '🍟', '0.00'],
    ['FRITES CHEDDAR BACON', '🍟', '2.50']
  ];
  i INTEGER;
BEGIN
  -- 6 MENUS 3 steps uniquement (pas MENU 8 ONION RINGS ni MENU DUO MIXTE)
  FOR product_record IN
    SELECT id, name
    FROM france_products
    WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22)
      AND name LIKE 'MENU%'
      AND name <> 'MENU 8 ONION RINGS'
      AND name <> 'MENU DUO MIXTE 8PCS'
    ORDER BY display_order
  LOOP
    FOR i IN 1..array_length(accompagnements, 1) LOOP
      INSERT INTO france_product_options (
        product_id,
        option_group,
        option_name,
        price_modifier,
        icon,
        is_active,
        display_order
      ) VALUES (
        product_record.id,
        'Accompagnement',
        accompagnements[i][1],
        accompagnements[i][3]::DECIMAL,
        accompagnements[i][2],
        true,
        i
      );
    END LOOP;
  END LOOP;
END $$;

-- ========================================================================
-- 14. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT
  id,
  name,
  slug,
  icon,
  display_order
FROM france_menu_categories
WHERE slug = 'tex-mex' AND restaurant_id = 22;

-- Vérifier les 29 produits créés
SELECT
  id,
  name,
  product_type,
  price_on_site_base,
  display_order
FROM france_products
WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22)
ORDER BY display_order;

-- Vérifier le nombre d'options par produit et par groupe
SELECT
  p.name AS product_name,
  p.price_on_site_base AS prix,
  po.option_group,
  COUNT(*) AS nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tex-mex'
  AND c.restaurant_id = 22
GROUP BY p.name, p.price_on_site_base, p.display_order, po.option_group
ORDER BY p.display_order, po.option_group;

-- Vérifier le total d'options créées
SELECT
  'Total options créées' AS info,
  COUNT(*) AS total
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tex-mex'
  AND c.restaurant_id = 22;

COMMIT;
-- En cas de problème: ROLLBACK;
