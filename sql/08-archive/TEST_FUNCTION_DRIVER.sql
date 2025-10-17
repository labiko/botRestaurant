-- ========================================================================
-- TEST DE LA FONCTION load_orders_with_assignment_state
-- Commande test: 1809-0009
-- ========================================================================

-- ÉTAPE 1 : Vérifier les données brutes de la commande
SELECT
  fo.order_number,
  fo.driver_id,
  fo.driver_assignment_status,
  fo.restaurant_id,
  fdd.first_name as driver_first_name,
  fdd.last_name as driver_last_name,
  fdd.phone_number as driver_phone_number
FROM france_orders fo
LEFT JOIN france_delivery_drivers fdd ON fdd.id = fo.driver_id
WHERE fo.order_number = '1809-0009';

-- ========================================================================

-- ÉTAPE 2 : Tester la fonction avec le restaurant_id de cette commande
-- (Remplacer X par le restaurant_id obtenu à l'étape 1)
SELECT
  order_number,
  driver_id,
  driver_assignment_status,
  driver_first_name,
  driver_last_name,
  driver_phone_number
FROM load_orders_with_assignment_state(1) -- ⚠️ Remplacer 1 par le bon restaurant_id
WHERE order_number = '1809-0009';

-- ========================================================================

-- ÉTAPE 3 : Vérifier TOUTES les commandes avec livreur assigné
SELECT
  order_number,
  status,
  driver_id,
  driver_assignment_status,
  driver_first_name,
  driver_last_name,
  driver_phone_number,
  CASE
    WHEN driver_id IS NOT NULL AND driver_first_name IS NOT NULL THEN '✅ OK'
    WHEN driver_id IS NOT NULL AND driver_first_name IS NULL THEN '❌ MANQUANT'
    ELSE '⚪ Pas de livreur'
  END as test_result
FROM load_orders_with_assignment_state(1) -- ⚠️ Remplacer 1 par le bon restaurant_id
WHERE driver_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
