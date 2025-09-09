-- 🍕 CONFIGURATION DES MENUS PIZZA AVEC LE MÊME TEMPLATE QUE LES PIZZAS INDIVIDUELLES
-- Les menus pizza doivent être de type "modular" pour utiliser le même affichage
-- À exécuter dans l'ordre

BEGIN;

-- ============================================
-- 1. METTRE À JOUR LE TYPE DE PRODUIT POUR TOUS LES MENUS
-- ============================================
UPDATE france_products 
SET 
    product_type = 'modular',
    workflow_type = NULL,
    requires_steps = false,
    steps_config = NULL,
    base_price = NULL,
    price_on_site_base = NULL,
    price_delivery_base = NULL
WHERE id IN (310, 311, 312, 313)
    AND restaurant_id = 1;

-- ============================================
-- 2. CRÉER LES VARIANTES DE TAILLE POUR CHAQUE MENU
-- ============================================

-- Vérifier d'abord si les variantes existent déjà
DELETE FROM france_product_variants 
WHERE product_id IN (310, 311, 312, 313);

-- 📋 MENU 1 - 3 PIZZAS JUNIORS (Une seule taille disponible)
INSERT INTO france_product_variants (product_id, size, price_on_site, price_delivery, price_takeaway, is_available)
VALUES 
    (310, 'unique', 25.00, 26.00, 25.00, true);

-- 📋 MENU 2 - 2 PIZZAS SÉNIOR + 1 BOISSON 1.5L (Une seule taille disponible)
INSERT INTO france_product_variants (product_id, size, price_on_site, price_delivery, price_takeaway, is_available)
VALUES 
    (311, 'unique', 25.00, 26.00, 25.00, true);

-- 📋 MENU 3 - 1 PIZZA MEGA + NUGGETS/WINGS + BOISSON (Une seule taille disponible)
INSERT INTO france_product_variants (product_id, size, price_on_site, price_delivery, price_takeaway, is_available)
VALUES 
    (312, 'unique', 32.00, 33.00, 32.00, true);

-- 📋 MENU 4 - 1 PIZZA SÉNIOR + 2 BOISSONS + WINGS/NUGGETS (Une seule taille disponible)
INSERT INTO france_product_variants (product_id, size, price_on_site, price_delivery, price_takeaway, is_available)
VALUES 
    (313, 'unique', 22.00, 23.00, 22.00, true);

-- ============================================
-- 3. METTRE À JOUR LES DESCRIPTIONS DES MENUS
-- ============================================
UPDATE france_products SET 
    description = '3 pizzas taille Junior au choix',
    composition = '3 pizzas Junior de votre choix parmi toute la carte'
WHERE id = 310 AND restaurant_id = 1;

UPDATE france_products SET 
    description = '2 pizzas taille Sénior au choix + 1 boisson 1.5L',
    composition = '2 pizzas Sénior de votre choix + 1 boisson 1.5L (Coca, Coca Zero, Fanta ou Oasis)'
WHERE id = 311 AND restaurant_id = 1;

UPDATE france_products SET 
    description = '1 pizza taille Mega au choix + 14 nuggets ou 12 wings + 1 boisson 1.5L',
    composition = '1 pizza Mega de votre choix + 14 nuggets ou 12 wings + 1 boisson 1.5L'
WHERE id = 312 AND restaurant_id = 1;

UPDATE france_products SET 
    description = '1 pizza taille Sénior au choix + 2 boissons 33cl + 6 wings ou 8 nuggets',
    composition = '1 pizza Sénior de votre choix + 2 boissons 33cl + 6 wings ou 8 nuggets'
WHERE id = 313 AND restaurant_id = 1;

-- ============================================
-- 4. CRÉER UN WORKFLOW SPÉCIAL POUR GÉRER LES MENUS
-- ============================================
-- Note: Le bot devra détecter que c'est un menu pizza et lancer un workflow personnalisé
-- après la sélection de la taille pour permettre les choix

UPDATE france_products 
SET 
    workflow_type = 'menu_pizza_selection',
    requires_steps = true,
    steps_config = '{
      "menu_type": "pizza_menu",
      "components": []
    }'::json
WHERE id = 310 AND restaurant_id = 1;

UPDATE france_products 
SET 
    workflow_type = 'menu_pizza_selection',
    requires_steps = true,
    steps_config = '{
      "menu_type": "pizza_menu",
      "components": ["2_pizzas_senior", "1_boisson_1l5"]
    }'::json
WHERE id = 311 AND restaurant_id = 1;

UPDATE france_products 
SET 
    workflow_type = 'menu_pizza_selection',
    requires_steps = true,
    steps_config = '{
      "menu_type": "pizza_menu",
      "components": ["1_pizza_mega", "nuggets_or_wings", "1_boisson_1l5"]
    }'::json
WHERE id = 312 AND restaurant_id = 1;

UPDATE france_products 
SET 
    workflow_type = 'menu_pizza_selection',
    requires_steps = true,
    steps_config = '{
      "menu_type": "pizza_menu",
      "components": ["1_pizza_senior", "2_boissons_33cl", "wings_or_nuggets"]
    }'::json
WHERE id = 313 AND restaurant_id = 1;

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.description,
    v.size,
    v.price_on_site,
    v.price_delivery,
    p.steps_config
FROM france_products p
LEFT JOIN france_product_variants v ON v.product_id = p.id
WHERE p.id IN (310, 311, 312, 313)
    AND p.restaurant_id = 1
ORDER BY p.id;

COMMIT;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Les menus sont maintenant de type "modular" comme les pizzas
-- 2. Ils utilisent une taille "unique" car le menu a un prix fixe
-- 3. Le workflow_type "menu_pizza_selection" indique au bot que c'est un menu
-- 4. Après sélection de la taille, le bot devra lancer le workflow de choix
-- 5. Les components dans steps_config indiquent ce que le client doit choisir