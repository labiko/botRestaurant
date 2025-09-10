-- Vérifier l'état de la session pour diagnostiquer le problème choix 13 invalide
-- Client qui a testé: probablement le numéro de test

-- 1. Chercher la session active récente
SELECT 
  id,
  phone_number,
  current_step,
  restaurant_id,
  created_at,
  updated_at,
  session_data,
  cart_items,
  total_amount
FROM france_user_sessions 
WHERE phone_number LIKE '%33753058254%' -- Numéro de test
   OR updated_at > NOW() - INTERVAL '30 minutes' -- Sessions récentes
ORDER BY updated_at DESC
LIMIT 5;

-- 2. Vérifier les catégories disponibles pour le restaurant
SELECT 
  id,
  name,
  slug,
  display_order,
  is_active
FROM france_menu_categories 
WHERE restaurant_id = 77 -- Pizza Yolo 77
  AND is_active = true
ORDER BY display_order;

-- 3. Compter les catégories actives (devrait être 21)
SELECT COUNT(*) as total_categories
FROM france_menu_categories 
WHERE restaurant_id = 77 
  AND is_active = true;

-- 4. Chercher la catégorie #13 spécifiquement
SELECT 
  ROW_NUMBER() OVER (ORDER BY display_order) as position,
  id,
  name,
  slug,
  display_order,
  is_active
FROM france_menu_categories 
WHERE restaurant_id = 77 
  AND is_active = true
ORDER BY display_order;