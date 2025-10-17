-- ========================================================================
-- SCRIPT DE SUPPRESSION DÉFINITIVE - ANCIENS ASSIETTES PIZZA YOLO
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: ASSIETTES (ID: 6)
--
-- OBJECTIF: Supprimer définitivement les 3 anciens produits assiettes
-- PRÉREQUIS: Test bot WhatsApp réussi avec le nouveau produit composite
-- IDs À SUPPRIMER: 456, 226, 227
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
    -- Vérifier que les 3 assiettes sont bien inactives
    SELECT COUNT(*) INTO v_inactive_count
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 6
    AND id IN (456, 226, 227)
    AND is_active = false;

    IF v_inactive_count != 3 THEN
        RAISE EXCEPTION 'ERREUR: Toutes les assiettes ne sont pas inactives! Trouvé: % sur 3', v_inactive_count;
    END IF;

    -- Vérifier que le produit composite ASSIETTES existe et est actif
    SELECT COUNT(*) INTO v_composite_exists
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 6
    AND name = 'ASSIETTES'
    AND product_type = 'composite'
    AND is_active = true;

    IF v_composite_exists = 0 THEN
        RAISE EXCEPTION 'ERREUR: Le produit composite ASSIETTES n''existe pas ou est inactif!';
    END IF;

    RAISE NOTICE 'Vérifications OK - 3 assiettes inactives trouvées, produit composite actif';
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
AND category_id = 6
AND id IN (456, 226, 227)
ORDER BY id;

-- ========================================================================
-- SUPPRESSION DÉFINITIVE
-- ========================================================================

-- Supprimer les 3 anciens produits assiettes
-- Les options associées seront supprimées automatiquement (ON DELETE CASCADE)
DELETE FROM france_products
WHERE restaurant_id = 1
AND category_id = 6
AND id IN (456, 226, 227)
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
    WHERE id IN (456, 226, 227);

    IF v_deleted_count != 0 THEN
        RAISE EXCEPTION 'ERREUR: Suppression incomplète! Il reste % produits', v_deleted_count;
    END IF;

    RAISE NOTICE 'Suppression réussie - 3 assiettes supprimées';
END $$;

-- Vérifier l'état final de la catégorie ASSIETTES
SELECT
    'ÉTAT FINAL ASSIETTES' AS info,
    COUNT(*) AS nb_produits_total,
    COUNT(*) FILTER (WHERE product_type = 'composite' AND is_active = true) AS nb_composite_actif,
    COUNT(*) FILTER (WHERE product_type = 'composite' AND is_active = false) AS nb_composite_inactif,
    COUNT(*) FILTER (WHERE product_type != 'composite' AND is_active = true) AS nb_individuels_actifs,
    COUNT(*) FILTER (WHERE product_type != 'composite' AND is_active = false) AS nb_individuels_inactifs
FROM france_products
WHERE restaurant_id = 1
AND category_id = 6;

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
AND p.category_id = 6
AND p.product_type = 'composite'
AND p.name = 'ASSIETTES';

-- Vérifier que les options du composite sont intactes
SELECT
    po.option_group AS "Groupe",
    COUNT(*) AS "Nb options"
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.restaurant_id = 1
AND p.category_id = 6
AND p.product_type = 'composite'
AND p.name = 'ASSIETTES'
GROUP BY po.option_group
ORDER BY po.option_group;

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU
-- ========================================================================
--
-- ✅ 3 anciens produits assiettes supprimés (456, 226, 227)
-- ✅ Leurs options supprimées automatiquement (CASCADE)
-- ✅ Produit composite ASSIETTES intact avec 33 options
-- ✅ Modal d'édition affiche uniquement "ASSIETTES" (comme OCV)
--
-- ========================================================================
