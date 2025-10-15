-- ========================================================================
-- ALTER TABLE france_gdpr_consents - Ajout champ pending_workflow
-- Stockage du contexte workflow avant consentement (persistance DB)
-- ENVIRONNEMENT : DEV
-- DATE : 2025-10-15
-- PROBLÈME RÉSOLU : Perte de contexte entre requêtes (Edge Functions stateless)
-- ========================================================================

BEGIN;

-- Ajouter colonne pending_workflow pour stocker le contexte workflow
ALTER TABLE public.france_gdpr_consents
ADD COLUMN IF NOT EXISTS pending_workflow JSONB DEFAULT NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN public.france_gdpr_consents.pending_workflow IS
'Contexte workflow en attente de consentement. Format: {"type": "resto"} ou {"type": "direct_access", "restaurant": {...}}';

-- Vérification de l'ajout de la colonne
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'france_gdpr_consents'
  AND column_name = 'pending_workflow';

COMMIT;
