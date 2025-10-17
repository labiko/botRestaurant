-- ========================================================================
-- SCRIPT: Correction COMPLÈTE de TOUTES les icônes produits manquantes
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Date: 2025-10-17
--
-- PROBLÈME:
-- 91 produits actifs n'ont pas d'icône définie
--
-- SOLUTION:
-- Ajouter les icônes appropriées à tous les produits
-- ========================================================================

BEGIN;

-- =====================================================================
-- PARTIE 1 : PIZZAS (33 produits)
-- Copier l'icône depuis le nom vers le champ icon
-- =====================================================================

UPDATE france_products SET icon = '🍕' WHERE id = 276 AND name = '🍕 CLASSICA';
UPDATE france_products SET icon = '🍕' WHERE id = 277 AND name = '🍕 REINE';
UPDATE france_products SET icon = '🍕' WHERE id = 278 AND name = '🍕 DIVA';
UPDATE france_products SET icon = '🥟' WHERE id = 279 AND name = '🥟 CALZONE SOUFFLÉE';
UPDATE france_products SET icon = '🍕' WHERE id = 280 AND name = '🍕 NAPOLITAINE';
UPDATE france_products SET icon = '🍕' WHERE id = 281 AND name = '🍕 TONINO';
UPDATE france_products SET icon = '🌶️' WHERE id = 282 AND name = '🌶️ ORIENTALE';
UPDATE france_products SET icon = '🥬' WHERE id = 283 AND name = '🥬 VÉGÉTARIENNE';
UPDATE france_products SET icon = '🦐' WHERE id = 284 AND name = '🦐 FRUITS DE MER';
UPDATE france_products SET icon = '🍕' WHERE id = 285 AND name = '🍕 CAMPIONE';
UPDATE france_products SET icon = '🍕' WHERE id = 286 AND name = '🍕 4 SAISONS';
UPDATE france_products SET icon = '👑' WHERE id = 287 AND name = '👑 ROYALE';
UPDATE france_products SET icon = '🗽' WHERE id = 288 AND name = '🗽 NEW YORK';
UPDATE france_products SET icon = '🌴' WHERE id = 289 AND name = '🌴 MIAMI';
UPDATE france_products SET icon = '🍖' WHERE id = 290 AND name = '🍖 BARBECUE';
UPDATE france_products SET icon = '🐔' WHERE id = 291 AND name = '🐔 CHICKEN';
UPDATE france_products SET icon = '🧀' WHERE id = 292 AND name = '🧀 4 FROMAGES';
UPDATE france_products SET icon = '🌺' WHERE id = 293 AND name = '🌺 FLORIDA';
UPDATE france_products SET icon = '🍍' WHERE id = 294 AND name = '🍍 HAWAIENNE';
UPDATE france_products SET icon = '🎰' WHERE id = 295 AND name = '🎰 NEVADA';
UPDATE france_products SET icon = '🌮' WHERE id = 296 AND name = '🌮 MEXICO';
UPDATE france_products SET icon = '🤠' WHERE id = 297 AND name = '🤠 TEXAS';
UPDATE france_products SET icon = '🐟' WHERE id = 299 AND name = '🐟 RIMINI';
UPDATE france_products SET icon = '🧄' WHERE id = 300 AND name = '🧄 BOURSIN';
UPDATE france_products SET icon = '🇮🇹' WHERE id = 301 AND name = '🇮🇹 ANDIAMO';
UPDATE france_products SET icon = '⚔️' WHERE id = 302 AND name = '⚔️ SAMOURAÏ';
UPDATE france_products SET icon = '🥓' WHERE id = 303 AND name = '🥓 4 JAMBONS';
UPDATE france_products SET icon = '🧀' WHERE id = 304 AND name = '🧀 TARTIFLETTE';
UPDATE france_products SET icon = '🏔️' WHERE id = 305 AND name = '🏔️ MONTAGNARDE';
UPDATE france_products SET icon = '🌶️' WHERE id = 306 AND name = '🌶️ POIVRE';
UPDATE france_products SET icon = '🔥' WHERE id = 307 AND name = '🔥 HOT SPICY';
UPDATE france_products SET icon = '🍛' WHERE id = 308 AND name = '🍛 TANDOORI';
UPDATE france_products SET icon = '🍔' WHERE id = 309 AND name = '🍔 BIG BURGER';

