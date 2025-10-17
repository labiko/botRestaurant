-- ================================================
-- SOLUTION RAPIDE - 50 icônes sans doublons
-- ================================================

BEGIN;

-- Tables
CREATE TABLE IF NOT EXISTS france_icons (
  id SERIAL PRIMARY KEY,
  emoji VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nettoyer
DELETE FROM france_icons;

-- 50 icônes SANS DOUBLONS - vérifiées une par une
INSERT INTO france_icons (emoji, name, category, tags) VALUES

-- PLATS (15)
('🍕', 'Pizza', 'plats', ARRAY['pizza', 'italien']),
('🍔', 'Burger', 'plats', ARRAY['burger', 'viande']),
('🌭', 'Hot-dog', 'plats', ARRAY['saucisse', 'pain']),
('🥙', 'Kebab', 'plats', ARRAY['kebab', 'viande']),
('🌮', 'Tacos', 'plats', ARRAY['tacos', 'mexicain']),
('🌯', 'Wrap', 'plats', ARRAY['wrap', 'tortilla']),
('🍗', 'Poulet', 'plats', ARRAY['poulet', 'volaille']),
('🍖', 'Viande', 'plats', ARRAY['viande', 'boeuf']),
('🥩', 'Steak', 'plats', ARRAY['steak', 'grillé']),
('🍝', 'Pâtes', 'plats', ARRAY['pâtes', 'italien']),
('🍜', 'Ramen', 'plats', ARRAY['ramen', 'japonais']),
('🍛', 'Riz curry', 'plats', ARRAY['riz', 'curry']),
('🥘', 'Plat mijoté', 'plats', ARRAY['mijoté', 'sauce']),
('🍳', 'Oeufs', 'plats', ARRAY['oeufs', 'petit-déjeuner']),
('🧆', 'Falafel', 'plats', ARRAY['falafel', 'végétarien']),

-- ACCOMPAGNEMENTS (10)
('🍟', 'Frites', 'accompagnements', ARRAY['frites', 'pomme-de-terre']),
('🥔', 'Pomme de terre', 'accompagnements', ARRAY['pomme-de-terre', 'légume']),
('🍚', 'Riz blanc', 'accompagnements', ARRAY['riz', 'blanc']),
('🥖', 'Pain', 'accompagnements', ARRAY['pain', 'baguette']),
('🧄', 'Ail', 'accompagnements', ARRAY['ail', 'condiment']),
('🧅', 'Oignon', 'accompagnements', ARRAY['oignon', 'légume']),
('🥒', 'Cornichons', 'accompagnements', ARRAY['cornichons', 'aigre']),
('🥕', 'Carotte', 'accompagnements', ARRAY['carotte', 'orange']),
('🌽', 'Maïs', 'accompagnements', ARRAY['maïs', 'jaune']),
('🍄', 'Champignon', 'accompagnements', ARRAY['champignon', 'forestier']),

-- BOISSONS (15)
('🥤', 'Soda', 'boissons', ARRAY['soda', 'gazeux']),
('💧', 'Eau', 'boissons', ARRAY['eau', 'pure']),
('🧃', 'Jus', 'boissons', ARRAY['jus', 'fruit']),
('🍺', 'Bière', 'boissons', ARRAY['bière', 'alcool']),
('🍷', 'Vin', 'boissons', ARRAY['vin', 'rouge']),
('☕', 'Café', 'boissons', ARRAY['café', 'chaud']),
('🍵', 'Thé', 'boissons', ARRAY['thé', 'infusion']),
('🥛', 'Lait', 'boissons', ARRAY['lait', 'blanc']),
('🧋', 'Bubble tea', 'boissons', ARRAY['bubble-tea', 'asiatique']),
('🍹', 'Cocktail', 'boissons', ARRAY['cocktail', 'tropical']),
('🥥', 'Eau de coco', 'boissons', ARRAY['coco', 'tropical']),
('🍋', 'Citronnade', 'boissons', ARRAY['citron', 'acidulé']),
('🍊', 'Jus orange', 'boissons', ARRAY['orange', 'vitamine']),
('🍎', 'Jus pomme', 'boissons', ARRAY['pomme', 'doux']),
('🍇', 'Jus raisin', 'boissons', ARRAY['raisin', 'sucré']),

-- DESSERTS (10)
('🍰', 'Gâteau', 'desserts', ARRAY['gâteau', 'sucré']),
('🧁', 'Cupcake', 'desserts', ARRAY['cupcake', 'individuel']),
('🍪', 'Cookie', 'desserts', ARRAY['cookie', 'chocolat']),
('🍩', 'Donut', 'desserts', ARRAY['donut', 'beignet']),
('🍫', 'Chocolat', 'desserts', ARRAY['chocolat', 'cacao']),
('🍬', 'Bonbon', 'desserts', ARRAY['bonbon', 'coloré']),
('🍭', 'Sucette', 'desserts', ARRAY['sucette', 'bâton']),
('🍨', 'Glace', 'desserts', ARRAY['glace', 'froid']),
('🥧', 'Tarte', 'desserts', ARRAY['tarte', 'fruits']),
('🧇', 'Gaufres', 'desserts', ARRAY['gaufres', 'croustillant']);

-- Index
CREATE INDEX idx_france_icons_category ON france_icons(category);

-- Stats
SELECT COUNT(*) as total_icons, COUNT(DISTINCT emoji) as unique_emojis FROM france_icons;

SELECT '✅ TERMINÉ - Interface opérationnelle !' as status;

COMMIT;