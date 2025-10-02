-- ========================================================================
-- Migration: Ajout colonne country_code pour livreurs
-- Date: 2025-10-01
-- Description: Stocke l'indicatif pays du livreur pour notifications WhatsApp multi-pays
-- ========================================================================

BEGIN;

-- Ajouter la colonne country_code à france_delivery_drivers
ALTER TABLE france_delivery_drivers
ADD COLUMN country_code VARCHAR(5);

-- Créer un index pour les requêtes filtrées par pays
CREATE INDEX idx_france_delivery_drivers_country_code
ON france_delivery_drivers(country_code);

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN france_delivery_drivers.country_code IS
'Code pays du livreur (ex: 33, 224, 221) extrait du numéro de téléphone au format international';

-- Vérification
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'france_delivery_drivers'
  AND column_name = 'country_code';

COMMIT;

-- En cas de problème, pour annuler : ROLLBACK;
