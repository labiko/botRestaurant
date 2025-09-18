-- 🛠️ CONFIGURATION SUPABASE POUR MENU AI ADMIN
-- ===============================================

-- Fonction pour exécuter du SQL dynamique de manière sécurisée
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    query_upper TEXT;
BEGIN
    -- Validation de sécurité basique
    query_upper := UPPER(sql_query);

    -- Interdire les commandes dangereuses
    IF query_upper LIKE '%DROP%' OR
       query_upper LIKE '%TRUNCATE%' OR
       query_upper LIKE '%DELETE FROM%' OR
       query_upper LIKE '%ALTER TABLE%' THEN
        RAISE EXCEPTION 'Commande SQL dangereuse détectée: %', sql_query;
    END IF;

    -- Log de la requête pour débogage
    INSERT INTO public.sql_execution_log (sql_query, executed_at, executed_by)
    VALUES (sql_query, NOW(), auth.uid());

    -- Exécution de la requête
    EXECUTE sql_query;

    -- Retourner un succès
    RETURN json_build_object(
        'success', true,
        'message', 'SQL exécuté avec succès',
        'timestamp', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Log de l'erreur
        INSERT INTO public.sql_execution_log (sql_query, executed_at, executed_by, error_message)
        VALUES (sql_query, NOW(), auth.uid(), SQLERRM);

        -- Retourner l'erreur
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'timestamp', NOW()
        );
END;
$$;

-- Table pour logger les exécutions SQL
CREATE TABLE IF NOT EXISTS public.sql_execution_log (
    id BIGSERIAL PRIMARY KEY,
    sql_query TEXT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    executed_by UUID REFERENCES auth.users(id),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politique RLS pour la table de log
ALTER TABLE public.sql_execution_log ENABLE ROW LEVEL SECURITY;

-- Permettre l'insertion pour tous les utilisateurs authentifiés
CREATE POLICY "Permettre insertion log SQL" ON public.sql_execution_log
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Permettre la lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Permettre lecture log SQL" ON public.sql_execution_log
    FOR SELECT TO authenticated
    USING (true);

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;
GRANT INSERT, SELECT ON public.sql_execution_log TO authenticated;

-- Commentaires pour documentation
COMMENT ON FUNCTION execute_sql(TEXT) IS 'Fonction sécurisée pour exécuter du SQL dynamique avec validation et logging';
COMMENT ON TABLE public.sql_execution_log IS 'Log des exécutions SQL du Menu AI Admin';