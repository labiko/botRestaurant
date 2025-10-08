-- Vérifier si des tokens ont été générés pour 0810-0008
SELECT COUNT(*) as token_count
FROM delivery_tokens dt
JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%';

-- Vérifier les assignments
SELECT COUNT(*) as assignment_count
FROM france_delivery_assignments fda
JOIN france_orders fo ON fda.order_id = fo.id
WHERE fo.order_number LIKE '0810-0008%';
