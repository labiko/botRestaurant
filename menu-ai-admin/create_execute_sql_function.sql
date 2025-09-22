-- 🛠️ CRÉATION FONCTION EXECUTE_SQL POUR API
-- ===========================================

-- Fonction pour exécuter du SQL dynamique depuis l'API
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    -- Exécuter la requête SQL dynamique
    EXECUTE sql_query;

    -- Retourner un succès
    result := json_build_object(
        'success', true,
        'message', 'SQL executed successfully',
        'affected_rows', 1
    );

    RETURN result;

EXCEPTION WHEN OTHERS THEN
    -- En cas d'erreur, retourner l'erreur
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'state', SQLSTATE
    );

    RETURN result;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;

-- Test de la fonction
SELECT execute_sql('SELECT 1 as test');