-- 🔢 AJOUT NUMÉROTATION SUPPLÉMENTS BOWL
-- Ajouter les emojis numérotés manquants aux options suppléments

BEGIN;

-- Mettre à jour les options suppléments avec numérotation
UPDATE france_product_options 
SET option_name = '1️⃣ Pas de suppléments'
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
) 
AND option_group = 'Suppléments' 
AND option_name = 'Pas de suppléments';

UPDATE france_product_options 
SET option_name = '2️⃣ Ajouter des suppléments'
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
) 
AND option_group = 'Suppléments' 
AND option_name = 'Ajouter des suppléments';

-- Vérification des options numérotées
SELECT 
    'OPTIONS SUPPLÉMENTS NUMÉROTÉES' as info,
    fpo.display_order,
    fpo.option_name,
    fpo.price_modifier
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL' AND fpo.option_group = 'Suppléments'
ORDER BY fpo.display_order;

COMMIT;