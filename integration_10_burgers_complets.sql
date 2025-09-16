-- INTÉGRATION DES 10 BURGERS COMPLETS - Pizza Yolo 77
-- Source EXACTE: C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\DATA\BURGERS\dataBrut.txt
-- SERVIS AVEC FRITES & BOISSON 33CL
-- Structure analysée: botResto\database_fr_structure.sql

BEGIN;

-- 1. Vérifier que la catégorie BURGERS existe
SELECT 'VÉRIFICATION CATÉGORIE BURGERS' as info, 
       COUNT(*) as nb_categories 
FROM france_menu_categories 
WHERE slug = 'burgers';

-- 2. NETTOYAGE - Supprimer tous les burgers existants pour éviter les doublons
DELETE FROM france_product_options 
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'burgers'
);

DELETE FROM france_composite_items 
WHERE composite_product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'burgers'
);

DELETE FROM france_products 
WHERE category_id IN (
    SELECT id FROM france_menu_categories WHERE slug = 'burgers'
);

SELECT 'NETTOYAGE TERMINÉ' as info;

-- 3. Récupérer l'ID de la catégorie BURGERS et du restaurant
WITH burger_category AS (
    SELECT c.id as category_id, c.restaurant_id
    FROM france_menu_categories c 
    WHERE c.slug = 'burgers' 
    LIMIT 1
)
-- 4. Insertion des 10 BURGERS EXACTEMENT comme dans dataBrut.txt
INSERT INTO france_products (
    restaurant_id, category_id, name, description,
    product_type, price_on_site_base, price_delivery_base,
    composition, display_order, is_active
) 
SELECT 
    bc.restaurant_id,
    bc.category_id,
    burger_data.name,
    burger_data.description,
    'simple'::product_type_enum as product_type,
    burger_data.prix_sur_place,
    burger_data.prix_livraison,
    burger_data.composition,
    burger_data.display_order,
    true as is_active
FROM burger_category bc,
(VALUES
    -- LES 10 BURGERS EXACTEMENT COMME DANS dataBrut.txt
    ('CHEESEBURGER', 'Burger classique', 'Steak 45g, fromage, cornichons', 5, 6, 1),
    ('DOUBLE CHEESEBURGER', 'Double burger', '2 Steaks 45g, fromage, cornichons', 6.50, 7.50, 2),
    ('BIG CHEESE', 'Gros burger au fromage', '2 Steaks 45g, cheddar, salade, oignons', 7.50, 8.50, 3),
    ('LE FISH', 'Burger au poisson', 'Filet de poisson pané, fromage, cornichons', 6.50, 7, 4),
    ('LE CHICKEN', 'Burger au poulet', 'Galette de poulet pané, fromage, cornichons', 6.50, 7, 5),
    ('LE TOWER', 'Burger tour', 'Galette de poulet pané, crusty, fromage, cornichons', 7.50, 8.50, 6),
    ('GÉANT', 'Burger géant', 'Steak 90g, salade', 6.50, 7.50, 7),
    ('180', 'Burger 180', '2 Steaks 90g, cheddar, tomates, oignons', 8.50, 9.50, 8),
    ('LE BACON', 'Burger au bacon', '2 Steaks 90g, fromage, œuf, bacon, cornichons', 9.50, 10.50, 9),
    ('270', 'Burger 270', '3 Steaks 90g, salade, tomates, cornichons', 10, 11, 10)
) AS burger_data(name, description, composition, prix_sur_place, prix_livraison, display_order);

-- 5. Vérification de l'insertion
SELECT 'RÉSULTAT INSERTION' as info,
       COUNT(*) as nb_burgers_inserés
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'burgers';

-- 6. Affichage des burgers insérés
SELECT 'LISTE COMPLÈTE DES BURGERS' as section,
       p.id, p.name, p.price_on_site_base, p.price_delivery_base, p.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'burgers'
ORDER BY p.display_order;

COMMIT;

-- NOTE IMPORTANTE: Tous les burgers sont SERVIS AVEC FRITES & BOISSON 33CL
-- Ceci sera géré par la configuration automatique avec:
-- SELECT configure_category_workflow('BURGERS', 'copy_from', 'GOURMETS');