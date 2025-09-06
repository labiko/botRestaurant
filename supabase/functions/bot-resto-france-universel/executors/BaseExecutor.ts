// 🎯 BASE EXECUTOR - Classe de base pour tous les executors
// SOLID - DRY : Code commun réutilisable

import type { WorkflowStep, WorkflowContext, StepResult } from '../types.ts';
import { IProductQueryService, IMessageSender } from '../types.ts';

export interface IStepExecutor {
    execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult>;
    getConfig(): Record<string, any>;
}

/**
 * Classe de base pour tous les executors
 * SOLID - Template Method Pattern
 */
export abstract class BaseExecutor implements IStepExecutor {
    
    constructor(
        protected productQueryService?: IProductQueryService,
        protected messageSender?: IMessageSender
    ) {}
    
    abstract execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult>;
    
    getConfig(): Record<string, any> {
        return {};
    }
    
    /**
     * Méthode utilitaire pour créer un résultat de succès
     */
    protected successResult(nextStep?: string, outputData: any = {}): StepResult {
        return {
            success: true,
            errors: [],
            nextStep: nextStep || null,
            outputData,
            shouldUpdateSession: true
        };
    }
    
    /**
     * Méthode utilitaire pour créer un résultat d'erreur
     */
    protected errorResult(errors: string[], nextStep?: string): StepResult {
        return {
            success: false,
            errors,
            nextStep: nextStep || null,
            outputData: {},
            shouldUpdateSession: false
        };
    }
}