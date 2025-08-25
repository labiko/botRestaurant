-- ===============================================
-- 🏗️ SETUP DATABASE COMPLET - APPLICATION RESTAURANT IONIC
-- ===============================================
-- Exécuter ces scripts dans l'ordre dans Supabase SQL Editor

-- ===============================================
-- 1. TABLE DES UTILISATEURS RESTAURANTS
-- ===============================================

-- Création de la table des utilisateurs restaurants
CREATE TABLE IF NOT EXISTS restaurant_users (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'staff')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_restaurant_users_email ON restaurant_users(email);
CREATE INDEX IF NOT EXISTS idx_restaurant_users_restaurant_id ON restaurant_users(restaurant_id);

-- ===============================================
-- 2. TABLE DES LIVREURS
-- ===============================================

-- Création de la table des livreurs
CREATE TABLE IF NOT EXISTS delivery_users (
    id BIGSERIAL PRIMARY KEY,
    telephone VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    code_acces VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'actif' CHECK (status IN ('actif', 'inactif', 'suspendu')),
    is_online BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_deliveries INTEGER DEFAULT 0,
    total_earnings BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_delivery_users_telephone ON delivery_users(telephone);
CREATE INDEX IF NOT EXISTS idx_delivery_users_status ON delivery_users(status);

-- ===============================================
-- 3. MISE À JOUR TABLE RESTAURANTS
-- ===============================================

-- Ajouter des colonnes manquantes à la table restaurants
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS telephone VARCHAR(20),
ADD COLUMN IF NOT EXISTS adresse TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS banner_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS delivery_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_order_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_delivery_distance DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;

-- Mise à jour du constraint statut si nécessaire
ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_statut_check;
ALTER TABLE restaurants ADD CONSTRAINT restaurants_statut_check 
CHECK (statut IN ('ouvert', 'ferme', 'temporairement_ferme'));

-- ===============================================
-- 4. TABLE DES SESSIONS UTILISATEURS
-- ===============================================

-- Création de la table des sessions pour tracking des connexions
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('restaurant', 'delivery')),
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- ===============================================
-- 5. TABLE DES ANALYTICS RESTAURANTS
-- ===============================================

