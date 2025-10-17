-- ========================================================================
-- SCRIPT DE SUPPRESSION DÉFINITIVE - ANCIENS SANDWICHS PIZZA YOLO
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: SANDWICHS (ID: 3)
--
-- OBJECTIF: Supprimer définitivement les 11 anciens sandwichs individuels
-- PRÉREQUIS: Test bot WhatsApp réussi avec le nouveau produit composite
-- IDs À SUPPRIMER: 345, 346, 347, 348, 349, 351, 352, 353, 354, 355, 356
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
    -- Vérifier que les 11 sandwichs sont bien inactifs
    SELECT COUNT(*) INTO v_inactive_count
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 3
    AND id IN (345, 346, 347, 348, 349, 351, 352, 353, 354, 355, 356)
    AND is_active = false;

    IF v_inactive_count != 11 THEN
        RAISE EXCEPTION 'ERREUR: Tous les sandwichs ne sont pas inactifs! Trouvé: % sur 11', v_inactive_count;
    END IF;

    -- Vérifier que le produit composite SANDWICHS existe et est actif
    SELECT COUNT(*) INTO v_composite_exists
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 3
    AND name = 'SANDWICHS'
    AND product_type = 'composite'
    AND is_active = true;

    IF v_composite_exists = 0 THEN
        RAISE EXCEPTION 'ERREUR: Le produit composite SANDWICHS n''existe pas ou est inactif!';
    END IF;

    RAISE NOTICE 'Vérifications OK - 11 sandwichs inactifs trouvés, produit composite actif';
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
AND category_id = 3
AND id IN (345, 346, 347, 348, 349, 351, 352, 353, 354, 355, 356)
ORDER BY id;

-- ========================================================================
-- SUPPRESSION DÉFINITIVE
-- ========================================================================

-- Supprimer les 11 anciens sandwichs
-- Les options associées seront supprimées automatiquement (ON DELETE CASCADE)
DELETE FROM france_products
WHERE restaurant_id = 1
AND category_id = 3
AND id IN (345, 346, 347, 348, 349, 351, 352, 353, 354, 355, 356)
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
    WHERE id IN (345, 346, 347, 348, 349, 351, 352, 353, 354, 355, 356);

    IF v_deleted_count != 0 THEN
        RAISE EXCEPTION 'ERREUR: Suppression incomplète! Il reste % produits', v_deleted_count;
    END IF;

    RAISE NOTICE 'Suppression réussie - 11 sandwichs supprimés';
END $$;

-- Vérifier l'état final de la catégorie SANDWICHS
SELECT
    'ÉTAT FINAL SANDWICHS' AS info,
    COUNT(*) AS nb_produits_total,
    COUNT(*) FILTER (WHERE product_type = 'composite' AND is_active = true) AS nb_composite_actif,
    COUNT(*) FILTER (WHERE product_type = 'composite' AND is_active = false) AS nb_composite_inactif,
    COUNT(*) FILTER (WHERE product_type != 'composite' AND is_active = true) AS nb_individuels_actifs,
    COUNT(*) FILTER (WHERE product_type != 'composite' AND is_active = false) AS nb_individuels_inactifs
FROM france_products
WHERE restaurant_id = 1
AND category_id = 3;

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
AND p.category_id = 3
AND p.product_type = 'composite'
AND p.name = 'SANDWICHS';

-- Vérifier que les options du composite sont intactes
SELECT
    po.option_group AS "Groupe",
    COUNT(*) AS "Nb options"
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.restaurant_id = 1
AND p.category_id = 3
AND p.product_type = 'composite'
AND p.name = 'SANDWICHS'
GROUP BY po.option_group
ORDER BY po.option_group;

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU
-- ========================================================================
--
-- ✅ 11 anciens sandwichs supprimés (345-356, sauf 350)
-- ✅ Leurs options supprimées automatiquement (CASCADE)
-- ✅ Produit composite SANDWICHS intact avec 41 options
-- ✅ Modal d'édition affiche uniquement "SANDWICHS" (comme OCV)
--
-- ========================================================================
