-- SCRIPT DE MIGRATION DES 7 TABLES DEV VERS PROD
-- ====================================================
-- Tables présentes uniquement en DEV à migrer vers PROD:
-- 1. duplication_actions
-- 2. duplication_logs
-- 3. france_option_groups
-- 4. login_users
-- 5. production_sync_history
-- 6. sql_execution_log
-- 7. workflow_sql_scripts
-- ====================================================

BEGIN;

-- ========================================
-- EXTRACTION DES STRUCTURES EN COURS...
-- ========================================
