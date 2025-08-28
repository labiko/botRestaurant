-- Créer une commande livrée pour test de l'historique
-- (À adapter avec un ID de restaurant et client existants)

-- 1. Vérifier les IDs existants
SELECT 'Restaurants disponibles:' as info;
SELECT id, nom FROM restaurants LIMIT 3;

SELECT 'Clients disponibles:' as info;
SELECT id, nom FROM clients LIMIT 3;

-- 2. Créer une commande test livrée (adapter les IDs)
INSERT INTO commandes (
  numero_commande,
  restaurant_id, 
  client_id,
  total,
  statut,
  paiement_mode,
  paiement_statut,
  livreur_phone,
  livreur_nom,
  delivered_at,
  created_at
) VALUES (
  'TEST-' || EXTRACT(EPOCH FROM NOW())::text,
  (SELECT id FROM restaurants LIMIT 1), -- Premier restaurant
  (SELECT id FROM clients LIMIT 1),     -- Premier client  
  15000,
  'livree',
  'livraison',
  'paye',
  '+33667326357',
  'balde dieynabou',
  NOW() - INTERVAL '2 hours',  -- Livré il y a 2h
  NOW() - INTERVAL '3 hours'   -- Créé il y a 3h
);

-- 3. Vérifier la commande créée
SELECT 
  numero_commande, 
  statut, 
  livreur_phone, 
  delivered_at,
  created_at 
FROM commandes 
WHERE numero_commande LIKE 'TEST-%' 
ORDER BY created_at DESC 
LIMIT 1;