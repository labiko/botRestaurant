# 🔧 SYSTÈME DE TEMPLATES WORKFLOWS MANUELS

## 🎯 Vue d'ensemble

Système complet de génération de workflows **SANS IA** - Vous modifiez les templates JSON manuellement et l'outil génère automatiquement le SQL.

## 📁 Fichiers créés

```
src/lib/
├── workflow-templates.json     # 📋 Base de templates (presets + composants)
├── template-processor.ts       # ⚙️ Moteur de traitement
├── template-examples.ts        # 📝 Exemples d'utilisation
└──
src/app/templates/page.tsx      # 🖥️ Interface web pour utiliser les templates
```

## 🚀 Comment utiliser

### 1. Interface Web (Recommandé)
Allez sur `http://localhost:3000/templates` :
- ✅ Choisissez un template preset
- ✅ Modifiez les informations du produit
- ✅ Personnalisez les steps si besoin
- ✅ Cliquez "Générer le SQL"
- ✅ Copiez-collez le SQL en base

### 2. Utilisation programmatique

```typescript
import { TemplateProcessor } from '@/lib/template-processor';

// Exemple simple avec preset
const workflow = TemplateProcessor.processTemplate(
  'menu_enfant',
  {}, // Pas de modifications
  {
    name: 'MENU P\'TIT CHEF',
    restaurantId: 15,
    basePrice: 8.50,
    categoryId: 45
  }
);

const sql = TemplateProcessor.generateSQL(workflow);
// Exécutez le SQL en base !
```

## 📋 Templates disponibles

### Presets prêts à l'emploi:
- **`menu_enfant`** - Plat + boisson enfant
- **`bowl_personalise`** - Viande + boisson + suppléments
- **`menu_complet`** - Entrée + plat + dessert + boisson
- **`burger_customise`** - Viande + pain + sauces + extras
- **`pizza_personnalisee`** - Taille + pâte + sauce + ingrédients

### Template de base:
- **`base`** - Template générique avec placeholders `[ELEMENT_PRINCIPAL]`, `[GROUPE_PRINCIPAL]`, etc.

## 🔧 Personnalisation facile

### Réorganiser les étapes (ex: boisson avant plat)
```json
{
  "steps": [
    {
      "step": 1,
      "prompt": "Choisissez d'abord votre boisson",
      "option_groups": ["Boisson enfant"]
    },
    {
      "step": 2,
      "prompt": "Maintenant votre plat",
      "option_groups": ["Plat principal"]
    }
  ]
}
```

### Choix multiples
```json
{
  "step": 3,
  "prompt": "Choisissez vos sauces (max 3)",
  "max_selections": 3,
  "required": false
}
```

### Utiliser les composants modulaires
```typescript
const customTemplate = TemplateProcessor.createCustomTemplate(
  'Ma Salade Custom',
  'Salade avec choix',
  [
    'choix_base',        // Étape 1
    'choix_proteine',    // Étape 2
    'choix_supplements', // Étape 3
    'choix_sauces'       // Étape 4
  ]
);
```

## 🧩 Composants modulaires disponibles

### Steps prêts à utiliser:
- `choix_base` - Base (riz, pâtes, salade)
- `choix_proteine` - Protéines (poulet, bœuf, poisson)
- `choix_accompagnement` - Accompagnements
- `choix_boisson_33cl` - Boisson 33cl incluse
- `choix_boisson_enfant` - Boisson enfant
- `choix_sauces` - Sauces (multiples)
- `choix_supplements` - Suppléments payants
- `choix_taille` - Tailles (petite, moyenne, grande)
- `choix_cuisson` - Cuisson viande

### Groupes d'options prêts:
- `bases_standards`: Riz, Pâtes, Salade, Pain
- `proteines_standards`: Poulet, Bœuf, Porc, Poisson, Végétarien
- `boissons_33cl`: Coca, Fanta, Sprite, Eau
- `sauces_standards`: Ketchup, Mayo, Moutarde, BBQ

## ⚡ Exemples rapides

### Menu enfant simple
```typescript
exempleMenuEnfant(); // Génère SQL pour menu enfant standard
```

### Template de base personnalisé
```typescript
exempleTemplateBase(); // Pizza avec placeholders remplacés
```

### Workflow complexe (5 étapes)
```typescript
exempleTemplateComplexe(); // Menu gastronomique complet
```

## 🔍 Validation automatique

```typescript
const result = TemplateProcessor.validateTemplate(monTemplate);
if (!result.valid) {
  console.log('Erreurs détectées:', result.errors);
}
```

## 💡 Avantages vs IA

| Aspect | Templates Manuels | IA (Claude API) |
|--------|------------------|-----------------|
| **Contrôle** | ✅ Contrôle total | ❌ Résultat imprévisible |
| **Rapidité** | ✅ Instantané | ❌ Appels API lents |
| **Coût** | ✅ Gratuit | ❌ Coût par requête |
| **Réutilisabilité** | ✅ Templates réutilisables | ❌ Regénération à chaque fois |
| **Personnalisation** | ✅ Modification manuelle précise | ❌ Prompts approximatifs |
| **Fiabilité** | ✅ Résultat garanti | ❌ Peut générer du code incorrect |

## 🎯 Cas d'usage parfaits

1. **Restaurants avec workflows similaires** - Réutilisez les presets
2. **Personnalisation précise** - Modifiez exactement ce que vous voulez
3. **Workflows complexes** - Assemblage de composants modulaires
4. **Production** - Pas de dépendance externe, rapidité garantie
5. **Évolutivité** - Ajoutez facilement de nouveaux composants

## 🔄 Workflow recommandé

1. **Analysez** le menu du restaurant
2. **Choisissez** le template le plus proche
3. **Personnalisez** selon les besoins spécifiques
4. **Testez** avec l'interface web
5. **Générez** le SQL final
6. **Exécutez** en base de données
7. **Réutilisez** le template pour des restaurants similaires

---

**🎉 Résultat** : Système autonome, rapide et entièrement contrôlable pour créer des workflows complexes sans dépendance IA !