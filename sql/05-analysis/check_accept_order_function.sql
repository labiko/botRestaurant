-- Vérifier la signature de la fonction accept_order_atomic
SELECT
  proname as function_name,
  pg_get_function_arguments(oid) as parameters,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'accept_order_atomic';
