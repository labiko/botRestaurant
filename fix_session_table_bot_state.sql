-- Fix table france_user_sessions - Ajouter colonne bot_state si manquante

BEGIN;

-- Vérifier si la colonne bot_state existe, sinon l'ajouter
DO $$ 
BEGIN
    -- Essayer d'ajouter la colonne bot_state
    BEGIN
        ALTER TABLE public.france_user_sessions 
        ADD COLUMN bot_state JSONB DEFAULT '{"mode": "menu_browsing", "language": "fr", "context": {}}'::JSONB;
        
        RAISE NOTICE 'Colonne bot_state ajoutée avec succès';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Colonne bot_state existe déjà - aucune action requise';
    END;
END $$;

-- Vérifier la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'france_user_sessions' 
  AND table_schema = 'public'
  AND column_name IN ('bot_state', 'session_data', 'current_step')
ORDER BY column_name;

COMMIT;