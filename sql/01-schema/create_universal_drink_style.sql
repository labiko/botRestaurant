-- 🌍 STYLE UNIVERSEL BOISSONS - Pour tous les restaurants
-- Standardise l'affichage des boissons avec le même format partout

BEGIN;

-- 1. Analyser les autres produits avec options boisson pour référence
SELECT 
    'AUTRES PRODUITS AVEC BOISSONS' as section,
    p.id,
    p.name as product_name,
    c.slug as category,
    po.option_name,
    po.option_group
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE po.option_group ILIKE '%boisson%'
  AND p.id != 201  -- Exclure TACOS qu'on vient de corriger
ORDER BY c.slug, p.name, po.display_order;

-- 2. Template de standardisation pour les autres produits (à appliquer si nécessaire)
-- Exemple de requête UPDATE pour uniformiser le style :
/*
UPDATE france_product_options 
SET option_name = CASE 
    WHEN option_name ILIKE '%coca cola%' THEN '🥤 *COCA COLA* 33CL'
    WHEN option_name ILIKE '%sprite%' THEN '🥤 *SPRITE* 33CL'
    WHEN option_name ILIKE '%fanta%' THEN '🥤 *FANTA* 33CL'
    ELSE option_name
END
WHERE option_group = 'boisson'
  AND option_name NOT LIKE '🥤 *%';  -- Ne pas modifier ceux déjà au bon format
*/

-- 3. Règles de formatage universel des boissons
SELECT 
    'RÈGLES FORMAT UNIVERSEL' as section,
    'Format standard pour toutes les boissons :' as règle
UNION ALL
SELECT '', '🥤 *[NOM BOISSON]* [TAILLE]'
UNION ALL  
SELECT '', 'Exemples :'
UNION ALL
SELECT '', '✅ 🥤 *COCA COLA* 33CL'
UNION ALL
SELECT '', '✅ 🧡 *OASIS TROPICAL* 33CL'
UNION ALL
SELECT '', '✅ 🧊 *ICE TEA* 33CL'
UNION ALL
SELECT '', '✅ ⚫ *COCA ZERO* 33CL'
UNION ALL
SELECT '', '✅ 🫧 *PERRIER* 33CL'
UNION ALL
SELECT '', ''
UNION ALL
SELECT '', '❌ Éviter : ⿡ 7 UP 33CL'
UNION ALL
SELECT '', '❌ Éviter : Coca-Cola (sans emoji)';

-- 4. Vérification finale - Style TACOS corrigé
SELECT 
    'STYLE TACOS FINAL' as section,
    po.display_order as num,
    po.option_name as boisson_formatée
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos' 
  AND po.option_group = 'boisson'
ORDER BY po.display_order;

COMMIT;

-- 📋 GUIDE D'APPLICATION UNIVERSELLE :
-- 
-- POUR CHAQUE NOUVEAU RESTAURANT :
-- 1. Utiliser le format : emoji + *nom* + taille
-- 2. Emojis recommandés :
--    🥤 = Sodas classiques
--    🧡 = Boissons tropicales  
--    🧊 = Thés glacés
--    ⚫ = Versions zéro/light
--    🫧 = Eaux gazeuses
--    💧 = Eaux plates
-- 3. Toujours mettre le nom en *gras*
-- 4. Indiquer la taille clairement (33CL, 50CL, etc.)