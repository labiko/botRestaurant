-- Fonction pour mettre à jour complètement un produit composite
-- avec ses éléments en une seule transaction atomique

CREATE OR REPLACE FUNCTION update_composite_product_complete(
    p_product_id INTEGER,
    p_product_updates JSONB,
    p_composite_items JSONB
)
RETURNS VOID AS $$
DECLARE
    item JSONB;
    item_id INTEGER;
    component_name TEXT;
    quantity NUMERIC;
    unit TEXT;
BEGIN
    -- Début de la transaction (implicite dans une fonction)
    
    -- 1. Mettre à jour les informations du produit principal
    UPDATE france_products 
    SET 
        name = COALESCE((p_product_updates->>'name')::TEXT, name),
        description = COALESCE((p_product_updates->>'description')::TEXT, description),
        composition = COALESCE((p_product_updates->>'composition')::TEXT, composition),
        price_on_site_base = COALESCE((p_product_updates->>'price_on_site_base')::NUMERIC, price_on_site_base),
        price_delivery_base = COALESCE((p_product_updates->>'price_delivery_base')::NUMERIC, price_delivery_base),
        workflow_type = COALESCE((p_product_updates->>'workflow_type')::TEXT, workflow_type),
        requires_steps = COALESCE((p_product_updates->>'requires_steps')::BOOLEAN, requires_steps),
        steps_config = COALESCE((p_product_updates->>'steps_config')::JSONB, steps_config),
        display_order = COALESCE((p_product_updates->>'display_order')::INTEGER, display_order),
        is_active = COALESCE((p_product_updates->>'is_active')::BOOLEAN, is_active),
        updated_at = NOW()
    WHERE id = p_product_id;
    
    -- Vérifier que le produit existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produit avec ID % non trouvé', p_product_id;
    END IF;
    
    -- 2. Supprimer tous les éléments composites existants
    DELETE FROM france_composite_items 
    WHERE composite_product_id = p_product_id;
    
    -- 3. Insérer les nouveaux éléments composites
    IF p_composite_items IS NOT NULL AND jsonb_array_length(p_composite_items) > 0 THEN
        FOR item IN SELECT * FROM jsonb_array_elements(p_composite_items)
        LOOP
            -- Extraire les propriétés de chaque élément
            item_id := (item->>'id')::INTEGER;
            component_name := item->>'component_name';
            quantity := (item->>'quantity')::NUMERIC;
            unit := item->>'unit';
            
            -- Validation des données
            IF component_name IS NULL OR component_name = '' THEN
                RAISE EXCEPTION 'Le nom du composant ne peut pas être vide';
            END IF;
            
            IF quantity IS NULL OR quantity <= 0 THEN
                RAISE EXCEPTION 'La quantité doit être supérieure à 0';
            END IF;
            
            IF unit IS NULL OR unit = '' THEN
                unit := 'unité';
            END IF;
            
            -- Insérer le nouvel élément composite
            INSERT INTO france_composite_items (
                composite_product_id,
                component_name,
                quantity,
                unit
            ) VALUES (
                p_product_id,
                component_name,
                quantity,
                unit
            );
        END LOOP;
    END IF;
    
    -- 4. Log de l'opération (optionnel)
    INSERT INTO product_update_log (
        product_id,
        action,
        details,
        updated_at
    ) VALUES (
        p_product_id,
        'COMPLETE_UPDATE',
        jsonb_build_object(
            'product_updates', p_product_updates,
            'composite_items_count', COALESCE(jsonb_array_length(p_composite_items), 0)
        ),
        NOW()
    ) ON CONFLICT DO NOTHING; -- Ignore si la table de log n'existe pas
    
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, la transaction sera automatiquement rollback
        RAISE EXCEPTION 'Erreur lors de la mise à jour du produit composite: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Ajout d'un commentaire sur la fonction
COMMENT ON FUNCTION update_composite_product_complete IS 
'Met à jour complètement un produit composite avec ses éléments en une seule transaction atomique. 
Paramètres:
- p_product_id: ID du produit à mettre à jour
- p_product_updates: JSONB contenant les mises à jour du produit
- p_composite_items: JSONB array contenant les éléments composites';

-- Exemple d'utilisation :
/*
SELECT update_composite_product_complete(
    1, -- ID du produit
    '{"name": "Menu Complet", "price_on_site_base": 15.50, "is_active": true}',
    '[
        {"component_name": "Burger", "quantity": 1, "unit": "pièce"},
        {"component_name": "Frites", "quantity": 1, "unit": "portion"},
        {"component_name": "Boisson", "quantity": 1, "unit": "33cl"}
    ]'
);
*/