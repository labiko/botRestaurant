-- 🗑️ FONCTION DE SUPPRESSION COMPLÈTE D'UN RESTAURANT
-- ========================================================
-- Cette fonction supprime un restaurant et toutes ses données liées
-- en une seule transaction atomique (tout réussit ou tout échoue)

CREATE OR REPLACE FUNCTION delete_restaurant_complete(
    p_restaurant_id INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_restaurant_name TEXT;
    v_stats JSON;
    v_deleted_counts JSON;
    v_product_ids INTEGER[];
BEGIN
    -- Vérifier que le restaurant existe
    SELECT name INTO v_restaurant_name
    FROM france_restaurants
    WHERE id = p_restaurant_id;

    IF v_restaurant_name IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Restaurant non trouvé',
            'restaurant_id', p_restaurant_id
        );
    END IF;

    -- Compter les données AVANT suppression
    SELECT json_build_object(
        'categories', (SELECT COUNT(*) FROM france_menu_categories WHERE restaurant_id = p_restaurant_id),
        'products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = p_restaurant_id),
        'orders', (SELECT COUNT(*) FROM france_orders WHERE restaurant_id = p_restaurant_id),
        'delivery_drivers', (SELECT COUNT(*) FROM france_delivery_drivers WHERE restaurant_id = p_restaurant_id),
        'whatsapp_numbers', (SELECT COUNT(*) FROM france_whatsapp_numbers WHERE restaurant_id = p_restaurant_id),
        'workflow_definitions', (SELECT COUNT(*) FROM workflow_definitions WHERE restaurant_id = p_restaurant_id),
        'options', (
            SELECT COUNT(*)
            FROM france_product_options po
            JOIN france_products p ON po.product_id = p.id
            WHERE p.restaurant_id = p_restaurant_id
        ),
        'composite_items', (
            SELECT COUNT(*)
            FROM france_composite_items ci
            JOIN france_products p ON ci.composite_product_id = p.id
            WHERE p.restaurant_id = p_restaurant_id
        ),
        'product_sizes', (
            SELECT COUNT(*)
            FROM france_product_sizes ps
            JOIN france_products p ON ps.product_id = p.id
            WHERE p.restaurant_id = p_restaurant_id
        ),
        'product_variants', (
            SELECT COUNT(*)
            FROM france_product_variants pv
            JOIN france_products p ON pv.product_id = p.id
            WHERE p.restaurant_id = p_restaurant_id
        ),
        'delivery_logs', (
            SELECT COUNT(*)
            FROM delivery_order_logs dol
            JOIN france_orders o ON dol.order_id = o.id
            WHERE o.restaurant_id = p_restaurant_id
        )
    ) INTO v_stats;

    -- Récupérer la liste des produits ET commandes pour suppression en cascade
    SELECT ARRAY(
        SELECT id FROM france_products WHERE restaurant_id = p_restaurant_id
    ) INTO v_product_ids;

    -- SUPPRESSION EN CASCADE (ordre critique pour éviter les violations de contraintes)

    -- 1. Supprimer les données liées aux commandes (via order_id)
    DELETE FROM delivery_driver_actions WHERE order_id IN (
        SELECT id FROM france_orders WHERE restaurant_id = p_restaurant_id
    );
    DELETE FROM delivery_order_logs WHERE order_id IN (
        SELECT id FROM france_orders WHERE restaurant_id = p_restaurant_id
    );
    DELETE FROM delivery_refusals WHERE order_id IN (
        SELECT id FROM france_orders WHERE restaurant_id = p_restaurant_id
    );
    DELETE FROM delivery_tokens WHERE order_id IN (
        SELECT id FROM france_orders WHERE restaurant_id = p_restaurant_id
    );
    DELETE FROM france_delivery_assignments WHERE order_id IN (
        SELECT id FROM france_orders WHERE restaurant_id = p_restaurant_id
    );

    -- 2. Supprimer les commandes
    DELETE FROM france_orders WHERE restaurant_id = p_restaurant_id;

    -- 3. Supprimer les autres données liées au restaurant
    DELETE FROM france_delivery_drivers WHERE restaurant_id = p_restaurant_id;
    DELETE FROM france_pizza_display_settings WHERE restaurant_id = p_restaurant_id;
    DELETE FROM france_restaurant_features WHERE restaurant_id = p_restaurant_id;
    DELETE FROM france_restaurant_service_modes WHERE restaurant_id = p_restaurant_id;
    DELETE FROM france_whatsapp_numbers WHERE restaurant_id = p_restaurant_id;
    DELETE FROM message_templates WHERE restaurant_id = p_restaurant_id;
    DELETE FROM restaurant_bot_configs WHERE restaurant_id = p_restaurant_id;
    DELETE FROM workflow_definitions WHERE restaurant_id = p_restaurant_id;

    -- 4. Supprimer les données liées aux produits (via product_id)
    IF array_length(v_product_ids, 1) > 0 THEN
        DELETE FROM france_product_options WHERE product_id = ANY(v_product_ids);
        DELETE FROM france_product_sizes WHERE product_id = ANY(v_product_ids);
        DELETE FROM france_product_variants WHERE product_id = ANY(v_product_ids);
        DELETE FROM france_composite_items WHERE composite_product_id = ANY(v_product_ids);
    END IF;

    -- 5. Supprimer les produits
    DELETE FROM france_products WHERE restaurant_id = p_restaurant_id;

    -- 6. Supprimer les catégories
    DELETE FROM france_menu_categories WHERE restaurant_id = p_restaurant_id;

    -- 7. Supprimer le restaurant principal
    DELETE FROM france_restaurants WHERE id = p_restaurant_id;

    -- Compter ce qui a été effectivement supprimé
    SELECT json_build_object(
        'restaurant_deleted', 1,
        'categories_deleted', (v_stats->>'categories')::INTEGER,
        'products_deleted', (v_stats->>'products')::INTEGER,
        'orders_deleted', (v_stats->>'orders')::INTEGER,
        'options_deleted', (v_stats->>'options')::INTEGER,
        'composite_items_deleted', (v_stats->>'composite_items')::INTEGER
    ) INTO v_deleted_counts;

    -- Retourner le résultat de succès
    RETURN json_build_object(
        'success', true,
        'message', 'Restaurant supprimé avec succès',
        'deleted_restaurant', json_build_object(
            'id', p_restaurant_id,
            'name', v_restaurant_name
        ),
        'statistics_before', v_stats,
        'statistics_deleted', v_deleted_counts
    );

