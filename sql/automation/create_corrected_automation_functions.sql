-- CORRECTION : Fonctions d'automatisation selon la vraie structure DB
BEGIN;

-- 1. Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS configure_category_workflow(text, text, boolean);
DROP FUNCTION IF EXISTS apply_composite_config(text, boolean);
DROP FUNCTION IF EXISTS apply_simple_config(text);
DROP FUNCTION IF EXISTS copy_working_config(text, text);

-- 2. Fonction pour copier la configuration d'une catégorie vers une autre
CREATE OR REPLACE FUNCTION copy_working_config(
    source_category TEXT,
    target_category TEXT
) RETURNS TEXT AS $$
DECLARE
    source_product_record RECORD;
    target_product_record RECORD;
    source_category_id INTEGER;
    target_category_id INTEGER;
    copied_options INTEGER := 0;
    updated_products INTEGER := 0;
    current_inserted INTEGER;
    sample_steps_config JSON;
BEGIN
    -- Récupérer les IDs des catégories
    SELECT id INTO source_category_id 
    FROM france_menu_categories 
    WHERE name ILIKE '%' || source_category || '%' LIMIT 1;
    
    SELECT id INTO target_category_id 
    FROM france_menu_categories 
    WHERE name ILIKE '%' || target_category || '%' LIMIT 1;
    
    IF source_category_id IS NULL THEN
        RETURN 'ERREUR: Catégorie source ' || source_category || ' non trouvée';
    END IF;
    
    IF target_category_id IS NULL THEN
        RETURN 'ERREUR: Catégorie cible ' || target_category || ' non trouvée';
    END IF;
    
    -- Récupérer un échantillon de steps_config depuis la source
    SELECT p.steps_config INTO sample_steps_config
    FROM france_products p
    WHERE p.category_id = source_category_id 
    AND p.steps_config IS NOT NULL
    AND p.is_active = true
    LIMIT 1;
    
    -- ÉTAPE 1: Nettoyer la catégorie cible
    DELETE FROM france_product_options
    WHERE product_id IN (
        SELECT id FROM france_products WHERE category_id = target_category_id
    );
    
    DELETE FROM france_composite_items
    WHERE composite_product_id IN (
        SELECT id FROM france_products WHERE category_id = target_category_id
    );
    
    -- ÉTAPE 2: Copier la configuration de base des produits
    UPDATE france_products 
    SET 
        product_type = (
            SELECT DISTINCT product_type 
            FROM france_products 
            WHERE category_id = source_category_id 
            AND is_active = true 
            LIMIT 1
        ),
        workflow_type = (
            SELECT DISTINCT workflow_type 
            FROM france_products 
            WHERE category_id = source_category_id 
            AND is_active = true 
            LIMIT 1
        ),
        requires_steps = (
            SELECT DISTINCT requires_steps 
            FROM france_products 
            WHERE category_id = source_category_id 
            AND is_active = true 
            LIMIT 1
        ),
        steps_config = sample_steps_config,
        updated_at = NOW()
    WHERE category_id = target_category_id 
    AND is_active = true;
    
    GET DIAGNOSTICS updated_products = ROW_COUNT;
    
    -- ÉTAPE 3: Copier les product_options pour chaque produit cible
    FOR target_product_record IN 
        SELECT id, name FROM france_products 
        WHERE category_id = target_category_id AND is_active = true
    LOOP
        -- Copier toutes les options depuis le premier produit source
        INSERT INTO france_product_options (
            product_id, option_group, option_name, price_modifier, 
            is_required, max_selections, display_order, group_order, is_active
        )
        SELECT 
            target_product_record.id, -- Nouveau product_id
            fpo.option_group,
            fpo.option_name,
            fpo.price_modifier,
            fpo.is_required,
            fpo.max_selections,
            fpo.display_order,
            fpo.group_order,
            fpo.is_active
        FROM france_products p
        JOIN france_product_options fpo ON fpo.product_id = p.id
        WHERE p.category_id = source_category_id
        AND p.is_active = true
        AND fpo.is_active = true
        LIMIT 12; -- Limiter aux 12 boissons standards
        
        GET DIAGNOSTICS current_inserted = ROW_COUNT;
        copied_options := copied_options + current_inserted;
    END LOOP;
    
    RETURN 'SUCCESS: Configuration ' || source_category || ' copiée vers ' || target_category || '. ' ||
           updated_products || ' produits mis à jour, ' ||
           copied_options || ' options copiées.';
