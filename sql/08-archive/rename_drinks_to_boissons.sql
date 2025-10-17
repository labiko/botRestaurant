-- 🔄 RENOMMER CATÉGORIE DRINKS → BOISSONS
-- Mise à jour simple du nom de la catégorie

BEGIN;

-- Renommer la catégorie DRINKS en BOISSONS
UPDATE france_menu_categories 
SET name = 'BOISSONS'
WHERE name = 'DRINKS' 
  OR slug = 'drinks';

-- Vérification du résultat
SELECT 
    'VÉRIFICATION APRÈS RENOMMAGE' as section,
    id,
    name,
    slug,
    icon
FROM france_menu_categories
WHERE name = 'BOISSONS' OR slug = 'drinks'
ORDER BY id;

COMMIT;