-- ========================================================================
-- Vérifier la version de la fonction load_orders_with_assignment_state
-- ========================================================================

-- Voir la définition complète de la fonction
SELECT pg_get_functiondef('public.load_orders_with_assignment_state(integer)'::regprocedure);

-- OU voir les colonnes retournées par la fonction
SELECT
  proname as function_name,
  pg_get_function_result('public.load_orders_with_assignment_state(integer)'::regprocedure) as return_columns
FROM pg_proc
WHERE proname = 'load_orders_with_assignment_state';
