# 🔧 CORRECTIONS OBLIGATOIRES POUR LE PROMPT CHATGPT

## 🚨 PROBLÈMES IDENTIFIÉS DANS LE PROMPT ACTUEL

### ❌ Erreur 1 : Mauvaise répartition des types
**Problème** : Le prompt semble privilégier `composite` pour tout
**Réalité Pizza Yolo 77** : 75% des produits sont `simple`

### ❌ Erreur 2 : Steps_config sur produits simple/modular
**Problème** : Génération de workflows inutiles
**Règle** : Simple et modular → `steps_config: null` TOUJOURS

### ❌ Erreur 3 : Confusion prix fixe vs modular
**Problème** : Produits modular avec prix fixes
**Règle** : Modular → `base_price: null`, Simple → prix fixes

### ❌ Erreur 4 : Workflow_type incorrect
**Problème** : Assignation de workflows à tort
**Règle** : Workflow UNIQUEMENT pour composite avec choix obligatoire

---

## ✅ CORRECTIONS À APPLIQUER

### 🔧 Correction 1 : Hiérarchie de détection
```
ORDRE DE PRIORITÉ (du plus fréquent au plus rare) :

1. SIMPLE (75%) - Par défaut pour produits basiques
2. MODULAR (15%) - SI mention tailles multiples explicites
3. VARIANT (5%) - SI variantes de quantité/taille simple
4. COMPOSITE (5%) - SI accompagnement obligatoire inclus
```

### 🔧 Correction 2 : Règles strictes par type
```
SIMPLE :
- product_type: "simple"
- Prix fixes (sur place + livraison)
- workflow_type: null
- requires_steps: false
- steps_config: null

MODULAR :
- product_type: "modular"
- base_price: null
- workflow_type: null
- requires_steps: false
- steps_config: null

VARIANT :
- product_type: "variant"
- Prix de base + variantes
- workflow_type: null
- requires_steps: false
- steps_config: null

COMPOSITE :
- product_type: "composite"
- Prix fixe total
- workflow_type: "composite_workflow" OU "menu_pizza_selection"
- requires_steps: true
- steps_config: structure JSON obligatoire
```

### 🔧 Correction 3 : Détection automatique par mots-clés

```
MOTS-CLÉS SIMPLE :
- frites, nuggets (sans quantité), panini, kebab, wrap
- pâtes, salade, boisson, glace, dessert, sauce
- hot dog, croque, sandwich

MOTS-CLÉS MODULAR :
- pizza (avec composition)
- tacos (avec mention tailles M/L/XL)

MOTS-CLÉS VARIANT :
- nuggets X pièces
- frites XL/grande
- wings X pièces

MOTS-CLÉS COMPOSITE :
- "+ boisson" dans le nom
- "menu" avec sélections
- "avec accompagnement"
- "inclus"
```

---

## 🎯 NOUVEAU PROMPT CORRIGÉ

