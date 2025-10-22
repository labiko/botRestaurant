-- ========================================================================
-- INSERTION OFFRE PROMOTIONNELLE - 1 MENU SMASH BURGER ACHETE = LE 2EME A -50%
-- DATE: 2025-10-22
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: MENUS SMASH BURGERS
-- Objectif : Créer l'offre promotionnelle 1 acheté = 2ème à -50%
-- Total: 1 produit + 8 options (4 premier menu + 4 deuxième menu)
-- ========================================================================
-- Workflow en 2 étapes:
--   Step 1: Choix du 1er menu (prix plein : 9.00€ à 11.00€)
--   Step 2: Choix du 2ème menu (-50% : 4.50€ à 5.50€)
-- ========================================================================
-- ⚠️ IMPORTANT : Prix identiques sur place ET livraison (pas de +1€)
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. INSERTION DU PRODUIT OFFRE (COMPOSITE)
-- ========================================================================
-- Produit avec workflow en 2 steps (choix 2 menus)
-- Prix de base: 0.00€ (les prix sont dans les options)
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22),
  '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%',
  'Offre promotionnelle : 1 menu smash burger acheté = le 2ème à moitié prix',
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
        "prompt": "votre 1er menu (prix plein)",
        "option_groups": ["Premier Menu"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre 2ème menu (-50%)",
        "option_groups": ["Deuxieme Menu"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🎁',
  true,
  2
);

-- ========================================================================
-- 2. STEP 1 - PREMIER MENU (4 options au prix plein)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Premier Menu', 'SMASH CLASSIC', 'Smashed beef, cheddar, bacon, salade, tomates, oignons, cornichons, sauce maison + Frites + 1 Boisson 33cl au choix', 9.00, '🍔', 1, true),
((SELECT id FROM france_products WHERE name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Premier Menu', 'SMASH BACON', 'Double smashed beef, cheddar, salade, tomates, oignons, avocat, cornichons, sauce maison + Frites + 1 Boisson 33cl au choix', 10.00, '🥓', 2, true),
((SELECT id FROM france_products WHERE name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Premier Menu', 'SMASH AVOCADO', 'Fried chicken, smashed steak, cheddar, salade, tomates, oignons, sauce maison + Frites + 1 Boisson 33cl au choix', 11.00, '🥑', 3, true),
((SELECT id FROM france_products WHERE name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Premier Menu', 'SMASH CHICKEN BEEF', 'Fried chicken, smashed steak, cheddar, salade, tomates, oignons, sauce maison + Frites + 1 Boisson 33cl au choix', 11.00, '🍗', 4, true);

-- ========================================================================
-- 3. STEP 2 - DEUXIEME MENU (4 options à -50%)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Deuxieme Menu', 'SMASH CLASSIC', 'Smashed beef, cheddar, bacon, salade, tomates, oignons, cornichons, sauce maison + Frites + 1 Boisson 33cl au choix', 4.50, '🍔', 1, true),
((SELECT id FROM france_products WHERE name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Deuxieme Menu', 'SMASH BACON', 'Double smashed beef, cheddar, salade, tomates, oignons, avocat, cornichons, sauce maison + Frites + 1 Boisson 33cl au choix', 5.00, '🥓', 2, true),
((SELECT id FROM france_products WHERE name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Deuxieme Menu', 'SMASH AVOCADO', 'Fried chicken, smashed steak, cheddar, salade, tomates, oignons, sauce maison + Frites + 1 Boisson 33cl au choix', 5.50, '🥑', 3, true),
((SELECT id FROM france_products WHERE name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22)), 'Deuxieme Menu', 'SMASH CHICKEN BEEF', 'Fried chicken, smashed steak, cheddar, salade, tomates, oignons, sauce maison + Frites + 1 Boisson 33cl au choix', 5.50, '🍗', 4, true);

-- ========================================================================
-- 4. VÉRIFICATIONS
-- ========================================================================

-- Vérifier le produit offre
SELECT p.name, p.product_type, p.price_on_site_base, p.price_delivery_base
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22
  AND c.slug = 'menus-smash-burgers'
  AND p.name LIKE '%2EME A -50%';

-- Vérifier le total d'options (doit être 8)
SELECT COUNT(*) as total_options, '8 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%'
  AND p.restaurant_id = 22;

-- Vérifier la répartition par groupe
SELECT po.option_group, COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%'
  AND p.restaurant_id = 22
GROUP BY po.option_group
ORDER BY po.option_group;

-- Vérifier les prix du premier menu (prix plein)
SELECT po.option_name, po.price_modifier
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%'
  AND p.restaurant_id = 22
  AND po.option_group = 'Premier Menu'
ORDER BY po.display_order;

-- Vérifier les prix du deuxième menu (-50%)
SELECT po.option_name, po.price_modifier
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%'
  AND p.restaurant_id = 22
  AND po.option_group = 'Deuxieme Menu'
ORDER BY po.display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 1 produit offre "1 MENU SMASH BURGER ACHETE = LE 2EME A -50%" créé
-- 8 options ajoutées :
--   - 4 options "Premier Menu" (prix plein : 9.00€ à 11.00€)
--   - 4 options "Deuxieme Menu" (prix -50% : 4.50€ à 5.50€)
--
-- Workflow en 2 steps :
--   Step 1: Choix 1er menu (obligatoire, 1 parmi 4)
--   Step 2: Choix 2ème menu (obligatoire, 1 parmi 4)
--
-- Calcul -50% :
--   SMASH CLASSIC: 9.00€ → 4.50€
--   SMASH BACON: 10.00€ → 5.00€
--   SMASH AVOCADO: 11.00€ → 5.50€
--   SMASH CHICKEN BEEF: 11.00€ → 5.50€
-- ========================================================================
