-- Script d'ajout du champ display_variants_inline pour contrôler l'affichage des variantes
-- Ce champ permet d'afficher les tailles d'un produit comme des produits séparés dans le menu
-- Principe du bot universel : configuration par base de données, pas de code spécifique

BEGIN;

-- 1. Ajouter le champ pour contrôler l'affichage des variantes
ALTER TABLE france_products 
ADD COLUMN IF NOT EXISTS display_variants_inline BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN france_products.display_variants_inline IS 
'Si TRUE, affiche chaque taille/variante comme un produit distinct dans le menu (ex: TACOS S, TACOS M, TACOS L)';

-- 2. Activer uniquement pour TACOS de Pizza Yolo 77
UPDATE france_products 
SET display_variants_inline = TRUE
WHERE name = 'TACOS' 
AND restaurant_id = 1
AND product_type = 'modular';

-- 3. Vérification de la modification
SELECT 
    p.id, 
    p.name, 
    p.product_type, 
    p.display_variants_inline,
    p.has_sizes,
    COUNT(ps.id) as nombre_tailles
FROM france_products p
LEFT JOIN france_product_sizes ps ON ps.product_id = p.id
WHERE p.restaurant_id = 1 
AND p.category_id IN (SELECT id FROM france_menu_categories WHERE name = 'TACOS')
GROUP BY p.id, p.name, p.product_type, p.display_variants_inline, p.has_sizes;

-- 4. Afficher les tailles qui seront affichées inline
SELECT 
    ps.size_name,
    ps.price_on_site,
    ps.price_delivery,
    ps.display_order
FROM france_product_sizes ps
JOIN france_products p ON p.id = ps.product_id
WHERE p.name = 'TACOS' 
AND p.restaurant_id = 1
ORDER BY ps.display_order;

COMMIT;

-- Note: Si besoin de rollback, exécuter :
-- ALTER TABLE france_products DROP COLUMN IF EXISTS display_variants_inline;