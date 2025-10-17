-- DIAGNOSTIC URGENT - Pourquoi 6 BURGERS au lieu de 10 ?
-- Analyse structure basée sur: botResto\database_fr_structure.sql

-- 1. COMPTAGE TOTAL DES BURGERS
SELECT 
    'COMPTAGE TOTAL BURGERS' as section,
    COUNT(*) as total_burgers,
    COUNT(CASE WHEN p.is_active = true THEN 1 END) as burgers_actifs,
    COUNT(CASE WHEN p.is_active = false THEN 1 END) as burgers_inactifs
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'burgers';

-- 2. DÉTAIL PAR STATUT  
SELECT 
    'DÉTAIL BURGERS PAR STATUT' as section,
    p.id,
    p.name,
    p.is_active,
    p.product_type,
    p.workflow_type
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'burgers'
ORDER BY p.is_active DESC, p.name;

-- 3. VÉRIFIER LA CONDITION DE LA FONCTION
-- Reproduire la condition WHERE de copy_working_config
SELECT 
    'CONDITION EXACTE DE LA FONCTION' as section,
    'TRAITÉ PAR FONCTION: category_id = target_category_id AND is_active = true' as info;

SELECT 
    'BURGERS TRAITÉS PAR LA FONCTION' as section,
    p.id,
    p.name,
    p.is_active,
    'TRAITÉ PAR FONCTION' as statut
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'burgers'
AND p.is_active = true  -- Condition exacte de la fonction
ORDER BY p.name;

-- 4. BURGERS EXCLUS (inactifs)
SELECT 
    'BURGERS EXCLUS (is_active = false)' as section,
    p.id,
    p.name,
    p.is_active,
    'EXCLU DE LA FONCTION' as statut
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'burgers'
AND p.is_active = false
ORDER BY p.name;

-- 5. COMPARAISON AVEC AUTRES CATÉGORIES
SELECT 
    'COMPARAISON AVEC AUTRES CATÉGORIES' as section,
    c.name as categorie,
    COUNT(*) as total_produits,
    COUNT(CASE WHEN p.is_active = true THEN 1 END) as actifs,
    COUNT(CASE WHEN p.is_active = false THEN 1 END) as inactifs
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug IN ('burgers', 'sandwichs', 'gourmets')
GROUP BY c.name, c.slug
ORDER BY c.name;