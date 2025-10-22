-- ========================================================================
-- INSERTION CATÉGORIE SANDWICHS BAGUETTE - PLAN B MELUN
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: SANDWICHS BAGUETTE 🥖
-- Contenu:
--   - 1 Produit composite avec workflow 3 étapes
--   - Step 1 : 4 sandwichs (choix obligatoire, max 1)
--   - Step 2 : 3 condiments (optionnel, max 3)
--   - Step 3 : 14 sauces (obligatoire, max 2)
-- Total: 1 produit + 21 options
-- ========================================================================

BEGIN;

-- 1️⃣ CRÉATION CATÉGORIE SANDWICHS BAGUETTE
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
  'SANDWICHS BAGUETTE',
  'sandwichs-baguette',
  'Nos sandwichs baguette avec choix de condiments et sauces',
  7,
  '🥖',
  true
);

-- 2️⃣ PRODUIT COMPOSITE : SANDWICH BAGUETTE
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
  (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22),
  'SANDWICH BAGUETTE',
  'Sandwich baguette au choix avec condiments et 2 sauces',
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
        "prompt": "votre sandwich",
        "option_groups": ["Choix Sandwich"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "vos condiments (optionnel)",
        "option_groups": ["Condiments"],
        "required": false,
        "max_selections": 3
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "vos 2 sauces",
        "option_groups": ["Sauces"],
        "required": true,
        "max_selections": 2
      }
    ]
  }'::json,
  '🥖',
  true,
  1
);

-- 3️⃣ STEP 1 : CHOIX SANDWICH (4 options)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Choix Sandwich', 'B RINGS', '3 Steaks 45g, oignons rings, fromage raclette', 8.40, '🧅', 1, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Choix Sandwich', 'B FERMIER', 'Poulet, crème fraîche, champignons, cheddar', 8.40, '🍗', 2, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Choix Sandwich', 'B AMERICAIN', '3 Steaks 45g, bacon, oeuf, cheddar', 8.40, '🇺🇸', 3, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Choix Sandwich', 'B CORDON', 'Steak 45g, cordon bleu, cheddar', 8.40, '🧀', 4, true);

-- 4️⃣ STEP 2 : CONDIMENTS (3 options - OPTIONNEL - MAX 3)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Condiments', 'Oignons', 'Oignons frais', 0.00, '🧅', 1, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Condiments', 'Salade', 'Salade fraîche', 0.00, '🥗', 2, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Condiments', 'Tomates', 'Tomates fraîches', 0.00, '🍅', 3, true);

-- 5️⃣ STEP 3 : SAUCES (14 options - OBLIGATOIRE - MAX 2)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 2, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'CURRY', 'Sauce curry', 0.00, '🍛', 3, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 4, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 5, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 6, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 7, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 8, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 9, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 10, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 11, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 12, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 13, true),
((SELECT id FROM france_products WHERE name = 'SANDWICH BAGUETTE' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs-baguette' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 14, true);

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT id, name, slug, display_order, icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'sandwichs-baguette';

-- Vérifier le produit créé
SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.product_type,
  p.workflow_type,
  p.display_order,
  c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22 AND c.slug = 'sandwichs-baguette'
ORDER BY p.display_order;

-- Vérifier les options par option_group
SELECT
  po.option_group,
  COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22 AND c.slug = 'sandwichs-baguette'
GROUP BY po.option_group
ORDER BY po.option_group;

-- Détail des options
SELECT
  po.option_group,
  po.option_name,
  po.price_modifier,
  po.icon
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22 AND c.slug = 'sandwichs-baguette'
ORDER BY po.option_group, po.display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- Catégorie : SANDWICHS BAGUETTE 🥖
--
-- Produit :
-- 1. SANDWICH BAGUETTE (0.00€ base + prix sandwich choisi)
--    - Step 1 : Choix Sandwich (4 options à 8.40€ - OBLIGATOIRE - MAX 1)
--    - Step 2 : Condiments (3 options gratuites - OPTIONNEL - MAX 3)
--    - Step 3 : Sauces (14 options gratuites - OBLIGATOIRE - MAX 2)
--    - Total : 21 options
--
-- Prix final exemple :
--   B RINGS (8.40€) + Oignons + Salade (0.00€) + ANDALOUSE + KETCHUP (0.00€)
--   = 8.40€ (identique sur place et livraison)
-- ========================================================================
