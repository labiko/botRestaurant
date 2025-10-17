-- ========================================================================
-- SCRIPT DE SUPPRESSION DÉFINITIVE - ANCIENS BURGERS PIZZA YOLO
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: BURGERS (ID: 2)
--
-- OBJECTIF: Supprimer définitivement les 10 anciens burgers individuels
-- PRÉREQUIS: Test bot WhatsApp réussi avec le nouveau produit composite
-- IDs À SUPPRIMER: 357, 358, 359, 360, 361, 362, 363, 364, 365, 366
--
-- ⚠️ ATTENTION: Cette opération est IRRÉVERSIBLE !
-- Les options associées seront supprimées automatiquement (CASCADE)
-- ========================================================================

BEGIN;

-- ========================================================================
-- VÉRIFICATIONS DE SÉCURITÉ
-- ========================================================================

DO $$
DECLARE
    v_inactive_count INTEGER;
    v_composite_exists INTEGER;
BEGIN
    -- Vérifier que les 10 burgers sont bien inactifs
    SELECT COUNT(*) INTO v_inactive_count
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 2
    AND id IN (357, 358, 359, 360, 361, 362, 363, 364, 365, 366)
    AND is_active = false;

    IF v_inactive_count != 10 THEN
        RAISE EXCEPTION 'ERREUR: Tous les burgers ne sont pas inactifs! Trouvé: % sur 10', v_inactive_count;
    END IF;

    -- Vérifier que le produit composite BURGERS existe et est actif
    SELECT COUNT(*) INTO v_composite_exists
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 2
    AND name = 'BURGERS'
    AND product_type = 'composite'
    AND is_active = true;

    IF v_composite_exists = 0 THEN
        RAISE EXCEPTION 'ERREUR: Le produit composite BURGERS n''existe pas ou est inactif!';
    END IF;

    RAISE NOTICE 'Vérifications OK - 10 burgers inactifs trouvés, produit composite actif';
END $$;

-- Afficher les produits qui vont être supprimés
SELECT
    id,
    name,
    product_type,
    is_active,
    (SELECT COUNT(*) FROM france_product_options WHERE product_id = id) AS nb_options_associees,
    'VA ÊTRE SUPPRIMÉ' AS statut
FROM france_products
WHERE restaurant_id = 1
AND category_id = 2
AND id IN (357, 358, 359, 360, 361, 362, 363, 364, 365, 366)
ORDER BY id;

-- ========================================================================
-- SUPPRESSION DÉFINITIVE
-- ========================================================================

-- Supprimer les 10 anciens burgers
-- Les options associées seront supprimées automatiquement (ON DELETE CASCADE)
DELETE FROM france_products
WHERE restaurant_id = 1
AND category_id = 2
AND id IN (357, 358, 359, 360, 361, 362, 363, 364, 365, 366)
AND is_active = false;

-- ========================================================================
-- VÉRIFICATIONS POST-SUPPRESSION
-- ========================================================================

-- Vérifier que les produits ont été supprimés
DO $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_deleted_count
    FROM france_products
    WHERE id IN (357, 358, 359, 360, 361, 362, 363, 364, 365, 366);

    IF v_deleted_count != 0 THEN
        RAISE EXCEPTION 'ERREUR: Suppression incomplète! Il reste % produits', v_deleted_count;
    END IF;

    RAISE NOTICE 'Suppression réussie - 10 burgers supprimés';
END $$;

-- Vérifier l'état final de la catégorie BURGERS
SELECT
    'ÉTAT FINAL BURGERS' AS info,
    COUNT(*) AS nb_produits_total,
    COUNT(*) FILTER (WHERE product_type = 'composite' AND is_active = true) AS nb_composite_actif,
    COUNT(*) FILTER (WHERE product_type = 'composite' AND is_active = false) AS nb_composite_inactif,
    COUNT(*) FILTER (WHERE product_type != 'composite' AND is_active = true) AS nb_individuels_actifs,
    COUNT(*) FILTER (WHERE product_type != 'composite' AND is_active = false) AS nb_individuels_inactifs
FROM france_products
WHERE restaurant_id = 1
AND category_id = 2;

-- Afficher le produit composite final
SELECT
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.is_active,
    (SELECT COUNT(*) FROM france_product_options WHERE product_id = p.id) AS nb_options,
    'PRODUIT FINAL ACTIF' AS statut
FROM france_products p
WHERE p.restaurant_id = 1
AND p.category_id = 2
AND p.product_type = 'composite'
AND p.name = 'BURGERS';

-- Vérifier que les options du composite sont intactes
SELECT
    po.option_group AS "Groupe",
    COUNT(*) AS "Nb options"
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.restaurant_id = 1
AND p.category_id = 2
AND p.product_type = 'composite'
AND p.name = 'BURGERS'
GROUP BY po.option_group
ORDER BY po.option_group;

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU
-- ========================================================================
--
-- ✅ 10 anciens burgers supprimés (357-366)
-- ✅ Leurs options supprimées automatiquement (CASCADE)
-- ✅ Produit composite BURGERS intact avec 40 options
-- ✅ Modal d'édition affiche uniquement "BURGERS" (comme OCV)
--
-- ========================================================================
