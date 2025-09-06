// 📱 PHONE VALIDATION EXECUTOR
// SOLID - Single Responsibility: Valide uniquement les numéros de téléphone

import { BaseExecutor } from './BaseExecutor.ts';
import type { WorkflowStep, WorkflowContext, StepResult } from '../types.ts';

export class PhoneValidationExecutor extends BaseExecutor {
    
    /**
     * Exécute la validation du numéro de téléphone
     * SOLID - Interface Segregation: Implémente uniquement ce qui est nécessaire
     */
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`📱 [PhoneValidation] Validation numéro: ${context.userInput}`);
        
        try {
            const phoneNumber = this.normalizePhoneNumber(context.userInput);
            
            // Valider format
            if (!this.isValidPhoneFormat(phoneNumber)) {
                return {
                    success: false,
                    errors: ['Format de numéro invalide'],
                    nextStep: null,
                    outputData: {}
                };
            }
            
            // Vérifier si c'est un restaurant
            const restaurant = await this.findRestaurantByPhone(phoneNumber, context);
            
            if (!restaurant) {
                return {
                    success: false,
                    errors: ['Ce numéro ne correspond à aucun restaurant'],
                    nextStep: null,
                    outputData: {}
                };
            }
            
            return {
                success: true,
                errors: [],
                nextStep: 'load_restaurant_menu',
                outputData: {
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    normalizedPhone: phoneNumber
                }
            };
            
        } catch (error) {
            console.error('❌ [PhoneValidation] Erreur:', error);
            return {
                success: false,
                errors: ['Erreur validation numéro'],
                nextStep: null,
                outputData: {}
            };
        }
    }
    
    /**
     * Normalise le numéro de téléphone
     * SOLID - DRY: Réutilisable pour tous les formats
     */
    private normalizePhoneNumber(input: string): string {
        // Supprimer espaces, tirets, parenthèses
        let normalized = input.replace(/[\s\-\(\)]/g, '');
        
        // Gérer le +33
        if (normalized.startsWith('+33')) {
            normalized = normalized.substring(3);
        }
        
        // Gérer le 0033
        if (normalized.startsWith('0033')) {
            normalized = normalized.substring(4);
        }
        
        // Ajouter le 0 si manquant pour numéro français
        if (normalized.length === 9 && !normalized.startsWith('0')) {
            normalized = '0' + normalized;
        }
        
        return normalized;
    }
    
    /**
     * Valide le format du numéro
     */
    private isValidPhoneFormat(phone: string): boolean {
        // Format français: 10 chiffres commençant par 0
        const frenchPattern = /^0[1-9][0-9]{8}$/;
        
        // Format international sans +33
        const internationalPattern = /^[1-9][0-9]{8,14}$/;
        
        return frenchPattern.test(phone) || internationalPattern.test(phone);
    }
    
    /**
     * Recherche le restaurant par numéro de téléphone
     */
    private async findRestaurantByPhone(
        phone: string, 
        context: WorkflowContext
    ): Promise<any> {
        // Utiliser le service de requête via le contexte
        const queryService = context.services?.productQueryService;
        
        if (!queryService) {
            throw new Error('Service de requête non disponible');
        }
        
        // Chercher dans la base
        const { data, error } = await context.services.supabase
            .from('france_restaurants')
            .select('*')
            .or(`phone.eq.${phone},whatsapp_number.eq.${phone},contact_phone.eq.${phone}`)
            .single();
        
        return data;
    }
    
    /**
     * Obtenir la configuration de l'executor
     */
    getConfig(): Record<string, any> {
        return {
            validateFormat: true,
            checkRestaurant: true,
            allowInternational: true,
            maxRetries: 3
        };
    }
}