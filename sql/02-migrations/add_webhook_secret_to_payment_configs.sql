-- ========================================================================
-- MIGRATION: Ajouter webhook_secret à restaurant_payment_configs
-- DATE: 2025-10-23
-- OBJECTIF: Support multi-restaurant avec webhook secrets différents
-- ========================================================================

BEGIN;

-- Ajouter la colonne webhook_secret
ALTER TABLE restaurant_payment_configs
ADD COLUMN IF NOT EXISTS webhook_secret VARCHAR;

-- Commentaire
COMMENT ON COLUMN restaurant_payment_configs.webhook_secret IS 'Webhook signing secret pour vérifier les webhooks (ex: whsec_... pour Stripe)';

-- Mettre à jour les configs existantes avec le secret actuel
UPDATE restaurant_payment_configs
SET webhook_secret = 'whsec_2XkmPEX0pNWHMXLP3Ukyw6phGmt6Qfsi'
WHERE provider = 'stripe' AND webhook_secret IS NULL;

COMMIT;

-- ========================================================================
-- RÉSUMÉ :
-- ========================================================================
-- - Colonne webhook_secret ajoutée à restaurant_payment_configs
-- - Configs Stripe existantes mises à jour avec le secret actuel
-- - Chaque restaurant pourra avoir son propre webhook secret
-- ========================================================================
