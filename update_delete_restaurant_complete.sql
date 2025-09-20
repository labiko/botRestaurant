-- =========================================================================
-- MISE À JOUR DE LA FONCTION delete_restaurant_complete
-- =========================================================================
-- AJOUT DES 3 TABLES MANQUANTES UNIQUEMENT
-- ⚠️ AUCUNE MODIFICATION DU COMPORTEMENT EXISTANT
-- =========================================================================

CREATE OR REPLACE FUNCTION public.delete_restaurant_complete(p_restaurant_id integer)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
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

      -- Compter les données AVANT suppression (AJOUT DES 3 NOUVELLES TABLES)
      SELECT json_build_object(
          'categories', (SELECT COUNT(*) FROM france_menu_categories WHERE restaurant_id = p_restaurant_id),
          'products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = p_restaurant_id),
          'orders', (SELECT COUNT(*) FROM france_orders WHERE restaurant_id = p_restaurant_id),
          'delivery_drivers', (SELECT COUNT(*) FROM france_delivery_drivers WHERE restaurant_id = p_restaurant_id),
          'whatsapp_numbers', (SELECT COUNT(*) FROM france_whatsapp_numbers WHERE restaurant_id = p_restaurant_id),
          'workflow_definitions', (SELECT COUNT(*) FROM workflow_definitions WHERE restaurant_id = p_restaurant_id),
          'duplication_logs', (SELECT COUNT(*) FROM duplication_logs WHERE target_restaurant_id = p_restaurant_id OR source_restaurant_id = p_restaurant_id),
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

      -- 0. NOUVEAU: Supprimer les logs de duplication d'abord
      DELETE FROM duplication_logs
      WHERE target_restaurant_id = p_restaurant_id
         OR source_restaurant_id = p_restaurant_id;

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

      -- ✅ AJOUT DES 3 VRAIES TABLES MANQUANTES (pas les vues)
      DELETE FROM france_product_display_configs WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_user_sessions WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_workflow_templates WHERE restaurant_id = p_restaurant_id;

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
          'duplication_logs_deleted', (v_stats->>'duplication_logs')::INTEGER,
          'options_deleted', (v_stats->>'options')::INTEGER,
          'composite_items_deleted', (v_stats->>'composite_items')::INTEGER,
          -- ✅ AJOUT STATISTIQUES DES 3 VRAIES TABLES
          'product_display_configs_deleted', (v_stats->>'product_display_configs')::INTEGER,
          'user_sessions_deleted', (v_stats->>'user_sessions')::INTEGER,
          'workflow_templates_deleted', (v_stats->>'workflow_templates')::INTEGER
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
          -- En cas d'erreur, la transaction est automatiquement annulée
          RETURN json_build_object(
              'success', false,
              'error', 'Erreur lors de la suppression',
              'details', SQLERRM,
              'restaurant_id', p_restaurant_id,
              'restaurant_name', COALESCE(v_restaurant_name, 'Inconnu')
          );
  END;
  $function$;