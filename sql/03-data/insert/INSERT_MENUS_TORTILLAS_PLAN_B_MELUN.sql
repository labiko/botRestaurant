-- ========================================================================
-- INSERTION CATÉGORIE MENUS TORTILLAS - PLAN B MELUN
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: MENUS TORTILLAS 🌯
-- Contenu:
--   - 1 Offre composite: "1 MENU ACHETE = LA 2EME A -50%"
--     - Step 1: Choix 1er menu (12 options, prix pleins)
--     - Step 2: Choix 2ème menu (12 options, prix à -50%)
--   - 12 Menus individuels (produits simples)
-- Total: 13 produits + 24 options
-- ========================================================================

BEGIN;

-- 1️⃣ CRÉATION CATÉGORIE MENUS TORTILLAS
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
  'MENUS TORTILLAS',
  'menus-tortillas',
  'Nos menus tortillas avec frites et boisson - Offre 1 acheté = 2ème à -50%',
  8,
  '🌯',
  true
);

-- ========================================================================
-- 2️⃣ OFFRE COMPOSITE: 1 MENU ACHETE = LA 2EME A -50%
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
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22),
  '1 MENU TORTILLA ACHETE = LA 2EME A -50%',
  '2 Menus tortillas au choix avec frites et boissons - Le 2ème à moitié prix',
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
  '🎁🌯',
  true,
  1
);

-- ========================================================================
-- 3️⃣ STEP 1 : PREMIER MENU (PRIX PLEIN) - 12 OPTIONS
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'CURRY', 'Poulet mariné au curry, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 8.50, '🍛', 1, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'BOURSIN', 'Poulet mariné au curry, boursin, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 9.00, '🧀', 2, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'TANDOORI', 'Poulet mariné tandoori, poivrons, olives, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 8.50, '🌶️', 3, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'VACHE QUI RIT', 'Poulet mariné tandoori, vache qui rit, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 9.00, '🐮', 4, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'DINA', 'Steak, cordon bleu, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 9.00, '🥩', 5, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'BOX MASTER', 'Tenders, galette de pomme de terre, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 9.00, '📦', 6, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'SPECIAL', 'Chicken, steak, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 9.00, '⭐', 7, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'MIX TENDERS', 'Tenders, steak, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 9.00, '🍗', 8, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'RUSTIK', 'Poulet, crème fraîche, cordon bleu, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 10.00, '🏡', 9, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'TRIPLE X', '3 Steaks, cheddar, oeuf, bacon, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 10.40, '❌', 10, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'B SIX', '2 Steaks 45gr, fromage râpé, lardons, jambon de dinde, galette de pommes de terre, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 10.40, '🅱️', 11, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Premier Menu', 'C SIX', 'Poulet, fromage râpé, lardons, jambon de dinde, crème fraîche, galette de pomme de terre, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 10.40, '©️', 12, true);

-- ========================================================================
-- 4️⃣ STEP 2 : DEUXIEME MENU (PRIX -50%) - 12 OPTIONS
-- ========================================================================

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'CURRY', 'Poulet mariné au curry, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 4.25, '🍛', 1, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'BOURSIN', 'Poulet mariné au curry, boursin, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 4.50, '🧀', 2, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'TANDOORI', 'Poulet mariné tandoori, poivrons, olives, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 4.25, '🌶️', 3, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'VACHE QUI RIT', 'Poulet mariné tandoori, vache qui rit, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 4.50, '🐮', 4, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'DINA', 'Steak, cordon bleu, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 4.50, '🥩', 5, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'BOX MASTER', 'Tenders, galette de pomme de terre, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 4.50, '📦', 6, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'SPECIAL', 'Chicken, steak, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 4.50, '⭐', 7, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'MIX TENDERS', 'Tenders, steak, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 4.50, '🍗', 8, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'RUSTIK', 'Poulet, crème fraîche, cordon bleu, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 5.00, '🏡', 9, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'TRIPLE X', '3 Steaks, cheddar, oeuf, bacon, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 5.20, '❌', 10, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'B SIX', '2 Steaks 45gr, fromage râpé, lardons, jambon de dinde, galette de pommes de terre, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 5.20, '🅱️', 11, true),
((SELECT id FROM france_products WHERE name = '1 MENU TORTILLA ACHETE = LA 2EME A -50%' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22)), 'Deuxieme Menu', 'C SIX', 'Poulet, fromage râpé, lardons, jambon de dinde, crème fraîche, galette de pomme de terre, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 5.20, '©️', 12, true);

