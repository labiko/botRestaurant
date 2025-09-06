-- 🔍 VÉRIFICATION COMPLÈTE DES CATÉGORIES ET PRODUITS

-- REQUÊTE 1: Toutes les catégories actives
SELECT 'TOUTES LES CATÉGORIES' as verification;
SELECT 
    display_order as ordre,
    name as categorie,
    slug,
    CASE is_active 
        WHEN true THEN '✅ Active' 
        ELSE '❌ Inactive' 
    END as statut
FROM france_menu_categories 
WHERE restaurant_id = 1
ORDER BY display_order;

-- REQUÊTE 2: Catégories avec nombre de produits
SELECT 'CATÉGORIES AVEC COMPTAGE PRODUITS' as verification;
SELECT 
    c.display_order as ordre,
    c.name as categorie,
    c.slug,
    COUNT(p.id) as nb_produits,
    COUNT(CASE WHEN p.is_active THEN 1 END) as nb_actifs,
    CASE 
        WHEN COUNT(p.id) = 0 THEN '❌ VIDE'
        WHEN COUNT(CASE WHEN p.is_active THEN 1 END) = 0 THEN '⚠️ Aucun actif'
        ELSE '✅ OK'
    END as statut
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id
WHERE c.restaurant_id = 1 AND c.is_active = true
GROUP BY c.id, c.display_order, c.name, c.slug
ORDER BY c.display_order;