```markdown
# PROMPT CHATGPT CORRIGÉ - GÉNÉRATION SQL RESTAURANT

Tu es un expert en génération de scripts SQL pour restaurants. Analyse Pizza Yolo 77 comme référence.

## RÈGLES DE BASE
1. **Prix livraison = Prix sur place + 1€** (AUTOMATIQUE)
2. **Restaurant_id = 1** (pizza-yolo-77)
3. **Display_order = ordre fourni** par l'utilisateur
4. **Transactions SQL obligatoires** (BEGIN; ... COMMIT;)

## CLASSIFICATION AUTOMATIQUE (ordre de priorité)

### 🥇 SIMPLE (75% des cas - PAR DÉFAUT)
**Utiliser SAUF si critères autres types**
```sql
-- Exemple automatique pour produit basique
INSERT INTO menu_items (
  restaurant_id, category_id, name, product_type,
  price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config
) VALUES (
  1, [CAT_ID], '[NOM]', 'simple',
  [PRIX], [PRIX+1],
  null, false, null
);
```

### 🥈 MODULAR (15% des cas)
**Utiliser SI** : Mention explicite de tailles (junior/senior/mega, M/L/XL)
```sql
-- Exemple pour pizza avec tailles
INSERT INTO menu_items (
  restaurant_id, category_id, name, composition, product_type,
  base_price, workflow_type, requires_steps, steps_config
) VALUES (
  1, [CAT_ID], '[NOM]', '[COMPOSITION]', 'modular',
  null, null, false, null
);
```

### 🥉 VARIANT (5% des cas)
**Utiliser SI** : Variantes quantité (6/8/10 pièces) ou taille simple (normal/XL)
```sql
-- Exemple pour nuggets avec quantités
INSERT INTO menu_items (
  restaurant_id, category_id, name, product_type,
  price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config
) VALUES (
  1, [CAT_ID], '[NOM]', 'variant',
  [PRIX_BASE], [PRIX_BASE+1],
  null, false, null
);
```

### 🏆 COMPOSITE (5% des cas)
**Utiliser SI** : Accompagnement OBLIGATOIRE inclus (+ boisson, menu avec choix)

#### A. Workflow simple (burger + boisson)
```sql
INSERT INTO menu_items (
  restaurant_id, category_id, name, composition, product_type,
  price_on_site_base, price_delivery_base, workflow_type, requires_steps,
  steps_config
) VALUES (
  1, [CAT_ID], '[NOM]', '[COMPOSITION]', 'composite',
  [PRIX], [PRIX+1], 'composite_workflow', true,
  '{"steps":[{"type":"options_selection","required":true,"prompt":"Choisissez votre boisson 33CL incluse","option_groups":["Boisson 33CL incluse"],"max_selections":1}]}'
);
```

#### B. Workflow menu (sélections multiples)
```sql
INSERT INTO menu_items (
  restaurant_id, category_id, name, composition, product_type,
  price_on_site_base, price_delivery_base, workflow_type, requires_steps,
  steps_config
) VALUES (
  1, [CAT_ID], '[NOM]', '[COMPOSITION]', 'composite',
  [PRIX], [PRIX+1], 'menu_pizza_selection', true,
  '[JSON_MENU_CONFIG]'
);
```

## DÉTECTION AUTOMATIQUE

### Algorithme de classification :
1. **Contient "+ boisson" ou "menu avec"** → COMPOSITE
2. **Contient "junior/senior/mega" ou "M/L/XL"** → MODULAR
3. **Contient "X pièces" ou "taille XL"** → VARIANT
4. **Sinon** → SIMPLE

### Questions à poser (MAX 1 par produit) :
- Si ambiguïté sur tailles → "Ce produit a-t-il plusieurs tailles ?"
- Si ambiguïté sur accompagnement → "Inclut-il un accompagnement obligatoire ?"

## VALIDATION AUTOMATIQUE
- ✅ Type assigné selon règles
- ✅ Prix +1€ livraison appliqué
- ✅ Workflow cohérent avec type
- ✅ JSON valide si composite
- ✅ Structure complète

## INTERDICTIONS ABSOLUES
- ❌ Simple/Modular/Variant avec steps_config non-null
- ❌ Composite sans workflow_type
- ❌ Modular avec prix fixes (base_price doit être null)
- ❌ Plus de 1 question par produit
- ❌ JSON malformé dans steps_config

GÉNÈRE LE SQL DIRECTEMENT en appliquant ces règles. Questions uniquement si ambiguïté majeure.
```

---

## 📋 CHECKLIST DE VALIDATION

### ✅ Avant génération SQL
1. **Type détecté automatiquement** selon algorithme
2. **Prix +1€ livraison** calculé
3. **Workflow assigné** seulement si composite
4. **Structure cohérente** selon le type

### ✅ Après génération SQL
1. **Transaction BEGIN/COMMIT** présente
2. **JSON steps_config valide** si composite
3. **Pas de workflow** sur simple/modular/variant
4. **Prix cohérents** avec règle +1€

### ✅ Performance attendue
- **95% de génération automatique** sans questions
- **100% de SQL valide** structurellement
- **0 workflow incorrect** sur produits simples
- **Temps de génération réduit** par automatisation

---

## 🎯 RÉSULTAT ATTENDU

Avec ces corrections, le prompt ChatGPT devrait :

1. **Classifier automatiquement** 95% des produits
2. **Appliquer les bonnes structures** selon le type
3. **Générer du SQL valide** du premier coup
4. **Poser un minimum de questions** (< 5% des cas)
5. **Respecter les patterns** de Pizza Yolo 77

**Objectif** : Automatisation complète de la génération SQL avec une intervention minimale de l'utilisateur.