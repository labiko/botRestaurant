-- ========================================================================
-- DUPLICATION OCV DEMO - VERSION SÉCURISÉE COMPLÈTE
-- ========================================================================
-- DATE: 2025-10-19
-- ENVIRONNEMENT: PRODUCTION
-- SOURCE: Le Nouveau O'CV Moissy (ID: 16)
-- CIBLE: Le Nouveau O'CV - DEMO (Téléphone: 010101010)
-- ========================================================================
-- SÉCURITÉ: Utilise ROW_NUMBER() pour mapper les IDs de façon fiable
-- ⚠️ ATTENTION: Script PROD - Ne modifie AUCUNE donnée existante
-- ========================================================================
-- TABLES DUPLIQUÉES (9 étapes):
--   1. france_restaurants (restaurant de base - deployment_status='testing')
--   2. france_menu_categories (21 catégories)
--   3. france_products (110 produits avec steps_config)
--   4. france_product_options (425 options liées aux produits)
--   5. france_composite_items (38 composants de menus)
--   6. france_restaurant_service_modes (3 modes de service)
--   7. france_product_display_configs (1 config affichage)
--   8. restaurant_vitrine_settings (1 page vitrine)
--   9. restaurant_bot_configs (1 config bot)
-- ========================================================================
-- EXCLUSIONS: Orders, delivery drivers, sessions (données client)
-- ========================================================================

BEGIN;

-- ========================================================================
-- VÉRIFICATION PRÉALABLE
-- ========================================================================

-- Vérifier que le restaurant source existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM france_restaurants WHERE id = 16) THEN
        RAISE EXCEPTION 'Restaurant source OCV (ID: 16) introuvable !';
    END IF;
END $$;

-- Vérifier que le restaurant démo n'existe pas déjà
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM france_restaurants WHERE phone = '010101010') THEN
        RAISE EXCEPTION 'Restaurant démo (010101010) existe déjà ! Supprimer d''abord.';
    END IF;
END $$;

-- ========================================================================
-- ÉTAPE 1 : CRÉER LE RESTAURANT OCV DEMO
-- ========================================================================

INSERT INTO france_restaurants (
    name, slug, phone, whatsapp_number,
    address, city, postal_code,
    latitude, longitude,
    delivery_zone_km, min_order_amount, delivery_fee,
    is_active, business_hours,
    deployment_status, subscription_status,
    country_code, currency, timezone,
    delivery_address_mode,
    hide_delivery_info,
    is_exceptionally_closed,
    audio_notifications_enabled,
    audio_volume,
    auto_print_enabled,
    password_hash,
    created_at, updated_at
)
SELECT
    'Le Nouveau O''CV - DEMO',
    'le-nouveau-ocv-demo',
    '010101010',
    '010101010',
    address,
    city,
    postal_code,
    latitude,
    longitude,
    delivery_zone_km,
    min_order_amount,
    delivery_fee,
    is_active,
    business_hours,
    'testing',
    subscription_status,
    country_code,
    currency,
    timezone,
    delivery_address_mode,
    hide_delivery_info,
    is_exceptionally_closed,
    audio_notifications_enabled,
    audio_volume,
    auto_print_enabled,
    password_hash,
    NOW(),
    NOW()
FROM france_restaurants
WHERE id = 16;

-- Vérification
SELECT 'Restaurant OCV DEMO créé' as etape, id, name, phone
FROM france_restaurants
WHERE phone = '010101010';

-- ========================================================================
-- ÉTAPE 2 : DUPLIQUER LES CATÉGORIES (avec mapping sécurisé)
-- ========================================================================

-- Table temporaire pour mapper les IDs
CREATE TEMP TABLE temp_category_mapping (
    row_num INTEGER,
    old_id INTEGER,
    new_id INTEGER
);

