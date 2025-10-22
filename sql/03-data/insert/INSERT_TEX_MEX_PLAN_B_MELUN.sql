-- ========================================================================
-- SCRIPT: Insertion catégorie TEX MEX - Plan B Melun
-- DATE: 2025-01-22
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- CATÉGORIE: TEX MEX
-- PRODUITS: 30 produits (5 simples + 17 avec sauce + 8 menus)
-- TOTAL OPTIONS: ~462
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
-- 2. INSERTION PRODUITS SIMPLES (5 produits)
-- ========================================================================

-- 2.1. GRANDE FRITES
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
  1
);

-- 2.2. FRITES CHEDDAR BACON L
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
  2
);

-- 2.3. FRITES CHEDDAR BACON XL
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
  3
);

-- 2.4. BAMBINO TEX MEX
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
  4
);

-- 2.5. BAMBINO CHEESE
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
  5
);

-- ========================================================================
-- 3. INSERTION PRODUITS AVEC SAUCE (17 produits - 1 step)
-- ========================================================================

-- 3.1. PETITE FRITES (2.30€)
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
  'PETITE FRITES',
  'Accompagnées de sauce maison.',
  'composite',
  2.30,
  2.30,
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
  '🍟',
  true,
  6
);

-- 3.2. 4 TENDERS (5.00€)
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

-- 3.3. 4 CHICKEN WINGS (5.00€)
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

-- 3.4. 4 NUGGETS (5.00€)
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

-- 3.5. 4 MOZZA STICKS (5.00€)
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

-- 3.6. DUO MIXTE 4PCS (5.00€)
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
  '🍗',
  true,
  11
);

-- 3.7. 4 JALAPENOS (5.00€)
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
  '🌶️',
  true,
  12
);

-- 3.8. 4 ONION RINGS (5.00€)
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
  '🧅',
  true,
  13
);

-- 3.9. 4 BOUCHEES CAMEMBERT (5.00€)
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
  14
);

-- 3.10. 8 TENDERS (8.50€)
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

-- 3.11. 8 CHICKEN WINGS (8.50€)
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

-- 3.12. 8 NUGGETS (8.50€)
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

-- 3.13. 8 MOZZA STICKS (8.50€)
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

-- 3.14. DUO MIXTE 8PCS (8.50€)
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
  19
);

-- 3.15. 8 JALAPENOS (8.50€)
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
  20
);

-- 3.16. 8 ONION RINGS (8.50€)
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
  '8 ONION RINGS',
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
  '🧅',
  true,
  21
);

-- 3.17. 8 BOUCHEES CAMEMBERT (8.50€)
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
  22
);

-- ========================================================================
-- 4. INSERTION MENUS COMPLETS (8 produits - 3 steps)
-- ========================================================================

-- 4.1. MENU 8 TENDERS (11.20€)
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
  23
);

-- 4.2. MENU 8 JALAPENOS (11.20€)
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
  24
);

-- 4.3. MENU 8 CHICKEN WINGS (11.20€)
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
  25
);

-- 4.4. MENU 8 ONION RINGS (11.20€)
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
  '🧅',
  true,
  26
);

-- 4.5. MENU 8 NUGGETS (11.20€)
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

-- 4.6. MENU 8 BOUCHEES CAMEMBERT (11.20€)
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

-- 4.7. MENU 8 MOZZA STICKS (11.20€)
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

-- 4.8. MENU DUO MIXTE 8PCS (11.20€)
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
  30
);

-- ========================================================================
-- 5. INSERTION OPTIONS - SAUCES (14 options pour 17 + 8 produits = 25 produits)
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
  -- Boucle sur tous les produits qui ont besoin de sauces
  FOR product_record IN
    SELECT id, name
    FROM france_products
    WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22)
      AND product_type = 'composite'
    ORDER BY display_order
  LOOP
    -- Insérer les 14 sauces pour chaque produit
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
-- 6. INSERTION OPTIONS - ACCOMPAGNEMENTS (2 options pour 8 menus)
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
  -- Boucle sur les 8 menus uniquement
  FOR product_record IN
    SELECT id, name
    FROM france_products
    WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22)
      AND name LIKE 'MENU%'
    ORDER BY display_order
  LOOP
    -- Insérer les 2 accompagnements
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
-- 7. INSERTION OPTIONS - BOISSONS 33CL (12 options pour 8 menus)
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
  -- Boucle sur les 8 menus uniquement
  FOR product_record IN
    SELECT id, name
    FROM france_products
    WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tex-mex' AND restaurant_id = 22)
      AND name LIKE 'MENU%'
    ORDER BY display_order
  LOOP
    -- Insérer les 12 boissons
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
-- 8. VÉRIFICATIONS
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

-- Vérifier les 30 produits créés
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
  po.option_group,
  COUNT(*) AS nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tex-mex'
  AND c.restaurant_id = 22
GROUP BY p.name, p.display_order, po.option_group
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
