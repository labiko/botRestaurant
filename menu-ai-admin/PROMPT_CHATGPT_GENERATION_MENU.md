# 📋 PROMPT CHATGPT - GÉNÉRATION OPTIMISÉE DE MENUS RESTAURANT

## 🎯 Objectif
Ce prompt permet de transformer n'importe quelle image de menu restaurant en format structuré optimal pour le système de clonage IA automatique.

---

## 📝 PROMPT À COPIER DANS CHATGPT

```markdown
Tu es un expert en digitalisation de menus restaurants pour système WhatsApp bot avec IA.

MISSION : Analyser l'image du menu et générer un format PARFAITEMENT structuré pour clonage IA automatique.

## 🚨 RÈGLES ABSOLUES - NE JAMAIS VIOLER :
1. **EXTRACTION EXACTE** : Reproduire EXACTEMENT ce qui est écrit dans l'image
2. **AUCUNE INVENTION** : Ne JAMAIS ajouter de produits ou prix non visibles
3. **AUCUNE MODIFICATION** : Ne JAMAIS changer les noms ou descriptions
4. **PRIX IDENTIQUES** : Copier les prix EXACTEMENT comme affichés (l'IA ajoutera +1€ pour livraison)
5. **SI ILLISIBLE** : Marquer [ILLISIBLE] plutôt que deviner

## 🔍 ANALYSE REQUISE :
1. Extraire TOUS les produits avec prix EXACT de l'image
2. Détecter les catégories (entrées, plats, menus, etc.)
3. Identifier les produits simples vs composites
4. Repérer les choix multiples (mots clés : "ou", "au choix", "avec")
5. Distinguer suppléments vs produits normaux
6. Noter TOUS les détails (poids, quantités, marques)

## 📝 FORMAT DE SORTIE OBLIGATOIRE :

### STRUCTURE CATÉGORIE :
[EMOJI] Nom Catégorie

### STRUCTURE PRODUIT SIMPLE :
Nom Produit — Prix€
TYPE: SIMPLE

### STRUCTURE PRODUIT COMPOSITE (menu/formule) :
Nom Menu — Prix€
TYPE: COMPOSITE
DESCRIPTION: (éléments inclus)
WORKFLOW:
  ÉTAPE 1: [Titre choix] (obligatoire)
    - Option 1
    - Option 2
    - Option 3
  ÉTAPE 2: [Titre choix] (optionnel)
    - Option A (+supplément€ si payant)
    - Option B
INCLUS: [éléments automatiquement inclus sans choix]

RÈGLE WORKFLOW: Ne créer une ÉTAPE que si l'utilisateur doit faire un CHOIX. Les éléments automatiques vont dans INCLUS.

### STRUCTURE SUPPLÉMENTS :
➕ Suppléments Universels
SUPPLEMENT: Nom — +Prix€
APPLICABILITÉ: Tous menus composite

## 📌 EXEMPLES CONCRETS :

🍔 Burgers
Burger Classic — 8,50€
TYPE: SIMPLE

Big Mac Menu — 12,00€
TYPE: COMPOSITE
DESCRIPTION: Burger + accompagnement + boisson
WORKFLOW:
  ÉTAPE 1: Taille burger (obligatoire)
    - Normal
    - XL (+2€)
  ÉTAPE 2: Accompagnement (obligatoire)
    - Frites
    - Salade
    - Potatoes
  ÉTAPE 3: Boisson (obligatoire)
    - Coca 33cl
    - Sprite 33cl
    - Eau 50cl
INCLUS: Sauce au choix

👶 Menu Enfant
Menu Kids — 7,50€
TYPE: COMPOSITE
DESCRIPTION: Plat + accompagnement + dessert + surprise
WORKFLOW:
  ÉTAPE 1: Plat principal (obligatoire)
    - Nuggets 5 pièces
    - Mini burger
    - Hot dog
  ÉTAPE 2: Accompagnement (obligatoire)
    - Petite frite
    - Compote
INCLUS: Kinder Surprise + Jus de fruit

🍕 Pizzas
Margherita — 9,00€
TYPE: SIMPLE

Pizza Composée — 12,00€
TYPE: COMPOSITE
WORKFLOW:
  ÉTAPE 1: Base (obligatoire)
    - Tomate
    - Crème
  ÉTAPE 2: 3 garnitures au choix (obligatoire)
    - Jambon
    - Champignons
    - Poivrons
    - Olives
    - Fromage supplémentaire

➕ Suppléments Universels
SUPPLEMENT: Extra bacon — +2,00€
SUPPLEMENT: Double cheese — +1,50€
SUPPLEMENT: Sauce supplémentaire — +0,50€
APPLICABILITÉ: Tous menus composite

## ⚠️ RÈGLES CRITIQUES :
1. **PRIX EXACTS** : Copier les prix EXACTEMENT comme sur l'image (ne PAS ajouter +1€, l'IA le fera)
2. **TOUT EXTRAIRE** : Ne rien omettre, même les petites mentions
3. **SUPPLÉMENTS** : Les identifier et les mettre en fin de liste
4. **TYPE OBLIGATOIRE** : Marquer TYPE: SIMPLE ou COMPOSITE pour CHAQUE produit
5. **WORKFLOWS DÉTAILLÉS** : Pour COMPOSITE, lister TOUTES les étapes de choix
6. **OPTIONS PAYANTES** : Indiquer (+X€) uniquement si c'est écrit dans le menu
7. **ÉLÉMENTS INCLUS** : Sont toujours gratuits (sans supplément)
8. **EMOJIS PERTINENTS** : Un par catégorie pour la lisibilité
9. **QUANTITÉS/POIDS** : Toujours inclure (ex: 150g, 33cl, 6 pièces)
10. **MARQUES** : Si mentionnées, les conserver (ex: Coca-Cola, pas juste Cola)

## 🎯 ÉLÉMENTS D'OPTIMISATION POUR L'IA :

### INFORMATIONS À CAPTURER POUR SQL OPTIMAL :
1. **HORAIRES DE SERVICE** : Si mentionnés (ex: "Midi uniquement", "Après 18h")
2. **RESTRICTIONS** : Allergènes, halal, végétarien, sans gluten
3. **PROMOTIONS** : Offres spéciales, happy hours, réductions
4. **MINIMUM COMMANDE** : Si indiqué pour livraison
5. **TEMPS PRÉPARATION** : Si mentionné (ex: "20 min", "sur commande")
6. **DISPONIBILITÉ** : "Selon arrivage", "Week-end uniquement"
7. **PERSONNALISATION** : "Sans oignon possible", "Épicé sur demande"

### FORMAT POUR CES INFOS :
```
METADATA:
  HORAIRES: [si applicable]
  RESTRICTIONS: [si applicable]
  PROMOTIONS: [si applicable]
  NOTES: [autres informations utiles]
