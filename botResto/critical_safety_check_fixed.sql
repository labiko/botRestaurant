-- VÉRIFICATIONS DE SÉCURITÉ CRITIQUES AVANT SUPPRESSION - VERSION CORRIGÉE
-- ⚠️ OBLIGATOIRE À EXÉCUTER AVANT TOUTE SUPPRESSION

-- 1. SAUVEGARDE COMPLÈTE des données à supprimer
CREATE TEMP TABLE backup_sizes_to_delete AS
WITH duplicates AS (
  SELECT 
    product_id,
    size_name,
    MIN(id) as keep_id,
    ARRAY_AGG(id ORDER BY id) as all_ids
  FROM france_product_sizes 
  WHERE product_id = 201
  GROUP BY product_id, size_name 
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT UNNEST(
    ARRAY_REMOVE(all_ids, keep_id)
  ) as id_to_delete
  FROM duplicates
)
SELECT s.* 
FROM france_product_sizes s
WHERE s.id IN (SELECT id_to_delete FROM to_delete);

-- Afficher la sauvegarde
SELECT 'SAUVEGARDE - Données qui seront supprimées :' as info;
SELECT * FROM backup_sizes_to_delete;

-- 2. IDENTIFIER LES VRAIES TABLES DE SESSION/COMMANDES
-- Lister toutes les tables qui pourraient contenir des références
SELECT 
  schemaname,
  tablename,
  'Table existante' as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename ILIKE '%session%' 
       OR tablename ILIKE '%order%' 
       OR tablename ILIKE '%command%'
       OR tablename ILIKE '%cart%'
       OR tablename ILIKE '%panier%'
       OR tablename ILIKE '%bot%')
ORDER BY tablename;

-- 3. ANALYSER LES DIFFÉRENCES DE PRIX ENTRE DOUBLONS
-- CRUCIAL : Si les prix sont différents, on pourrait casser des commandes en cours
WITH price_comparison AS (
  SELECT 
    size_name,
    COUNT(*) as occurrences,
    COUNT(DISTINCT price_on_site) as different_prices_on_site,
    COUNT(DISTINCT price_delivery) as different_prices_delivery,
    MIN(price_on_site) as min_price_on_site,
    MAX(price_on_site) as max_price_on_site,
    MIN(price_delivery) as min_price_delivery,
    MAX(price_delivery) as max_price_delivery
  FROM france_product_sizes
  WHERE product_id = 201
  GROUP BY size_name
)
SELECT 
  'ANALYSE DES PRIX' as section,
  size_name,
  occurrences,
  CASE 
    WHEN different_prices_on_site > 1 THEN '❌ PRIX DIFFÉRENTS - RISQUE ÉLEVÉ'
    ELSE '✅ Prix identiques'
  END as risk_on_site,
  CASE 
    WHEN different_prices_delivery > 1 THEN '❌ PRIX DIFFÉRENTS - RISQUE ÉLEVÉ'
    ELSE '✅ Prix identiques'
  END as risk_delivery,
  min_price_on_site,
  max_price_on_site,
  min_price_delivery,
  max_price_delivery
FROM price_comparison
ORDER BY size_name;

-- 4. VOIR EXACTEMENT QUELLES TAILLES SERONT SUPPRIMÉES VS CONSERVÉES
SELECT 
  'PLAN D''ACTION DÉTAILLÉ' as section,
  s.id,
  s.size_name,
  s.price_on_site,
  s.price_delivery,
  s.includes_drink,
  s.display_order,
  CASE 
    WHEN s.id IN (SELECT id FROM backup_sizes_to_delete) THEN '❌ SERA SUPPRIMÉ'
    ELSE '✅ SERA CONSERVÉ'
  END as action
FROM france_product_sizes s
WHERE s.product_id = 201
ORDER BY s.size_name, s.id;

-- 5. RECOMMANDATION FINALE BASÉE SUR L'ANALYSE
SELECT 
  'RECOMMANDATION FINALE' as section,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM france_product_sizes 
      WHERE product_id = 201 
      GROUP BY size_name 
      HAVING COUNT(DISTINCT price_on_site) > 1 
         OR COUNT(DISTINCT price_delivery) > 1
    ) 
    THEN '⚠️  ATTENTION: Prix différents détectés - NE PAS SUPPRIMER SANS ANALYSE MANUELLE'
    ELSE '✅ SÉCURISÉ: Tous les doublons ont les mêmes prix - Suppression possible'
  END as recommendation,
  (SELECT COUNT(*) FROM backup_sizes_to_delete) as nb_sizes_to_delete;

-- 6. AFFICHER RÉSUMÉ POUR DÉCISION
SELECT 
  'RÉSUMÉ DÉCISIONNEL' as section,
  COUNT(*) as total_sizes_actuelles,
  COUNT(*) - COUNT(DISTINCT size_name) as doublons_a_supprimer,
  COUNT(DISTINCT size_name) as sizes_finales
FROM france_product_sizes
WHERE product_id = 201;