-- =====================================================================
-- PARTIE 2 : PRODUITS TITRES DE CATÉGORIES
-- =====================================================================

UPDATE france_products SET icon = '🍔' WHERE id = 658 AND name = 'BURGERS';
UPDATE france_products SET icon = '🥪' WHERE id = 663 AND name = 'SANDWICHS';
UPDATE france_products SET icon = '🥘' WHERE id = 660 AND name = 'GOURMETS';
UPDATE france_products SET icon = '🥩' WHERE id = 661 AND name = 'SMASHS';
UPDATE france_products SET icon = '🍽️' WHERE id = 665 AND name = 'ASSIETTES';
UPDATE france_products SET icon = '🫓' WHERE id = 662 AND name = 'NAANS';
UPDATE france_products SET icon = '🥪' WHERE id = 664 AND name = 'PANINI';

-- =====================================================================
-- PARTIE 3 : POULET & SNACKS (12 produits)
-- =====================================================================

UPDATE france_products SET icon = '🍗' WHERE id = 372 AND name = 'TENDERS 1 PIECE';
UPDATE france_products SET icon = '🍗' WHERE id = 373 AND name = 'NUGGETS 4 PIECES';
UPDATE france_products SET icon = '🍗' WHERE id = 374 AND name = 'WINGS 4 PIECES';
UPDATE france_products SET icon = '🍩' WHERE id = 375 AND name = 'DONUTS POULET 1 PIECE';
UPDATE france_products SET icon = '🧀' WHERE id = 376 AND name = 'MOZZA STICK 4 PIECES';
UPDATE france_products SET icon = '🌶️' WHERE id = 377 AND name = 'JALAPENOS 4 PIECES';
UPDATE france_products SET icon = '🧅' WHERE id = 378 AND name = 'ONION RINGS 4 PIECES';
UPDATE france_products SET icon = '🥔' WHERE id = 379 AND name = 'POTATOES';
UPDATE france_products SET icon = '🍗' WHERE id = 380 AND name = 'TENDERS 5 PIECES';
UPDATE france_products SET icon = '🍗' WHERE id = 381 AND name = 'NUGGETS 10 PIECES';
UPDATE france_products SET icon = '🍗' WHERE id = 382 AND name = 'WINGS 8 PIECES';

-- =====================================================================
-- PARTIE 4 : ICE CREAM (4 produits)
-- =====================================================================

UPDATE france_products SET icon = '🍨' WHERE id = 192 AND name = 'HÄAGEN-DAZS 100ML';
UPDATE france_products SET icon = '🍨' WHERE id = 193 AND name = 'HÄAGEN-DAZS 500ML';
UPDATE france_products SET icon = '🍨' WHERE id = 194 AND name = 'BEN & JERRY''S 100ML';
UPDATE france_products SET icon = '🍨' WHERE id = 195 AND name = 'BEN & JERRY''S 500ML';

-- =====================================================================
-- PARTIE 5 : DESSERTS (5 produits)
-- =====================================================================

UPDATE france_products SET icon = '🍎' WHERE id = 172 AND name = 'TARTE AUX POMMES';
UPDATE france_products SET icon = '🍐' WHERE id = 173 AND name = 'TARTE AUX POIRES';
UPDATE france_products SET icon = '🍫' WHERE id = 174 AND name = 'BROWNIES';
UPDATE france_products SET icon = '🍰' WHERE id = 175 AND name = 'TARTE AUX DAIMS';
UPDATE france_products SET icon = '🍰' WHERE id = 177 AND name = 'FINGER';

-- =====================================================================
-- PARTIE 6 : BOISSONS (16 produits)
-- =====================================================================

