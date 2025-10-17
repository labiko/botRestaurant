-- 🏗️ CRÉATION D'ARCHITECTURE UNIVERSELLE POUR CONFIGURATION PRODUITS
-- Permet de gérer les variantes, templates d'affichage, et workflows sans hardcoding

BEGIN;

-- ============================================================================
-- 0. VÉRIFICATION DES TABLES EXISTANTES  
-- ============================================================================

-- Vérifier que les tables de base existent
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'france_restaurants') THEN
    RAISE EXCEPTION 'Table france_restaurants non trouvée. Veuillez d''abord exécuter le schéma de base.';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'france_products') THEN
    RAISE EXCEPTION 'Table france_products non trouvée. Veuillez d''abord exécuter le schéma de base.';
  END IF;
END$$;

-- ============================================================================
-- 1. UTILISATION DES TABLES EXISTANTES
-- ============================================================================

-- ANALYSE DES TABLES EXISTANTES :
-- france_product_sizes : id, product_id, size_name, price_on_site, includes_drink, display_order, price_delivery
-- france_product_variants : id, product_id, variant_name, price_on_site, quantity, unit, is_menu, includes_description, display_order, is_active, price_delivery

-- Pour les TACOS, utiliser france_product_sizes qui est parfaite avec includes_drink
-- Pas besoin d'ajouter de colonnes - la structure existe déjà !

-- ============================================================================
-- 2. TABLE DE CONFIGURATION DES TEMPLATES D'AFFICHAGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS france_product_display_configs (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  display_type VARCHAR(50) NOT NULL, -- 'size_selection', 'direct_config', 'simple_add'
  template_name VARCHAR(100), -- Nom du template à utiliser
  show_variants_first BOOLEAN DEFAULT false, -- Afficher variantes avant workflow
  custom_header_text TEXT, -- Texte personnalisé pour l'en-tête
  custom_footer_text TEXT, -- Texte personnalisé pour le pied
  emoji_icon VARCHAR(10), -- Emoji à afficher
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(restaurant_id, product_id)
);

-- ============================================================================
-- 3. TABLE POUR WORKFLOW STEPS PERSONNALISÉS
-- ============================================================================

CREATE TABLE IF NOT EXISTS france_workflow_templates (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  description TEXT,
  steps_config JSONB, -- Configuration complète des étapes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(restaurant_id, template_name)
);

-- ============================================================================
-- 4. CONFIGURATION PIZZA YOLO AVEC LES NOUVELLES TABLES
-- ============================================================================

-- Configuration des tailles pour TACOS dans france_product_sizes
INSERT INTO france_product_sizes (
  product_id, size_name, price_on_site, price_delivery, includes_drink, display_order
)
SELECT 
  p.id,
  'MENU M',
  8.00,
  9.00, -- Prix livraison = prix place + 1€
  true, -- Boisson incluse
  1
FROM france_products p 
WHERE p.name = 'TACOS' AND p.restaurant_id = 1
ON CONFLICT DO NOTHING;

INSERT INTO france_product_sizes (
  product_id, size_name, price_on_site, price_delivery, includes_drink, display_order
)
SELECT 
  p.id,
  'MENU L',
  9.50,
  10.50, -- Prix livraison = prix place + 1€
  true, -- Boisson incluse
  2
FROM france_products p 
WHERE p.name = 'TACOS' AND p.restaurant_id = 1
ON CONFLICT DO NOTHING;

INSERT INTO france_product_sizes (
  product_id, size_name, price_on_site, price_delivery, includes_drink, display_order
)
SELECT 
  p.id,
  'MENU XL',
  11.00,
  12.00, -- Prix livraison = prix place + 1€
  true, -- Boisson incluse
  3
FROM france_products p 
WHERE p.name = 'TACOS' AND p.restaurant_id = 1
ON CONFLICT DO NOTHING;

-- Configuration de l'affichage pour TACOS
INSERT INTO france_product_display_configs (restaurant_id, product_id, display_type, template_name, show_variants_first, custom_header_text, emoji_icon)
SELECT 
  1,
  p.id,
  'size_selection',
  'tacos_size_template',
  true,
  'Choisissez votre taille:',
  '🌮'
FROM france_products p 
WHERE p.name = 'TACOS' AND p.restaurant_id = 1;

-- Configuration workflow pour TACOS  
INSERT INTO france_workflow_templates (restaurant_id, template_name, description, steps_config)
VALUES (
  1,
  'tacos_size_template',
  'Template pour sélection taille TACOS avec workflow ingrédients',
  '{
    "show_restaurant_name": true,
    "show_separator": true, 
    "show_product_emoji": true,
    "variant_selection": {
      "title": "💰 Choisissez votre taille:",
      "format": "🔸 {variant_name} ({price} EUR) - Tapez {index}",
      "show_drink_note": true
    },
    "footer_options": [
      "🔙 Tapez \"0\" pour les catégories",
      "🛒 Tapez \"00\" pour voir votre commande", 
      "❌ Tapez \"annuler\" pour arrêter"
    ],
    "workflow_steps": [
      {
        "step": "ingredient_selection",
        "use_database_options": true,
        "template": "classic_ingredient_selection"
      }
    ]
  }'::jsonb
);

-- ============================================================================
-- 5. VÉRIFICATIONS
-- ============================================================================

-- Vérifier les tailles créées pour TACOS
SELECT 
  'Tailles créées' as check_type,
  p.name as produit,
  ps.size_name,
  ps.price_on_site,
  ps.includes_drink
FROM france_product_sizes ps
JOIN france_products p ON p.id = ps.product_id
WHERE p.name = 'TACOS' AND p.restaurant_id = 1;

-- Vérifier les configurations d'affichage
SELECT 
  'Configurations affichage' as check_type,
  p.name as produit,
  pdc.display_type,
  pdc.template_name,
  pdc.emoji_icon
FROM france_product_display_configs pdc  
JOIN france_products p ON p.id = pdc.product_id
WHERE pdc.restaurant_id = 1;

-- Vérifier les templates de workflow
SELECT 
  'Templates workflow' as check_type,
  template_name,
  description
FROM france_workflow_templates
WHERE restaurant_id = 1;

COMMIT;