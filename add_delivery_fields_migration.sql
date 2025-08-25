-- Migration pour ajouter les champs manquants pour la gestion des livreurs
-- Date d'acceptation par le livreur et code de validation

-- Ajouter la colonne pour la date d'acceptation par le livreur
ALTER TABLE commandes 
ADD COLUMN accepted_by_delivery_at timestamptz DEFAULT NULL;

-- Ajouter la colonne pour le code de validation à 4 chiffres
ALTER TABLE commandes 
ADD COLUMN validation_code varchar(4) DEFAULT NULL;

-- Commentaires pour documenter les colonnes
COMMENT ON COLUMN commandes.accepted_by_delivery_at IS 'Date et heure d''acceptation de la commande par le livreur';
COMMENT ON COLUMN commandes.validation_code IS 'Code de validation à 4 chiffres pour confirmer la livraison';