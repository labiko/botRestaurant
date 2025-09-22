-- =====================================================
-- SUPPRESSION COMPLÈTE DE TOUTES LES TABLES DEV
-- =====================================================
-- ⚠️ ATTENTION : Cette commande supprime TOUTES les données !
-- Base DEV: lphvdoyhwaelmwdfkfuh.supabase.co
-- =====================================================

BEGIN;

-- Désactiver les contraintes de clés étrangères temporairement
SET session_replication_role = replica;

-- Supprimer toutes les tables du schéma public
DROP TABLE IF EXISTS public.automation_logs CASCADE;
DROP TABLE IF EXISTS public.delivery_driver_actions CASCADE;
DROP TABLE IF EXISTS public.delivery_order_logs CASCADE;
DROP TABLE IF EXISTS public.delivery_refusals CASCADE;
DROP TABLE IF EXISTS public.delivery_tokens CASCADE;
DROP TABLE IF EXISTS public.france_delivery_assignments CASCADE;
DROP TABLE IF EXISTS public.france_delivery_drivers CASCADE;
DROP TABLE IF EXISTS public.france_orders CASCADE;
DROP TABLE IF EXISTS public.france_restaurants CASCADE;
DROP TABLE IF EXISTS public.france_auth_sessions CASCADE;
DROP TABLE IF EXISTS public.france_composite_items CASCADE;
DROP TABLE IF EXISTS public.france_customer_addresses CASCADE;
DROP TABLE IF EXISTS public.france_delivery_notifications CASCADE;
DROP TABLE IF EXISTS public.france_driver_locations CASCADE;
DROP TABLE IF EXISTS public.france_menu_categories CASCADE;
DROP TABLE IF EXISTS public.france_pizza_display_settings CASCADE;
DROP TABLE IF EXISTS public.france_product_display_configs CASCADE;
DROP TABLE IF EXISTS public.france_product_options CASCADE;
DROP TABLE IF EXISTS public.france_product_sizes CASCADE;
DROP TABLE IF EXISTS public.france_product_variants CASCADE;
DROP TABLE IF EXISTS public.france_products CASCADE;
DROP TABLE IF EXISTS public.france_restaurant_features CASCADE;
DROP TABLE IF EXISTS public.france_restaurant_service_modes CASCADE;
DROP TABLE IF EXISTS public.france_sessions CASCADE;
DROP TABLE IF EXISTS public.france_user_sessions CASCADE;
DROP TABLE IF EXISTS public.france_whatsapp_numbers CASCADE;
DROP TABLE IF EXISTS public.france_workflow_templates CASCADE;
DROP TABLE IF EXISTS public.message_templates CASCADE;
DROP TABLE IF EXISTS public.restaurant_bot_configs CASCADE;
DROP TABLE IF EXISTS public.state_transitions CASCADE;
DROP TABLE IF EXISTS public.step_executor_mappings CASCADE;
DROP TABLE IF EXISTS public.workflow_definitions CASCADE;
DROP TABLE IF EXISTS public.workflow_steps CASCADE;

-- Supprimer les vues
DROP VIEW IF EXISTS public.france_active_assignments CASCADE;
DROP VIEW IF EXISTS public.france_available_drivers CASCADE;
DROP VIEW IF EXISTS public.v_restaurant_available_modes CASCADE;
DROP VIEW IF EXISTS public.v_restaurant_pizza_display_config CASCADE;

-- Supprimer les types enum
DROP TYPE IF EXISTS public.product_type_enum CASCADE;

-- Supprimer les fonctions avec signatures spécifiques
DROP FUNCTION IF EXISTS public.accept_order_atomic(character varying, integer) CASCADE;
DROP FUNCTION IF EXISTS public.apply_composite_config(text, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.apply_simple_config(text) CASCADE;
DROP FUNCTION IF EXISTS public.auto_add_drink_to_workflows_production(integer, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.auto_add_drink_to_workflows_v2(integer, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_distance_km(numeric, numeric, numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_assignments() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_tokens() CASCADE;
DROP FUNCTION IF EXISTS public.configure_category_workflow(text, text, boolean, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.configure_category_workflow(text, text, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.copy_working_config(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.fix_category_configuration(text) CASCADE;
DROP FUNCTION IF EXISTS public.fn_get_product_by_categorie(integer) CASCADE;
DROP FUNCTION IF EXISTS public.fn_get_product_by_categorie_detailed(integer) CASCADE;
DROP FUNCTION IF EXISTS public.force_release_order(integer, integer, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_order_delivery_stats(integer) CASCADE;
DROP FUNCTION IF EXISTS public.load_orders_with_assignment_state(integer) CASCADE;
DROP FUNCTION IF EXISTS public.trigger_auto_add_drink_production() CASCADE;
DROP FUNCTION IF EXISTS public.update_composite_items(integer, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.update_driver_location_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.update_france_customer_addresses_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_france_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Réactiver les contraintes de clés étrangères
SET session_replication_role = DEFAULT;

-- Validation finale
SELECT 'Toutes les tables du schéma public ont été supprimées' as status;

COMMIT;