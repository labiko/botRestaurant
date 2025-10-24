-- ========================================================================
-- SUPPRESSION LIVREUR ALPHA (33620951645)
-- DATE: 2025-01-23
-- ENVIRONNEMENT: PROD
-- AUTEUR: Système
-- ========================================================================

BEGIN;

-- ⚠️ VÉRIFICATION AVANT SUPPRESSION
SELECT
  id,
  first_name,
  last_name,
  phone_number,
  restaurant_id,
  is_active,
  created_at
FROM france_delivery_drivers
WHERE phone_number = '33620951645';

-- 📊 COMPTER LES COMMANDES ASSIGNÉES (pour info)
SELECT
  COUNT(*) as commandes_assignees,
  restaurant_id
FROM france_orders
WHERE driver_id = 30
GROUP BY restaurant_id;

-- 🗑️ SUPPRESSION DU LIVREUR
DELETE FROM france_delivery_drivers
WHERE phone_number = '33620951645';

-- ✅ VÉRIFICATION APRÈS SUPPRESSION
SELECT COUNT(*) as livreurs_restants
FROM france_delivery_drivers
WHERE restaurant_id = 22;

-- 📋 AFFICHER RÉSULTAT
SELECT 'Livreur alpha supprimé avec succès' as resultat;

-- ⚠️ IMPORTANT : Vérifier les résultats ci-dessus avant de valider !
-- Si tout est OK, exécuter :
COMMIT;

-- En cas de problème, annuler avec :
-- ROLLBACK;
