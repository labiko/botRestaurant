-- ========================================================================
-- INSERTION OFFRE PROMOTIONNELLE - 1 BURGER MAISON ACHETE = LE 2EME A -50%
-- DATE: 2025-10-22
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: MENUS BURGERS MAISON
-- Objectif : Créer l'offre promotionnelle 1 acheté = 2ème à -50%
-- Total: 1 produit + 26 options (13 premier menu + 13 deuxième menu)
-- ========================================================================
-- Workflow en 2 étapes:
--   Step 1: Choix du 1er menu (prix plein : 7.50€ à 14.50€)
--   Step 2: Choix du 2ème menu (-50% : 3.75€ à 7.25€)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22),
  '1 BURGER MAISON ACHETE = LE 2EME A -50%',
  'Offre promotionnelle : 1 menu burger maison acheté = le 2ème à moitié prix',
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
-- 2. STEP 1 - PREMIER MENU (13 options au prix plein)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'CLASSIC', 'Steak 120 grs, sauce maison, double cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 10.00, '🍔', 1, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'EXOTIC', 'Steak 120 grs, sauce maison, ananas grillé, cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 11.00, '🍍', 2, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'CHICAGO', 'Steak 120 grs, miel, chèvre, sauce maison, double cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 11.00, '🍯', 3, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'PLAN B', 'Steak 120 grs, escalope, boursin, poulet parfumé, double cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 11.00, '🏠', 4, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'BIG', 'Chicken pané, poulet fumé, oeuf, cornichons, oignons rouges, sauce maison, double cheddar + Frites + 1 Boisson 33cl au choix', 9.90, '🍗', 5, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'MOZZA', 'Steak 120 grs, pommes caramélisées, cornichons, oignons rouges, salade, tranches de mozzarella, tomates, sauce maison + Frites + 1 Boisson 33cl au choix', 11.00, '🧀', 6, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'BACON', 'Steak 120 grs, oeuf, bacon, sauce maison, double cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 11.00, '🥓', 7, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'RACLETTE', 'Steak 120 grs, aubergines grillées, sauce maison, raclette, cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 11.00, '🧀', 8, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'XXL', '3 Steaks 120 grs, triple cheddar, sauce maison, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 14.50, '🔥', 9, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'VEGETARIEN', 'Sauce avocat, galette pommes de terre, courgette grillée, salade, tomates, oignons + Frites + 1 Boisson 33cl au choix', 7.50, '🥑', 10, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'ROYAL', 'Steak 100 grs, saint-môret, betterave, cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 10.90, '👑', 11, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'ORIENTAL', '2 Steaks 120 grs grillés, cheddar, pain fait maison, emmental, poivrons grillés, oignons frits, tomates fraîches, salade + Frites + 1 Boisson 33cl au choix', 14.50, '🌍', 12, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Premier Menu', 'LE BOSS', 'Steak haché de boeuf 120grs 100% français, reblochon, compote d''oignons rouges, bacon, galette de pommes de terre, sauce maison + Frites + 1 Boisson 33cl au choix', 14.50, '👔', 13, true);

