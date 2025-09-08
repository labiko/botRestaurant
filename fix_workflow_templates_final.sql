-- 🔧 CORRECTION FINALE - Configuration universelle basée sur la vraie structure
-- Structure réelle: france_workflow_templates (id, restaurant_id NOT NULL, template_name, ...)

BEGIN;

-- 1. Modifier la contrainte NOT NULL sur restaurant_id
ALTER TABLE france_workflow_templates 
ALTER COLUMN restaurant_id DROP NOT NULL;

-- 2. Ajouter une contrainte unique pour éviter les doublons
-- (restaurant_id, template_name) mais en gérant les NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_france_workflow_templates_unique
ON france_workflow_templates (COALESCE(restaurant_id, 0), template_name);

-- 3. Vérifier la modification
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'france_workflow_templates'
AND column_name = 'restaurant_id';

-- 4. Insérer le template par défaut universel (restaurant_id = NULL)
INSERT INTO france_workflow_templates (
  restaurant_id,
  template_name,
  description,
  steps_config,
  created_at,
  updated_at
) VALUES (
  NULL, -- Template universel pour tous les restaurants
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
);

-- 5. Mettre à jour le template existant de Pizza Yolo 77 pour compatibilité
UPDATE france_workflow_templates
SET 
  steps_config = jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(steps_config, '{}'::jsonb),
        '{apply_to_categories}',
        '["pizzas"]'
      ),
      '{apply_to_menu_categories}',
      '["menu-pizza"]'
    ),
    '{enabled}',
    'true'
  ),
  updated_at = NOW()
WHERE restaurant_id = 1 
AND template_name = 'pizza_unified_display';

-- 6. Créer la table de configuration par restaurant
CREATE TABLE IF NOT EXISTS france_pizza_display_settings (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES france_restaurants(id),
  use_unified_display BOOLEAN DEFAULT true,
  custom_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id)
);

-- 7. Configurer Pizza Yolo 77
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

-- 8. Créer la vue de configuration unifiée
CREATE OR REPLACE VIEW v_restaurant_pizza_display_config AS
SELECT 
  r.id as restaurant_id,
  r.name as restaurant_name,
  COALESCE(s.use_unified_display, true) as use_unified_display,
  CASE 
    -- Priorité 1: Template spécifique au restaurant
    WHEN rt.steps_config IS NOT NULL THEN rt.steps_config
    -- Priorité 2: Template par défaut universel
    ELSE COALESCE(
      (SELECT steps_config FROM france_workflow_templates 
       WHERE restaurant_id IS NULL AND template_name = 'pizza_unified_display_default'),
      '{}'::jsonb
    )
  END as display_config,
  COALESCE(s.custom_settings, '{}'::jsonb) as custom_settings
FROM france_restaurants r
LEFT JOIN france_pizza_display_settings s ON r.id = s.restaurant_id
LEFT JOIN france_workflow_templates rt ON r.id = rt.restaurant_id 
  AND rt.template_name = 'pizza_unified_display';

-- 9. Vérification complète
SELECT 
  '1. Structure restaurant_id' as verification,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'france_workflow_templates'
AND column_name = 'restaurant_id'

UNION ALL

SELECT 
  '2. Template universel' as verification,
  template_name as column_name,
  CASE WHEN restaurant_id IS NULL THEN 'NULL (universel)' ELSE restaurant_id::text END as is_nullable
FROM france_workflow_templates
WHERE template_name = 'pizza_unified_display_default'

UNION ALL

SELECT 
  '3. Template Pizza Yolo 77' as verification,
  template_name as column_name,
  restaurant_id::text as is_nullable
FROM france_workflow_templates
WHERE restaurant_id = 1 AND template_name = 'pizza_unified_display'

UNION ALL

SELECT 
  '4. Config Pizza Yolo 77' as verification,
  'france_pizza_display_settings' as column_name,
  use_unified_display::text as is_nullable
FROM france_pizza_display_settings
WHERE restaurant_id = 1;

-- 10. Test de la vue pour Pizza Yolo 77
SELECT 
  'Test vue Pizza Yolo 77' as test,
  restaurant_name,
  use_unified_display,
  display_config IS NOT NULL as has_config,
  display_config->>'enabled' as enabled
FROM v_restaurant_pizza_display_config
WHERE restaurant_id = 1;

COMMIT;

-- ✅ Configuration universelle terminée
-- Système maintenant capable de :
-- 1. Template par défaut pour tous les restaurants (restaurant_id = NULL)
-- 2. Templates spécifiques par restaurant (restaurant_id = X)
-- 3. Configuration activé/désactivé par restaurant
-- 4. Vue unifiée pour récupérer la bonne config