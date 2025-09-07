-- 1. Supprimer l'ancienne fonction
  DROP FUNCTION IF EXISTS load_orders_with_assignment_state(integer);

  -- 2. Créer la nouvelle avec les bons types
  CREATE OR REPLACE FUNCTION load_orders_with_assignment_state(p_restaurant_id INTEGER)
  RETURNS TABLE(
      -- ✅ VRAIS types de france_orders (selon information_schema)
      id INTEGER,
      restaurant_id INTEGER,
      phone_number CHARACTER VARYING(20),
      customer_name CHARACTER VARYING(255),
      items JSONB,
      total_amount NUMERIC,
      delivery_mode CHARACTER VARYING(50),
      delivery_address TEXT,
      payment_mode CHARACTER VARYING(50),
      payment_method CHARACTER VARYING(50),
      status CHARACTER VARYING(50),
      notes TEXT,
      order_number CHARACTER VARYING(20),
      created_at TIMESTAMP WITHOUT TIME ZONE,
      updated_at TIMESTAMP WITHOUT TIME ZONE,
      delivery_address_id BIGINT,
      delivery_validation_code CHARACTER VARYING(4),
      date_validation_code TIMESTAMP WITH TIME ZONE,
      driver_id INTEGER,
      estimated_delivery_time TIMESTAMP WITH TIME ZONE,
      driver_assignment_status CHARACTER VARYING(20),
      delivery_started_at TIMESTAMP WITH TIME ZONE,
      assignment_timeout_at TIMESTAMP WITH TIME ZONE,
      assignment_started_at TIMESTAMP WITH TIME ZONE,

      customer_whatsapp_name TEXT,
      notification_metadata JSONB,
      drivers_notified_count INTEGER,

      delivery_address_coordinates JSONB,
      assigned_driver JSONB,

      has_any_assignment BOOLEAN,
      has_pending_assignment BOOLEAN,
      pending_drivers_count INTEGER,
      pending_driver_names TEXT
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

          COALESCE(fo.customer_whatsapp_name, NULL::TEXT) as customer_whatsapp_name,
          COALESCE(fo.notification_metadata, NULL::JSONB) as notification_metadata,
          COALESCE(fo.drivers_notified_count, NULL::INTEGER) as drivers_notified_count,

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
          ) as assigned_driver,

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
          ) as pending_driver_names

      FROM france_orders fo
      WHERE fo.restaurant_id = p_restaurant_id
      ORDER BY fo.created_at DESC;
  END;
  $$ LANGUAGE plpgsql;