-- 🔍 ANALYSE DES PLANS D'EXÉCUTION - 5 REQUÊTES MONITORÉES
-- Exécuter ces requêtes dans l'éditeur SQL Supabase pour identifier les index manquants

-- ============================================================================
-- REQUÊTE #1 - PIZZA_WITH_SIZES_INNER_JOIN
-- Fichier: PizzaDisplayService.ts:330-342
-- ============================================================================

EXPLAIN (ANALYZE true, BUFFERS true, VERBOSE true)
SELECT p.*, ps.*
FROM france_products p
INNER JOIN france_product_sizes ps ON p.id = ps.product_id
WHERE ps.size_name = 'Medium'  -- Remplacer par une vraie taille de votre DB
  AND p.category_id = 1        -- Remplacer par un vrai category_id
  AND p.is_active = true
ORDER BY p.display_order;

-- À chercher dans le plan :
-- - Seq Scan sur france_products = INDEX MANQUANT sur (category_id, is_active, display_order)
-- - Seq Scan sur france_product_sizes = INDEX MANQUANT sur (product_id, size_name)
-- - Nested Loop / Hash Join coûteux = INDEX MANQUANT pour le JOIN

-- ============================================================================
-- REQUÊTE #2 - SESSION_SELECT_STAR_WITH_JSON
-- Fichier: SessionManager.ts:65-73
-- ============================================================================

EXPLAIN (ANALYZE true, BUFFERS true, VERBOSE true)
SELECT *
FROM france_user_sessions
WHERE phone_number = '33123456789@c.us'  -- Remplacer par un vrai phone
  AND expires_at > NOW()
LIMIT 1;

-- À chercher dans le plan :
-- - Seq Scan sur france_user_sessions = INDEX MANQUANT sur (phone_number, expires_at)
-- - Coût élevé sur JSONB sessionData = Considérer colonnes spécifiques au lieu de SELECT *

-- ============================================================================
-- REQUÊTE #3 - PRODUCT_OPTIONS_DOUBLE_ORDER_BY
-- Fichier: CompositeWorkflowExecutor.ts:427-435
-- ============================================================================

EXPLAIN (ANALYZE true, BUFFERS true, VERBOSE true)
SELECT *
FROM france_product_options
WHERE product_id = 1  -- Remplacer par un vrai product_id
ORDER BY group_order ASC, display_order ASC;

-- À chercher dans le plan :
-- - Seq Scan = INDEX MANQUANT sur product_id
-- - Sort étape séparée = INDEX MANQUANT composite (product_id, group_order, display_order)

-- ============================================================================
-- REQUÊTE #4 - RESTAURANTS_WITH_GEOLOCATION
-- Fichier: RestaurantDiscoveryService.ts:49-57
-- ============================================================================

EXPLAIN (ANALYZE true, BUFFERS true, VERBOSE true)
SELECT id, name, latitude, longitude, delivery_zone_km, is_active, is_exceptionally_closed, business_hours
FROM france_restaurants
WHERE is_active = true
  AND is_exceptionally_closed = false
ORDER BY name;

-- À chercher dans le plan :
-- - Seq Scan = INDEX MANQUANT sur (is_active, is_exceptionally_closed)
-- - Sort étape séparée = INDEX MANQUANT composite (is_active, is_exceptionally_closed, name)

-- ============================================================================
-- REQUÊTE #5 - DYNAMIC_PRODUCT_QUERY_WITH_JOINS
-- Fichier: ProductQueryService.ts:61-64 (requête construite dynamiquement)
-- ============================================================================

-- Version typique générée par buildSelectClause()
EXPLAIN (ANALYZE true, BUFFERS true, VERBOSE true)
SELECT p.*, 
       mc.id as cat_id, mc.name as cat_name, mc.slug as cat_slug,
       ps.id as size_id, ps.size_name, ps.price_on_site, ps.price_delivery
FROM france_products p
LEFT JOIN france_menu_categories mc ON p.category_id = mc.id
LEFT JOIN france_product_sizes ps ON p.id = ps.product_id
WHERE p.restaurant_id = 1  -- Remplacer par un vrai restaurant_id
  AND p.is_active = true
ORDER BY p.display_order;

-- À chercher dans le plan :
-- - Seq Scan sur france_products = INDEX MANQUANT sur (restaurant_id, is_active, display_order)
-- - Hash Join coûteux = Vérifier index sur les clés de JOIN
-- - Sort étape séparée = INDEX inclus display_order dans l'index composite

-- ============================================================================
-- INSTRUCTIONS D'EXÉCUTION
-- ============================================================================

/*
1. Ouvrir Supabase Dashboard → SQL Editor
2. Remplacer les valeurs exemples par des vraies données de votre DB
3. Exécuter chaque EXPLAIN ANALYZE individuellement
4. Analyser les résultats :

INDICATEURS DE PROBLÈMES :
- "Seq Scan" = Pas d'index utilisé
- "Sort" = Tri en mémoire (coûteux)
- "cost=X..Y" élevé = Requête lente
- "actual time=X..Y" élevé = Temps d'exécution long
- "Buffers: shared hit=X read=Y" = I/O disque élevé

INDICATEURS OPTIMAUX :
- "Index Scan" ou "Index Only Scan"
- "cost" bas (< 100)
- "actual time" bas (< 10ms)
- "Buffers" avec principalement "hit" (cache)

5. Noter les index manquants identifiés
6. Passer à la création des index optimisés
*/