// Service d'analyse IA pour auto-détection des types de produits et workflows
import { ExtractedProduct } from '../interfaces/ocr-provider.interface';
import { WorkflowSuggestion, CategoryMapping, ProductAnalysisResult } from '../interfaces/ocr-smart-configure.interface';
import { WorkflowStep, OptionItem } from '@/lib/workflow-generator-v2';

export class ProductAnalysisAIService {

  /**
   * Détecte automatiquement le type de produit basé sur sa description/composition
   */
  static detectProductType(product: ExtractedProduct): 'simple' | 'modular' | 'variant' | 'composite' {
    const description = (product.description || '').toLowerCase();
    const name = product.name.toLowerCase();

    // Patterns pour type composite (menus avec plusieurs éléments)
    const compositePatterns = [
      /menu/i, /formule/i, /\+.*\+/i, /avec.*et/i, /comprend/i
    ];

    // Patterns pour type modular (choix/options/tailles)
    const modularPatterns = [
      /taille/i, /petit|moyen|grand/i, /choix/i, /option/i, /avec.*ou/i,
      /base/i, /sauce/i, /supplément/i, /extra/i
    ];

    // Patterns pour type variant (portions multiples)
    const variantPatterns = [
      /\d+\s*(pièces?|pc)/i, /portion/i, /\d+\s*x/i, /lot/i
    ];

    if (compositePatterns.some(pattern => pattern.test(name) || pattern.test(description))) {
      return 'composite';
    }

    if (modularPatterns.some(pattern => pattern.test(name) || pattern.test(description))) {
      return 'modular';
    }

    if (variantPatterns.some(pattern => pattern.test(name) || pattern.test(description))) {
      return 'variant';
    }

    return 'simple';
  }

  /**
   * Suggère un workflow basé sur le type de produit détecté
   */
  static suggestWorkflow(product: ExtractedProduct, productType: 'simple' | 'modular' | 'variant' | 'composite'): WorkflowSuggestion {
    const name = product.name.toLowerCase();

    switch (productType) {
      case 'simple':
        return this.generateSimpleWorkflow(product);

      case 'modular':
        if (name.includes('pizza')) {
          return this.generatePizzaWorkflow(product);
        } else if (name.includes('burger') || name.includes('sandwich')) {
          return this.generateBurgerWorkflow(product);
        } else if (name.includes('tacos')) {
          return this.generateTacosWorkflow(product);
        }
        return this.generateGenericModularWorkflow(product);

      case 'composite':
        return this.generateCompositeWorkflow(product);

      case 'variant':
        return this.generateVariantWorkflow(product);

      default:
        return this.generateSimpleWorkflow(product);
    }
  }

  private static generateSimpleWorkflow(product: ExtractedProduct): WorkflowSuggestion {
    return {
      productType: 'simple',
      confidence: 0.9,
      steps: [],
      optionGroups: {},
      reasoning: `Produit simple "${product.name}" sans options complexes détectées`
    };
  }

