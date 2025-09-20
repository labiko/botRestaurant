// 🔧 PROCESSEUR DE TEMPLATES WORKFLOWS
// ====================================
// Convertit les templates JSON manuels en SQL pour la base de données

import workflowTemplates from './workflow-templates.json';

export interface WorkflowTemplate {
  meta: {
    name: string;
    description: string;
    use_case?: string;
    version?: string;
    created_at?: string;
  };
  workflow_config: {
    workflow_type: string;
    requires_steps: boolean;
    steps: WorkflowStep[];
  };
  placeholders?: Record<string, string>;
}

export interface WorkflowStep {
  step: number;
  type: string;
  prompt: string;
  option_groups: string[];
  required: boolean;
  max_selections: number;
  description?: string;
}

export interface ProcessedWorkflow {
  productName: string;
  restaurantId: number;
  basePrice: number;
  deliveryPrice: number;
  categoryId: number;
  workflowConfig: any;
  compositeItems?: CompositeItem[];
}

export interface CompositeItem {
  optionGroup: string;
  options: Array<{
    name: string;
    priceModifier: number;
    displayOrder: number;
  }>;
}

export class TemplateProcessor {

  /**
   * Récupère tous les templates disponibles
   */
  static getAvailableTemplates(): Record<string, WorkflowTemplate> {
    return {
      base: workflowTemplates.base_template as WorkflowTemplate,
      ...workflowTemplates.preset_templates as Record<string, WorkflowTemplate>
    };
  }

  /**
   * Récupère la bibliothèque de composants modulaires
   */
  static getModularComponents() {
    return workflowTemplates.modular_components;
  }

  /**
   * Traite un template avec des valeurs personnalisées
   */
  static processTemplate(
    templateKey: string,
    customValues: Record<string, any>,
    productInfo: {
      name: string;
      restaurantId: number;
      basePrice: number;
      categoryId: number;
    }
  ): ProcessedWorkflow {
    const templates = this.getAvailableTemplates();
    const template = templates[templateKey];

    if (!template) {
      throw new Error(`Template '${templateKey}' introuvable`);
    }

    // Cloner le template pour éviter les modifications
    const processedTemplate = JSON.parse(JSON.stringify(template));

    // Remplacer les placeholders si c'est le template de base
    if (templateKey === 'base' && template.placeholders && customValues.placeholders) {
      this.replacePlaceholders(processedTemplate, customValues.placeholders);
    }

    // Appliquer les modifications personnalisées
    if (customValues.steps) {
      processedTemplate.workflow_config.steps = customValues.steps;
    }

    // Calculer le prix de livraison (+1€)
    const deliveryPrice = productInfo.basePrice + 1;

    return {
      productName: productInfo.name,
      restaurantId: productInfo.restaurantId,
      basePrice: productInfo.basePrice,
      deliveryPrice: deliveryPrice,
      categoryId: productInfo.categoryId,
      workflowConfig: processedTemplate.workflow_config,
      compositeItems: customValues.compositeItems || []
    };
  }

  /**
   * Remplace les placeholders dans un template
   */
  private static replacePlaceholders(
    template: WorkflowTemplate,
    placeholders: Record<string, string>
  ): void {
    const replaceInString = (str: string): string => {
      let result = str;
      for (const [placeholder, value] of Object.entries(placeholders)) {
        result = result.replace(new RegExp(`\\[${placeholder}\\]`, 'g'), value);
      }
      return result;
    };

    // Remplacer dans les steps
    template.workflow_config.steps.forEach(step => {
      step.prompt = replaceInString(step.prompt);
      step.option_groups = step.option_groups.map(group => replaceInString(group));
    });
  }

