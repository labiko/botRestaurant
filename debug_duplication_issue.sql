-- 🔍 DIAGNOSTIC: Analyser ce qui s'est passé lors de la duplication
-- Vérifier si le produit original a été modifié en plus de la création du doublon

BEGIN;

-- 1. Chercher tous les produits avec "Copie" dans le nom (produits dupliqués)
SELECT 
    'PRODUITS DUPLIQUÉS (avec Copie)' as section,
    id,
    name,
    category_id,
    product_type,
    price_on_site_base,
    price_delivery_base,
    composition,
    created_at,
    updated_at,
    CASE 
        WHEN created_at = updated_at THEN '🟢 Pas de modification'
        ELSE '🔴 Modifié après création'
    END as modification_status
FROM france_products
WHERE name ILIKE '%copie%'
ORDER BY created_at DESC;

-- 2. Chercher les produits récemment créés (dernière heure)
SELECT 
    'PRODUITS RÉCENTS (dernière heure)' as section,
    id,
    name,
    category_id,
    created_at,
    updated_at,
    EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 as minutes_between_create_update
FROM france_products
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 3. Chercher les produits récemment modifiés (dernière heure) 
SELECT 
    'PRODUITS MODIFIÉS (dernière heure)' as section,
    id,
    name,
    category_id,
    created_at,
    updated_at,
    CASE 
        WHEN updated_at > created_at + INTERVAL '1 minute' THEN '🔴 Modifié significativement après création'
        ELSE '🟢 Modification mineure'
    END as modification_type
FROM france_products
WHERE updated_at >= NOW() - INTERVAL '1 hour'
  AND updated_at > created_at + INTERVAL '10 seconds' -- Plus de 10 sec entre création et modification
ORDER BY updated_at DESC;

-- 4. Focus sur les boissons pour voir si EAU MINÉRALE originale a été touchée
SELECT 
    'BOISSONS RÉCENTES' as section,
    p.id,
    p.name,
    p.composition,
    p.price_on_site_base,
    p.created_at,
    p.updated_at,
    c.name as category_name,
    CASE 
        WHEN p.name ILIKE '%copie%' THEN '📋 PRODUIT DUPLIQUÉ'
        WHEN p.updated_at > p.created_at + INTERVAL '1 minute' THEN '✏️ PRODUIT MODIFIÉ'
        ELSE '🔒 PRODUIT STABLE'
    END as status
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%drink%' OR c.name ILIKE '%boisson%' OR c.slug = 'drinks'
  AND (p.created_at >= NOW() - INTERVAL '1 hour' OR p.updated_at >= NOW() - INTERVAL '1 hour')
ORDER BY p.updated_at DESC;

-- 5. Vérifier spécifiquement EAU MINÉRALE et ses variantes
SELECT 
    'EAU MINÉRALE ET VARIANTES' as section,
    p.id,
    p.name,
    p.composition,
    p.price_on_site_base,
    p.created_at,
    p.updated_at,
    pv.variant_name,
    pv.price_on_site as variant_price,
    CASE 
        WHEN p.name = 'EAU MINÉRALE' THEN '🎯 ORIGINAL'
        WHEN p.name ILIKE '%eau%mineral%copie%' THEN '📋 COPIE'
        ELSE '❓ AUTRE'
    END as product_status
FROM france_products p
LEFT JOIN france_product_variants pv ON p.id = pv.product_id AND pv.display_order = 1
WHERE p.name ILIKE '%eau%mineral%'
ORDER BY p.created_at ASC;

-- 6. Audit trail - qui a fait quoi et quand
SELECT 
    'TIMELINE RÉCENTE' as section,
    id,
    name,
    CASE 
        WHEN created_at = updated_at THEN 'CRÉÉ'
        ELSE 'MODIFIÉ'
    END as action,
    CASE 
        WHEN created_at = updated_at THEN created_at
        ELSE updated_at
    END as action_time,
    EXTRACT(EPOCH FROM (NOW() - COALESCE(updated_at, created_at))) / 60 as minutes_ago
FROM france_products
WHERE created_at >= NOW() - INTERVAL '2 hours' OR updated_at >= NOW() - INTERVAL '2 hours'
ORDER BY COALESCE(updated_at, created_at) DESC;

COMMIT;

-- 🎯 QUESTIONS CLÉS À VÉRIFIER:
-- 1. Y a-t-il un produit avec "Copie" dans le nom ?
-- 2. Le produit EAU MINÉRALE original a-t-il été modifié récemment ?
-- 3. Y a-t-il des timestamps suspects (modification juste après création) ?
-- 4. Les prix sont-ils cohérents entre original et copie ?