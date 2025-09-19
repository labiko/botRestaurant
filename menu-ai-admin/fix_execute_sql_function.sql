-- 🛠️ CORRECTION FONCTION EXECUTE_SQL - GESTION TRANSACTIONS
-- ==========================================================

-- Fonction corrigée pour gérer les transactions automatiquement
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    clean_sql text;
BEGIN
    -- Nettoyer le SQL en supprimant BEGIN; et COMMIT;
    clean_sql := sql_query;
    clean_sql := REPLACE(clean_sql, 'BEGIN;', '');
    clean_sql := REPLACE(clean_sql, 'COMMIT;', '');
    clean_sql := TRIM(clean_sql);

    -- Exécuter le SQL nettoyé (la fonction est déjà dans une transaction)
    EXECUTE clean_sql;

    -- Retourner un succès
    result := json_build_object(
        'success', true,
        'message', 'SQL executed successfully',
        'affected_rows', 1,
        'executed_sql', clean_sql
    );

    RETURN result;

EXCEPTION WHEN OTHERS THEN
    -- En cas d'erreur, retourner l'erreur détaillée
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'state', SQLSTATE,
        'attempted_sql', clean_sql
    );

    RETURN result;
END;
$$;

-- Test avec le script exact qui posait problème
SELECT execute_sql('BEGIN;
UPDATE france_products SET name = ''VERTE v3'', price_on_site_base = 4, price_delivery_base = 4, product_type = ''simple'', composition = ''Salade verte nature'', updated_at = NOW() WHERE id = 178;
COMMIT;');

-- Vérification du résultat
SELECT id, name, price_on_site_base, price_delivery_base FROM france_products WHERE id = 178;