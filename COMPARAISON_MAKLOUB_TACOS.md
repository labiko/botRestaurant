# 🔍 COMPARAISON : MAKLOUB Resto 16 vs TACOS Pizza Yolo

**Date** : 2025-10-10
**Objectif** : Comparer les deux structures pour définir la migration

---

## 📊 MAKLOUB - Restaurant 16 (Le Nouveau O'CV Moissy)

### **Produit de base**
- **ID** : 555
- **Nom** : `MAKLOUBS 2 viandes au choix + frites`
- **Prix** : 9.50€ (sur place) / 10.00€ (livraison)
- **Type** : `composite` avec `universal_workflow_v2`
- **Tailles** : ❌ **PAS de tailles multiples** - Prix fixe unique

### **Workflow (3 étapes)**

```json
{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "votre plats",
      "option_groups": ["Plats"],
      "required": true,
      "max_selections": 2  ← FIXE : toujours 2 viandes
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre boissons",
      "option_groups": ["Boissons"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "votre sauces",
      "option_groups": ["Sauces"],
      "required": false,
      "max_selections": 2
    }
  ]
}
```

### **Options disponibles**

| Groupe | Nombre d'options | Max sélections | Prix modificateur |
|---|---|---|---|
| **Plats** (viandes) | 9 | 2 | 0€ (inclus) |
| **Boissons** | 24 | 1 | 0€ (inclus) |
| **Sauces** | 16 | 2 | 0€ (inclus) |

**Détail Plats (viandes)** :
1. Lamelle de kébab
2. Escalope
3. Viande hachée
4. Merguez de bœuf
5. Nuggets de poulet
6. Cordon bleu
7. Tenders de poulet
8. Jambon de dinde
9. Chicken curry

### **Caractéristiques**
- ✅ Workflow **linéaire** simple (pas de conditionnels)
- ✅ Prix **fixe unique** (pas de variations selon le nombre de viandes)
- ✅ **2 viandes incluses** dans le prix de base
- ✅ Boissons **incluses** dans le prix
- ✅ Sauces **optionnelles** et gratuites
- ❌ Pas d'extras/suppléments payants
- ❌ Pas de système "1 viande / 2 viandes / 3 viandes"

---

## 📊 TACOS - Restaurant 1 (Pizza Yolo 77)

### **Produit de base**
- **ID** : 201
- **Nom** : `TACOS`
- **Type** : `composite` avec `composite_workflow`
- **Tailles** : ✅ **3 tailles différentes**

### **Tailles disponibles**

| Taille | Prix sur place | Prix livraison | Viandes incluses |
|---|---|---|---|
| MENU M - 1 VIANDE | 7.00€ | 8.00€ | 1 |
| MENU L - 2 VIANDES | 8.50€ | 9.50€ | 2 |
| MENU XL - 3 VIANDES | 10.00€ | 11.00€ | 3 |

### **Workflow actuel (5 étapes) - ⚠️ PROBLÉMATIQUE**

```json
{
  "steps": [
    {
      "type": "options_selection",
      "required": true,
      "prompt": "Choisissez votre viande",
      "option_groups": ["viande"],
      "max_selections": 1  ← ❌ TOUJOURS 1, même pour 2 ou 3 viandes !
    },
    {
      "type": "options_selection",
      "required": true,
      "prompt": "Choisissez vos sauces (2 maximum)",
      "option_groups": ["sauce"],
      "max_selections": 2
    },
    {
      "type": "options_selection",
      "required": true,
      "prompt": "Voulez-vous ajouter des suppléments ?",
      "option_groups": ["extras_choice"],
      "max_selections": 1
    },
    {
      "type": "options_selection",
      "required": false,
      "prompt": "Choisissez vos suppléments",
      "option_groups": ["extras"],
      "max_selections": 5
    },
    {
      "type": "options_selection",
      "required": true,
      "prompt": "Choisissez votre boisson 33CL incluse",
      "option_groups": ["boisson"],
      "max_selections": 1
    }
  ]
}
```

### **Options disponibles**

