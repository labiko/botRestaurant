-- ÉTAPE 1 : Création table restaurant_categories (SANS impact)

-- Nouvelle table restaurant_categories
CREATE TABLE restaurant_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_key VARCHAR(50) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  ordre INTEGER NOT NULL DEFAULT 999,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(restaurant_id, category_key),
  UNIQUE(restaurant_id, ordre)
);

-- Index pour performances
CREATE INDEX idx_restaurant_categories_resto ON restaurant_categories(restaurant_id, active, ordre);