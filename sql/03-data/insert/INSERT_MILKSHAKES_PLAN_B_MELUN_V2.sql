-- ========================================================================
-- VERSION: V2
-- DATE: 2025-01-22
-- PROBLÈME RÉSOLU: Workflow 2 steps pour gérer "premier ingrédient gratuit"
-- CHANGEMENTS:
--   - Step 1: Premier ingrédient (gratuit, price_modifier=0, obligatoire, max 1)
--   - Step 2: Ingrédients supplémentaires (1.50€, optionnel, illimité)
--   - Total options: 44 (22 × 2)
-- ========================================================================
-- SCRIPT: Insertion catégorie MILKSHAKES V2 - Plan B Melun
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- CATÉGORIE: MILKSHAKES
-- PRODUITS: 1 milkshake à 5.00€
-- WORKFLOW: universal_workflow_v2 avec 2 steps
-- ========================================================================

BEGIN;

-- ========================================================================
-- 0. SUPPRESSION ANCIENNES DONNÉES (nettoyage V1)
-- ========================================================================

-- Supprimer les options existantes
DELETE FROM france_product_options
WHERE product_id IN (
  SELECT p.id
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'milkshakes' AND c.restaurant_id = 22
);

-- Supprimer le produit existant
DELETE FROM france_products
WHERE category_id IN (
  SELECT id FROM france_menu_categories
  WHERE slug = 'milkshakes' AND restaurant_id = 22
);

-- Supprimer la catégorie existante
DELETE FROM france_menu_categories
WHERE slug = 'milkshakes' AND restaurant_id = 22;

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
  'MILKSHAKES',
  'milkshakes',
  '🥤',
  true,
  13
);

-- ========================================================================
-- 2. INSERTION DU PRODUIT (avec workflow 2 steps)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'milkshakes' AND restaurant_id = 22),
  'COMPOSEZ VOTRE MILKSHAKE',
  'Le premier ingrédient est gratuit. Ingrédients supplémentaires : +1.50€',
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
        "prompt": "votre premier ingrédient (gratuit)",
        "option_groups": ["Premier ingrédient"],
        "required": true,
        "max_selections": 1
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
  '🥤',
  true,
  1
);

-- ========================================================================
-- 3. INSERTION DES OPTIONS - STEP 1 : PREMIER INGRÉDIENT (GRATUIT)
-- ========================================================================

DO $$
DECLARE
  product_id_milkshake INTEGER;
  ingredients TEXT[][] := ARRAY[
    -- CONFISERIES (16 options)
    ['AMANDES', '🥜'],
    ['BEURRE CACAHUÈTE', '🥜'],
    ['BUENO WHITE', '🍫'],
    ['COULIS CARAMEL', '🍮'],
    ['COULIS CHOCO', '🍫'],
    ['COULIS FRAISE', '🍓'],
    ['KINDER BUENO', '🍫'],
    ['KINDER MAXI', '🍫'],
    ['KINDER SCHOKO', '🍫'],
    ['KIT KAT', '🍫'],
    ['LOTUS', '🍪'],
    ['MILKA', '🍫'],
    ['MMS', '🍬'],
    ['NUTELLA', '🍫'],
    ['OREO', '🍪'],
    ['SNICKERS', '🍫'],
    -- FRUITS FRAIS (6 options)
    ['ANANAS', '🍍'],
    ['BANANE', '🍌'],
    ['COCO', '🥥'],
    ['FRAISE', '🍓'],
    ['FRAMBOISE', '🫐'],
    ['MANGUE', '🥭']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_milkshake
  FROM france_products
  WHERE name = 'COMPOSEZ VOTRE MILKSHAKE' AND restaurant_id = 22;

  FOR i IN 1..array_length(ingredients, 1) LOOP
    INSERT INTO france_product_options (
      product_id,
      option_group,
      option_name,
      price_modifier,
      icon,
      is_active,
      display_order
    ) VALUES (
      product_id_milkshake,
      'Premier ingrédient',
      ingredients[i][1],
      0.00,  -- ✅ GRATUIT
      ingredients[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- ========================================================================
-- 4. INSERTION DES OPTIONS - STEP 2 : INGRÉDIENTS SUPPLÉMENTAIRES (+1.50€)
-- ========================================================================

DO $$
DECLARE
  product_id_milkshake INTEGER;
  ingredients TEXT[][] := ARRAY[
    -- CONFISERIES (16 options)
    ['AMANDES', '🥜'],
    ['BEURRE CACAHUÈTE', '🥜'],
    ['BUENO WHITE', '🍫'],
    ['COULIS CARAMEL', '🍮'],
    ['COULIS CHOCO', '🍫'],
    ['COULIS FRAISE', '🍓'],
    ['KINDER BUENO', '🍫'],
    ['KINDER MAXI', '🍫'],
    ['KINDER SCHOKO', '🍫'],
    ['KIT KAT', '🍫'],
    ['LOTUS', '🍪'],
    ['MILKA', '🍫'],
    ['MMS', '🍬'],
    ['NUTELLA', '🍫'],
    ['OREO', '🍪'],
    ['SNICKERS', '🍫'],
    -- FRUITS FRAIS (6 options)
    ['ANANAS', '🍍'],
    ['BANANE', '🍌'],
    ['COCO', '🥥'],
    ['FRAISE', '🍓'],
    ['FRAMBOISE', '🫐'],
    ['MANGUE', '🥭']
  ];
  i INTEGER;
BEGIN
  SELECT id INTO product_id_milkshake
  FROM france_products
  WHERE name = 'COMPOSEZ VOTRE MILKSHAKE' AND restaurant_id = 22;

  FOR i IN 1..array_length(ingredients, 1) LOOP
    INSERT INTO france_product_options (
      product_id,
      option_group,
      option_name,
      price_modifier,
      icon,
      is_active,
      display_order
    ) VALUES (
      product_id_milkshake,
      'Ingrédients supplémentaires',
      ingredients[i][1],
      1.50,  -- ✅ PAYANT
      ingredients[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- ========================================================================
-- 5. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT
  id,
  name,
  slug,
  icon,
  display_order
FROM france_menu_categories
WHERE slug = 'milkshakes' AND restaurant_id = 22;

-- Vérifier le produit créé
SELECT
  id,
  name,
  composition,
  price_on_site_base,
  price_delivery_base,
  workflow_type,
  requires_steps,
  steps_config,
  display_order
FROM france_products
WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'milkshakes' AND restaurant_id = 22)
ORDER BY display_order;

-- Vérifier le nombre d'options par groupe (doit afficher 22 + 22 = 44)
SELECT
  p.name AS product_name,
  po.option_group,
  COUNT(*) AS nb_options,
  MIN(po.price_modifier) AS prix_min,
  MAX(po.price_modifier) AS prix_max
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'milkshakes'
  AND c.restaurant_id = 22
GROUP BY p.name, po.option_group
ORDER BY po.option_group;

-- Vérifier le total d'options créées (doit afficher 44)
SELECT
  'Total options créées' AS info,
  COUNT(*) AS total
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'milkshakes'
  AND c.restaurant_id = 22;

COMMIT;
-- En cas de problème: ROLLBACK;
