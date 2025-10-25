-- ========================================================================
-- VERSION: v1
-- DATE: 2025-10-24
-- PROBLÈME RÉSOLU: Fonction accept_order_atomic utilise NOW() au lieu de l'heure restaurant
-- CHANGEMENTS:
--   - Ajout variables v_restaurant_id et v_current_time dans DECLARE
--   - Remplacement TOUS les NOW() par get_restaurant_current_time() ou calculate_token_expiry()
--   - AUCUNE modification de la logique métier
-- ========================================================================

CREATE OR REPLACE FUNCTION public.accept_order_atomic(p_token character varying, p_order_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
    DECLARE
      v_driver_id INTEGER;
      v_restaurant_id INTEGER;
      v_current_time TIMESTAMP;
    BEGIN
      -- Récupérer restaurant_id et calculer l'heure du restaurant
      SELECT restaurant_id INTO v_restaurant_id FROM france_orders WHERE id = p_order_id;
      v_current_time := get_restaurant_current_time(v_restaurant_id);

      -- 0. Récupérer le driver_id depuis le token
      SELECT driver_id INTO v_driver_id
      FROM delivery_tokens
      WHERE token = p_token
        AND order_id = p_order_id
        AND used = FALSE
        AND suspended = FALSE
        AND expires_at > v_current_time;

      IF v_driver_id IS NULL THEN
        RAISE EXCEPTION 'Token invalide, expiré ou déjà utilisé';
      END IF;

      -- 1. Vérifier que la commande est encore disponible
      IF NOT EXISTS (
        SELECT 1 FROM france_orders
        WHERE id = p_order_id AND status = 'prete' AND driver_id IS NULL
      ) THEN
        RAISE EXCEPTION 'Commande déjà prise ou non disponible';
      END IF;

      -- 2. Prolonger le token à +3H
      UPDATE delivery_tokens
      SET
        used = TRUE,
        expires_at = calculate_token_expiry(v_restaurant_id, 180),
        updated_at = v_current_time
      WHERE token = p_token AND order_id = p_order_id;

      -- 3. Mettre à jour la commande
      UPDATE france_orders
      SET
        status = 'assignee',
        driver_id = v_driver_id,
        driver_assignment_status = 'assigned',
        assignment_started_at = v_current_time,
        updated_at = v_current_time
      WHERE id = p_order_id;

      -- 4. Suspendre tous les autres tokens
      UPDATE delivery_tokens
      SET suspended = TRUE, updated_at = v_current_time
      WHERE order_id = p_order_id AND driver_id != v_driver_id AND used = FALSE;

      -- 5. Logger l'acceptation
      INSERT INTO delivery_driver_actions (
        order_id, driver_id, token_id, action_type, details
      ) VALUES (
        p_order_id,
        v_driver_id,
        (SELECT id FROM delivery_tokens WHERE token = p_token),
        'accepted',
        jsonb_build_object('token', p_token, 'timestamp', v_current_time)
      );

      -- 6. 🆕 NOUVEAU : Mettre à jour l'assignment du livreur qui accepte
      UPDATE france_delivery_assignments
      SET
        assignment_status = 'accepted',
        responded_at = NOW(),
        response_time_seconds = EXTRACT(EPOCH FROM (NOW() - created_at))::INTEGER
      WHERE order_id = p_order_id AND driver_id = v_driver_id;

      RETURN TRUE;
    END;
    $function$;

-- ========================================================================
-- VÉRIFICATION
-- ========================================================================
-- SELECT pg_get_functiondef(oid)
-- FROM pg_proc
-- WHERE proname = 'accept_order_atomic'
--   AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
