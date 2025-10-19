-- ========================================================================
-- SUPPRESSION CONTRAINTE UNIQUE - INVITATIONS WHATSAPP
-- DATE: 2025-01-19
-- OBJECTIF: Permettre au restaurant d'envoyer plusieurs fois au même client
-- ========================================================================

BEGIN;

-- Supprimer la contrainte unique sur (restaurant_id, client_phone_number)
ALTER TABLE whatsapp_client_invitations
DROP CONSTRAINT IF EXISTS unique_restaurant_client;

-- Vérification
SELECT
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'whatsapp_client_invitations'::regclass;

COMMIT;

-- ✅ Maintenant le restaurant peut envoyer plusieurs invitations au même client
-- Chaque envoi créera une nouvelle ligne avec un nouveau timestamp
