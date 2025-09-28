// 🛒 CART MANAGEMENT EXECUTOR
// SOLID - Single Responsibility: Gère uniquement les opérations du panier

import { BaseExecutor } from './BaseExecutor.ts';
import type { WorkflowStep, WorkflowContext, StepResult } from '../types.ts';

export class CartManagementExecutor extends BaseExecutor {
    
    /**
     * Parse et traite l'entrée format panier (1,1,3)
     * SOLID - Single Responsibility: Une seule responsabilité claire
     */
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`🛒 [CartManagement] Traitement: ${context.userInput}`);
        
        try {
            // Gérer les commandes spéciales
            const specialCommand = this.handleSpecialCommand(context.userInput);
            if (specialCommand) {
                return specialCommand;
            }
            
            // Parser l'entrée format panier
            const cartItems = this.parseCartFormat(context.userInput, context);
            
            if (!cartItems || cartItems.length === 0) {
                return {
                    success: false,
                    errors: ['Format invalide. Utilisez: 1,2,3 pour commander'],
                    nextStep: null,
                    outputData: {}
                };
            }
            
            // Mettre à jour le panier
            const updatedCart = this.updateCart(context.session.cart || {}, cartItems);
            
            // Calculer les totaux
            const totals = this.calculateTotals(updatedCart, context);
            
            return {
                success: true,
                errors: [],
                nextStep: this.determineNextStep(cartItems, context),
                outputData: {
                    cart: updatedCart,
                    totals,
                    itemsAdded: cartItems.length
                }
            };
            
        } catch (error) {
            console.error('❌ [CartManagement] Erreur:', error);
            return {
                success: false,
                errors: ['Erreur traitement panier'],
                nextStep: null,
                outputData: {}
            };
        }
    }
    
    /**
     * Gère les commandes spéciales (00, 99, 000, etc.)
     * SOLID - Open/Closed: Extensible pour nouvelles commandes
     */
    private handleSpecialCommand(input: string): StepResult | null {
        const commands: Record<string, StepResult> = {
            '00': {
                success: true,
                errors: [],
                nextStep: 'display_cart',
                outputData: { action: 'VIEW_CART' }
            },
            '99': {
                success: true,
                errors: [],
                nextStep: 'CHOOSING_DELIVERY_MODE',
                outputData: { action: 'FINALIZE_ORDER' }
            },
            '000': {
                success: true,
                errors: [],
                nextStep: 'VIEWING_MENU',
                outputData: { action: 'CONTINUE_SHOPPING' }
            },
            '00': {
                success: true,
                errors: [],
                nextStep: 'clear_cart',
                outputData: { action: 'CLEAR_CART' }
            },
            '0': {
                success: true,
                errors: [],
                nextStep: 'VIEWING_MENU',
                outputData: { action: 'RETURN_MENU' },
                shouldUpdateSession: true
            }
        };
        
        return commands[input] || null;
    }
    
    /**
     * Parse le format panier "1,1,3" en items
     * SOLID - DRY: Logique réutilisable
     */
    private parseCartFormat(input: string, context: WorkflowContext): any[] {
        try {
            // Format: "1,2,3" = article 1, article 2, article 3
            const selections = input.split(',').map(s => s.trim());
            const menuItems = context.session.menuOrder || [];
            const cartItems = [];
            
            for (const selection of selections) {
                const index = parseInt(selection) - 1;
                
                if (index >= 0 && index < menuItems.length) {
                    const item = menuItems[index];
                    cartItems.push({
                        ...item,
                        quantity: 1,
                        selectedIndex: index + 1,
                        categoryName: session.sessionData?.currentCategoryName || 'Produit',
                        categoryId: session.sessionData?.currentCategoryId || null,
                        icon: item.icon || null
                    });
                }
            }
            
            return cartItems;
            
        } catch (error) {
            console.error('❌ [CartManagement] Erreur parsing:', error);
            return [];
        }
    }
    
    /**
     * Met à jour le panier avec les nouveaux items
     * SOLID - Immutability: Retourne un nouveau panier
     */
    private updateCart(existingCart: any, newItems: any[]): any {
        const updatedCart = { ...existingCart };
        
        for (const item of newItems) {
            // Générer une clé unique pour l'item
            const cartKey = this.generateCartKey(item);
            
            if (updatedCart[cartKey]) {
                // Item existe, augmenter quantité
                updatedCart[cartKey].quantity += item.quantity;
            } else {
                // Nouvel item
                updatedCart[cartKey] = item;
            }
        }
        
        return updatedCart;
    }
    
    /**
     * Génère une clé unique pour un item du panier
     * SOLID - Encapsulation: Logique de clé centralisée
     */
    private generateCartKey(item: any): string {
        // Clé basée sur l'ID et la configuration
        let key = `item_${item.id}`;
        
        if (item.selectedSize) {
            key += `_size_${item.selectedSize}`;
        }
        
        if (item.supplements?.length > 0) {
            const suppIds = item.supplements.map((s: any) => s.id).sort().join('_');
            key += `_supp_${suppIds}`;
        }
        
        if (item.configuration) {
            const configHash = this.hashConfiguration(item.configuration);
            key += `_config_${configHash}`;
        }
        
        return key;
    }
    
    /**
     * Hash une configuration pour générer une clé unique
     */
    private hashConfiguration(config: any): string {
        // Simple hash pour la configuration
        return JSON.stringify(config)
            .split('')
            .reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0)
            .toString(36);
    }
    
    /**
     * Calcule les totaux du panier
     * SOLID - Single Responsibility: Calcul uniquement
     */
    private calculateTotals(cart: any, context: WorkflowContext): any {
        let subtotal = 0;
        let itemCount = 0;
        
        const deliveryMode = context.session.deliveryMode || 'sur_place';
        const priceField = deliveryMode === 'livraison' ? 'price_delivery' : 'price_on_site';
        
        for (const key in cart) {
            const item = cart[key];
            const itemPrice = item[priceField] || item.price || 0;
            subtotal += itemPrice * item.quantity;
            itemCount += item.quantity;
        }
        
        // Frais de livraison si applicable
        let deliveryFee = 0;
        if (deliveryMode === 'livraison') {
            deliveryFee = context.restaurant?.deliveryFee || 0;
        }
        
        return {
            subtotal,
            deliveryFee,
            total: subtotal + deliveryFee,
            itemCount
        };
    }
    
    /**
     * Détermine la prochaine étape selon le contexte
     */
    private determineNextStep(cartItems: any[], context: WorkflowContext): string {
        // Si pizza avec suppléments
        const hasPizzaWithSupplements = cartItems.some(item => 
            item.category === 'pizzas' && !item.supplements
        );
        
        if (hasPizzaWithSupplements) {
            return 'SELECTING_PIZZA_SUPPLEMENTS';
        }
        
        // Si produit composite
        const hasCompositeProduct = cartItems.some(item => 
            item.productType === 'composite'
        );
        
        if (hasCompositeProduct) {
            return 'CONFIGURING_PRODUCT';
        }
        
        // Si inclut boisson
        const hasProductWithDrink = cartItems.some(item => 
            item.includesDrink === true
        );
        
        if (hasProductWithDrink) {
            return 'DRINK_SELECTION';
        }
        
        // Retour au menu par défaut
        return 'VIEWING_MENU';
    }
    
    /**
     * Configuration de l'executor
     */
    getConfig(): Record<string, any> {
        return {
            parseCartFormat: true,
            validateCommands: true,
            preserveState: true,
            allowMultipleItems: true,
            generateUniqueKeys: true
        };
    }
}