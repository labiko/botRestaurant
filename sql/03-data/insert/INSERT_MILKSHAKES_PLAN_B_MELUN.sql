-- ========================================================================
-- SCRIPT: Insertion catégorie MILKSHAKES - Plan B Melun
-- DATE: 2025-01-22
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- CATÉGORIE: MILKSHAKES
-- PRODUITS: 1 milkshake à 5.00€
-- WORKFLOW: universal_workflow_v2 avec 1 step (ingrédients obligatoires)
-- NOTE: Le premier ingrédient est gratuit (mentionné dans composition)
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
  'MILKSHAKES',
  'milkshakes',
  '🥤',
  true,
  13
) ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- ========================================================================
-- 2. INSERTION DU PRODUIT
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
  'Le premier ingrédient gratuit. Ingrédients supplémentaires : +1.50€',
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
        "prompt": "vos ingrédients",
        "option_groups": ["Ingrédients supplémentaires"],
        "required": true,
        "max_selections": 999
      }
    ]
  }'::json,
  '🥤',
  true,
  1
);

-- ========================================================================
-- 3. INSERTION DES OPTIONS - INGRÉDIENTS SUPPLÉMENTAIRES
-- ========================================================================

DO $$
DECLARE
  product_id_milkshake INTEGER;
  ingredients TEXT[][] := ARRAY[
    -- CONFISERIES (16 options)
    ['AMANDES', '🥜', '1.50'],
    ['BEURRE CACAHUÈTE', '🥜', '1.50'],
    ['BUENO WHITE', '🍫', '1.50'],
    ['COULIS CARAMEL', '🍮', '1.50'],
    ['COULIS CHOCO', '🍫', '1.50'],
    ['COULIS FRAISE', '🍓', '1.50'],
    ['KINDER BUENO', '🍫', '1.50'],
    ['KINDER MAXI', '🍫', '1.50'],
    ['KINDER SCHOKO', '🍫', '1.50'],
    ['KIT KAT', '🍫', '1.50'],
    ['LOTUS', '🍪', '1.50'],
    ['MILKA', '🍫', '1.50'],
    ['MMS', '🍬', '1.50'],
    ['NUTELLA', '🍫', '1.50'],
    ['OREO', '🍪', '1.50'],
    ['SNICKERS', '🍫', '1.50'],
    -- FRUITS FRAIS (6 options)
    ['ANANAS', '🍍', '1.50'],
    ['BANANE', '🍌', '1.50'],
    ['COCO', '🥥', '1.50'],
    ['FRAISE', '🍓', '1.50'],
    ['FRAMBOISE', '🫐', '1.50'],
    ['MANGUE', '🥭', '1.50']
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
      ingredients[i][3]::DECIMAL,
      ingredients[i][2],
      true,
      i
    );
  END LOOP;
END $$;

-- ========================================================================
-- 4. VÉRIFICATIONS
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
  display_order
FROM france_products
WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'milkshakes' AND restaurant_id = 22)
ORDER BY display_order;

-- Vérifier le nombre d'options par groupe
SELECT
  p.name AS product_name,
  po.option_group,
  COUNT(*) AS nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'milkshakes'
  AND c.restaurant_id = 22
GROUP BY p.name, po.option_group
ORDER BY po.option_group;

-- Vérifier le total d'options créées
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
