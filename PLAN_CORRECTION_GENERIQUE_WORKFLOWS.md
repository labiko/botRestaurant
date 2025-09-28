# 🛡️ PLAN DE CORRECTION GÉNÉRIQUE - WORKFLOWS

## 🎯 PROBLÈME IDENTIFIÉ
Les workflows (MENU_1, MENU_2, MENU_3, MENU_4) se déclenchent sur les numéros 1,2,3,4 **dans toutes les catégories**, causant l'affichage incorrect de produits pizza dans d'autres catégories.

## ✅ SOLUTION GÉNÉRIQUE PROPOSÉE

### 1. **CRÉATION D'UNE FONCTION DE VALIDATION CENTRALE**

```typescript
// Dans UniversalBot.ts - Nouvelle fonction
private isWorkflowAllowedForCategory(
  workflowId: string,
  categorySlug: string,
  message: string
): boolean {

  // CONFIGURATION : Définir quels workflows sont autorisés par catégorie
  const WORKFLOW_CATEGORY_RULES = {
    // Workflows pizza UNIQUEMENT dans catégories pizza
    'MENU_1_WORKFLOW': {
      allowedCategories: ['pizzas', 'pizza', 'menu-pizza', 'menus'],
      triggerMessage: '1'
    },
    'MENU_2_WORKFLOW': {
      allowedCategories: ['pizzas', 'pizza', 'menu-pizza', 'menus'],
      triggerMessage: '2'
    },
    'MENU_3_WORKFLOW': {
      allowedCategories: ['pizzas', 'pizza', 'menu-pizza', 'menus'],
      triggerMessage: '3'
    },
    'MENU_4_WORKFLOW': {
      allowedCategories: ['pizzas', 'pizza', 'menu-pizza', 'menus'],
      triggerMessage: '4'
    }
  };

  const rule = WORKFLOW_CATEGORY_RULES[workflowId];

  // Si pas de règle définie, bloquer par défaut
  if (!rule) {
    console.log(`🚫 [WORKFLOW_VALIDATION] Workflow ${workflowId} non configuré - BLOQUÉ`);
    return false;
  }

  // Vérifier si le message correspond
  if (message !== rule.triggerMessage) {
    return false;
  }

  // Vérifier si la catégorie est autorisée
  const isAllowed = rule.allowedCategories.some(allowed =>
    categorySlug.toLowerCase().includes(allowed.toLowerCase())
  );

  console.log(`🔍 [WORKFLOW_VALIDATION] ${workflowId} dans "${categorySlug}": ${isAllowed ? '✅ AUTORISÉ' : '🚫 BLOQUÉ'}`);

  return isAllowed;
}
```

### 2. **REFACTORING DE shouldTriggerWorkflow**

```typescript
private shouldTriggerWorkflow(
  workflow: any,
  message: string,
  session: BotSession
): boolean {

  // Récupérer la catégorie actuelle
  const currentCategoryId = session.sessionData?.currentCategoryId ||
                           session.sessionData?.selectedCategoryId;

  if (!currentCategoryId) {
    console.log(`🚫 [shouldTriggerWorkflow] Pas de catégorie active - workflow bloqué`);
    return false;
  }

  // Trouver la catégorie dans les données de session
  const categories = session.sessionData?.categories || [];
  const currentCategory = categories.find((c: any) => c.id === currentCategoryId);
  const categorySlug = currentCategory?.slug || '';

  // VALIDATION CENTRALE pour tous les workflows
  return this.isWorkflowAllowedForCategory(
    workflow.workflowId,
    categorySlug,
    message
  );
}
```

## 🎯 AVANTAGES DE CETTE APPROCHE

### ✅ **Générique**
- Une seule fonction gère TOUS les workflows
- Facile d'ajouter de nouveaux workflows

### ✅ **Maintenable**
- Configuration centralisée des règles
- Modifications dans un seul endroit

### ✅ **Sécurisé**
- Blocage par défaut si non configuré
- Validation stricte des catégories

### ✅ **Traçable**
- Logs détaillés pour chaque décision
- Facile à débugger

## 📊 IMPACT SUR LE CODE EXISTANT

### **AVANT** (Code actuel problématique)
```typescript
// 4 conditions séparées, sans validation
if (workflow.workflowId === 'MENU_1_WORKFLOW' && message === '1') return true;
if (workflow.workflowId === 'MENU_2_WORKFLOW' && message === '2') { /* logique custom */ }
if (workflow.workflowId === 'MENU_3_WORKFLOW' && message === '3') return true;
if (workflow.workflowId === 'MENU_4_WORKFLOW' && message === '4') return true;
```

### **APRÈS** (Code unifié et sécurisé)
```typescript
// Une seule ligne qui gère tout
return this.isWorkflowAllowedForCategory(workflow.workflowId, categorySlug, message);
```

## 🔒 RÈGLES DE SÉCURITÉ

1. **Principe du moindre privilège** : Un workflow n'est autorisé QUE dans ses catégories explicitement définies
2. **Fail-safe** : Si configuration manquante → workflow bloqué
3. **Validation double** : Message ET catégorie doivent correspondre
4. **Logs systématiques** : Toute décision est tracée

## 📝 CATÉGORIES À PROTÉGER

### **Catégories NON-PIZZA** (workflows pizza interdits)
- `desserts`
- `boissons`
- `entrees`
- `salades`
- `supplements`
- Toute autre catégorie non listée

### **Catégories PIZZA** (workflows pizza autorisés)
- `pizzas`
- `pizza`
- `menu-pizza`
- `menus` (contient des menus pizza)

## 🚀 ÉTAPES D'IMPLÉMENTATION

1. **Créer la fonction `isWorkflowAllowedForCategory`**
2. **Remplacer TOUTE la logique dans `shouldTriggerWorkflow`**
3. **Supprimer les conditions individuelles (lignes 548-586)**
4. **Tester dans chaque catégorie**
5. **Déployer**

## 🔍 TESTS DE VALIDATION

### ✅ **Tests à effectuer**

| Catégorie | Message | Résultat attendu |
|-----------|---------|------------------|
| desserts | 1 | ❌ Ajoute dessert #1 (pas workflow) |
| desserts | 2 | ❌ Ajoute dessert #2 (pas workflow) |
| desserts | 3 | ❌ Ajoute dessert #3 (pas workflow) |
| desserts | 4 | ❌ Ajoute dessert #4 (pas workflow) |
| pizzas | 1 | ✅ Déclenche MENU_1_WORKFLOW |
| pizzas | 2 | ✅ Déclenche MENU_2_WORKFLOW |
| pizzas | 3 | ✅ Déclenche MENU_3_WORKFLOW |
| pizzas | 4 | ✅ Déclenche MENU_4_WORKFLOW |
| boissons | 1-4 | ❌ Ajoute boisson (pas workflow) |

## ⚡ CORRECTION RAPIDE IMMÉDIATE

Si besoin d'une correction rapide avant refactoring complet :

```typescript
// Appliquer la même logique que MENU_2 aux autres
if (workflow.workflowId === 'MENU_1_WORKFLOW' && message === '1') {
  // Copier exactement la logique de MENU_2_WORKFLOW
}
```

Mais la **solution générique est FORTEMENT recommandée** pour éviter duplication et futurs bugs.