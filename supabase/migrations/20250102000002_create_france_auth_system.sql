-- ========================================
-- SYSTÈME D'AUTHENTIFICATION BOT FRANCE
-- ========================================

-- Table des livreurs France (séparée du bot Guinée)
CREATE TABLE IF NOT EXISTS france_delivery_drivers (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT france_delivery_drivers_restaurant_id_fkey 
    FOREIGN KEY (restaurant_id) REFERENCES france_restaurants(id) ON DELETE CASCADE
);

-- Table des sessions d'authentification France
CREATE TABLE IF NOT EXISTS france_auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('restaurant', 'driver')),
  phone_number VARCHAR(30) NOT NULL,
  restaurant_id INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT france_auth_sessions_restaurant_id_fkey 
    FOREIGN KEY (restaurant_id) REFERENCES france_restaurants(id) ON DELETE CASCADE
);

-- Ajouter une colonne password_hash aux restaurants France (si pas déjà présente)
ALTER TABLE france_restaurants 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_france_drivers_restaurant 
ON france_delivery_drivers(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_france_drivers_phone 
ON france_delivery_drivers(phone_number);

CREATE INDEX IF NOT EXISTS idx_france_drivers_active 
ON france_delivery_drivers(is_active);

CREATE INDEX IF NOT EXISTS idx_france_auth_sessions_user 
ON france_auth_sessions(user_id, user_type);

CREATE INDEX IF NOT EXISTS idx_france_auth_sessions_phone 
ON france_auth_sessions(phone_number);

CREATE INDEX IF NOT EXISTS idx_france_auth_sessions_expires 
ON france_auth_sessions(expires_at);

-- Commentaires pour documentation
COMMENT ON TABLE france_delivery_drivers IS 'Livreurs associés aux restaurants France';
COMMENT ON TABLE france_auth_sessions IS 'Sessions d''authentification pour le système France (restaurants + livreurs)';

COMMENT ON COLUMN france_delivery_drivers.restaurant_id IS 'Restaurant auquel le livreur est rattaché';
COMMENT ON COLUMN france_delivery_drivers.phone_number IS 'Numéro WhatsApp du livreur pour notifications';
COMMENT ON COLUMN france_delivery_drivers.password_hash IS 'Hash du mot de passe pour authentification';

COMMENT ON COLUMN france_auth_sessions.user_type IS 'Type d''utilisateur: restaurant ou driver';
COMMENT ON COLUMN france_auth_sessions.user_id IS 'ID dans la table correspondante (france_restaurants ou france_delivery_drivers)';
COMMENT ON COLUMN france_auth_sessions.restaurant_id IS 'Restaurant associé (même ID que user_id si user_type=restaurant)';