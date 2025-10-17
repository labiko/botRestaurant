-- =========================================
-- MIGRATION BOT: 'menus' → 'france_products'
-- =========================================
-- Objectif: Adapter le bot WhatsApp pour utiliser france_products
-- au lieu de la table 'menus' qui n'existe pas
-- Généré le: 21/09/2025

-- =========================================
-- 1. VÉRIFICATION DE L'ÉTAT ACTUEL
-- =========================================

-- Vérifier les restaurants disponibles
SELECT id, name as nom, is_active
FROM france_restaurants
WHERE is_active = true
ORDER BY id;

-- Vérifier les produits disponibles par restaurant
SELECT
  r.name as restaurant_nom,
  c.name as categorie,
  p.name as nom_plat,
  p.base_price as prix,
  p.is_active as disponible,
  p.workflow_type,
  p.requires_steps
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY r.id, c.display_order, p.display_order;

-- =========================================
-- 2. MAPPING DES DONNÉES BOT
-- =========================================

-- ANCIEN FORMAT BOT (table 'menus'):
-- - restaurant_id
-- - categorie (texte: 'pizza', 'burger', etc.)
-- - nom_plat
-- - prix
-- - disponible
-- - ordre_affichage

-- NOUVEAU FORMAT (table 'france_products'):
-- - restaurant_id
-- - category_id (FK vers france_menu_categories)
-- - name (au lieu de nom_plat)
-- - base_price (au lieu de prix)
-- - is_active (au lieu de disponible)
-- - display_order (au lieu de ordre_affichage)

-- =========================================
-- 3. CORRESPONDANCE DES CATÉGORIES
-- =========================================

-- Les catégories du bot sont hardcodées (getDefaultCategories):
-- 'pizza' → 'PIZZAS' 🍕
-- 'burger' → 'BURGERS' 🍔
-- 'sandwich' → 'SANDWICHS' 🥪
-- 'taco' → 'TACOS' 🌮
-- 'pates' → 'PÂTES' 🍝
-- 'salade' → 'SALADES' 🥗
-- 'assiette' → 'ASSIETTES' 🍽️
-- 'naan' → 'NAANS' 🫓
-- 'accompagnement' → 'ACCOMPAGNEMENTS' 🍟
-- 'entree' → 'ENTRÉES' 🥗
-- 'dessert' → 'DESSERTS' 🍰
-- 'boisson' → 'BOISSONS' 🥤

-- Créer vue pour mapper les catégories vers le format attendu par le bot
CREATE OR REPLACE VIEW bot_menu_compatibility AS
SELECT
  p.restaurant_id,
  -- Mapping category_id vers category_key du bot
  CASE c.name
    WHEN 'Pizzas' THEN 'pizza'
    WHEN 'Pizza' THEN 'pizza'
    WHEN 'PIZZAS' THEN 'pizza'
    WHEN 'Burgers' THEN 'burger'
    WHEN 'Burger' THEN 'burger'
    WHEN 'BURGERS' THEN 'burger'
    WHEN 'Sandwichs' THEN 'sandwich'
    WHEN 'Sandwich' THEN 'sandwich'
    WHEN 'SANDWICHS' THEN 'sandwich'
    WHEN 'Tacos' THEN 'taco'
    WHEN 'Taco' THEN 'taco'
    WHEN 'TACOS' THEN 'taco'
    WHEN 'Pâtes' THEN 'pates'
    WHEN 'Pates' THEN 'pates'
    WHEN 'PÂTES' THEN 'pates'
    WHEN 'Salades' THEN 'salade'
    WHEN 'Salade' THEN 'salade'
    WHEN 'SALADES' THEN 'salade'
    WHEN 'Assiettes' THEN 'assiette'
    WHEN 'Assiette' THEN 'assiette'
    WHEN 'ASSIETTES' THEN 'assiette'
    WHEN 'Naans' THEN 'naan'
    WHEN 'Naan' THEN 'naan'
    WHEN 'NAANS' THEN 'naan'
    WHEN 'Accompagnements' THEN 'accompagnement'
    WHEN 'Accompagnement' THEN 'accompagnement'
    WHEN 'ACCOMPAGNEMENTS' THEN 'accompagnement'
    WHEN 'Entrées' THEN 'entree'
    WHEN 'Entree' THEN 'entree'
    WHEN 'ENTRÉES' THEN 'entree'
    WHEN 'Desserts' THEN 'dessert'
    WHEN 'Dessert' THEN 'dessert'
    WHEN 'DESSERTS' THEN 'dessert'
    WHEN 'Boissons' THEN 'boisson'
    WHEN 'Boisson' THEN 'boisson'
    WHEN 'BOISSONS' THEN 'boisson'
    -- Formules spéciales
    WHEN 'Formules' THEN 'pizza'  -- Traiter comme pizza pour compatibility
    WHEN 'Bowls' THEN 'assiette'  -- Traiter comme assiette
    ELSE 'autre'  -- Catégorie par défaut
  END as categorie,
  p.name as nom_plat,
  p.base_price as prix,
  p.is_active as disponible,
  p.display_order as ordre_affichage,
  -- Informations additionnelles pour les workflows
  p.workflow_type,
  p.requires_steps,
  p.steps_config
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY p.restaurant_id, c.display_order, p.display_order;

