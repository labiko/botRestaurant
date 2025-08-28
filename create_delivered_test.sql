-- Créer une commande test livrée pour vérifier l'historique

-- 1. D'abord vérifier qu'on a des données de base
SELECT 'RESTAURANTS:' as info;
SELECT id, nom FROM restaurants LIMIT 3;

SELECT 'CLIENTS:' as info;  
SELECT id, nom FROM clients LIMIT 3;

-- 2. Créer une commande test livrée (à exécuter séparément)
INSERT INTO commandes (
  numero_commande,
  restaurant_id,
  client_id,
  total,
  frais_livraison,
  statut,
  mode,
  paiement_mode,
  paiement_statut,
  adresse_livraison,
  latitude_livraison,
  longitude_livraison,
  livreur_phone,
  livreur_nom,
  assigned_at,
  accepted_by_delivery_at,
  delivered_at,
  created_at,
  items
) VALUES (
  'HIST-' || EXTRACT(EPOCH FROM NOW())::int,
  (SELECT id FROM restaurants LIMIT 1),
  (SELECT id FROM clients LIMIT 1),
  25000,
  3000,
  'livree',                    -- ✅ Statut livré
  'livraison',
  'livraison', 
  'paye',
  'Test Address Conakry',
  9.6412,
  -13.5784,
  '+33667326357',              -- ✅ Téléphone du livreur test
  'balde dieynabou',
  NOW() - INTERVAL '4 hours',  -- Assigné il y a 4h
  NOW() - INTERVAL '3 hours',  -- Accepté il y a 3h  
  NOW() - INTERVAL '1 hour',   -- ✅ Livré il y a 1h
  NOW() - INTERVAL '5 hours',  -- Créé il y a 5h
  '[{"nom_plat": "Riz au poisson", "quantite": 1, "prix_unitaire": 22000}]'
);

-- 3. Vérifier la commande créée
SELECT 'COMMANDE CRÉÉE:' as info;
SELECT 
  numero_commande,
  statut,
  livreur_phone,
  assigned_at,
  delivered_at,
  created_at
FROM commandes 
WHERE numero_commande LIKE 'HIST-%'
ORDER BY created_at DESC
LIMIT 1;