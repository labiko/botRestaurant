-- 🗑️ SUPPRESSION DU CHAMP DISPLAY_VARIANTS_INLINE
-- Script pour nettoyer complètement la colonne display_variants_inline

BEGIN;

-- 🔍 ÉTAPE 1: Vérifier si la colonne existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'france_products' 
        AND column_name = 'display_variants_inline'
    ) THEN
        RAISE NOTICE '🔍 Colonne display_variants_inline trouvée - Suppression en cours...';
        
        -- Supprimer la colonne
        ALTER TABLE france_products DROP COLUMN display_variants_inline;
        
        RAISE NOTICE '✅ Colonne display_variants_inline supprimée avec succès';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne display_variants_inline n''existe pas - Rien à supprimer';
    END IF;
END $$;

-- 🔍 ÉTAPE 2: Vérification de la suppression
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'france_products' 
        AND column_name = 'display_variants_inline'
    ) THEN
        RAISE NOTICE '✅ CONFIRMATION: Colonne display_variants_inline n''existe plus';
    ELSE
        RAISE NOTICE '❌ ERREUR: Colonne display_variants_inline existe encore';
    END IF;
END $$;

-- 📊 ÉTAPE 3: Afficher les colonnes actuelles de france_products (pour confirmation)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'france_products' 
ORDER BY ordinal_position;

COMMIT;

-- 🎉 NETTOYAGE TERMINÉ
-- La colonne display_variants_inline a été complètement supprimée de france_products