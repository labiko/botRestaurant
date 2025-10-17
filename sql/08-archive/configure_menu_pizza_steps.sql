-- 🍕 CONFIGURATION DES STEPS_CONFIG POUR TOUS LES MENUS PIZZA
-- Configuration interactive pour permettre les choix de pizzas, boissons et accompagnements
-- À exécuter dans l'ordre

BEGIN;

-- ============================================
-- 📋 MENU 1 (ID: 310) - 3 PIZZAS JUNIORS AU CHOIX
-- Prix: 25.00€
-- ============================================
UPDATE france_products 
SET steps_config = '{
  "steps": [
    {
      "type": "multiple_choice",
      "title": "Choisissez votre 1ère pizza JUNIOR",
      "options": [
        "🍕 *CLASSICA*",
        "🍕 *REINE*",
        "🍕 *DIVA*",
        "🍕 *NAPOLITAINE*",
        "🍕 *TONINO*",
        "🌶️ *ORIENTALE*",
        "🦐 *FRUITS DE MER*",
        "🥬 *VÉGÉTARIENNE*",
        "🍕 *CAMPIONE*",
        "🍕 *4 SAISONS*",
        "👑 *ROYALE*",
        "🗽 *NEW YORK*",
        "🌴 *MIAMI*",
        "🍖 *BARBECUE*",
        "🐔 *CHICKEN*",
        "🧀 *4 FROMAGES*",
        "🌺 *FLORIDA*",
        "🍍 *HAWAIENNE*",
        "🎰 *NEVADA*",
        "🌮 *MEXICO*",
        "🤠 *TEXAS*",
        "🍯 *CHÈVRE MIEL*",
        "🐟 *RIMINI*",
        "🧄 *BOURSIN*",
        "🇮🇹 *ANDIAMO*",
        "⚔️ *SAMOURAÏ*",
        "🥓 *4 JAMBONS*",
        "🧀 *TARTIFLETTE*",
        "🏔️ *MONTAGNARDE*",
        "🌶️ *POIVRE*",
        "🔥 *HOT SPICY*",
        "🍛 *TANDOORI*",
        "🍔 *BIG BURGER*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "multiple_choice",
      "title": "Choisissez votre 2ème pizza JUNIOR",
      "options": [
        "🍕 *CLASSICA*",
        "🍕 *REINE*",
        "🍕 *DIVA*",
        "🍕 *NAPOLITAINE*",
        "🍕 *TONINO*",
        "🌶️ *ORIENTALE*",
        "🦐 *FRUITS DE MER*",
        "🥬 *VÉGÉTARIENNE*",
        "🍕 *CAMPIONE*",
        "🍕 *4 SAISONS*",
        "👑 *ROYALE*",
        "🗽 *NEW YORK*",
        "🌴 *MIAMI*",
        "🍖 *BARBECUE*",
        "🐔 *CHICKEN*",
        "🧀 *4 FROMAGES*",
        "🌺 *FLORIDA*",
        "🍍 *HAWAIENNE*",
        "🎰 *NEVADA*",
        "🌮 *MEXICO*",
        "🤠 *TEXAS*",
        "🍯 *CHÈVRE MIEL*",
        "🐟 *RIMINI*",
        "🧄 *BOURSIN*",
        "🇮🇹 *ANDIAMO*",
        "⚔️ *SAMOURAÏ*",
        "🥓 *4 JAMBONS*",
        "🧀 *TARTIFLETTE*",
        "🏔️ *MONTAGNARDE*",
        "🌶️ *POIVRE*",
        "🔥 *HOT SPICY*",
        "🍛 *TANDOORI*",
        "🍔 *BIG BURGER*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "multiple_choice",
      "title": "Choisissez votre 3ème pizza JUNIOR",
      "options": [
        "🍕 *CLASSICA*",
        "🍕 *REINE*",
        "🍕 *DIVA*",
        "🍕 *NAPOLITAINE*",
        "🍕 *TONINO*",
        "🌶️ *ORIENTALE*",
        "🦐 *FRUITS DE MER*",
        "🥬 *VÉGÉTARIENNE*",
        "🍕 *CAMPIONE*",
        "🍕 *4 SAISONS*",
        "👑 *ROYALE*",
        "🗽 *NEW YORK*",
        "🌴 *MIAMI*",
        "🍖 *BARBECUE*",
        "🐔 *CHICKEN*",
        "🧀 *4 FROMAGES*",
        "🌺 *FLORIDA*",
        "🍍 *HAWAIENNE*",
        "🎰 *NEVADA*",
        "🌮 *MEXICO*",
        "🤠 *TEXAS*",
        "🍯 *CHÈVRE MIEL*",
        "🐟 *RIMINI*",
        "🧄 *BOURSIN*",
        "🇮🇹 *ANDIAMO*",
        "⚔️ *SAMOURAÏ*",
        "🥓 *4 JAMBONS*",
        "🧀 *TARTIFLETTE*",
        "🏔️ *MONTAGNARDE*",
        "🌶️ *POIVRE*",
        "🔥 *HOT SPICY*",
        "🍛 *TANDOORI*",
        "🍔 *BIG BURGER*"
      ],
      "price_modifier": 0.00
    }
  ],
  "final_format": "3 Pizzas Junior: {pizza1}, {pizza2}, {pizza3}"
}'::json
WHERE id = 310 AND restaurant_id = 1;

-- ============================================
-- 📋 MENU 2 (ID: 311) - 2 PIZZAS SÉNIOR + 1 BOISSON 1.5L
-- Prix: 25.00€
-- ============================================
UPDATE france_products 
SET steps_config = '{
  "steps": [
    {
      "type": "multiple_choice",
      "title": "Choisissez votre 1ère pizza SÉNIOR",
      "options": [
        "🍕 *CLASSICA*",
        "🍕 *REINE*",
        "🍕 *DIVA*",
        "🍕 *NAPOLITAINE*",
        "🍕 *TONINO*",
        "🌶️ *ORIENTALE*",
        "🦐 *FRUITS DE MER*",
        "🥬 *VÉGÉTARIENNE*",
        "🍕 *CAMPIONE*",
        "🍕 *4 SAISONS*",
        "👑 *ROYALE*",
        "🗽 *NEW YORK*",
        "🌴 *MIAMI*",
        "🍖 *BARBECUE*",
        "🐔 *CHICKEN*",
        "🧀 *4 FROMAGES*",
        "🌺 *FLORIDA*",
        "🍍 *HAWAIENNE*",
        "🎰 *NEVADA*",
        "🌮 *MEXICO*",
        "🤠 *TEXAS*",
        "🍯 *CHÈVRE MIEL*",
        "🐟 *RIMINI*",
        "🧄 *BOURSIN*",
        "🇮🇹 *ANDIAMO*",
        "⚔️ *SAMOURAÏ*",
        "🥓 *4 JAMBONS*",
        "🧀 *TARTIFLETTE*",
        "🏔️ *MONTAGNARDE*",
        "🌶️ *POIVRE*",
        "🔥 *HOT SPICY*",
        "🍛 *TANDOORI*",
        "🍔 *BIG BURGER*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "multiple_choice",
      "title": "Choisissez votre 2ème pizza SÉNIOR",
      "options": [
        "🍕 *CLASSICA*",
        "🍕 *REINE*",
        "🍕 *DIVA*",
        "🍕 *NAPOLITAINE*",
        "🍕 *TONINO*",
        "🌶️ *ORIENTALE*",
        "🦐 *FRUITS DE MER*",
        "🥬 *VÉGÉTARIENNE*",
        "🍕 *CAMPIONE*",
        "🍕 *4 SAISONS*",
        "👑 *ROYALE*",
        "🗽 *NEW YORK*",
        "🌴 *MIAMI*",
        "🍖 *BARBECUE*",
        "🐔 *CHICKEN*",
        "🧀 *4 FROMAGES*",
        "🌺 *FLORIDA*",
        "🍍 *HAWAIENNE*",
        "🎰 *NEVADA*",
        "🌮 *MEXICO*",
        "🤠 *TEXAS*",
        "🍯 *CHÈVRE MIEL*",
        "🐟 *RIMINI*",
        "🧄 *BOURSIN*",
        "🇮🇹 *ANDIAMO*",
        "⚔️ *SAMOURAÏ*",
        "🥓 *4 JAMBONS*",
        "🧀 *TARTIFLETTE*",
        "🏔️ *MONTAGNARDE*",
        "🌶️ *POIVRE*",
        "🔥 *HOT SPICY*",
        "🍛 *TANDOORI*",
        "🍔 *BIG BURGER*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "single_choice",
      "title": "Choisissez votre boisson 1.5L",
      "options": [
        "🥤 *COCA COLA 1.5L*",
        "⚫ *COCA ZERO 1.5L*",
        "🧡 *FANTA 1.5L*",
        "🍊 *OASIS 1.5L*"
      ],
      "price_modifier": 0.00
    }
  ],
  "final_format": "2 Pizzas Sénior: {pizza1}, {pizza2} + Boisson: {boisson}"
}'::json
WHERE id = 311 AND restaurant_id = 1;

-- ============================================
-- 📋 MENU 3 (ID: 312) - 1 PIZZA MEGA + NUGGETS/WINGS + BOISSON
-- Prix: 32.00€
-- ============================================
UPDATE france_products 
SET steps_config = '{
  "steps": [
    {
      "type": "single_choice",
      "title": "Choisissez votre pizza MEGA",
      "options": [
        "🍕 *CLASSICA*",
        "🍕 *REINE*",
        "🍕 *DIVA*",
        "🍕 *NAPOLITAINE*",
        "🍕 *TONINO*",
        "🌶️ *ORIENTALE*",
        "🦐 *FRUITS DE MER*",
        "🥬 *VÉGÉTARIENNE*",
        "🍕 *CAMPIONE*",
        "🍕 *4 SAISONS*",
        "👑 *ROYALE*",
        "🗽 *NEW YORK*",
        "🌴 *MIAMI*",
        "🍖 *BARBECUE*",
        "🐔 *CHICKEN*",
        "🧀 *4 FROMAGES*",
        "🌺 *FLORIDA*",
        "🍍 *HAWAIENNE*",
        "🎰 *NEVADA*",
        "🌮 *MEXICO*",
        "🤠 *TEXAS*",
        "🍯 *CHÈVRE MIEL*",
        "🐟 *RIMINI*",
        "🧄 *BOURSIN*",
        "🇮🇹 *ANDIAMO*",
        "⚔️ *SAMOURAÏ*",
        "🥓 *4 JAMBONS*",
        "🧀 *TARTIFLETTE*",
        "🏔️ *MONTAGNARDE*",
        "🌶️ *POIVRE*",
        "🔥 *HOT SPICY*",
        "🍛 *TANDOORI*",
        "🍔 *BIG BURGER*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "single_choice",
      "title": "Choisissez votre accompagnement",
      "options": [
        "🍗 *14 NUGGETS*",
        "🍗 *12 WINGS*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "single_choice",
      "title": "Choisissez votre boisson 1.5L",
      "options": [
        "🥤 *COCA COLA 1.5L*",
        "⚫ *COCA ZERO 1.5L*",
        "🧡 *FANTA 1.5L*",
        "🍊 *OASIS 1.5L*"
      ],
      "price_modifier": 0.00
    }
  ],
  "final_format": "Pizza Mega: {pizza} + {accompagnement} + Boisson: {boisson}"
}'::json
WHERE id = 312 AND restaurant_id = 1;

-- ============================================
-- 📋 MENU 4 (ID: 313) - 1 PIZZA SÉNIOR + 2 BOISSONS 33CL + WINGS/NUGGETS
-- Prix: 22.00€
-- ============================================
UPDATE france_products 
SET steps_config = '{
  "steps": [
    {
      "type": "single_choice",
      "title": "Choisissez votre pizza SÉNIOR",
      "options": [
        "🍕 *CLASSICA*",
        "🍕 *REINE*",
        "🍕 *DIVA*",
        "🍕 *NAPOLITAINE*",
        "🍕 *TONINO*",
        "🌶️ *ORIENTALE*",
        "🦐 *FRUITS DE MER*",
        "🥬 *VÉGÉTARIENNE*",
        "🍕 *CAMPIONE*",
        "🍕 *4 SAISONS*",
        "👑 *ROYALE*",
        "🗽 *NEW YORK*",
        "🌴 *MIAMI*",
        "🍖 *BARBECUE*",
        "🐔 *CHICKEN*",
        "🧀 *4 FROMAGES*",
        "🌺 *FLORIDA*",
        "🍍 *HAWAIENNE*",
        "🎰 *NEVADA*",
        "🌮 *MEXICO*",
        "🤠 *TEXAS*",
        "🍯 *CHÈVRE MIEL*",
        "🐟 *RIMINI*",
        "🧄 *BOURSIN*",
        "🇮🇹 *ANDIAMO*",
        "⚔️ *SAMOURAÏ*",
        "🥓 *4 JAMBONS*",
        "🧀 *TARTIFLETTE*",
        "🏔️ *MONTAGNARDE*",
        "🌶️ *POIVRE*",
        "🔥 *HOT SPICY*",
        "🍛 *TANDOORI*",
        "🍔 *BIG BURGER*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "multiple_choice",
      "title": "Choisissez votre 1ère boisson 33CL",
      "options": [
        "🥤 *COCA COLA*",
        "⚫ *COCA ZERO*",
        "🍋 *7UP*",
        "🍒 *7UP CHERRY*",
        "🌴 *7UP TROPICAL*",
        "🍑 *ICE TEA*",
        "🍓 *MIRANDA FRAISE*",
        "🥭 *MIRANDA TROPICAL*",
        "🍊 *OASIS TROPICAL*",
        "💧 *EAU MINÉRALE*",
        "💎 *PERRIER*",
        "🌺 *TROPICO*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "multiple_choice",
      "title": "Choisissez votre 2ème boisson 33CL",
      "options": [
        "🥤 *COCA COLA*",
        "⚫ *COCA ZERO*",
        "🍋 *7UP*",
        "🍒 *7UP CHERRY*",
        "🌴 *7UP TROPICAL*",
        "🍑 *ICE TEA*",
        "🍓 *MIRANDA FRAISE*",
        "🥭 *MIRANDA TROPICAL*",
        "🍊 *OASIS TROPICAL*",
        "💧 *EAU MINÉRALE*",
        "💎 *PERRIER*",
        "🌺 *TROPICO*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "single_choice",
      "title": "Choisissez votre accompagnement",
      "options": [
        "🍗 *6 WINGS*",
        "🍗 *8 NUGGETS*"
      ],
      "price_modifier": 0.00
    }
  ],
  "final_format": "Pizza Sénior: {pizza} + 2 Boissons: {boisson1}, {boisson2} + {accompagnement}"
}'::json
WHERE id = 313 AND restaurant_id = 1;

-- ============================================
-- VÉRIFICATION DES MODIFICATIONS
-- ============================================
SELECT 
    p.id,
    p.name,
    p.price_on_site_base,
    p.workflow_type,
    p.requires_steps,
    p.steps_config IS NOT NULL as has_config,
    jsonb_array_length(p.steps_config::jsonb->'steps') as number_of_steps
FROM france_products p
WHERE p.id IN (310, 311, 312, 313)
    AND p.restaurant_id = 1
ORDER BY p.id;

COMMIT;

-- Note: Les tailles (Junior, Sénior, Mega) sont implicites dans le menu
-- Le bot devra gérer l'ajout de la bonne taille lors de l'ajout au panier