  private static generatePizzaWorkflow(product: ExtractedProduct): WorkflowSuggestion {
    const steps: WorkflowStep[] = [
      {
        step: 1,
        type: 'options_selection',
        prompt: 'Choisissez la taille de votre pizza',
        option_groups: ['Tailles pizza'],
        required: true,
        max_selections: 1
      },
      {
        step: 2,
        type: 'options_selection',
        prompt: 'Choisissez votre base',
        option_groups: ['Bases pizza'],
        required: true,
        max_selections: 1
      },
      {
        step: 3,
        type: 'options_selection',
        prompt: 'Ajoutez des garnitures supplémentaires (optionnel)',
        option_groups: ['Garnitures extra'],
        required: false,
        max_selections: 5
      }
    ];

    const optionGroups: Record<string, OptionItem[]> = {
      'Tailles pizza': [
        { name: 'Petite 26cm', price_modifier: -2, display_order: 1, emoji: '🍕' },
        { name: 'Moyenne 33cm', price_modifier: 0, display_order: 2, emoji: '🍕' },
        { name: 'Grande 40cm', price_modifier: 3, display_order: 3, emoji: '🍕' }
      ],
      'Bases pizza': [
        { name: 'Base tomate classique', price_modifier: 0, display_order: 1, emoji: '🍅' },
        { name: 'Base crème fraîche', price_modifier: 0, display_order: 2, emoji: '🥛' },
        { name: 'Sans base', price_modifier: -1, display_order: 3, emoji: '❌' }
      ],
      'Garnitures extra': [
        { name: 'Fromage extra', price_modifier: 1.5, display_order: 1, emoji: '🧀' },
        { name: 'Champignons', price_modifier: 1, display_order: 2, emoji: '🍄' },
        { name: 'Jambon', price_modifier: 2, display_order: 3, emoji: '🍖' },
        { name: 'Olives', price_modifier: 1, display_order: 4, emoji: '🫒' }
      ]
    };

    return {
      productType: 'modular',
      confidence: 0.85,
      steps,
      optionGroups,
      reasoning: `Pizza détectée - workflow avec tailles, bases et garnitures suggéré`
    };
  }

  private static generateBurgerWorkflow(product: ExtractedProduct): WorkflowSuggestion {
    const steps: WorkflowStep[] = [
      {
        step: 1,
        type: 'options_selection',
        prompt: 'Choisissez la taille de votre burger',
        option_groups: ['Tailles burger'],
        required: true,
        max_selections: 1
      },
      {
        step: 2,
        type: 'options_selection',
        prompt: 'Ajoutez des suppléments (optionnel)',
        option_groups: ['Suppléments burger'],
        required: false,
        max_selections: 3
      }
    ];

    const optionGroups: Record<string, OptionItem[]> = {
      'Tailles burger': [
        { name: 'Simple', price_modifier: 0, display_order: 1, emoji: '🍔' },
        { name: 'Double viande', price_modifier: 3, display_order: 2, emoji: '🍔' },
        { name: 'Triple viande', price_modifier: 5, display_order: 3, emoji: '🍔' }
      ],
      'Suppléments burger': [
        { name: 'Fromage', price_modifier: 1, display_order: 1, emoji: '🧀' },
        { name: 'Bacon', price_modifier: 2, display_order: 2, emoji: '🥓' },
        { name: 'Sauce extra', price_modifier: 0.5, display_order: 3, emoji: '🍯' }
      ]
    };

    return {
      productType: 'modular',
      confidence: 0.8,
      steps,
      optionGroups,
      reasoning: `Burger détecté - workflow avec tailles et suppléments suggéré`
    };
  }

  private static generateTacosWorkflow(product: ExtractedProduct): WorkflowSuggestion {
    const steps: WorkflowStep[] = [
      {
        step: 1,
        type: 'options_selection',
        prompt: 'Choisissez la taille',
        option_groups: ['Tailles tacos'],
        required: true,
        max_selections: 1
      },
      {
        step: 2,
        type: 'options_selection',
        prompt: 'Choisissez vos viandes (max 2)',
        option_groups: ['Viandes tacos'],
        required: true,
        max_selections: 2
      },
      {
        step: 3,
        type: 'options_selection',
        prompt: 'Choisissez vos sauces (max 2)',
        option_groups: ['Sauces tacos'],
        required: true,
        max_selections: 2
      }
    ];

    const optionGroups: Record<string, OptionItem[]> = {
      'Tailles tacos': [
        { name: 'M', price_modifier: 0, display_order: 1, emoji: '🌮' },
        { name: 'L', price_modifier: 2, display_order: 2, emoji: '🌮' },
        { name: 'XL', price_modifier: 4, display_order: 3, emoji: '🌮' }
      ],
      'Viandes tacos': [
        { name: 'Poulet', price_modifier: 0, display_order: 1, emoji: '🐔' },
        { name: 'Bœuf', price_modifier: 1, display_order: 2, emoji: '🥩' },
        { name: 'Mixte', price_modifier: 1.5, display_order: 3, emoji: '🥩' }
      ],
      'Sauces tacos': [
        { name: 'Blanche', price_modifier: 0, display_order: 1, emoji: '🥛' },
        { name: 'Harissa', price_modifier: 0, display_order: 2, emoji: '🌶️' },
        { name: 'Samouraï', price_modifier: 0, display_order: 3, emoji: '🍯' }
      ]
    };

    return {
      productType: 'modular',
      confidence: 0.85,
      steps,
      optionGroups,
      reasoning: `Tacos détecté - workflow avec tailles, viandes et sauces suggéré`
    };
  }

