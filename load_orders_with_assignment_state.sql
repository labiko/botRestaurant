-- ============================================
-- Fonction SQL optimisée pour charger les commandes avec état des assignations
-- Remplace loadOrders() + loadPendingAssignmentsState() par UNE SEULE requête
-- ============================================

CREATE OR REPLACE FUNCTION load_orders_with_assignment_state(p_restaurant_id INTEGER)
RETURNS TABLE(
    -- ✅ TOUTES les colonnes de france_orders (comme SELECT *)
    id INTEGER,
    restaurant_id INTEGER,
    phone_number TEXT,
    customer_name TEXT,
    items JSONB,
    total_amount NUMERIC,
    delivery_mode TEXT,
    delivery_address TEXT,
    payment_mode TEXT,
    payment_method TEXT,
    status TEXT,
    notes TEXT,
    order_number TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    delivery_address_id INTEGER,
    delivery_validation_code TEXT,
    date_validation_code TIMESTAMPTZ,
    driver_id INTEGER,
    driver_assignment_status TEXT,
    delivery_started_at TIMESTAMPTZ,
    assignment_timeout_at TIMESTAMPTZ,
    estimated_delivery_time TEXT,
    assigned_driver_id INTEGER,
    assignment_started_at TIMESTAMPTZ,
    customer_whatsapp_name TEXT,
    notification_metadata JSONB,
    drivers_notified_count INTEGER,
    
    -- ✅ EXACTEMENT comme l'ancienne requête Supabase - Objets relationnels
    delivery_address_coordinates JSONB,  -- IDENTIQUE au format Supabase
    assigned_driver JSONB,               -- IDENTIQUE au format Supabase
    
    -- ✅ AJOUT : Colonnes calculées pour les assignations
    has_any_assignment BOOLEAN,
    has_pending_assignment BOOLEAN,
    pending_drivers_count INTEGER,
    pending_driver_names TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- ✅ TOUTES les colonnes de france_orders (données brutes identiques)
        fo.*,
        
        -- ✅ SEULEMENT les calculs d'assignation (pas de logique complexe)
        CASE 
            WHEN EXISTS(
                SELECT 1 FROM france_delivery_assignments fda 
                WHERE fda.order_id = fo.id 
                AND fda.assignment_status IN ('pending', 'expired')
            ) THEN true 
            ELSE false 
        END as has_any_assignment,
        
        CASE 
            WHEN EXISTS(
                SELECT 1 FROM france_delivery_assignments fda 
                WHERE fda.order_id = fo.id 
                AND fda.assignment_status = 'pending'
                AND fda.created_at > NOW() - INTERVAL '30 minutes'
            ) THEN true 
            ELSE false 
        END as has_pending_assignment,
        
        (
            SELECT COUNT(*)::INTEGER
            FROM france_delivery_assignments fda 
            WHERE fda.order_id = fo.id 
            AND fda.assignment_status = 'pending'
            AND fda.created_at > NOW() - INTERVAL '30 minutes'
        ) as pending_drivers_count,
        
        (
            SELECT STRING_AGG(
                TRIM(COALESCE(fdd.first_name, '') || ' ' || COALESCE(fdd.last_name, '')), 
                ', '
            )
            FROM france_delivery_assignments fda 
            LEFT JOIN france_delivery_drivers fdd ON fda.driver_id = fdd.id
            WHERE fda.order_id = fo.id 
            AND fda.assignment_status = 'pending'
            AND fda.created_at > NOW() - INTERVAL '30 minutes'
        ) as pending_driver_names,
        
        -- ✅ Relations Supabase EXACTEMENT comme avant (pour compatibilité TypeScript)
        (
            SELECT json_build_object(
                'latitude', fca.latitude,
                'longitude', fca.longitude,
                'address_label', fca.address_label
            )
            FROM france_customer_addresses fca 
            WHERE fca.id = fo.delivery_address_id
        ) as delivery_address_coordinates,
        
        (
            SELECT json_build_object(
                'id', fdd.id,
                'first_name', fdd.first_name,
                'last_name', fdd.last_name,
                'phone_number', fdd.phone_number
            )
            FROM france_delivery_drivers fdd 
            WHERE fdd.id = fo.driver_id
        ) as assigned_driver
        
    FROM france_orders fo
    WHERE fo.restaurant_id = p_restaurant_id
    ORDER BY fo.created_at DESC;
END;
$$ LANGUAGE plpgsql;