-- Tester directement la fonction pour voir ce qu'elle retourne
SELECT * FROM get_order_delivery_stats(44);

-- Vérifier quelle version de la fonction est en base
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'get_order_delivery_stats';