END;
$$ LANGUAGE plpgsql;

-- 3. Fonction principale d'automatisation (GÉNÉRIQUE V4.0 - avec copy_from)
CREATE OR REPLACE FUNCTION configure_category_workflow(
    category_name TEXT,
    config_type TEXT DEFAULT 'composite',
    source_category TEXT DEFAULT NULL,
    force_execution BOOLEAN DEFAULT false
) RETURNS TEXT AS $$
DECLARE
    result_message TEXT;
    category_count INTEGER;
    category_slug TEXT;
BEGIN
    -- Vérifier que la catégorie existe et récupérer le slug
    SELECT COUNT(*), MIN(slug) INTO category_count, category_slug
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%';
    
    IF category_count = 0 THEN
        RETURN 'ERREUR: Catégorie ' || category_name || ' non trouvée';
    END IF;
    
    -- PROTECTION: Vérifier si la catégorie a déjà des composite_items existants
    -- SAUF si force_execution = true
    IF config_type = 'composite' AND force_execution = false THEN
        DECLARE
            existing_composite_items INTEGER;
        BEGIN
            SELECT COUNT(*) INTO existing_composite_items
            FROM france_composite_items fci
            JOIN france_products p ON p.id = fci.composite_product_id
            JOIN france_menu_categories c ON c.id = p.category_id
            WHERE c.slug = category_slug;
            
            -- Si aucun composite_item existant, avertir mais permettre force
            IF existing_composite_items = 0 THEN
                RETURN 'PROTECTION: La catégorie ' || category_name || ' n''a pas de composite_items existants. ' ||
                       'Un workflow composite sans composants causera des erreurs. ' ||
                       'Utilisez force_execution=true pour forcer ou ''copy_from'' pour copier une config.';
            END IF;
        END;
    END IF;
    
    -- Appliquer la configuration selon le type
    IF config_type = 'composite' THEN
        SELECT apply_composite_config(category_name, true) INTO result_message;
    ELSIF config_type = 'simple' THEN
        SELECT apply_simple_config(category_name) INTO result_message;
    ELSIF config_type = 'copy_from' THEN
        IF source_category IS NULL THEN
            RETURN 'ERREUR: source_category obligatoire pour copy_from. Usage: configure_category_workflow(''SANDWICHS'', ''copy_from'', ''GOURMETS'')';
        END IF;
        SELECT copy_working_config(source_category, category_name) INTO result_message;
    ELSE
        RETURN 'ERREUR: Types supportés: composite, simple, copy_from';
    END IF;
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- 3. Fonction pour configuration composite (AMÉLIORÉE - supprime les conflits)
CREATE OR REPLACE FUNCTION apply_composite_config(
    category_name TEXT,
    include_drinks BOOLEAN DEFAULT true
) RETURNS TEXT AS $$
DECLARE
    updated_count INTEGER;
    category_ids INTEGER[];
    current_product_id INTEGER;
    existing_drinks INTEGER;
    deleted_sizes INTEGER;
