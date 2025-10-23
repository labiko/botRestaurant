-- ========================================================================
-- SUPPRESSION LIVREUR - Mamadou (33620951645)
-- DATE: 2025-01-23
-- DRIVER ID: 28
-- RESTAURANT: id=1
-- TÉLÉPHONE: 33620951645
-- ⚠️ ATTENTION: Suppression en CASCADE (données liées seront aussi supprimées)
-- ========================================================================

BEGIN;

-- 🔍 VÉRIFICATION AVANT - Informations du livreur
SELECT
  id,
  restaurant_id,
  first_name,
  last_name,
  phone_number,
  email,
  is_active,
  created_at
FROM france_delivery_drivers
WHERE phone_number = '33620951645';

-- 🔍 VÉRIFICATION - Commandes liées
SELECT
  COUNT(*) as nb_commandes_liees,
  'france_orders' as table_name
FROM france_orders
WHERE driver_id = 28;

-- 🔍 VÉRIFICATION - Affectations de livraison
SELECT
  COUNT(*) as nb_affectations,
  'france_delivery_assignments' as table_name
FROM france_delivery_assignments
WHERE driver_id = 28;

-- 🔍 VÉRIFICATION - Localisations
SELECT
  COUNT(*) as nb_locations,
  'france_driver_locations' as table_name
FROM france_driver_locations
WHERE driver_id = 28;

-- 🔍 VÉRIFICATION - Tokens
SELECT
  COUNT(*) as nb_tokens,
  'delivery_tokens' as table_name
FROM delivery_tokens
WHERE driver_id = 28;

-- 🔍 VÉRIFICATION - Refus
SELECT
  COUNT(*) as nb_refusals,
  'delivery_refusals' as table_name
FROM delivery_refusals
WHERE driver_id = 28;

-- 🔍 VÉRIFICATION - Actions
SELECT
  COUNT(*) as nb_actions,
  'delivery_driver_actions' as table_name
FROM delivery_driver_actions
WHERE driver_id = 28;

-- 🗑️ SUPPRESSION (CASCADE activé)
DELETE FROM france_delivery_drivers
WHERE phone_number = '33620951645';

-- ✅ VÉRIFICATION APRÈS - Le livreur doit avoir disparu
SELECT
  COUNT(*) as nb_livreurs_restants,
  'Doit être 0' as verification
FROM france_delivery_drivers
WHERE phone_number = '33620951645';

COMMIT;

-- ========================================================================
-- RÉSUMÉ DE LA SUPPRESSION :
-- ========================================================================
-- Livreur supprimé :
-- - ID: 28
-- - Nom: Mamadou Mamadou
-- - Téléphone: 33620951645
-- - Restaurant: id=1
--
-- ⚠️ Données liées supprimées automatiquement (CASCADE) :
-- - delivery_driver_actions (actions du livreur)
-- - delivery_refusals (refus de livraison)
-- - delivery_tokens (tokens de connexion)
-- - france_delivery_assignments (affectations de livraison)
-- - france_driver_locations (historique de localisation)
--
-- ⚠️ Données modifiées :
-- - france_orders : driver_id mis à NULL (ON DELETE SET NULL)
-- ========================================================================
