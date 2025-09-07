BEGIN;

-- Fonction SQL simplifiée : récupère données brutes + colonnes d'assignation
CREATE OR REPLACE FUNCTION load_orders_with_assignment_state(p_restaurant_id integer)
RETURNS TABLE (
  -- Colonnes exactes de france_orders
  id integer,
  restaurant_id integer,
  phone_number character varying,
  customer_name character varying,
  items jsonb,
  total_amount numeric,
  delivery_mode character varying,
  delivery_address text,
  payment_mode character varying,
  payment_method character varying,
  status character varying,
  notes text,
  order_number character varying,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  delivery_address_id bigint,
  delivery_validation_code character varying,
  date_validation_code timestamp with time zone,
  driver_id integer,
  estimated_delivery_time timestamp with time zone,
  driver_assignment_status character varying,
  delivery_started_at timestamp with time zone,
  assignment_timeout_at timestamp with time zone,
  assignment_started_at timestamp with time zone,
  -- Nouvelles colonnes d'assignation (données brutes)
  assignment_count integer,
  pending_assignment_count integer,
  expired_assignment_count integer,
  pending_driver_names text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fo.id,
    fo.restaurant_id,
    fo.phone_number,
    fo.customer_name,
    fo.items,
    fo.total_amount,
    fo.delivery_mode,
    fo.delivery_address,
    fo.payment_mode,
    fo.payment_method,
    fo.status,
    fo.notes,
    fo.order_number,
    fo.created_at,
    fo.updated_at,
    fo.delivery_address_id,
    fo.delivery_validation_code,
    fo.date_validation_code,
    fo.driver_id,
    fo.estimated_delivery_time,
    fo.driver_assignment_status,
    fo.delivery_started_at,
    fo.assignment_timeout_at,
    fo.assignment_started_at,
    -- Calculs d'assignation bruts
    COALESCE(agg.assignment_count, 0)::integer,
    COALESCE(agg.pending_assignment_count, 0)::integer,
    COALESCE(agg.expired_assignment_count, 0)::integer,
    agg.pending_driver_names
  FROM france_orders fo
  LEFT JOIN (
    SELECT 
      fda.order_id,
      COUNT(*)::integer as assignment_count,
      COUNT(*) FILTER (WHERE fda.assignment_status = 'pending')::integer as pending_assignment_count,
      COUNT(*) FILTER (WHERE fda.assignment_status = 'expired')::integer as expired_assignment_count,
      string_agg(
        CASE 
          WHEN fda.assignment_status IN ('pending', 'expired') 
          THEN CONCAT(fdd.first_name, ' ', fdd.last_name)
          ELSE NULL
        END, 
        ', '
      ) as pending_driver_names
    FROM france_delivery_assignments fda
    JOIN france_delivery_drivers fdd ON fdd.id = fda.driver_id
    GROUP BY fda.order_id
  ) agg ON agg.order_id = fo.id
  WHERE fo.restaurant_id = p_restaurant_id
  ORDER BY fo.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Test de la fonction
SELECT COUNT(*) as total_orders FROM load_orders_with_assignment_state(1);

COMMIT;