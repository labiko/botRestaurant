-- Script pour créer la table france_auth_sessions
-- =============================================================================
-- NOUVELLES TABLES POUR LE SYSTÈME DE GESTION DES RESTAURANTS FRANCE
-- Tables ajoutées pour l'interface de gestion (dashboard, livreurs, etc.)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLE DES LIVREURS FRANCE (Nouvelle - pour la gestion des livreurs)
-- -----------------------------------------------------------------------------
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
    
    -- Contraintes
    CONSTRAINT france_delivery_drivers_restaurant_id_fkey 
        FOREIGN KEY (restaurant_id) REFERENCES france_restaurants(id) ON DELETE CASCADE,
    CONSTRAINT france_delivery_drivers_phone_check 
        CHECK (phone_number ~ '^33[67][0-9]{8}$') -- Format téléphone français
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_france_drivers_restaurant ON france_delivery_drivers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_france_drivers_active ON france_delivery_drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_france_drivers_phone ON france_delivery_drivers(phone_number);

-- -----------------------------------------------------------------------------
-- 2. TABLE DES SESSIONS D'AUTHENTIFICATION FRANCE (Nouvelle - pour l'auth)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS france_auth_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('restaurant', 'driver')),
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Index pour optimiser les requêtes de session
CREATE INDEX IF NOT EXISTS idx_france_sessions_token ON france_auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_france_sessions_user ON france_auth_sessions(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_france_sessions_expires ON france_auth_sessions(expires_at);

-- -----------------------------------------------------------------------------
-- 3. AJOUT DE COLONNES À LA TABLE EXISTANTE france_orders (pour les livreurs)
-- -----------------------------------------------------------------------------
-- Ajouter la colonne driver_id si elle n'existe pas déjà
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'france_orders' AND column_name = 'driver_id') THEN
        ALTER TABLE france_orders ADD COLUMN driver_id INTEGER;
        ALTER TABLE france_orders ADD CONSTRAINT france_orders_driver_fkey 
            FOREIGN KEY (driver_id) REFERENCES france_delivery_drivers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Ajouter la colonne estimated_delivery_time si elle n'existe pas déjà
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'france_orders' AND column_name = 'estimated_delivery_time') THEN
        ALTER TABLE france_orders ADD COLUMN estimated_delivery_time TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_france_orders_driver ON france_orders(driver_id);

-- -----------------------------------------------------------------------------
-- 4. AJOUT DE COLONNES À LA TABLE EXISTANTE france_restaurants (pour l'auth)
-- -----------------------------------------------------------------------------
-- Ajouter la colonne password_hash si elle n'existe pas déjà
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'france_restaurants' AND column_name = 'password_hash') THEN
        ALTER TABLE france_restaurants ADD COLUMN password_hash VARCHAR(255);
        -- Mettre un mot de passe par défaut (à changer en production)
        UPDATE france_restaurants SET password_hash = '$2a$10$example.hash.change.in.production' WHERE password_hash IS NULL;
        ALTER TABLE france_restaurants ALTER COLUMN password_hash SET NOT NULL;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 5. TRIGGERS POUR LES NOUVELLES TABLES
-- -----------------------------------------------------------------------------

-- Fonction pour mettre à jour automatiquement updated_at (si elle n'existe pas)
CREATE OR REPLACE FUNCTION update_france_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at sur les nouvelles tables
DROP TRIGGER IF EXISTS update_france_drivers_updated_at ON france_delivery_drivers;
CREATE TRIGGER update_france_drivers_updated_at 
    BEFORE UPDATE ON france_delivery_drivers 
    FOR EACH ROW EXECUTE FUNCTION update_france_updated_at_column();

-- -----------------------------------------------------------------------------
-- 6. DONNÉES DE TEST POUR LES NOUVELLES TABLES
-- -----------------------------------------------------------------------------

-- Insérer un livreur de test (seulement si le restaurant existe)
DO $$
DECLARE
    restaurant_id_var INTEGER;
BEGIN
    -- Récupérer l'ID du premier restaurant france
    SELECT id INTO restaurant_id_var FROM france_restaurants LIMIT 1;
    
    IF restaurant_id_var IS NOT NULL THEN
        INSERT INTO france_delivery_drivers (restaurant_id, first_name, last_name, phone_number, password_hash) 
        VALUES (
            restaurant_id_var,
            'Jean',
            'Dupont',
            '33687654321',
            '$2a$10$example.hash.for.testing.change.in.production'
        ) ON CONFLICT (phone_number) DO NOTHING;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 7. VÉRIFICATIONS POST-INSTALLATION
-- -----------------------------------------------------------------------------

-- Vérifier que toutes les nouvelles tables existent
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('france_delivery_drivers', 'france_auth_sessions');
    
    IF table_count = 2 THEN
        RAISE NOTICE 'SUCCESS: Toutes les tables du système de gestion France ont été créées (% tables)', table_count;
    ELSE
        RAISE WARNING 'ATTENTION: Seulement % tables créées sur 2 attendues', table_count;
    END IF;
END $$;

-- =============================================================================
-- RÉSUMÉ DES NOUVELLES FONCTIONNALITÉS AJOUTÉES :
-- =============================================================================
-- 
-- ✅ france_delivery_drivers : Gestion des livreurs
--    - Informations personnelles (nom, téléphone, email)
--    - Authentification avec mot de passe hashé
--    - Statut actif/inactif
--    - Rattachement aux restaurants
--
-- ✅ france_auth_sessions : Sessions d'authentification 
--    - Support restaurants ET livreurs
--    - Tokens sécurisés avec expiration
--    - Tracking IP et user agent
--
-- ✅ Extensions france_orders :
--    - Assignation aux livreurs (driver_id)
--    - Temps estimé de livraison
--
-- ✅ Extensions france_restaurants :
--    - Authentification avec password_hash
--
-- COMMANDE DE VÉRIFICATION :
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'france_%';
-- =============================================================================