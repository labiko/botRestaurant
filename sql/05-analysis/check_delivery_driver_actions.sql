-- Vérifier la structure de delivery_driver_actions
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'delivery_driver_actions'
ORDER BY ordinal_position;

-- Voir les actions existantes pour la commande 44
SELECT 
    dda.*,
    fdd.first_name || ' ' || fdd.last_name as driver_name
FROM delivery_driver_actions dda
LEFT JOIN france_delivery_drivers fdd ON dda.driver_id = fdd.id
WHERE dda.order_id = 44
ORDER BY dda.action_timestamp DESC;