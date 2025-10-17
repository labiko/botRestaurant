-- ========================================================================
-- SCÉNARIOS DE TEST ABONNEMENT - Restaurant ID 16
-- ========================================================================

-- ========================================================================
-- SCÉNARIO 1 : Abonnement ACTIF (Plus de 30 jours restants)
-- Résultat attendu : Badge gris discret
-- ========================================================================
UPDATE france_restaurants
SET
  subscription_end_date = CURRENT_TIMESTAMP + INTERVAL '60 days',
  subscription_status = 'active',
  subscription_plan = 'quarterly'
WHERE id = 16;

SELECT 'SCÉNARIO 1: Abonnement actif (60 jours restants)' as test,
  subscription_status,
  subscription_end_date,
  (subscription_end_date::date - CURRENT_DATE) as jours_restants
FROM france_restaurants WHERE id = 16;


-- ========================================================================
-- SCÉNARIO 2 : Abonnement EXPIRE BIENTÔT (Moins de 30 jours)
-- Résultat attendu : Badge orange avec lien "Renouveler maintenant"
-- ========================================================================
UPDATE france_restaurants
SET
  subscription_end_date = CURRENT_TIMESTAMP + INTERVAL '15 days',
  subscription_status = 'expiring',
  subscription_plan = 'monthly'
WHERE id = 16;

SELECT 'SCÉNARIO 2: Expire bientôt (15 jours restants)' as test,
  subscription_status,
  subscription_end_date,
  (subscription_end_date::date - CURRENT_DATE) as jours_restants
FROM france_restaurants WHERE id = 16;


-- ========================================================================
-- SCÉNARIO 3 : Abonnement EXPIRE DANS 3 JOURS (Urgence)
-- Résultat attendu : Badge orange avec lien "Renouveler maintenant"
-- ========================================================================
UPDATE france_restaurants
SET
  subscription_end_date = CURRENT_TIMESTAMP + INTERVAL '3 days',
  subscription_status = 'expiring',
  subscription_plan = 'monthly'
WHERE id = 16;

SELECT 'SCÉNARIO 3: Expire dans 3 jours' as test,
  subscription_status,
  subscription_end_date,
  (subscription_end_date::date - CURRENT_DATE) as jours_restants
FROM france_restaurants WHERE id = 16;


-- ========================================================================
-- SCÉNARIO 4 : Abonnement EXPIRÉ (Hier)
-- Résultat attendu : Badge rouge avec lien "Renouveler pour continuer"
-- ========================================================================
UPDATE france_restaurants
SET
  subscription_end_date = CURRENT_TIMESTAMP - INTERVAL '1 day',
  subscription_status = 'expired',
  subscription_plan = 'monthly'
WHERE id = 16;

SELECT 'SCÉNARIO 4: Expiré depuis hier' as test,
  subscription_status,
  subscription_end_date,
  (subscription_end_date::date - CURRENT_DATE) as jours_restants
FROM france_restaurants WHERE id = 16;


-- ========================================================================
-- SCÉNARIO 5 : Abonnement EXPIRÉ DEPUIS LONGTEMPS (15 jours)
-- Résultat attendu : Badge rouge avec lien "Renouveler pour continuer"
-- ========================================================================
UPDATE france_restaurants
SET
  subscription_end_date = CURRENT_TIMESTAMP - INTERVAL '15 days',
  subscription_status = 'expired',
  subscription_plan = 'monthly'
WHERE id = 16;

SELECT 'SCÉNARIO 5: Expiré depuis 15 jours' as test,
  subscription_status,
  subscription_end_date,
  (subscription_end_date::date - CURRENT_DATE) as jours_restants
FROM france_restaurants WHERE id = 16;


-- ========================================================================
-- REMETTRE ÉTAT INITIAL : Abonnement actif pour 30 jours
-- ========================================================================
UPDATE france_restaurants
SET
  subscription_end_date = CURRENT_TIMESTAMP + INTERVAL '30 days',
  subscription_status = 'active',
  subscription_plan = 'monthly'
WHERE id = 16;

SELECT 'ÉTAT INITIAL RESTAURÉ: 30 jours restants' as test,
  subscription_status,
  subscription_end_date,
  (subscription_end_date::date - CURRENT_DATE) as jours_restants
FROM france_restaurants WHERE id = 16;
