-- 📋 SCHÉMA BASE DE DONNÉES TRAÇABILITÉ DUPLICATIONS
-- ====================================================

-- Table principale des logs de duplication
CREATE TABLE IF NOT EXISTS duplication_logs (
  id SERIAL PRIMARY KEY,
  source_restaurant_id INTEGER REFERENCES france_restaurants(id),
  target_restaurant_id INTEGER REFERENCES france_restaurants(id),
  user_session VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('started', 'in_progress', 'completed', 'failed')),
  summary JSONB,
  details JSONB,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table détaillée des actions de duplication
CREATE TABLE IF NOT EXISTS duplication_actions (
  id SERIAL PRIMARY KEY,
  duplication_log_id INTEGER REFERENCES duplication_logs(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL, -- 'create_restaurant', 'duplicate_category', 'duplicate_product', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'restaurant', 'category', 'product', 'option'
  source_id INTEGER,
  target_id INTEGER,
  entity_name VARCHAR(255),
  action_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_duplication_logs_status ON duplication_logs(status);
CREATE INDEX IF NOT EXISTS idx_duplication_logs_created_at ON duplication_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_duplication_actions_log_id ON duplication_actions(duplication_log_id);
CREATE INDEX IF NOT EXISTS idx_duplication_actions_type ON duplication_actions(action_type);

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_duplication_logs_updated_at BEFORE UPDATE ON duplication_logs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour documentation
COMMENT ON TABLE duplication_logs IS 'Log principal de chaque duplication de restaurant';
COMMENT ON TABLE duplication_actions IS 'Détail de chaque action effectuée pendant la duplication';
COMMENT ON COLUMN duplication_logs.status IS 'Statut: started, in_progress, completed, failed';
COMMENT ON COLUMN duplication_logs.summary IS 'Résumé final avec statistiques (JSON)';
COMMENT ON COLUMN duplication_logs.details IS 'Détails de configuration et paramètres (JSON)';
COMMENT ON COLUMN duplication_actions.action_type IS 'Type daction: create_restaurant, duplicate_category, duplicate_product, duplicate_option';
COMMENT ON COLUMN duplication_actions.entity_type IS 'Type dentité: restaurant, category, product, option';