-- Dupliquer les catégories avec numérotation
WITH old_categories AS (
    SELECT
        ROW_NUMBER() OVER (ORDER BY id) as row_num,
        *
    FROM france_menu_categories
    WHERE restaurant_id = 16
),
new_restaurant_id AS (
    SELECT id FROM france_restaurants WHERE phone = '010101010'
),
inserted AS (
    INSERT INTO france_menu_categories (
        restaurant_id, name, slug, icon,
        display_order, is_active, created_at
    )
    SELECT
        (SELECT id FROM new_restaurant_id),
        name,
        slug,
        icon,
        display_order,
        is_active,
        NOW()
    FROM old_categories
    ORDER BY row_num
    RETURNING id
),
new_ids AS (
    SELECT
        ROW_NUMBER() OVER (ORDER BY id) as row_num,
        id
    FROM inserted
)
INSERT INTO temp_category_mapping (row_num, old_id, new_id)
SELECT
    oc.row_num,
    oc.id,
    ni.id
FROM old_categories oc
JOIN new_ids ni ON oc.row_num = ni.row_num;

-- Vérification mapping catégories
SELECT
    'VÉRIF Mapping catégories' as check_type,
    COUNT(*) as total_mappings,
    COUNT(DISTINCT old_id) as old_ids_uniques,
    COUNT(DISTINCT new_id) as new_ids_uniques,
    CASE
        WHEN COUNT(*) = COUNT(DISTINCT old_id)
         AND COUNT(*) = COUNT(DISTINCT new_id)
         AND COUNT(*) = (SELECT COUNT(*) FROM france_menu_categories WHERE restaurant_id = 16)
        THEN '✅ OK'
        ELSE '❌ ERREUR MAPPING'
    END as statut
FROM temp_category_mapping;

-- ========================================================================
-- ÉTAPE 3 : DUPLIQUER LES PRODUITS (avec mapping sécurisé)
-- ========================================================================

CREATE TEMP TABLE temp_product_mapping (
    row_num INTEGER,
    old_id INTEGER,
    new_id INTEGER
);

-- Dupliquer les produits
WITH new_restaurant_id AS (
    SELECT id FROM france_restaurants WHERE phone = '010101010'
),
old_products AS (
    SELECT
        ROW_NUMBER() OVER (ORDER BY fp.id) as row_num,
        fp.*,
        tcm.new_id as new_category_id
    FROM france_products fp
    JOIN temp_category_mapping tcm ON fp.category_id = tcm.old_id
    WHERE fp.restaurant_id = 16
),
inserted AS (
    INSERT INTO france_products (
        restaurant_id, category_id,
        name, description, icon,
        price_on_site_base, price_delivery_base,
        product_type, is_active, display_order,
        steps_config,
        created_at, updated_at
    )
    SELECT
        (SELECT id FROM new_restaurant_id),
        new_category_id,
        name,
        description,
        icon,
        price_on_site_base,
        price_delivery_base,
        product_type,
        is_active,
        display_order,
        steps_config,
        NOW(),
        NOW()
    FROM old_products
    ORDER BY row_num
    RETURNING id
),
new_ids AS (
    SELECT
        ROW_NUMBER() OVER (ORDER BY id) as row_num,
        id
    FROM inserted
)
INSERT INTO temp_product_mapping (row_num, old_id, new_id)
SELECT
    op.row_num,
    op.id,
    ni.id
FROM old_products op
JOIN new_ids ni ON op.row_num = ni.row_num;

-- Vérification mapping produits
SELECT
    'VÉRIF Mapping produits' as check_type,
    COUNT(*) as total_mappings,
    COUNT(DISTINCT old_id) as old_ids_uniques,
    COUNT(DISTINCT new_id) as new_ids_uniques,
    CASE
        WHEN COUNT(*) = COUNT(DISTINCT old_id)
         AND COUNT(*) = COUNT(DISTINCT new_id)
         AND COUNT(*) = (SELECT COUNT(*) FROM france_products WHERE restaurant_id = 16)
        THEN '✅ OK'
        ELSE '❌ ERREUR MAPPING'
    END as statut
FROM temp_product_mapping;

-- ========================================================================
-- ÉTAPE 4 : DUPLIQUER LES PRODUCT OPTIONS (liées aux produits)
-- ========================================================================

