-- Migration: Ajouter colonne is_blocked à delivery_users
-- Date: 2025-08-25

ALTER TABLE public.delivery_users 
ADD COLUMN is_blocked boolean DEFAULT false NOT NULL;

-- Mettre à jour l'index pour optimiser les requêtes sur is_blocked
CREATE INDEX idx_delivery_users_is_blocked ON public.delivery_users (is_blocked);
CREATE INDEX idx_delivery_users_restaurant_blocked ON public.delivery_users (restaurant_id, is_blocked);

-- Commentaire sur la colonne
COMMENT ON COLUMN public.delivery_users.is_blocked IS 'Indique si le livreur est bloqué par le restaurant (déconnexion automatique)';