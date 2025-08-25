-- Ajouter la colonne devise à la table restaurants
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'GNF' CHECK (currency IN ('GNF', 'XOF', 'EUR', 'USD'));

-- Commentaire sur la colonne
COMMENT ON COLUMN public.restaurants.currency IS 'Devise utilisée par le restaurant (GNF=Guinée, XOF=Mali/CFA, EUR=Euro, USD=Dollar)';

-- Mettre à jour tous les restaurants existants avec GNF par défaut
UPDATE public.restaurants 
SET currency = 'GNF' 
WHERE currency IS NULL;