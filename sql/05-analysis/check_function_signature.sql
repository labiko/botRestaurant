-- Vérifier la signature exacte de la fonction update_composite_items
SELECT 
    proname AS function_name,
    proargnames AS parameter_names,
    proargtypes::regtype[] AS parameter_types,
    pronargs AS number_of_args
FROM pg_proc
WHERE proname = 'update_composite_items';

-- Ou avec plus de détails
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'update_composite_items';