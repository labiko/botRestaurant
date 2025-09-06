-- 🔍 DEBUG - Vérifier les catégories de menu et les boissons
-- Exécuter ce script pour diagnostiquer le problème

-- 1. Lister TOUTES les catégories pour restaurant_id=1
SELECT 'TOUTES LES CATÉGORIES' as debug_section;
SELECT id, name, slug, restaurant_id, is_active 
FROM france_menu_categories 
WHERE restaurant_id = 1;

-- 2. Chercher spécifiquement la catégorie DRINKS
SELECT 'RECHERCHE CATÉGORIE DRINKS' as debug_section;
SELECT id, name, slug, restaurant_id, is_active 
FROM france_menu_categories 
WHERE restaurant_id = 1 AND (slug = 'drinks' OR name ILIKE '%drink%' OR name ILIKE '%boisson%');

-- 3. Si catégorie DRINKS trouvée, compter les produits
SELECT 'PRODUITS DANS CATÉGORIE DRINKS' as debug_section;
SELECT COUNT(*) as nb_produits 
FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1 AND c.slug = 'drinks';

-- 4. Lister les premiers produits de la catégorie DRINKS
SELECT 'LISTE PRODUITS DRINKS' as debug_section;
SELECT p.id, p.name, p.product_type, p.is_active, p.price_on_site_base, p.price_delivery_base
FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1 AND c.slug = 'drinks'
ORDER BY p.display_order
LIMIT 10;