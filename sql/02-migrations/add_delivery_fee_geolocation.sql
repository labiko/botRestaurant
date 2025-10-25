-- ========================================================================
-- AJOUT FRAIS DE LIVRAISON POUR MODE GEOLOCATION
-- DATE: 2025-01-24
-- ENVIRONNEMENT: DEV + PROD
-- AUTEUR: Système
-- ========================================================================

BEGIN;

-- Ajouter colonne frais de livraison dans france_restaurants
ALTER TABLE france_restaurants
ADD COLUMN IF NOT EXISTS delivery_fee_geolocation INTEGER DEFAULT 0;

-- Ajouter colonne frais de livraison dans france_orders
ALTER TABLE france_orders
ADD COLUMN IF NOT EXISTS delivery_fee INTEGER DEFAULT 0;

-- Mettre à jour restaurant Guinée (exemple: 5000 GNF)
UPDATE france_restaurants
SET delivery_fee_geolocation = 5000
WHERE id = 17 AND delivery_fee_geolocation = 0;

-- Vérification
SELECT id, name, delivery_address_mode, delivery_fee_geolocation, currency
FROM france_restaurants
WHERE delivery_address_mode = 'geolocation';

COMMIT;
