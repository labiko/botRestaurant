# 🎯 PLAN D'INTÉGRATION DU WORKFLOW MENU PIZZA DANS LE BOT

## 📊 ANALYSE PRÉALABLE

### Fichiers à modifier :
1. `CompositeWorkflowExecutor.ts` - Logique principale du workflow
2. `UniversalBot.ts` - Détection et routage
3. `UniversalCartFormatter.ts` - Formatage du panier

---

## 🔧 ÉTAPE 1 : DÉTECTION DU WORKFLOW (UniversalBot.ts)

### Localisation : `handleProductSelection()` ligne ~1250

```typescript
// AVANT la vérification des pizzas
if (selectedProduct.workflow_type === 'menu_pizza_selection') {
    console.log('🍕 [MenuPizza] Démarrage workflow menu pizza');
    
    // Démarrer le workflow menu pizza
    await this.compositeWorkflowExecutor.startMenuPizzaWorkflow(
        phoneNumber,
        selectedProduct,
        session
    );
    return;
}
```

---

## 🔧 ÉTAPE 2 : CRÉATION DU WORKFLOW (CompositeWorkflowExecutor.ts)

### Ajouter la nouvelle méthode principale :

```typescript
/**
 * Workflow spécifique pour les menus pizza
 * Gère la sélection multiple de pizzas et les composants additionnels
 */
async startMenuPizzaWorkflow(
    phoneNumber: string,
    product: any,
    session: any
): Promise<void> {
    console.log(`🍕 [MenuPizza] Démarrage pour: ${product.name}`);
    
    try {
        const menuConfig = product.steps_config?.menu_config;
        if (!menuConfig) {
            throw new Error('Configuration du menu manquante');
        }

        // Initialiser le workflow dans la session
        await this.initializeMenuWorkflow(phoneNumber, session, product, menuConfig);
        
        // Démarrer avec le premier composant
        await this.processNextMenuComponent(phoneNumber, session, 0);
        
    } catch (error) {
        console.error('❌ [MenuPizza] Erreur:', error);
        await this.messageSender.sendMessage(phoneNumber, 
            '❌ Erreur lors de la configuration du menu. Tapez "resto" pour recommencer.');
    }
}
```

---

## 🔧 ÉTAPE 3 : GESTION DES COMPOSANTS

### Méthode pour traiter chaque composant :

```typescript
private async processNextMenuComponent(
    phoneNumber: string,
    session: any,
    componentIndex: number
): Promise<void> {
    const menuConfig = session.sessionData.menuPizzaWorkflow.menuConfig;
    const components = menuConfig.components;
    
    if (componentIndex >= components.length) {
        // Tous les composants traités - finaliser
        await this.finalizeMenuOrder(phoneNumber, session);
        return;
    }
    
    const component = components[componentIndex];
    
    switch (component.type) {
        case 'pizza_selection':
            await this.showPizzaSelection(phoneNumber, session, component, componentIndex);
            break;
            
        case 'beverage_selection':
            await this.showBeverageSelection(phoneNumber, session, component, componentIndex);
            break;
            
        case 'side_selection':
            await this.showSideSelection(phoneNumber, session, component, componentIndex);
            break;
            
        default:
            console.error(`Type de composant inconnu: ${component.type}`);
    }
}
```

---

## 🔧 ÉTAPE 4 : SÉLECTION MULTIPLE DE PIZZAS

### Méthode pour afficher et gérer la sélection de pizzas :

```typescript
private async showPizzaSelection(
    phoneNumber: string,
    session: any,
    component: any,
    componentIndex: number
): Promise<void> {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    // Récupérer les pizzas disponibles
    const { data: pizzas } = await supabase
        .from('france_products')
        .select('*')
        .eq('restaurant_id', session.sessionData.selectedRestaurantId)
        .eq('category_id', 2) // ID catégorie Pizzas
        .eq('is_active', true)
        .order('display_order');
    
    // Récupérer les prix selon la taille
    const size = component.size; // junior/senior/mega
    const { data: variants } = await supabase
        .from('france_product_variants')
        .select('*')
        .in('product_id', pizzas.map(p => p.id))
        .eq('size', size);
    
    // Construire le message
    let message = `🍕 ${component.title}\n`;
    message += `Prix du menu: ${session.sessionData.menuPizzaWorkflow.menuConfig.price}€\n\n`;
    message += `PIZZAS DISPONIBLES (Taille ${size}):\n`;
    
    pizzas.forEach((pizza, index) => {
        const variant = variants.find(v => v.product_id === pizza.id);
        const price = variant?.price_on_site || 0;
        message += `${index + 1}. ${pizza.name} - ${price}€\n`;
    });
    
    message += `\n📝 ${component.instruction}`;
    
    // Mettre à jour la session pour attendre la réponse
    await this.updateMenuSession(phoneNumber, session, {
        currentComponent: componentIndex,
        waitingFor: 'pizza_selection',
        availablePizzas: pizzas,
        pizzaVariants: variants,
        expectedQuantity: component.quantity,
        selectionMode: component.selection_mode
    });
    
    await this.messageSender.sendMessage(phoneNumber, message);
}
```