  private static generateGenericModularWorkflow(product: ExtractedProduct): WorkflowSuggestion {
    const steps: WorkflowStep[] = [
      {
        step: 1,
        type: 'options_selection',
        prompt: 'Choisissez votre option',
        option_groups: ['Options principales'],
        required: true,
        max_selections: 1
      },
      {
        step: 2,
        type: 'options_selection',
        prompt: 'Ajoutez des suppléments (optionnel)',
        option_groups: ['Suppléments'],
        required: false,
        max_selections: 3
      }
    ];

    const optionGroups: Record<string, OptionItem[]> = {
      'Options principales': [
        { name: 'Standard', price_modifier: 0, display_order: 1, emoji: '✅' },
        { name: 'Premium', price_modifier: 2, display_order: 2, emoji: '⭐' }
      ],
      'Suppléments': [
        { name: 'Supplément 1', price_modifier: 1, display_order: 1, emoji: '➕' },
        { name: 'Supplément 2', price_modifier: 1.5, display_order: 2, emoji: '➕' }
      ]
    };

    return {
      productType: 'modular',
      confidence: 0.6,
      steps,
      optionGroups,
      reasoning: `Produit modulaire générique - workflow basique avec options suggéré`
    };
  }

  private static generateCompositeWorkflow(product: ExtractedProduct): WorkflowSuggestion {
    const steps: WorkflowStep[] = [
      {
        step: 1,
        type: 'options_selection',
        prompt: 'Choisissez votre entrée',
        option_groups: ['Entrées'],
        required: false,
        max_selections: 1
      },
      {
        step: 2,
        type: 'options_selection',
        prompt: 'Choisissez votre plat principal',
        option_groups: ['Plats principaux'],
        required: true,
        max_selections: 1
      },
      {
        step: 3,
        type: 'options_selection',
        prompt: 'Choisissez votre boisson',
        option_groups: ['Boissons'],
        required: true,
        max_selections: 1
      }
    ];

    const optionGroups: Record<string, OptionItem[]> = {
      'Entrées': [
        { name: 'Salade', price_modifier: 0, display_order: 1, emoji: '🥗' },
        { name: 'Soupe', price_modifier: 1, display_order: 2, emoji: '🍲' }
      ],
      'Plats principaux': [
        { name: 'Plat 1', price_modifier: 0, display_order: 1, emoji: '🍽️' },
        { name: 'Plat 2', price_modifier: 2, display_order: 2, emoji: '🍽️' }
      ],
      'Boissons': [
        { name: 'Coca', price_modifier: 0, display_order: 1, emoji: '🥤' },
        { name: 'Eau', price_modifier: -0.5, display_order: 2, emoji: '💧' }
      ]
    };

    return {
      productType: 'composite',
      confidence: 0.75,
      steps,
      optionGroups,
      reasoning: `Menu composite détecté - workflow avec entrée, plat et boisson suggéré`
    };
  }

  private static generateVariantWorkflow(product: ExtractedProduct): WorkflowSuggestion {
    return {
      productType: 'variant',
      confidence: 0.8,
      steps: [],
      optionGroups: {},
      reasoning: `Produit à variantes détecté - les variantes seront configurées séparément`
    };
  }

