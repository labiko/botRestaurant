# 🎯 EXEMPLES CONCRETS DE PATTERNS - PIZZA YOLO 77

## 📋 GUIDE RAPIDE DES 4 TYPES

### 🟢 TYPE SIMPLE (75% des cas)
**Pattern** : Produit basique, prix fixe, aucun workflow

```sql
-- Exemple : FRITES
INSERT INTO menu_items (
  restaurant_id, category_id, name, description, product_type,
  price_on_site_base, price_delivery_base, composition,
  workflow_type, requires_steps, steps_config, display_order
) VALUES (
  1, 5, '🍟 FRITES', null, 'simple',
  3.00, 4.00, null,
  null, false, null, 1
);
```

**Autres exemples réels** :
- 🥤 COCA COLA (1.5€/2.5€)
- 🌯 PANINI JAMBON (4€/5€)
- 🍖 KEBAB (6€/7€)
- 🍝 PÂTES BOLOGNAISE (7€/8€)

---

### 🟡 TYPE MODULAR (15% des cas)
**Pattern** : Produit avec tailles multiples, base_price null, prix gérés par size_pricing

```sql
-- Exemple : PIZZA CLASSICA
INSERT INTO menu_items (
  restaurant_id, category_id, name, composition, product_type,
  base_price, workflow_type, requires_steps, steps_config, display_order
) VALUES (
  1, 10, '🍕 CLASSICA', 'SAUCE TOMATE, FROMAGE, ORIGAN', 'modular',
  null, null, false, null, 1
);
```

**Autres exemples réels** :
- 🍕 REINE (sauce tomate, fromage, jambon, champignons)
- 🍕 4 SAISONS (sauce tomate, fromage, jambon, artichauts, champignons, poivrons, olives)
- 🌮 TACOS (base 7€/8€)

---

### 🟠 TYPE VARIANT (5% des cas)
**Pattern** : Produit avec variantes simples, prix de base + options

```sql
-- Exemple : NUGGETS (avec variantes 6/8/10 pièces)
INSERT INTO menu_items (
  restaurant_id, category_id, name, description, product_type,
  price_on_site_base, price_delivery_base, composition,
  workflow_type, requires_steps, steps_config, display_order
) VALUES (
  1, 6, '🍗 NUGGETS', null, 'variant',
  4.00, 5.00, null,
  null, false, null, 1
);
```

**Autres exemples réels** :
- 🍟 FRITES XL (taille supérieure)
- 🍗 WINGS 6/12 pièces
- 🥔 POTATOES (variante frites)

---

### 🔴 TYPE COMPOSITE (5% des cas)
**Pattern** : Produit avec workflow obligatoire, prix fixe total

#### A. Workflow Standard (`composite_workflow`)

```sql
-- Exemple : CHEESEBURGER + boisson incluse
INSERT INTO menu_items (
  restaurant_id, category_id, name, composition, product_type,
  price_on_site_base, price_delivery_base, workflow_type, requires_steps,
  steps_config, display_order
) VALUES (
  1, 2, 'CHEESEBURGER', 'Steak 45g, fromage, cornichons', 'composite',
  5.00, 6.00, 'composite_workflow', true,
  '{"steps":[{"type":"options_selection","required":true,"prompt":"Choisissez votre boisson 33CL incluse","option_groups":["Boisson 33CL incluse"],"max_selections":1}]}',
  1
);
```

**Autres exemples réels** :
- DOUBLE CHEESEBURGER (6.5€/7.5€)
- LE FISH (6.5€/7€)
- LE CHICKEN (6.5€/7€)

#### B. Workflow Menu (`menu_pizza_selection`)

```sql
-- Exemple : MENU 1 (3 pizzas junior)
INSERT INTO menu_items (
  restaurant_id, category_id, name, composition, product_type,
  price_on_site_base, price_delivery_base, workflow_type, requires_steps,
  steps_config, display_order
) VALUES (
  1, 11, '📋 MENU 1', '3 PIZZAS JUNIORS AU CHOIX', 'composite',
  25.00, 26.00, 'menu_pizza_selection', true,
  '{"menu_config":{"name":"MENU 1","price":25,"components":[{"type":"pizza_selection","title":"Choisissez 3 pizzas JUNIOR","size":"junior","quantity":3,"selection_mode":"multiple","display_prices":true,"instruction":"Tapez les 3 numéros séparés par des virgules\\nEx: 1,2,5 pour CLASSICA, REINE et TONINO"}]}}',
  1
);
```

