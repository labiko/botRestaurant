-- 🔍 EXTRACTION COMPLÈTE DES CONFIGURATIONS POUR ENTRAÎNEMENT IA
-- ================================================================

-- 1. DIAGNOSTIC IMMÉDIAT - Problème Panini
-- =========================================
SELECT
    '=== DIAGNOSTIC PANINI ===' as section,
    r.name as restaurant,
    p.name as produit,
    p.steps_config::text as config_json
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE (p.name ILIKE '%panini%' OR p.name ILIKE '%choix%')
  AND p.requires_steps = true;

-- 2. TOUS LES WORKFLOWS COMPOSITES EXISTANTS
-- ==========================================
SELECT
    '=== WORKFLOWS EXISTANTS ===' as section,
    r.name as restaurant,
    c.name as categorie,
    p.name as produit,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config::text as config_detaille
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.requires_steps = true
  AND p.steps_config IS NOT NULL
ORDER BY r.name, c.display_order, p.display_order;

-- 3. EXTRACTION STRUCTURE COMPLÈTE PAR RESTAURANT
-- ===============================================
SELECT
    '=== STRUCTURE COMPLÈTE ===' as section,
    r.name as restaurant_name,
    json_build_object(
        'restaurant_info', json_build_object(
            'name', r.name,
            'slug', r.slug,
            'address', r.address,
            'phone', r.phone,
            'delivery_zone_km', r.delivery_zone_km,
            'delivery_fee', r.delivery_fee
        ),
        'categories', (
            SELECT json_agg(
                json_build_object(
                    'name', mc.name,
                    'slug', mc.slug,
                    'icon', mc.icon,
                    'display_order', mc.display_order,
                    'products', (
                        SELECT json_agg(
                            json_build_object(
                                'name', p.name,
                                'price_on_site_base', p.price_on_site_base,
                                'price_delivery_base', p.price_delivery_base,
                                'product_type', p.product_type,
                                'workflow_type', p.workflow_type,
                                'requires_steps', p.requires_steps,
                                'steps_config', p.steps_config,
                                'display_order', p.display_order,
                                'is_active', p.is_active
                            ) ORDER BY p.display_order
                        )
                        FROM france_products p
                        WHERE p.category_id = mc.id
                    )
                ) ORDER BY mc.display_order
            )
            FROM france_menu_categories mc
            WHERE mc.restaurant_id = r.id
        ),
        'statistics', json_build_object(
            'total_categories', (SELECT COUNT(*) FROM france_menu_categories WHERE restaurant_id = r.id),
            'total_products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = r.id),
            'composite_products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = r.id AND requires_steps = true),
            'simple_products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = r.id AND requires_steps = false)
        )
    )::text as structure_complete
FROM france_restaurants r
WHERE r.is_active = true
ORDER BY r.name;

-- 4. ANALYSE DES PATTERNS DE STEPS_CONFIG
-- =======================================
SELECT
    '=== PATTERNS STEPS_CONFIG ===' as section,
    COUNT(*) as nb_produits,
    json_extract_path_text(p.steps_config, 'steps', '0', 'step_type') as premier_step_type,
    json_extract_path_text(p.steps_config, 'steps', '0', 'title') as premier_titre,
    json_array_length(json_extract_path(p.steps_config, 'steps')) as nb_etapes,
    STRING_AGG(DISTINCT r.name, ', ') as restaurants
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE p.requires_steps = true
  AND p.steps_config IS NOT NULL
GROUP BY
    json_extract_path_text(p.steps_config, 'steps', '0', 'step_type'),
    json_extract_path_text(p.steps_config, 'steps', '0', 'title'),
    json_array_length(json_extract_path(p.steps_config, 'steps'))
ORDER BY nb_produits DESC;

-- 5. EXEMPLES RÉUSSIS DE WORKFLOWS POUR TEMPLATES
-- ===============================================
SELECT
    '=== TEMPLATES RÉUSSIS ===' as section,
    r.name as restaurant,
    p.name as produit_exemple,
    p.steps_config::text as template_json,
    c.name as categorie
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.requires_steps = true
  AND p.steps_config IS NOT NULL
  AND r.name = 'Pizza Yolo 77'  -- Restaurant de référence
ORDER BY c.display_order, p.display_order;

-- 6. ANALYSE DES PROBLÈMES POTENTIELS
-- ===================================
SELECT
    '=== PROBLÈMES DÉTECTÉS ===' as section,
    r.name as restaurant,
    p.name as produit,
    CASE
        WHEN p.requires_steps = true AND p.steps_config IS NULL THEN 'steps_config manquant'
        WHEN p.requires_steps = true AND p.steps_config::text = '{}' THEN 'steps_config vide'
        WHEN p.requires_steps = true AND json_array_length(json_extract_path(p.steps_config, 'steps')) = 0 THEN 'aucune étape définie'
        WHEN p.requires_steps = false AND p.steps_config IS NOT NULL THEN 'steps_config inutile'
        ELSE 'configuration ok'
    END as probleme_detecte,
    p.steps_config::text as config_actuelle
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE
    (p.requires_steps = true AND (p.steps_config IS NULL OR p.steps_config::text = '{}' OR json_array_length(json_extract_path(p.steps_config, 'steps')) = 0))
    OR
    (p.requires_steps = false AND p.steps_config IS NOT NULL)
ORDER BY r.name, probleme_detecte;