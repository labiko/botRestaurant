-- SYSTÈME COMPLET D'AUTOMATISATION DES BOISSONS
-- Gestion automatique 33CL (SANDWICHS) + 1.5L (MENU FAMILY)

BEGIN;

-- ================================================
-- PHASE 1: TABLE DE LOGS POUR TRAÇABILITÉ
-- ================================================

CREATE TABLE IF NOT EXISTS automation_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    success BOOLEAN DEFAULT true
);

-- ================================================
-- PHASE 2: FONCTION D'AJOUT AUX WORKFLOWS
-- ================================================

CREATE OR REPLACE FUNCTION add_drink_to_workflows(
    product_id INTEGER,
    product_name TEXT
) RETURNS VOID AS $$
DECLARE
    next_order_1l5 INTEGER;
    next_order_33cl INTEGER;
    clean_name TEXT;
    emoji TEXT;
    has_variant_1l5 BOOLEAN := false;
    has_variant_33cl BOOLEAN := false;
BEGIN
    -- Vérifier quelles variantes existent
    SELECT 
        COUNT(CASE WHEN variant_name = '1L5' THEN 1 END) > 0,
        COUNT(CASE WHEN variant_name = '33CL' THEN 1 END) > 0
    INTO has_variant_1l5, has_variant_33cl
    FROM france_product_variants 
    WHERE france_product_variants.product_id = add_drink_to_workflows.product_id;
    
    -- Nettoyer le nom pour affichage
    clean_name := REPLACE(REPLACE(product_name, ' 1L5', ''), '1L5', '');
    
    -- Assigner emoji selon le nom
    emoji := CASE 
        WHEN clean_name ILIKE '%7UP%' AND NOT clean_name ILIKE '%CHERRY%' AND NOT clean_name ILIKE '%TROPICAL%' THEN '🥤'
        WHEN clean_name ILIKE '%7UP CHERRY%' THEN '🍒'
        WHEN clean_name ILIKE '%7UP TROPICAL%' THEN '🌴'
        WHEN clean_name ILIKE '%COCA COLA%' AND NOT clean_name ILIKE '%ZERO%' THEN '🥤'
        WHEN clean_name ILIKE '%COCA ZERO%' THEN '⚫'
        WHEN clean_name ILIKE '%SPRITE%' THEN '🥤'
        WHEN clean_name ILIKE '%FANTA%' THEN '🍊'
        WHEN clean_name ILIKE '%MIRANDA FRAISE%' THEN '🍓'
        WHEN clean_name ILIKE '%MIRANDA TROPICAL%' THEN '🏝️'
        WHEN clean_name ILIKE '%OASIS%' THEN '🌺'
        WHEN clean_name ILIKE '%PERRIER%' THEN '💎'
        WHEN clean_name ILIKE '%EAU%' THEN '💧'
        WHEN clean_name ILIKE '%ICE TEA%' THEN '🧊'
        WHEN clean_name ILIKE '%TROPICO%' THEN '🍊'
        ELSE '🥤'
    END;
    
    -- AJOUT À MENU FAMILY (si variante 1.5L)
    IF has_variant_1l5 THEN
        -- Calculer prochain ordre pour MENU FAMILY
        SELECT COALESCE(MAX(display_order), 0) + 1 INTO next_order_1l5
        FROM france_product_options
        WHERE france_product_options.product_id = 383 AND option_group = 'Boisson 1.5L incluse';
        
        -- Ajouter à MENU FAMILY
        INSERT INTO france_product_options (
            product_id, option_group, option_name, 
            price_modifier, display_order, is_active
        ) VALUES (
            383, 
            'Boisson 1.5L incluse',
            next_order_1l5 || '️⃣ ' || emoji || ' ' || clean_name || ' (1.5L)',
            0.00,
            next_order_1l5,
            true
        );
        
        -- Log succès 1.5L
        INSERT INTO automation_logs (action, details) 
        VALUES ('DRINK_1L5_ADDED_TO_MENU_FAMILY', 
                json_build_object('product_name', product_name, 'display_order', next_order_1l5, 'emoji', emoji));
    END IF;
    
    -- AJOUT À SANDWICHS (si variante 33CL)
    IF has_variant_33cl THEN
        -- Calculer prochain ordre pour SANDWICHS
        SELECT COALESCE(MAX(po.display_order), 0) + 1 INTO next_order_33cl
        FROM france_product_options po
        JOIN france_products p ON p.id = po.product_id
        JOIN france_menu_categories c ON c.id = p.category_id
        WHERE c.name = 'SANDWICHS' AND po.option_group = 'Boisson 33CL incluse';
        
        -- Ajouter à TOUS les SANDWICHS
        INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, display_order, is_active)
        SELECT 
            p.id,
            'Boisson 33CL incluse',
            next_order_33cl || '️⃣ ' || emoji || ' ' || clean_name,
            0.00,
            next_order_33cl,
            true
        FROM france_products p
        JOIN france_menu_categories c ON c.id = p.category_id
        WHERE c.name = 'SANDWICHS'
        AND NOT EXISTS (
            SELECT 1 FROM france_product_options po2 
            WHERE po2.product_id = p.id 
            AND po2.option_group = 'Boisson 33CL incluse'
            AND po2.option_name LIKE '%' || clean_name || '%'
        );
        
        -- Log succès 33CL
        INSERT INTO automation_logs (action, details) 
        VALUES ('DRINK_33CL_ADDED_TO_SANDWICHS', 
                json_build_object('product_name', product_name, 'display_order', next_order_33cl, 'emoji', emoji));
    END IF;
            
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- PHASE 3: TRIGGER DE DÉTECTION AUTOMATIQUE
-- ================================================

