-- =========================================================================
-- VERSION: v2
-- DATE: 2025-01-06
-- PROBLÈME RÉSOLU: Ajout des tables manquantes pour nettoyage production complet
-- CHANGEMENTS: Ajout france_option_groups, france_icons, workflow_sql_scripts, workflow_steps, step_executor_mappings
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
      v_workflow_ids INTEGER[];
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

      -- Récupérer les IDs des produits et workflows pour suppression en cascade
      SELECT ARRAY(
          SELECT id FROM france_products WHERE restaurant_id = p_restaurant_id
      ) INTO v_product_ids;

      SELECT ARRAY(
          SELECT id FROM workflow_definitions WHERE restaurant_id = p_restaurant_id
      ) INTO v_workflow_ids;

      -- Compter les données AVANT suppression
      SELECT json_build_object(
          'categories', (SELECT COUNT(*) FROM france_menu_categories WHERE restaurant_id = p_restaurant_id),
          'products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = p_restaurant_id),
          'orders', (SELECT COUNT(*) FROM france_orders WHERE restaurant_id = p_restaurant_id),
          'delivery_drivers', (SELECT COUNT(*) FROM france_delivery_drivers WHERE restaurant_id = p_restaurant_id),
          'whatsapp_numbers', (SELECT COUNT(*) FROM france_whatsapp_numbers WHERE restaurant_id = p_restaurant_id),
          'workflow_definitions', (SELECT COUNT(*) FROM workflow_definitions WHERE restaurant_id = p_restaurant_id),
          'duplication_logs', (SELECT COUNT(*) FROM duplication_logs WHERE target_restaurant_id = p_restaurant_id OR source_restaurant_id = p_restaurant_id),
          'product_display_configs', (SELECT COUNT(*) FROM france_product_display_configs WHERE restaurant_id = p_restaurant_id),
          'user_sessions', (SELECT COUNT(*) FROM france_user_sessions WHERE restaurant_id = p_restaurant_id),
          'workflow_templates', (SELECT COUNT(*) FROM france_workflow_templates WHERE restaurant_id = p_restaurant_id),
          -- ✅ NOUVELLES TABLES AJOUTÉES
          'workflow_sql_scripts', (
              SELECT COUNT(*)
              FROM workflow_sql_scripts wss
              JOIN france_products p ON wss.product_id = p.id
              WHERE p.restaurant_id = p_restaurant_id
          ),
          'workflow_steps', (
              SELECT COUNT(*)
              FROM workflow_steps ws
              JOIN workflow_definitions wd ON ws.workflow_id = wd.id
              WHERE wd.restaurant_id = p_restaurant_id
          ),
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

      -- SUPPRESSION EN CASCADE (ordre critique pour éviter les violations de contraintes)

      -- 0. Supprimer les logs de duplication d'abord
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

      -- 3. ✅ NOUVEAU: Supprimer les données liées aux workflows (via workflow_id)
      IF array_length(v_workflow_ids, 1) > 0 THEN
          DELETE FROM workflow_steps WHERE workflow_id = ANY(v_workflow_ids);
      END IF;

      -- 4. ✅ NOUVEAU: Supprimer les scripts SQL liés aux produits (via product_id)
      IF array_length(v_product_ids, 1) > 0 THEN
          DELETE FROM workflow_sql_scripts WHERE product_id = ANY(v_product_ids);
      END IF;

      -- 5. Supprimer les autres données liées au restaurant
      DELETE FROM france_delivery_drivers WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_pizza_display_settings WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_restaurant_features WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_restaurant_service_modes WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_whatsapp_numbers WHERE restaurant_id = p_restaurant_id;
      DELETE FROM message_templates WHERE restaurant_id = p_restaurant_id;
      DELETE FROM restaurant_bot_configs WHERE restaurant_id = p_restaurant_id;
      DELETE FROM workflow_definitions WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_product_display_configs WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_user_sessions WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_workflow_templates WHERE restaurant_id = p_restaurant_id;

      -- 6. Supprimer les données liées aux produits (via product_id)
      IF array_length(v_product_ids, 1) > 0 THEN
          DELETE FROM france_product_options WHERE product_id = ANY(v_product_ids);
          DELETE FROM france_product_sizes WHERE product_id = ANY(v_product_ids);
          DELETE FROM france_product_variants WHERE product_id = ANY(v_product_ids);
          DELETE FROM france_composite_items WHERE composite_product_id = ANY(v_product_ids);
      END IF;

      -- 7. Supprimer les produits
      DELETE FROM france_products WHERE restaurant_id = p_restaurant_id;

      -- 8. Supprimer les catégories
      DELETE FROM france_menu_categories WHERE restaurant_id = p_restaurant_id;

      -- 9. Supprimer le restaurant principal
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
          'product_display_configs_deleted', (v_stats->>'product_display_configs')::INTEGER,
          'user_sessions_deleted', (v_stats->>'user_sessions')::INTEGER,
          'workflow_templates_deleted', (v_stats->>'workflow_templates')::INTEGER,
          -- ✅ NOUVELLES STATISTIQUES AJOUTÉES
          'workflow_sql_scripts_deleted', (v_stats->>'workflow_sql_scripts')::INTEGER,
          'workflow_steps_deleted', (v_stats->>'workflow_steps')::INTEGER
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

-- =========================================================================
-- COMMENTAIRES SUR LES AJOUTS
-- =========================================================================

-- ✅ TABLES AJOUTÉES:
-- 1. workflow_sql_scripts (liés aux produits via product_id)
-- 2. workflow_steps (liés aux workflows via workflow_id)
-- 3. step_executor_mappings (table système, pas liée à restaurant_id)
-- 4. france_option_groups (table système, pas liée à restaurant_id)
-- 5. france_icons (table système, pas liée à restaurant_id)

-- ⚠️ NOTES:
-- - france_option_groups et france_icons sont des tables SYSTÈME (pas de restaurant_id)
-- - step_executor_mappings est une table SYSTÈME (pas de restaurant_id)
-- - Seules workflow_sql_scripts et workflow_steps sont liées au restaurant
-- - L'ordre de suppression respecte les contraintes de clés étrangères