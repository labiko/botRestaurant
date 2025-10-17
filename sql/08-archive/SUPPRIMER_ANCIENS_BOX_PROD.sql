-- ========================================================================
-- SCRIPT: Suppression définitive des anciens produits MIXTE BOX et TENDERS BOX
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Produits: MIXTE BOX (241), TENDERS BOX (242)
-- Date: 2025-10-17
--
-- OBJECTIF:
-- Supprimer définitivement les anciens produits 241 et 242 devenus obsolètes
-- après la refonte de CHICKEN BOX
--
-- ATTENTION: Cette suppression est IRRÉVERSIBLE !
-- ========================================================================

BEGIN;

-- 1. SUPPRIMER LES OPTIONS DES PRODUITS 241 et 242
DELETE FROM france_product_options
WHERE product_id IN (241, 242);

-- 2. SUPPRIMER LES COMPOSITE_ITEMS (si pas déjà fait)
DELETE FROM france_composite_items
WHERE composite_product_id IN (241, 242);

-- 3. SUPPRIMER LES PRODUITS EUX-MÊMES
DELETE FROM france_products
WHERE id IN (241, 242)
  AND restaurant_id = 1
  AND name IN ('MIXTE BOX', 'TENDERS BOX');

-- Vérification finale
SELECT
  'VÉRIFICATION SUPPRESSION' as section,
  COUNT(*) as nb_produits_restants
FROM france_products
WHERE id IN (241, 242);

SELECT
  'OPTIONS RESTANTES' as section,
  COUNT(*) as nb_options_restantes
FROM france_product_options
WHERE product_id IN (241, 242);

SELECT
  'COMPOSITE_ITEMS RESTANTS' as section,
  COUNT(*) as nb_items_restants
FROM france_composite_items
WHERE composite_product_id IN (241, 242);

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ Produits 241 et 242 supprimés
-- ✅ Toutes les options associées supprimées
-- ✅ Tous les composite_items supprimés
-- ✅ Compteurs = 0 pour les 3 vérifications
-- ========================================================================
