-- Afficher la définition actuelle de la fonction get_order_delivery_stats
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'get_order_delivery_stats';