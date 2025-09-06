// ⚡ EXÉCUTEUR DE WORKFLOWS - CŒUR DE L'EXÉCUTION  
// SOLID - Strategy Pattern : Différentes stratégies selon le type d'étape
// Exécution configuration-driven sans code en dur

import { 
  IWorkflowExecutor,
  IProductQueryService,
  IMessageSender,
  WorkflowStep,
  WorkflowContext,
  StepResult,
  ValidationResult,
  ValidationError,
  StepType
} from '../types.ts';

// Import de tous les executors
import {
  ProductSelectionExecutor,
  MultipleChoiceExecutor,
  QuantityInputExecutor,
  TextInputExecutor,
  ValidationExecutor,
  SummaryExecutor,
  PhoneValidationExecutor,
  DataLoadExecutor,
  ProductDisplayExecutor,
  CartManagementExecutor,
  CartUpdateExecutor,
  CalculationExecutor,
  DisplayExecutor,
  InputParserExecutor,
  PricingUpdateExecutor,
  OrderGenerationExecutor,
  DatabaseSaveExecutor,
  MessageSendExecutor,
  AddressValidationExecutor,
  PizzaSupplementsExecutor,
  ProductConfigurationExecutor
} from '../executors/index.ts';

/**
 * Exécuteur principal de workflows
 * SOLID - Strategy Pattern : Délègue à des exécuteurs spécialisés
 */
export class WorkflowExecutor implements IWorkflowExecutor {
  
  private stepExecutors: Map<StepType, IStepExecutor>;

  constructor(
    private productQueryService: IProductQueryService,
    private messageSender: IMessageSender
  ) {
    // Initialiser TOUS les exécuteurs
    this.stepExecutors = new Map([
      // Executors originaux
      ['PRODUCT_SELECTION', new ProductSelectionExecutor(productQueryService, messageSender)],
      ['MULTIPLE_CHOICE', new MultipleChoiceExecutor(messageSender)],
      ['QUANTITY_INPUT', new QuantityInputExecutor(messageSender)],
      ['TEXT_INPUT', new TextInputExecutor(messageSender)],
      ['VALIDATION', new ValidationExecutor(messageSender)],
      ['SUMMARY', new SummaryExecutor(messageSender)],
      
      // Executors Pizza Yolo complets
      ['PHONE_VALIDATION', new PhoneValidationExecutor(productQueryService, messageSender)],
      ['DATA_LOAD', new DataLoadExecutor(productQueryService, messageSender)],
      ['PRODUCT_DISPLAY', new ProductDisplayExecutor(productQueryService, messageSender)],
      ['INPUT_HANDLER', new CartManagementExecutor(productQueryService, messageSender)],
      ['CART_UPDATE', new CartUpdateExecutor(productQueryService, messageSender)],
      ['CALCULATION', new CalculationExecutor(productQueryService, messageSender)],
      ['DISPLAY', new DisplayExecutor(messageSender)],
      ['INPUT_PARSER', new InputParserExecutor(messageSender)],
      ['PRICING_UPDATE', new PricingUpdateExecutor(productQueryService, messageSender)],
      ['ORDER_GENERATION', new OrderGenerationExecutor(productQueryService, messageSender)],
      ['DATABASE_SAVE', new DatabaseSaveExecutor(productQueryService, messageSender)],
      ['MESSAGE_SEND', new MessageSendExecutor(messageSender)],
      ['ADDRESS_VALIDATION', new AddressValidationExecutor(productQueryService, messageSender)],
      ['PIZZA_SUPPLEMENTS', new PizzaSupplementsExecutor(productQueryService, messageSender)],
      ['PRODUCT_CONFIGURATION', new ProductConfigurationExecutor(productQueryService, messageSender)]
    ]);
  }

  /**
   * Exécuter une étape de workflow
   * SOLID - Strategy : Délègue selon le type d'étape
   */
  async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
    console.log(`⚡ [WorkflowExecutor] Exécution étape: ${step.title} (${step.stepType})`);
    
