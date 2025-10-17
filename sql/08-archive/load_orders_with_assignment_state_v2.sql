-- ========================================================================
-- VERSION: v2
-- DATE: 2025-10-15
-- PROBLÈME RÉSOLU: Ajout JOIN france_delivery_drivers pour récupérer nom/téléphone du livreur assigné
-- CHANGEMENTS:
--   - Ajout LEFT JOIN avec france_delivery_drivers basé sur fo.driver_id
--   - Ajout colonnes driver_first_name, driver_last_name, driver_phone_number dans RETURNS
--   - Sélection de ces colonnes dans le SELECT principal
--
-- ✅ NON-RÉGRESSION GARANTIE:
--   - LEFT JOIN retourne NULL si fo.driver_id est NULL ou inexistant
--   - Toutes les colonnes existantes restent inchangées
--   - Nouvelles colonnes ajoutées à la fin seulement
--   - Compatible avec toutes les commandes (avec ou sans livreur)
-- ========================================================================

-- Supprimer l'ancienne version pour forcer la mise à jour de la signature
DROP FUNCTION IF EXISTS public.load_orders_with_assignment_state(integer);

CREATE OR REPLACE FUNCTION public.load_orders_with_assignment_state(p_restaurant_id integer)
RETURNS TABLE(
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
  additional_notes text,
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
  assignment_count integer,
  pending_assignment_count integer,
  expired_assignment_count integer,
  pending_driver_names text,
  online_payment_status character varying,
  payment_date timestamp with time zone,
  payment_link_url text,
  payment_link_sent_at timestamp with time zone,
  payment_link_status character varying,
  subscription_status character varying,
  subscription_end_date timestamp with time zone,
  subscription_plan character varying,
  days_remaining integer,
  -- ✅ NOUVEAU : Colonnes du livreur assigné
  driver_first_name character varying,
  driver_last_name character varying,
  driver_phone_number character varying
)
LANGUAGE plpgsql
AS $function$
DECLARE
  v_payment_link_url text;
  v_payment_date timestamp with time zone;
  v_payment_link_sent_at timestamp with time zone;
  v_payment_link_status character varying;
BEGIN
  RETURN QUERY
  SELECT
    fo.id::integer,
    fo.restaurant_id::integer,
    fo.phone_number::character varying,
    fo.customer_name::character varying,
    fo.items::jsonb,
    fo.total_amount::numeric,
    fo.delivery_mode::character varying,
    fo.delivery_address::text,
    fo.payment_mode::character varying,
    fo.payment_method::character varying,
    fo.status::character varying,
    fo.notes::text,
    fo.additional_notes::text,
    fo.order_number::character varying,
    fo.created_at::timestamp without time zone,
    fo.updated_at::timestamp without time zone,
    fo.delivery_address_id::bigint,
    fo.delivery_validation_code::character varying,
    fo.date_validation_code::timestamp with time zone,
    fo.driver_id::integer,
    fo.estimated_delivery_time::timestamp with time zone,
    fo.driver_assignment_status::character varying,
    fo.delivery_started_at::timestamp with time zone,
    fo.assignment_timeout_at::timestamp with time zone,
    fo.assignment_started_at::timestamp with time zone,
    COALESCE(agg.assignment_count, 0)::integer,
    COALESCE(agg.pending_assignment_count, 0)::integer,
    COALESCE(agg.expired_assignment_count, 0)::integer,
    agg.pending_driver_names::text,
    fo.online_payment_status::character varying,
    pl.paid_at::timestamp with time zone,
    pl.payment_link_url::text,
    pl.sent_at::timestamp with time zone,
    pl.status::character varying,
    fr.subscription_status::character varying,
    fr.subscription_end_date::timestamp with time zone,
    fr.subscription_plan::character varying,
    EXTRACT(DAY FROM (fr.subscription_end_date - NOW()))::integer,
    -- ✅ NOUVEAU : Données du livreur assigné
    assigned_driver.first_name::character varying,
    assigned_driver.last_name::character varying,
    assigned_driver.phone_number::character varying
  FROM france_orders fo
  LEFT JOIN france_restaurants fr ON fr.id = fo.restaurant_id
  -- ✅ NOUVEAU : JOIN pour récupérer les infos du livreur assigné
  LEFT JOIN france_delivery_drivers assigned_driver ON assigned_driver.id = fo.driver_id
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
  LEFT JOIN LATERAL (
    SELECT
      payment_links.paid_at,
      payment_links.payment_link_url,
      payment_links.sent_at,
      payment_links.status
    FROM payment_links
    WHERE payment_links.order_id = fo.id
    ORDER BY payment_links.created_at DESC
    LIMIT 1
  ) pl ON true
  WHERE fo.restaurant_id = p_restaurant_id
  ORDER BY fo.created_at DESC;
END;
$function$;

-- ========================================================================
-- VÉRIFICATION : Tester la fonction
-- ========================================================================
-- SELECT * FROM load_orders_with_assignment_state(1)
-- WHERE driver_id IS NOT NULL
-- LIMIT 5;
