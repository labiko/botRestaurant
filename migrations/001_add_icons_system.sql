-- ================================================
-- PHASE 1: SYSTÈME DE GESTION DES ICÔNES
-- Tables france_icons et liaisons pour gestion complète
-- ================================================

BEGIN;

-- 1. Table principale des icônes (100+ icônes prédéfinies)
CREATE TABLE IF NOT EXISTS france_icons (
  id SERIAL PRIMARY KEY,
  emoji VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[], -- Tags pour recherche intelligente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ajouter colonne icon aux produits
ALTER TABLE france_products
ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT NULL;

-- 3. Ajouter colonne icon aux options de produits
ALTER TABLE france_product_options
ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT NULL;

-- 4. Table de liaison produits <-> icônes (historique usage)
CREATE TABLE IF NOT EXISTS france_product_icons (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES france_products(id) ON DELETE CASCADE,
  icon_id INTEGER REFERENCES france_icons(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES france_restaurants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, icon_id)
);

-- 5. Table de liaison options <-> icônes (historique usage)
CREATE TABLE IF NOT EXISTS france_option_icons (
  id SERIAL PRIMARY KEY,
  option_id INTEGER REFERENCES france_product_options(id) ON DELETE CASCADE,
  icon_id INTEGER REFERENCES france_icons(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES france_restaurants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(option_id, icon_id)
);

-- 6. Insertion des 100+ icônes prédéfinies par catégories
INSERT INTO france_icons (emoji, name, category, tags) VALUES

-- PLATS PRINCIPAUX (20 icônes)
('🍕', 'Pizza', 'plats', ARRAY['pizza', 'italien', 'fromage', 'pâte']),
('🍔', 'Burger', 'plats', ARRAY['burger', 'viande', 'pain', 'américain']),
('🌭', 'Hot-dog', 'plats', ARRAY['saucisse', 'pain', 'moutarde', 'ketchup']),
('🥙', 'Sandwich', 'plats', ARRAY['sandwich', 'pain', 'garniture', 'wrap']),
('🌮', 'Tacos', 'plats', ARRAY['tacos', 'mexicain', 'épicé', 'tortilla']),
('🌯', 'Burrito', 'plats', ARRAY['burrito', 'wrap', 'mexicain', 'riz']),
('🍗', 'Poulet', 'plats', ARRAY['poulet', 'volaille', 'grillé', 'rôti']),
('🍖', 'Viande', 'plats', ARRAY['viande', 'boeuf', 'grillé', 'barbecue']),
('🥩', 'Steak', 'plats', ARRAY['steak', 'boeuf', 'grillé', 'saignant']),
('🍝', 'Pâtes', 'plats', ARRAY['pâtes', 'italien', 'spaghetti', 'sauce']),
('🍜', 'Soupe', 'plats', ARRAY['soupe', 'bouillon', 'chaud', 'liquide']),
('🍛', 'Riz', 'plats', ARRAY['riz', 'céréale', 'accompagnement', 'asiatique']),
('🥘', 'Plat mijoté', 'plats', ARRAY['ragoût', 'mijoté', 'sauce', 'légumes']),
('🍲', 'Pot-au-feu', 'plats', ARRAY['pot-au-feu', 'traditionnel', 'légumes', 'bouillon']),
('🥟', 'Raviolis', 'plats', ARRAY['raviolis', 'pâte', 'farce', 'asiatique']),
('🍳', 'Oeufs', 'plats', ARRAY['oeufs', 'brouillés', 'plat', 'petit-déjeuner']),
('🥞', 'Pancakes', 'plats', ARRAY['pancakes', 'crêpes', 'sucré', 'petit-déjeuner']),
('🧆', 'Falafel', 'plats', ARRAY['falafel', 'végétarien', 'pois-chiches', 'oriental']),
('🥪', 'Sandwich grillé', 'plats', ARRAY['croque', 'grillé', 'chaud', 'fromage']),
('🌶️', 'Plat épicé', 'plats', ARRAY['épicé', 'piment', 'fort', 'relevé']),

-- ACCOMPAGNEMENTS (15 icônes)
('🍟', 'Frites', 'accompagnements', ARRAY['frites', 'pomme-de-terre', 'croustillant', 'salé']),
('🥔', 'Pomme de terre', 'accompagnements', ARRAY['pomme-de-terre', 'légume', 'féculent', 'purée']),
('🍚', 'Riz blanc', 'accompagnements', ARRAY['riz', 'blanc', 'nature', 'céréale']),
('🥖', 'Pain', 'accompagnements', ARRAY['pain', 'baguette', 'français', 'croûte']),
('🥨', 'Bretzel', 'accompagnements', ARRAY['bretzel', 'salé', 'allemand', 'apéritif']),
('🧄', 'Ail', 'accompagnements', ARRAY['ail', 'condiment', 'parfumé', 'cuisine']),
('🧅', 'Oignon', 'accompagnements', ARRAY['oignon', 'légume', 'arôme', 'cuisine']),
('🥒', 'Concombre', 'accompagnements', ARRAY['concombre', 'légume', 'frais', 'croquant']),
('🥬', 'Salade verte', 'accompagnements', ARRAY['salade', 'légume', 'vert', 'frais']),
('🥕', 'Carotte', 'accompagnements', ARRAY['carotte', 'légume', 'orange', 'croquant']),
('🌽', 'Maïs', 'accompagnements', ARRAY['maïs', 'céréale', 'jaune', 'sucré']),
('🍄', 'Champignon', 'accompagnements', ARRAY['champignon', 'légume', 'savoureux', 'forestier']),
('🫒', 'Olives', 'accompagnements', ARRAY['olives', 'méditerranéen', 'apéritif', 'huile']),
('🥜', 'Cacahuètes', 'accompagnements', ARRAY['cacahuètes', 'apéritif', 'salé', 'croquant']),
('🌿', 'Herbes', 'accompagnements', ARRAY['herbes', 'aromates', 'parfum', 'cuisine']),

-- SALADES (10 icônes)
('🥗', 'Salade', 'salades', ARRAY['salade', 'légumes', 'frais', 'santé']),
('🥙', 'Salade wrap', 'salades', ARRAY['wrap', 'salade', 'tortilla', 'léger']),
('🍅', 'Salade tomate', 'salades', ARRAY['tomate', 'rouge', 'juteux', 'été']),
('🥑', 'Salade avocat', 'salades', ARRAY['avocat', 'vert', 'crémeux', 'santé']),
('🫐', 'Salade fruits', 'salades', ARRAY['fruits', 'myrtilles', 'sucré', 'vitamines']),
('🥒', 'Salade grecque', 'salades', ARRAY['grecque', 'feta', 'olives', 'méditerranéen']),
('🧀', 'Salade fromage', 'salades', ARRAY['fromage', 'protéines', 'calcium', 'savoureux']),
('🥓', 'Salade bacon', 'salades', ARRAY['bacon', 'lardons', 'fumé', 'protéines']),
('🦐', 'Salade crevettes', 'salades', ARRAY['crevettes', 'fruits-de-mer', 'protéines', 'iodé']),
('🐟', 'Salade poisson', 'salades', ARRAY['poisson', 'saumon', 'oméga-3', 'santé']),

-- BOISSONS (20 icônes)
('🥤', 'Soda', 'boissons', ARRAY['soda', 'gazeux', 'sucré', 'rafraîchissant']),
('🧊', 'Boisson fraîche', 'boissons', ARRAY['glacé', 'frais', 'glaçons', 'été']),
('💧', 'Eau', 'boissons', ARRAY['eau', 'hydratation', 'nature', 'pure']),
('🧃', 'Jus de fruit', 'boissons', ARRAY['jus', 'fruit', 'vitamine', 'naturel']),
('🍺', 'Bière', 'boissons', ARRAY['bière', 'alcool', 'houblon', 'mousse']),
('🍷', 'Vin', 'boissons', ARRAY['vin', 'alcool', 'raisin', 'rouge']),
('🍸', 'Cocktail', 'boissons', ARRAY['cocktail', 'mixte', 'alcool', 'festif']),
('☕', 'Café', 'boissons', ARRAY['café', 'caféine', 'chaud', 'réveil']),
('🍵', 'Thé', 'boissons', ARRAY['thé', 'infusion', 'chaud', 'relaxant']),
('🥛', 'Lait', 'boissons', ARRAY['lait', 'calcium', 'blanc', 'protéines']),
('🧋', 'Bubble tea', 'boissons', ARRAY['bubble-tea', 'perles', 'asiatique', 'tendance']),
('🍹', 'Cocktail tropical', 'boissons', ARRAY['tropical', 'exotique', 'parasol', 'vacances']),
('🥥', 'Eau de coco', 'boissons', ARRAY['coco', 'tropical', 'naturel', 'électrolytes']),
('🍋', 'Citronnade', 'boissons', ARRAY['citron', 'acidulé', 'rafraîchissant', 'vitamine-c']),
('🍊', 'Jus d''orange', 'boissons', ARRAY['orange', 'vitamine-c', 'matin', 'énergisant']),
('🍎', 'Jus de pomme', 'boissons', ARRAY['pomme', 'doux', 'naturel', 'fruité']),
('🍇', 'Jus de raisin', 'boissons', ARRAY['raisin', 'sucré', 'antioxydants', 'pourpre']),
('🥤', 'Smoothie', 'boissons', ARRAY['smoothie', 'mixé', 'fruits', 'santé']),
('🧊', 'Granita', 'boissons', ARRAY['granita', 'glace-pilée', 'italien', 'été']),
('💨', 'Boisson énergisante', 'boissons', ARRAY['énergisant', 'caféine', 'sport', 'boost']),

-- DESSERTS (15 icônes)
('🍰', 'Gâteau', 'desserts', ARRAY['gâteau', 'sucré', 'anniversaire', 'pâtisserie']),
('🧁', 'Cupcake', 'desserts', ARRAY['cupcake', 'muffin', 'glaçage', 'individuel']),
('🍪', 'Cookie', 'desserts', ARRAY['cookie', 'biscuit', 'chocolat', 'croquant']),
('🍩', 'Donut', 'desserts', ARRAY['donut', 'beignet', 'sucré', 'trou']),
('🍫', 'Chocolat', 'desserts', ARRAY['chocolat', 'cacao', 'fondant', 'plaisir']),
('🍬', 'Bonbon', 'desserts', ARRAY['bonbon', 'sucré', 'coloré', 'enfant']),
('🍭', 'Sucette', 'desserts', ARRAY['sucette', 'lollipop', 'bâton', 'sucré']),
('🍮', 'Flan', 'desserts', ARRAY['flan', 'crème', 'caramel', 'onctueux']),
('🍯', 'Miel', 'desserts', ARRAY['miel', 'abeille', 'naturel', 'sucrant']),
('🥧', 'Tarte', 'desserts', ARRAY['tarte', 'pâte', 'fruits', 'traditionnel']),
('🍓', 'Fraises', 'desserts', ARRAY['fraise', 'fruit', 'rouge', 'sucré']),
('🍌', 'Banane', 'desserts', ARRAY['banane', 'fruit', 'potassium', 'jaune']),
('🍒', 'Cerises', 'desserts', ARRAY['cerise', 'fruit', 'rouge', 'noyau']),
('🥞', 'Crêpes', 'desserts', ARRAY['crêpes', 'pâte', 'sucré', 'français']),
('🍨', 'Glace', 'desserts', ARRAY['glace', 'froid', 'crème', 'été']),

-- SPÉCIALITÉS (10 icônes)
('🥟', 'Spécialité asiatique', 'specialites', ARRAY['asiatique', 'dim-sum', 'vapeur', 'exotique']),
('🌮', 'Spécialité mexicaine', 'specialites', ARRAY['mexicain', 'épicé', 'avocat', 'haricots']),
('🍕', 'Spécialité italienne', 'specialites', ARRAY['italien', 'tomate', 'basilic', 'tradition']),
('🥖', 'Spécialité française', 'specialites', ARRAY['français', 'terroir', 'tradition', 'artisanal']),
('🍛', 'Spécialité africaine', 'specialites', ARRAY['africain', 'épices', 'traditionnel', 'authentique']),
('🍜', 'Spécialité japonaise', 'specialites', ARRAY['japonais', 'ramen', 'miso', 'umami']),
('🫓', 'Spécialité indienne', 'specialites', ARRAY['indien', 'pain', 'curry', 'épicé']),
('🥙', 'Spécialité orientale', 'specialites', ARRAY['oriental', 'mezze', 'houmous', 'pita']),
('🧆', 'Spécialité végétarienne', 'specialites', ARRAY['végétarien', 'légumes', 'santé', 'bio']),
('🌿', 'Spécialité bio', 'specialites', ARRAY['bio', 'naturel', 'écologique', 'sain']),

-- SERVICES & MODES (10 icônes)
('🚚', 'Livraison', 'services', ARRAY['livraison', 'transport', 'domicile', 'rapide']),
('🏪', 'Sur place', 'services', ARRAY['sur-place', 'restaurant', 'salle', 'service']),
('📦', 'À emporter', 'services', ARRAY['emporter', 'takeaway', 'emballage', 'rapide']),
('💳', 'Paiement carte', 'services', ARRAY['carte', 'paiement', 'électronique', 'sécurisé']),
('💰', 'Paiement espèces', 'services', ARRAY['espèces', 'cash', 'liquide', 'monnaie']),
('⏰', 'Service rapide', 'services', ARRAY['rapide', 'express', 'temps', 'efficace']),
('⭐', 'Premium', 'services', ARRAY['premium', 'qualité', 'excellence', 'haut-de-gamme']),
('🎁', 'Offre spéciale', 'services', ARRAY['offre', 'promotion', 'cadeau', 'réduction']),
('📱', 'Commande mobile', 'services', ARRAY['mobile', 'app', 'smartphone', 'moderne']),
('🏷️', 'Prix spécial', 'services', ARRAY['prix', 'tarif', 'économique', 'pas-cher']);

-- 7. Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_france_icons_category ON france_icons(category);
CREATE INDEX IF NOT EXISTS idx_france_icons_tags ON france_icons USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_france_product_icons_restaurant ON france_product_icons(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_france_option_icons_restaurant ON france_option_icons(restaurant_id);

-- 8. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_france_icons_updated_at
    BEFORE UPDATE ON france_icons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Vérifications finales
SELECT
    'france_icons' as table_name,
    COUNT(*) as total_icons,
    COUNT(DISTINCT category) as categories_count
FROM france_icons;

SELECT
    category,
    COUNT(*) as icons_per_category
FROM france_icons
GROUP BY category
ORDER BY category;

COMMIT;