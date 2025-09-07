-- ANALYSE DES PRIX - VERSION STANDALONE
-- À exécuter pour vérifier si les prix sont identiques entre doublons

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

-- RECOMMANDATION FINALE
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
  END as recommendation;