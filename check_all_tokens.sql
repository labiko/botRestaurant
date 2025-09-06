-- Vérifier TOUS les tokens pour la commande 44
SELECT 
    dt.id as token_id,
    dt.driver_id,
    dt.used,
    dt.suspended,
    dt.reactivated,
    dt.created_at,
    dt.updated_at,
    dt.expires_at,
    fdd.first_name || ' ' || fdd.last_name as driver_name
FROM delivery_tokens dt
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
WHERE dt.order_id = 44
ORDER BY dt.updated_at DESC;

-- Vérifier quel est le token le plus récent non utilisé
SELECT 
    MAX(dt.updated_at) as last_token_update
FROM delivery_tokens dt
WHERE dt.order_id = 44
    AND dt.used = false;