-- Vérifier les valeurs de delivery_tokens.updated_at pour la commande 44
SELECT 
    dt.id as token_id,
    dt.order_id,
    dt.driver_id,
    dt.updated_at as token_updated_at,
    dt.created_at as token_created_at,
    fo.assignment_started_at,
    fo.updated_at as order_updated_at,
    fo.order_number
FROM delivery_tokens dt 
JOIN france_orders fo ON dt.order_id = fo.id 
WHERE dt.order_id = 44 
ORDER BY dt.updated_at DESC;