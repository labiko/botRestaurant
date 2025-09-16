-- AJOUT FONCTION AUTOMATISATION POUR FLUX MIXTE
-- Cas : Catégorie avec produits SIMPLES + COMPOSITES (comme POULET & SNACKS)

-- ================================================
-- NOUVELLE FONCTION: configure_mixed_category_workflow
-- ================================================

CREATE OR REPLACE FUNCTION configure_mixed_category_workflow(
    category_name TEXT,
    source_category TEXT DEFAULT 'SANDWICHS',
    simple_products TEXT[] DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    target_category_id INTEGER;
    source_category_id INTEGER;
    updated_products INTEGER := 0;
    copied_options INTEGER := 0;
    corrected_simples INTEGER := 0;
    result_message TEXT;
BEGIN
    -- 1. Vérifier que la catégorie cible existe
    SELECT id INTO target_category_id 
    FROM france_menu_categories 
    WHERE name = category_name OR slug = lower(replace(category_name, ' ', '-'));
    
    IF target_category_id IS NULL THEN
        RETURN 'ERREUR: Catégorie ' || category_name || ' non trouvée';
    END IF;
    
    -- 2. Vérifier que la catégorie source existe
    SELECT id INTO source_category_id 
    FROM france_menu_categories 
    WHERE name = source_category OR slug = lower(replace(source_category, ' ', '-'));
    
    IF source_category_id IS NULL THEN
        RETURN 'ERREUR: Catégorie source ' || source_category || ' non trouvée';
    END IF;
    
    -- 3. Appliquer la configuration globale (comme copy_from)
    PERFORM copy_working_config(source_category, category_name);
    
    -- 4. Compter les produits mis à jour
    SELECT COUNT(*) INTO updated_products
    FROM france_products 
    WHERE category_id = target_category_id;
    
    -- 5. Compter les options copiées
    SELECT COUNT(*) INTO copied_options
    FROM france_product_options po
    JOIN france_products p ON p.id = po.product_id
    WHERE p.category_id = target_category_id;
    
    -- 6. CORRECTION SÉLECTIVE: Remettre les produits simples en 'simple'
    IF simple_products IS NOT NULL THEN
        -- Utiliser la liste fournie
        UPDATE france_products 
        SET 
            product_type = 'simple'::product_type_enum,
            workflow_type = NULL,
            requires_steps = false,
            steps_config = NULL
        WHERE category_id = target_category_id
        AND name = ANY(simple_products);
        
        GET DIAGNOSTICS corrected_simples = ROW_COUNT;
        
        -- Supprimer les options des produits simples
        DELETE FROM france_product_options 
        WHERE product_id IN (
            SELECT p.id 
            FROM france_products p
            WHERE p.category_id = target_category_id
            AND p.name = ANY(simple_products)
        );
    ELSE
        -- Détecter automatiquement les produits simples (sans astérisque)
        UPDATE france_products 
        SET 
            product_type = 'simple'::product_type_enum,
            workflow_type = NULL,
            requires_steps = false,
            steps_config = NULL
        WHERE category_id = target_category_id
        AND product_type = 'simple'  -- Ceux déjà marqués simple dans l'insertion
        AND name NOT LIKE '%*%';     -- Pas d'astérisque dans le nom
        
        GET DIAGNOSTICS corrected_simples = ROW_COUNT;
        
        -- Supprimer les options des produits simples
        DELETE FROM france_product_options 
        WHERE product_id IN (
            SELECT p.id 
            FROM france_products p
            WHERE p.category_id = target_category_id
            AND p.product_type = 'simple'
        );
    END IF;
    
    result_message := 'SUCCESS: Configuration ' || source_category || ' appliquée à ' || category_name || 
                     '. ' || updated_products || ' produits total, ' || 
                     copied_options || ' options copiées, ' ||
                     corrected_simples || ' produits simples corrigés.';
    
    RETURN result_message;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERREUR lors de la configuration mixte: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- EXEMPLES D'UTILISATION
-- ================================================

/*
-- MÉTHODE 1: Spécifier les produits simples
SELECT configure_mixed_category_workflow(
    'POULET & SNACKS',
    'SANDWICHS',
    ARRAY[
        'TENDERS 1 PIECE',
        'NUGGETS 4 PIECES', 
        'WINGS 4 PIECES',
        'DONUTS POULET 1 PIECE',
        'MOZZA STICK 4 PIECES',
        'JALAPENOS 4 PIECES', 
        'ONION RINGS 4 PIECES',
        'POTATOES'
    ]
);

-- MÉTHODE 2: Détection automatique (produits sans astérisque)
SELECT configure_mixed_category_workflow('POULET & SNACKS', 'SANDWICHS');

-- POUR AUTRES CATÉGORIES SIMILAIRES:
SELECT configure_mixed_category_workflow('NOUVELLE_CATEGORIE', 'SANDWICHS');
*/