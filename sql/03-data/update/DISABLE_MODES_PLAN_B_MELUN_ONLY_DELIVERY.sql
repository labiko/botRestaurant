-- ========================================================================
-- DÉSACTIVATION MODES - Plan B Melun
-- DATE: 2025-01-23
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- OBJECTIF: Désactiver "Sur place" et "À emporter", garder uniquement "Livraison"
-- TABLE: france_restaurant_service_modes
-- ========================================================================

BEGIN;

-- 🔍 VÉRIFICATION AVANT
SELECT
  id,
  restaurant_id,
  service_mode,
  is_enabled,
  display_name,
  display_order
FROM france_restaurant_service_modes
WHERE restaurant_id = 22
ORDER BY display_order;

-- 🔧 ÉTAPE 1 : Insérer les modes de service s'ils n'existent pas
INSERT INTO france_restaurant_service_modes (
  restaurant_id,
  service_mode,
  is_enabled,
  display_name,
  display_order
) VALUES
  (22, 'sur_place', false, 'Sur place', 1),
  (22, 'a_emporter', false, 'À emporter', 2),
  (22, 'livraison', true, 'Livraison', 3)
ON CONFLICT (restaurant_id, service_mode)
DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  display_name = EXCLUDED.display_name,
  display_order = EXCLUDED.display_order;

-- ✅ VÉRIFICATION APRÈS
SELECT
  id,
  restaurant_id,
  service_mode,
  is_enabled,
  display_name,
  display_order
FROM france_restaurant_service_modes
WHERE restaurant_id = 22
ORDER BY display_order;

COMMIT;

-- ========================================================================
-- RÉSUMÉ DES CHANGEMENTS :
-- ========================================================================
-- Restaurant: Plan B Melun
-- Table: france_restaurant_service_modes
--
-- Modes configurés :
-- - Sur place (sur_place): is_enabled = false ❌
-- - À emporter (a_emporter): is_enabled = false ❌
-- - Livraison (livraison): is_enabled = true ✅
--
-- Le bot affichera uniquement :
-- 🚚 Livraison
-- ========================================================================