-- ========================================================================
-- 3. STEP 2 - DEUXIEME MENU (13 options à -50%)
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'CLASSIC', 'Steak 120 grs, sauce maison, double cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 5.00, '🍔', 1, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'EXOTIC', 'Steak 120 grs, sauce maison, ananas grillé, cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 5.50, '🍍', 2, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'CHICAGO', 'Steak 120 grs, miel, chèvre, sauce maison, double cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 5.50, '🍯', 3, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'PLAN B', 'Steak 120 grs, escalope, boursin, poulet parfumé, double cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 5.50, '🏠', 4, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'BIG', 'Chicken pané, poulet fumé, oeuf, cornichons, oignons rouges, sauce maison, double cheddar + Frites + 1 Boisson 33cl au choix', 4.95, '🍗', 5, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'MOZZA', 'Steak 120 grs, pommes caramélisées, cornichons, oignons rouges, salade, tranches de mozzarella, tomates, sauce maison + Frites + 1 Boisson 33cl au choix', 5.50, '🧀', 6, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'BACON', 'Steak 120 grs, oeuf, bacon, sauce maison, double cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 5.50, '🥓', 7, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'RACLETTE', 'Steak 120 grs, aubergines grillées, sauce maison, raclette, cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 5.50, '🧀', 8, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'XXL', '3 Steaks 120 grs, triple cheddar, sauce maison, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 7.25, '🔥', 9, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'VEGETARIEN', 'Sauce avocat, galette pommes de terre, courgette grillée, salade, tomates, oignons + Frites + 1 Boisson 33cl au choix', 3.75, '🥑', 10, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'ROYAL', 'Steak 100 grs, saint-môret, betterave, cheddar, cornichons, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl au choix', 5.45, '👑', 11, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'ORIENTAL', '2 Steaks 120 grs grillés, cheddar, pain fait maison, emmental, poivrons grillés, oignons frits, tomates fraîches, salade + Frites + 1 Boisson 33cl au choix', 7.25, '🌍', 12, true),
((SELECT id FROM france_products WHERE name = '1 BURGER MAISON ACHETE = LE 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22)), 'Deuxieme Menu', 'LE BOSS', 'Steak haché de boeuf 120grs 100% français, reblochon, compote d''oignons rouges, bacon, galette de pommes de terre, sauce maison + Frites + 1 Boisson 33cl au choix', 7.25, '👔', 13, true);

-- ========================================================================
-- 4. VÉRIFICATIONS
-- ========================================================================

-- Vérifier le produit offre
SELECT p.name, p.product_type, p.price_on_site_base, p.price_delivery_base
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22
  AND c.slug = 'menus-burgers-maison'
  AND p.name LIKE '%2EME A -50%';

-- Vérifier le total d'options (doit être 26)
SELECT COUNT(*) as total_options, '26 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = '1 BURGER MAISON ACHETE = LE 2EME A -50%'
  AND p.restaurant_id = 22;

-- Vérifier la répartition par groupe
SELECT po.option_group, COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = '1 BURGER MAISON ACHETE = LE 2EME A -50%'
  AND p.restaurant_id = 22
GROUP BY po.option_group
ORDER BY po.option_group;

-- Vérifier les prix du premier menu (prix plein)
SELECT po.option_name, po.price_modifier
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = '1 BURGER MAISON ACHETE = LE 2EME A -50%'
  AND p.restaurant_id = 22
  AND po.option_group = 'Premier Menu'
ORDER BY po.display_order;

-- Vérifier les prix du deuxième menu (-50%)
SELECT po.option_name, po.price_modifier
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name = '1 BURGER MAISON ACHETE = LE 2EME A -50%'
  AND p.restaurant_id = 22
  AND po.option_group = 'Deuxieme Menu'
ORDER BY po.display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 1 produit offre "1 BURGER MAISON ACHETE = LE 2EME A -50%" créé
-- 26 options ajoutées :
--   - 13 options "Premier Menu" (prix plein : 7.50€ à 14.50€)
--   - 13 options "Deuxieme Menu" (prix -50% : 3.75€ à 7.25€)
--
-- Workflow en 2 steps :
--   Step 1: Choix 1er menu (obligatoire, 1 parmi 13)
--   Step 2: Choix 2ème menu (obligatoire, 1 parmi 13)
--
-- Calcul -50% :
--   CLASSIC: 10.00€ → 5.00€
--   EXOTIC: 11.00€ → 5.50€
--   CHICAGO: 11.00€ → 5.50€
--   PLAN B: 11.00€ → 5.50€
--   BIG: 9.90€ → 4.95€
--   MOZZA: 11.00€ → 5.50€
--   BACON: 11.00€ → 5.50€
--   RACLETTE: 11.00€ → 5.50€
--   VEGETARIEN: 7.50€ → 3.75€
--   ROYAL: 10.90€ → 5.45€
--   ORIENTAL: 14.50€ → 7.25€
--   XXL: 14.50€ → 7.25€
--   LE BOSS: 14.50€ → 7.25€
-- ========================================================================
