-- ===================================================================
-- CRÉATION TABLE WORKFLOW_SQL_SCRIPTS
-- ===================================================================
-- Table dédiée aux scripts SQL générés par le workflow universel V2
-- Remplace le localStorage pour une persistence en base de données

BEGIN;

-- Création de la table principale
CREATE TABLE IF NOT EXISTS public.workflow_sql_scripts (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  sql_script TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Statuts d'exécution
  executed_dev BOOLEAN DEFAULT FALSE,
  executed_prod BOOLEAN DEFAULT FALSE,
  dev_executed_at TIMESTAMP NULL,
  prod_executed_at TIMESTAMP NULL,

  -- Métadonnées d'analyse (compatible avec localStorage existant)
  modifications_summary JSONB DEFAULT '{
    "updates": 0,
    "inserts": 0,
    "deletes": 0,
    "total_options": 0
  }'::jsonb,

  -- Référence au produit (optionnelle car produit peut être supprimé)
  CONSTRAINT fk_workflow_scripts_product
    FOREIGN KEY (product_id)
    REFERENCES france_products(id)
    ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_workflow_scripts_product_id
  ON public.workflow_sql_scripts(product_id);

CREATE INDEX IF NOT EXISTS idx_workflow_scripts_created_at
  ON public.workflow_sql_scripts(created_at DESC);

-- Index composite pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_workflow_scripts_product_created
  ON public.workflow_sql_scripts(product_id, created_at DESC);

-- Vérification
SELECT COUNT(*) as table_created FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'workflow_sql_scripts';

COMMIT;

-- ===================================================================
-- VÉRIFICATIONS FINALES
-- ===================================================================
-- Table créée : workflow_sql_scripts
-- Index créés : 3 index pour performance optimale
-- Contraintes : Foreign key vers france_products avec CASCADE
-- Compatible : Structure identique aux données localStorage existantes
-- ===================================================================