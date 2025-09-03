-- =============================================================================
-- SYSTÈME DE LIVRAISON AUTOMATIQUE FRANCE - PHASE 1 MVP
-- Script SQL pour créer toutes les tables nécessaires
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. TYPES ENUM REQUIS (si pas déjà créés)
-- -----------------------------------------------------------------------------
-- Créer le type product_type_enum s'il n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type_enum') THEN
        CREATE TYPE product_type_enum AS ENUM ('simple', 'modular', 'variant', 'composite');
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1. MODIFICATION TABLE france_delivery_drivers (AJOUTER COLONNES)
-- -----------------------------------------------------------------------------
-- Ajouter colonnes pour géolocalisation et statut en ligne
ALTER TABLE france_delivery_drivers 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(11,8), 
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Index pour optimiser les requêtes géographiques
CREATE INDEX IF NOT EXISTS idx_france_drivers_online ON france_delivery_drivers(is_online);
CREATE INDEX IF NOT EXISTS idx_france_drivers_location ON france_delivery_drivers(current_latitude, current_longitude) WHERE is_online = true;

-- Commentaires
COMMENT ON COLUMN france_delivery_drivers.is_online IS 'Statut en ligne du livreur (disponible pour prendre des commandes)';
COMMENT ON COLUMN france_delivery_drivers.current_latitude IS 'Latitude actuelle du livreur';
COMMENT ON COLUMN france_delivery_drivers.current_longitude IS 'Longitude actuelle du livreur';

-- -----------------------------------------------------------------------------
-- 2. MODIFICATION TABLE france_orders (AJOUTER COLONNES)
-- -----------------------------------------------------------------------------
-- Ajouter colonnes pour tracking livraison (driver_id existe déjà)
ALTER TABLE france_orders 
ADD COLUMN IF NOT EXISTS driver_assignment_status VARCHAR(20) DEFAULT 'none' CHECK (driver_assignment_status IN ('none', 'searching', 'assigned', 'delivered')),
ADD COLUMN IF NOT EXISTS delivery_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assignment_timeout_at TIMESTAMP WITH TIME ZONE;

-- Index pour optimiser les requêtes d'assignation (utiliser driver_id existant)
CREATE INDEX IF NOT EXISTS idx_france_orders_assignment ON france_orders(driver_assignment_status, driver_id);
CREATE INDEX IF NOT EXISTS idx_france_orders_timeout ON france_orders(assignment_timeout_at) WHERE driver_assignment_status = 'searching';

-- Commentaires
COMMENT ON COLUMN france_orders.driver_id IS 'ID du livreur assigné à cette commande (colonne existante réutilisée)';
COMMENT ON COLUMN france_orders.driver_assignment_status IS 'Statut assignation: none|searching|assigned|delivered';
COMMENT ON COLUMN france_orders.delivery_started_at IS 'Timestamp début livraison (quand livreur accepte)';
COMMENT ON COLUMN france_orders.assignment_timeout_at IS 'Timestamp limite pour trouver un livreur';