-- Options liées à un produit spécifique (ex: boissons pour un menu)
INSERT INTO france_product_options (
    product_id, option_group, option_name,
    price_modifier, is_required, max_selections,
    display_order, is_active, group_order,
    next_group_order, conditional_next_group,
    icon, composition
)
SELECT
    tpm.new_id,
    fpo.option_group,
    fpo.option_name,
    fpo.price_modifier,
    fpo.is_required,
    fpo.max_selections,
    fpo.display_order,
    fpo.is_active,
    fpo.group_order,
    fpo.next_group_order,
    fpo.conditional_next_group,
    fpo.icon,
    fpo.composition
FROM france_product_options fpo
JOIN temp_product_mapping tpm ON fpo.product_id = tpm.old_id;

-- Vérification
SELECT
    'VÉRIF Product options' as check_type,
    COUNT(*) as total_dupliques,
    (
        SELECT COUNT(*)
        FROM france_product_options
        WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 16)
    ) as total_source,
    CASE
        WHEN COUNT(*) = (
            SELECT COUNT(*)
            FROM france_product_options
            WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 16)
        )
        THEN '✅ OK'
        ELSE '❌ ERREUR DUPLICATION'
    END as statut
FROM france_product_options
WHERE product_id IN (
    SELECT new_id FROM temp_product_mapping
);

-- ========================================================================
-- ÉTAPE 5 : DUPLIQUER LES COMPOSITE ITEMS
-- ========================================================================

-- Composants des produits composites (ex: "Plat au choix", "Boisson")
INSERT INTO france_composite_items (
    composite_product_id, component_name,
    quantity, unit, composition
)
SELECT
    tpm.new_id,
    fci.component_name,
    fci.quantity,
    fci.unit,
    fci.composition
FROM france_composite_items fci
JOIN temp_product_mapping tpm ON fci.composite_product_id = tpm.old_id;

-- Vérification
SELECT
    'VÉRIF Composite items' as check_type,
    COUNT(*) as total_dupliques,
    (
        SELECT COUNT(*)
        FROM france_composite_items fci
        JOIN france_products fp ON fci.composite_product_id = fp.id
        WHERE fp.restaurant_id = 16
    ) as total_source,
    CASE
        WHEN COUNT(*) = (
            SELECT COUNT(*)
            FROM france_composite_items fci
            JOIN france_products fp ON fci.composite_product_id = fp.id
            WHERE fp.restaurant_id = 16
        )
        THEN '✅ OK'
        ELSE '❌ ERREUR DUPLICATION'
    END as statut
FROM france_composite_items fci
WHERE fci.composite_product_id IN (
    SELECT new_id FROM temp_product_mapping
);

-- ========================================================================
-- ÉTAPE 6 : DUPLIQUER LES MODES DE SERVICE
-- ========================================================================

INSERT INTO france_restaurant_service_modes (
    restaurant_id, service_mode,
    display_name, description, display_order,
    config, is_enabled, created_at, updated_at
)
SELECT
    (SELECT id FROM france_restaurants WHERE phone = '010101010'),
    service_mode,
    display_name,
    description,
    display_order,
    config,
    is_enabled,
    NOW(),
    NOW()
FROM france_restaurant_service_modes
WHERE restaurant_id = 16;

-- Vérification
SELECT
    'VÉRIF Service modes' as check_type,
    COUNT(*) as total_dupliques,
    (SELECT COUNT(*) FROM france_restaurant_service_modes WHERE restaurant_id = 16) as total_source,
    CASE
        WHEN COUNT(*) = (SELECT COUNT(*) FROM france_restaurant_service_modes WHERE restaurant_id = 16)
        THEN '✅ OK'
        ELSE '❌ ERREUR DUPLICATION'
    END as statut
FROM france_restaurant_service_modes
WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010');

-- ========================================================================
-- ÉTAPE 7 : DUPLIQUER LA CONFIGURATION D'AFFICHAGE DES PRODUITS
-- ========================================================================

