-- =========================================================================
-- VERSION: v4 - FINALE - SUPPRESSION COMPLÈTE AVEC BON ORDRE FK
-- DATE: 2025-01-06
-- PROBLÈME RÉSOLU: Ordre de suppression correct pour respecter les FK
-- CHANGEMENTS:
--   - Suppression production_sync_history EN PREMIER
--   - Puis suppression duplication_logs
--   - Puis le reste (france_restaurants, etc.)
--   - Respecte l'ordre des contraintes FK
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
      v_duplication_log_ids INTEGER[];
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

      -- Récupérer les IDs nécessaires pour suppression en cascade
      SELECT ARRAY(
          SELECT id FROM france_products WHERE restaurant_id = p_restaurant_id
      ) INTO v_product_ids;

      SELECT ARRAY(
          SELECT id FROM workflow_definitions WHERE restaurant_id = p_restaurant_id
      ) INTO v_workflow_ids;

      -- ✅ NOUVEAU: Récupérer les IDs de duplication_logs liés au restaurant
      SELECT ARRAY(
          SELECT id FROM duplication_logs
          WHERE target_restaurant_id = p_restaurant_id
             OR source_restaurant_id = p_restaurant_id
      ) INTO v_duplication_log_ids;

      -- Compter les données AVANT suppression
      SELECT json_build_object(
          'categories', (SELECT COUNT(*) FROM france_menu_categories WHERE restaurant_id = p_restaurant_id),
          'products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = p_restaurant_id),
          'orders', (SELECT COUNT(*) FROM france_orders WHERE restaurant_id = p_restaurant_id),
          'delivery_drivers', (SELECT COUNT(*) FROM france_delivery_drivers WHERE restaurant_id = p_restaurant_id),
          'whatsapp_numbers', (SELECT COUNT(*) FROM france_whatsapp_numbers WHERE restaurant_id = p_restaurant_id),
          'workflow_definitions', (SELECT COUNT(*) FROM workflow_definitions WHERE restaurant_id = p_restaurant_id),
          'duplication_logs', (SELECT COUNT(*) FROM duplication_logs WHERE target_restaurant_id = p_restaurant_id OR source_restaurant_id = p_restaurant_id),
          'production_sync_history', (
              SELECT COUNT(*) FROM production_sync_history
              WHERE restaurant_id = p_restaurant_id
                 OR duplication_log_id = ANY(v_duplication_log_ids)
          ),
          'product_display_configs', (SELECT COUNT(*) FROM france_product_display_configs WHERE restaurant_id = p_restaurant_id),
          'user_sessions', (SELECT COUNT(*) FROM france_user_sessions WHERE restaurant_id = p_restaurant_id),
          'workflow_templates', (SELECT COUNT(*) FROM france_workflow_templates WHERE restaurant_id = p_restaurant_id),
          'vitrine_settings', (SELECT COUNT(*) FROM restaurant_vitrine_settings WHERE restaurant_id = p_restaurant_id),
          'payment_configs', (SELECT COUNT(*) FROM restaurant_payment_configs WHERE restaurant_id = p_restaurant_id),
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

      -- =========================================================================
      -- SUPPRESSION EN CASCADE - ORDRE CRITIQUE POUR RESPECTER LES FK
      -- =========================================================================

      -- ✅ ÉTAPE 0: Supprimer production_sync_history EN PREMIER
      -- (car elle a FK vers duplication_logs)
      IF array_length(v_duplication_log_ids, 1) > 0 THEN
          DELETE FROM production_sync_history
          WHERE restaurant_id = p_restaurant_id
             OR duplication_log_id = ANY(v_duplication_log_ids);
      ELSE
          DELETE FROM production_sync_history
          WHERE restaurant_id = p_restaurant_id;
      END IF;

      -- ✅ ÉTAPE 1: Supprimer duplication_logs
      -- (car elle a FK vers france_restaurants)
      DELETE FROM duplication_logs
      WHERE target_restaurant_id = p_restaurant_id
         OR source_restaurant_id = p_restaurant_id;

      -- 2. Supprimer les données liées aux commandes (via order_id)
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

      -- 3. Supprimer les commandes
      DELETE FROM france_orders WHERE restaurant_id = p_restaurant_id;

      -- 4. Supprimer les données liées aux workflows (via workflow_id)
      IF array_length(v_workflow_ids, 1) > 0 THEN
          DELETE FROM workflow_steps WHERE workflow_id = ANY(v_workflow_ids);
      END IF;

      -- 5. Supprimer les scripts SQL liés aux produits (via product_id)
      IF array_length(v_product_ids, 1) > 0 THEN
          DELETE FROM workflow_sql_scripts WHERE product_id = ANY(v_product_ids);
      END IF;

      -- 6. Supprimer les autres données liées au restaurant
      DELETE FROM france_delivery_drivers WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_pizza_display_settings WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_restaurant_features WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_restaurant_service_modes WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_whatsapp_numbers WHERE restaurant_id = p_restaurant_id;
      DELETE FROM message_templates WHERE restaurant_id = p_restaurant_id;
      DELETE FROM restaurant_bot_configs WHERE restaurant_id = p_restaurant_id;
      DELETE FROM restaurant_vitrine_settings WHERE restaurant_id = p_restaurant_id;
      DELETE FROM restaurant_payment_configs WHERE restaurant_id = p_restaurant_id;
      DELETE FROM workflow_definitions WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_product_display_configs WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_user_sessions WHERE restaurant_id = p_restaurant_id;
      DELETE FROM france_workflow_templates WHERE restaurant_id = p_restaurant_id;

      -- 7. Supprimer les données liées aux produits (via product_id)
      IF array_length(v_product_ids, 1) > 0 THEN
          DELETE FROM france_product_options WHERE product_id = ANY(v_product_ids);
          DELETE FROM france_product_sizes WHERE product_id = ANY(v_product_ids);
          DELETE FROM france_product_variants WHERE product_id = ANY(v_product_ids);
          DELETE FROM france_composite_items WHERE composite_product_id = ANY(v_product_ids);
      END IF;

      -- 8. Supprimer les produits
      DELETE FROM france_products WHERE restaurant_id = p_restaurant_id;

      -- 9. Supprimer les catégories
      DELETE FROM france_menu_categories WHERE restaurant_id = p_restaurant_id;

      -- 10. Supprimer le restaurant principal
      -- (maintenant possible car duplication_logs a été supprimé avant)
      DELETE FROM france_restaurants WHERE id = p_restaurant_id;

      -- Compter ce qui a été effectivement supprimé
      SELECT json_build_object(
          'restaurant_deleted', 1,
          'categories_deleted', (v_stats->>'categories')::INTEGER,
          'products_deleted', (v_stats->>'products')::INTEGER,
          'orders_deleted', (v_stats->>'orders')::INTEGER,
          'duplication_logs_deleted', (v_stats->>'duplication_logs')::INTEGER,
          'production_sync_history_deleted', (v_stats->>'production_sync_history')::INTEGER,
          'options_deleted', (v_stats->>'options')::INTEGER,
          'composite_items_deleted', (v_stats->>'composite_items')::INTEGER,
          'product_display_configs_deleted', (v_stats->>'product_display_configs')::INTEGER,
          'user_sessions_deleted', (v_stats->>'user_sessions')::INTEGER,
          'workflow_templates_deleted', (v_stats->>'workflow_templates')::INTEGER,
          'vitrine_settings_deleted', (v_stats->>'vitrine_settings')::INTEGER,
          'payment_configs_deleted', (v_stats->>'payment_configs')::INTEGER,
          'workflow_sql_scripts_deleted', (v_stats->>'workflow_sql_scripts')::INTEGER,
          'workflow_steps_deleted', (v_stats->>'workflow_steps')::INTEGER
      ) INTO v_deleted_counts;

      -- Retourner le résultat de succès
      RETURN json_build_object(
          'success', true,
          'message', 'Restaurant supprimé avec succès (y compris métadonnées système)',
          'deleted_restaurant', json_build_object(
              'id', p_restaurant_id,
              'name', v_restaurant_name
          ),
          'statistics_before', v_stats,
          'statistics_deleted', v_deleted_counts,
          'note', 'Suppression complète incluant duplication_logs et production_sync_history'
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
-- ORDRE DE SUPPRESSION FINAL (respecte toutes les FK)
-- =========================================================================
-- 1. production_sync_history (FK → duplication_logs)
-- 2. duplication_logs (FK → france_restaurants)
-- 3. delivery_driver_actions, delivery_order_logs, etc. (FK → france_orders)
-- 4. france_orders
-- 5. workflow_steps (FK → workflow_definitions)
-- 6. workflow_sql_scripts (FK → france_products)
-- 7. france_delivery_drivers, whatsapp_numbers, configs, etc.
-- 8. france_product_options, sizes, variants, composite_items (FK → france_products)
-- 9. france_products
-- 10. france_menu_categories
-- 11. france_restaurants (peut maintenant être supprimé)
-- =========================================================================
