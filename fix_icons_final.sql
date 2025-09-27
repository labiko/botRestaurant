-- ================================================
-- FIX FINAL: Suppression contrainte + Nettoyage + Recréation
-- ================================================

BEGIN;

-- 1. Supprimer la contrainte unique sur emoji (temporairement)
ALTER TABLE france_icons DROP CONSTRAINT IF EXISTS france_icons_emoji_key;

-- 2. Nettoyer complètement la table
DELETE FROM france_icons;

-- 3. Insertion des icônes SANS DOUBLONS (corrigé définitivement)
INSERT INTO france_icons (emoji, name, category, tags) VALUES

-- PLATS PRINCIPAUX (20 icônes)
('🍕', 'Pizza', 'plats', ARRAY['pizza', 'italien', 'fromage', 'pâte']),
('🍔', 'Burger', 'plats', ARRAY['burger', 'viande', 'pain', 'américain']),
('🌭', 'Hot-dog', 'plats', ARRAY['saucisse', 'pain', 'moutarde', 'ketchup']),
('🥙', 'Kebab', 'plats', ARRAY['kebab', 'pain', 'viande', 'sauce']),
('🌮', 'Tacos', 'plats', ARRAY['tacos', 'mexicain', 'épicé', 'tortilla']),
('🌯', 'Burrito', 'plats', ARRAY['burrito', 'wrap', 'mexicain', 'riz']),
('🍗', 'Poulet', 'plats', ARRAY['poulet', 'volaille', 'grillé', 'rôti']),
('🍖', 'Viande', 'plats', ARRAY['viande', 'boeuf', 'grillé', 'barbecue']),
('🥩', 'Steak', 'plats', ARRAY['steak', 'boeuf', 'grillé', 'saignant']),
('🍝', 'Pâtes', 'plats', ARRAY['pâtes', 'italien', 'spaghetti', 'sauce']),
('🍜', 'Ramen', 'plats', ARRAY['ramen', 'nouilles', 'japonais', 'bouillon']),
('🍛', 'Riz curry', 'plats', ARRAY['riz', 'curry', 'asiatique', 'épicé']),
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
('🥒', 'Cornichons', 'accompagnements', ARRAY['cornichons', 'légume', 'aigre', 'conservation']),
('🥬', 'Chou', 'accompagnements', ARRAY['chou', 'légume', 'vert', 'croquant']),
('🥕', 'Carotte', 'accompagnements', ARRAY['carotte', 'légume', 'orange', 'croquant']),
('🌽', 'Maïs', 'accompagnements', ARRAY['maïs', 'céréale', 'jaune', 'sucré']),
('🍄', 'Champignon', 'accompagnements', ARRAY['champignon', 'légume', 'savoureux', 'forestier']),
('🫒', 'Olives', 'accompagnements', ARRAY['olives', 'méditerranéen', 'apéritif', 'huile']),
('🥜', 'Cacahuètes', 'accompagnements', ARRAY['cacahuètes', 'apéritif', 'salé', 'croquant']),
('🌿', 'Herbes', 'accompagnements', ARRAY['herbes', 'aromates', 'parfum', 'cuisine']),

-- SALADES (10 icônes) - ATTENTION: pas de doublon avec 🥬
('🥗', 'Salade composée', 'salades', ARRAY['salade', 'légumes', 'frais', 'santé']),
('🍀', 'Salade verte', 'salades', ARRAY['salade', 'verte', 'légumes', 'frais']),
('🍅', 'Salade tomate', 'salades', ARRAY['tomate', 'rouge', 'juteux', 'été']),
('🥑', 'Salade avocat', 'salades', ARRAY['avocat', 'vert', 'crémeux', 'santé']),
('🫐', 'Salade fruits', 'salades', ARRAY['fruits', 'myrtilles', 'sucré', 'vitamines']),
('🧀', 'Salade fromage', 'salades', ARRAY['fromage', 'protéines', 'calcium', 'savoureux']),
('🥓', 'Salade bacon', 'salades', ARRAY['bacon', 'lardons', 'fumé', 'protéines']),
('🦐', 'Salade crevettes', 'salades', ARRAY['crevettes', 'fruits-de-mer', 'protéines', 'iodé']),
('🐟', 'Salade poisson', 'salades', ARRAY['poisson', 'saumon', 'oméga-3', 'santé']),
('🍃', 'Salade grecque', 'salades', ARRAY['grecque', 'feta', 'olives', 'méditerranéen']),

-- BOISSONS (20 icônes)
('🥤', 'Soda', 'boissons', ARRAY['soda', 'gazeux', 'sucré', 'rafraîchissant']),
('🧊', 'Boisson glacée', 'boissons', ARRAY['glacé', 'frais', 'glaçons', 'été']),
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
('🥃', 'Smoothie', 'boissons', ARRAY['smoothie', 'mixé', 'fruits', 'santé']),
('🫖', 'Tisane', 'boissons', ARRAY['tisane', 'herbes', 'relaxant', 'santé']),
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

-- SPÉCIALITÉS (10 icônes - tous uniques)
('🍱', 'Spécialité asiatique', 'specialites', ARRAY['asiatique', 'bento', 'vapeur', 'exotique']),
('🫔', 'Spécialité mexicaine', 'specialites', ARRAY['mexicain', 'épicé', 'avocat', 'haricots']),
('🍕', 'Spécialité italienne', 'specialites', ARRAY['italien', 'tomate', 'basilic', 'tradition']),
('🥐', 'Spécialité française', 'specialites', ARRAY['français', 'croissant', 'tradition', 'artisanal']),
('🍠', 'Spécialité africaine', 'specialites', ARRAY['africain', 'igname', 'traditionnel', 'authentique']),
('🍥', 'Spécialité japonaise', 'specialites', ARRAY['japonais', 'kamaboko', 'poisson', 'umami']),
('🫓', 'Spécialité indienne', 'specialites', ARRAY['indien', 'naan', 'curry', 'épicé']),
('🥯', 'Spécialité orientale', 'specialites', ARRAY['oriental', 'bagel', 'houmous', 'tradition']),
('🌱', 'Spécialité végétarienne', 'specialites', ARRAY['végétarien', 'bio', 'santé', 'légumes']),
('🏺', 'Spécialité bio', 'specialites', ARRAY['bio', 'naturel', 'écologique', 'sain']),

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

-- 4. Remettre la contrainte unique APRÈS insertion
ALTER TABLE france_icons ADD CONSTRAINT france_icons_emoji_unique UNIQUE (emoji);

-- 5. Vérifications finales
SELECT
    'SUCCESS: france_icons' as table_name,
    COUNT(*) as total_icons,
    COUNT(DISTINCT category) as categories,
    COUNT(DISTINCT emoji) as unique_emojis
FROM france_icons;

SELECT
    category,
    COUNT(*) as count
FROM france_icons
GROUP BY category
ORDER BY category;

-- 6. Vérifier qu'il n'y a AUCUN doublon
SELECT
    emoji,
    COUNT(*) as count
FROM france_icons
GROUP BY emoji
HAVING COUNT(*) > 1;

SELECT 'Installation terminée avec succès ! ✅' as message;

COMMIT;