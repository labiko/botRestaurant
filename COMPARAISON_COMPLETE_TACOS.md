# 🔄 COMPARAISON COMPLÈTE : TACOS Resto 16 → Pizza Yolo

**Date** : 2025-10-10
**Objectif** : Migrer TOUTE la configuration TACOS du resto 16 (O'CV) vers Pizza Yolo (resto 1)

---

## 📊 CONFIGURATION ACTUELLE

### **TACOS PIZZA YOLO (ID 201)** ❌ Obsolète

| Aspect | Valeur |
|---|---|
| **workflow_type** | `composite_workflow` (ancien) |
| **Prix de base** | 7€ / 8€ |
| **Tailles** | ✅ 3 tailles dans `france_product_sizes` |
| **Groupes** | 5 groupes (viande, sauce, extras_choice, extras, boisson) |

**Tailles actuelles** :
- MENU M - 1 VIANDE : 7€ / 8€
- MENU L - 2 VIANDES : 8.50€ / 9.50€
- MENU XL - 3 VIANDES : 10€ / 11€

**Groupes d'options** :
| Groupe | group_order | Nb options | Problème |
|---|---|---|---|
| viande | 1 | 6 | ❌ Pas de taille avant |
| sauce | 2 | 8 | ❌ Pas de majuscule |
| extras_choice | 3 | 2 | ✅ OK |
| extras | 4 | 16 | ✅ OK |
| boisson | 5 | 12 | ❌ Pas de majuscule |

**Workflow actuel** :
```json
{
  "steps": [
    {
      "type": "options_selection",
      "prompt": "Choisissez votre viande",
      "option_groups": ["viande"],
      "max_selections": 1  ← ❌ BUG CRITIQUE
    },
    {
      "type": "options_selection",
      "prompt": "Choisissez vos sauces (2 maximum)",
      "option_groups": ["sauce"],
      "max_selections": 2
    },
    {
      "type": "options_selection",
      "prompt": "Voulez-vous ajouter des suppléments ?",
      "option_groups": ["extras_choice"],
      "max_selections": 1
    },
    {
      "type": "options_selection",
      "prompt": "Choisissez vos suppléments",
      "option_groups": ["extras"],
      "max_selections": 5
    },
    {
      "type": "options_selection",
      "prompt": "Choisissez votre boisson 33CL incluse",
      "option_groups": ["boisson"],
      "max_selections": 1
    }
  ]
}
```

---

### **TACOS RESTO 16 (ID 554)** ✅ Référence moderne

| Aspect | Valeur |
|---|---|
| **workflow_type** | `universal_workflow_v2` (moderne) |
| **Prix de base** | 0€ (prix dans les options) |
| **Tailles** | ✅ Groupe d'options "Plats" |
| **Groupes** | 5 groupes (Plats, Viandes, Extras, Condiments, Sauces) |

**Tailles (options du groupe "Plats")** :
- 1 Viande : 7€ / prix dans option
- 2 Viande : 8.50€ / prix dans option
- 3 Viande : 10€ / prix dans option

**Groupes d'options** :
| Groupe | group_order | Nb options | Avantage |
|---|---|---|---|
| Plats | 1 | 3 | ✅ Choix taille en premier |
| Viandes | 2 | 8 | ✅ Plus de choix (8 vs 6) |
| Extras | 3 | 5 | ✅ Simples et gratuits |
| Condiments | 4 | 5 | ✅ Légumes/condiments séparés |
| Sauces | 5 | 16 | ✅ Beaucoup de choix |

**Workflow moderne** :
```json
{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "votre plat",
      "option_groups": ["Plats"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre viande",
      "option_groups": ["Viandes"],
      "required": true,
      "max_selections": 3,
      "conditional_max": {
        "based_on_step": 1,
        "extract_number_from_name": true  ← ✅ DYNAMIQUE !
      }
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "EXTRAS",
      "option_groups": ["Extras"],
      "required": false,
      "max_selections": 3
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "votre condiments",
      "option_groups": ["Condiments"],
      "required": false,
      "max_selections": 3
    },
    {
      "step": 5,
      "type": "options_selection",
      "prompt": "🌶️ Choisissez vos sauces (2 maximum)",
      "option_groups": ["Sauces"],
      "required": false,
      "max_selections": 2
    }
  ]
}
```

---

## 🎯 DIFFÉRENCES MAJEURES

| Aspect | Pizza Yolo (201) | Resto 16 (554) | Action |
|---|---|---|---|
| **workflow_type** | `composite_workflow` | `universal_workflow_v2` | ✅ Migrer |
| **Prix de base** | 7€/8€ dans produit | 0€ dans produit | ✅ Changer |
| **Tailles** | `france_product_sizes` | Options groupe "Plats" | ✅ Migrer |
| **Étape 1** | ❌ Manquante | ✅ Choix taille | ✅ Ajouter |
| **Viandes** | 6 viandes | 8 viandes | ✅ Ajouter 2 |
| **conditional_max** | ❌ Absent | ✅ Présent | ✅ Ajouter |
| **Sauces** | 8 sauces | 16 sauces | ⚠️ Décider |
| **Extras** | 16 payants (3€) | 5 gratuits | ⚠️ **GARDER Pizza Yolo** |
| **Condiments** | ❌ Absent | 5 condiments | ✅ Ajouter |
| **Boissons** | 12 boissons | ❌ Absent | ✅ **GARDER Pizza Yolo** |

---

## 🔧 PLAN DE MIGRATION COMPLET

### **ÉTAPE 1 : Supprimer les tailles de france_product_sizes**
```sql
DELETE FROM france_product_sizes WHERE product_id = 201;
```

### **ÉTAPE 2 : Mettre à jour le produit**
```sql
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  price_on_site_base = 0.00,
  price_delivery_base = 0.00,
  steps_config = '[nouveau workflow]'
WHERE id = 201;
```

### **ÉTAPE 3 : Créer le groupe "Taille" (Plats)**
Ajouter 3 options :
- 1 VIANDE (7€ / 8€)
- 2 VIANDES (8.50€ / 9.50€)
- 3 VIANDES (10€ / 11€)

### **ÉTAPE 4 : Renommer et réorganiser les groupes**
- `viande` → `Viandes` (group_order: 2)
- `sauce` → `Sauces` (group_order: 6)
- `extras_choice` (group_order: 4)
- `extras` (group_order: 5)
- `boisson` → `Boisson` (group_order: 7)

### **ÉTAPE 5 : Ajouter groupe "Condiments"**
Nouveau groupe (group_order: 3) avec 5 options :
- Salades
- Tomate
- Oignons
- Olives
- Cornichons

### **ÉTAPE 6 : Ajouter 2 viandes manquantes**
- Grec
- Chicken Tandoori ou Chicken Curry

### **ÉTAPE 7 : Workflow final avec conditional_max**
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
        "extract_number_from_name": true
      }
    },
    {
      "step": 3,
      "prompt": "🥗 Choisissez vos condiments (facultatif)",
      "option_groups": ["Condiments"],
      "required": false,
      "max_selections": 5
    },
    {
      "step": 4,
      "prompt": "➕ Voulez-vous des suppléments ?",
      "option_groups": ["extras_choice"],
      "max_selections": 1
    },
    {
      "step": 5,
      "prompt": "🧀 Choisissez vos suppléments (3€ chacun)",
      "option_groups": ["extras"],
      "required": false,
      "max_selections": 5
    },
    {
      "step": 6,
      "prompt": "🌶️ Choisissez vos sauces (2 maximum)",
      "option_groups": ["Sauces"],
      "required": false,
      "max_selections": 2
    },
    {
      "step": 7,
      "prompt": "🥤 Choisissez votre boisson",
      "option_groups": ["Boisson"],
      "max_selections": 1
    }
  ]
}
```

---

## 🎯 DÉCISIONS À PRENDRE

### **1. Sauces : 8 ou 16 ?**

**Option A : Garder les 8 actuelles de Pizza Yolo**
- ✅ Plus simple
- ✅ Cohérent avec l'existant
- ❌ Moins de choix

**Option B : Prendre les 16 du resto 16**
- ✅ Plus de choix pour les clients
- ❌ Plus long à configurer
- ❌ Liste très longue

**Recommandation** : **Option A** (8 sauces de Pizza Yolo)

### **2. Extras : Garder payants ou gratuits ?**

**Pizza Yolo** : 16 extras à 3€ chacun (Cheddar, Bacon, Viande, etc.)
**Resto 16** : 5 extras gratuits (Fromage, Boursin, Œuf, Vache qui rit, Pomme de terre)

**Recommandation** : **GARDER les extras payants de Pizza Yolo** (source de revenu)

### **3. Boissons : Conserver ?**

**Pizza Yolo** : 12 boissons incluses
**Resto 16** : Pas de boissons

**Recommandation** : **GARDER les boissons de Pizza Yolo** (valeur ajoutée menu)

---

## ✅ STRUCTURE FINALE PIZZA YOLO

| Étape | Groupe | Options | Max | Notes |
|---|---|---|---|---|
| 1 | Taille | 3 | 1 | Choix formule (prix différents) |
| 2 | Viandes | 8 | 1-3 | Adaptatif avec conditional_max |
| 3 | Condiments | 5 | 5 | Nouveau (gratuit) |
| 4 | extras_choice | 2 | 1 | Oui/Non suppléments |
| 5 | extras | 16 | 5 | Payants 3€ (si oui étape 4) |
| 6 | Sauces | 8 | 2 | Existantes Pizza Yolo |
| 7 | Boisson | 12 | 1 | Existantes Pizza Yolo |

**Total** : 7 étapes, 54 options

---

## 📋 PROCHAINES ÉTAPES

1. ✅ Valider les décisions (sauces 8 ou 16, garder extras payants)
2. ⏳ Générer le script SQL complet de migration
3. ⏳ Tester en DEV
4. ⏳ Déployer en PROD

Tu valides cette structure ?
