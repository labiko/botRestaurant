-- ========================================================================
-- SCRIPT: Insertion catégorie SALADES - Plan B Melun
-- DATE: 2025-01-22
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- CATÉGORIE: SALADES
-- PRODUITS: 5 salades à 8.00€
-- WORKFLOW: universal_workflow_v2 avec 1 ou 2 steps selon produit
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
  'SALADES',
  'salades',
  '🥗',
  true,
  12
) ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- ========================================================================
-- 2. INSERTION DES 5 PRODUITS
-- ========================================================================

-- 2.1. POULET (2 steps: boisson + suppléments)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'salades' AND restaurant_id = 22),
  'POULET',
  'Salade verte, tomates, poulet, maïs, oeuf. Servie avec pain et boisson 33cl au choix.',
  'composite',
  8.00,
  8.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre boisson 33cl (optionnel)",
        "option_groups": ["Boisson 33cl"],
        "required": false,
        "max_selections": 3
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "vos ingrédients supplémentaires (optionnel)",
        "option_groups": ["Ingrédients supplémentaires"],
        "required": false,
        "max_selections": 999
      }
    ]
  }'::json,
  '🥗',
  true,
  1
);

-- 2.2. NICOISE (1 step: suppléments uniquement)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'salades' AND restaurant_id = 22),
  'NICOISE',
  'Salade verte, tomates, thon, pommes de terre, oeuf.',
  'composite',
  8.00,
  8.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "vos ingrédients supplémentaires (optionnel)",
        "option_groups": ["Ingrédients supplémentaires"],
        "required": false,
        "max_selections": 999
      }
    ]
  }'::json,
  '🥗',
  true,
  2
);

-- 2.3. CHEVRE CHAUD (2 steps: boisson + suppléments)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'salades' AND restaurant_id = 22),
  'CHEVRE CHAUD',
  'Salade verte, tomates, chèvre, croûtons, mozzarella. Servie avec pain et boisson 33cl au choix.',
  'composite',
  8.00,
  8.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre boisson 33cl (optionnel)",
        "option_groups": ["Boisson 33cl"],
        "required": false,
        "max_selections": 3
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "vos ingrédients supplémentaires (optionnel)",
        "option_groups": ["Ingrédients supplémentaires"],
        "required": false,
        "max_selections": 999
      }
    ]
  }'::json,
  '🥗',
  true,
  3
);

-- 2.4. AVOCAT CREVETTES (2 steps: boisson + suppléments avec prix différents)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'salades' AND restaurant_id = 22),
  'AVOCAT CREVETTES',
  'Salade verte, tomates, avocat, crevettes, citron. Servie avec pain et boisson 33cl au choix.',
  'composite',
  8.00,
  8.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre boisson 33cl (optionnel)",
        "option_groups": ["Boisson 33cl"],
        "required": false,
        "max_selections": 3
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "vos ingrédients supplémentaires (optionnel)",
        "option_groups": ["Ingrédients supplémentaires"],
        "required": false,
        "max_selections": 999
      }
    ]
  }'::json,
  '🥗',
  true,
  4
);

-- 2.5. ITALIENNE (2 steps: boisson + suppléments)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'salades' AND restaurant_id = 22),
  'ITALIENNE',
  'Salade verte, tomates, thon, oignons rouges, maïs, mozzarella. Servie avec pain et boisson 33cl au choix.',
  'composite',
  8.00,
  8.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre boisson 33cl (optionnel)",
        "option_groups": ["Boisson 33cl"],
        "required": false,
        "max_selections": 3
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "vos ingrédients supplémentaires (optionnel)",
        "option_groups": ["Ingrédients supplémentaires"],
        "required": false,
        "max_selections": 999
      }
    ]
  }'::json,
  '🥗',
  true,
  5
);

-- ========================================================================
-- 3. INSERTION DES OPTIONS - BOISSONS 33CL (+0.7€)
-- ========================================================================