CREATE OR REPLACE FUNCTION auto_detect_new_drinks() RETURNS TRIGGER AS $$
BEGIN
    -- Détecter si c'est une boisson (catégorie BOISSONS)
    IF EXISTS (SELECT 1 FROM france_menu_categories WHERE id = NEW.category_id AND name = 'BOISSONS') THEN
        
        -- Log de détection
        INSERT INTO automation_logs (action, details) 
        VALUES ('NEW_DRINK_DETECTED', 
                json_build_object('product_id', NEW.id, 'name', NEW.name, 'type', NEW.product_type));
        
        -- Déclencher l'ajout automatique aux workflows (après que les variantes soient créées)
        -- On utilise un délai pour laisser le temps aux variantes d'être insérées
        PERFORM add_drink_to_workflows(NEW.id, NEW.name);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attacher le trigger sur INSERT ET UPDATE
DROP TRIGGER IF EXISTS trigger_auto_detect_drinks ON france_products;
CREATE TRIGGER trigger_auto_detect_drinks
    AFTER INSERT OR UPDATE ON france_products
    FOR EACH ROW 
    EXECUTE FUNCTION auto_detect_new_drinks();

-- ================================================
-- PHASE 4: TRIGGER SUR LES VARIANTES
-- ================================================

CREATE OR REPLACE FUNCTION auto_detect_new_variants() RETURNS TRIGGER AS $$
DECLARE
    product_record RECORD;
BEGIN
    -- Récupérer les infos du produit parent
    SELECT p.*, c.name as category_name 
    INTO product_record
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE p.id = NEW.product_id;
    
    -- Si c'est une boisson et une nouvelle variante
    IF product_record.category_name = 'BOISSONS' AND 
       (NEW.variant_name = '33CL' OR NEW.variant_name = '1L5') THEN
        
        -- Log de détection de variante
        INSERT INTO automation_logs (action, details) 
        VALUES ('NEW_VARIANT_DETECTED', 
                json_build_object('product_id', NEW.product_id, 'product_name', product_record.name, 'variant', NEW.variant_name));
        
        -- Déclencher l'ajout aux workflows
        PERFORM add_drink_to_workflows(NEW.product_id, product_record.name);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attacher le trigger sur les variantes
DROP TRIGGER IF EXISTS trigger_auto_detect_variants ON france_product_variants;
CREATE TRIGGER trigger_auto_detect_variants
    AFTER INSERT OR UPDATE ON france_product_variants
    FOR EACH ROW 
    EXECUTE FUNCTION auto_detect_new_variants();

-- ================================================
-- PHASE 5: FONCTION DE NETTOYAGE (OPTIONNEL)
-- ================================================

CREATE OR REPLACE FUNCTION remove_drink_from_workflows(
    product_name_to_remove TEXT
) RETURNS INTEGER AS $$
DECLARE
    removed_count INTEGER := 0;
BEGIN
    -- Supprimer de MENU FAMILY
    DELETE FROM france_product_options
    WHERE product_id = 383 
    AND option_group = 'Boisson 1.5L incluse'
    AND option_name LIKE '%' || product_name_to_remove || '%';
    
    GET DIAGNOSTICS removed_count = ROW_COUNT;
    
    -- Supprimer de SANDWICHS
    DELETE FROM france_product_options po
    USING france_products p, france_menu_categories c
    WHERE po.product_id = p.id
    AND p.category_id = c.id
    AND c.name = 'SANDWICHS'
    AND po.option_group = 'Boisson 33CL incluse' 
    AND po.option_name LIKE '%' || product_name_to_remove || '%';
    
    GET DIAGNOSTICS removed_count = removed_count + ROW_COUNT;
    
    -- Log de suppression
    INSERT INTO automation_logs (action, details) 
    VALUES ('DRINK_REMOVED_FROM_WORKFLOWS', 
            json_build_object('product_name', product_name_to_remove, 'removed_count', removed_count));
    
    RETURN removed_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- PHASE 6: SCRIPT DE VÉRIFICATION
-- ================================================

-- Vérifier installation
SELECT 'SYSTÈME INSTALLÉ' as status,
       'Triggers actifs pour automatisation complète des boissons' as details;

-- Vérifier les triggers existants
SELECT 'TRIGGERS INSTALLÉS' as section,
       trigger_name,
       event_manipulation,
       event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('trigger_auto_detect_drinks', 'trigger_auto_detect_variants');

-- Afficher structure des logs
SELECT 'TABLE LOGS CRÉÉE' as section,
       column_name,
       data_type
FROM information_schema.columns
WHERE table_name = 'automation_logs'
ORDER BY ordinal_position;

COMMIT;

-- ================================================
-- INSTRUCTIONS D'UTILISATION
-- ================================================

/*
🚀 SYSTÈME D'AUTOMATISATION INSTALLÉ !

📋 WORKFLOW AUTOMATIQUE:
1. Admin crée nouvelle boisson via back office (DUPLIQUER + MODIFIER)
2. Ajoute variantes 33CL et/ou 1.5L 
3. Triggers détectent automatiquement
4. Boisson ajoutée aux workflows appropriés:
   - 33CL → SANDWICHS
   - 1.5L → MENU FAMILY
5. Bot affiche immédiatement les nouvelles options

📊 TRAÇABILITÉ:
SELECT * FROM automation_logs ORDER BY created_at DESC LIMIT 10;

🧹 NETTOYAGE:
SELECT remove_drink_from_workflows('NOM_BOISSON');

⚠️ REMARQUE:
Les triggers sont PERMANENTS - ils fonctionneront pour toutes les futures boissons créées.
*/