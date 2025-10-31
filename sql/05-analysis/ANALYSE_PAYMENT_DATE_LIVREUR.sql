-- Analyser les commandes avec paiement en ligne pour comprendre pourquoi la date ne s'affiche pas

-- 1. Vérifier les colonnes disponibles dans france_orders
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'france_orders' 
  AND column_name IN ('online_payment_status', 'payment_date', 'payment_link_sent_at')
ORDER BY column_name;

-- 2. Vérifier les commandes assignées aux livreurs avec statut de paiement
SELECT 
  id,
  order_number,
  status,
  driver_id,
  online_payment_status,
  payment_date,
  payment_link_sent_at,
  created_at,
  updated_at
FROM france_orders
WHERE driver_id IS NOT NULL
  AND status IN ('assignee', 'en_livraison')
ORDER BY created_at DESC
LIMIT 10;

-- 3. Vérifier toutes les commandes avec paiement effectué (paid)
SELECT 
  id,
  order_number,
  status,
  driver_id,
  online_payment_status,
  payment_date,
  payment_link_sent_at,
  TO_CHAR(payment_date, 'DD/MM HH24:MI') as formatted_payment_date
FROM france_orders
WHERE online_payment_status = 'paid'
ORDER BY created_at DESC
LIMIT 10;
