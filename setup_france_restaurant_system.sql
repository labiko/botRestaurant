-- =============================================================================
-- SYSTÈME DE GESTION DES RESTAURANTS FRANCE
-- Base de données complète pour le bot restaurant France
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLE DES RESTAURANTS FRANCE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS france_restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    opening_hours JSONB,
    delivery_zones JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_france_restaurants_active ON france_restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_france_restaurants_phone ON france_restaurants(phone);

-- -----------------------------------------------------------------------------
-- 2. TABLE DES LIVREURS FRANCE
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
-- 3. TABLE DES SESSIONS D'AUTHENTIFICATION FRANCE
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
-- 4. TABLE DES COMMANDES FRANCE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS france_orders (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    driver_id INTEGER,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    
    -- Informations client
    phone_number VARCHAR(30) NOT NULL,
    customer_name VARCHAR(255),
    
    -- Détails commande
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Mode et livraison
    delivery_mode VARCHAR(20) NOT NULL CHECK (delivery_mode IN ('sur_place', 'a_emporter', 'livraison')),
    delivery_address TEXT,
    delivery_address_id INTEGER,
    delivery_validation_code VARCHAR(4),
    date_validation_code TIMESTAMP WITH TIME ZONE,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    
    -- Paiement
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('maintenant', 'fin_repas', 'recuperation', 'livraison')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('orange_money', 'wave', 'cash')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    
    -- Statut et suivi
    status VARCHAR(20) NOT NULL DEFAULT 'en_attente' 
        CHECK (status IN ('en_attente', 'confirmee', 'preparation', 'prete', 'en_livraison', 'livree', 'annulee')),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT france_orders_restaurant_fkey 
        FOREIGN KEY (restaurant_id) REFERENCES france_restaurants(id) ON DELETE CASCADE,
    CONSTRAINT france_orders_driver_fkey 
        FOREIGN KEY (driver_id) REFERENCES france_delivery_drivers(id) ON DELETE SET NULL
);

-- Index pour optimiser les requêtes de commandes
CREATE INDEX IF NOT EXISTS idx_france_orders_restaurant ON france_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_france_orders_driver ON france_orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_france_orders_status ON france_orders(status);
CREATE INDEX IF NOT EXISTS idx_france_orders_created ON france_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_france_orders_phone ON france_orders(phone_number);
CREATE INDEX IF NOT EXISTS idx_france_orders_number ON france_orders(order_number);

-- -----------------------------------------------------------------------------
-- 5. TABLE DES ADRESSES DE LIVRAISON FRANCE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS france_delivery_addresses (
    id BIGSERIAL PRIMARY KEY,
    phone_number VARCHAR(30) NOT NULL,
    address_label VARCHAR(255) NOT NULL,
    full_address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    delivery_instructions TEXT,
    is_validated BOOLEAN DEFAULT false,
    validation_source VARCHAR(50), -- 'google_places', 'manual', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les adresses
CREATE INDEX IF NOT EXISTS idx_france_addresses_phone ON france_delivery_addresses(phone_number);
CREATE INDEX IF NOT EXISTS idx_france_addresses_validated ON france_delivery_addresses(is_validated);
CREATE INDEX IF NOT EXISTS idx_france_addresses_location ON france_delivery_addresses(latitude, longitude);

-- -----------------------------------------------------------------------------
-- 6. FONCTIONS ET TRIGGERS
-- -----------------------------------------------------------------------------

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_france_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_france_restaurants_updated_at 
    BEFORE UPDATE ON france_restaurants 
    FOR EACH ROW EXECUTE FUNCTION update_france_updated_at_column();

CREATE TRIGGER update_france_drivers_updated_at 
    BEFORE UPDATE ON france_delivery_drivers 
    FOR EACH ROW EXECUTE FUNCTION update_france_updated_at_column();

CREATE TRIGGER update_france_orders_updated_at 
    BEFORE UPDATE ON france_orders 
    FOR EACH ROW EXECUTE FUNCTION update_france_updated_at_column();

CREATE TRIGGER update_france_addresses_updated_at 
    BEFORE UPDATE ON france_delivery_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_france_updated_at_column();

-- Fonction pour générer des numéros de commande
CREATE OR REPLACE FUNCTION generate_france_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'FR' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
        
        IF NOT EXISTS (SELECT 1 FROM france_orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 7. DONNÉES DE TEST (OPTIONNEL)
-- -----------------------------------------------------------------------------

-- Insertion d'un restaurant de test
INSERT INTO france_restaurants (name, phone, email, password_hash, address) 
VALUES (
    'Pizza Yolo 77 - France',
    '33612345678',
    'pizzayolo77@france.fr',
    '$2a$10$example.hash.for.testing.purposes.only.remove.in.production',
    '123 Rue de la Paix, 75001 Paris, France'
) ON CONFLICT DO NOTHING;

-- Insertion d'un livreur de test
INSERT INTO france_delivery_drivers (restaurant_id, first_name, last_name, phone_number, password_hash) 
VALUES (
    (SELECT id FROM france_restaurants WHERE phone = '33612345678' LIMIT 1),
    'Jean',
    'Dupont',
    '33687654321',
    '$2a$10$example.hash.for.testing.purposes.only.remove.in.production'
) ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 8. POLITIQUE DE SÉCURITÉ RLS (Row Level Security)
-- -----------------------------------------------------------------------------

-- Activer RLS sur les tables sensibles
ALTER TABLE france_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE france_delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE france_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE france_auth_sessions ENABLE ROW LEVEL SECURITY;

-- Politique pour les restaurants (accès à leurs propres données)
CREATE POLICY france_restaurants_policy ON france_restaurants
    USING (id = current_setting('app.current_restaurant_id', true)::INTEGER);

-- Politique pour les livreurs (accès à leurs propres données et commandes assignées)
CREATE POLICY france_drivers_policy ON france_delivery_drivers
    USING (
        id = current_setting('app.current_driver_id', true)::INTEGER OR
        restaurant_id = current_setting('app.current_restaurant_id', true)::INTEGER
    );

-- Politique pour les commandes
CREATE POLICY france_orders_policy ON france_orders
    USING (
        restaurant_id = current_setting('app.current_restaurant_id', true)::INTEGER OR
        driver_id = current_setting('app.current_driver_id', true)::INTEGER
    );

-- -----------------------------------------------------------------------------
-- 9. VUES UTILES
-- -----------------------------------------------------------------------------

-- Vue pour les statistiques des restaurants
CREATE OR REPLACE VIEW france_restaurant_stats AS
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    COUNT(DISTINCT d.id) as total_drivers,
    COUNT(DISTINCT CASE WHEN d.is_active THEN d.id END) as active_drivers,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN o.id END) as today_orders,
    COUNT(DISTINCT CASE WHEN o.status IN ('en_attente', 'confirmee') THEN o.id END) as pending_orders,
    COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE AND o.status = 'livree' THEN o.total_amount END), 0) as today_revenue
