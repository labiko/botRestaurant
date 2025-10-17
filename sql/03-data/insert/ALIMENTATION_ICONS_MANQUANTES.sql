-- =========================================
-- ALIMENTATION - ICÔNES MANQUANTES
-- =========================================
-- Date: 2025-10-11
-- Objectif: Alimenter la colonne icon pour toutes les options
-- Stratégie: Assigner des icônes selon le type d'option
-- =========================================

BEGIN;

-- =========================================
-- ÉTAPE 1: ÉTAT AVANT ALIMENTATION
-- =========================================

SELECT
  '📊 AVANT ALIMENTATION' as etape,
  COUNT(*) as total_options,
  COUNT(CASE WHEN icon IS NOT NULL AND icon != '' THEN 1 END) as avec_icon,
  COUNT(CASE WHEN icon IS NULL OR icon = '' THEN 1 END) as sans_icon
FROM france_product_options;

-- =========================================
-- ÉTAPE 2: ALIMENTATION PAR GROUPE
-- =========================================

-- BOISSONS (tous types)
UPDATE france_product_options
SET icon = CASE
  WHEN option_name ILIKE '%coca%cola%' AND option_name NOT LIKE '%zero%' THEN '🥤'
  WHEN option_name ILIKE '%coca%zero%' OR option_name ILIKE '%coca zero%' THEN '⚫'
  WHEN option_name ILIKE '%fanta%' THEN '🍊'
  WHEN option_name ILIKE '%sprite%' THEN '🥤'
  WHEN option_name ILIKE '%oasis%' THEN '🧡'
  WHEN option_name ILIKE '%tropico%' THEN '🥤'
  WHEN option_name ILIKE '%miranda%' THEN '🥤'
  WHEN option_name ILIKE '%7%up%' THEN '🥤'
  WHEN option_name ILIKE '%ice%tea%' OR option_name ILIKE '%lipton%' THEN '🧊'
  WHEN option_name ILIKE '%perrier%' THEN '🫧'
  WHEN option_name ILIKE '%eau%' OR option_name ILIKE '%cristaline%' THEN '🥤'
  WHEN option_name ILIKE '%red%bull%' THEN '⚡'
  WHEN option_name ILIKE '%schweppes%' THEN '🥤'
  WHEN option_name ILIKE '%orangina%' THEN '🍊'
  WHEN option_name ILIKE '%pepsi%' THEN '🥤'
  WHEN option_name ILIKE '%compote%' THEN '🍎'
  WHEN option_name ILIKE '%caprisun%' THEN '🧃'
  ELSE '🥤'  -- Par défaut pour boissons
END
WHERE (icon IS NULL OR icon = '')
  AND option_group ILIKE '%boisson%';

-- VIANDES
UPDATE france_product_options
SET icon = CASE
  WHEN option_name ILIKE '%nuggets%' THEN '🍗'
  WHEN option_name ILIKE '%tenders%' THEN '🍗'
  WHEN option_name ILIKE '%cordon%bleu%' THEN '🧀'
  WHEN option_name ILIKE '%viande%hachée%' OR option_name ILIKE '%viande hach%' THEN '🥩'
  WHEN option_name ILIKE '%merguez%' THEN '🌭'
  WHEN option_name ILIKE '%filet%poulet%' OR option_name ILIKE '%poulet%' THEN '🍖'
  WHEN option_name ILIKE '%steak%' THEN '🥩'
  WHEN option_name ILIKE '%bacon%' THEN '🥓'
  WHEN option_name ILIKE '%kebab%' OR option_name ILIKE '%kébab%' THEN '🥙'
  WHEN option_name ILIKE '%wings%' THEN '🍗'
  WHEN option_name ILIKE '%grec%' THEN '🥙'
  ELSE '🥩'  -- Par défaut pour viandes
END
WHERE (icon IS NULL OR icon = '')
  AND (option_group ILIKE '%viande%' OR option_group ILIKE '%choix%viande%');