    try {
      // Récupérer l'exécuteur spécialisé
      const executor = this.stepExecutors.get(step.stepType);
      
      if (!executor) {
        console.error(`❌ [WorkflowExecutor] Aucun exécuteur pour type: ${step.stepType}`);
        return {
          success: false,
          errors: [{
            field: 'stepType',
            code: 'UNSUPPORTED_STEP_TYPE',
            message: `Type d'étape non supporté: ${step.stepType}`
          }],
          shouldUpdateSession: false
        };
      }

      // Déléguer l'exécution
      const result = await executor.execute(step, context);
      
      // Déterminer l'étape suivante si réussite
      if (result.success && !result.nextStepId) {
        result.nextStepId = await this.determineNextStep(step, result);
      }

      console.log(`✅ [WorkflowExecutor] Étape ${result.success ? 'réussie' : 'échouée'}`);
      return result;
      
    } catch (error) {
      console.error('❌ [WorkflowExecutor] Erreur exécution étape:', error);
      
      return {
        success: false,
        errors: [{
          field: 'execution',
          code: 'EXECUTION_ERROR',
          message: 'Erreur lors de l\'exécution de l\'étape'
        }],
        shouldUpdateSession: false
      };
    }
  }

  /**
   * Valider l'input utilisateur pour une étape
   * SOLID - Command Pattern : Validation encapsulée
   */
  async validateInput(input: string, step: WorkflowStep): Promise<ValidationResult> {
    console.log(`🔍 [WorkflowExecutor] Validation input: "${input}" pour étape: ${step.stepType}`);
    
    const errors: ValidationError[] = [];

    // Valider selon les règles définies
    for (const rule of step.validationRules) {
      const ruleResult = await this.validateRule(input, rule);
      if (!ruleResult.isValid) {
        errors.push(...ruleResult.errors);
      }
    }

    // Validation spécifique au type d'étape
    const executor = this.stepExecutors.get(step.stepType);
    if (executor && 'validateInput' in executor) {
      const typeValidation = await (executor as any).validateInput(input, step);
      if (!typeValidation.isValid) {
        errors.push(...typeValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      transformedValue: errors.length === 0 ? this.transformInput(input, step) : undefined
    };
  }

  /**
   * Construire l'étape suivante
   * SOLID - Builder Pattern : Construction conditionnelle
   */
  async buildNextStep(currentStep: WorkflowStep, result: StepResult): Promise<WorkflowStep | null> {
    console.log(`🔄 [WorkflowExecutor] Construction étape suivante après: ${currentStep.stepId}`);
    
    // Utiliser la logique nextStepLogic si définie
    if (currentStep.nextStepLogic) {
      return await this.evaluateNextStepLogic(currentStep.nextStepLogic, result);
    }

    // Par défaut, retourner null (fin de workflow)
    return null;
  }

  // ================================================
  // MÉTHODES PRIVÉES
  // ================================================

  private async determineNextStep(step: WorkflowStep, result: StepResult): Promise<string | undefined> {
    // Logique pour déterminer l'étape suivante
    if (step.nextStepLogic) {
      for (const condition of step.nextStepLogic.conditions) {
        if (await this.evaluateCondition(condition, result)) {
          return condition.nextStep;
        }
      }
      return step.nextStepLogic.defaultNextStep;
    }
    return undefined;
  }

  private async validateRule(input: string, rule: any): Promise<ValidationResult> {
    switch (rule.type) {
      case 'REQUIRED':
        return {
          isValid: input.trim().length > 0,
          errors: input.trim().length > 0 ? [] : [{
            field: 'input',
            code: 'REQUIRED',
            message: rule.errorMessage || 'Ce champ est requis'
          }]
        };
      
      case 'MIN_LENGTH':
        return {
          isValid: input.length >= rule.value,
          errors: input.length >= rule.value ? [] : [{
            field: 'input',
            code: 'MIN_LENGTH',
            message: rule.errorMessage || `Minimum ${rule.value} caractères requis`
          }]
        };
        
      case 'REGEX':
        const regex = new RegExp(rule.value);
        return {
          isValid: regex.test(input),
          errors: regex.test(input) ? [] : [{
            field: 'input',
            code: 'REGEX',
            message: rule.errorMessage || 'Format invalide'
          }]
        };
        
      default:
        return { isValid: true, errors: [] };
    }
  }

  private transformInput(input: string, step: WorkflowStep): any {
    // Transformation selon le type d'étape
    switch (step.stepType) {
      case 'QUANTITY_INPUT':
        return parseInt(input.trim());
      case 'MULTIPLE_CHOICE':
        return input.split(',').map(s => s.trim());
      default:
        return input.trim();
    }
  }

  private async evaluateNextStepLogic(logic: any, result: StepResult): Promise<WorkflowStep | null> {
    // TODO: Implémenter évaluation des conditions complexes
    return null;
  }

  private async evaluateCondition(condition: any, result: StepResult): Promise<boolean> {
    // TODO: Implémenter évaluation des conditions
    return false;
  }
}

// ================================================
// INTERFACES EXÉCUTEURS SPÉCIALISÉS
// ================================================

interface IStepExecutor {
  execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult>;
}

// ================================================
// EXÉCUTEUR SÉLECTION PRODUITS
// ================================================

/**
 * Exécuteur pour sélection de produits
 * SOLID - Single Responsibility : Gère uniquement la sélection de produits
 */
class ProductSelectionExecutor implements IStepExecutor {
  
  constructor(
    private productQueryService: IProductQueryService,
    private messageSender: IMessageSender
  ) {}

  async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
    console.log(`🛍️ [ProductSelection] Exécution sélection produits: ${step.title}`);
    
    try {
      // Si pas d'input utilisateur, afficher les options
      if (!context.userInput) {
        return await this.displayProductOptions(step, context);
      }

      // Traiter la sélection utilisateur
      return await this.processUserSelection(step, context);
      
    } catch (error) {
      console.error('❌ [ProductSelection] Erreur:', error);
      return {
        success: false,
        errors: [{
          field: 'execution',
          code: 'PRODUCT_SELECTION_ERROR',
          message: 'Erreur lors de la sélection de produits'
        }],
        shouldUpdateSession: false
      };
    }
  }

  private async displayProductOptions(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
    console.log(`📋 [ProductSelection] Affichage options produits`);
    
    // Récupérer les produits selon la configuration
    const products = await this.productQueryService.queryProducts(
      step.selectionConfig.productQuery!
    );

    if (products.length === 0) {
      return {
        success: false,
        errors: [{
          field: 'products',
          code: 'NO_PRODUCTS_FOUND',
          message: 'Aucun produit disponible'
        }],
        message: '❌ Aucun produit disponible pour cette sélection.',
        shouldUpdateSession: false
      };
    }

    // Construire le message d'affichage
    const message = await this.buildProductListMessage(step, products);
    
    return {
      success: true,
      data: { products, displayedAt: new Date() },
      message,
      shouldUpdateSession: true
    };
  }

  private async processUserSelection(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
    console.log(`✅ [ProductSelection] Traitement sélection: "${context.userInput}"`);
    
    // Récupérer les produits disponibles depuis le contexte de session
    const sessionData = context.session.workflowData.selectedItems[step.stepId];
    if (!sessionData?.products) {
      // Relancer l'affichage si pas de données en session
      return await this.displayProductOptions(step, context);
    }

    const products = sessionData.products;
    
    // Valider la sélection
    const validation = this.validateSelection(context.userInput, step, products);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: validation.errors.map(e => e.message).join('\n'),
        shouldUpdateSession: false
      };
    }

    // Traiter les produits sélectionnés
    const selectedProducts = this.extractSelectedProducts(
      context.userInput, 
      products, 
      step.selectionConfig.selectionType
    );

    return {
      success: true,
      data: { selectedProducts },
      message: `✅ Sélection confirmée: ${selectedProducts.map(p => p.name).join(', ')}`,
      shouldUpdateSession: true
    };
  }

  private validateSelection(input: string, step: WorkflowStep, products: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const config = step.selectionConfig;
    
    if (config.selectionType === 'SINGLE') {
      const choice = parseInt(input.trim());
      if (isNaN(choice) || choice < 1 || choice > products.length) {
        errors.push({
          field: 'selection',
          code: 'INVALID_CHOICE',
          message: `Choix invalide. Tapez un nombre entre 1 et ${products.length}.`
        });
      }
    } else {
      // Sélection multiple
      const choices = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      
      if (choices.length < config.minSelections) {
        errors.push({
          field: 'selection',
          code: 'INSUFFICIENT_SELECTIONS',
          message: `Vous devez choisir au moins ${config.minSelections} éléments.`
        });
      }
      
      if (choices.length > config.maxSelections) {
        errors.push({
          field: 'selection',
          code: 'TOO_MANY_SELECTIONS',
          message: `Vous pouvez choisir au maximum ${config.maxSelections} éléments.`
        });
      }
      
      const invalidChoices = choices.filter(c => c < 1 || c > products.length);
      if (invalidChoices.length > 0) {
        errors.push({
          field: 'selection',
          code: 'INVALID_CHOICES',
          message: `Choix invalides: ${invalidChoices.join(', ')}. Tapez des nombres entre 1 et ${products.length}.`
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  private extractSelectedProducts(input: string, products: any[], selectionType: string): any[] {
    if (selectionType === 'SINGLE') {
      const choice = parseInt(input.trim());
      return [products[choice - 1]];
    } else {
      const choices = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      return choices.map(choice => products[choice - 1]).filter(Boolean);
    }
  }

  private async buildProductListMessage(step: WorkflowStep, products: any[]): Promise<string> {
    let message = `✅ ${step.title}\n\n`;
    
    // Ajouter description si présente
    if (step.description) {
      message += `${step.description}\n\n`;
    }

    // Lister les produits
    products.forEach((product, index) => {
      const itemNumber = index + 1;
      message += `${itemNumber}️⃣ ${product.name}`;
      
      // Afficher prix si configuré
      if (step.displayConfig.showPrices && product.basePrice) {
        message += ` - ${product.basePrice}€`;
      }
      
      // Afficher composition si configuré
      if (step.displayConfig.showDescriptions && product.composition) {
        message += `\n   ${product.composition}`;
      }
      
      message += '\n\n';
    });

    // Instructions de sélection
    if (step.selectionConfig.selectionType === 'SINGLE') {
      message += `Tapez votre choix (ex: 1)\n`;
    } else {
      message += `Tapez vos ${step.selectionConfig.maxSelections} choix séparés par des virgules\n`;
      message += `Ex: 1,2\n`;
    }
    
    message += `❌ Tapez "annuler" pour arrêter`;

    return message;
  }
}

// ================================================
// AUTRES EXÉCUTEURS SPÉCIALISÉS
// ================================================

/**
 * Exécuteur pour choix multiples
 */
class MultipleChoiceExecutor implements IStepExecutor {
  constructor(private messageSender: IMessageSender) {}

  async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
    console.log(`🔢 [MultipleChoice] Exécution: ${step.title}`);
    
    if (!context.userInput) {
      // Afficher les options
      const message = this.buildChoiceMessage(step);
      return {
        success: true,
        message,
        shouldUpdateSession: true
      };
    }

    // Traiter le choix
    const choice = parseInt(context.userInput.trim());
    const options = step.selectionConfig.options || [];
    
    if (isNaN(choice) || choice < 1 || choice > options.length) {
      return {
        success: false,
        errors: [{
          field: 'choice',
          code: 'INVALID_CHOICE',
          message: `Choix invalide. Tapez un nombre entre 1 et ${options.length}.`
        }],
        shouldUpdateSession: false
      };
    }

    const selectedOption = options[choice - 1];
    
    return {
      success: true,
      data: { selectedOption },
      message: `✅ Choix confirmé: ${selectedOption.label}`,
      shouldUpdateSession: true
    };
  }

  private buildChoiceMessage(step: WorkflowStep): string {
    let message = `✅ ${step.title}\n\n`;
    
    if (step.description) {
      message += `${step.description}\n\n`;
    }

    const options = step.selectionConfig.options || [];
    options.forEach((option, index) => {
      message += `${index + 1}️⃣ ${option.label}\n`;
    });

    message += `\nTapez votre choix (1-${options.length})\n`;
    message += `❌ Tapez "annuler" pour arrêter`;

    return message;
  }
}

/**
 * Exécuteur pour saisie de quantité
 */
class QuantityInputExecutor implements IStepExecutor {
  constructor(private messageSender: IMessageSender) {}

  async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
    console.log(`🔢 [QuantityInput] Exécution: ${step.title}`);
    
    if (!context.userInput) {
      const message = `✅ ${step.title}\n\n${step.description || 'Tapez la quantité souhaitée'}\n❌ Tapez "annuler" pour arrêter`;
      return {
        success: true,
        message,
        shouldUpdateSession: true
      };
    }

    const quantity = parseInt(context.userInput.trim());
    
    if (isNaN(quantity) || quantity < 1) {
      return {
        success: false,
        errors: [{
          field: 'quantity',
          code: 'INVALID_QUANTITY',
          message: 'Quantité invalide. Tapez un nombre positif.'
        }],
        shouldUpdateSession: false
      };
    }

    return {
      success: true,
      data: { quantity },
      message: `✅ Quantité confirmée: ${quantity}`,
      shouldUpdateSession: true
    };
  }
}

/**
 * Exécuteur pour saisie de texte
 */
class TextInputExecutor implements IStepExecutor {
  constructor(private messageSender: IMessageSender) {}

  async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
    console.log(`📝 [TextInput] Exécution: ${step.title}`);
    
    if (!context.userInput) {
      const message = `✅ ${step.title}\n\n${step.description || 'Tapez votre texte'}\n❌ Tapez "annuler" pour arrêter`;
      return {
        success: true,
        message,
        shouldUpdateSession: true
      };
    }

    return {
      success: true,
      data: { text: context.userInput.trim() },
      message: `✅ Texte enregistré: ${context.userInput.trim()}`,
      shouldUpdateSession: true
    };
  }
}

/**
 * Exécuteur pour validation
 */
class ValidationExecutor implements IStepExecutor {
  constructor(private messageSender: IMessageSender) {}

  async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
    console.log(`✔️ [Validation] Exécution: ${step.title}`);
    
    // TODO: Implémenter logique de validation
    return {
      success: true,
      message: `✅ ${step.title}`,
      shouldUpdateSession: true
    };
  }
}

/**
 * Exécuteur pour résumé
 */
class SummaryExecutor implements IStepExecutor {
  constructor(private messageSender: IMessageSender) {}

  async execute(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
    console.log(`📋 [Summary] Exécution: ${step.title}`);
    
    // TODO: Implémenter génération de résumé
    const message = `📋 ${step.title}\n\nRésumé de votre commande:\n[TODO: Générer résumé]`;
    
    return {
      success: true,
      message,
      shouldUpdateSession: true
    };
  }
}