-- =========================================
-- 4. TEST DE LA VUE
-- =========================================

-- Tester la compatibilité pour Pizza Yolo (id=16)
SELECT *
FROM bot_menu_compatibility
WHERE restaurant_id = 16
ORDER BY categorie, ordre_affichage;

-- Vérifier le nombre de produits par catégorie (comme le bot l'affiche)
SELECT
  restaurant_id,
  categorie,
  COUNT(*) as nb_produits,
  STRING_AGG(nom_plat, ', ') as produits
FROM bot_menu_compatibility
WHERE restaurant_id = 16
GROUP BY restaurant_id, categorie
ORDER BY categorie;

-- =========================================
-- 5. INSTRUCTIONS POUR MODIFIER LE BOT
-- =========================================

-- DANS LE FICHIER: supabase/functions/webhook-whatsapp/index.ts
--
-- REMPLACER TOUTES LES REQUÊTES:
-- .from('menus')
--
-- PAR:
-- .from('bot_menu_compatibility')
--
-- La vue bot_menu_compatibility fournit exactement les mêmes colonnes
-- que l'ancienne table 'menus', donc aucune autre modification nécessaire.
--
-- LIGNES À MODIFIER (approximativement):
-- - Ligne 984: const { data: allMenuItems } = await supabase.from('menus')
-- - Ligne 1307: const { data: menuItems } = await supabase.from('menus')
-- - Ligne 1329: const { data: menuItems } = await supabase.from('menus')
-- - Ligne 1341: const { data: menuItems } = await supabase.from('menus')
-- - Ligne 2517: const { data: menuItems } = await supabase.from('menus')
-- - Ligne 2537: const { data: menuItems } = await supabase.from('menus')

-- =========================================
-- 6. VALIDATION POST-MIGRATION
-- =========================================

-- Après modification du bot, tester:
-- 1. resto → Liste des restaurants
-- 2. 1 → Sélection Pizza Yolo
-- 3. Vérifier affichage catégories
-- 4. 1 → Sélection d'une catégorie
-- 5. Vérifier affichage des produits

-- =========================================
-- NOTES IMPORTANTES
-- =========================================
-- 1. La vue bot_menu_compatibility maintient la compatibilité 100%
-- 2. Aucun changement de logique nécessaire dans le bot
-- 3. Les workflows france_products sont plus riches (steps_config, etc.)
-- 4. Migration non-destructive (vue peut être supprimée si problème)
-- =========================================