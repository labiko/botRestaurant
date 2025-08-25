-- ===============================================
-- 🏗️ SETUP DATABASE SIMPLE - APPLICATION RESTAURANT IONIC
-- ===============================================
-- Version simplifiée pour éviter les problèmes UUID/INTEGER

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
-- 3. INSERTION MANUELLE DES UTILISATEURS TEST
-- ===============================================

-- Insérer d'abord les comptes livreurs (plus simples)
INSERT INTO delivery_users (telephone, nom, code_acces, status, rating, total_deliveries) 
VALUES 
('624123456', 'Mamadou Diallo', '123456', 'actif', 4.8, 245),
('628987654', 'Aïcha Barry', '654321', 'actif', 4.6, 189),
('611555333', 'Ibrahim Camara', '789123', 'actif', 4.9, 312)
ON CONFLICT (telephone) DO NOTHING;

-- ===============================================
-- 4. INSTRUCTIONS POUR LES COMPTES RESTAURANTS
-- ===============================================

-- ÉTAPE MANUELLE : Récupérer les UUIDs des restaurants
-- Exécuter cette requête pour voir les restaurants disponibles :
-- SELECT id, nom FROM restaurants ORDER BY created_at LIMIT 3;

-- Puis remplacer les UUIDs ci-dessous par les vrais UUIDs de vos restaurants
-- et exécuter les INSERT un par un :

/*
-- Exemple (remplacer les UUIDs par les vrais) :
INSERT INTO restaurant_users (restaurant_id, email, password_hash, nom, role) 
VALUES 
('REMPLACER-PAR-UUID-RESTAURANT-1', 'admin@bellvista.com', 'demo123', 'Admin Bella Vista', 'admin');

INSERT INTO restaurant_users (restaurant_id, email, password_hash, nom, role) 
VALUES 
('REMPLACER-PAR-UUID-RESTAURANT-2', 'admin@chezfatou.com', 'demo123', 'Admin Chez Fatou', 'admin');

INSERT INTO restaurant_users (restaurant_id, email, password_hash, nom, role) 
VALUES 
('REMPLACER-PAR-UUID-RESTAURANT-3', 'admin@lepalmier.com', 'demo123', 'Admin Le Palmier', 'admin');
*/

-- ===============================================
-- 5. FONCTIONS UTILITAIRES
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

-- ===============================================
-- 🎯 INSTRUCTIONS FINALES
-- ===============================================

/*
ÉTAPES À SUIVRE :

1. Exécuter ce script complet
2. Récupérer les UUIDs de vos restaurants avec :
   SELECT id, nom FROM restaurants ORDER BY created_at LIMIT 3;

3. Créer manuellement les comptes restaurant en remplaçant les UUIDs :
   INSERT INTO restaurant_users (restaurant_id, email, password_hash, nom, role) 
   VALUES ('UUID-REEL-ICI', 'admin@restaurant1.com', 'demo123', 'Admin Restaurant', 'admin');

4. Tester les connexions avec :
   - Restaurant: admin@restaurant1.com + n'importe quel mot de passe
   - Livreur: 624123456 + 123456

*/

-- ===============================================
-- ✅ SETUP SIMPLE TERMINÉ
-- ===============================================