BEGIN
    -- Récupérer les IDs des catégories matching
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%';
    
    -- NOUVEAU: Supprimer les tailles existantes pour éviter les conflits
    DELETE FROM france_product_sizes 
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    
    GET DIAGNOSTICS deleted_sizes = ROW_COUNT;
    
    -- NOUVEAU: Supprimer les variantes existantes pour éviter les conflits  
    DELETE FROM france_product_variants
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    
    -- S'assurer que les options de boisson existent si nécessaire
    IF include_drinks THEN
        -- PLUS SÛR: Mettre à jour uniquement les produits de cette catégorie
        -- D'abord supprimer SEULEMENT pour les produits de la catégorie concernée
        DELETE FROM france_product_options
        WHERE product_id IN (
            SELECT p.id 
            FROM france_products p
            WHERE p.category_id = ANY(category_ids)
        )
        AND option_group = 'Boisson 33CL incluse';
        
        -- Recréer pour cette catégorie uniquement avec récupération automatique
        FOR current_product_id IN 
            SELECT p.id FROM france_products p 
            WHERE p.category_id = ANY(category_ids)
        LOOP
                -- Insérer les options de boisson récupérées automatiquement
                INSERT INTO france_product_options (
                    product_id, option_group, option_name, 
                    price_modifier, is_required, max_selections, display_order
                )
                SELECT 
                    current_product_id,
                    'Boisson 33CL incluse',
                    -- Format: numéro + icône + nom de boisson
                    CASE 
                        WHEN ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) <= 9 THEN
                            ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) || '️⃣ ' 
                        WHEN ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) = 10 THEN
                            '🔟 ' 
                        WHEN ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) = 11 THEN
                            '1️⃣1️⃣ '
                        WHEN ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) = 12 THEN
                            '1️⃣2️⃣ '
                        ELSE ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) || '️⃣ '
                    END || 
                    -- Icône automatique
                    CASE 
                        WHEN dp.name ILIKE '%7 UP%' AND dp.name NOT ILIKE '%CHERRY%' AND dp.name NOT ILIKE '%TROPICAL%' THEN '🥤'
                        WHEN dp.name ILIKE '%CHERRY%' THEN '🍒'
                        WHEN dp.name ILIKE '%7UP TROPICAL%' THEN '🌴'
                        WHEN dp.name ILIKE '%COCA%' AND dp.name NOT ILIKE '%ZERO%' THEN '🥤'
                        WHEN dp.name ILIKE '%ZERO%' THEN '⚫'
                        WHEN dp.name ILIKE '%EAU%' THEN '💧'
                        WHEN dp.name ILIKE '%ICE TEA%' THEN '🧊'
                        WHEN dp.name ILIKE '%MIRANDA FRAISE%' THEN '🍓'
                        WHEN dp.name ILIKE '%MIRANDA TROPICAL%' THEN '🏝️'
                        WHEN dp.name ILIKE '%OASIS%' THEN '🌺'
                        WHEN dp.name ILIKE '%PERRIER%' THEN '💎'
                        WHEN dp.name ILIKE '%TROPICO%' THEN '🍊'
                        ELSE '🥤'
                    END || ' ' || dp.name,
                    0,
                    true,
                    1,
                    ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name)
                FROM (
                    -- Récupération automatique des boissons 33CL
                    SELECT DISTINCT p.name, p.display_order
                    FROM france_products p
                    JOIN france_menu_categories c ON p.category_id = c.id
                    JOIN france_product_variants pv ON pv.product_id = p.id
                    WHERE c.name = 'DRINKS'
                    AND c.restaurant_id = 1
                    AND (pv.variant_name = '33CL' OR (pv.quantity = 33 AND pv.unit = 'cl'))
                    AND p.is_active = true
                    AND pv.is_active = true
                ) dp;
            END LOOP;
    END IF;
    
    -- Mettre à jour les produits de la catégorie
    UPDATE france_products 
    SET 
        product_type = 'composite',
        workflow_type = 'composite_workflow',
        requires_steps = true,
        steps_config = CASE 
            WHEN include_drinks THEN
                json_build_object(
                    'steps', json_build_array(
                        json_build_object(
                            'type', 'options_selection',
                            'required', true,
                            'prompt', 'Choisissez votre boisson 33CL incluse',
                            'option_groups', json_build_array('Boisson 33CL incluse'),
                            'max_selections', 1
                        )
                    )
                )::json
            ELSE
                json_build_object('steps', json_build_array())::json
        END
    WHERE category_id = ANY(category_ids);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN 'SUCCESS: ' || updated_count || ' produits de la catégorie ' || category_name || ' configurés en composite' || 
           CASE WHEN include_drinks THEN ' avec boissons' ELSE '' END ||
           CASE WHEN deleted_sizes > 0 THEN '. ' || deleted_sizes || ' tailles supprimées' ELSE '' END;
END;
$$ LANGUAGE plpgsql;

-- 4. Fonction pour configuration simple (AMÉLIORÉE - nettoie tout)
CREATE OR REPLACE FUNCTION apply_simple_config(
    category_name TEXT
) RETURNS TEXT AS $$
DECLARE
    updated_count INTEGER;
    category_ids INTEGER[];
    deleted_options INTEGER;
    deleted_sizes INTEGER;
