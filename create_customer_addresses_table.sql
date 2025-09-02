-- ========================================
-- TABLE FRANCE_CUSTOMER_ADDRESSES
-- ========================================
-- Historique des adresses de livraison par client

CREATE TABLE IF NOT EXISTS france_customer_addresses (
    id BIGSERIAL PRIMARY KEY,
    phone_number VARCHAR(30) NOT NULL, -- Format: 33620951645@c.us
    address_label VARCHAR(100) NOT NULL, -- "Maison", "Bureau", "Chez Paul", etc.
    full_address TEXT NOT NULL, -- Adresse complète formatée par Google
    google_place_id VARCHAR(255), -- ID unique Google Places pour réutilisation
    latitude DECIMAL(10,8), -- Coordonnées pour calculs de distance
    longitude DECIMAL(11,8),
    is_default BOOLEAN DEFAULT false, -- Adresse par défaut du client
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_france_customer_addresses_phone ON france_customer_addresses(phone_number);
CREATE INDEX IF NOT EXISTS idx_france_customer_addresses_default ON france_customer_addresses(phone_number, is_default) WHERE is_default = true;

-- Contrainte pour s'assurer qu'il n'y a qu'une seule adresse par défaut par client
CREATE UNIQUE INDEX IF NOT EXISTS idx_france_customer_addresses_unique_default ON france_customer_addresses(phone_number) WHERE is_default = true;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_france_customer_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS trigger_update_france_customer_addresses_updated_at ON france_customer_addresses;
CREATE TRIGGER trigger_update_france_customer_addresses_updated_at
    BEFORE UPDATE ON france_customer_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_france_customer_addresses_updated_at();

-- ========================================
-- MODIFICATION TABLE FRANCE_ORDERS
-- ========================================
-- Ajouter les colonnes pour l'adresse de livraison

ALTER TABLE france_orders 
ADD COLUMN IF NOT EXISTS delivery_address_id BIGINT REFERENCES france_customer_addresses(id),
ADD COLUMN IF NOT EXISTS delivery_address TEXT; -- Copie de l'adresse pour historique

-- Commentaires pour documentation
COMMENT ON TABLE france_customer_addresses IS 'Historique des adresses de livraison des clients WhatsApp';
COMMENT ON COLUMN france_customer_addresses.phone_number IS 'Numéro de téléphone au format WhatsApp (ex: 33620951645@c.us)';
COMMENT ON COLUMN france_customer_addresses.address_label IS 'Nom donné à l''adresse par le client (ex: Maison, Bureau)';
COMMENT ON COLUMN france_customer_addresses.full_address IS 'Adresse complète formatée par Google Places API';
COMMENT ON COLUMN france_customer_addresses.google_place_id IS 'Identifiant unique Google Places pour réutilisation cache';
COMMENT ON COLUMN france_customer_addresses.is_default IS 'Adresse utilisée par défaut pour ce client';

COMMENT ON COLUMN france_orders.delivery_address_id IS 'Référence vers l''adresse utilisée pour cette commande';
COMMENT ON COLUMN france_orders.delivery_address IS 'Copie de l''adresse complète pour historique (même si l''adresse client est supprimée)';