-- ===================================
-- MIGRATION À EXÉCUTER MANUELLEMENT
-- ===================================
-- Date: 2025-08-25
-- Description: Ajouter la colonne is_blocked à la table delivery_users

-- Ajouter la colonne is_blocked
ALTER TABLE public.delivery_users 
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false NOT NULL;

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_delivery_users_is_blocked ON public.delivery_users (is_blocked);
CREATE INDEX IF NOT EXISTS idx_delivery_users_restaurant_blocked ON public.delivery_users (restaurant_id, is_blocked);

-- Ajouter le commentaire
COMMENT ON COLUMN public.delivery_users.is_blocked IS 'Indique si le livreur est bloqué par le restaurant (déconnexion automatique)';

-- Vérifier la structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'delivery_users' 
AND column_name = 'is_blocked';