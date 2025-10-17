-- CORRECTION URGENTE - POULET & SNACKS
-- Remettre les 8 produits simples en 'simple' et les 3 menus en 'composite'

BEGIN;

-- 1. REMETTRE LES 8 PRODUITS SIMPLES EN 'simple'
UPDATE france_products 
SET 
    product_type = 'simple'::product_type_enum,
    workflow_type = NULL,
    requires_steps = false,
    steps_config = NULL
WHERE category_id = (SELECT id FROM france_menu_categories WHERE name = 'POULET & SNACKS')
AND name IN (
    'TENDERS 1 PIECE',
    'NUGGETS 4 PIECES', 
    'WINGS 4 PIECES',
    'DONUTS POULET 1 PIECE',
    'MOZZA STICK 4 PIECES',
    'JALAPENOS 4 PIECES', 
    'ONION RINGS 4 PIECES',
    'POTATOES'
);

-- 2. SUPPRIMER LES OPTIONS DES PRODUITS SIMPLES
DELETE FROM france_product_options 
WHERE product_id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.name = 'POULET & SNACKS'
    AND p.name IN (
        'TENDERS 1 PIECE',
        'NUGGETS 4 PIECES', 
        'WINGS 4 PIECES',
        'DONUTS POULET 1 PIECE',
        'MOZZA STICK 4 PIECES',
        'JALAPENOS 4 PIECES', 
        'ONION RINGS 4 PIECES',
        'POTATOES'
    )
);

-- 3. VÉRIFICATION
SELECT 
    'APRÈS CORRECTION' as section,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    COUNT(po.id) as nb_options,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options po ON po.product_id = p.id
WHERE c.name = 'POULET & SNACKS'
GROUP BY p.name, p.product_type, p.workflow_type, p.requires_steps, p.display_order
ORDER BY p.display_order;

COMMIT;