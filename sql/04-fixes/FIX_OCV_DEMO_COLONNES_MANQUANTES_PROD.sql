-- ========================================================================
-- CORRECTION OCV DEMO - COLONNES MANQUANTES DANS FRANCE_PRODUCTS
-- ========================================================================
-- DATE: 2025-10-19
-- ENVIRONNEMENT: PRODUCTION
-- PROBLÈME: Le script de duplication a oublié 4 colonnes critiques
-- ========================================================================
-- COLONNES À CORRIGER:
--   1. workflow_type        - 16 produits concernés (tous les composites)
--   2. requires_steps       - 16 produits concernés (tous les composites)
--   3. base_price           - 31 produits concernés
--   4. composition          - 56 produits concernés
-- ========================================================================
-- IMPACT: Sans workflow_type et requires_steps, le bot affiche "0€"
--         au lieu de "Prix selon choix" pour les produits composites
-- ========================================================================

BEGIN;

-- ========================================================================
-- VÉRIFICATIONS PRÉALABLES
-- ========================================================================

-- Vérifier que le restaurant DEMO existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM france_restaurants WHERE phone = '010101010') THEN
        RAISE EXCEPTION 'Restaurant DEMO (010101010) introuvable !';
    END IF;
END $$;

-- Vérifier que le restaurant source existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM france_restaurants WHERE id = 16) THEN
        RAISE EXCEPTION 'Restaurant source OCV (ID: 16) introuvable !';
    END IF;
END $$;

-- ========================================================================
-- ÉTAT AVANT CORRECTION
-- ========================================================================

