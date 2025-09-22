-- 🔄 CRÉATION TABLES GESTION SYNCHRONISATION PRODUCTION
-- =======================================================
-- Date: 22/09/2025
-- Objectif: Tracking des synchronisations DEV → PROD

BEGIN;

-- 1. Ajouter colonnes à duplication_logs
ALTER TABLE duplication_logs
ADD COLUMN IF NOT EXISTS production_status VARCHAR(20) DEFAULT 'dev_only';

ALTER TABLE duplication_logs
ADD COLUMN IF NOT EXISTS last_production_sync TIMESTAMP;

ALTER TABLE duplication_logs
ADD COLUMN IF NOT EXISTS sync_count INTEGER DEFAULT 0;

-- 2. Créer table historique synchronisations
CREATE TABLE IF NOT EXISTS production_sync_history (
  id SERIAL PRIMARY KEY,
  duplication_log_id INTEGER REFERENCES duplication_logs(id),
  restaurant_id INTEGER,
  sync_date TIMESTAMP DEFAULT NOW(),
  sync_type VARCHAR(20) NOT NULL, -- 'initial', 'update', 'category'
  items_synced JSONB, -- {categories: 5, products: 25, options: 50}
  sql_script TEXT,
  executed_by VARCHAR(255),
  execution_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'executed', 'failed'
  execution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Index pour performance
CREATE INDEX IF NOT EXISTS idx_production_sync_duplication_log
ON production_sync_history(duplication_log_id);

CREATE INDEX IF NOT EXISTS idx_production_sync_restaurant
ON production_sync_history(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_production_sync_date
ON production_sync_history(sync_date DESC);

-- 4. Commentaires
COMMENT ON TABLE production_sync_history IS 'Historique des synchronisations DEV vers PRODUCTION';
COMMENT ON COLUMN production_sync_history.sync_type IS 'Type: initial, update, category';
COMMENT ON COLUMN production_sync_history.items_synced IS 'Détail JSON des éléments synchronisés';
COMMENT ON COLUMN production_sync_history.execution_status IS 'Statut: pending, executed, failed';

COMMIT;

-- ✅ Tables créées avec succès
SELECT 'Tables production_sync créées avec succès' as status;