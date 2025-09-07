-- VÉRIFICATIONS DE SÉCURITÉ CRITIQUES AVANT SUPPRESSION
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

-- 2. VÉRIFIER LES SESSIONS BOT ACTIVES
-- Chercher dans la table des sessions s'il y a des références
SELECT 
  COUNT(*) as sessions_actives_count,
  'Vérifier si des utilisateurs ont ces tailles dans leur session/panier' as warning
FROM bot_france_sessions 
WHERE current_step IS NOT NULL 
  AND session_data IS NOT NULL;

-- 3. VÉRIFIER LES RÉFÉRENCES DANS LES COMMANDES (si la table existe)
-- Note: Adapter selon les vraies tables de commandes
SELECT 'Recherche des références dans les commandes...' as check_step;

-- 4. ANALYSER LES DIFFÉRENCES DE PRIX ENTRE DOUBLONS
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
FROM price_comparison;

-- 5. RECOMMANDATION FINALE
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM france_product_sizes 
      WHERE product_id = 201 
      GROUP BY size_name 
      HAVING COUNT(DISTINCT price_on_site) > 1 
         OR COUNT(DISTINCT price_delivery) > 1
    ) 
    THEN '⚠️  ATTENTION: Prix différents détectés - Analyse manuelle requise'
    ELSE '✅ Sûr: Tous les doublons ont les mêmes prix - Suppression possible'
  END as final_recommendation;