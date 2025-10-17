-- 🧹 NETTOYAGE DOUBLONS BOISSONS
-- Supprimer les versions multiples de MIRANDA TROPICAL et 7 UP

BEGIN;

-- 1. Supprimer les doublons de MIRANDA TROPICAL
DELETE FROM france_product_options 
WHERE option_name IN (
    'MIRANDA TROPICALV3',
    'MIRANDA TROPICALV2'
);

-- 2. Supprimer le doublon de 7 UP
DELETE FROM france_product_options 
WHERE option_name = '7 UP (COPIE) V1';

-- 3. Vérification - compter les boissons restantes avec ces noms
SELECT 
    'VÉRIFICATION NETTOYAGE' as info,
    COUNT(CASE WHEN option_name ILIKE '%MIRANDA TROPICAL%' THEN 1 END) as nb_miranda_tropical,
    COUNT(CASE WHEN option_name ILIKE '%7 UP%' THEN 1 END) as nb_7up_restants,
    COUNT(CASE WHEN option_name ILIKE '%COPIE%' THEN 1 END) as nb_copies_restantes
FROM france_product_options 
WHERE option_group ILIKE '%boisson%';

-- 4. Lister les boissons MIRANDA et 7 UP restantes
SELECT 
    'BOISSONS RESTANTES' as info,
    option_name,
    option_group,
    COUNT(*) as nb_occurrences
FROM france_product_options 
WHERE (option_name ILIKE '%MIRANDA%' OR option_name ILIKE '%7 UP%')
AND option_group ILIKE '%boisson%'
GROUP BY option_name, option_group
ORDER BY option_name;

COMMIT;