-- -----------------------------------------------------------------------------
-- 3. NOUVELLE TABLE france_delivery_assignments
-- -----------------------------------------------------------------------------
-- Table pour tracker toutes les tentatives d'assignation
CREATE TABLE IF NOT EXISTS france_delivery_assignments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES france_orders(id) ON DELETE CASCADE,
    driver_id INTEGER NOT NULL REFERENCES france_delivery_drivers(id) ON DELETE CASCADE,
    assignment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (assignment_status IN ('pending', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    response_time_seconds INTEGER,
    
    -- Contraintes
    UNIQUE(order_id, driver_id), -- Un livreur ne peut avoir qu'une assignation par commande
    CHECK (responded_at IS NULL OR responded_at >= created_at)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_france_assignments_order ON france_delivery_assignments(order_id, assignment_status);
CREATE INDEX IF NOT EXISTS idx_france_assignments_driver ON france_delivery_assignments(driver_id, assignment_status);
CREATE INDEX IF NOT EXISTS idx_france_assignments_pending ON france_delivery_assignments(expires_at) WHERE assignment_status = 'pending';

-- Commentaires
COMMENT ON TABLE france_delivery_assignments IS 'Toutes les tentatives d''assignation de commandes aux livreurs';
COMMENT ON COLUMN france_delivery_assignments.assignment_status IS 'pending: en attente, accepted: accepté, rejected: refusé, expired: expiré';
COMMENT ON COLUMN france_delivery_assignments.expires_at IS 'Date limite pour que le livreur réponde';
COMMENT ON COLUMN france_delivery_assignments.response_time_seconds IS 'Temps de réponse du livreur en secondes';

-- -----------------------------------------------------------------------------
-- 4. NOUVELLE TABLE france_delivery_notifications  
-- -----------------------------------------------------------------------------
-- Table pour tracker les notifications envoyées
CREATE TABLE IF NOT EXISTS france_delivery_notifications (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES france_delivery_assignments(id) ON DELETE CASCADE,
    notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN ('assignment_offer', 'assignment_accepted', 'assignment_rejected', 'delivery_started', 'delivery_completed')),
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('driver', 'restaurant', 'customer')),
    recipient_id VARCHAR(50) NOT NULL, -- ID du destinataire (driver_id, restaurant_id, phone_number)
    notification_data JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
    error_message TEXT
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_france_notifications_assignment ON france_delivery_notifications(assignment_id);
CREATE INDEX IF NOT EXISTS idx_france_notifications_recipient ON france_delivery_notifications(recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_france_notifications_status ON france_delivery_notifications(delivery_status, sent_at);

-- Commentaires
COMMENT ON TABLE france_delivery_notifications IS 'Historique de toutes les notifications envoyées pour le système de livraison';

-- -----------------------------------------------------------------------------
-- 5. NOUVELLE TABLE france_driver_locations (HISTORIQUE)
-- -----------------------------------------------------------------------------
-- Table pour historique des positions (analytics futurs)
CREATE TABLE IF NOT EXISTS france_driver_locations (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES france_delivery_drivers(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy_meters INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index partitionné par date pour performance
    CONSTRAINT valid_coordinates CHECK (
        latitude BETWEEN -90 AND 90 AND 
        longitude BETWEEN -180 AND 180
    )
);

-- Index pour optimiser les requêtes géographiques historiques
CREATE INDEX IF NOT EXISTS idx_france_driver_locations_driver_time ON france_driver_locations(driver_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_france_driver_locations_time ON france_driver_locations(recorded_at);

-- Commentaires
COMMENT ON TABLE france_driver_locations IS 'Historique des positions des livreurs pour analytics';

-- -----------------------------------------------------------------------------
-- 6. FONCTIONS UTILITAIRES
-- -----------------------------------------------------------------------------

-- Fonction pour calculer la distance entre 2 points (Haversine)
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DECIMAL, lon1 DECIMAL, 
    lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Rayon de la Terre en km
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    
    a := sin(dLat/2) * sin(dLat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dLon/2) * sin(dLon/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour nettoyer les assignations expirées (à appeler périodiquement)
CREATE OR REPLACE FUNCTION cleanup_expired_assignments() RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE france_delivery_assignments 
    SET assignment_status = 'expired'
    WHERE assignment_status = 'pending' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 7. TRIGGERS AUTOMATIQUES
-- -----------------------------------------------------------------------------

-- Trigger pour mettre à jour last_location_update automatiquement
CREATE OR REPLACE FUNCTION update_driver_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_location_update := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_driver_location
    BEFORE UPDATE OF current_latitude, current_longitude ON france_delivery_drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_location_timestamp();

-- -----------------------------------------------------------------------------
-- 8. VUES UTILES POUR L'APPLICATION
-- -----------------------------------------------------------------------------

-- Vue des livreurs disponibles avec leur dernière position
CREATE OR REPLACE VIEW france_available_drivers AS
SELECT 
    d.*,
    CASE 
        WHEN d.last_location_update > NOW() - INTERVAL '5 minutes' THEN 'recent'
        WHEN d.last_location_update > NOW() - INTERVAL '15 minutes' THEN 'stale' 
        ELSE 'offline'
    END as location_freshness
FROM france_delivery_drivers d
WHERE d.is_active = true 
AND d.is_online = true;

-- Vue des assignations actives avec détails
CREATE OR REPLACE VIEW france_active_assignments AS
SELECT 
    a.*,
    o.order_number,
    o.restaurant_id,
    o.delivery_address,
    o.total_amount,
    d.first_name || ' ' || d.last_name as driver_name,
    d.phone_number as driver_phone,
    r.name as restaurant_name
FROM france_delivery_assignments a
JOIN france_orders o ON a.order_id = o.id
JOIN france_delivery_drivers d ON a.driver_id = d.id  
JOIN france_restaurants r ON o.restaurant_id = r.id
WHERE a.assignment_status IN ('pending', 'accepted');

-- -----------------------------------------------------------------------------
-- SCRIPT COMPLET - PRÊT À EXÉCUTER
-- -----------------------------------------------------------------------------
-- Ce script peut être exécuté en toute sécurité plusieurs fois (IF NOT EXISTS)
-- Il ajoute uniquement les nouvelles colonnes et tables sans modifier l'existant