FROM france_restaurants r
LEFT JOIN france_delivery_drivers d ON r.id = d.restaurant_id
LEFT JOIN france_orders o ON r.id = o.restaurant_id
GROUP BY r.id, r.name;

-- Vue pour les statistiques des livreurs
CREATE OR REPLACE VIEW france_driver_stats AS
SELECT 
    d.id as driver_id,
    d.first_name || ' ' || d.last_name as driver_name,
    d.restaurant_id,
    COUNT(DISTINCT o.id) as total_deliveries,
    COUNT(DISTINCT CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN o.id END) as today_deliveries,
    COUNT(DISTINCT CASE WHEN o.status = 'en_livraison' THEN o.id END) as active_orders,
    COALESCE(AVG(EXTRACT(EPOCH FROM (o.updated_at - o.created_at))/60), 0) as avg_delivery_time_minutes
FROM france_delivery_drivers d
LEFT JOIN france_orders o ON d.id = o.driver_id AND o.status = 'livree'
GROUP BY d.id, d.first_name, d.last_name, d.restaurant_id;

-- -----------------------------------------------------------------------------
-- 10. PROCÉDURES STOCKÉES UTILES
-- -----------------------------------------------------------------------------

-- Procédure pour assigner automatiquement une commande à un livreur disponible
CREATE OR REPLACE FUNCTION assign_order_to_available_driver(order_id_param BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    restaurant_id_var INTEGER;
    available_driver_id INTEGER;
BEGIN
    -- Récupérer l'ID du restaurant pour cette commande
    SELECT restaurant_id INTO restaurant_id_var 
    FROM france_orders 
    WHERE id = order_id_param AND driver_id IS NULL AND status = 'prete';
    
    IF restaurant_id_var IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Trouver un livreur disponible (pas de commande en cours)
    SELECT d.id INTO available_driver_id
    FROM france_delivery_drivers d
    LEFT JOIN france_orders o ON d.id = o.driver_id AND o.status IN ('prete', 'en_livraison')
    WHERE d.restaurant_id = restaurant_id_var 
        AND d.is_active = true 
        AND o.id IS NULL
    LIMIT 1;
    
    IF available_driver_id IS NOT NULL THEN
        UPDATE france_orders 
        SET driver_id = available_driver_id, updated_at = NOW()
        WHERE id = order_id_param;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- COMMENTAIRES ET DOCUMENTATION
-- -----------------------------------------------------------------------------

COMMENT ON TABLE france_restaurants IS 'Table des restaurants pour le système France';
COMMENT ON TABLE france_delivery_drivers IS 'Table des livreurs rattachés aux restaurants France';
COMMENT ON TABLE france_orders IS 'Table des commandes du système France avec suivi complet';
COMMENT ON TABLE france_auth_sessions IS 'Sessions d''authentification pour restaurants et livreurs France';
COMMENT ON TABLE france_delivery_addresses IS 'Adresses de livraison validées pour les clients France';

COMMENT ON COLUMN france_orders.delivery_validation_code IS 'Code de validation à 4 chiffres pour confirmer la livraison';
COMMENT ON COLUMN france_orders.payment_mode IS 'Mode de paiement: maintenant, fin_repas, recuperation, livraison';
COMMENT ON COLUMN france_orders.status IS 'Statut de la commande dans le workflow de traitement';

-- =============================================================================
-- FIN DU SCRIPT SQL
-- =============================================================================

-- Pour exécuter ce script:
-- psql -U postgres -d votre_base_de_donnees -f setup_france_restaurant_system.sql

-- Vérifications post-installation:
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'france_%';
-- SELECT * FROM france_restaurant_stats;
-- SELECT * FROM france_driver_stats;