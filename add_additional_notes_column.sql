-- Script pour ajouter colonne additional_notes aux commandes
-- Exécuter manuellement dans Supabase Dashboard

BEGIN;

-- Ajouter colonne additional_notes si elle n'existe pas
ALTER TABLE france_orders
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'france_orders'
AND column_name = 'additional_notes';

COMMIT;