```

## 🎯 OBJECTIF FINAL :
Générer un menu 100% fidèle à l'original et prêt pour import dans système IA de clonage restaurant, permettant la génération automatique de:
- Scripts SQL complets avec workflows
- Configuration bot WhatsApp interactive
- Gestion des prix (sur place + livraison +1€)
- Suppléments et options dynamiques

Analyse maintenant l'image et génère le menu formaté EN RESPECTANT SCRUPULEUSEMENT L'ORIGINAL.
```

---

## 💡 MODE D'EMPLOI

### Étapes d'utilisation :

1. **📋 Copier** - Copiez le prompt ci-dessus intégralement
2. **💬 ChatGPT** - Collez dans une nouvelle conversation ChatGPT
3. **📸 Image** - Ajoutez l'image du menu restaurant
4. **⏳ Attendre** - ChatGPT analyse et génère le format
5. **📝 Copier** - Récupérez le menu formaté généré
6. **🚀 Importer** - Collez dans le champ "Menu Source" du système de clonage IA

### ✅ Points de vérification AVANT import :

#### Exactitude des données :
- [ ] **TOUS les produits** de l'image sont présents
- [ ] **Prix identiques** à l'image (pas de modification)
- [ ] **Noms exacts** sans correction orthographique
- [ ] **Quantités/poids** mentionnés (150g, 33cl, etc.)
- [ ] **Marques** conservées si présentes

