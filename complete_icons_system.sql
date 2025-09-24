-- ================================================
-- SYSTÈME COMPLET DE GESTION DES ICÔNES
-- Création tables + insertion icônes + triggers
-- ================================================

BEGIN;

-- 1. Table principale des icônes
CREATE TABLE IF NOT EXISTS france_icons (
  id SERIAL PRIMARY KEY,
  emoji VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ajouter colonne icon aux produits
ALTER TABLE france_products
ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT NULL;

-- 3. Ajouter colonne icon aux options de produits
ALTER TABLE france_product_options
ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT NULL;

-- 4. Table de liaison produits <-> icônes
CREATE TABLE IF NOT EXISTS france_product_icons (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES france_products(id) ON DELETE CASCADE,
  icon_id INTEGER REFERENCES france_icons(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES france_restaurants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, icon_id)
);

-- 5. Table de liaison options <-> icônes
CREATE TABLE IF NOT EXISTS france_option_icons (
  id SERIAL PRIMARY KEY,
  option_id INTEGER REFERENCES france_product_options(id) ON DELETE CASCADE,
  icon_id INTEGER REFERENCES france_icons(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES france_restaurants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(option_id, icon_id)
);

-- 6. Nettoyer les éventuelles données existantes
TRUNCATE TABLE france_icons RESTART IDENTITY CASCADE;

-- 7. Insertion des icônes prédéfinies par catégories (CORRIGÉES - SANS DOUBLONS)
INSERT INTO france_icons (emoji, name, category, tags) VALUES

-- PLATS PRINCIPAUX
('🍕', 'Pizza', 'plats', ARRAY['pizza','italien','fromage','pâte']),
('🍔', 'Burger', 'plats', ARRAY['burger','viande','pain','américain']),
('🌭', 'Hot-dog', 'plats', ARRAY['saucisse','pain','moutarde','ketchup']),
('🥙', 'Kebab', 'plats', ARRAY['kebab','pain','viande','sauce']),
('🌮', 'Tacos', 'plats', ARRAY['tacos','mexicain','épicé','tortilla']),
('🌯', 'Burrito', 'plats', ARRAY['burrito','wrap','mexicain','riz']),
('🍗', 'Poulet', 'plats', ARRAY['poulet','volaille','grillé','rôti']),
('🍖', 'Viande', 'plats', ARRAY['viande','boeuf','grillé','barbecue']),
('🥩', 'Steak', 'plats', ARRAY['steak','boeuf','grillé','saignant']),
('🍝', 'Pâtes', 'plats', ARRAY['pâtes','italien','spaghetti','sauce']),
('🍜', 'Ramen', 'plats', ARRAY['ramen','nouilles','japonais','bouillon']),
('🍛', 'Riz curry', 'plats', ARRAY['riz','curry','asiatique','épicé']),
('🥘', 'Plat mijoté', 'plats', ARRAY['ragoût','mijoté','sauce','légumes']),
('🍲', 'Pot-au-feu', 'plats', ARRAY['pot-au-feu','traditionnel','légumes','bouillon']),
('🥟', 'Raviolis', 'plats', ARRAY['raviolis','pâte','farce','asiatique']),
('🍳', 'Oeufs', 'plats', ARRAY['oeufs','plat','petit-déjeuner']),
('🥞', 'Pancakes', 'plats', ARRAY['pancakes','crêpes','sucré']),
('🧆', 'Falafel', 'plats', ARRAY['falafel','végétarien','pois-chiches']),
('🥪', 'Sandwich grillé', 'plats', ARRAY['croque','grillé','fromage']),
('🌶️', 'Plat épicé', 'plats', ARRAY['épicé','piment','relevé']),

-- ACCOMPAGNEMENTS
('🍟', 'Frites', 'accompagnements', ARRAY['frites','pomme-de-terre']),
('🥔', 'Pomme de terre', 'accompagnements', ARRAY['pomme-de-terre','purée']),
('🍚', 'Riz blanc', 'accompagnements', ARRAY['riz','céréale']),
('🥖', 'Pain', 'accompagnements', ARRAY['baguette','croûte']),
('🥨', 'Bretzel', 'accompagnements', ARRAY['bretzel','salé']),
('🧄', 'Ail', 'accompagnements', ARRAY['ail','condiment']),
('🧅', 'Oignon', 'accompagnements', ARRAY['oignon','légume']),
('🥒', 'Cornichons', 'accompagnements', ARRAY['cornichons','aigre']),
('🥬', 'Salade verte', 'accompagnements', ARRAY['légume','frais']),
('🥕', 'Carotte', 'accompagnements', ARRAY['carotte','croquant']),
('🌽', 'Maïs', 'accompagnements', ARRAY['maïs','jaune']),
('🍄', 'Champignon', 'accompagnements', ARRAY['champignon','forestier']),
('🫒', 'Olives', 'accompagnements', ARRAY['olives','méditerranéen']),
('🥜', 'Cacahuètes', 'accompagnements', ARRAY['cacahuètes','apéritif']),
('🌿', 'Herbes', 'accompagnements', ARRAY['herbes','aromates']),

-- SALADES
('🥗', 'Salade composée', 'salades', ARRAY['légumes','santé']),
('🥒', 'Salade concombre', 'salades', ARRAY['concombre','fraîcheur']),
('🍅', 'Salade tomate', 'salades', ARRAY['tomate','été']),
('🥑', 'Salade avocat', 'salades', ARRAY['avocat','crémeux']),
('🫐', 'Salade fruits', 'salades', ARRAY['fruits','vitamines']),
('🧀', 'Salade fromage', 'salades', ARRAY['fromage','calcium']),
('🥓', 'Salade bacon', 'salades', ARRAY['bacon','fumé']),
('🦐', 'Salade crevettes', 'salades', ARRAY['crevettes','iodé']),
('🐟', 'Salade poisson', 'salades', ARRAY['poisson','oméga-3']),
('🇬🇷', 'Salade grecque', 'salades', ARRAY['grecque','feta','olives']),

-- BOISSONS
('🥤', 'Soda', 'boissons', ARRAY['soda','gazeux']),
('🧊', 'Boisson glacée', 'boissons', ARRAY['glacé','été']),
('💧', 'Eau', 'boissons', ARRAY['eau','pure']),
('🧃', 'Jus de fruit', 'boissons', ARRAY['jus','fruit']),
('🍺', 'Bière', 'boissons', ARRAY['bière','houblon']),
('🍷', 'Vin', 'boissons', ARRAY['vin','raisin']),
('🍸', 'Cocktail', 'boissons', ARRAY['cocktail','alcool']),
('☕', 'Café', 'boissons', ARRAY['café','chaud']),
('🍵', 'Thé', 'boissons', ARRAY['thé','infusion']),
('🥛', 'Lait', 'boissons', ARRAY['lait','calcium']),
('🧋', 'Bubble tea', 'boissons', ARRAY['bubble-tea','perles']),
('🍹', 'Cocktail tropical', 'boissons', ARRAY['tropical','exotique']),
('🥥', 'Eau de coco', 'boissons', ARRAY['coco','naturel']),
('🍋', 'Citronnade', 'boissons', ARRAY['citron','rafraîchissant']),
('🍊', 'Jus d''orange', 'boissons', ARRAY['orange','vitamine-c']),
('🍎', 'Jus de pomme', 'boissons', ARRAY['pomme','fruité']),
('🍇', 'Jus de raisin', 'boissons', ARRAY['raisin','antioxydants']),
('🥤', 'Smoothie', 'boissons', ARRAY['smoothie','fruits']),
('🧊', 'Granita', 'boissons', ARRAY['granita','glace']),
('⚡', 'Boisson énergisante', 'boissons', ARRAY['caféine','boost']),

-- DESSERTS
('🍰', 'Gâteau', 'desserts', ARRAY['pâtisserie','sucré']),
('🧁', 'Cupcake', 'desserts', ARRAY['cupcake','muffin']),
('🍪', 'Cookie', 'desserts', ARRAY['biscuit','chocolat']),
('🍩', 'Donut', 'desserts', ARRAY['beignet','sucré']),
('🍫', 'Chocolat', 'desserts', ARRAY['cacao','fondant']),
('🍬', 'Bonbon', 'desserts', ARRAY['bonbon','coloré']),
('🍭', 'Sucette', 'desserts', ARRAY['lollipop','bâton']),
('🍮', 'Flan', 'desserts', ARRAY['flan','caramel']),
('🍯', 'Miel', 'desserts', ARRAY['abeille','sucrant']),
('🥧', 'Tarte', 'desserts', ARRAY['tarte','traditionnel']),
('🍓', 'Fraises', 'desserts', ARRAY['fruit','rouge']),
('🍌', 'Banane', 'desserts', ARRAY['fruit','jaune']),
('🍒', 'Cerises', 'desserts', ARRAY['fruit','noyau']),
('🧇', 'Crêpes', 'desserts', ARRAY['pâte','sucré']),
('🍨', 'Glace', 'desserts', ARRAY['glace','été']),

-- SPÉCIALITÉS
('🍱', 'Spécialité asiatique', 'specialites', ARRAY['bento','exotique']),
('🫔', 'Spécialité mexicaine', 'specialites', ARRAY['mexicain','haricots']),
('🇮🇹', 'Spécialité italienne', 'specialites', ARRAY['italien','tradition']),
('🥐', 'Spécialité française', 'specialites', ARRAY['croissant','tradition']),
('🍠', 'Spécialité africaine', 'specialites', ARRAY['igname','authentique']),
('🍥', 'Spécialité japonaise', 'specialites', ARRAY['kamaboko','umami']),
('🫓', 'Spécialité indienne', 'specialites', ARRAY['naan','curry']),
('🧆', 'Spécialité orientale', 'specialites', ARRAY['mezze','houmous']),
('🥯', 'Spécialité végétarienne', 'specialites', ARRAY['bagel','bio']),
('🌱', 'Spécialité bio', 'specialites', ARRAY['naturel','écologique']),

-- SERVICES & MODES
('🚚', 'Livraison', 'services', ARRAY['domicile','rapide']),
('🏪', 'Sur place', 'services', ARRAY['restaurant','salle']),
('📦', 'À emporter', 'services', ARRAY['takeaway','rapide']),
('💳', 'Paiement carte', 'services', ARRAY['paiement','sécurisé']),
('💰', 'Paiement espèces', 'services', ARRAY['cash','monnaie']),
('⏰', 'Service rapide', 'services', ARRAY['express','efficace']),
('⭐', 'Premium', 'services', ARRAY['qualité','haut-de-gamme']),
('🎁', 'Offre spéciale', 'services', ARRAY['promotion','cadeau']),
('📱', 'Commande mobile', 'services', ARRAY['app','smartphone']),
('🏷️', 'Prix spécial', 'services', ARRAY['tarif','pas-cher']);

-- 8. Index
CREATE INDEX IF NOT EXISTS idx_france_icons_category ON france_icons(category);
CREATE INDEX IF NOT EXISTS idx_france_icons_tags ON france_icons USING GIN(tags);

-- 9. Trigger pour updated_at
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

-- 10. Vérifications finales
SELECT 'france_icons' as table_name,
       COUNT(*) as total_icons,
       COUNT(DISTINCT category) as categories_count,
       COUNT(DISTINCT emoji) as unique_emojis
FROM france_icons;

COMMIT;
