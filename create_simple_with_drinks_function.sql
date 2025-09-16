-- 🍹 FONCTION SIMPLE_WITH_DRINKS_33CL pour SANDWICHS
-- Objectif: Configuration simple + choix boissons 33CL uniquement

BEGIN;

-- 1. Créer la fonction spécialisée
CREATE OR REPLACE FUNCTION apply_simple_with_drinks_33cl_config(
    category_name TEXT
) RETURNS TEXT AS $$
DECLARE
    category_ids INTEGER[];
    current_product_id INTEGER;
    cleaned_options INTEGER;
    cleaned_items INTEGER;
    updated_products INTEGER;
    added_drink_options INTEGER := 0;
BEGIN
    -- Récupérer les IDs des catégories matching
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%';
    
    IF array_length(category_ids, 1) IS NULL THEN
        RETURN 'ERREUR: Catégorie ' || category_name || ' non trouvée';
    END IF;
    
    -- ÉTAPE 1: Nettoyer toute configuration composite existante
    -- Supprimer les anciennes options
    DELETE FROM france_product_options
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    GET DIAGNOSTICS cleaned_options = ROW_COUNT;
    
    -- Supprimer les composite_items
    DELETE FROM france_composite_items
    WHERE composite_product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    GET DIAGNOSTICS cleaned_items = ROW_COUNT;
    
    -- Supprimer tailles et variantes créées par automation
    DELETE FROM france_product_sizes
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    
    DELETE FROM france_product_variants
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    
    -- ÉTAPE 2: Configurer en mode SIMPLE
    UPDATE france_products 
    SET 
        product_type = 'simple',
        workflow_type = NULL,
        requires_steps = false,
        steps_config = NULL,
        updated_at = NOW()
    WHERE category_id = ANY(category_ids);
    GET DIAGNOSTICS updated_products = ROW_COUNT;
    
    -- ÉTAPE 3: Ajouter les options de boissons 33CL pour chaque produit
    FOR current_product_id IN 
        SELECT p.id FROM france_products p 
        WHERE p.category_id = ANY(category_ids)
        AND p.is_active = true
    LOOP
        -- Insérer les options de boisson 33CL récupérées automatiquement
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
            -- Icône automatique selon le nom
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
            0, -- price_modifier = 0 (incluse)
            true, -- is_required = true
            1, -- max_selections = 1
            ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name)
        FROM (
            -- Récupération automatique des boissons 33CL depuis la catégorie DRINKS
            SELECT DISTINCT p.name, p.display_order
            FROM france_products p
            JOIN france_menu_categories c ON p.category_id = c.id
            JOIN france_product_variants pv ON pv.product_id = p.id
            WHERE c.name = 'BOISSONS' -- ou 'DRINKS' selon votre structure
            AND c.restaurant_id = 1
            AND (pv.variant_name = '33CL' OR (pv.quantity = 33 AND pv.unit = 'cl'))
            AND p.is_active = true
            AND pv.is_active = true
        ) dp;
        
        GET DIAGNOSTICS added_drink_options = added_drink_options + ROW_COUNT;
    END LOOP;
    
    RETURN 'SUCCESS: ' || category_name || ' configuré en SIMPLE avec boissons 33CL. ' ||
           updated_products || ' produits mis à jour, ' ||
           cleaned_options || ' anciennes options supprimées, ' ||
           cleaned_items || ' composite_items supprimés, ' ||
           added_drink_options || ' options boissons ajoutées.';
END;
$$ LANGUAGE plpgsql;

-- 2. Mettre à jour la fonction principale pour supporter le nouveau type
CREATE OR REPLACE FUNCTION configure_category_workflow(
    category_name TEXT,
    config_type TEXT DEFAULT 'composite',
    include_drinks BOOLEAN DEFAULT true,
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
                       'Utilisez force_execution=true pour forcer ou ''simple_with_drinks'' pour simple+boissons.';
            END IF;
        END;
    END IF;
    
    -- Appliquer la configuration selon le type
    IF config_type = 'composite' THEN
        SELECT apply_composite_config(category_name, include_drinks) INTO result_message;
    ELSIF config_type = 'simple' THEN
        SELECT apply_simple_config(category_name) INTO result_message;
    ELSIF config_type = 'simple_with_drinks' THEN
        SELECT apply_simple_with_drinks_33cl_config(category_name) INTO result_message;
    ELSE
        RETURN 'ERREUR: Types supportés: composite, simple, simple_with_drinks';
    END IF;
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- 3. Vérification
SELECT 'FONCTION SIMPLE_WITH_DRINKS_33CL CRÉÉE' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'apply_simple_with_drinks_33cl_config'
AND routine_schema = 'public';

COMMIT;