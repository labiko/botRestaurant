-- 🔍 ANALYSE PROBLÈME CHATGPT VS CODE CONVERSION
-- ===============================================

-- 1. Vérifier ce que ChatGPT a généré vs ce qui est en base
SELECT 'PRODUIT PANINI CRÉÉ' as type,
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE r.name = 'Le Nouveau O''CV Moissy'
AND p.name LIKE '%Panini%';

-- 2. Analyser Pizza Yolo 77 - Comment ils gèrent les paninis/choix multiples
SELECT 'PIZZA YOLO - COMPOSITES AVEC CHOIX' as type,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE r.name = 'Pizza Yolo 77'
AND p.requires_steps = true
AND p.steps_config IS NOT NULL
AND p.steps_config::text LIKE '%option_groups%'
LIMIT 5;

-- 3. Vérifier les vrais groupes d'options de Pizza Yolo 77
SELECT DISTINCT 'PIZZA YOLO - GROUPES OPTIONS' as type,
    po.option_group,
    COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE r.name = 'Pizza Yolo 77'
GROUP BY po.option_group
ORDER BY po.option_group;

-- 4. Chercher des produits similaires aux paninis dans Pizza Yolo 77
SELECT 'PIZZA YOLO - PRODUITS SIMILAIRES PANINIS' as type,
    p.name,
    p.product_type,
    p.workflow_type,
    p.steps_config
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE r.name = 'Pizza Yolo 77'
AND (p.name ILIKE '%panini%' OR p.name ILIKE '%sandwich%' OR p.name ILIKE '%choix%');