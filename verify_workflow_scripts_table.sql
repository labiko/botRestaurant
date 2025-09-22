-- ===================================================================
-- VÉRIFICATION TABLE WORKFLOW_SQL_SCRIPTS
-- ===================================================================

-- 1. Vérifier si la table existe
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'workflow_sql_scripts'
) AS table_exists;

-- 2. Voir la structure de la table
\d public.workflow_sql_scripts;

-- 3. Compter les enregistrements
SELECT COUNT(*) as total_scripts FROM public.workflow_sql_scripts;

-- 4. Voir les derniers scripts enregistrés
SELECT
  id,
  product_id,
  product_name,
  created_at,
  executed_dev,
  executed_prod,
  LENGTH(sql_script) as sql_length,
  modifications_summary
FROM public.workflow_sql_scripts
ORDER BY created_at DESC
LIMIT 10;

-- 5. Vérifier par product_id (exemple)
-- SELECT * FROM public.workflow_sql_scripts WHERE product_id = 123;

-- ===================================================================
-- Instructions :
-- 1. Exécuter d'abord create_workflow_sql_scripts_table.sql
-- 2. Puis exécuter ce script pour vérifier
-- 3. Cliquer "Générer" dans l'interface
-- 4. Re-exécuter ce script pour voir les nouvelles données
-- ===================================================================