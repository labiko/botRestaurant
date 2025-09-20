-- 🍕 EXTRACTION COMPLÈTE PIZZA YOLO 77 - RÉFÉRENCE POUR IA
-- ========================================================
-- Objectif: Extraire TOUTE la structure réelle qui fonctionne
-- Usage: Entraîner l'IA avec de vraies données validées

-- 1. INFORMATIONS RESTAURANT
-- ==========================
SELECT
    '=== RESTAURANT PIZZA YOLO 77 ===' as section,
    id,
    name,
    slug,
    address,
    city,
    phone,
    whatsapp_number,
    delivery_zone_km,
    delivery_fee,
    business_hours::text as horaires_complets,
    created_at,
    updated_at
FROM france_restaurants
WHERE name = 'Pizza Yolo 77';

-- 2. STRUCTURE COMPLÈTE DES CATÉGORIES
-- ====================================
SELECT
    '=== CATÉGORIES PIZZA YOLO 77 ===' as section,
    c.id,
    c.name as category_name,
    c.slug as category_slug,
    c.icon,
    c.display_order,
    COUNT(p.id) as nb_produits,
    COUNT(CASE WHEN p.requires_steps = true THEN 1 END) as nb_composites,
    COUNT(CASE WHEN p.requires_steps = false THEN 1 END) as nb_simples
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id
WHERE c.restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')
GROUP BY c.id, c.name, c.slug, c.icon, c.display_order
ORDER BY c.display_order;

-- 3. TOUS LES PRODUITS AVEC DÉTAILS COMPLETS
-- ==========================================
SELECT
    '=== PRODUITS PIZZA YOLO 77 ===' as section,
    c.name as categorie,
    c.display_order as cat_order,
    p.id as product_id,
    p.name as product_name,
    p.description,
    p.price_on_site_base,
    p.price_delivery_base,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.display_order as product_order,
    p.is_active,
    CASE
        WHEN p.steps_config IS NOT NULL
        THEN p.steps_config::text
        ELSE 'NULL'
    END as steps_config_json
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')
ORDER BY c.display_order, p.display_order;

-- 4. CONFIGURATIONS WORKFLOWS DÉTAILLÉES
-- ======================================
SELECT
    '=== WORKFLOWS COMPOSITES PIZZA YOLO 77 ===' as section,
    c.name as categorie,
    p.name as produit,
    p.price_on_site_base,
    p.price_delivery_base,
    p.workflow_type,
    -- Extraction détaillée des étapes
    json_array_length(p.steps_config->'steps') as nb_etapes,
    p.steps_config->>'final_format' as format_final,
    p.steps_config->'display_config' as display_config,
    p.steps_config::text as configuration_complete
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')
  AND p.requires_steps = true
  AND p.steps_config IS NOT NULL
ORDER BY c.display_order, p.display_order;

-- 5. ANALYSE DES ÉTAPES INDIVIDUELLES
-- ===================================
WITH steps_analysis AS (
    SELECT
        c.name as categorie,
        p.name as produit,
        step_data.step_number,
        step_data.step_type,
        step_data.title,
        step_data.is_required,
        json_array_length(step_data.options) as nb_options,
        step_data.options as options_array
    FROM france_products p
    JOIN france_menu_categories c ON p.category_id = c.id
    CROSS JOIN LATERAL json_array_elements(p.steps_config->'steps') WITH ORDINALITY AS t(step_info, step_index)
    CROSS JOIN LATERAL json_to_record(step_info) AS step_data(
        step_number int,
        step_type text,
        title text,
        prompt text,
        is_required boolean,
        max_selections int,
        options json
    )
    WHERE p.restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')
      AND p.requires_steps = true
)
SELECT
    '=== ANALYSE ÉTAPES PIZZA YOLO 77 ===' as section,
    categorie,
    produit,
    step_number,
    step_type,
    title,
    is_required,
    nb_options,
    options_array::text as options_details
FROM steps_analysis
ORDER BY categorie, produit, step_number;