-- Création de la table pour stocker les analytics
CREATE TABLE IF NOT EXISTS restaurant_analytics (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    date_record DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue BIGINT DEFAULT 0,
    average_order_value INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    peak_hour INTEGER, -- heure de pointe (0-23)
    most_popular_item VARCHAR(255),
    delivery_orders INTEGER DEFAULT 0,
    takeaway_orders INTEGER DEFAULT 0,
    dine_in_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(restaurant_id, date_record)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_restaurant_date ON restaurant_analytics(restaurant_id, date_record);
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_date ON restaurant_analytics(date_record);

-- ===============================================
-- 6. TABLE DES LOGS DE STATUT RESTAURANT
-- ===============================================

-- Création de la table des logs de changement de statut
CREATE TABLE IF NOT EXISTS restaurant_status_logs (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    changed_by_user_id BIGINT REFERENCES restaurant_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_restaurant_status_logs_restaurant ON restaurant_status_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_status_logs_date ON restaurant_status_logs(created_at);

-- ===============================================
-- 7. TABLE DES STATISTIQUES LIVREUR
-- ===============================================

-- Création de la table pour les statistiques des livreurs par jour
CREATE TABLE IF NOT EXISTS delivery_stats (
    id BIGSERIAL PRIMARY KEY,
    delivery_user_id BIGINT NOT NULL REFERENCES delivery_users(id) ON DELETE CASCADE,
    date_record DATE NOT NULL,
    total_deliveries INTEGER DEFAULT 0,
    total_earnings BIGINT DEFAULT 0,
    average_delivery_time INTEGER DEFAULT 0, -- en minutes
    total_distance DECIMAL(10,2) DEFAULT 0, -- en km
    rating_average DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(delivery_user_id, date_record)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_delivery_stats_user_date ON delivery_stats(delivery_user_id, date_record);

-- ===============================================
-- 8. FONCTIONS UTILITAIRES
-- ===============================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_restaurant_users_updated_at ON restaurant_users;
CREATE TRIGGER update_restaurant_users_updated_at 
    BEFORE UPDATE ON restaurant_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_users_updated_at ON delivery_users;
CREATE TRIGGER update_delivery_users_updated_at 
    BEFORE UPDATE ON delivery_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON restaurants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- 9. DONNÉES DE TEST
-- ===============================================

-- Insertion de données de test pour les utilisateurs restaurants
-- D'abord, récupérer les vrais UUID des restaurants existants
INSERT INTO restaurant_users (restaurant_id, email, password_hash, nom, role) 
SELECT r.id, u.email, u.password_hash, u.nom, u.role
FROM (VALUES 
    ('admin@bellvista.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye9lzeROEGTtEKq5jg5nTJ6', 'Admin Bella Vista', 'admin'),
    ('admin@chezfatou.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye9lzeROEGTtEKq5jg5nTJ6', 'Admin Chez Fatou', 'admin'),
    ('admin@lepalmier.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye9lzeROEGTtEKq5jg5nTJ6', 'Admin Le Palmier', 'admin')
) AS u(email, password_hash, nom, role)
CROSS JOIN LATERAL (
    SELECT id FROM restaurants ORDER BY created_at LIMIT 1 OFFSET (
        CASE u.email 
            WHEN 'admin@bellvista.com' THEN 0
            WHEN 'admin@chezfatou.com' THEN 1  
            WHEN 'admin@lepalmier.com' THEN 2
            ELSE 0 
        END
    )
) AS r
ON CONFLICT (email) DO NOTHING;

-- Insertion de données de test pour les livreurs
INSERT INTO delivery_users (telephone, nom, code_acces, status, rating, total_deliveries) 
VALUES 
('624123456', 'Mamadou Diallo', '123456', 'actif', 4.8, 245),
('628987654', 'Aïcha Barry', '654321', 'actif', 4.6, 189),
('611555333', 'Ibrahim Camara', '789123', 'actif', 4.9, 312)
ON CONFLICT (telephone) DO NOTHING;

-- Mise à jour des restaurants existants avec des données complètes
UPDATE restaurants SET 
    email = COALESCE(email, 'contact@restaurant' || id || '.com'),
    telephone = COALESCE(telephone, '22462011' || LPAD(id::text, 4, '0')),
    adresse = COALESCE(adresse, 'Conakry, Guinée'),
    description = COALESCE(description, 'Restaurant traditionnel guinéen'),
    delivery_fee = COALESCE(delivery_fee, 15000),
    min_order_amount = COALESCE(min_order_amount, 25000),
    preparation_time = COALESCE(preparation_time, 30),
    rating = COALESCE(rating, 4.0 + (RANDOM() * 1.0))
WHERE email IS NULL;

-- Données analytics de test pour le dernier mois
INSERT INTO restaurant_analytics (restaurant_id, date_record, total_orders, total_revenue, average_order_value, delivery_orders)
SELECT 
    r.id,
    CURRENT_DATE - (generate_series(0, 30) || ' days')::interval,
    (15 + (RANDOM() * 25))::integer,
    (450000 + (RANDOM() * 300000))::bigint,
    30000,
    (8 + (RANDOM() * 15))::integer
FROM restaurants r
ORDER BY r.created_at
LIMIT 3
ON CONFLICT (restaurant_id, date_record) DO NOTHING;

-- Données de statistiques livreur de test
INSERT INTO delivery_stats (delivery_user_id, date_record, total_deliveries, total_earnings, average_delivery_time)
SELECT 
    d.id,
    CURRENT_DATE - (generate_series(0, 30) || ' days')::interval,
    (3 + (RANDOM() * 8))::integer,
    (45000 + (RANDOM() * 95000))::bigint,
    (18 + (RANDOM() * 15))::integer
FROM delivery_users d
ON CONFLICT (delivery_user_id, date_record) DO NOTHING;

-- ===============================================
-- 10. VUES UTILES POUR L'APPLICATION
-- ===============================================

-- Vue pour les statistiques rapides restaurant
CREATE OR REPLACE VIEW restaurant_dashboard_stats AS
SELECT 
    r.id as restaurant_id,
    r.nom as restaurant_name,
    r.statut,
    COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE THEN c.id END) as orders_today,
    COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN c.id END) as orders_week,
    COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN c.id END) as orders_month,
    COALESCE(SUM(CASE WHEN c.created_at >= CURRENT_DATE THEN c.total END), 0) as revenue_today,
    COALESCE(SUM(CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN c.total END), 0) as revenue_week,
    COALESCE(SUM(CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN c.total END), 0) as revenue_month
FROM restaurants r
LEFT JOIN commandes c ON r.id = c.restaurant_id AND c.statut != 'annulee'
GROUP BY r.id, r.nom, r.statut;

-- Vue pour les statistiques livreur
CREATE OR REPLACE VIEW delivery_dashboard_stats AS
SELECT 
    d.id as delivery_user_id,
    d.nom,
    d.telephone,
    d.is_online,
    d.rating,
    COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE THEN c.id END) as deliveries_today,
    COALESCE(SUM(CASE WHEN c.created_at >= CURRENT_DATE THEN c.frais_livraison END), 0) as earnings_today,
    COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN c.id END) as deliveries_week,
    COALESCE(SUM(CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN c.frais_livraison END), 0) as earnings_week
FROM delivery_users d
LEFT JOIN commandes c ON d.telephone = c.livreur_phone AND c.mode = 'livraison' AND c.statut IN ('livree', 'en_livraison')
GROUP BY d.id, d.nom, d.telephone, d.is_online, d.rating;

-- ===============================================
-- 11. POLITIQUES DE SÉCURITÉ (OPTIONNEL)
-- ===============================================

-- Activer RLS sur les tables sensibles
-- ALTER TABLE restaurant_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE delivery_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE restaurant_analytics ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs restaurants
-- CREATE POLICY "Users can view own restaurant data" ON restaurant_users
--     FOR ALL USING (auth.uid()::text = id::text);

-- ===============================================
-- 🎉 SETUP TERMINÉ
-- ===============================================
-- 
-- La base de données est maintenant configurée pour l'application Ionic.
-- 
-- COMPTES DE TEST:
-- - Restaurant: admin@bellvista.com / password123
-- - Livreur: 624123456 / 123456
-- 
-- PROCHAINES ÉTAPES:
-- 1. Supprimer les données mockées des services Angular
-- 2. Implémenter les vraies requêtes Supabase
-- 3. Tester les connexions
-- ===============================================