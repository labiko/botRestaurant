-- ========================================================================
-- VERSION: v2
-- DATE: 2025-01-16
-- PROBLÈME RÉSOLU: Table france_order_items n'existe pas - items stockés en JSONB
-- CHANGEMENTS:
--   - Suppression références france_order_items (n'existe pas)
--   - Ajout comptage tables CASCADE (delivery_driver_actions, etc.)
--   - Correction logique de nettoyage complet
-- ========================================================================

-- Fonction d'aperçu (voir ce qui sera supprimé)
CREATE OR REPLACE FUNCTION preview_restaurant_orders_cleanup(p_restaurant_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_restaurant_name TEXT;
    v_orders_count INTEGER;
    v_sessions_count INTEGER;
    v_delivery_actions_count INTEGER;
    v_delivery_logs_count INTEGER;
    v_delivery_refusals_count INTEGER;
    v_delivery_tokens_count INTEGER;
    v_delivery_assignments_count INTEGER;
    v_payment_links_count INTEGER;
    v_preview JSONB;
BEGIN
    -- Vérifier que le restaurant existe
    SELECT name INTO v_restaurant_name
    FROM france_restaurants
    WHERE id = p_restaurant_id;

    IF v_restaurant_name IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Restaurant non trouvé',
            'restaurant_id', p_restaurant_id
        );
    END IF;

    -- Compter les commandes principales
    SELECT COUNT(*) INTO v_orders_count
    FROM france_orders
    WHERE restaurant_id = p_restaurant_id;

    -- Compter les sessions utilisateurs
    SELECT COUNT(*) INTO v_sessions_count
    FROM france_user_sessions
    WHERE restaurant_id = p_restaurant_id;

    -- Compter les données CASCADE qui seront automatiquement supprimées
    SELECT COUNT(*) INTO v_delivery_actions_count
    FROM delivery_driver_actions dda
    JOIN france_orders fo ON dda.order_id = fo.id
    WHERE fo.restaurant_id = p_restaurant_id;

    SELECT COUNT(*) INTO v_delivery_logs_count
    FROM delivery_order_logs dol
    JOIN france_orders fo ON dol.order_id = fo.id
    WHERE fo.restaurant_id = p_restaurant_id;

    SELECT COUNT(*) INTO v_delivery_refusals_count
    FROM delivery_refusals dr
    JOIN france_orders fo ON dr.order_id = fo.id
    WHERE fo.restaurant_id = p_restaurant_id;

    SELECT COUNT(*) INTO v_delivery_tokens_count
    FROM delivery_tokens dt
    JOIN france_orders fo ON dt.order_id = fo.id
    WHERE fo.restaurant_id = p_restaurant_id;

    SELECT COUNT(*) INTO v_delivery_assignments_count
    FROM france_delivery_assignments fda
    JOIN france_orders fo ON fda.order_id = fo.id
    WHERE fo.restaurant_id = p_restaurant_id;

    SELECT COUNT(*) INTO v_payment_links_count
    FROM payment_links pl
    JOIN france_orders fo ON pl.order_id = fo.id
    WHERE fo.restaurant_id = p_restaurant_id;

    -- Construire l'aperçu complet
    v_preview := jsonb_build_object(
        'orders', v_orders_count,
        'sessions', v_sessions_count,
        'delivery_actions', v_delivery_actions_count,
        'delivery_logs', v_delivery_logs_count,
        'delivery_refusals', v_delivery_refusals_count,
        'delivery_tokens', v_delivery_tokens_count,
        'delivery_assignments', v_delivery_assignments_count,
        'payment_links', v_payment_links_count,
        'total_records', v_orders_count + v_sessions_count + v_delivery_actions_count +
                        v_delivery_logs_count + v_delivery_refusals_count + v_delivery_tokens_count +
                        v_delivery_assignments_count + v_payment_links_count
    );

    RETURN jsonb_build_object(
        'success', true,
        'restaurant', jsonb_build_object(
            'id', p_restaurant_id,
            'name', v_restaurant_name
        ),
        'preview', v_preview
    );
END;
$$;

-- Fonction de nettoyage complet
CREATE OR REPLACE FUNCTION clean_restaurant_orders(p_restaurant_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_restaurant_name TEXT;
    v_orders_deleted INTEGER := 0;
    v_sessions_deleted INTEGER := 0;
    v_statistics_before JSONB;
    v_statistics_deleted JSONB;
    v_cascade_before JSONB;
BEGIN
    -- Vérifier que le restaurant existe
    SELECT name INTO v_restaurant_name
    FROM france_restaurants
    WHERE id = p_restaurant_id;

    IF v_restaurant_name IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Restaurant non trouvé',
            'restaurant_id', p_restaurant_id
        );
    END IF;

    -- Statistiques AVANT suppression (commandes)
    SELECT jsonb_build_object(
        'orders', COUNT(*)
    ) INTO v_statistics_before
    FROM france_orders
    WHERE restaurant_id = p_restaurant_id;

    -- Statistiques sessions utilisateurs
    v_statistics_before := v_statistics_before || jsonb_build_object(
        'sessions', (
            SELECT COUNT(*)
            FROM france_user_sessions
            WHERE restaurant_id = p_restaurant_id
        )
    );

    -- Statistiques CASCADE (pour info)
    v_cascade_before := jsonb_build_object(
        'delivery_actions', (
            SELECT COUNT(*) FROM delivery_driver_actions dda
            JOIN france_orders fo ON dda.order_id = fo.id
            WHERE fo.restaurant_id = p_restaurant_id
        ),
        'delivery_logs', (
            SELECT COUNT(*) FROM delivery_order_logs dol
            JOIN france_orders fo ON dol.order_id = fo.id
            WHERE fo.restaurant_id = p_restaurant_id
        ),
        'delivery_refusals', (
            SELECT COUNT(*) FROM delivery_refusals dr
            JOIN france_orders fo ON dr.order_id = fo.id
            WHERE fo.restaurant_id = p_restaurant_id
        ),
        'delivery_tokens', (
            SELECT COUNT(*) FROM delivery_tokens dt
            JOIN france_orders fo ON dt.order_id = fo.id
            WHERE fo.restaurant_id = p_restaurant_id
        ),
        'delivery_assignments', (
            SELECT COUNT(*) FROM france_delivery_assignments fda
            JOIN france_orders fo ON fda.order_id = fo.id
            WHERE fo.restaurant_id = p_restaurant_id
        ),
        'payment_links', (
            SELECT COUNT(*) FROM payment_links pl
            JOIN france_orders fo ON pl.order_id = fo.id
            WHERE fo.restaurant_id = p_restaurant_id
        )
    );

    -- ÉTAPE 1: Supprimer les commandes
    -- (Les tables avec ON DELETE CASCADE seront automatiquement supprimées)
    WITH deleted AS (
        DELETE FROM france_orders
        WHERE restaurant_id = p_restaurant_id
        RETURNING *
    )
    SELECT COUNT(*) INTO v_orders_deleted FROM deleted;

    RAISE NOTICE 'Supprimé % commandes (+ tables CASCADE automatiques)', v_orders_deleted;

    -- ÉTAPE 2: Supprimer les sessions utilisateurs
    WITH deleted AS (
        DELETE FROM france_user_sessions
        WHERE restaurant_id = p_restaurant_id
        RETURNING *
    )
    SELECT COUNT(*) INTO v_sessions_deleted FROM deleted;

    RAISE NOTICE 'Supprimé % sessions utilisateurs', v_sessions_deleted;

    -- Statistiques supprimées
    v_statistics_deleted := jsonb_build_object(
        'orders', v_orders_deleted,
        'sessions', v_sessions_deleted,
        'cascade_deleted', v_cascade_before,
        'total_records', v_orders_deleted + v_sessions_deleted +
            (v_cascade_before->>'delivery_actions')::int +
            (v_cascade_before->>'delivery_logs')::int +
            (v_cascade_before->>'delivery_refusals')::int +
            (v_cascade_before->>'delivery_tokens')::int +
            (v_cascade_before->>'delivery_assignments')::int +
            (v_cascade_before->>'payment_links')::int
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', format('Nettoyage terminé pour le restaurant "%s"', v_restaurant_name),
        'restaurant', jsonb_build_object(
            'id', p_restaurant_id,
            'name', v_restaurant_name
        ),
        'statistics_before', v_statistics_before,
        'statistics_deleted', v_statistics_deleted
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Erreur lors du nettoyage',
            'details', SQLERRM
        );
END;
$$;

-- Commenter les fonctions
COMMENT ON FUNCTION preview_restaurant_orders_cleanup(INTEGER) IS
'Aperçu des données de commandes qui seront supprimées pour un restaurant (v2 - france_user_sessions)';

COMMENT ON FUNCTION clean_restaurant_orders(INTEGER) IS
'Supprime toutes les commandes (france_orders), sessions (france_user_sessions) et données CASCADE d''un restaurant (v2)';
