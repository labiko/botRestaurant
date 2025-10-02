-- ========================================================================
-- VERSION: v1
-- DATE: 2025-10-02
-- PROBLÈME RÉSOLU: Ajout flag pour identifier les commandes de test
-- CHANGEMENTS: Ajout colonne is_test_order + index pour commandes test
-- ========================================================================

-- Ajouter un flag pour identifier les commandes de test
ALTER TABLE france_orders
ADD COLUMN IF NOT EXISTS is_test_order BOOLEAN DEFAULT false;

-- Index pour filtrer les commandes test
CREATE INDEX IF NOT EXISTS idx_france_orders_is_test_order
ON france_orders(is_test_order)
WHERE is_test_order = true;

-- Commentaire
COMMENT ON COLUMN france_orders.is_test_order IS 'Indique si la commande est une commande de test pour valider la configuration Stripe/webhook';
