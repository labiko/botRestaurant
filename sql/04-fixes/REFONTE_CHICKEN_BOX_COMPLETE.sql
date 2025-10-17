-- ========================================================================
-- SCRIPT: Refonte complète CHICKEN BOX comme BURGERS
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Date: 2025-10-17
--
-- OBJECTIF:
-- Transformer la structure actuelle (3 produits séparés) en structure BURGERS
-- (1 produit parent avec choix des plats en Step 1)
--
-- AVANT:
-- - CHICKEN BOX (240) - produit séparé
-- - MIXTE BOX (241) - produit séparé
-- - TENDERS BOX (242) - produit séparé
--
-- APRÈS:
-- - CHICKEN BOX (240) - produit parent
--   ├─ Step 1: Plats (3 box au choix avec prix différents)
--   ├─ Step 2: Sauces (16 sauces, optionnel max 2)
--   └─ Step 3: Boisson 1.5L incluse (5 boissons)
-- ========================================================================

BEGIN;

-- 1. METTRE À JOUR LE PRODUIT PARENT (240) VERS universal_workflow_v2
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  name = 'NOS BOX',
  price_on_site_base = 0.00,  -- Prix dans les options
  price_delivery_base = 0.00,  -- Prix dans les options
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez votre box",
        "option_groups": ["Plats"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "Choisissez votre boisson (1.5L) incluse",
        "option_groups": ["Boisson 1.5L incluse"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json
WHERE id = 240
  AND restaurant_id = 1;

-- 2. SUPPRIMER LES ANCIENNES OPTIONS BOISSON (qui vont devenir Step 3)
DELETE FROM france_product_options
WHERE product_id = 240
  AND option_group = 'Boisson 1.5L incluse';

-- 3. CRÉER LE GROUPE "Plats" AVEC LES 3 BOX
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  composition,
  display_order,
  group_order,
  is_required,
  is_active,
  icon
) VALUES
-- CHICKEN BOX - 21€
(
  240,
  'Plats',
  'CHICKEN BOX',
  21.00,
  '25 Wings + 2 portions de frites + boisson 1.5L',
  1,
  1,  -- Step 1
  true,
  true,
  '🍗'
),
-- MIXTE BOX - 27,90€
(
  240,
  'Plats',
  'MIXTE BOX',
  27.90,
  '15 Wings + 8 Tenders + 2 portions de frites + boisson 1.5L',
  2,
  1,  -- Step 1
  true,
  true,
  '🍱'
),
-- TENDERS BOX - 27,90€
(
  240,
  'Plats',
  'TENDERS BOX',
  27.90,
  '20 Tenders + 2 portions de frites + boisson 1.5L',
  3,
  1,  -- Step 1
  true,
  true,
  '🍗'
);

-- 4. COPIER LES SAUCES DEPUIS SANDWICHS (663)
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  group_order,
  is_required,
  is_active,
  icon,
  composition
)
SELECT
  240 as product_id,
  'Sauces' as option_group,
  option_name,
  0.00 as price_modifier,  -- Sauces gratuites
  display_order,
  2 as group_order,  -- Step 2
  false as is_required,
  is_active,
  icon,
  composition
FROM france_product_options
WHERE product_id = 663  -- SANDWICHS
  AND option_group = 'Sauces'
ON CONFLICT DO NOTHING;

-- 5. AJOUTER LES 5 BOISSONS 1.5L (depuis les anciennes données)
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  group_order,
  is_required,
  is_active,
  icon
) VALUES
(240, 'Boisson 1.5L incluse', 'COCA COLA 1L5 (1.5L)', 0.00, 1, 3, true, true, '🥤'),
(240, 'Boisson 1.5L incluse', 'COCA ZERO 1L5 (1.5L)', 0.00, 2, 3, true, true, '🥤'),
(240, 'Boisson 1.5L incluse', 'FANTA 1L5 (1.5L)', 0.00, 3, 3, true, true, '🥤'),
(240, 'Boisson 1.5L incluse', 'OASIS 1L5 (1.5L)', 0.00, 4, 3, true, true, '🥤'),
(240, 'Boisson 1.5L incluse', 'SPRITE (1.5L)', 0.00, 5, 3, true, true, '🥤')
ON CONFLICT DO NOTHING;

-- 6. DÉSACTIVER LES ANCIENS PRODUITS 241 et 242
UPDATE france_products
SET is_active = false
WHERE id IN (241, 242)
  AND restaurant_id = 1;

-- 7. SUPPRIMER LES COMPOSITE_ITEMS (plus nécessaires, composition dans les options)
DELETE FROM france_composite_items
WHERE composite_product_id IN (240, 241, 242);

-- Vérification finale
SELECT
  'STRUCTURE DU PRODUIT' as section,
  p.id,
  p.name,
  p.workflow_type,
  p.price_on_site_base,
  p.price_delivery_base
FROM france_products p
WHERE p.id = 240
  AND p.restaurant_id = 1;

SELECT
  'GROUPES OPTIONS' as section,
  po.option_group,
  po.group_order,
  COUNT(*) as nb_options,
  STRING_AGG(po.option_name || ' (' || po.price_modifier || '€)', ', ' ORDER BY po.display_order) as options
FROM france_product_options po
WHERE po.product_id = 240
GROUP BY po.option_group, po.group_order
ORDER BY po.group_order;

SELECT
  'DÉTAIL PAR GROUPE' as section,
  po.option_group,
  po.option_name,
  po.price_modifier as prix,
  po.composition,
  po.group_order as step,
  po.display_order
FROM france_product_options po
WHERE po.product_id = 240
ORDER BY po.group_order, po.display_order;

SELECT
  'ANCIENS PRODUITS DÉSACTIVÉS' as section,
  id,
  name,
  is_active
FROM france_products
WHERE id IN (241, 242)
  AND restaurant_id = 1;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ Produit 240 "NOS BOX" avec workflow universal_workflow_v2
-- ✅ Step 1: Plats (3 box avec prix 21€, 27,90€, 27,90€)
-- ✅ Step 2: Sauces (16 sauces gratuites, optionnel max 2)
-- ✅ Step 3: Boisson 1.5L incluse (5 boissons, obligatoire)
-- ✅ Produits 241 et 242 désactivés
-- ✅ Structure identique à BURGERS
-- ========================================================================
