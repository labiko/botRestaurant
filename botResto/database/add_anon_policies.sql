-- ===============================================
-- AJOUT POLICIES RLS POUR ANON KEY
-- ===============================================
-- Résoudre l'erreur 406 - Permettre accès anon aux données

-- ===============================================
-- 1. RESTAURANTS - Lecture publique
-- ===============================================

CREATE POLICY "Allow anon read restaurants" ON public.restaurants
  FOR SELECT USING (true);

-- ===============================================
-- 2. MENUS - Lecture publique des menus disponibles
-- ===============================================

CREATE POLICY "Allow anon read menus" ON public.menus
  FOR SELECT USING (disponible = true);

-- ===============================================
-- 3. COMMANDES - Lecture/écriture pour anon
-- ===============================================

CREATE POLICY "Allow anon access commandes" ON public.commandes
  FOR ALL USING (true);

-- ===============================================
-- 4. CLIENTS - Lecture/écriture pour anon
-- ===============================================

CREATE POLICY "Allow anon access clients" ON public.clients
  FOR ALL USING (true);

-- ===============================================
-- 5. DELIVERY_USERS - Lecture pour anon
-- ===============================================

CREATE POLICY "Allow anon read delivery_users" ON public.delivery_users
  FOR SELECT USING (true);

-- ===============================================
-- 6. RESTAURANT_USERS - Lecture pour anon
-- ===============================================

CREATE POLICY "Allow anon read restaurant_users" ON public.restaurant_users
  FOR SELECT USING (true);

-- ===============================================
-- 7. SESSIONS - Accès complet pour anon
-- ===============================================

CREATE POLICY "Allow anon access sessions" ON public.sessions
  FOR ALL USING (true);

-- ===============================================
-- VÉRIFICATION
-- ===============================================

-- Tester l'accès aux restaurants
SELECT id, nom, statut FROM restaurants LIMIT 5;

-- Tester l'accès aux horaires
SELECT id, nom, horaires FROM restaurants 
WHERE id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90';