-- 3.1. BOISSONS pour POULET (12 options)
DO $$
DECLARE
  product_id_poulet INTEGER;
  boissons TEXT[][] := ARRAY[
    ['COCA COLA 33CL', '🥤'],
    ['COCA COLA ZERO 33CL', '🥤'],
    ['COCA COLA CHERRY 33CL', '🥤'],
    ['ICE TEA 33CL', '🧃'],
    ['OASIS 33CL', '🧃'],
    ['7 UP MOJITO 33CL', '🥤'],
    ['TROPICO 33CL', '🧃'],
    ['FANTA ORANGE 33CL', '🥤'],
    ['FANTA EXOTIQUE 33CL', '🥤'],
    ['PERRIER 33CL', '💧'],
    ['SPRITE 33CL', '🥤'],
    ['EAU 33CL', '💧']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_poulet
  FROM france_products
  WHERE name = 'POULET' AND restaurant_id = 22;

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
      product_id_poulet,
      'Boisson 33cl',
      boissons[i][1],
      0.70,
      boissons[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- 3.2. BOISSONS pour CHEVRE CHAUD (12 options)
DO $$
DECLARE
  product_id_chevre INTEGER;
  boissons TEXT[][] := ARRAY[
    ['COCA COLA 33CL', '🥤'],
    ['COCA COLA ZERO 33CL', '🥤'],
    ['COCA COLA CHERRY 33CL', '🥤'],
    ['ICE TEA 33CL', '🧃'],
    ['OASIS 33CL', '🧃'],
    ['7 UP MOJITO 33CL', '🥤'],
    ['TROPICO 33CL', '🧃'],
    ['FANTA ORANGE 33CL', '🥤'],
    ['FANTA EXOTIQUE 33CL', '🥤'],
    ['PERRIER 33CL', '💧'],
    ['SPRITE 33CL', '🥤'],
    ['EAU 33CL', '💧']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_chevre
  FROM france_products
  WHERE name = 'CHEVRE CHAUD' AND restaurant_id = 22;

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
      product_id_chevre,
      'Boisson 33cl',
      boissons[i][1],
      0.70,
      boissons[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- 3.3. BOISSONS pour AVOCAT CREVETTES (12 options)
DO $$
DECLARE
  product_id_avocat INTEGER;
  boissons TEXT[][] := ARRAY[
    ['COCA COLA 33CL', '🥤'],
    ['COCA COLA ZERO 33CL', '🥤'],
    ['COCA COLA CHERRY 33CL', '🥤'],
    ['ICE TEA 33CL', '🧃'],
    ['OASIS 33CL', '🧃'],
    ['7 UP MOJITO 33CL', '🥤'],
    ['TROPICO 33CL', '🧃'],
    ['FANTA ORANGE 33CL', '🥤'],
    ['FANTA EXOTIQUE 33CL', '🥤'],
    ['PERRIER 33CL', '💧'],
    ['SPRITE 33CL', '🥤'],
    ['EAU 33CL', '💧']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_avocat
  FROM france_products
  WHERE name = 'AVOCAT CREVETTES' AND restaurant_id = 22;

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
      product_id_avocat,
      'Boisson 33cl',
      boissons[i][1],
      0.70,
      boissons[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- 3.4. BOISSONS pour ITALIENNE (12 options)
DO $$
DECLARE
  product_id_italienne INTEGER;
  boissons TEXT[][] := ARRAY[
    ['COCA COLA 33CL', '🥤'],
    ['COCA COLA ZERO 33CL', '🥤'],
    ['COCA COLA CHERRY 33CL', '🥤'],
    ['ICE TEA 33CL', '🧃'],
    ['OASIS 33CL', '🧃'],
    ['7 UP MOJITO 33CL', '🥤'],
    ['TROPICO 33CL', '🧃'],
    ['FANTA ORANGE 33CL', '🥤'],
    ['FANTA EXOTIQUE 33CL', '🥤'],
    ['PERRIER 33CL', '💧'],
    ['SPRITE 33CL', '🥤'],
    ['EAU 33CL', '💧']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_italienne
  FROM france_products
  WHERE name = 'ITALIENNE' AND restaurant_id = 22;

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
      product_id_italienne,
      'Boisson 33cl',
      boissons[i][1],
      0.70,
      boissons[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- ========================================================================
-- 4. INSERTION DES OPTIONS - INGRÉDIENTS SUPPLÉMENTAIRES (prix standard)
-- ========================================================================

-- 4.1. SUPPLÉMENTS pour POULET (13 options)
DO $$
DECLARE
  product_id_poulet INTEGER;
  supplements TEXT[][] := ARRAY[
    ['AVOCAT', '🥑', '1.00'],
    ['MAÏS', '🌽', '1.00'],
    ['SALADE VERTE', '🥬', '1.00'],
    ['TOMATES', '🍅', '1.00'],
    ['CREVETTES', '🦐', '1.50'],
    ['OEUF', '🥚', '1.50'],
    ['POULET', '🍗', '1.50'],
    ['SAUMON FUMÉ', '🐟', '1.50'],
    ['THON', '🐟', '1.50'],
    ['CHÈVRE', '🧀', '1.00'],
    ['EMMENTAL', '🧀', '1.00'],
    ['MOZZARELLA', '🧀', '1.00']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_poulet
  FROM france_products
  WHERE name = 'POULET' AND restaurant_id = 22;

  FOR i IN 1..array_length(supplements, 1) LOOP
    INSERT INTO france_product_options (
      product_id,
      option_group,
      option_name,
      price_modifier,
      icon,
      is_active,
      display_order
    ) VALUES (
      product_id_poulet,
      'Ingrédients supplémentaires',
      supplements[i][1],
      supplements[i][3]::DECIMAL,
      supplements[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- 4.2. SUPPLÉMENTS pour NICOISE (13 options)
DO $$
DECLARE
  product_id_nicoise INTEGER;
  supplements TEXT[][] := ARRAY[
    ['AVOCAT', '🥑', '1.00'],
    ['MAÏS', '🌽', '1.00'],
    ['SALADE VERTE', '🥬', '1.00'],
    ['TOMATES', '🍅', '1.00'],
    ['CREVETTES', '🦐', '1.50'],
    ['OEUF', '🥚', '1.50'],
    ['POULET', '🍗', '1.50'],
    ['SAUMON FUMÉ', '🐟', '1.50'],
    ['THON', '🐟', '1.50'],
    ['CHÈVRE', '🧀', '1.00'],
    ['EMMENTAL', '🧀', '1.00'],
    ['MOZZARELLA', '🧀', '1.00']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_nicoise
  FROM france_products
  WHERE name = 'NICOISE' AND restaurant_id = 22;

  FOR i IN 1..array_length(supplements, 1) LOOP
    INSERT INTO france_product_options (
      product_id,
      option_group,
      option_name,
      price_modifier,
      icon,
      is_active,
      display_order
    ) VALUES (
      product_id_nicoise,
      'Ingrédients supplémentaires',
      supplements[i][1],
      supplements[i][3]::DECIMAL,
      supplements[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- 4.3. SUPPLÉMENTS pour CHEVRE CHAUD (13 options)
DO $$
DECLARE
  product_id_chevre INTEGER;
  supplements TEXT[][] := ARRAY[
    ['AVOCAT', '🥑', '1.00'],
    ['MAÏS', '🌽', '1.00'],
    ['SALADE VERTE', '🥬', '1.00'],
    ['TOMATES', '🍅', '1.00'],
    ['CREVETTES', '🦐', '1.50'],
    ['OEUF', '🥚', '1.50'],
    ['POULET', '🍗', '1.50'],
    ['SAUMON FUMÉ', '🐟', '1.50'],
    ['THON', '🐟', '1.50'],
    ['CHÈVRE', '🧀', '1.00'],
    ['EMMENTAL', '🧀', '1.00'],
    ['MOZZARELLA', '🧀', '1.00']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_chevre
  FROM france_products
  WHERE name = 'CHEVRE CHAUD' AND restaurant_id = 22;

  FOR i IN 1..array_length(supplements, 1) LOOP
    INSERT INTO france_product_options (
      product_id,
      option_group,
      option_name,
      price_modifier,
      icon,
      is_active,
      display_order
    ) VALUES (
      product_id_chevre,
      'Ingrédients supplémentaires',
      supplements[i][1],
      supplements[i][3]::DECIMAL,
      supplements[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- 4.4. SUPPLÉMENTS pour ITALIENNE (13 options)
DO $$
DECLARE
  product_id_italienne INTEGER;
  supplements TEXT[][] := ARRAY[
    ['AVOCAT', '🥑', '1.00'],
    ['MAÏS', '🌽', '1.00'],
    ['SALADE VERTE', '🥬', '1.00'],
    ['TOMATES', '🍅', '1.00'],
    ['CREVETTES', '🦐', '1.50'],
    ['OEUF', '🥚', '1.50'],
    ['POULET', '🍗', '1.50'],
    ['SAUMON FUMÉ', '🐟', '1.50'],
    ['THON', '🐟', '1.50'],
    ['CHÈVRE', '🧀', '1.00'],
    ['EMMENTAL', '🧀', '1.00'],
    ['MOZZARELLA', '🧀', '1.00']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_italienne
  FROM france_products
  WHERE name = 'ITALIENNE' AND restaurant_id = 22;

  FOR i IN 1..array_length(supplements, 1) LOOP
    INSERT INTO france_product_options (
      product_id,
      option_group,
      option_name,
      price_modifier,
      icon,
      is_active,
      display_order
    ) VALUES (
      product_id_italienne,
      'Ingrédients supplémentaires',
      supplements[i][1],
      supplements[i][3]::DECIMAL,
      supplements[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- ========================================================================
-- 5. INSERTION DES OPTIONS - INGRÉDIENTS SUPPLÉMENTAIRES (AVOCAT CREVETTES - prix différents)
-- ========================================================================

DO $$
DECLARE
  product_id_avocat INTEGER;
  supplements TEXT[][] := ARRAY[
    ['AVOCAT', '🥑', '0.50'],
    ['MAÏS', '🌽', '0.50'],
    ['SALADE VERTE', '🥬', '0.50'],
    ['TOMATES', '🍅', '0.50'],
    ['CREVETTES', '🦐', '1.50'],
    ['OEUF', '🥚', '1.00'],
    ['POULET', '🍗', '1.00'],
    ['SAUMON FUMÉ', '🐟', '1.50'],
    ['THON', '🐟', '1.00'],
    ['CHÈVRE', '🧀', '0.50'],
    ['EMMENTAL', '🧀', '0.50'],
    ['MOZZARELLA', '🧀', '0.50']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_avocat
  FROM france_products
  WHERE name = 'AVOCAT CREVETTES' AND restaurant_id = 22;

  FOR i IN 1..array_length(supplements, 1) LOOP
    INSERT INTO france_product_options (
      product_id,
      option_group,
      option_name,
      price_modifier,
      icon,
      is_active,
      display_order
    ) VALUES (
      product_id_avocat,
      'Ingrédients supplémentaires',
      supplements[i][1],
      supplements[i][3]::DECIMAL,
      supplements[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- ========================================================================
-- 6. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT
  id,
  name,
  slug,
  icon,
  display_order
FROM france_menu_categories
WHERE slug = 'salades' AND restaurant_id = 22;

-- Vérifier les 5 produits créés
SELECT
  id,
  name,
  price_on_site_base,
  price_delivery_base,
  workflow_type,
  display_order
FROM france_products
WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'salades' AND restaurant_id = 22)
ORDER BY display_order;

-- Vérifier le nombre d'options par produit et par groupe
SELECT
  p.name AS product_name,
  po.option_group,
  COUNT(*) AS nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'salades'
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
WHERE c.slug = 'salades'
  AND c.restaurant_id = 22;

COMMIT;
-- En cas de problème: ROLLBACK;
