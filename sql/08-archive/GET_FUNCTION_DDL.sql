-- ========================================================================
-- RÉCUPÉRER LA DÉFINITION DDL DE LA FONCTION load_orders_with_assignment_state
-- ========================================================================

-- Méthode 1 : Définition complète avec pg_get_functiondef
SELECT pg_get_functiondef('public.load_orders_with_assignment_state'::regproc);

-- OU Méthode 2 : Si la méthode 1 ne marche pas, utiliser cette requête détaillée
SELECT
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'load_orders_with_assignment_state';
