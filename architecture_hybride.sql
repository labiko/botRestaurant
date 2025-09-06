-- ============================================
-- ARCHITECTURE HYBRIDE - CONFIGURATION MULTI-RESTAURANTS  
-- ============================================

BEGIN;

-- ===============================
-- NIVEAU 1: CONFIGURATION RESTAURANT (Macro)
-- ===============================

-- Table des capacités globales par restaurant
CREATE TABLE IF NOT EXISTS france_restaurant_features (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES france_restaurants(id) ON DELETE CASCADE,
  feature_type VARCHAR(50) NOT NULL, 
  is_enabled BOOLEAN DEFAULT true,
  config JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id, feature_type)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_restaurant_features_lookup ON france_restaurant_features(restaurant_id, feature_type, is_enabled);

-- ===============================
-- NIVEAU 2: CONFIGURATION PRODUIT (Micro)
-- ===============================

-- Ajouter les colonnes de workflow aux produits existants
ALTER TABLE france_products 
ADD COLUMN IF NOT EXISTS workflow_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS requires_steps BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS steps_config JSON DEFAULT '{}';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_products_workflow ON france_products(workflow_type, requires_steps) WHERE workflow_type IS NOT NULL;

-- ===============================
-- CONFIGURATION INITIALE PIZZA YOLO
-- ===============================

-- Définir les capacités de Pizza Yolo
INSERT INTO france_restaurant_features (restaurant_id, feature_type, is_enabled, config)
SELECT r.id, 'pizzas', true, '{"has_supplements": true, "offer_1_for_2": true, "sizes": ["JUNIOR", "SENIOR", "MEGA"]}'::json
FROM france_restaurants r WHERE r.slug = 'pizza-yolo-77'
UNION ALL
SELECT r.id, 'composite_menus', true, '{"interactive_selection": true, "max_steps": 5}'::json
FROM france_restaurants r WHERE r.slug = 'pizza-yolo-77'
UNION ALL
SELECT r.id, 'interactive_workflows', true, '{"supported_types": ["pizza_config", "composite_selection", "drink_choice"]}'::json
FROM france_restaurants r WHERE r.slug = 'pizza-yolo-77';

-- ===============================
-- MIGRATION DES PRODUITS EXISTANTS
-- ===============================

-- Configurer MENU ENFANT avec le nouveau système
UPDATE france_products 
SET 
  workflow_type = 'composite_selection',
  requires_steps = true,
  steps_config = '{
    "steps": [
      {"type": "single_choice", "title": "Choisissez votre plat principal", "options": ["Cheeseburger", "Nuggets"]},
      {"type": "single_choice", "title": "Choisissez votre boisson", "options": ["Compote", "Caprisun"]}
    ],
    "final_format": "{main} + Frites + Kinder Surprise + {drink}"
  }'::json
WHERE name = 'MENU ENFANT';

-- Configurer les menus pizzas interactifs existants
UPDATE france_products 
SET 
  workflow_type = 'pizza_menu_config',
  requires_steps = true
WHERE product_type = 'simple' AND (
  name LIKE '%MENU 1%' OR 
  name LIKE '%MENU 2%' OR 
  name LIKE '%MENU 3%' OR 
  name LIKE '%MENU 4%'
);

-- Configurer les pizzas individuelles
UPDATE france_products p
SET 
  workflow_type = 'pizza_config',
  requires_steps = false
FROM france_menu_categories c
WHERE p.category_id = c.id 
  AND c.slug IN ('pizzas-junior', 'pizzas-senior', 'pizzas-mega')
  AND p.product_type = 'modular';

-- ===============================
-- VÉRIFICATIONS
-- ===============================

-- Vérifier les capacités restaurant
SELECT 
  r.name as restaurant,
  rf.feature_type,
  rf.is_enabled,
  rf.config
FROM france_restaurant_features rf
JOIN france_restaurants r ON rf.restaurant_id = r.id
ORDER BY r.name, rf.feature_type;

-- Vérifier les produits configurés
SELECT 
  r.name as restaurant,
  c.name as category,
  p.name as product,
  p.workflow_type,
  p.requires_steps,
  p.steps_config
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE p.workflow_type IS NOT NULL
ORDER BY r.name, c.name, p.name;

COMMIT;