---

## 🔧 ÉTAPE 5 : TRAITEMENT DES RÉPONSES

### Dans `handleUniversalWorkflowResponse()` :

```typescript
// Vérifier si c'est un workflow menu pizza
if (session.sessionData?.menuPizzaWorkflow) {
    await this.handleMenuPizzaResponse(phoneNumber, session, message);
    return;
}
```

### Méthode de traitement des réponses :

```typescript
private async handleMenuPizzaResponse(
    phoneNumber: string,
    session: any,
    message: string
): Promise<void> {
    const workflow = session.sessionData.menuPizzaWorkflow;
    const waitingFor = workflow.waitingFor;
    
    switch (waitingFor) {
        case 'pizza_selection':
            await this.processPizzaSelectionResponse(phoneNumber, session, message);
            break;
            
        case 'beverage_selection':
            await this.processBeverageSelectionResponse(phoneNumber, session, message);
            break;
            
        case 'side_selection':
            await this.processSideSelectionResponse(phoneNumber, session, message);
            break;
            
        case 'confirmation':
            await this.processMenuConfirmation(phoneNumber, session, message);
            break;
    }
}
```

---

## 🔧 ÉTAPE 6 : TRAITEMENT SÉLECTION MULTIPLE

### Parser et valider la sélection multiple :

```typescript
private async processPizzaSelectionResponse(
    phoneNumber: string,
    session: any,
    message: string
): Promise<void> {
    const workflow = session.sessionData.menuPizzaWorkflow;
    const expectedQuantity = workflow.expectedQuantity;
    const selectionMode = workflow.selectionMode;
    
    let selections = [];
    
    if (selectionMode === 'multiple') {
        // Parser "1,3,5" en tableau [1, 3, 5]
        selections = message.split(',').map(s => parseInt(s.trim()));
        
        // Valider le nombre
        if (selections.length !== expectedQuantity) {
            await this.messageSender.sendMessage(phoneNumber,
                `❌ Vous devez choisir exactement ${expectedQuantity} pizzas.\n` +
                `Exemple: ${Array.from({length: expectedQuantity}, (_, i) => i + 1).join(',')}`);
            return;
        }
    } else {
        // Sélection simple
        selections = [parseInt(message.trim())];
    }
    
    // Valider les numéros
    const availablePizzas = workflow.availablePizzas;
    for (const selection of selections) {
        if (isNaN(selection) || selection < 1 || selection > availablePizzas.length) {
            await this.messageSender.sendMessage(phoneNumber,
                `❌ Choix invalide: ${selection}. Choisissez entre 1 et ${availablePizzas.length}.`);
            return;
        }
    }
    
    // Stocker les sélections
    const selectedPizzas = selections.map(index => {
        const pizza = availablePizzas[index - 1];
        const variant = workflow.pizzaVariants.find(v => v.product_id === pizza.id);
        return {
            id: pizza.id,
            name: pizza.name,
            size: workflow.currentComponent.size,
            price: variant?.price_on_site || 0
        };
    });
    
    // Ajouter au workflow
    if (!workflow.selections) workflow.selections = {};
    workflow.selections.pizzas = selectedPizzas;
    
    // Passer au composant suivant
    await this.processNextMenuComponent(phoneNumber, session, workflow.currentComponent + 1);
}
```

---

## 🔧 ÉTAPE 7 : FINALISATION ET AJOUT AU PANIER

### Finaliser la commande du menu :

