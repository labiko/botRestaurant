-- Vérifier le statut de versement de la commande
SELECT 
  numero_commande,
  paiement_statut,
  versement_confirmed,
  statut,
  livreur_phone,
  total,
  delivered_at
FROM commandes 
WHERE numero_commande = '2508-0002';

-- Si versement_confirmed est NULL, le mettre à FALSE explicitement
UPDATE commandes 
SET versement_confirmed = false
WHERE numero_commande = '2508-0002' 
  AND versement_confirmed IS NULL;

-- Vérifier après mise à jour
SELECT 
  numero_commande,
  paiement_statut,
  versement_confirmed,
  statut,
  livreur_phone
FROM commandes 
WHERE numero_commande = '2508-0002';