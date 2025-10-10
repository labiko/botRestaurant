-- ============================================================================
-- Modification RPC load_orders_with_assignment_state
-- Ajout des colonnes d'abonnement
-- ============================================================================

CREATE OR REPLACE FUNCTION load_orders_with_assignment_state(p_restaurant_id INTEGER)
RETURNS TABLE (
  order_id INTEGER,
  order_numero TEXT,
  order_total NUMERIC,
  order_status VARCHAR,
  order_delivery_mode VARCHAR,
  order_created_at TIMESTAMPTZ,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  driver_assigned BOOLEAN,
  driver_id INTEGER,
  driver_name TEXT,
  driver_phone TEXT,
  driver_status VARCHAR,
  -- NOUVEAUX CHAMPS ABONNEMENT
  subscription_status VARCHAR,
  subscription_end_date TIMESTAMPTZ,
  subscription_plan VARCHAR,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS order_id,
    o.order_numero,
    o.total AS order_total,
    o.status AS order_status,
    o.delivery_mode AS order_delivery_mode,
    o.created_at AS order_created_at,
    o.customer_name,
    o.customer_phone,
    o.delivery_address,
    CASE WHEN da.id IS NOT NULL THEN TRUE ELSE FALSE END AS driver_assigned,
    da.driver_id,
    d.name AS driver_name,
    d.phone AS driver_phone,
    da.status AS driver_status,
    -- INFOS ABONNEMENT
    r.subscription_status,
    r.subscription_end_date,
    r.subscription_plan,
    EXTRACT(DAY FROM (r.subscription_end_date - NOW()))::INTEGER AS days_remaining
  FROM france_orders o
  LEFT JOIN france_delivery_assignments da ON o.id = da.order_id
  LEFT JOIN france_drivers d ON da.driver_id = d.id
  LEFT JOIN france_restaurants r ON o.restaurant_id = r.id
  WHERE o.restaurant_id = p_restaurant_id
    AND o.status IN ('pending', 'confirmed', 'preparing', 'ready', 'in_delivery')
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
