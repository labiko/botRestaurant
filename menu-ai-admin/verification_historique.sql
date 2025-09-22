-- 🔍 VÉRIFICATION HISTORIQUE SCRIPTS SQL
-- ======================================

-- 1. Vérifier si la table existe
SELECT
    'Table menu_ai_scripts' as verification,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'menu_ai_scripts'
        ) THEN '✅ Existe'
        ELSE '❌ N''existe pas'
    END as statut;

-- 2. Compter le nombre de scripts dans l'historique
SELECT
    'Nombre de scripts' as verification,
    COUNT(*) as total_scripts,
    COUNT(CASE WHEN dev_status = 'executed' THEN 1 END) as scripts_dev_executed,
    COUNT(CASE WHEN prod_status = 'not_applied' THEN 1 END) as scripts_prod_not_applied
FROM menu_ai_scripts;

-- 3. Voir les 5 derniers scripts ajoutés
SELECT
    id,
    LEFT(script_sql, 50) || '...' as script_preview,
    command_source,
    dev_status,
    prod_status,
    created_at
FROM menu_ai_scripts
ORDER BY created_at DESC
LIMIT 5;

-- 4. Vérifier les scripts ajoutés dans les dernières minutes
SELECT
    'Scripts récents' as verification,
    COUNT(*) as scripts_derniere_heure
FROM menu_ai_scripts
WHERE created_at > NOW() - INTERVAL '1 hour';