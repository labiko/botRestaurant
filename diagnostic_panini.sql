-- 🔍 DIAGNOSTIC PANINI
-- Analyser la configuration des PANINI

BEGIN;

-- 1. Vérifier si PANINI existe comme catégorie
SELECT
    'CATÉGORIE PANINI' as diagnostic,
    id,
    name,
    slug,
    is_active,
    display_order
FROM france_menu_categories
WHERE name ILIKE '%panini%' OR slug ILIKE '%panini%';

-- 2. Vérifier si PANINI existe comme produits
SELECT
    'PRODUITS PANINI' as diagnostic,
    p.id,
    p.name,
    p.price_on_site_base,
    p.price_delivery_base,
    p.is_active,
    p.workflow_type,
    p.product_type,
    c.name as category_name
FROM france_products p
LEFT JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.name ILIKE '%panini%';

-- 3. Chercher dans les options (peut-être PANINI est une option)
SELECT
    'OPTIONS PANINI' as diagnostic,
    fpo.id,
    fpo.option_name,
    fpo.option_group,
    fpo.price_modifier,
    fpo.is_active,
    p.name as product_name
FROM france_product_options fpo
LEFT JOIN france_products p ON p.id = fpo.product_id
WHERE fpo.option_name ILIKE '%panini%';

-- 4. Vérifier toutes les catégories actives pour voir où devrait être PANINI
SELECT
    'TOUTES CATÉGORIES ACTIVES' as diagnostic,
    id,
    name,
    slug,
    display_order,
    is_active
FROM france_menu_categories
WHERE is_active = true
ORDER BY display_order;

-- 5. Compter les produits par catégorie
SELECT
    'PRODUITS PAR CATÉGORIE' as diagnostic,
    c.name as category_name,
    c.slug,
    COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id AND p.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug
ORDER BY c.display_order;

ROLLBACK;