INSERT INTO france_product_display_configs (
    restaurant_id, product_id,
    display_type, template_name,
    show_variants_first, custom_header_text,
    custom_footer_text, emoji_icon,
    created_at, updated_at
)
SELECT
    (SELECT id FROM france_restaurants WHERE phone = '010101010'),
    tpm.new_id,
    fpdc.display_type,
    fpdc.template_name,
    fpdc.show_variants_first,
    fpdc.custom_header_text,
    fpdc.custom_footer_text,
    fpdc.emoji_icon,
    NOW(),
    NOW()
FROM france_product_display_configs fpdc
JOIN temp_product_mapping tpm ON fpdc.product_id = tpm.old_id
WHERE fpdc.restaurant_id = 16;

-- Vérification
SELECT
    'VÉRIF Product display configs' as check_type,
    COUNT(*) as total_dupliques,
    (SELECT COUNT(*) FROM france_product_display_configs WHERE restaurant_id = 16) as total_source,
    CASE
        WHEN COUNT(*) = (SELECT COUNT(*) FROM france_product_display_configs WHERE restaurant_id = 16)
        THEN '✅ OK'
        ELSE '❌ ERREUR DUPLICATION'
    END as statut
FROM france_product_display_configs
WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010');

-- ========================================================================
-- ÉTAPE 8 : DUPLIQUER LA VITRINE
-- ========================================================================

INSERT INTO restaurant_vitrine_settings (
    restaurant_id, slug,
    primary_color, secondary_color, accent_color,
    logo_emoji, subtitle, promo_text,
    feature_1, feature_2, feature_3,
    show_live_stats, average_rating, delivery_time_min,
    is_active, created_at, updated_at
)
SELECT
    (SELECT id FROM france_restaurants WHERE phone = '010101010'),
    'le-nouveau-ocv-demo',
    primary_color,
    secondary_color,
    accent_color,
    logo_emoji,
    subtitle,
    promo_text,
    feature_1,
    feature_2,
    feature_3,
    show_live_stats,
    average_rating,
    delivery_time_min,
    is_active,
    NOW(),
    NOW()
FROM restaurant_vitrine_settings
WHERE restaurant_id = 16;

-- Vérification
SELECT
    'VÉRIF Vitrine settings' as check_type,
    COUNT(*) as total_dupliques,
    (SELECT COUNT(*) FROM restaurant_vitrine_settings WHERE restaurant_id = 16) as total_source,
    CASE
        WHEN COUNT(*) = (SELECT COUNT(*) FROM restaurant_vitrine_settings WHERE restaurant_id = 16)
        THEN '✅ OK'
        ELSE '❌ ERREUR DUPLICATION'
    END as statut
FROM restaurant_vitrine_settings
WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010');

-- ========================================================================
-- ÉTAPE 9 : DUPLIQUER LA CONFIGURATION DU BOT
-- ========================================================================

INSERT INTO restaurant_bot_configs (
    restaurant_id, config_name,
    brand_name, welcome_message,
    available_workflows, features,
    is_active, created_at, updated_at
)
SELECT
    (SELECT id FROM france_restaurants WHERE phone = '010101010'),
    config_name,
    brand_name,
    welcome_message,
    available_workflows,
    features,
    is_active,
    NOW(),
    NOW()
FROM restaurant_bot_configs
WHERE restaurant_id = 16;

-- Vérification
SELECT
    'VÉRIF Bot configs' as check_type,
    COUNT(*) as total_dupliques,
    (SELECT COUNT(*) FROM restaurant_bot_configs WHERE restaurant_id = 16) as total_source,
    CASE
        WHEN COUNT(*) = (SELECT COUNT(*) FROM restaurant_bot_configs WHERE restaurant_id = 16)
        THEN '✅ OK'
        ELSE '❌ ERREUR DUPLICATION'
    END as statut
FROM restaurant_bot_configs
WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010');

-- ========================================================================
-- VÉRIFICATIONS FINALES D'INTÉGRITÉ
-- ========================================================================