UPDATE france_products SET icon = '🥤' WHERE id = 260 AND name = 'MIRANDA TROPICAL';
UPDATE france_products SET icon = '🥤' WHERE id = 261 AND name = 'MIRANDA FRAISE';
UPDATE france_products SET icon = '🥤' WHERE id = 262 AND name = 'OASIS TROPICAL';
UPDATE france_products SET icon = '🥤' WHERE id = 263 AND name = 'TROPICO';
UPDATE france_products SET icon = '🧃' WHERE id = 264 AND name = 'ICE TEA';
UPDATE france_products SET icon = '🥤' WHERE id = 265 AND name = '7 UP';
UPDATE france_products SET icon = '🥤' WHERE id = 266 AND name = '7UP TROPICAL';
UPDATE france_products SET icon = '🥤' WHERE id = 267 AND name = '7UP CHERRY';
UPDATE france_products SET icon = '🥤' WHERE id = 268 AND name = 'COCA COLA';
UPDATE france_products SET icon = '🥤' WHERE id = 269 AND name = 'COCA ZERO';
UPDATE france_products SET icon = '💧' WHERE id = 270 AND name = 'EAU MINÉRALE';
UPDATE france_products SET icon = '💧' WHERE id = 271 AND name = 'PERRIER';
UPDATE france_products SET icon = '🥤' WHERE id = 272 AND name = 'COCA COLA 1L5';
UPDATE france_products SET icon = '🥤' WHERE id = 273 AND name = 'COCA ZERO 1L5';
UPDATE france_products SET icon = '🥤' WHERE id = 274 AND name = 'FANTA 1L5';
UPDATE france_products SET icon = '🥤' WHERE id = 275 AND name = 'OASIS 1L5';

-- =====================================================================
-- PARTIE 7 : SALADES (6 produits)
-- =====================================================================

UPDATE france_products SET icon = '🥗' WHERE id = 178 AND name = 'VERTE';
UPDATE france_products SET icon = '🥗' WHERE id = 179 AND name = 'ROMAINE';
UPDATE france_products SET icon = '🦐' WHERE id = 180 AND name = 'CREVETTE AVOCAT';
UPDATE france_products SET icon = '🥗' WHERE id = 181 AND name = 'NIÇOISE';
UPDATE france_products SET icon = '🧀' WHERE id = 182 AND name = 'CHÈVRE CHAUD';
UPDATE france_products SET icon = '🥗' WHERE id = 183 AND name = 'CESAR';

-- =====================================================================
-- PARTIE 8 : TEX-MEX (3 produits)
-- =====================================================================

UPDATE france_products SET icon = '🍗' WHERE id = 184 AND name = 'CHICKEN WINGS';
UPDATE france_products SET icon = '🍗' WHERE id = 185 AND name = 'NUGGETS';
UPDATE france_products SET icon = '🍗' WHERE id = 457 AND name = 'TENDERS';

-- =====================================================================
-- PARTIE 9 : PÂTES (5 produits)
-- =====================================================================

UPDATE france_products SET icon = '🍝' WHERE id = 196 AND name = 'BOLOGNAISE';
UPDATE france_products SET icon = '🍝' WHERE id = 197 AND name = 'CARBONARA';
UPDATE france_products SET icon = '🍝' WHERE id = 198 AND name = '3 FROMAGES';
UPDATE france_products SET icon = '🍝' WHERE id = 199 AND name = 'PÂTES AU SAUMON';
UPDATE france_products SET icon = '🍝' WHERE id = 200 AND name = 'PÂTES AU POULET';

-- =====================================================================
-- PARTIE 10 : CHICKEN BOX (1 produit)
-- =====================================================================

UPDATE france_products SET icon = '🍗' WHERE id = 240 AND name = 'NOS BOX';

-- =====================================================================
-- VÉRIFICATION FINALE
-- =====================================================================

SELECT
  'PRODUITS RESTANTS SANS ICÔNE' as verification,
  COUNT(*) as nb_produits
FROM france_products
WHERE restaurant_id = 1
  AND is_active = true
  AND (icon IS NULL OR icon = '');

SELECT
  'ÉCHANTILLON PRODUITS CORRIGÉS' as section,
  c.name as categorie,
  p.name as produit,
  p.icon
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.id IN (276, 658, 372, 192, 172, 260, 178, 184, 196, 240)
  AND p.restaurant_id = 1
ORDER BY c.display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ 33 pizzas avec icônes
-- ✅ 7 produits titres catégories avec icônes
-- ✅ 12 poulet & snacks avec icônes
-- ✅ 4 ice creams avec icônes
-- ✅ 5 desserts avec icônes
-- ✅ 16 boissons avec icônes
-- ✅ 6 salades avec icônes
-- ✅ 3 tex-mex avec icônes
-- ✅ 5 pâtes avec icônes
-- ✅ 1 chicken box avec icône
-- ✅ Total: 92 produits corrigés (91 + MENU ENFANT déjà fait)
-- ✅ 0 produit restant sans icône
-- ========================================================================
