-- VÉRIFIER LE NOM EXACT DE LA CATÉGORIE POULET & SNACKS

SELECT 
    id,
    name,
    slug,
    icon,
    display_order,
    is_active
FROM france_menu_categories
WHERE name LIKE '%POULET%'
   OR name LIKE '%SNACK%'
   OR slug LIKE '%poulet%'
   OR slug LIKE '%snack%'
   OR slug LIKE '%chicken%'
ORDER BY name;