```typescript
private async finalizeMenuOrder(
    phoneNumber: string,
    session: any
): Promise<void> {
    const workflow = session.sessionData.menuPizzaWorkflow;
    const selections = workflow.selections;
    
    // Construire le récapitulatif
    let recap = `✅ ${workflow.product.name} - Confirmation\n\n`;
    recap += `Votre menu:\n`;
    
    // Pizzas
    if (selections.pizzas) {
        selections.pizzas.forEach((pizza, i) => {
            recap += `• Pizza ${i + 1}: ${pizza.name} (${pizza.size})\n`;
        });
    }
    
    // Boissons
    if (selections.beverages) {
        selections.beverages.forEach(bev => {
            recap += `• Boisson: ${bev.name}\n`;
        });
    }
    
    // Accompagnements
    if (selections.sides) {
        recap += `• Accompagnement: ${selections.sides.name}\n`;
    }
    
    recap += `\nPrix total du menu: ${workflow.menuConfig.price}€\n`;
    recap += `\nConfirmer l'ajout au panier?\n`;
    recap += `1. ✅ Oui, ajouter au panier\n`;
    recap += `2. ❌ Non, recommencer`;
    
    // Mettre à jour pour attendre confirmation
    workflow.waitingFor = 'confirmation';
    await this.updateMenuSession(phoneNumber, session, workflow);
    
    await this.messageSender.sendMessage(phoneNumber, recap);
}
```

---

## 🔧 ÉTAPE 8 : AJOUT AU PANIER

### Confirmer et ajouter au panier :

```typescript
private async processMenuConfirmation(
    phoneNumber: string,
    session: any,
    message: string
): Promise<void> {
    const choice = message.trim();
    
    if (choice === '1') {
        // Ajouter au panier
        const workflow = session.sessionData.menuPizzaWorkflow;
        const cartItem = {
            id: workflow.product.id,
            name: workflow.product.name,
            price: workflow.menuConfig.price,
            quantity: 1,
            type: 'menu_pizza',
            details: workflow.selections,
            deliveryMode: session.sessionData.deliveryMode
        };
        
        // Ajouter au panier existant
        const cart = session.sessionData.cart || {};
        const itemKey = `menu_${workflow.product.id}_${Date.now()}`;
        cart[itemKey] = cartItem;
        
        // Mettre à jour le total
        const totalPrice = Object.values(cart).reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);
        
        // Sauvegarder
        await this.sessionManager.updateSession(phoneNumber, {
            sessionData: {
                ...session.sessionData,
                cart: cart,
                totalPrice: totalPrice,
                menuPizzaWorkflow: null // Nettoyer le workflow
            },
            botState: 'VIEWING_CART'
        });
        
        await this.messageSender.sendMessage(phoneNumber,
            `✅ ${workflow.product.name} ajouté au panier!\n\n` +
            `Que voulez-vous faire?\n` +
            `1. Continuer mes achats\n` +
            `2. Voir le panier (99)\n` +
            `3. Vider le panier (00)`);
            
    } else if (choice === '2') {
        // Recommencer
        await this.startMenuPizzaWorkflow(phoneNumber, workflow.product, session);
    } else {
        await this.messageSender.sendMessage(phoneNumber,
            `❌ Choix invalide. Tapez 1 pour confirmer ou 2 pour recommencer.`);
    }
}
```

---

## 📋 CHECKLIST D'INTÉGRATION

- [ ] Ajouter détection dans `UniversalBot.handleProductSelection()`
- [ ] Créer `startMenuPizzaWorkflow()` dans `CompositeWorkflowExecutor`
- [ ] Implémenter `processNextMenuComponent()` pour navigation
- [ ] Créer `showPizzaSelection()` avec récupération dynamique
- [ ] Implémenter parser pour sélection multiple "1,3,5"
- [ ] Créer handlers pour boissons et accompagnements
- [ ] Implémenter `finalizeMenuOrder()` avec récapitulatif
- [ ] Ajouter au panier avec structure spéciale menu
- [ ] Tester workflow complet pour chaque menu
- [ ] Gérer les erreurs et cas limites

---

## 🧪 TESTS À EFFECTUER

1. **MENU 1** : Sélection multiple "1,3,5" pour 3 pizzas
2. **MENU 2** : 2 pizzas + choix boisson
3. **MENU 3** : 1 pizza + nuggets/wings + boisson
4. **MENU 4** : Workflow complet 4 étapes
5. **Erreurs** : Mauvais format, mauvais nombres
6. **Annulation** : Retour arrière, "annuler"
7. **Panier** : Vérifier l'ajout correct avec détails

---

## ⚠️ POINTS D'ATTENTION

1. **Session management** : Préserver les données pendant le workflow
2. **Validation** : Nombre exact de sélections selon le menu
3. **Prix** : Toujours le prix fixe du menu, pas la somme
4. **Tailles** : Forcer la bonne taille selon le menu
5. **Rollback** : Permettre de recommencer si erreur