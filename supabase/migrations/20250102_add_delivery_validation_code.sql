-- ========================================
-- AJOUT DU SYSTÈME DE CODE DE VALIDATION LIVRAISON
-- ========================================

-- Ajouter les colonnes pour le code de validation
ALTER TABLE france_orders 
ADD COLUMN IF NOT EXISTS delivery_validation_code VARCHAR(4) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS date_validation_code TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Index pour optimisation des recherches par code
CREATE INDEX IF NOT EXISTS idx_france_orders_validation_code 
ON france_orders(delivery_validation_code);

-- Commentaires pour documentation
COMMENT ON COLUMN france_orders.delivery_validation_code IS 'Code à 4 chiffres pour validation de la livraison par le livreur';
COMMENT ON COLUMN france_orders.date_validation_code IS 'Date et heure de validation du code par le livreur';