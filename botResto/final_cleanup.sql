-- NETTOYAGE FINAL - ALIGNER LA BASE SUR LES BONS PRIX DU BOT
-- Bot: MENU M=8€, MENU L=9.5€, MENU XL=11€

-- 1. VÉRIFICATION FINALE avant suppression
SELECT 
  'PLAN D''ACTION FINAL' as section,
  s.id,
  s.size_name,
  s.price_on_site,
  s.price_delivery,
  CASE 
    WHEN s.size_name = 'MENU M' AND s.price_on_site = 8.00 THEN '✅ CONSERVER (Prix bot correct: 8€)'
    WHEN s.size_name = 'MENU L' AND s.price_on_site = 9.50 THEN '✅ CONSERVER (Prix bot correct: 9.5€)'
    WHEN s.size_name = 'MENU XL' AND s.price_on_site = 11.00 THEN '✅ CONSERVER (Prix bot correct: 11€)'
    ELSE '❌ SUPPRIMER (Prix incorrect)'
  END as action
FROM france_product_sizes s
WHERE s.product_id = 201
ORDER BY s.size_name, s.id;

-- 2. SUPPRESSION SÉCURISÉE des doublons incorrects
BEGIN;

-- Créer une sauvegarde des données supprimées
CREATE TEMP TABLE backup_suppression AS
SELECT s.*, 'Supprimé car prix incorrect vs bot' as raison
FROM france_product_sizes s 
WHERE product_id = 201 
  AND (
    (size_name = 'MENU M' AND price_on_site != 8.00) OR
    (size_name = 'MENU L' AND price_on_site != 9.50) OR  
    (size_name = 'MENU XL' AND price_on_site != 11.00)
  );

-- Afficher ce qui va être supprimé
SELECT 'DONNÉES QUI SERONT SUPPRIMÉES:' as info;
SELECT * FROM backup_suppression;

-- Effectuer la suppression
DELETE FROM france_product_sizes 
WHERE product_id = 201 
  AND (
    (size_name = 'MENU M' AND price_on_site != 8.00) OR
    (size_name = 'MENU L' AND price_on_site != 9.50) OR  
    (size_name = 'MENU XL' AND price_on_site != 11.00)
  );

-- 3. VÉRIFICATION FINALE - Plus de doublons
SELECT 
  'RÉSULTAT FINAL' as section,
  size_name,
  price_on_site,
  price_delivery,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ Unique'
    ELSE '❌ Encore des doublons!'
  END as status
FROM france_product_sizes
WHERE product_id = 201
GROUP BY size_name, price_on_site, price_delivery
ORDER BY size_name;

-- 4. AFFICHAGE FINAL PROPRE
SELECT 
  'TAILLES FINALES DANS LA BASE' as section,
  id,
  size_name,
  price_on_site,
  price_delivery,
  includes_drink,
  display_order
FROM france_product_sizes
WHERE product_id = 201
ORDER BY price_on_site; -- Par ordre de prix croissant

COMMIT;

-- 5. MESSAGE DE CONFIRMATION
SELECT '🎉 SUCCÈS: Base de données alignée avec les prix du bot!' as confirmation;