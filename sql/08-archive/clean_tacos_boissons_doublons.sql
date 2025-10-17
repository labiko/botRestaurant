-- 🧹 NETTOYAGE SIMPLE : Supprimer les doublons avec caractères étranges
BEGIN;

-- Supprimer UNIQUEMENT les options avec caractères étranges ⿡⿢⿣
DELETE FROM france_product_options 
WHERE product_id = 201 
  AND option_group = 'boisson'
  AND (option_name LIKE '%⿡%' OR option_name LIKE '%⿢%' OR option_name LIKE '%⿣%' 
       OR option_name LIKE '%⿤%' OR option_name LIKE '%⿥%' OR option_name LIKE '%⿦%'
       OR option_name LIKE '%⿧%' OR option_name LIKE '%⿨%' OR option_name LIKE '%⿩%'
       OR option_name LIKE '%⿪%' OR option_name LIKE '%⿫%' OR option_name LIKE '%⿬%');

-- Vérification : il ne devrait rester que les 12 bonnes options
SELECT 
    'BOISSONS TACOS NETTOYÉES' as section,
    COUNT(*) as nb_boissons_restantes
FROM france_product_options 
WHERE product_id = 201 AND option_group = 'boisson';

-- Afficher les options restantes (format correct uniquement)
SELECT 
    'OPTIONS FINALES' as section,
    display_order,
    option_name
FROM france_product_options 
WHERE product_id = 201 AND option_group = 'boisson'
ORDER BY display_order;

COMMIT;