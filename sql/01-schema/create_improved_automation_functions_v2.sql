-- SCRIPT D'AUTOMATISATION AMÉLIORÉ - Version 2.0
BEGIN;

-- 1. Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS configure_category_workflow(text, text, boolean);
DROP FUNCTION IF EXISTS apply_composite_config(text, boolean);
DROP FUNCTION IF EXISTS apply_simple_config(text);

-- 2. Fonction principale d'automatisation (AMÉLIORÉE)
CREATE OR REPLACE FUNCTION configure_category_workflow(
    category_name TEXT,
    config_type TEXT DEFAULT 'composite',
    include_drinks BOOLEAN DEFAULT true
) RETURNS TEXT AS $$
DECLARE
    result_message TEXT;
    category_count INTEGER;
BEGIN
    -- Vérifier que la catégorie existe
    SELECT COUNT(*) INTO category_count
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%';
    
    IF category_count = 0 THEN
        RETURN 'ERREUR: Catégorie ' || category_name || ' non trouvée';
    END IF;
    
    -- Appliquer la configuration selon le type
    IF config_type = 'composite' THEN
        SELECT apply_composite_config(category_name, include_drinks) INTO result_message;
    ELSIF config_type = 'simple' THEN
        SELECT apply_simple_config(category_name) INTO result_message;
    ELSE
        RETURN 'ERREUR: Type de configuration non supporté: ' || config_type;
    END IF;
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- 3. Fonction pour configuration composite (AMÉLIORÉE - supprime les tailles)
CREATE OR REPLACE FUNCTION apply_composite_config(
    category_name TEXT,
    include_drinks BOOLEAN DEFAULT true
) RETURNS TEXT AS $$
DECLARE
    updated_count INTEGER;
    category_ids INTEGER[];
    product_id INTEGER;
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
        -- Vérifier si des boissons existent déjà pour ces catégories
        SELECT COUNT(DISTINCT po.id) INTO existing_drinks
        FROM france_product_options po
        JOIN france_products p ON po.product_id = p.id
        WHERE p.category_id = ANY(category_ids)
        AND po.option_group = 'Boisson 33CL incluse';
        
        -- Si pas de boissons, on va les créer pour chaque produit
        IF existing_drinks = 0 THEN
            -- Pour chaque produit de la catégorie, ajouter les options boisson
            FOR product_id IN 
                SELECT p.id FROM france_products p 
                WHERE p.category_id = ANY(category_ids)
            LOOP
                -- Insérer les options de boisson pour ce produit
                INSERT INTO france_product_options (
                    product_id, option_group, option_name, 
                    price_modifier, is_required, max_selections, display_order
                )
                SELECT 
                    product_id,
                    'Boisson 33CL incluse',
                    option_name,
                    0,
                    true,
                    1,
                    row_number() OVER (ORDER BY option_name)
                FROM (VALUES 
                    ('7 UP'),
                    ('7UP CHERRY'), 
                    ('7UP TROPICAL'),
                    ('COCA COLA'),
                    ('COCA ZERO'),
                    ('EAU MINÉRALE'),
                    ('ICE TEA'),
                    ('MIRANDA FRAISE'),
                    ('MIRANDA TROPICAL'),
                    ('OASIS TROPICAL'),
                    ('PERRIER'),
                    ('TROPICO')
                ) AS drinks(option_name);
            END LOOP;
        END IF;
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

-- Vérification des fonctions créées
SELECT 'FONCTIONS AMÉLIORÉES V2.0 CRÉÉES:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('configure_category_workflow', 'apply_composite_config', 'apply_simple_config')
AND routine_schema = 'public';

COMMIT;
