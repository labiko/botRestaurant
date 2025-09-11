-- CORRECTION : Fonctions d'automatisation selon la vraie structure DB
BEGIN;

-- 1. Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS configure_category_workflow(text, text, boolean);
DROP FUNCTION IF EXISTS apply_composite_config(text, boolean);
DROP FUNCTION IF EXISTS apply_simple_config(text);

-- 2. Fonction principale d'automatisation (CORRIGÉE)
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

-- Vérification des fonctions créées
SELECT 'FONCTIONS AMÉLIORÉES V2.0 CRÉÉES:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('configure_category_workflow', 'apply_composite_config', 'apply_simple_config')
AND routine_schema = 'public';

COMMIT;