| Groupe | Nombre d'options | Max sélections | Prix modificateur |
|---|---|---|---|
| **viande** | 6 | 1 ⚠️ | 0€ (inclus) |
| **sauce** | 8 | 2 | 0€ (inclus) |
| **extras_choice** | 2 | 1 | 0€ |
| **extras** | 16 | 5 | 3€ chacun |
| **boisson** | 12 | 1 | 0€ (inclus) |

**Détail viandes** :
1. Viande Hachée
2. Tenders
3. Cordon Bleu
4. Nuggets
5. Filet de Poulet
6. Merguez

### **Caractéristiques**
- ✅ **3 tailles** avec prix différents
- ✅ Boissons **incluses**
- ✅ Sauces **gratuites** (max 2)
- ✅ Extras/suppléments **payants** (3€ chacun)
- ✅ Workflow avec **embranchement** (extras optionnels)
- ❌ **BUG MAJEUR** : Permet seulement 1 viande au lieu de 1/2/3 selon la taille

---

## 🎯 COMPARAISON DIRECTE

| Aspect | MAKLOUB (Resto 16) | TACOS (Pizza Yolo) |
|---|---|---|
| **Workflow** | `universal_workflow_v2` | `composite_workflow` |
| **Prix** | Fixe (9.50€/10€) | Variable selon taille (7-11€) |
| **Tailles** | ❌ Aucune | ✅ 3 tailles (M/L/XL) |
| **Viandes** | Toujours 2 | 1/2/3 selon taille (non fonctionnel) |
| **Max viandes** | Fixe (2) | ⚠️ Devrait être 1/2/3 mais bloqué à 1 |
| **Sauces** | 16 choix (max 2) | 8 choix (max 2) |
| **Boissons** | 24 choix (incluses) | 12 choix (incluses) |
| **Extras payants** | ❌ Non | ✅ Oui (16 choix à 3€) |
| **Conditionnalité** | ❌ Linéaire | ⚠️ Pseudo-conditionnel (extras) |
| **Structure options** | Simple | Complexe avec embranchement |

---

## 🔧 OPTIONS DE MIGRATION

### **Option A : Copier le modèle MAKLOUB simplifié**

Transformer TACOS Pizza Yolo en produit **fixe comme MAKLOUB** :
- ✅ **Simplicité maximale**
- ❌ **Perte des 3 tailles** (M/L/XL)
- ❌ **Toujours 2 viandes** (pas de flexibilité)

**Résultat** :
```
TACOS - 2 VIANDES + BOISSON (Prix fixe : 8.50€)
→ Étape 1 : Choisir 2 viandes (max_selections: 2)
→ Étape 2 : Choisir 2 sauces (max_selections: 2)
→ Étape 3 : Ajouter suppléments ? (optionnel)
→ Étape 4 : Choisir suppléments (si oui à l'étape 3)
→ Étape 5 : Choisir boisson
```

---

### **Option B : Système conditionnel avec "choix de taille"**

Ajouter une étape de **choix de taille** qui contrôle le nombre de viandes :

```json
{
  "steps": [
    {
      "step": 1,
      "prompt": "🌯 Choisissez votre formule",
      "option_groups": ["Taille"],
      "max_selections": 1
    },
    {
      "step": 2,
      "prompt": "🥩 Choisissez vos viandes",
      "option_groups": ["Viandes"],
      "max_selections": 3,
      "conditional_max": {
        "based_on_step": 1,
        "extract_number_from_name": true  ← Extrait "1", "2" ou "3"
      }
    },
    {
      "step": 3,
      "prompt": "🌶️ Choisissez vos sauces (2 maximum)",
      "option_groups": ["Sauces"],
      "max_selections": 2
    },
    {
      "step": 4,
      "prompt": "➕ Voulez-vous des suppléments ?",
      "option_groups": ["extras_choice"],
      "max_selections": 1
    },
    {
      "step": 5,
      "prompt": "🧀 Choisissez vos suppléments",
      "option_groups": ["Extras"],
      "max_selections": 5
    },
    {
      "step": 6,
      "prompt": "🥤 Choisissez votre boisson",
      "option_groups": ["Boisson"],
      "max_selections": 1
    }
  ]
}
```

