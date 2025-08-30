-- Script de création de la table restaurant_delivery_config
-- Système de frais de livraison flexibles

CREATE TABLE IF NOT EXISTS restaurant_delivery_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('fixed', 'distance_based')),
  
  -- Pour montant fixe
  fixed_amount INTEGER DEFAULT 0,
  
  -- Pour calcul par distance
  price_per_km INTEGER DEFAULT 0,
  round_up_distance BOOLEAN DEFAULT true,
  
  -- Paramètres communs
  free_delivery_threshold INTEGER DEFAULT 0,
  max_delivery_radius_km DECIMAL(5,2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_restaurant_delivery_config_restaurant_id ON restaurant_delivery_config(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_delivery_config_active ON restaurant_delivery_config(is_active) WHERE is_active = true;

-- Commentaires pour documentation
COMMENT ON TABLE restaurant_delivery_config IS 'Configuration des frais de livraison par restaurant';
COMMENT ON COLUMN restaurant_delivery_config.delivery_type IS 'Type de calcul: fixed (montant fixe) ou distance_based (par km)';
COMMENT ON COLUMN restaurant_delivery_config.fixed_amount IS 'Montant fixe en GNF pour delivery_type=fixed';
COMMENT ON COLUMN restaurant_delivery_config.price_per_km IS 'Prix par km en GNF pour delivery_type=distance_based';
COMMENT ON COLUMN restaurant_delivery_config.round_up_distance IS 'Arrondir la distance à l''entier supérieur (2.3km -> 3km)';
COMMENT ON COLUMN restaurant_delivery_config.free_delivery_threshold IS 'Montant minimum pour livraison gratuite en GNF';
COMMENT ON COLUMN restaurant_delivery_config.max_delivery_radius_km IS 'Rayon maximum de livraison en km';

-- Exemples de données d'insertion
-- Restaurant avec montant fixe
INSERT INTO restaurant_delivery_config (
  restaurant_id, 
  delivery_type, 
  fixed_amount, 
  free_delivery_threshold, 
  max_delivery_radius_km
) VALUES (
  -- Utiliser un restaurant existant pour test
  'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90', -- Brasserie de Savigny
  'fixed',
  5000,  -- 5000 GNF fixe pour toutes les commandes
  800000, -- Gratuit au-delà de 800k
  25.00
) ON CONFLICT (restaurant_id) DO NOTHING;

-- Script de migration automatique pour tous les restaurants existants
-- Migrer vers le système par distance (conserve le comportement actuel)
INSERT INTO restaurant_delivery_config (
  restaurant_id, 
  delivery_type, 
  price_per_km, 
  round_up_distance,
  free_delivery_threshold,
  max_delivery_radius_km
)
SELECT 
  id,
  'distance_based',
  COALESCE(tarif_km, 3000), -- Default 3000 si NULL
  true,
  COALESCE(seuil_gratuite, 0),
  COALESCE(rayon_livraison_km, 25.00)
FROM restaurants 
WHERE id NOT IN (SELECT restaurant_id FROM restaurant_delivery_config)
ON CONFLICT (restaurant_id) DO NOTHING;