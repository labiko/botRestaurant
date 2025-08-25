-- ===============================================
-- LIER LES LIVREURS AUX RESTAURANTS
-- ===============================================

-- Option 1: Ajouter une colonne restaurant_id (livreur dédié à UN restaurant)
ALTER TABLE public.delivery_users 
ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL;

-- Créer un index pour les requêtes
CREATE INDEX idx_delivery_users_restaurant ON public.delivery_users(restaurant_id);

-- ===============================================
-- OU Option 2: Table de liaison (livreur peut travailler pour PLUSIEURS restaurants)
-- ===============================================

-- Créer table de liaison many-to-many
CREATE TABLE IF NOT EXISTS public.restaurant_delivery_users (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    delivery_user_id BIGINT NOT NULL REFERENCES public.delivery_users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Empêcher les doublons
    UNIQUE(restaurant_id, delivery_user_id)
);

-- Index pour les requêtes rapides
CREATE INDEX idx_restaurant_delivery_restaurant ON public.restaurant_delivery_users(restaurant_id);
CREATE INDEX idx_restaurant_delivery_user ON public.restaurant_delivery_users(delivery_user_id);

-- ===============================================
-- EXEMPLES D'UTILISATION
-- ===============================================

-- Pour Option 1 (restaurant_id dans delivery_users):
-- Assigner un livreur à un restaurant spécifique
UPDATE public.delivery_users 
SET restaurant_id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90'
WHERE id = 1;

-- Récupérer les livreurs d'un restaurant
SELECT * FROM public.delivery_users 
WHERE restaurant_id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90' 
AND status = 'actif' AND is_online = true;

-- ===============================================

-- Pour Option 2 (table de liaison):
-- Assigner un livreur à un restaurant
INSERT INTO public.restaurant_delivery_users (restaurant_id, delivery_user_id)
VALUES ('a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90', 1);

-- Récupérer les livreurs d'un restaurant avec table de liaison
SELECT du.* 
FROM public.delivery_users du
JOIN public.restaurant_delivery_users rdu ON du.id = rdu.delivery_user_id
WHERE rdu.restaurant_id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90'
AND rdu.is_active = true
AND du.status = 'actif' 
AND du.is_online = true;

-- ===============================================
-- RECOMMANDATION
-- ===============================================

/*
Option 1: Si un livreur travaille pour UN SEUL restaurant
Option 2: Si un livreur peut travailler pour PLUSIEURS restaurants (plus flexible)

Pour votre cas, je recommande Option 2 (table de liaison) car:
- Plus flexible
- Un livreur peut couvrir plusieurs restaurants
- Meilleure évolutivité
*/