-- ========================================================================
-- 5️⃣ MENUS INDIVIDUELS (PRODUITS SIMPLES) - 12 MENUS
-- ========================================================================

INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, icon, is_active, display_order) VALUES
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA CURRY', 'Poulet mariné au curry, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 8.50, 9.50, '🍛', true, 2),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA BOURSIN', 'Poulet mariné au curry, boursin, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 9.00, 10.00, '🧀', true, 3),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA TANDOORI', 'Poulet mariné tandoori, poivrons, olives, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 8.50, 9.50, '🌶️', true, 4),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA VACHE QUI RIT', 'Poulet mariné tandoori, vache qui rit, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 9.00, 10.00, '🐮', true, 5),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA DINA', 'Steak, cordon bleu, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 9.00, 10.00, '🥩', true, 6),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA BOX MASTER', 'Tenders, galette de pomme de terre, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 9.00, 10.00, '📦', true, 7),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA SPECIAL', 'Chicken, steak, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 9.00, 10.00, '⭐', true, 8),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA MIX TENDERS', 'Tenders, steak, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 9.00, 10.00, '🍗', true, 9),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA RUSTIK', 'Poulet, crème fraîche, cordon bleu, cheddar, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 10.00, 11.00, '🏡', true, 10),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA TRIPLE X', '3 Steaks, cheddar, oeuf, bacon, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 10.40, 11.40, '❌', true, 11),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA B SIX', '2 Steaks 45gr, fromage râpé, lardons, jambon de dinde, galette de pommes de terre, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 10.40, 11.40, '🅱️', true, 12),
(22, (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22), 'MENU TORTILLA C SIX', 'Poulet, fromage râpé, lardons, jambon de dinde, crème fraîche, galette de pomme de terre, oignons rouges, tomates, salade + Frites + 1 Boisson 33cl', 'simple', 10.40, 11.40, '©️', true, 13);

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT id, name, slug, display_order, icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'menus-tortillas';

-- Vérifier les produits créés
SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.product_type,
  p.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22 AND c.slug = 'menus-tortillas'
ORDER BY p.display_order;

-- Vérifier les options de l'offre
SELECT
  po.option_group,
  COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22 AND c.slug = 'menus-tortillas'
GROUP BY po.option_group
ORDER BY po.option_group;

-- Détail des options
SELECT
  po.option_group,
  po.option_name,
  po.price_modifier,
  po.icon,
  po.display_order
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22 AND c.slug = 'menus-tortillas'
ORDER BY po.option_group, po.display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- Catégorie : MENUS TORTILLAS 🌯
--
-- Produits :
-- 1. OFFRE: "1 MENU TORTILLA ACHETE = LA 2EME A -50%" (composite)
--    - Step 1: Premier Menu (12 options, prix pleins: 8.50€ à 10.40€)
--    - Step 2: Deuxième Menu (12 options, prix -50%: 4.25€ à 5.20€)
--    - Total: 24 options
--
-- 2-13. MENUS INDIVIDUELS (12 produits simples)
--    - CURRY: 8.50€ sur place / 9.50€ livraison
--    - BOURSIN: 9.00€ / 10.00€
--    - TANDOORI: 8.50€ / 9.50€
--    - VACHE QUI RIT: 9.00€ / 10.00€
--    - DINA: 9.00€ / 10.00€
--    - BOX MASTER: 9.00€ / 10.00€
--    - SPECIAL: 9.00€ / 10.00€
--    - MIX TENDERS: 9.00€ / 10.00€
--    - RUSTIK: 10.00€ / 11.00€
--    - TRIPLE X: 10.40€ / 11.40€
--    - B SIX: 10.40€ / 11.40€
--    - C SIX: 10.40€ / 11.40€
--
-- Exemple de prix OFFRE :
--   CURRY (8.50€) + RUSTIK -50% (5.00€) = 13.50€ sur place / 15.50€ livraison
-- ========================================================================
