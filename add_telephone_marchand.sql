-- Ajouter le champ telephone_marchand à la table restaurant_payment_config
ALTER TABLE restaurant_payment_config 
ADD COLUMN telephone_marchand VARCHAR(20);

-- Mettre à jour les enregistrements existants avec le numéro par défaut
UPDATE restaurant_payment_config 
SET telephone_marchand = '628406028' 
WHERE telephone_marchand IS NULL;

-- Commentaire sur le champ
COMMENT ON COLUMN restaurant_payment_config.telephone_marchand IS 'Numéro de téléphone du marchand pour les paiements LengoPay';