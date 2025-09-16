-- 🔧 CORRECTION SIMPLE - Permettre restaurant_id NULL pour templates universels

BEGIN;

-- 1. Vérifier la structure actuelle
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'france_workflow_templates'
AND column_name = 'restaurant_id';

-- 2. Modifier la contrainte pour permettre restaurant_id NULL (si pas déjà fait)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'france_workflow_templates' 
    AND column_name = 'restaurant_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE france_workflow_templates 
    ALTER COLUMN restaurant_id DROP NOT NULL;
    RAISE NOTICE 'Contrainte NOT NULL supprimée sur restaurant_id';
  ELSE
    RAISE NOTICE 'restaurant_id accepte déjà les valeurs NULL';
  END IF;
END $$;

-- 3. Insérer le template par défaut universel
INSERT INTO france_workflow_templates (
  restaurant_id,
  template_name,
  description,
  steps_config,
  created_at,
  updated_at
) VALUES (
  NULL, -- NULL = Template par défaut universel
  'pizza_unified_display_default',
  'Template par défaut universel pour affichage des pizzas',
  '{
    "enabled": true,
    "apply_to_categories": ["pizzas", "pizza", "pizzas-artisanales", "nos-pizzas"],
    "apply_to_menu_categories": ["menu-pizza", "menus-pizza", "menu pizza", "menus pizzas"],
    "show_category_header": true,
    "show_restaurant_name": true,
    "show_separator": true,
    "global_numbering": true,
    "ingredient_display": true,
    "format_patterns": {
      "individual": "🎯 *🍕 {name}*\\n🧾 {description}\\n\\n💰 Choisissez votre taille:\\n{sizes}",
      "menu_list": "🎯 *📋 {name}*\\n🧾 {description}\\n\\n💰 {price} EUR - Tapez {index}",
      "workflow_step": "🎯 *🍕 {name} {size}*\\n🧾 {description}\\n💰 Inclus dans le menu - Tapez {index}"
    },
    "size_format": "   🔸 {size_name} ({price} EUR) - Tapez {index}",
    "separator_line": "━━━━━━━━━━━━━━━━━━━━━",
    "footer_messages": {
      "navigation": "💡 Tapez le numéro de votre choix",
      "back": "↩️ Tapez 0 pour revenir au menu principal"
    }
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 4. Créer la table de configuration si elle n'existe pas
CREATE TABLE IF NOT EXISTS france_pizza_display_settings (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES france_restaurants(id),
  use_unified_display BOOLEAN DEFAULT true,
  custom_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id)
);

-- 5. Activer pour Pizza Yolo 77
INSERT INTO france_pizza_display_settings (
  restaurant_id, 
  use_unified_display, 
  custom_settings
) VALUES (
  1, 
  true,
  '{
    "enable_ingredients": true,
    "enable_global_numbering": true,
    "price_format": "{price} EUR",
    "show_size_names": true
  }'::jsonb
)
ON CONFLICT (restaurant_id) 
DO UPDATE SET 
  use_unified_display = EXCLUDED.use_unified_display,
  custom_settings = EXCLUDED.custom_settings,
  updated_at = NOW();

-- 6. Créer la vue pour simplifier l'accès à la config
CREATE OR REPLACE VIEW v_restaurant_pizza_display_config AS
SELECT 
  r.id as restaurant_id,
  r.name as restaurant_name,
  COALESCE(s.use_unified_display, true) as use_unified_display,
  CASE 
    WHEN rt.steps_config IS NOT NULL THEN 
      rt.steps_config
    ELSE 
      (SELECT steps_config FROM france_workflow_templates 
       WHERE restaurant_id IS NULL AND template_name = 'pizza_unified_display_default')
  END as display_config,
  s.custom_settings
FROM france_restaurants r
LEFT JOIN france_pizza_display_settings s ON r.id = s.restaurant_id
LEFT JOIN france_workflow_templates rt ON r.id = rt.restaurant_id 
  AND rt.template_name = 'pizza_unified_display';

-- 7. Vérification finale
SELECT 
  'Templates existants' as verification,
  COUNT(*) as nombre
FROM france_workflow_templates 
WHERE template_name LIKE '%pizza%display%'

UNION ALL

SELECT 
  'Template par défaut' as verification,
  CASE WHEN EXISTS(
    SELECT 1 FROM france_workflow_templates 
    WHERE restaurant_id IS NULL AND template_name = 'pizza_unified_display_default'
  ) THEN 1 ELSE 0 END as nombre

UNION ALL

SELECT 
  'Config Pizza Yolo 77' as verification,
  CASE WHEN EXISTS(
    SELECT 1 FROM france_pizza_display_settings WHERE restaurant_id = 1
  ) THEN 1 ELSE 0 END as nombre;

COMMIT;

-- ✅ Structure corrigée et système universel configuré