-- Mise à jour de la fonction get_order_delivery_stats pour inclure last_token_update
-- Il faut d'abord supprimer la fonction existante car le type de retour change
DROP FUNCTION IF EXISTS get_order_delivery_stats(INTEGER);

CREATE OR REPLACE FUNCTION get_order_delivery_stats(p_order_id INTEGER)
RETURNS TABLE (
  notified_count INTEGER,
  viewed_count INTEGER,
  refused_count INTEGER,
  accepted_count INTEGER,
  last_action_driver_name TEXT,
  last_action_type VARCHAR(20),
  last_action_timestamp TIMESTAMP,
  last_token_update TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(stats.notified_count, 0)::INTEGER,
    COALESCE(stats.viewed_count, 0)::INTEGER,
    COALESCE(stats.refused_count, 0)::INTEGER,
    COALESCE(stats.accepted_count, 0)::INTEGER,
    last_act.driver_name,
    last_act.action_type,
    last_act.action_timestamp,
    token_update.last_updated
  FROM (
    SELECT 
      COUNT(*) FILTER (WHERE dda.action_type = 'notified') AS notified_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'link_viewed') AS viewed_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'refused') AS refused_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'accepted') AS accepted_count
    FROM delivery_driver_actions dda
    WHERE dda.order_id = p_order_id
  ) stats
  LEFT JOIN (
    SELECT 
      fdd.first_name || ' ' || COALESCE(fdd.last_name, '') AS driver_name,
      dda.action_type,
      dda.action_timestamp
    FROM delivery_driver_actions dda
    JOIN france_delivery_drivers fdd ON dda.driver_id = fdd.id
    WHERE dda.order_id = p_order_id
    ORDER BY dda.action_timestamp DESC
    LIMIT 1
  ) last_act ON TRUE
  LEFT JOIN (
    SELECT 
      dt.updated_at as last_updated
    FROM delivery_tokens dt
    WHERE dt.order_id = p_order_id
    AND dt.used = false
    ORDER BY dt.updated_at DESC
    LIMIT 1
  ) token_update ON TRUE;
END;
$$ LANGUAGE plpgsql;