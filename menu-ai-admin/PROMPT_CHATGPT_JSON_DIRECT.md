# 📋 PROMPT CHATGPT - GÉNÉRATION JSON DIRECTE POUR CLONAGE

## 🎯 Objectif
ChatGPT génère DIRECTEMENT le JSON pour éviter la double analyse IA.

---

## 🚀 PROMPT OPTIMISÉ POUR JSON

```markdown
Tu es un expert en digitalisation de menus restaurants pour système WhatsApp bot.

MISSION : Analyser l'image du menu et générer DIRECTEMENT le JSON pour import automatique.

## 🚨 RÈGLES ABSOLUES :
1. **EXTRACTION EXACTE** : Prix identiques à l'image
2. **AUCUNE INVENTION** : Seulement ce qui est visible
3. **+1€ LIVRAISON** : Tu dois appliquer la règle prix_delivery = prix_on_site + 1

## 📝 GÉNÈRE CE JSON EXACT :

```json
{
  "confidence": 90,
  "schema_version": "2.0",
  "categories": [
    {
      "newName": "Les Menus Solo",
      "icon": "🥡",
      "mapping": "Catégorie des menus individuels"
    }
  ],
  "products": [
    {
      "newName": "Menu Tenders",
      "price_on_site": 9.00,
      "price_delivery": 10.00,
      "category": "Les Menus Solo",
      "product_type": "composite",
      "workflow_type": "composite_workflow",
      "requires_steps": true,
      "reasoning": "Menu avec choix de boisson obligatoire",
      "steps_config": {
        "steps": [
          {
            "step_number": 1,
            "step_type": "single_choice",
            "title": "Choisissez votre boisson",
            "prompt": "Sélectionnez votre boisson incluse :",
            "is_required": true,
            "max_selections": 1,
            "options": [
              {"name": "🥤 Coca-Cola 33cl", "price_modifier": 0},
              {"name": "🟢 Sprite 33cl", "price_modifier": 0},
              {"name": "🧡 Fanta 33cl", "price_modifier": 0},
              {"name": "💧 Eau 50cl", "price_modifier": 0}
            ]
          }
        ],
        "final_format": "Menu {product_name} avec {selections}",
        "display_config": {
          "show_included_items": true,
          "show_step_numbers": true
        }
      }
    }
  ],
  "supplements": [
    {
      "name": "4 Hot Wings",
      "price_on_site": 3.50,
      "price_delivery": 4.50,
      "category": "Suppléments",
      "product_type": "simple",
      "workflow_type": "simple",
      "requires_steps": false,
      "is_supplement": true
    }
  ],
  "fixed_items": [
    {
      "product_name": "Menu Tenders",
      "components": [
        {"name": "Tenders poulet", "quantity": 6, "unit": "pièces"},
        {"name": "Frites", "quantity": 1, "unit": "portion"}
      ]
    }
  ],
  "mapping_strategy": "Analyse complète avec workflows modernes et système hybride",
  "estimated_complexity": "Élevé",
  "total_products_found": 21,
  "validation": "Structure conforme à la base de données de production"
}
```

## 📐 RÈGLES DE CONVERSION :

### Pour un PRODUIT SIMPLE :
```json
{
  "newName": "Burger Classic",
  "price_on_site": 8.50,
  "price_delivery": 9.50,
  "category": "Burgers",
  "workflow_type": "simple",
  "requires_steps": false
}
```

### Pour un MENU COMPOSITE :
```json
{
  "newName": "Menu Kids",
  "price_on_site": 7.50,
  "price_delivery": 8.50,
  "category": "Menu Kids",
  "workflow_type": "composite",
  "requires_steps": true,
  "steps_config": {
    "steps": [
      {
        "step_number": 1,
        "step_type": "single_choice",
        "title": "Plat principal",
        "is_required": true,
        "options": [
          {"name": "Margherita Junior", "price_modifier": 0},
          {"name": "Cheese Burger", "price_modifier": 0},
          {"name": "6 Nuggets", "price_modifier": 0}
        ]
      }
    ]
  }
}
```

### Pour un SUPPLÉMENT :
```json
{
  "name": "Extra Bacon",
  "price_on_site": 2.00,
  "price_delivery": 3.00,
  "is_supplement": true
}
```

## 🎯 WORKFLOW DÉCISIONNEL :

1. **Si produit unique sans choix** → workflow_type: "simple"
2. **Si menu avec choix multiples** → workflow_type: "composite" + steps_config
3. **Si extra/supplément** → Mettre dans array "supplements"
4. **Si formule avec options** → Créer étapes numérotées

## ⚠️ POINTS CRITIQUES :

1. **TOUJOURS** appliquer +1€ pour price_delivery
2. **TOUJOURS** mettre les suppléments dans "supplements"
3. **TOUJOURS** créer steps_config pour les composites
4. **TOUJOURS** inclure TOUS les produits visibles
5. **Utiliser les vrais emojis** pour les catégories

Analyse l'image et génère le JSON complet maintenant.
```

---

## 💡 AVANTAGES DE CETTE APPROCHE

### Économies :
- ✅ **Une seule IA** au lieu de deux
- ✅ **Coût divisé par 2**
- ✅ **Temps de traitement réduit**

### Simplicité :
- ✅ **ChatGPT fait tout** l'analyse
- ✅ **Notre code génère juste le SQL**
- ✅ **Pas de parsing intermédiaire**

### Workflow simplifié :
1. Photo → ChatGPT avec ce prompt
2. JSON généré → Copier
3. Coller dans système → SQL auto-généré

---

## 🔧 MODIFICATION NÉCESSAIRE DANS LE CODE

Dans `/api/clone-restaurant/route.ts`, modifier pour accepter directement le JSON :

```typescript
// Détecter si c'est déjà du JSON
let aiAnalysis;
try {
  // Si c'est déjà du JSON valide de ChatGPT
  aiAnalysis = JSON.parse(menuData);
  console.log('📋 JSON ChatGPT détecté, skip analyse IA');
} catch {
  // Sinon, utiliser notre IA pour analyser
  console.log('🧠 Format texte, analyse IA requise');
  aiAnalysis = await analyzeMenuWithAI(sourceData, menuData, targetName, instructions);
}
```

---

## 📊 COMPARAISON

| Méthode | Étapes | Coût API | Fiabilité |
|---------|---------|----------|-----------|
| Actuelle | ChatGPT → Texte → Notre IA → JSON → SQL | 2x | 85% |
| Optimisée | ChatGPT → JSON → SQL | 1x | 95% |

---

*Ce prompt élimine l'étape intermédiaire et rend le système plus efficace !*