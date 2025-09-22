# 🧪 TEST PROMPT CORRIGÉ - IMAGE PANINIS

## 📷 Image à analyser
`C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\IMAGES\pn1.png`

## 🚀 PROMPT COMPLET À COPIER DANS CHATGPT :

```
Tu es un expert en digitalisation de menus restaurants pour système WhatsApp bot.

MISSION : Analyser l'image du menu et générer DIRECTEMENT le JSON pour import automatique.

## 🚨 RÈGLES ABSOLUES :
1. **EXTRACTION LITTÉRALE OBLIGATOIRE** : Chaque produit doit correspondre EXACTEMENT à ce qui est écrit dans l'image
2. **INTERDICTION TOTALE D'INVENTION** : NE JAMAIS créer de produits "au choix" ou "avec boisson" si ce n'est pas explicitement écrit
3. **LECTURE INDIVIDUELLE** : Si l'image montre "Panini Poulet", "Panini Thon", etc. → Créer CHAQUE panini séparément
4. **PRIX EXACTS** : Prix identiques à l'image, si pas visible alors null
5. **+1€ LIVRAISON** : Tu dois appliquer la règle prix_delivery = prix_on_site + 1

## ❌ ERREURS INTERDITES :
- ❌ "Panini au choix" quand l'image montre des paninis individuels
- ❌ "Menu avec boisson" si chaque produit est listé séparément
- ❌ Regrouper des produits distincts en un seul
- ❌ Inventer des workflows si les produits sont simples
- ❌ Créer des "composite" sans justification explicite dans l'image

## 📋 EXEMPLE CONCRET - PANINIS :

### ❌ MAUVAISE EXTRACTION (À NE JAMAIS FAIRE) :
{
  "newName": "Panini au choix + Boisson 33cl",
  "product_type": "composite",
  "workflow_type": "composite_workflow"
}

### ✅ BONNE EXTRACTION (OBLIGATOIRE) :
[
  {"newName": "Panini 4 Fromages", "product_type": "simple"},
  {"newName": "Panini Poulet", "product_type": "simple"},
  {"newName": "Panini Thon", "product_type": "simple"},
  {"newName": "Panini Merguez", "product_type": "simple"},
  {"newName": "Panini Viande Hachée", "product_type": "simple"},
  {"newName": "Panini Saumon", "product_type": "simple"}
]

Génère le JSON en respectant STRICTEMENT ces règles.
```

## ✅ RÉSULTAT ATTENDU :
Le JSON doit contenir 6 paninis individuels, PAS de produit composite inventé.