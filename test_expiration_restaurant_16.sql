-- ========================================================================
-- TEST EXPIRATION ABONNEMENT - Restaurant ID 16
-- ========================================================================

-- 1. Voir l'état actuel
SELECT
  id,
  name,
  subscription_status,
  subscription_end_date,
  subscription_plan,
  (subscription_end_date::date - CURRENT_DATE) as jours_restants
FROM france_restaurants
WHERE id = 16;

-- 2. Simuler expiration (mettre la date à hier)
UPDATE france_restaurants
SET
  subscription_end_date = CURRENT_TIMESTAMP - INTERVAL '1 day',
  subscription_status = 'expired'
WHERE id = 16;

-- 3. Vérifier le changement
SELECT
  id,
  name,
  subscription_status,
  subscription_end_date,
  subscription_plan,
  (subscription_end_date::date - CURRENT_DATE) as jours_restants
FROM france_restaurants
WHERE id = 16;

-- ========================================================================
-- POUR REMETTRE L'ABONNEMENT ACTIF APRÈS LE TEST :
-- ========================================================================
-- UPDATE france_restaurants
-- SET
--   subscription_end_date = CURRENT_TIMESTAMP + INTERVAL '30 days',
--   subscription_status = 'active'
-- WHERE id = 16;
