-- Migration pour ajouter le champ assigned_at à la table commandes
-- Date d'assignation de la commande au livreur

ALTER TABLE commandes 
ADD COLUMN assigned_at timestamptz DEFAULT NULL;

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN commandes.assigned_at IS 'Date et heure d''assignation de la commande au livreur';