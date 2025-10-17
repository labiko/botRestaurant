-- =========================================================================
-- ALIGNEMENT DEV AVEC PROD - CONTRAINTES MANQUANTES
-- DATE: 2025-01-06
-- OBJECTIF: Ajouter les contraintes UNIQUE présentes en PROD mais absentes en DEV
-- =========================================================================

BEGIN;

-- 1. Vérifier si la contrainte existe déjà
DO $$
BEGIN
    -- Ajouter la contrainte UNIQUE sur france_products
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'france_products_name_restaurant_category_key'
    ) THEN
        ALTER TABLE france_products
        ADD CONSTRAINT france_products_name_restaurant_category_key
        UNIQUE (name, restaurant_id, category_id);

        RAISE NOTICE '✅ Contrainte france_products_name_restaurant_category_key ajoutée';
    ELSE
        RAISE NOTICE '⚠️  Contrainte france_products_name_restaurant_category_key existe déjà';
    END IF;
END $$;

-- 2. Vérifier les doublons AVANT d'appliquer la contrainte (sécurité)
-- Si cette requête retourne des lignes, il faut nettoyer les doublons d'abord
SELECT
    name,
    restaurant_id,
    category_id,
    COUNT(*) as count
FROM france_products
GROUP BY name, restaurant_id, category_id
HAVING COUNT(*) > 1;

-- Si la requête ci-dessus retourne des résultats, exécutez ceci pour voir les doublons :
-- SELECT * FROM france_products
-- WHERE (name, restaurant_id, category_id) IN (
--     SELECT name, restaurant_id, category_id
--     FROM france_products
--     GROUP BY name, restaurant_id, category_id
--     HAVING COUNT(*) > 1
-- )
-- ORDER BY name, restaurant_id, category_id;

COMMIT;

-- =========================================================================
-- VÉRIFICATION FINALE
-- =========================================================================
-- Lister toutes les contraintes UNIQUE sur france_products
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'france_products'::regclass
AND contype IN ('u', 'p');  -- u = UNIQUE, p = PRIMARY KEY

-- =========================================================================
-- RÉSULTAT ATTENDU
-- =========================================================================
-- france_products_pkey | p | PRIMARY KEY (id)
-- france_products_name_restaurant_category_key | u | UNIQUE (name, restaurant_id, category_id)
-- =========================================================================
