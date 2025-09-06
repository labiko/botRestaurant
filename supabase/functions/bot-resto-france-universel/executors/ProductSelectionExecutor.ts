// 🛍️ PRODUCT SELECTION EXECUTOR
import { BaseExecutor } from './BaseExecutor.ts';
import type { WorkflowStep, WorkflowContext, StepResult } from '../types.ts';

export class ProductSelectionExecutor extends BaseExecutor {
    async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
        console.log(`🛍️ [ProductSelection] Traitement sélection produit`);
        
        try {
            const config = step.selectionConfig;
            const products = await this.productQueryService?.queryProducts(config.productQuery);
            
            if (!products || products.length === 0) {
                return this.errorResult(['Aucun produit disponible']);
            }
            
            // TODO: Implémenter la logique complète
            return this.successResult('next_step', { products });
            
        } catch (error) {
            return this.errorResult(['Erreur sélection produit']);
        }
    }
}