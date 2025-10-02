-- ========================================================================
-- Migration: Ajout colonne customer_country_code
-- Date: 2025-10-01
-- Description: Stocke l'indicatif pays du client pour notifications WhatsApp multi-pays
-- ========================================================================

BEGIN;

-- Ajouter la colonne customer_country_code à france_orders
ALTER TABLE france_orders
ADD COLUMN customer_country_code VARCHAR(5);

-- Créer un index pour les requêtes filtrées par pays
CREATE INDEX idx_france_orders_country_code
ON france_orders(customer_country_code);

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN france_orders.customer_country_code IS
'Code pays du client (ex: 33, 224, 221) extrait automatiquement du numéro WhatsApp au format international';

-- Vérification
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'france_orders'
  AND column_name = 'customer_country_code';

COMMIT;

-- En cas de problème, pour annuler : ROLLBACK;