-- Résumé du restaurant
SELECT
    '====== RESTAURANT OCV DEMO ======' as titre,
    id,
    name,
    phone,
    deployment_status
FROM france_restaurants
WHERE phone = '010101010';

-- Statistiques complètes
WITH demo_restaurant AS (
    SELECT id FROM france_restaurants WHERE phone = '010101010'
)
SELECT 'Catégories' as type, COUNT(*) as total
FROM france_menu_categories
WHERE restaurant_id = (SELECT id FROM demo_restaurant)

UNION ALL

SELECT 'Produits', COUNT(*)
FROM france_products
WHERE restaurant_id = (SELECT id FROM demo_restaurant)

UNION ALL

SELECT 'Composite items', COUNT(*)
FROM france_composite_items
WHERE composite_product_id IN (
    SELECT id FROM france_products
    WHERE restaurant_id = (SELECT id FROM demo_restaurant)
)

UNION ALL

SELECT 'Product options', COUNT(*)
FROM france_product_options
WHERE product_id IN (
    SELECT id FROM france_products
    WHERE restaurant_id = (SELECT id FROM demo_restaurant)
)

UNION ALL

SELECT 'Service modes', COUNT(*)
FROM france_restaurant_service_modes
WHERE restaurant_id = (SELECT id FROM demo_restaurant)

UNION ALL

SELECT 'Product display configs', COUNT(*)
FROM france_product_display_configs
WHERE restaurant_id = (SELECT id FROM demo_restaurant)

UNION ALL

SELECT 'Vitrine settings', COUNT(*)
FROM restaurant_vitrine_settings
WHERE restaurant_id = (SELECT id FROM demo_restaurant)

UNION ALL

SELECT 'Bot configs', COUNT(*)
FROM restaurant_bot_configs
WHERE restaurant_id = (SELECT id FROM demo_restaurant);

-- Vérification: Pas de catégories orphelines
SELECT
    '⚠️ Catégories sans restaurant' as check,
    COUNT(*) as problemes
FROM france_menu_categories fmc
WHERE fmc.restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')
AND NOT EXISTS (
    SELECT 1 FROM france_restaurants fr
    WHERE fr.id = fmc.restaurant_id
);

-- Vérification: Pas de produits orphelins
SELECT
    '⚠️ Produits sans catégorie valide' as check,
    COUNT(*) as problemes
FROM france_products fp
WHERE fp.restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')
AND NOT EXISTS (
    SELECT 1 FROM france_menu_categories fmc
    WHERE fmc.id = fp.category_id
    AND fmc.restaurant_id = fp.restaurant_id
);

-- Vérification: Pas de composite_items orphelins
SELECT
    '⚠️ Composite items sans produit valide' as check,
    COUNT(*) as problemes
FROM france_composite_items fci
WHERE fci.composite_product_id NOT IN (
    SELECT id FROM france_products
    WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE phone = '010101010')
)
AND fci.composite_product_id IN (
    SELECT id FROM france_products
);

-- ========================================================================
-- NETTOYAGE
-- ========================================================================

DROP TABLE IF EXISTS temp_category_mapping;
DROP TABLE IF EXISTS temp_product_mapping;

-- ========================================================================
-- ⚠️ VALIDATION MANUELLE REQUISE
-- ========================================================================

SELECT '========================================' as msg
UNION ALL SELECT '⚠️ VÉRIFIEZ TOUS LES RÉSULTATS CI-DESSUS'
UNION ALL SELECT '⚠️ Tous les checks doivent afficher ✅ OK'
UNION ALL SELECT '⚠️ Tous les "problemes" doivent être = 0'
UNION ALL SELECT '========================================'
UNION ALL SELECT 'Si OK → COMMIT;'
UNION ALL SELECT 'Si erreur → ROLLBACK;';

-- ========================================================================
-- VALIDATION AUTOMATIQUE
-- ========================================================================

COMMIT;   -- ✅ Valider
-- ROLLBACK; -- ❌ Annuler (décommenter si problème)
