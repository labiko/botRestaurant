-- ===============================================
-- DÉSACTIVER RLS TEMPORAIREMENT - SOLUTION SIMPLE
-- ===============================================
-- Pour tester rapidement l'application sans politique complexe

-- Désactiver RLS sur toutes les tables
ALTER TABLE public.restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_webhook DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_users DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les policies existantes (optionnel - pour nettoyer)
DROP POLICY IF EXISTS "Service role has full access to restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Service role has full access to menus" ON public.menus;
DROP POLICY IF EXISTS "Service role has full access to clients" ON public.clients;
DROP POLICY IF EXISTS "Service role has full access to commandes" ON public.commandes;
DROP POLICY IF EXISTS "Service role has full access to sessions" ON public.sessions;
DROP POLICY IF EXISTS "Service role has full access to logs" ON public.logs_webhook;

-- Test simple
SELECT 'RLS DÉSACTIVÉ - Application libre d''accéder aux données' as status;