SELECT
    '========== AVANT CORRECTION ==========' as info,
    (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010') AND workflow_type IS NOT NULL) as demo_with_workflow,
    (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010') AND requires_steps = true) as demo_with_requires,
    (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010') AND base_price IS NOT NULL) as demo_with_base_price,
    (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010') AND composition IS NOT NULL) as demo_with_composition;

-- ========================================================================
-- CORRECTION : COPIER LES 4 COLONNES MANQUANTES
-- ========================================================================

-- Mapping des produits source → DEMO par nom et position dans la catégorie
UPDATE france_products AS demo
SET
    workflow_type = source.workflow_type,
    requires_steps = source.requires_steps,
    base_price = source.base_price,
    composition = source.composition,
    updated_at = NOW()
FROM france_products AS source
WHERE
    -- Produit DEMO (par phone)
    demo.restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')
    -- Produit source OCV
    AND source.restaurant_id = 16
    -- Même nom de produit
    AND demo.name = source.name
    -- Même type de produit
    AND demo.product_type = source.product_type
    -- Même position dans les catégories (mapping par nom de catégorie)
    AND EXISTS (
        SELECT 1
        FROM france_menu_categories demo_cat
        JOIN france_menu_categories source_cat ON demo_cat.name = source_cat.name
        WHERE demo_cat.id = demo.category_id
        AND source_cat.id = source.category_id
        AND demo_cat.restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')
        AND source_cat.restaurant_id = 16
    );

-- Vérifier le nombre de lignes affectées
SELECT
    '========== RÉSULTAT UPDATE ==========' as info,
    COUNT(*) as produits_corriges
FROM france_products
WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')
AND updated_at > NOW() - INTERVAL '5 seconds';

-- ========================================================================
-- ÉTAT APRÈS CORRECTION
-- ========================================================================

SELECT
    '========== APRÈS CORRECTION ==========' as info,
    (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010') AND workflow_type IS NOT NULL) as demo_with_workflow,
    (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010') AND requires_steps = true) as demo_with_requires,
    (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010') AND base_price IS NOT NULL) as demo_with_base_price,
    (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010') AND composition IS NOT NULL) as demo_with_composition;

-- ========================================================================
-- VÉRIFICATIONS DÉTAILLÉES
-- ========================================================================

-- Vérification 1: Tous les composites ont workflow_type
SELECT
    'VÉRIF Workflow composites' as check_type,
    COUNT(*) as total_composites,
    COUNT(workflow_type) as with_workflow,
    CASE
        WHEN COUNT(*) = COUNT(workflow_type)
        THEN '✅ OK - Tous les composites ont workflow_type'
        ELSE '❌ ERREUR - Certains composites sans workflow_type'
    END as statut
FROM france_products
WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')
AND product_type = 'composite';

-- Vérification 2: Tous les composites ont requires_steps = true
SELECT
    'VÉRIF Requires steps composites' as check_type,
    COUNT(*) as total_composites,
    COUNT(CASE WHEN requires_steps = true THEN 1 END) as with_requires,
    CASE
        WHEN COUNT(*) = COUNT(CASE WHEN requires_steps = true THEN 1 END)
        THEN '✅ OK - Tous les composites ont requires_steps = true'
        ELSE '❌ ERREUR - Certains composites avec requires_steps = false'
    END as statut
FROM france_products
WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')
AND product_type = 'composite';

-- Vérification 3: Comparer totaux source vs DEMO
SELECT
    'VÉRIF Totaux source vs DEMO' as check_type,
    (SELECT COUNT(workflow_type) FROM france_products WHERE restaurant_id = 16) as source_workflow,
    (SELECT COUNT(workflow_type) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')) as demo_workflow,
    (SELECT COUNT(base_price) FROM france_products WHERE restaurant_id = 16) as source_base_price,
    (SELECT COUNT(base_price) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')) as demo_base_price,
    (SELECT COUNT(composition) FROM france_products WHERE restaurant_id = 16) as source_composition,
    (SELECT COUNT(composition) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')) as demo_composition;

-- Vérification 4: Exemple TACOS (le produit signalé par l'utilisateur)
SELECT
    'VÉRIF Produit TACOS' as check_type,
    id,
    restaurant_id,
    name,
    workflow_type,
    requires_steps,
    CASE
        WHEN workflow_type IS NOT NULL AND requires_steps = true
        THEN '✅ OK - Affichera "Prix selon choix"'
        ELSE '❌ ERREUR - Affichera "0€"'
    END as affichage_bot
FROM france_products
WHERE restaurant_id IN (16, 19)
AND name = 'TACOS'
ORDER BY restaurant_id;

-- ========================================================================
-- VALIDATION FINALE
-- ========================================================================

SELECT '========================================' as msg
UNION ALL SELECT '⚠️ VÉRIFIEZ TOUS LES RÉSULTATS CI-DESSUS'
UNION ALL SELECT '⚠️ Tous les checks doivent afficher ✅ OK'
UNION ALL SELECT '⚠️ TACOS DEMO doit afficher "Prix selon choix"'
UNION ALL SELECT '========================================'
UNION ALL SELECT 'Si OK → COMMIT;'
UNION ALL SELECT 'Si erreur → ROLLBACK;';

-- ========================================================================
-- VALIDATION AUTOMATIQUE
-- ========================================================================

-- Vérifier automatiquement que la correction est complète
DO $$
DECLARE
    source_workflow INT;
    demo_workflow INT;
    source_requires INT;
    demo_requires INT;
    demo_restaurant_id INT;
BEGIN
    -- Récupérer l'ID du restaurant DEMO
    SELECT id INTO demo_restaurant_id FROM france_restaurants WHERE phone = '010101010';

    -- Compter workflow_type
    SELECT COUNT(*) INTO source_workflow FROM france_products WHERE restaurant_id = 16 AND workflow_type IS NOT NULL;
    SELECT COUNT(*) INTO demo_workflow FROM france_products WHERE restaurant_id = demo_restaurant_id AND workflow_type IS NOT NULL;

    -- Compter requires_steps
    SELECT COUNT(*) INTO source_requires FROM france_products WHERE restaurant_id = 16 AND requires_steps = true;
    SELECT COUNT(*) INTO demo_requires FROM france_products WHERE restaurant_id = demo_restaurant_id AND requires_steps = true;

    -- Vérifier égalité
    IF source_workflow != demo_workflow THEN
        RAISE EXCEPTION 'ERREUR: Source a % workflow_type, DEMO a % workflow_type', source_workflow, demo_workflow;
    END IF;

    IF source_requires != demo_requires THEN
        RAISE EXCEPTION 'ERREUR: Source a % requires_steps=true, DEMO a % requires_steps=true', source_requires, demo_requires;
    END IF;

    RAISE NOTICE '✅ VALIDATION OK: Source et DEMO ont les mêmes configurations workflow';
END $$;

COMMIT;   -- ✅ Valider si toutes les vérifications passent
-- ROLLBACK; -- ❌ Annuler en cas d'erreur (décommenter si besoin)