  /**
   * Trouve la meilleure catégorie correspondante dans les 22 catégories Pizza Yolo 77
   */
  static suggestCategory(product: ExtractedProduct): CategoryMapping {
    const name = product.name.toLowerCase();
    const description = (product.description || '').toLowerCase();

    // Mapping basé sur les 22 catégories Pizza Yolo 77
    const categoryMappings = [
      { patterns: [/tacos/i], id: 1, name: 'TACOS', icon: '🌮' },
      { patterns: [/pizza/i], id: 10, name: 'Pizzas', icon: '🍕' },
      { patterns: [/burger/i], id: 2, name: 'BURGERS', icon: '🍔' },
      { patterns: [/menu.*pizza/i], id: 11, name: 'Menu Pizza', icon: '📋' },
      { patterns: [/menu.*midi/i, /plat.*dessert.*boisson/i], id: 38, name: 'MENU MIDI : PLAT + DESSERT + BOISSON', icon: '🍽️' },
      { patterns: [/sandwich/i, /panini/i], id: 3, name: 'SANDWICHS', icon: '🥪' },
      { patterns: [/gourmet/i], id: 4, name: 'GOURMETS', icon: '🥘' },
      { patterns: [/smash/i], id: 5, name: 'SMASHS', icon: '🥩' },
      { patterns: [/assiette/i], id: 6, name: 'ASSIETTES', icon: '🍽️' },
      { patterns: [/naan/i], id: 7, name: 'NAANS', icon: '🫓' },
      { patterns: [/poulet/i, /chicken/i, /nuggets/i, /wings/i], id: 8, name: 'POULET & SNACKS', icon: '🍗' },
      { patterns: [/ice.*cream/i, /glace/i], id: 12, name: 'ICE CREAM', icon: '🍨' },
      { patterns: [/dessert/i, /gâteau/i, /pâtisserie/i], id: 13, name: 'DESSERTS', icon: '🧁' },
      { patterns: [/boisson/i, /drink/i, /coca/i, /jus/i], id: 14, name: 'BOISSONS', icon: '🥤' },
      { patterns: [/salade/i], id: 15, name: 'SALADES', icon: '🥗' },
      { patterns: [/tex.*mex/i, /mexican/i], id: 16, name: 'TEX-MEX', icon: '🌮' },
      { patterns: [/pâtes/i, /spaghetti/i, /pasta/i], id: 18, name: 'PÂTES', icon: '🍝' },
      { patterns: [/enfant/i, /kids/i], id: 19, name: 'MENU ENFANT', icon: '🍽️' },
      { patterns: [/bowl/i], id: 21, name: 'BOWLS', icon: '🍽️' },
      { patterns: [/chicken.*box/i], id: 22, name: 'CHICKEN BOX', icon: '🍽️' },
      { patterns: [/family/i, /familial/i], id: 26, name: 'MENU FAMILY', icon: '👨‍👩‍👧‍👦' }
    ];

    for (const mapping of categoryMappings) {
      if (mapping.patterns.some(pattern => pattern.test(name) || pattern.test(description))) {
        return {
          suggestedCategoryId: mapping.id,
          suggestedCategoryName: mapping.name,
          confidence: 0.8,
          icon: mapping.icon
        };
      }
    }

    // Par défaut: Catégorie générique
    return {
      suggestedCategoryId: 4, // GOURMETS
      suggestedCategoryName: 'GOURMETS',
      confidence: 0.3,
      icon: '🥘'
    };
  }

  /**
   * Analyse complète d'un produit
   */
  static analyzeProduct(product: ExtractedProduct): ProductAnalysisResult {
    const detectedType = this.detectProductType(product);
    const workflowSuggestion = this.suggestWorkflow(product, detectedType);
    const categoryMapping = this.suggestCategory(product);

    // Calcul automatique prix livraison (+1€)
    const onSitePrice = product.price || 0;
    const deliveryPrice = onSitePrice + 1;

    return {
      product,
      detectedType,
      workflowSuggestion,
      categoryMapping,
      pricingSuggestion: {
        onSitePrice,
        deliveryPrice,
        confidence: product.price ? 0.9 : 0.5
      }
    };
  }
}