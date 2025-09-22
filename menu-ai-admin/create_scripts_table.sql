-- 📋 TABLE DE TRAÇABILITÉ DES SCRIPTS SQL GÉNÉRÉS PAR L'IA
-- ========================================================

BEGIN;

-- Création de la table menu_ai_scripts
CREATE TABLE IF NOT EXISTS public.menu_ai_scripts (
  id SERIAL PRIMARY KEY,
  script_sql TEXT NOT NULL,
  dev_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'executed', 'error', 'rolled_back'
  prod_status VARCHAR(20) DEFAULT 'not_applied', -- 'not_applied', 'executed', 'error', 'rolled_back'
  command_source TEXT, -- Commande originale entrée par l'utilisateur
  ai_explanation TEXT, -- Explication générée par l'IA
  category_name VARCHAR(100), -- Nom de la catégorie concernée
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dev_executed_at TIMESTAMP WITH TIME ZONE,
  prod_executed_at TIMESTAMP WITH TIME ZONE,
  dev_error_message TEXT,
  prod_error_message TEXT,
  rollback_sql TEXT, -- Script de rollback généré par l'IA
  created_by VARCHAR(100) DEFAULT 'menu-ai-admin'
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_menu_ai_scripts_dev_status ON public.menu_ai_scripts(dev_status);
CREATE INDEX IF NOT EXISTS idx_menu_ai_scripts_prod_status ON public.menu_ai_scripts(prod_status);
CREATE INDEX IF NOT EXISTS idx_menu_ai_scripts_created_at ON public.menu_ai_scripts(created_at DESC);

-- Commentaires sur les colonnes
COMMENT ON TABLE public.menu_ai_scripts IS 'Table de traçabilité des scripts SQL générés par le système AI';
COMMENT ON COLUMN public.menu_ai_scripts.dev_status IS 'Statut du script en environnement DEV';
COMMENT ON COLUMN public.menu_ai_scripts.prod_status IS 'Statut du script en environnement PROD';
COMMENT ON COLUMN public.menu_ai_scripts.rollback_sql IS 'Script SQL inverse pour annuler les modifications';

-- Vérification
SELECT
  'Table menu_ai_scripts créée avec succès' as message,
  COUNT(*) as nb_colonnes
FROM information_schema.columns
WHERE table_name = 'menu_ai_scripts';

COMMIT;