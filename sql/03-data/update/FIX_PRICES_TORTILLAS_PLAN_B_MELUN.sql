-- ========================================================================
-- CORRECTION PRIX TORTILLAS ET MENUS TORTILLAS - PLAN B MELUN
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Problème: Prix livraison = prix sur place + 1€ (FAUX pour Plan B)
-- Solution: Aligner prix livraison sur prix sur place (même prix)
-- ========================================================================
-- ⚠️ RÈGLE PLAN B MELUN : Prix identiques sur place ET livraison
-- Catégories concernées: TORTILLAS (12 produits) + MENUS TORTILLAS (12 produits) = 24 produits
-- ========================================================================

BEGIN;

-- Correction 1: TORTILLAS (12 produits)
UPDATE france_products
SET price_delivery_base = price_on_site_base
WHERE restaurant_id = 22
  AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22);

-- Correction 2: MENUS TORTILLAS (12 produits)
UPDATE france_products
SET price_delivery_base = price_on_site_base
WHERE restaurant_id = 22
  AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-tortillas' AND restaurant_id = 22);

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier TORTILLAS (12 produits)
SELECT
  'TORTILLAS' as categorie,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  CASE
    WHEN p.price_on_site_base = p.price_delivery_base THEN '✓ OK'
    ELSE '✗ ERREUR'
  END as verification
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22 AND c.slug = 'tortillas'
ORDER BY p.display_order;

-- Vérifier MENUS TORTILLAS (12 produits)
SELECT
  'MENUS TORTILLAS' as categorie,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  CASE
    WHEN p.price_on_site_base = p.price_delivery_base THEN '✓ OK'
    ELSE '✗ ERREUR'
  END as verification
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22 AND c.slug = 'menus-tortillas'
ORDER BY p.display_order;

-- Compter le nombre total de produits corrigés (doit être 24)
SELECT
  COUNT(*) as nb_produits_corriges,
  '24 attendu' AS verification
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22
  AND c.slug IN ('tortillas', 'menus-tortillas')
  AND p.price_on_site_base = p.price_delivery_base;

-- Compter les produits avec prix différents (doit être 0 après correction)
SELECT
  COUNT(*) as nb_produits_avec_prix_differents,
  '0 attendu' AS verification
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22
  AND c.slug IN ('tortillas', 'menus-tortillas')
  AND p.price_on_site_base <> p.price_delivery_base;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 24 produits corrigés (12 TORTILLAS + 12 MENUS TORTILLAS)
--
-- AVANT (prix livraison = prix sur place + 1€) :
--   TORTILLA CURRY: 6.50€ → 7.50€
--   TORTILLA TANDOORI: 6.50€ → 7.50€
--   TORTILLA MIX TENDERS: 6.90€ → 7.90€
--   MENU TORTILLA CURRY: 8.50€ → 9.50€
--   MENU TORTILLA BOURSIN: 9.00€ → 10.00€
--   Etc...
--
-- APRÈS (prix identiques sur place et livraison) :
--   TORTILLA CURRY: 6.50€ → 6.50€
--   TORTILLA TANDOORI: 6.50€ → 6.50€
--   TORTILLA MIX TENDERS: 6.90€ → 6.90€
--   MENU TORTILLA CURRY: 8.50€ → 8.50€
--   MENU TORTILLA BOURSIN: 9.00€ → 9.00€
--   Etc...
-- ========================================================================
