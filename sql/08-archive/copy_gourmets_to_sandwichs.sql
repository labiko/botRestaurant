-- 🔄 COPIE CONFIGURATION GOURMETS → SANDWICHS
-- Objectif: Reproduire exactement la config qui fonctionne pour GOURMETS sur SANDWICHS

BEGIN;

-- 1. Fonction pour copier la configuration d'une catégorie vers une autre
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
        
        GET DIAGNOSTICS copied_options = copied_options + ROW_COUNT;
    END LOOP;
    
    RETURN 'SUCCESS: Configuration ' || source_category || ' copiée vers ' || target_category || '. ' ||
           updated_products || ' produits mis à jour, ' ||
           copied_options || ' options copiées.';
END;
$$ LANGUAGE plpgsql;

-- 2. Mettre à jour la fonction principale pour supporter copy_from
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
    
    -- Protection pour composite sans force
    IF config_type = 'composite' AND force_execution = false THEN
        DECLARE
            existing_composite_items INTEGER;
        BEGIN
            SELECT COUNT(*) INTO existing_composite_items
            FROM france_composite_items fci
            JOIN france_products p ON p.id = fci.composite_product_id
            JOIN france_menu_categories c ON c.id = p.category_id
            WHERE c.slug = category_slug;
            
            IF existing_composite_items = 0 THEN
                RETURN 'PROTECTION: La catégorie ' || category_name || ' n''a pas de composite_items existants. ' ||
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
            RETURN 'ERREUR: source_category obligatoire pour copy_from';
        END IF;
        SELECT copy_working_config(source_category, category_name) INTO result_message;
    ELSE
        RETURN 'ERREUR: Types supportés: composite, simple, copy_from';
    END IF;
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- 3. Tester la nouvelle fonction générique
SELECT configure_category_workflow('SANDWICHS', 'copy_from', 'GOURMETS') as resultat;

-- 3. Vérification après copie
\echo ''
\echo '=== VÉRIFICATION APRÈS COPIE ==='

-- État des SANDWICHS après copie
SELECT 
    'SANDWICHS APRÈS COPIE' as info,
    COUNT(*) as nb_produits,
    COUNT(CASE WHEN product_type = 'composite' THEN 1 END) as nb_composite,
    COUNT(CASE WHEN workflow_type = 'composite_workflow' THEN 1 END) as nb_avec_workflow,
    COUNT(CASE WHEN requires_steps = true THEN 1 END) as nb_avec_steps
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs' AND p.is_active = true;

-- Compter les options copiées
SELECT 
    'OPTIONS SANDWICHS APRÈS COPIE' as info,
    COUNT(*) as nb_options_total,
    COUNT(*) / COUNT(DISTINCT p.id) as options_par_produit
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'sandwichs' AND p.is_active = true;

-- Exemple d'options copiées
SELECT 
    'EXEMPLE OPTIONS COPIÉES' as info,
    p.name as produit,
    fpo.option_group,
    fpo.option_name,
    fpo.price_modifier
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'sandwichs' 
AND p.is_active = true
ORDER BY p.name, fpo.display_order
LIMIT 5;

\echo ''
\echo '✅ COPIE TERMINÉE - SANDWICHS devraient maintenant fonctionner comme GOURMETS'
\echo '🧪 TESTE: Sélectionne LE GREC pour vérifier le choix de boissons'

-- 4. Documentation de la nouvelle fonction générique
\echo ''
\echo '=== NOUVELLE FONCTION GÉNÉRIQUE MISE À JOUR ==='
\echo 'UTILISATION:'
\echo '1. configure_category_workflow(''SANDWICHS'', ''copy_from'', ''GOURMETS'') -- Copie config'
\echo '2. configure_category_workflow(''BURGERS'', ''copy_from'', ''GOURMETS'') -- Copie vers BURGERS'
\echo '3. configure_category_workflow(''TACOS'', ''composite'', NULL, true) -- Force composite'
\echo '4. configure_category_workflow(''DESSERTS'', ''simple'') -- Simple sans options'

-- Vérification que toutes les fonctions existent
SELECT 'FONCTIONS DISPONIBLES:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('configure_category_workflow', 'copy_working_config', 'apply_composite_config', 'apply_simple_config')
AND routine_schema = 'public'
ORDER BY routine_name;

COMMIT;