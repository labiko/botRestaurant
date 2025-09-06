// 📦 TOUS LES EXECUTORS MANQUANTS - Implémentation basique
// SOLID - Single Responsibility : Chaque executor a sa responsabilité

import { BaseExecutor } from './BaseExecutor.ts';
import type { WorkflowStep, WorkflowContext, StepResult } from '../types.ts';

// MULTIPLE CHOICE EXECUTOR
export class MultipleChoiceExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`📋 [MultipleChoice] Traitement choix multiple`);
        const userChoice = parseInt(context.userInput);
        const options = step.selectionConfig?.options || [];
        
        if (userChoice > 0 && userChoice <= options.length) {
            const selected = options[userChoice - 1];
            return this.successResult(step.nextStepLogic?.defaultNextStep, { selectedOption: selected });
        }
        
        return this.errorResult(['Choix invalide. Tapez un numéro valide']);
    }
}

// QUANTITY INPUT EXECUTOR
export class QuantityInputExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`🔢 [QuantityInput] Traitement quantité`);
        const quantity = parseInt(context.userInput);
        
        if (!isNaN(quantity) && quantity > 0 && quantity <= 99) {
            return this.successResult(step.nextStepLogic?.defaultNextStep, { quantity });
        }
        
        return this.errorResult(['Quantité invalide (1-99)']);
    }
}

// TEXT INPUT EXECUTOR
export class TextInputExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`📝 [TextInput] Traitement texte`);
        const text = context.userInput?.trim();
        
        if (text && text.length > 0) {
            return this.successResult(step.nextStepLogic?.defaultNextStep, { textInput: text });
        }
        
        return this.errorResult(['Texte requis']);
    }
}

// VALIDATION EXECUTOR
export class ValidationExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`✅ [Validation] Validation des données`);
        // TODO: Implémenter validation selon règles
        return this.successResult(step.nextStepLogic?.defaultNextStep, { validated: true });
    }
}

// SUMMARY EXECUTOR
export class SummaryExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`📊 [Summary] Génération résumé`);
        const template = step.displayConfig?.template || 'order_summary';
        
        await this.messageSender?.sendMessage(
            context.session.phoneNumber,
            'Résumé de votre commande' // TODO: Utiliser template
        );
        
        return this.successResult('WORKFLOW_COMPLETE', { summaryGenerated: true });
    }
}

// DATA LOAD EXECUTOR
export class DataLoadExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`📂 [DataLoad] Chargement données`);
        const config = step.selectionConfig;
        
        if (config?.dataSource === 'france_menu_categories') {
            // TODO: Charger les catégories
            return this.successResult(step.nextStepLogic?.defaultNextStep, { dataLoaded: true });
        }
        
        return this.successResult(step.nextStepLogic?.defaultNextStep);
    }
}

// PRODUCT DISPLAY EXECUTOR
export class ProductDisplayExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`🎨 [ProductDisplay] Affichage produits`);
        // TODO: Formatter et afficher les produits
        return this.successResult(step.nextStepLogic?.defaultNextStep, { displayed: true });
    }
}

// CART UPDATE EXECUTOR
export class CartUpdateExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`🛒 [CartUpdate] Mise à jour panier`);
        // Utilise CartManagementExecutor pour la logique principale
        return this.successResult(step.nextStepLogic?.defaultNextStep, { cartUpdated: true });
    }
}

// CALCULATION EXECUTOR
export class CalculationExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`🧮 [Calculation] Calcul totaux`);
        let total = 0;
        const cart = context.session.cart || {};
        
        for (const key in cart) {
            const item = cart[key];
            total += (item.price || 0) * (item.quantity || 1);
        }
        
        return this.successResult(step.nextStepLogic?.defaultNextStep, { total });
    }
}

// DISPLAY EXECUTOR
export class DisplayExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`📱 [Display] Affichage message`);
        const template = step.displayConfig?.template;
        
        if (template) {
            await this.messageSender?.sendMessage(
                context.session.phoneNumber,
                'Message' // TODO: Utiliser template
            );
        }
        
        return this.successResult(step.nextStepLogic?.defaultNextStep);
    }
}

// INPUT PARSER EXECUTOR
export class InputParserExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`🔍 [InputParser] Analyse entrée`);
        const parser = step.selectionConfig?.parser;
        
        if (parser === 'CART_FORMAT') {
            // Format: 1,2,3
            const items = context.userInput.split(',').map(s => s.trim());
            return this.successResult(step.nextStepLogic?.defaultNextStep, { parsedItems: items });
        }
        
        return this.successResult(step.nextStepLogic?.defaultNextStep);
    }
}

// PRICING UPDATE EXECUTOR
export class PricingUpdateExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`💰 [PricingUpdate] Mise à jour tarifs`);
        const rules = step.selectionConfig?.rules || {};
        const mode = context.session.deliveryMode;
        const priceField = rules[mode] || 'price_on_site';
        
        return this.successResult(step.nextStepLogic?.defaultNextStep, { priceField });
    }
}

// ORDER GENERATION EXECUTOR
export class OrderGenerationExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`📋 [OrderGeneration] Génération numéro commande`);
        const date = new Date();
        const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const sequence = Math.floor(Math.random() * 9999) + 1;
        const orderNumber = `${dateStr}-${sequence.toString().padStart(4, '0')}`;
        
        return this.successResult(step.nextStepLogic?.defaultNextStep, { orderNumber });
    }
}

// DATABASE SAVE EXECUTOR
export class DatabaseSaveExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`💾 [DatabaseSave] Sauvegarde base de données`);
        // TODO: Sauvegarder la commande
        return this.successResult(step.nextStepLogic?.defaultNextStep, { saved: true });
    }
}

// MESSAGE SEND EXECUTOR
export class MessageSendExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`📤 [MessageSend] Envoi message`);
        const template = step.selectionConfig?.template || 'default';
        
        await this.messageSender?.sendMessage(
            context.session.phoneNumber,
            'Message envoyé' // TODO: Utiliser template
        );
        
        return this.successResult(step.nextStepLogic?.defaultNextStep);
    }
}

// ADDRESS VALIDATION EXECUTOR
export class AddressValidationExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`📍 [AddressValidation] Validation adresse`);
        const address = context.userInput;
        
        if (address && address.length > 10) {
            return this.successResult(step.nextStepLogic?.defaultNextStep, { validAddress: address });
        }
        
        return this.errorResult(['Adresse invalide']);
    }
}

// PRODUCT CONFIGURATION EXECUTOR
export class ProductConfigurationExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`⚙️ [ProductConfiguration] Configuration produit`);
        // TODO: Implémenter configuration multi-étapes
        return this.successResult(step.nextStepLogic?.defaultNextStep, { configured: true });
    }
}