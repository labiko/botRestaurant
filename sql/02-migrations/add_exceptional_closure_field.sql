-- Ajout du champ pour fermeture exceptionnelle
-- Ce champ permet de fermer temporairement un restaurant sans affecter is_active

BEGIN;

-- Ajouter uniquement le champ is_exceptionally_closed
ALTER TABLE public.france_restaurants 
ADD COLUMN is_exceptionally_closed boolean DEFAULT false;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.france_restaurants.is_exceptionally_closed 
IS 'Indique si le restaurant est temporairement fermé (congés, problème technique, etc.) - indépendant des horaires normaux';

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'france_restaurants' 
AND column_name = 'is_exceptionally_closed';

COMMIT;