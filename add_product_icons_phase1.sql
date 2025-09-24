-- ================================================
-- PHASE 1 - AJOUT COLONNE ICON POUR PRODUITS
-- ================================================
-- Migration SQL pour ajouter des icônes aux produits individuels
-- Préserve 100% le comportement existant (fallback sur catégorie)

BEGIN;

-- Ajouter colonne icon à france_products
ALTER TABLE france_products
ADD COLUMN icon VARCHAR(10) DEFAULT NULL;

-- Exemples d'icônes par défaut selon catégorie (OPTIONNEL)
-- Les produits sans icône utiliseront automatiquement l'icône de catégorie

-- Pizzas
UPDATE france_products SET icon = '🍕'
WHERE category_id IN (SELECT id FROM france_menu_categories WHERE slug = 'pizzas');

-- Burgers
UPDATE france_products SET icon = '🍔'
WHERE category_id IN (SELECT id FROM france_menu_categories WHERE slug = 'burgers');

-- Salades
UPDATE france_products SET icon = '🥗'
WHERE category_id IN (SELECT id FROM france_menu_categories WHERE slug = 'salades');

-- Tacos
UPDATE france_products SET icon = '🌮'
WHERE category_id IN (SELECT id FROM france_menu_categories WHERE slug = 'tacos');

-- Sandwichs
UPDATE france_products SET icon = '🥪'
WHERE category_id IN (SELECT id FROM france_menu_categories WHERE slug = 'sandwichs');

-- Desserts
UPDATE france_products SET icon = '🧁'
WHERE category_id IN (SELECT id FROM france_menu_categories WHERE slug = 'desserts');

-- Boissons
UPDATE france_products SET icon = '🥤'
WHERE category_id IN (SELECT id FROM france_menu_categories WHERE slug = 'drinks');

-- Vérification
SELECT COUNT(*) as products_with_icons FROM france_products WHERE icon IS NOT NULL;
SELECT COUNT(*) as products_without_icons FROM france_products WHERE icon IS NULL;

COMMIT;