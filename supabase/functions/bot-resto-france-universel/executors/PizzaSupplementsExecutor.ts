// 🍕 PIZZA SUPPLEMENTS EXECUTOR  
// SOLID - Single Responsibility: Gère uniquement les suppléments pizza

import { BaseExecutor } from './BaseExecutor.ts';
import type { WorkflowStep, WorkflowContext, StepResult } from '../types.ts';

export class PizzaSupplementsExecutor extends BaseExecutor {
    
    /**
     * Gère la sélection des suppléments pizza selon la taille
     */
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`🍕 [PizzaSupplements] Traitement suppléments pour pizza ${context.session.selectedPizzaSize}`);
        
        try {
            const pizzaSize = context.session.selectedPizzaSize;
            const pizzaItem = context.session.currentPizzaItem;
            
            if (!pizzaSize || !pizzaItem) {
                return {
                    success: false,
                    errors: ['Aucune pizza sélectionnée'],
                    nextStep: 'VIEWING_MENU',
                    outputData: {}
                };
            }
            
            // Charger les suppléments disponibles pour cette taille
            const supplements = await this.loadSupplementsBySize(pizzaSize, context);
            
            // Si pas de sélection (0 ou vide), pizza sans supplément
            if (!context.userInput || context.userInput === '0') {
                return this.finalizePizzaWithoutSupplements(pizzaItem, context);
            }
            
            // Parser la sélection de suppléments
            const selectedSupplements = this.parseSupplementSelection(
                context.userInput,
                supplements
            );
            
            if (selectedSupplements.errors.length > 0) {
                return {
                    success: false,
                    errors: selectedSupplements.errors,
                    nextStep: null,
                    outputData: {}
                };
            }
            
            // Ajouter les suppléments à la pizza
            const pizzaWithSupplements = this.addSupplementsToPizza(
                pizzaItem,
                selectedSupplements.items
            );
            
            // Vérifier offre 1+1 pour SENIOR/MEGA
            if (this.isEligibleFor1Plus1(pizzaSize)) {
                return this.trigger1Plus1Offer(pizzaWithSupplements, context);
            }
            
            // Ajouter au panier
            return {
                success: true,
                errors: [],
                nextStep: 'add_to_cart',
                outputData: {
                    pizzaComplete: pizzaWithSupplements,
                    supplementsCount: selectedSupplements.items.length
                }
            };
            
        } catch (error) {
            console.error('❌ [PizzaSupplements] Erreur:', error);
            return {
                success: false,
                errors: ['Erreur sélection suppléments'],
                nextStep: null,
                outputData: {}
            };
        }
    }
    
    /**
     * Charge les suppléments disponibles selon la taille
     * SOLID - Dependency Inversion: Utilise l'interface de service
     */
    private async loadSupplementsBySize(
        size: string,
        context: WorkflowContext
    ): Promise<any[]> {
        const queryService = context.services?.productQueryService;
        
        if (!queryService) {
            throw new Error('Service de requête non disponible');
        }
        
        // Requête pour les suppléments de la taille spécifiée
        const config = {
            table: 'france_product_options',
            filters: {
                option_type: 'supplement',
                applicable_sizes: size,
                is_active: true
            },
            orderBy: 'display_order'
        };
        
        return await queryService.queryProducts(config);
    }
    
    /**
     * Parse la sélection de suppléments (format: 1,3,5)
     */
    private parseSupplementSelection(
        input: string,
        availableSupplements: any[]
    ): { items: any[], errors: string[] } {
        const errors: string[] = [];
        const selectedItems: any[] = [];
        
        try {
            const selections = input.split(',').map(s => s.trim());
            
            for (const selection of selections) {
                const index = parseInt(selection) - 1;
                
                if (isNaN(index) || index < 0) {
                    errors.push(`Choix invalide: ${selection}`);
                    continue;
                }
                
                if (index >= availableSupplements.length) {
                    errors.push(`Supplément ${selection} n'existe pas`);
                    continue;
                }
                
                const supplement = availableSupplements[index];
                
                // Vérifier si déjà sélectionné
                if (selectedItems.some(item => item.id === supplement.id)) {
                    continue; // Ignorer les doublons
                }
                
                selectedItems.push(supplement);
            }
            
        } catch (error) {
            errors.push('Format de sélection invalide');
        }
        
        return { items: selectedItems, errors };
    }
    
    /**
     * Ajoute les suppléments à la pizza
     * SOLID - Pure function: Retourne un nouvel objet
     */
    private addSupplementsToPizza(pizza: any, supplements: any[]): any {
        const supplementsTotal = supplements.reduce((sum, supp) => {
            return sum + (supp.price || 0);
        }, 0);
        
        return {
            ...pizza,
            supplements: supplements.map(s => ({
                id: s.id,
                name: s.name,
                price: s.price
            })),
            supplementsPrice: supplementsTotal,
            totalPrice: (pizza.price || 0) + supplementsTotal,
            displayName: this.buildPizzaDisplayName(pizza, supplements)
        };
    }
    
    /**
     * Construit le nom d'affichage de la pizza avec suppléments
     */
    private buildPizzaDisplayName(pizza: any, supplements: any[]): string {
        let name = `${pizza.name} ${pizza.size}`;
        
        if (supplements.length > 0) {
            const suppNames = supplements.map(s => s.name).join(', ');
            name += ` (+${suppNames})`;
        }
        
        return name;
    }
    
    /**
     * Finalise une pizza sans suppléments
     */
    private finalizePizzaWithoutSupplements(
        pizzaItem: any,
        context: WorkflowContext
    ): StepResult {
        const pizzaComplete = {
            ...pizzaItem,
            supplements: [],
            supplementsPrice: 0,
            totalPrice: pizzaItem.price || 0
        };
        
        // Vérifier offre 1+1
        if (this.isEligibleFor1Plus1(pizzaItem.size)) {
            return this.trigger1Plus1Offer(pizzaComplete, context);
        }
        
        return {
            success: true,
            errors: [],
            nextStep: 'add_to_cart',
            outputData: {
                pizzaComplete,
                supplementsCount: 0
            }
        };
    }
    
    /**
     * Vérifie l'éligibilité pour l'offre 1+1
     */
    private isEligibleFor1Plus1(size: string): boolean {
        return size === 'SENIOR' || size === 'MEGA';
    }
    
    /**
     * Déclenche l'offre 1+1 gratuite
     */
    private trigger1Plus1Offer(
        firstPizza: any,
        context: WorkflowContext
    ): StepResult {
        return {
            success: true,
            errors: [],
            nextStep: 'SELECTING_SECOND_FREE_PIZZA',
            outputData: {
                firstPizza,
                offer: '1+1_FREE',
                offerMessage: `🎉 OFFRE SPÉCIALE! Votre 2ème pizza ${firstPizza.size} est OFFERTE!`
            }
        };
    }
    
    /**
     * Configuration de l'executor
     */
    getConfig(): Record<string, any> {
        return {
            allowMultipleSupplements: true,
            validateSizeCompatibility: true,
            trigger1Plus1: true,
            maxSupplementsPerPizza: 10
        };
    }
}