---

## 🔍 DÉTECTION AUTOMATIQUE PAR MOTS-CLÉS

### 🎯 Détection SIMPLE
**Mots-clés** : frites, nuggets standard, panini, kebab, wrap, pâtes, salade, boisson, glace, dessert, sauce
**Pattern** : Un seul produit, un seul prix, pas d'options

### 🎯 Détection MODULAR
**Mots-clés** : pizza, tacos (avec mention tailles)
**Pattern** : Mention de tailles ou composition détaillée

### 🎯 Détection VARIANT
**Mots-clés** : nuggets X pièces, frites XL, wings X pièces
**Pattern** : Mention de quantité ou taille variant

### 🎯 Détection COMPOSITE
**Mots-clés** : "+" dans le nom, "menu", "avec boisson", "inclus"
**Pattern** : Accompagnement obligatoire ou menu complexe

---

## 📊 STRUCTURES JSON VALIDÉES

### Structure composite_workflow
```json
{
  "steps": [
    {
      "type": "options_selection",
      "required": true,
      "prompt": "Choisissez votre boisson 33CL incluse",
      "option_groups": ["Boisson 33CL incluse"],
      "max_selections": 1
    }
  ]
}
```

### Structure menu_pizza_selection simple
```json
{
  "menu_config": {
    "name": "MENU 4",
    "price": 22,
    "components": [
      {
        "type": "pizza_selection",
        "title": "Choisissez votre pizza SÉNIOR",
        "size": "senior",
        "quantity": 1,
        "selection_mode": "single",
        "display_prices": true,
        "instruction": "Tapez le numéro de votre choix"
      }
    ]
  }
}
```

### Structure menu_pizza_selection complexe
```json
{
  "menu_config": {
    "name": "MENU 3",
    "price": 32,
    "components": [
      {
        "type": "pizza_selection",
        "title": "Choisissez votre pizza MEGA",
        "size": "mega",
        "quantity": 1,
        "selection_mode": "single",
        "display_prices": true,
        "instruction": "Tapez le numéro de votre choix"
      },
      {
        "type": "side_selection",
        "title": "Choisissez votre accompagnement",
        "quantity": 1,
        "selection_mode": "single",
        "options": [
          {"id": 1, "name": "🍗 14 NUGGETS"},
          {"id": 2, "name": "🍗 12 WINGS"}
        ]
      },
      {
        "type": "beverage_selection",
        "title": "Choisissez votre boisson 1.5L",
        "quantity": 1,
        "selection_mode": "single",
        "options": [
          {"id": 1, "name": "🥤 COCA COLA 1.5L"},
          {"id": 2, "name": "⚫ COCA ZERO 1.5L"},
          {"id": 3, "name": "🧡 FANTA 1.5L"},
          {"id": 4, "name": "🍊 OASIS 1.5L"}
        ]
      }
    ]
  }
}
```

---

## ⚡ RÈGLES D'OR

### ✅ TOUJOURS
1. **Prix livraison = Prix sur place + 1€**
2. **Display_order = ordre fourni**
3. **Restaurant_id = 1**
4. **Slug automatique depuis nom**

### ❌ JAMAIS
1. Modular avec prix fixes (utiliser base_price null)
2. Simple avec steps_config (doit être null)
3. Composite sans workflow_type
4. JSON malformé dans steps_config

### 🎯 VALIDATION RAPIDE
- **Type correct** ? ✅
- **Workflow approprié** ? ✅
- **Prix +1€ livraison** ? ✅
- **JSON valide** ? ✅
- **Structure cohérente** ? ✅

---

## 🚀 PERFORMANCE ATTENDUE

Avec ces patterns, l'IA devrait atteindre :
- **95% de détection automatique** du bon type
- **100% de structure SQL valide**
- **Minimum de questions** à l'utilisateur
- **Génération rapide** et précise