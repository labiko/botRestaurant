-- ========================================================================
-- CORRECTION PRODUCT_TYPE OFFRES PROMOTIONNELLES - PLAN B MELUN
-- DATE: 2025-10-22
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Problème : Les offres promotionnelles ont été créées avec product_type='simple'
--            au lieu de 'composite', ce qui empêche l'affichage des 2 menus
-- Objectif : Corriger le product_type pour les 3 offres promotionnelles
-- ========================================================================

BEGIN;

-- ========================================================================
-- AVANT CORRECTION - Vérifier l'état actuel
-- ========================================================================

SELECT
  p.name,
  p.product_type as type_actuel,
  c.name as categorie
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22
  AND p.name LIKE '%2EME A -50%'
ORDER BY c.name;

-- ========================================================================
-- CORRECTION DES 3 OFFRES PROMOTIONNELLES
-- ========================================================================

-- 1. Offre MENU BURGER CLASSIC
UPDATE france_products
SET product_type = 'composite'
WHERE restaurant_id = 22
  AND name = '1 MENU BURGER CLASSIC ACHETE = LE 2EME A -50%'
  AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-classic-burgers' AND restaurant_id = 22);

-- 2. Offre MENU SMASH BURGER
UPDATE france_products
SET product_type = 'composite'
WHERE restaurant_id = 22
  AND name = '1 MENU SMASH BURGER ACHETE = LE 2EME A -50%'
  AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-smash-burgers' AND restaurant_id = 22);

-- 3. Offre BURGER MAISON
UPDATE france_products
SET product_type = 'composite'
WHERE restaurant_id = 22
  AND name = '1 BURGER MAISON ACHETE = LE 2EME A -50%'
  AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'menus-burgers-maison' AND restaurant_id = 22);

-- ========================================================================
-- APRÈS CORRECTION - Vérifier les changements
-- ========================================================================

SELECT
  p.name,
  p.product_type as type_corrige,
  c.name as categorie,
  CASE
    WHEN p.product_type = 'composite' THEN '✅ CORRIGÉ'
    ELSE '❌ ERREUR'
  END as statut
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22
  AND p.name LIKE '%2EME A -50%'
ORDER BY c.name;

-- ========================================================================
-- VÉRIFICATION FINALE - Compter les offres corrigées
-- ========================================================================

SELECT
  COUNT(*) as nb_offres_corrigees,
  '3 attendu' as verification
FROM france_products
WHERE restaurant_id = 22
  AND name LIKE '%2EME A -50%'
  AND product_type = 'composite';

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 3 produits corrigés de product_type='simple' vers product_type='composite' :
--   1. 1 MENU BURGER CLASSIC ACHETE = LE 2EME A -50% (MENUS CLASSIC BURGERS)
--   2. 1 MENU SMASH BURGER ACHETE = LE 2EME A -50% (MENUS SMASH BURGERS)
--   3. 1 BURGER MAISON ACHETE = LE 2EME A -50% (MENUS BURGERS MAISON)
--
-- Après cette correction, le panier WhatsApp affichera correctement
-- les 2 menus sélectionnés au lieu de seulement le 2ème menu
-- ========================================================================
