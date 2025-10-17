-- Test simple : créer une commande livrée pour l'historique

-- Mise à jour d'une commande existante vers "livrée" (plus simple)
UPDATE commandes 
SET 
  statut = 'livree',
  delivered_at = NOW() - INTERVAL '2 hours',
  paiement_statut = 'paye'
WHERE livreur_phone = '+33667326357'
  AND statut IN ('prete', 'en_livraison')
  AND delivered_at IS NULL
LIMIT 1;

-- Vérifier le résultat
SELECT 
  numero_commande,
  statut,
  livreur_phone,
  delivered_at,
  created_at
FROM commandes 
WHERE livreur_phone = '+33667326357'
  AND statut = 'livree'
ORDER BY delivered_at DESC;