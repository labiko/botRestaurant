-- ========================================================================
-- INSERTION BOWLS - PLAN B MELUN
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: BOWLS
-- Produit: BOWL A COMPOSER (8.50€)
-- Workflow: 3 steps (Viande + Sauce + Suppléments optionnels)
-- ========================================================================

BEGIN;

-- 1️⃣ CRÉATION CATÉGORIE BOWLS
INSERT INTO france_menu_categories (
  restaurant_id,
  name,
  slug,
  description,
  display_order,
  icon,
  is_active
) VALUES (
  22,
  'BOWLS',
  'bowls',
  'Bowls à composer selon vos envies',
  2,
  '🍲',
  true
);

-- 2️⃣ PRODUIT : BOWL A COMPOSER (COMPOSITE)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'bowls' AND restaurant_id = 22),
  'BOWL A COMPOSER',
  '1 Viande au choix + 1 Sauce au choix + Cheddar + Sauce fromagère + Ingrédients supplémentaires en option',
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
        "prompt": "votre viande",
        "option_groups": ["Viandes"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre sauce",
        "option_groups": ["Sauces"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "vos suppléments",
        "option_groups": ["Légumes", "Viandes/Poissons", "Fromages"],
        "required": false,
        "max_selections": 20
      }
    ]
  }'::json,
  '🍲',
  true,
  1
);

-- 3️⃣ OPTIONS - STEP 1 : VIANDES (incluses)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes', 'Escalope', 0.00, '🍗', 1, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes', 'Nuggets', 0.00, '🍗', 2, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes', 'Tenders', 0.00, '🍗', 3, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes', 'Jalapenos', 0.00, '🌶️', 4, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes', 'Cordon Bleu', 0.00, '🧀', 5, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes', 'Steak', 0.00, '🥩', 6, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes', 'Falafels', 0.00, '🧆', 7, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes', 'Oignons Rings', 0.00, '🧅', 8, true);

-- 4️⃣ OPTIONS - STEP 2 : SAUCES (incluses)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Mayonnaise', 0.00, '🥫', 1, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Ketchup', 0.00, '🥫', 2, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Harissa', 0.00, '🌶️', 3, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Algérienne', 0.00, '🥫', 4, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Curry', 0.00, '🌶️', 5, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Barbecue', 0.00, '🥫', 6, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Cocktail', 0.00, '🥫', 7, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Chili Thai', 0.00, '🌶️', 8, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Blanche', 0.00, '🥫', 9, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Andalouse', 0.00, '🥫', 10, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Samourai', 0.00, '🥫', 11, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Poivre', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Sauces', 'Biggy', 0.00, '🥫', 13, true);

-- 5️⃣ OPTIONS - STEP 3 : LÉGUMES (suppléments payants)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Légumes', 'Champignons', 1.00, '🍄', 1, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Légumes', 'Oignons', 1.00, '🧅', 2, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Légumes', 'Oignons Frits', 1.00, '🧅', 3, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Légumes', 'Oignons Rings', 1.50, '🧅', 4, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Légumes', 'Poivrons', 1.00, '🫑', 5, true);

-- 6️⃣ OPTIONS - STEP 3 : VIANDES/POISSONS (suppléments payants)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes/Poissons', 'Bacon', 1.50, '🥓', 1, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes/Poissons', 'Escalope', 1.50, '🍗', 2, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes/Poissons', 'Falafels', 1.50, '🧆', 3, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes/Poissons', 'Lardons', 1.50, '🥓', 4, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes/Poissons', 'Oeuf', 1.50, '🥚', 5, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes/Poissons', 'Steak', 1.50, '🥩', 6, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes/Poissons', 'Tenders', 1.50, '🍗', 7, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Viandes/Poissons', 'Viande Hachée', 1.50, '🍖', 8, true);

-- 7️⃣ OPTIONS - STEP 3 : FROMAGES (suppléments payants)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Fromages', 'Boursin', 1.00, '🧀', 1, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Fromages', 'Cheddar', 1.00, '🧀', 2, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Fromages', 'Mozzarella', 1.00, '🧀', 3, true),
((SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22), 'Fromages', 'Raclette', 1.00, '🧀', 4, true);

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT id, name, slug, display_order, icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'bowls';

-- Vérifier le produit créé
SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.product_type,
  p.workflow_type,
  p.requires_steps,
  p.icon,
  c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22 AND c.slug = 'bowls';

-- Vérifier les options par groupe
SELECT
  option_group,
  COUNT(*) as nb_options,
  MIN(price_modifier) as prix_min,
  MAX(price_modifier) as prix_max
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22)
GROUP BY option_group
ORDER BY option_group;

-- Détail complet des options
SELECT
  option_group,
  option_name,
  price_modifier,
  icon,
  display_order
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22)
ORDER BY option_group, display_order;

-- Transaction validée automatiquement en cas de succès
COMMIT;

-- En cas d'erreur : ROLLBACK;

-- ========================================================================
-- RÉSUMÉ :
-- ========================================================================
-- Catégorie : BOWLS 🍲
-- Produit : BOWL A COMPOSER (8.50€)
-- Workflow : universal_workflow_v2 avec 3 steps
--   - Step 1 : Viandes (8 choix, prix inclus)
--   - Step 2 : Sauces (13 choix, prix inclus)
--   - Step 3 : Suppléments optionnels (17 choix, payants)
--     * Légumes : 1.00€ - 1.50€
--     * Viandes/Poissons : 1.50€
--     * Fromages : 1.00€
-- Total options : 38
-- ========================================================================
