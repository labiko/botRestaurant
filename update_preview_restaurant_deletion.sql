-- =========================================================================
-- MISE À JOUR DE LA FONCTION preview_restaurant_deletion
-- =========================================================================
-- AJOUT DES 3 TABLES MANQUANTES UNIQUEMENT
-- ⚠️ AUCUNE MODIFICATION DU COMPORTEMENT EXISTANT
-- =========================================================================

CREATE OR REPLACE FUNCTION public.preview_restaurant_deletion(p_restaurant_id integer)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
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

    -- Compter toutes les données liées (AJOUT DES 3 NOUVELLES TABLES)
    SELECT json_build_object(
        'categories', (SELECT COUNT(*) FROM france_menu_categories WHERE restaurant_id = p_restaurant_id),
        'products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = p_restaurant_id),
        'orders', (SELECT COUNT(*) FROM france_orders WHERE restaurant_id = p_restaurant_id),
        -- ✅ AJOUT DES 3 VRAIES TABLES MANQUANTES (pas les vues)
        'product_display_configs', (SELECT COUNT(*) FROM france_product_display_configs WHERE restaurant_id = p_restaurant_id),
        'user_sessions', (SELECT COUNT(*) FROM france_user_sessions WHERE restaurant_id = p_restaurant_id),
        'workflow_templates', (SELECT COUNT(*) FROM france_workflow_templates WHERE restaurant_id = p_restaurant_id),
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
$function$;