**Groupe "Taille" (nouvelles options)** :
- `MENU M - 1 VIANDE (7€)` → price_modifier: 0€
- `MENU L - 2 VIANDES (8.50€)` → price_modifier: 1.50€
- `MENU XL - 3 VIANDES (10€)` → price_modifier: 3€

**Avantages** :
- ✅ **Garde les 3 tailles** avec prix différents
- ✅ **Adapte automatiquement** le nombre de viandes
- ✅ **Même workflow** que le TACOS resto 16
- ✅ **Garde les extras** payants

**Changements nécessaires** :
1. Supprimer `france_product_sizes` (3 lignes)
2. Créer groupe "Taille" avec 3 options + price_modifier
3. Modifier `workflow_type` : `composite_workflow` → `universal_workflow_v2`
4. Remplacer `steps_config` avec nouveau workflow
5. Renommer groupe "viande" → "Viandes" (optionnel, pour cohérence)

---

### **Option C : Système conditionnel avec group_order**

Utiliser `conditional_next_group` comme le produit 403 (MENU MIDI) :

**Groupe "Taille"** (group_order: 0) :
- Option 1 : `MENU M - 1 VIANDE` → `conditional_next_group: {"1": 1}`
- Option 2 : `MENU L - 2 VIANDES` → `conditional_next_group: {"2": 2}`
- Option 3 : `MENU XL - 3 VIANDES` → `conditional_next_group: {"3": 3}`

**3 groupes de viandes** :
- `Viandes_M` (group_order: 1, max_selections: 1)
- `Viandes_L` (group_order: 2, max_selections: 2)
- `Viandes_XL` (group_order: 3, max_selections: 3)

**Avantages** :
- ✅ **Contrôle total** sur chaque taille
- ✅ **Peut avoir des viandes différentes** par taille (si besoin futur)

**Inconvénients** :
- ❌ **Complexe** : Duplication des 6 viandes × 3 = 18 lignes
- ❌ **Maintenance difficile** : Modifier une viande = modifier 3 fois
- ❌ **Plus lourd** en base de données

---

## 🎯 RECOMMANDATION

### **Option B : Système conditionnel avec conditional_max**

**Pourquoi ?**
1. ✅ **Élégant et simple** : Une seule liste de viandes
2. ✅ **Maintenable** : Modifier une viande = 1 seul endroit
3. ✅ **Garde les 3 tailles** avec prix différents
4. ✅ **Adapte automatiquement** le nombre de viandes
5. ✅ **Même pattern** que TACOS resto 16 qui fonctionne bien
6. ✅ **Compatible** avec `universal_workflow_v2`

**Structure finale** :
```
TACOS Pizza Yolo (ID 201)
├── Taille (étape 1) → Choix unique parmi 3
│   ├── MENU M - 1 VIANDE (7€)
│   ├── MENU L - 2 VIANDES (8.50€)
│   └── MENU XL - 3 VIANDES (10€)
├── Viandes (étape 2) → Max adaptatif (1/2/3 selon taille)
│   ├── Viande Hachée
│   ├── Tenders
│   ├── Cordon Bleu
│   ├── Nuggets
│   ├── Filet de Poulet
│   └── Merguez
├── Sauces (étape 3) → Max 2
├── Extras ? (étape 4) → Oui/Non
├── Extras (étape 5) → Max 5 (si "Oui" à l'étape 4)
└── Boisson (étape 6) → Choix unique
```

---

## 📋 PROCHAINES ÉTAPES

1. ✅ **Validation** : Confirmer que l'Option B est la bonne approche
2. ⏳ **Script SQL** : Générer le script de migration complet
3. ⏳ **Test DEV** : Tester en environnement DEV
4. ⏳ **Test workflow** : Vérifier que le bot gère bien `conditional_max`
5. ⏳ **Application PROD** : Déployer en production

---

**Question pour l'utilisateur** : Tu veux partir sur l'**Option B** (conditional_max comme TACOS resto 16) ?
