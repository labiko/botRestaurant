-- INTÉGRATION CORRECTE POULET & SNACKS - Pizza Yolo 77
-- Source EXACTE: C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\DATA\SNACK-POULET\dataBrut.txt
-- 8 produits SIMPLES + 3 produits COMPOSITES (avec choix boisson 33CL)
-- Structure analysée: botResto\database_fr_structure.sql

BEGIN;

-- 1. Vérifier/créer la catégorie POULET & SNACKS
SELECT 'VÉRIFICATION CATÉGORIE POULET & SNACKS' as info, 
       COUNT(*) as nb_categories 
FROM france_menu_categories 
WHERE name = '🍗 POULET & SNACKS' 
   OR slug IN ('poulet-snacks', 'poulet_snacks', 'chicken-snacks', 'snacks');

-- 2. NETTOYAGE - Supprimer tous les produits existants pour éviter les doublons
DELETE FROM france_product_options 
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.name = '🍗 POULET & SNACKS' 
       OR c.slug IN ('poulet-snacks', 'poulet_snacks', 'chicken-snacks', 'snacks')
);

DELETE FROM france_composite_items 
WHERE composite_product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.name = '🍗 POULET & SNACKS' 
       OR c.slug IN ('poulet-snacks', 'poulet_snacks', 'chicken-snacks', 'snacks')
);

DELETE FROM france_products 
WHERE category_id IN (
    SELECT id FROM france_menu_categories 
    WHERE name = '🍗 POULET & SNACKS' 
       OR slug IN ('poulet-snacks', 'poulet_snacks', 'chicken-snacks', 'snacks')
);

SELECT 'NETTOYAGE TERMINÉ' as info;

-- 3. Récupérer l'ID de la catégorie et du restaurant
WITH poulet_category AS (
    SELECT c.id as category_id, c.restaurant_id
    FROM france_menu_categories c 
    WHERE c.name = '🍗 POULET & SNACKS' 
       OR c.slug IN ('poulet-snacks', 'poulet_snacks', 'chicken-snacks', 'snacks')
    LIMIT 1
)
-- 4. Insertion des 11 PRODUITS - 8 SIMPLES + 3 COMPOSITES
INSERT INTO france_products (
    restaurant_id, category_id, name, description,
    product_type, price_on_site_base, price_delivery_base,
    composition, display_order, is_active
) 
SELECT 
    pc.restaurant_id,
    pc.category_id,
    product_data.name,
    product_data.description,
    product_data.product_type::product_type_enum,
    product_data.prix_sur_place,
    product_data.prix_livraison,
    product_data.composition,
    product_data.display_order,
    true as is_active
FROM poulet_category pc,
(VALUES
    -- PRODUITS SIMPLES (sans accompagnement)
    ('TENDERS 1 PIECE', 'Tender de poulet', '1 pièce tender de poulet', 'simple', 1.50, 1.50, 1),
    ('NUGGETS 4 PIECES', 'Nuggets de poulet', '4 pièces nuggets de poulet', 'simple', 3.50, 3.50, 2),
    ('WINGS 4 PIECES', 'Ailes de poulet', '4 pièces wings de poulet', 'simple', 3.50, 3.50, 3),
    ('DONUTS POULET 1 PIECE', 'Donut de poulet', '1 pièce donut de poulet', 'simple', 2.00, 2.00, 4),
    ('MOZZA STICK 4 PIECES', 'Bâtonnets mozzarella', '4 pièces mozza stick', 'simple', 3.50, 3.50, 5),
    ('JALAPENOS 4 PIECES', 'Jalapeños panés', '4 pièces jalapeños', 'simple', 3.50, 3.50, 6),
    ('ONION RINGS 4 PIECES', 'Rondelles d''oignon', '4 pièces onion rings', 'simple', 3.50, 3.50, 7),
    ('POTATOES', 'Pommes de terre épicées', 'Pommes de terre épicées', 'simple', 1.00, 1.00, 8),
    
    -- PRODUITS COMPOSITES (avec frites + choix boisson 33CL)
    ('TENDERS 5 PIECES', 'Menu tenders', '5 pièces tenders + frites + boisson 33CL', 'composite', 9.00, 9.00, 9),
    ('NUGGETS 10 PIECES', 'Menu nuggets', '10 pièces nuggets + frites + boisson 33CL', 'composite', 9.00, 9.00, 10),
    ('WINGS 8 PIECES', 'Menu wings', '8 pièces wings + frites + boisson 33CL', 'composite', 9.00, 9.00, 11)
) AS product_data(name, description, composition, product_type, prix_sur_place, prix_livraison, display_order);

-- 5. Vérification de l'insertion
SELECT 'RÉSULTAT INSERTION' as info,
       COUNT(*) as nb_produits_inserés,
       COUNT(CASE WHEN product_type = 'simple' THEN 1 END) as nb_simples,
       COUNT(CASE WHEN product_type = 'composite' THEN 1 END) as nb_composites
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.name = '🍗 POULET & SNACKS' 
   OR c.slug IN ('poulet-snacks', 'poulet_snacks', 'chicken-snacks', 'snacks');

-- 6. Affichage des produits insérés
SELECT 'LISTE COMPLÈTE POULET & SNACKS' as section,
       p.id, p.name, p.product_type, p.price_on_site_base, p.price_delivery_base, p.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.name = '🍗 POULET & SNACKS' 
   OR c.slug IN ('poulet-snacks', 'poulet_snacks', 'chicken-snacks', 'snacks')
ORDER BY p.display_order;

COMMIT;

-- CONFIGURATION AUTOMATIQUE POUR LES PRODUITS COMPOSITES
-- Les 3 produits composites (TENDERS 5, NUGGETS 10, WINGS 8) auront le choix de boisson 33CL
-- Les 8 produits simples restent en sélection directe
-- Exécuter après l'insertion :
-- SELECT configure_category_workflow('POULET-SNACKS', 'copy_from', 'SANDWICHS');
-- ou
-- SELECT configure_category_workflow('POULET-SNACKS', 'copy_from', 'BURGERS');