-- Vérifier le statut actuel de l'assignation pour la commande 44
SELECT 
    id,
    order_id,
    driver_id,
    assignment_status,
    created_at,
    responded_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 as age_minutes
FROM france_delivery_assignments 
WHERE order_id = 44
ORDER BY created_at DESC;

-- Vérifier si elle a été marquée comme expired
SELECT 
    'Statut actuel' as info,
    assignment_status,
    COUNT(*) as count
FROM france_delivery_assignments 
WHERE order_id = 44
GROUP BY assignment_status;