#### Format technique :
- [ ] **TYPE défini** pour chaque produit (SIMPLE/COMPOSITE)
- [ ] **Prix format** X,XX€ ou XX,XX€
- [ ] **WORKFLOW détaillé** pour tous les COMPOSITE
- [ ] **Étapes numérotées** avec (obligatoire/optionnel)
- [ ] **Suppléments** regroupés en fin de liste

#### Optimisation IA :
- [ ] **Catégories** avec emojis pertinents
- [ ] **Choix multiples** bien identifiés
- [ ] **Options payantes** marquées (+X€)
- [ ] **Éléments INCLUS** listés
- [ ] **METADATA** ajoutées si pertinentes

---

## 🎯 AVANTAGES DU FORMAT

### Pour l'IA de clonage :
- **Détection automatique** des workflows complexes
- **Génération SQL** complète avec configurations
- **Règle +1€ livraison** appliquée automatiquement
- **Suppléments universels** correctement configurés

### Pour le bot WhatsApp :
- **Workflows interactifs** fonctionnels
- **Choix multiples** bien structurés
- **Prix dynamiques** avec suppléments
- **Expérience utilisateur** optimale

---

## 📊 EXEMPLE DE RÉSULTAT ATTENDU

```
🥡 Les Menus Solo
Menu Tenders — 9,00€
TYPE: COMPOSITE
DESCRIPTION: 6 pièces + frites + boisson 33cl
WORKFLOW:
  ÉTAPE 1: Choix de la boisson (obligatoire)
    - Coca-Cola 33cl
    - Sprite 33cl
    - Fanta 33cl
    - Eau 50cl
INCLUS: Sauce au choix

Menu Wings — 9,00€
TYPE: COMPOSITE
DESCRIPTION: 8 pièces + frites + boisson 33cl
WORKFLOW:
  ÉTAPE 1: Choix de la boisson (obligatoire)
    - Coca-Cola 33cl
    - Sprite 33cl
    - Fanta 33cl
    - Eau 50cl
INCLUS: Sauce au choix

➕ Suppléments Universels
SUPPLEMENT: 4 Hot Wings — +3,50€
SUPPLEMENT: 1 Tender — +1,50€
SUPPLEMENT: 4 Oignons Rings — +3,50€
APPLICABILITÉ: Tous menus composite
```

---

## 🔧 PERSONNALISATION

### Adapter pour votre restaurant :
- Modifier les exemples selon votre type de cuisine
- Ajouter des règles spécifiques (halal, végétarien, etc.)
- Préciser les formats de boisson disponibles
- Indiquer les allergènes si nécessaire

---

## ⚠️ CAS PARTICULIERS À GÉRER

### Situations spéciales :
1. **Prix barrés/promos** : Noter les DEUX prix (ancien et nouveau)
2. **Formules complexes** : Décomposer chaque élément
3. **Menus à composer** : Lister TOUTES les combinaisons possibles
4. **Boissons au choix** : Lister TOUTES les options disponibles
5. **Tailles multiples** : Créer un produit par taille avec son prix
6. **Happy hours** : Ajouter dans METADATA avec horaires

### Erreurs à éviter :
- ❌ **NE PAS** regrouper des produits similaires
- ❌ **NE PAS** arrondir les prix
- ❌ **NE PAS** traduire ou corriger les noms
- ❌ **NE PAS** supposer des options non écrites
- ❌ **NE PAS** ajouter +1€ (l'IA le fera)
- ❌ **NE PAS** créer d'ÉTAPE pour des éléments automatiquement inclus
- ❌ **NE PAS** dupliquer des produits quasi-identiques (fusionner intelligemment)

## 📞 SUPPORT & DÉPANNAGE

### Problèmes courants :
| Problème | Solution |
|----------|----------|
| Image floue | Demander une photo plus nette |
| Prix cachés | Marquer [PRIX ILLISIBLE] |
| Menu incomplet | Traiter la partie visible uniquement |
| Texte en langue étrangère | Conserver la langue originale |
| Menu manuscrit | Faire de son mieux ou demander version tapée |

### Vérification finale :
1. **Comptez** les produits sur l'image vs votre extraction
2. **Vérifiez** que tous les prix correspondent
3. **Contrôlez** les workflows des menus composites
4. **Validez** que les suppléments sont en fin

---

*Document créé pour optimiser l'intégration menu restaurant → système IA de clonage → bot WhatsApp*