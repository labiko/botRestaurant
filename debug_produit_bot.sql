-- 🤖 DIAGNOSTIC: Pourquoi le produit dupliqué n'apparaît pas dans le bot

-- 1. Vérifier TOUS les champs nécessaires pour l'affichage bot
SELECT 
    'COMPARAISON PRODUITS POUR BOT' as section,
    p.id,
    p.name,
    p.category_id,
    p.restaurant_id,
    p.is_active,
    p.product_type,
    p.display_order,
    p.base_price,
    p.price_on_site_base,
    p.price_delivery_base,
    p.composition,
    p.workflow_type,
    p.requires_steps,
    c.name as category_name,
    c.slug as category_slug,
    c.is_active as category_active
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name ILIKE '%miranda%tropical%'
  AND p.is_active = true
ORDER BY p.id;

-- 2. Vérifier si le produit a des variants (nécessaires pour certains types)
SELECT 
    'VARIANTS COMPARAISON' as section,
    pv.product_id,
    p.name as product_name,
    pv.variant_name,
    pv.price_on_site,
    pv.price_delivery,
    pv.is_active as variant_active,
    pv.display_order as variant_order
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE p.name ILIKE '%miranda%tropical%'
ORDER BY pv.product_id, pv.display_order;

-- 3. Vérifier la requête exacte que le bot utilise (simulation)
SELECT 
    'REQUÊTE BOT SIMULATION' as section,
    p.id,
    p.name,
    p.product_type,
    p.composition,
    c.slug,
    CASE 
        WHEN p.product_type = 'variant' AND NOT EXISTS (
            SELECT 1 FROM france_product_variants pv 
            WHERE pv.product_id = p.id AND pv.is_active = true
        ) THEN '❌ VARIANT SANS VARIANTS ACTIFS'
        WHEN p.product_type = 'simple' AND p.base_price IS NULL AND p.price_on_site_base IS NULL THEN '❌ SIMPLE SANS PRIX'
        ELSE '✅ OK'
    END as status_bot
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
  AND p.is_active = true
  AND c.slug = 'drinks'
  AND p.name ILIKE '%miranda%tropical%'
ORDER BY p.display_order;