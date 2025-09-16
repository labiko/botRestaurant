-- 🔧 CORRECTION GÉNÉRALE - Réorganiser tous les display_order des catégories
-- Solution globale pour éviter les conflits et bugs sur toutes les catégories

BEGIN;

-- 1. D'abord, voir l'ordre actuel problématique
SELECT 'ORDRE ACTUEL (avec conflits)' as verification;
SELECT 
    id,
    name,
    slug,
    display_order,
    is_active
FROM france_menu_categories 
WHERE restaurant_id = 1 AND is_active = true
ORDER BY display_order, name;

-- 2. CORRECTION SÉQUENTIELLE - Réattribuer display_order de 1 à N
-- Ordre logique souhaité basé sur le menu affiché au client

-- TACOS (reste 1)
UPDATE france_menu_categories 
SET display_order = 1 
WHERE restaurant_id = 1 AND slug = 'tacos';

-- Pizzas (devient 2)
UPDATE france_menu_categories 
SET display_order = 2 
WHERE restaurant_id = 1 AND slug = 'pizzas';

-- BURGERS (devient 3) 
UPDATE france_menu_categories 
SET display_order = 3 
WHERE restaurant_id = 1 AND slug = 'burgers';

-- Menu Pizza (devient 4)
UPDATE france_menu_categories 
SET display_order = 4 
WHERE restaurant_id = 1 AND slug = 'menus';

-- SANDWICHS (devient 5)
UPDATE france_menu_categories 
SET display_order = 5 
WHERE restaurant_id = 1 AND slug = 'sandwichs';

-- GOURMETS (devient 6)
UPDATE france_menu_categories 
SET display_order = 6 
WHERE restaurant_id = 1 AND slug = 'gourmets';

-- SMASHS (devient 7)
UPDATE france_menu_categories 
SET display_order = 7 
WHERE restaurant_id = 1 AND slug = 'smashs';

-- ASSIETTES (devient 8)
UPDATE france_menu_categories 
SET display_order = 8 
WHERE restaurant_id = 1 AND slug = 'assiettes';

-- NAANS (devient 9)
UPDATE france_menu_categories 
SET display_order = 9 
WHERE restaurant_id = 1 AND slug = 'naans';

-- POULET & SNACKS (devient 10)
UPDATE france_menu_categories 
SET display_order = 10 
WHERE restaurant_id = 1 AND slug = 'poulet-snacks';

-- ICE CREAM (devient 11)
UPDATE france_menu_categories 
SET display_order = 11 
WHERE restaurant_id = 1 AND slug = 'ice-cream';

-- DESSERTS (devient 12)
UPDATE france_menu_categories 
SET display_order = 12 
WHERE restaurant_id = 1 AND slug = 'desserts';

-- DRINKS (devient 13)
UPDATE france_menu_categories 
SET display_order = 13 
WHERE restaurant_id = 1 AND slug = 'drinks';

-- SALADES (devient 14)
UPDATE france_menu_categories 
SET display_order = 14 
WHERE restaurant_id = 1 AND slug = 'salades';

-- TEX-MEX (devient 15)
UPDATE france_menu_categories 
SET display_order = 15 
WHERE restaurant_id = 1 AND slug = 'tex-mex';

-- PANINI (devient 16)
UPDATE france_menu_categories 
SET display_order = 16 
WHERE restaurant_id = 1 AND slug = 'panini';

-- PÂTES (devient 17)
UPDATE france_menu_categories 
SET display_order = 17 
WHERE restaurant_id = 1 AND slug = 'pates';

-- MENU ENFANT (devient 18)
UPDATE france_menu_categories 
SET display_order = 18 
WHERE restaurant_id = 1 AND slug = 'menu-enfant';

-- BOWLS (devient 19)
UPDATE france_menu_categories 
SET display_order = 19 
WHERE restaurant_id = 1 AND slug = 'bowls';

-- CHICKEN BOX (devient 20)
UPDATE france_menu_categories 
SET display_order = 20 
WHERE restaurant_id = 1 AND slug = 'chicken-box';

-- SNACKS (devient 21)
UPDATE france_menu_categories 
SET display_order = 21 
WHERE restaurant_id = 1 AND slug = 'snacks';

-- 3. VÉRIFICATION FINALE - Ordre corrigé séquentiel
SELECT 'ORDRE CORRIGÉ (séquentiel)' as verification;
SELECT 
    display_order as choix,
    CASE 
        WHEN display_order = 1 THEN '1️⃣'
        WHEN display_order = 2 THEN '2️⃣'
        WHEN display_order = 3 THEN '3️⃣'
        WHEN display_order = 4 THEN '4️⃣'
        WHEN display_order = 5 THEN '5️⃣'
        WHEN display_order = 6 THEN '6️⃣'
        WHEN display_order = 7 THEN '7️⃣'
        WHEN display_order = 8 THEN '8️⃣'
        WHEN display_order = 9 THEN '9️⃣'
        WHEN display_order = 10 THEN '🔟'
        ELSE CAST(display_order AS TEXT)
    END as emoji,
    name,
    slug,
    is_active
FROM france_menu_categories 
WHERE restaurant_id = 1 AND is_active = true
ORDER BY display_order;

-- 4. Vérifier qu'il n'y a plus de doublons
SELECT 'VÉRIFICATION DOUBLONS' as verification;
SELECT 
    display_order, 
    COUNT(*) as nb_categories
FROM france_menu_categories 
WHERE restaurant_id = 1 AND is_active = true
GROUP BY display_order
HAVING COUNT(*) > 1;

COMMIT;