-- 6. ANALYSE DES OPTIONS INDIVIDUELLES
-- ====================================
WITH options_analysis AS (
    SELECT
        c.name as categorie,
        p.name as produit,
        step_data.step_number,
        step_data.title as step_title,
        option_data.name as option_name,
        option_data.price_modifier,
        option_data.description as option_description
    FROM france_products p
    JOIN france_menu_categories c ON p.category_id = c.id
    CROSS JOIN LATERAL json_array_elements(p.steps_config->'steps') AS step_info
    CROSS JOIN LATERAL json_to_record(step_info) AS step_data(
        step_number int,
        step_type text,
        title text,
        options json
    )
    CROSS JOIN LATERAL json_array_elements(step_data.options) AS option_info
    CROSS JOIN LATERAL json_to_record(option_info) AS option_data(
        name text,
        price_modifier numeric,
        description text
    )
    WHERE p.restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')
      AND p.requires_steps = true
)
SELECT
    '=== OPTIONS PIZZA YOLO 77 ===' as section,
    categorie,
    produit,
    step_number,
    step_title,
    option_name,
    price_modifier,
    CASE
        WHEN option_description IS NOT NULL
        THEN option_description
        ELSE 'Pas de description'
    END as option_description
FROM options_analysis
ORDER BY categorie, produit, step_number, option_name;

-- 7. TEMPLATES JSON COMPLETS POUR IA
-- ==================================
SELECT
    '=== TEMPLATES JSON POUR IA ===' as section,
    json_build_object(
        'restaurant_reference', 'Pizza Yolo 77',
        'extraction_date', CURRENT_TIMESTAMP,
        'categories', (
            SELECT json_agg(
                json_build_object(
                    'name', c.name,
                    'slug', c.slug,
                    'icon', c.icon,
                    'display_order', c.display_order,
                    'products_simple', (
                        SELECT json_agg(
                            json_build_object(
                                'name', p.name,
                                'price_on_site', p.price_on_site_base,
                                'price_delivery', p.price_delivery_base,
                                'product_type', p.product_type,
                                'workflow_type', p.workflow_type,
                                'requires_steps', p.requires_steps,
                                'display_order', p.display_order
                            ) ORDER BY p.display_order
                        )
                        FROM france_products p
                        WHERE p.category_id = c.id AND p.requires_steps = false
                    ),
                    'products_composite', (
                        SELECT json_agg(
                            json_build_object(
                                'name', p.name,
                                'price_on_site', p.price_on_site_base,
                                'price_delivery', p.price_delivery_base,
                                'product_type', p.product_type,
                                'workflow_type', p.workflow_type,
                                'requires_steps', p.requires_steps,
                                'steps_config', p.steps_config,
                                'display_order', p.display_order
                            ) ORDER BY p.display_order
                        )
                        FROM france_products p
                        WHERE p.category_id = c.id AND p.requires_steps = true
                    )
                ) ORDER BY c.display_order
            )
            FROM france_menu_categories c
            WHERE c.restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')
        ),
        'statistics', json_build_object(
            'total_categories', (SELECT COUNT(*) FROM france_menu_categories WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')),
            'total_products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')),
            'simple_products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77') AND requires_steps = false),
            'composite_products', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77') AND requires_steps = true)
        )
    )::text as structure_complete_pour_ia;

-- 8. PATTERNS DE RÉUSSITE IDENTIFIÉS
-- ==================================
SELECT
    '=== PATTERNS DE RÉUSSITE ===' as section,
    'CATÉGORIES' as type_pattern,
    json_build_object(
        'pattern_naming', 'Noms clairs avec emoji descriptif',
        'pattern_icons', string_agg(DISTINCT c.icon, ', '),
        'pattern_slugs', 'kebab-case avec caractères spéciaux supprimés',
        'examples', json_agg(DISTINCT
            json_build_object(
                'name', c.name,
                'icon', c.icon,
                'slug', c.slug
            )
        )
    )::text as pattern_details
FROM france_menu_categories c
WHERE c.restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')

UNION ALL

SELECT
    '=== PATTERNS DE RÉUSSITE ===' as section,
    'WORKFLOWS_COMPOSITES' as type_pattern,
    json_build_object(
        'pattern_structure', 'steps array avec options obligatoires',
        'pattern_options', 'Chaque option a name et price_modifier',
        'pattern_types', string_agg(DISTINCT p.workflow_type, ', '),
        'pattern_step_types', (
            SELECT string_agg(DISTINCT step_data.step_type, ', ')
            FROM france_products p2
            CROSS JOIN LATERAL json_array_elements(p2.steps_config->'steps') AS step_info
            CROSS JOIN LATERAL json_to_record(step_info) AS step_data(step_type text)
            WHERE p2.restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')
              AND p2.requires_steps = true
        )
    )::text as pattern_details
FROM france_products p
WHERE p.restaurant_id = (SELECT id FROM france_restaurants WHERE name = 'Pizza Yolo 77')
  AND p.requires_steps = true;