BEGIN
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%';
    
    -- NOUVEAU: Nettoyer toutes les options existantes
    DELETE FROM france_product_options
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    GET DIAGNOSTICS deleted_options = ROW_COUNT;
    
    -- NOUVEAU: Nettoyer toutes les tailles existantes
    DELETE FROM france_product_sizes
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    GET DIAGNOSTICS deleted_sizes = ROW_COUNT;
    
    -- Nettoyer les variantes
    DELETE FROM france_product_variants
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    
    UPDATE france_products 
    SET 
        product_type = 'simple',
        workflow_type = NULL,
        requires_steps = false,
        steps_config = NULL
    WHERE category_id = ANY(category_ids);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN 'SUCCESS: ' || updated_count || ' produits de la catégorie ' || category_name || ' configurés en simple. Nettoyé: ' ||
           deleted_options || ' options, ' || deleted_sizes || ' tailles';
END;
$$ LANGUAGE plpgsql;

-- 5. Fonction de correction générique pour n'importe quelle catégorie
CREATE OR REPLACE FUNCTION fix_category_configuration(
    category_name TEXT
) RETURNS TEXT AS $$
DECLARE
    cleaned_options INTEGER;
    cleaned_items INTEGER;
    updated_products INTEGER;
    category_slug TEXT;
BEGIN
    -- Récupérer le slug de la catégorie
    SELECT slug INTO category_slug
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%'
    LIMIT 1;
    
    IF category_slug IS NULL THEN
        RETURN 'ERREUR: Catégorie ' || category_name || ' non trouvée';
    END IF;
    
    -- Nettoyer toute la configuration composite pour la catégorie
    DELETE FROM france_product_options
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        JOIN france_menu_categories c ON c.id = p.category_id
        WHERE c.slug = category_slug
    );
    GET DIAGNOSTICS cleaned_options = ROW_COUNT;
    
    DELETE FROM france_composite_items
    WHERE composite_product_id IN (
        SELECT p.id 
        FROM france_products p
        JOIN france_menu_categories c ON c.id = p.category_id
        WHERE c.slug = category_slug
    );
    GET DIAGNOSTICS cleaned_items = ROW_COUNT;
    
    -- Remettre en configuration simple
    UPDATE france_products 
    SET 
        product_type = 'simple',
        workflow_type = NULL,
        requires_steps = false,
        steps_config = NULL,
        updated_at = NOW()
    WHERE category_id IN (
        SELECT id FROM france_menu_categories 
        WHERE slug = category_slug
    );
    GET DIAGNOSTICS updated_products = ROW_COUNT;
    
    RETURN category_name || ' CORRIGÉ: ' || updated_products || ' produits remis en simple, ' ||
           cleaned_options || ' options supprimées, ' || cleaned_items || ' composite_items supprimés';
END;
$$ LANGUAGE plpgsql;

-- Vérification des fonctions créées
SELECT 'FONCTIONS GÉNÉRIQUES V4.0 CRÉÉES AVEC COPY_FROM:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('configure_category_workflow', 'copy_working_config', 'apply_composite_config', 'apply_simple_config', 'fix_category_configuration')
AND routine_schema = 'public'
ORDER BY routine_name;

-- Documentation des nouvelles fonctions
SELECT 'UTILISATION V4.0:' as info;
SELECT '1. configure_category_workflow(''SANDWICHS'', ''copy_from'', ''GOURMETS'') -- NOUVEAU: Copie config' as exemple
UNION ALL
SELECT '2. configure_category_workflow(''BURGERS'', ''copy_from'', ''GOURMETS'') -- Copie vers BURGERS' as exemple
UNION ALL
SELECT '3. configure_category_workflow(''TACOS'', ''composite'', NULL, true) -- Force composite' as exemple  
UNION ALL
SELECT '4. configure_category_workflow(''DESSERTS'', ''simple'') -- Simple sans options' as exemple
UNION ALL
SELECT '5. fix_category_configuration(''SANDWICHS'') -- Corriger une catégorie cassée' as exemple;

COMMIT;
