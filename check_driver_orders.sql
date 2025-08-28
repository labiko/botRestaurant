-- Vérifier toutes les commandes du livreur test
SELECT 
  numero_commande,
  statut,
  mode,
  livreur_phone,
  assigned_at,
  accepted_by_delivery_at,
  delivered_at,
  created_at
FROM commandes 
WHERE livreur_phone = '+33667326357'
ORDER BY created_at DESC;

-- Vérifier spécifiquement les commandes livrées
SELECT 'COMMANDES LIVRÉES:' as info;
SELECT 
  numero_commande,
  statut,
  delivered_at,
  EXTRACT(EPOCH FROM (NOW() - delivered_at))/3600 as heures_depuis_livraison
FROM commandes 
WHERE livreur_phone = '+33667326357' 
  AND statut = 'livree'
  AND delivered_at IS NOT NULL
ORDER BY delivered_at DESC;