-- SAUCES
UPDATE france_product_options
SET icon = CASE
  WHEN option_name ILIKE '%mayonnaise%' OR option_name ILIKE '%mayo%' THEN '🥚'
  WHEN option_name ILIKE '%ketchup%' THEN '🍅'
  WHEN option_name ILIKE '%algérienne%' OR option_name ILIKE '%algerienne%' THEN '🌶️'
  WHEN option_name ILIKE '%poivre%' THEN '🌶️'
  WHEN option_name ILIKE '%curry%' THEN '🍛'
  WHEN option_name ILIKE '%samouraï%' OR option_name ILIKE '%samourai%' THEN '🔥'
  WHEN option_name ILIKE '%harissa%' THEN '🔴'
  WHEN option_name ILIKE '%blanche%' THEN '⚪'
  WHEN option_name ILIKE '%biggy%' THEN '💛'
  WHEN option_name ILIKE '%barbecue%' OR option_name ILIKE '%bbq%' THEN '🍖'
  WHEN option_name ILIKE '%chili%' THEN '🌶️'
  WHEN option_name ILIKE '%andalouse%' THEN '🧡'
  WHEN option_name ILIKE '%moutarde%' THEN '🟡'
  WHEN option_name ILIKE '%fromagère%' OR option_name ILIKE '%fromagere%' THEN '🧀'
  WHEN option_name ILIKE '%burger%' THEN '🍔'
  WHEN option_name ILIKE '%tomate%' THEN '🍅'
  ELSE '🌶️'  -- Par défaut pour sauces
END
WHERE (icon IS NULL OR icon = '')
  AND option_group ILIKE '%sauce%';

-- CONDIMENTS / LÉGUMES
UPDATE france_product_options
SET icon = CASE
  WHEN option_name ILIKE '%salade%' THEN '🥬'
  WHEN option_name ILIKE '%tomate%' THEN '🍅'
  WHEN option_name ILIKE '%oignon%' THEN '🧅'
  WHEN option_name ILIKE '%olive%' THEN '🫒'
  WHEN option_name ILIKE '%cornichon%' THEN '🥒'
  WHEN option_name ILIKE '%avocat%' OR option_name ILIKE '%avocado%' THEN '🥑'
  WHEN option_name ILIKE '%champignon%' THEN '🍄'
  WHEN option_name ILIKE '%poivron%' THEN '🫑'
  ELSE '🥗'  -- Par défaut pour condiments
END
WHERE (icon IS NULL OR icon = '')
  AND (option_group ILIKE '%condiment%' OR option_group ILIKE '%légume%' OR option_group ILIKE '%legume%');

-- SUPPLÉMENTS / EXTRAS
UPDATE france_product_options
SET icon = CASE
  WHEN option_name ILIKE '%emmental%' OR option_name ILIKE '%cheddar%' OR option_name ILIKE '%raclette%' THEN '🧀'
  WHEN option_name ILIKE '%boursin%' THEN '🧈'
  WHEN option_name ILIKE '%mozzarella%' THEN '🧀'
  WHEN option_name ILIKE '%chèvre%' OR option_name ILIKE '%chevre%' THEN '🧀'
  WHEN option_name ILIKE '%bacon%' THEN '🥓'
  WHEN option_name ILIKE '%galette%' THEN '🫓'
  WHEN option_name ILIKE '%viande%' THEN '🥩'
  WHEN option_name ILIKE '%poulet%' THEN '🍗'
  WHEN option_name ILIKE '%jalapeño%' OR option_name ILIKE '%jalapeno%' THEN '🌶️'
  WHEN option_name ILIKE '%mozza%stick%' THEN '🧀'
  WHEN option_name ILIKE '%oignon%ring%' THEN '🧅'
  WHEN option_name ILIKE '%nugget%' THEN '🍗'
  WHEN option_name ILIKE '%tender%' THEN '🍗'
  WHEN option_name ILIKE '%wing%' THEN '🍗'
  WHEN option_name ILIKE '%pas de%' OR option_name ILIKE '%aucun%' THEN '❌'
  WHEN option_name ILIKE '%ajouter%' THEN '✅'
  ELSE '➕'  -- Par défaut pour suppléments
END
WHERE (icon IS NULL OR icon = '')
  AND (option_group ILIKE '%supplément%' OR option_group ILIKE '%supplement%' OR option_group ILIKE '%extra%');

-- FROMAGES
UPDATE france_product_options
SET icon = '🧀'
WHERE (icon IS NULL OR icon = '')
  AND option_group ILIKE '%fromage%';

