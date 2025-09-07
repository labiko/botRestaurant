-- ALIGNER LA BASE AVEC LES PRIX DU BOT
-- Le bot affiche MENU M=8€, MENU L=9.5€, MENU XL=11€
-- Donc on garde les doublons avec ces prix et on supprime les autres

-- D'abord, voir exactement quels IDs correspondent aux prix du bot
SELECT 
  'IDENTIFICATION DES PRIX BOT' as section,
  s.id,
  s.size_name,
  s.price_on_site,
  s.price_delivery,
  CASE 
    WHEN s.size_name = 'MENU M' AND s.price_on_site = 8.00 THEN '✅ GARDER (Prix bot: 8€)'
    WHEN s.size_name = 'MENU L' AND s.price_on_site = 9.50 THEN '✅ GARDER (Prix bot: 9.5€)'
    WHEN s.size_name = 'MENU XL' AND s.price_on_site = 11.00 THEN '✅ GARDER (Prix bot: 11€)'
    ELSE '❌ SUPPRIMER (Prix différent du bot)'
  END as action
FROM france_product_sizes s
WHERE s.product_id = 201
ORDER BY s.size_name, s.id;

-- SCRIPT DE SUPPRESSION SÉCURISÉ (aligné sur le bot)
-- ⚠️ N'exécuter qu'après validation des prix ci-dessus

/*
BEGIN;

-- Supprimer les prix qui NE correspondent PAS au bot
DELETE FROM france_product_sizes 
WHERE product_id = 201 
  AND (
    (size_name = 'MENU M' AND price_on_site != 8.00) OR
    (size_name = 'MENU L' AND price_on_site != 9.50) OR  
    (size_name = 'MENU XL' AND price_on_site != 11.00)
  );

-- Vérification finale
SELECT 
  'APRÈS ALIGNEMENT' as section,
  size_name,
  price_on_site,
  price_delivery,
  COUNT(*) as count
FROM france_product_sizes
WHERE product_id = 201
GROUP BY size_name, price_on_site, price_delivery
ORDER BY size_name;

COMMIT;
*/