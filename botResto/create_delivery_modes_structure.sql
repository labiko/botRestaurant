-- STRUCTURE MANQUANTE : Modes de livraison paramétrables par restaurant

-- Table pour définir les modes disponibles par restaurant
CREATE TABLE public.france_restaurant_service_modes (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES france_restaurants(id),
  service_mode VARCHAR(50) NOT NULL CHECK (service_mode IN ('sur_place', 'a_emporter', 'livraison')),
  is_enabled BOOLEAN DEFAULT true,
  display_name VARCHAR(100) NOT NULL, -- "Sur place", "À emporter", "Livraison"
  description TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Configuration spécifique par mode
  config JSONB DEFAULT '{}', -- Ex: horaires spécifiques, conditions particulières
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Contrainte : un seul enregistrement par restaurant + mode
  UNIQUE(restaurant_id, service_mode)
);

-- Index pour performance
CREATE INDEX idx_restaurant_service_modes_restaurant_id ON france_restaurant_service_modes(restaurant_id);
CREATE INDEX idx_restaurant_service_modes_enabled ON france_restaurant_service_modes(restaurant_id, is_enabled);

-- Données par défaut : Tous les modes activés pour tous les restaurants existants
INSERT INTO france_restaurant_service_modes (restaurant_id, service_mode, display_name, display_order)
SELECT 
  id as restaurant_id,
  'sur_place' as service_mode,
  'Sur place' as display_name,
  1 as display_order
FROM france_restaurants
UNION ALL
SELECT 
  id as restaurant_id,
  'a_emporter' as service_mode,
  'À emporter' as display_name,
  2 as display_order
FROM france_restaurants
UNION ALL
SELECT 
  id as restaurant_id,
  'livraison' as service_mode,
  'Livraison' as display_name,
  3 as display_order
FROM france_restaurants;

-- Vue pour faciliter les requêtes
CREATE VIEW v_restaurant_available_modes AS
SELECT 
  r.id as restaurant_id,
  r.name as restaurant_name,
  rsm.service_mode,
  rsm.display_name,
  rsm.is_enabled,
  rsm.display_order,
  rsm.config
FROM france_restaurants r
LEFT JOIN france_restaurant_service_modes rsm ON r.id = rsm.restaurant_id
WHERE r.is_active = true
  AND (rsm.is_enabled = true OR rsm.is_enabled IS NULL)
ORDER BY r.id, rsm.display_order;