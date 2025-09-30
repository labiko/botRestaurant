-- Migration: Ajout colonne trigger_type à green_api_health_logs
-- Date: 2025-09-30
-- Description: Permet de distinguer les types de checks (automatic, scheduled, manual)

-- Ajouter la colonne trigger_type
ALTER TABLE green_api_health_logs
ADD COLUMN IF NOT EXISTS trigger_type VARCHAR DEFAULT 'automatic'
CHECK (trigger_type IN ('automatic', 'scheduled', 'manual'));

-- Mettre à jour les logs existants
UPDATE green_api_health_logs
SET trigger_type = 'automatic'
WHERE trigger_type IS NULL;

-- Créer un index pour optimiser les requêtes par type
CREATE INDEX IF NOT EXISTS idx_health_logs_trigger_type ON green_api_health_logs(trigger_type);

-- Vérifier
SELECT
  trigger_type,
  COUNT(*) as count
FROM green_api_health_logs
GROUP BY trigger_type;