-- ========================================================================
-- Migration: Remplir customer_country_code pour les commandes existantes
-- Date: 2025-10-01
-- Description: Détecte automatiquement le code pays depuis phone_number
-- ========================================================================

BEGIN;

-- Migration des commandes existantes
-- Détecter automatiquement le code pays depuis le numéro

UPDATE france_orders
SET customer_country_code =
  CASE
    -- Codes 3 chiffres (Afrique)
    WHEN phone_number LIKE '224%' THEN '224'
    WHEN phone_number LIKE '225%' THEN '225'
    WHEN phone_number LIKE '221%' THEN '221'
    WHEN phone_number LIKE '223%' THEN '223'
    WHEN phone_number LIKE '226%' THEN '226'
    WHEN phone_number LIKE '227%' THEN '227'
    WHEN phone_number LIKE '228%' THEN '228'
    WHEN phone_number LIKE '229%' THEN '229'

    -- Codes 2 chiffres (Europe)
    WHEN phone_number LIKE '33%' THEN '33'
    WHEN phone_number LIKE '32%' THEN '32'
    WHEN phone_number LIKE '41%' THEN '41'
    WHEN phone_number LIKE '34%' THEN '34'
    WHEN phone_number LIKE '39%' THEN '39'

    -- Codes 1 chiffre
    WHEN phone_number LIKE '1%' THEN '1'
    WHEN phone_number LIKE '7%' THEN '7'

    ELSE NULL
  END
WHERE customer_country_code IS NULL;

-- Vérifier les résultats
SELECT
  customer_country_code,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT SUBSTRING(phone_number, 1, 5)) as phone_samples
FROM france_orders
GROUP BY customer_country_code
ORDER BY count DESC;

COMMIT;

-- En cas de problème, pour annuler : ROLLBACK;