  /**
   * Génère le SQL pour insérer le workflow en base
   */
  static generateSQL(processedWorkflow: ProcessedWorkflow): string {
    const {
      productName,
      restaurantId,
      basePrice,
      deliveryPrice,
      categoryId,
      workflowConfig,
      compositeItems
    } = processedWorkflow;

    const productSlug = this.generateSlug(productName);
    const stepsConfigJSON = JSON.stringify(workflowConfig, null, 2);

    let sql = `-- 🔧 WORKFLOW GÉNÉRÉ À PARTIR DU TEMPLATE
-- ==========================================
-- Produit: ${productName}
-- Restaurant ID: ${restaurantId}
-- Template utilisé: ${workflowConfig.workflow_type}

BEGIN;

-- 1. Insérer le produit principal
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  slug,
  description,
  base_price,
  delivery_price,
  workflow_type,
  requires_steps,
  steps_config,
  is_available,
  display_order
) VALUES (
  ${restaurantId},
  ${categoryId},
  '${productName.replace(/'/g, "''")}',
  '${productSlug}',
  'Produit avec workflow personnalisé généré depuis template',
  ${basePrice},
  ${deliveryPrice},
  '${workflowConfig.workflow_type}',
  ${workflowConfig.requires_steps},
  '${stepsConfigJSON.replace(/'/g, "''")}'::jsonb,
  true,
  (SELECT COALESCE(MAX(display_order), 0) + 1 FROM france_products WHERE category_id = ${categoryId})
);

`;

    // Ajouter les composite_items si fournis
    if (compositeItems && compositeItems.length > 0) {
      sql += `-- 2. Insérer les options pour chaque groupe\n`;

      compositeItems.forEach(item => {
        sql += `\n-- Groupe: ${item.optionGroup}\n`;
        item.options.forEach(option => {
          sql += `INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order
) VALUES (
  (SELECT id FROM france_products WHERE slug = '${productSlug}' AND restaurant_id = ${restaurantId}),
  '${item.optionGroup.replace(/'/g, "''")}',
  '${option.name.replace(/'/g, "''")}',
  ${option.priceModifier},
  ${option.displayOrder}
);

`;
        });
      });
    }

    sql += `-- 3. Vérifications
SELECT
  p.id,
  p.name,
  p.workflow_type,
  p.requires_steps,
  COUNT(po.id) as nb_options
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id
WHERE p.slug = '${productSlug}' AND p.restaurant_id = ${restaurantId}
GROUP BY p.id, p.name, p.workflow_type, p.requires_steps;

COMMIT;
-- En cas de problème: ROLLBACK;`;

    return sql;
  }

  /**
   * Génère un slug à partir du nom du produit
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces, tirets
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Supprimer tirets multiples
      .replace(/^-|-$/g, ''); // Supprimer tirets en début/fin
  }

  /**
   * Valide la structure d'un template
   */
  static validateTemplate(template: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.workflow_config) {
      errors.push('Propriété workflow_config manquante');
      return { valid: false, errors };
    }

    if (!template.workflow_config.steps || !Array.isArray(template.workflow_config.steps)) {
      errors.push('Propriété steps manquante ou invalide');
      return { valid: false, errors };
    }

    // Vérifier chaque step
    template.workflow_config.steps.forEach((step: any, index: number) => {
      if (typeof step.step !== 'number') {
        errors.push(`Step ${index + 1}: numéro de step manquant ou invalide`);
      }
      if (!step.type) {
        errors.push(`Step ${index + 1}: type manquant`);
      }
      if (!step.prompt) {
        errors.push(`Step ${index + 1}: prompt manquant`);
      }
      if (!step.option_groups || !Array.isArray(step.option_groups)) {
        errors.push(`Step ${index + 1}: option_groups manquant ou invalide`);
      }
      if (typeof step.required !== 'boolean') {
        errors.push(`Step ${index + 1}: propriété required manquante ou invalide`);
      }
      if (typeof step.max_selections !== 'number') {
        errors.push(`Step ${index + 1}: max_selections manquant ou invalide`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Crée un nouveau template à partir de composants modulaires
   */
  static createCustomTemplate(
    name: string,
    description: string,
    stepComponents: string[]
  ): WorkflowTemplate {
    const components = this.getModularComponents();
    const steps: WorkflowStep[] = [];

    stepComponents.forEach((componentKey, index) => {
      const component = components.steps_library[componentKey];
      if (component) {
        steps.push({
          step: index + 1,
          ...component
        });
      }
    });

    return {
      meta: {
        name,
        description,
        use_case: 'Template personnalisé',
        version: '1.0',
        created_at: new Date().toISOString().split('T')[0]
      },
      workflow_config: {
        workflow_type: 'composite_workflow',
        requires_steps: true,
        steps
      }
    };
  }
}

export default TemplateProcessor;