-- CHEESY CRUST
UPDATE france_product_options
SET icon = '🧀'
WHERE (icon IS NULL OR icon = '')
  AND option_group ILIKE '%cheesy%';

-- PLATS / TAILLES / FORMULES
UPDATE france_product_options
SET icon = CASE
  WHEN option_name ILIKE '%burger%' THEN '🍔'
  WHEN option_name ILIKE '%pizza%' THEN '🍕'
  WHEN option_name ILIKE '%tacos%' OR option_name ILIKE '%menu%' THEN '🌯'
  WHEN option_name ILIKE '%nuggets%' THEN '🍗'
  WHEN option_name ILIKE '%wings%' THEN '🍗'
  WHEN option_name ILIKE '%tenders%' THEN '🍗'
  WHEN option_name ILIKE '%cheese%burger%' THEN '🍔'
  WHEN option_name ILIKE '%bowl%' THEN '🍜'
  WHEN option_name ILIKE '%poutine%' THEN '🍟'
  WHEN option_name ILIKE '%naan%' THEN '🫓'
  WHEN option_name ILIKE '%panini%' THEN '🥪'
  WHEN option_name ILIKE '%sandwich%' THEN '🥪'
  WHEN option_name ILIKE '%glace%' OR option_name ILIKE '%häagen%' THEN '🍨'
  WHEN option_name ILIKE '%kinder%' THEN '🍫'
  ELSE '🍽️'  -- Par défaut pour plats
END
WHERE (icon IS NULL OR icon = '')
  AND (option_group ILIKE '%plat%' OR option_group ILIKE '%taille%' OR option_group ILIKE '%formule%' OR option_group ILIKE '%choix%plat%');

-- CHARCUTERIE
UPDATE france_product_options
SET icon = '🥓'
WHERE (icon IS NULL OR icon = '')
  AND option_group ILIKE '%charcuterie%';

-- TOUT LE RESTE (fallback générique)
UPDATE france_product_options
SET icon = '🔹'
WHERE icon IS NULL OR icon = '';

-- =========================================
-- ÉTAPE 3: VÉRIFICATIONS APRÈS ALIMENTATION
-- =========================================

SELECT
  '✅ APRÈS ALIMENTATION' as etape,
  COUNT(*) as total_options,
  COUNT(CASE WHEN icon IS NOT NULL AND icon != '' THEN 1 END) as avec_icon,
  COUNT(CASE WHEN icon IS NULL OR icon = '' THEN 1 END) as sans_icon_restantes
FROM france_product_options;

-- Statistiques par groupe
SELECT
  option_group,
  COUNT(*) as total_options,
  COUNT(DISTINCT icon) as nb_icons_differentes,
  STRING_AGG(DISTINCT icon, ' ') as icons_utilisees
FROM france_product_options
WHERE icon IS NOT NULL AND icon != ''
GROUP BY option_group
ORDER BY option_group;

-- Exemples d'options alimentées
SELECT
  r.name as restaurant,
  p.name as produit,
  po.option_group,
  po.option_name,
  po.icon as nouvelle_icon,
  '✅ Icon ajoutée' as statut
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.icon IS NOT NULL AND po.icon != ''
ORDER BY r.name, p.name, po.option_group, po.display_order
LIMIT 50;

COMMIT;

-- =========================================
-- RÉSUMÉ DE L'OPÉRATION
-- =========================================
--
-- ICÔNES ASSIGNÉES PAR CATÉGORIE:
--   Boissons: 🥤 ⚫ 🍊 🧡 🧊 🫧 ⚡ 🍎 🧃
--   Viandes: 🥩 🍗 🧀 🌭 🍖 🥓 🥙
--   Sauces: 🥚 🍅 🌶️ 🍛 🔥 🔴 ⚪ 💛 🧡 🟡 🧀 🍔
--   Condiments: 🥬 🍅 🧅 🫒 🥒 🥑 🍄 🫑
--   Suppléments: 🧀 🧈 🥓 🫓 🥩 🍗 🌶️ ❌ ✅
--   Plats: 🍔 🍕 🌯 🍗 🍜 🍟 🫓 🥪 🍨
--   Fromages: 🧀
--   Charcuterie: 🥓
--   Fallback: 🔹
-- =========================================
