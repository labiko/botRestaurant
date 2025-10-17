-- Script pour comprendre les données utilisées par le bot

-- 1. Vérifier les restaurants disponibles
SELECT id, name, is_active, created_at
FROM france_restaurants
WHERE is_active = true
ORDER BY id;

-- 2. Vérifier les produits d'un restaurant (ex: pizza yolo = 16)
SELECT
  id,
  name,
  category_id,
  workflow_type,
  requires_steps,
  is_active,
  base_price,
  price_delivery_base
FROM france_products
WHERE restaurant_id = 16
  AND is_active = true
ORDER BY category_id, display_order;

-- 3. Vérifier les catégories
SELECT id, name, restaurant_id
FROM france_menu_categories
WHERE restaurant_id = 16
  AND is_active = true;

-- 4. Voir les logs récents de la function bot
SELECT created_at, level, msg
FROM edge_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;