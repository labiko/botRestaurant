-- ========================================================================
-- TEST AVEC DES COMMANDES QUI ONT UN LIVREUR ASSIGNÉ
-- D'après les logs: driver_id = 22 pour plusieurs commandes
-- ========================================================================

-- ÉTAPE 1 : Trouver les commandes avec livreur assigné
SELECT
  fo.order_number,
  fo.driver_id,
  fo.driver_assignment_status,
  fdd.first_name as driver_first_name,
  fdd.last_name as driver_last_name,
  fdd.phone_number as driver_phone_number
FROM france_orders fo
LEFT JOIN france_delivery_drivers fdd ON fdd.id = fo.driver_id
WHERE fo.driver_id IS NOT NULL
  AND fo.order_number IN ('1510-0003', '1510-0002', '1410-0008', '1410-0002', '1410-0001', '1310-0001', '1110-0002')
ORDER BY fo.created_at DESC
LIMIT 5;

-- ========================================================================

-- ÉTAPE 2 : Tester la fonction load_orders_with_assignment_state
-- avec ces mêmes commandes
SELECT
  order_number,
  driver_id,
  driver_assignment_status,
  driver_first_name,
  driver_last_name,
  driver_phone_number,
  CASE
    WHEN driver_id IS NOT NULL AND driver_first_name IS NOT NULL THEN '✅ OK - Données livreur chargées'
    WHEN driver_id IS NOT NULL AND driver_first_name IS NULL THEN '❌ ERREUR - Livreur manquant'
    ELSE '⚪ Pas de livreur assigné'
  END as test_result
FROM load_orders_with_assignment_state(1) -- ⚠️ Remplacer 1 par le bon restaurant_id
WHERE order_number IN ('1510-0003', '1510-0002', '1410-0008', '1410-0002', '1410-0001', '1310-0001', '1110-0002')
ORDER BY created_at DESC;

-- ========================================================================

-- ÉTAPE 3 : Comparaison AVANT/APRÈS (simulation)
-- Cette requête montre ce que l'ancienne version retournait vs la nouvelle
SELECT
  fo.order_number,
  fo.driver_id as "AVANT: driver_id seulement",
  CONCAT(fdd.first_name, ' ', fdd.last_name) as "APRÈS: Nom complet livreur",
  fdd.phone_number as "APRÈS: Téléphone livreur"
FROM france_orders fo
LEFT JOIN france_delivery_drivers fdd ON fdd.id = fo.driver_id
WHERE fo.driver_id IS NOT NULL
ORDER BY fo.created_at DESC
LIMIT 10;