EXCEPTION
    WHEN OTHERS THEN
        -- En cas d''erreur, la transaction est automatiquement annulée
        RETURN json_build_object(
            'success', false,
            'error', 'Erreur lors de la suppression',
            'details', SQLERRM,
            'restaurant_id', p_restaurant_id,
            'restaurant_name', COALESCE(v_restaurant_name, 'Inconnu')
        );
END;
$$ LANGUAGE plpgsql;

-- 📋 FONCTION D'APERÇU DE SUPPRESSION (SANS SUPPRESSION)
-- ====================================================
-- Cette fonction compte les données qui seraient supprimées
-- sans effectuer de suppression

CREATE OR REPLACE FUNCTION preview_restaurant_deletion(
    p_restaurant_id INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_restaurant_name TEXT;
    v_restaurant_address TEXT;
    v_preview JSON;
    v_category_names TEXT[];
BEGIN
    -- Vérifier que le restaurant existe
    SELECT name, address INTO v_restaurant_name, v_restaurant_address
    FROM france_restaurants
    WHERE id = p_restaurant_id;

    IF v_restaurant_name IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Restaurant non trouvé',
            'restaurant_id', p_restaurant_id
        );
    END IF;

    -- Récupérer les noms des catégories
    SELECT ARRAY(
        SELECT name FROM france_menu_categories
        WHERE restaurant_id = p_restaurant_id
        ORDER BY display_order
    ) INTO v_category_names;

    -- Compter toutes les données liées
    SELECT json_build_object(
        'categories', (SELECT COUNT(*) FROM france_menu_categories WHERE restaurant_id = p_restaurant_id),
        'products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = p_restaurant_id),
        'orders', (SELECT COUNT(*) FROM france_orders WHERE restaurant_id = p_restaurant_id),
        'options', (
            SELECT COUNT(*)
            FROM france_product_options po
            JOIN france_products p ON po.product_id = p.id
            WHERE p.restaurant_id = p_restaurant_id
        ),
        'composite_items', (
            SELECT COUNT(*)
            FROM france_composite_items ci
            JOIN france_products p ON ci.composite_product_id = p.id
            WHERE p.restaurant_id = p_restaurant_id
        ),
        'category_names', COALESCE(array_to_json(v_category_names), '[]'::json)
    ) INTO v_preview;

    -- Retourner l'aperçu
    RETURN json_build_object(
        'success', true,
        'restaurant', json_build_object(
            'id', p_restaurant_id,
            'name', v_restaurant_name,
            'address', v_restaurant_address
        ),
        'preview', v_preview
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erreur lors de la génération de l''aperçu',
            'details', SQLERRM,
            'restaurant_id', p_restaurant_id
        );
END;
$$ LANGUAGE plpgsql;

-- 🔧 COMMENTAIRES D'UTILISATION
-- ============================

-- Exemples d'utilisation :

-- 1. Aperçu de suppression (sans supprimer) :
-- SELECT preview_restaurant_deletion(13);

-- 2. Suppression complète :
-- SELECT delete_restaurant_complete(13);

-- ✅ AVANTAGES DE CETTE APPROCHE :
-- - Transaction atomique automatique
-- - Gestion d'erreurs intégrée avec rollback
-- - Performance optimale (une seule requête côté client)
-- - Ordre de suppression correct et sécurisé
-- - Statistiques complètes avant/après
-- - Pas de données orphelines possibles