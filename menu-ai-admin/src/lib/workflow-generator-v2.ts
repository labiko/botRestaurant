// 🚀 GÉNÉRATEUR DE WORKFLOWS V2 - UNIVERSEL
// =========================================
// Génère des workflows 100% compatibles avec le bot WhatsApp

export interface UniversalWorkflow {
  productName: string;
  restaurantId: number;
  categoryId: number;
  basePrice: number;
  steps: WorkflowStep[];
  optionGroups: Record<string, OptionItem[]>;
}

export interface WorkflowStep {
  step: number;
  type: 'options_selection';
  prompt: string;
  option_groups: string[];
  required: boolean;
  max_selections: number;
  bot_behavior?: {
    show_zero_option: boolean;
    zero_option_text?: string;
  };
}

export interface OptionItem {
  name: string;
  price_modifier: number;
  display_order: number;
  emoji?: string;
  description?: string;
}

export class WorkflowGeneratorV2 {

  /**
   * Génère le SQL complet pour un workflow universel
   */
  static generateCompleteSQL(workflow: UniversalWorkflow): string {
    const {
      productName,
      restaurantId,
      categoryId,
      basePrice,
      steps,
      optionGroups
    } = workflow;

    const slug = this.generateSlug(productName);
    const deliveryPrice = basePrice + 1; // Toujours +1€ en livraison

    // Construire la configuration des steps
    const stepsConfig = {
      steps: steps.map(step => ({
        step: step.step,
        type: step.type,
        prompt: step.prompt,
        option_groups: step.option_groups,
        required: step.required,
        max_selections: step.max_selections
      }))
    };

    let sql = `-- =========================================
-- WORKFLOW UNIVERSEL : ${productName}
-- =========================================
-- Généré le: ${new Date().toLocaleDateString('fr-FR')}
-- Restaurant ID: ${restaurantId}
-- ⚠️ CE WORKFLOW EST 100% COMPATIBLE AVEC LE BOT

BEGIN;

-- =========================================
-- 1. CRÉATION DU PRODUIT COMPOSITE
-- =========================================
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
  '${slug}',
  'Produit avec workflow personnalisé',
  ${basePrice.toFixed(2)},
  ${deliveryPrice.toFixed(2)},
  'composite_workflow',
  true,
  '${JSON.stringify(stepsConfig).replace(/'/g, "''")}'::jsonb,
  true,
  (SELECT COALESCE(MAX(display_order), 0) + 1 FROM france_products WHERE category_id = ${categoryId})
) RETURNING id AS new_product_id;

-- =========================================
-- 2. CRÉATION DES OPTIONS POUR CHAQUE GROUPE
-- =========================================
`;

    // Générer les inserts pour chaque groupe d'options
    Object.entries(optionGroups).forEach(([groupName, options]) => {
      sql += `\n-- Groupe: ${groupName}\n`;

      // Déterminer si c'est un step optionnel
      const isOptional = steps.some(s =>
        s.option_groups.includes(groupName) && !s.required
      );

      // Si optionnel, ajouter l'option "0" pour le bot
      if (isOptional) {
        sql += `-- ⚠️ Step optionnel : Option 0 sera gérée par le bot\n`;
      }

      options.forEach(option => {
        sql += `INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order
) VALUES (
  (SELECT id FROM france_products WHERE slug = '${slug}' AND restaurant_id = ${restaurantId}),
  '${groupName.replace(/'/g, "''")}',
  '${option.name.replace(/'/g, "''")}',
  ${option.price_modifier.toFixed(2)},
  ${option.display_order}
);

`;
      });
    });

    sql += `-- =========================================
-- 3. VÉRIFICATIONS
-- =========================================
-- Vérifier le produit créé
SELECT
  p.id,
  p.name,
  p.workflow_type,
  p.base_price,
  p.delivery_price,
  jsonb_pretty(p.steps_config) as steps_config
FROM france_products p
WHERE p.slug = '${slug}' AND p.restaurant_id = ${restaurantId};

-- Vérifier les options créées
SELECT
  po.option_group,
  COUNT(*) as nb_options,
  STRING_AGG(po.option_name || ' (+' || po.price_modifier || '€)', ', ') as options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.slug = '${slug}' AND p.restaurant_id = ${restaurantId}
GROUP BY po.option_group
ORDER BY po.option_group;

-- =========================================
-- 4. TEST DU WORKFLOW DANS LE BOT
-- =========================================
-- 🤖 COMPORTEMENT ATTENDU DANS LE BOT:
`;

    // Générer la simulation du comportement bot
    steps.forEach(step => {
      sql += `\n-- Step ${step.step}: ${step.prompt}\n`;
      if (step.required) {
        sql += `-- ✅ OBLIGATOIRE - Le bot force le choix\n`;
        sql += `-- Message bot: "${step.prompt}"\n`;
        sql += `-- Options: Liste numérotée des ${step.option_groups[0]}\n`;
        sql += `-- Format réponse: ${step.max_selections > 1 ? 'Ex: "1,2,3"' : 'Ex: "2"'}\n`;
      } else {
        sql += `-- ⚠️ OPTIONNEL - Le bot affiche "0️⃣ pour passer"\n`;
        sql += `-- Message bot: "${step.prompt}"\n`;
        sql += `-- Options: 0️⃣ Passer + Liste des ${step.option_groups[0]}\n`;
        sql += `-- Format réponse: "0" ou ${step.max_selections > 1 ? '"1,2,3"' : '"2"'}\n`;
      }
    });

    sql += `\n-- =========================================
-- COMMIT ou ROLLBACK
-- =========================================
COMMIT;
-- En cas d'erreur : ROLLBACK;

-- =========================================
-- 📝 NOTES IMPORTANTES
-- =========================================
-- 1. Prix livraison = Prix base + 1€ (automatique)
-- 2. Steps avec required:false → Bot affiche option 0
-- 3. max_selections > 1 → Format "1,2,3" accepté
-- 4. Testez TOUJOURS dans le bot après insertion
-- =========================================`;

    return sql;
  }

  /**
   * Valide qu'un workflow est compatible avec le bot
   */
  static validateForBot(workflow: UniversalWorkflow): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifier que chaque groupe référencé a des options
    workflow.steps.forEach(step => {
      step.option_groups.forEach(groupName => {
        if (!workflow.optionGroups[groupName]) {
          errors.push(`❌ Step ${step.step}: Groupe "${groupName}" n'a pas d'options définies`);
        } else if (workflow.optionGroups[groupName].length === 0) {
          errors.push(`❌ Step ${step.step}: Groupe "${groupName}" est vide`);
        }
      });

      // Vérifications spécifiques
      if (step.max_selections < 1) {
        errors.push(`❌ Step ${step.step}: max_selections doit être >= 1`);
      }

      if (!step.required && step.max_selections > 1) {
        warnings.push(`⚠️ Step ${step.step}: Optionnel avec choix multiples - Vérifiez le comportement bot`);
      }
    });

    // Vérifier les prix
    if (workflow.basePrice < 0) {
      errors.push('❌ Le prix de base ne peut pas être négatif');
    }

    // Vérifier l'ordre des steps
    const stepNumbers = workflow.steps.map(s => s.step).sort((a, b) => a - b);
    for (let i = 0; i < stepNumbers.length; i++) {
      if (stepNumbers[i] !== i + 1) {
        errors.push(`❌ Les steps doivent être séquentiels (1, 2, 3...). Manquant: Step ${i + 1}`);
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Génère un slug URL-friendly
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Simule l'exécution du workflow dans le bot
   */
  static simulateBotFlow(workflow: UniversalWorkflow): string {
    let simulation = '🤖 SIMULATION DU PARCOURS BOT\n';
    simulation += '================================\n\n';

    workflow.steps.forEach((step, index) => {
      simulation += `📱 ÉTAPE ${step.step}/${workflow.steps.length}\n`;
      simulation += `Message: "${step.prompt}"\n\n`;

      const groupName = step.option_groups[0];
      const options = workflow.optionGroups[groupName] || [];

      if (!step.required) {
        simulation += `0️⃣ Passer cette étape\n`;
      }

      options.forEach((opt, i) => {
        const emoji = opt.emoji || (i + 1) + '️⃣';
        const price = opt.price_modifier > 0 ? ` (+${opt.price_modifier}€)` : '';
        simulation += `${emoji} ${opt.name}${price}\n`;
      });

      simulation += '\n';
      if (step.max_selections > 1) {
        simulation += `➡️ Réponse possible: "1,2,3" (max ${step.max_selections})\n`;
      } else {
        simulation += `➡️ Réponse possible: "2" (choix unique)\n`;
      }

      if (!step.required) {
        simulation += `➡️ Ou tapez "0" pour passer\n`;
      }

      simulation += '\n---\n\n';
    });

    simulation += '✅ FIN DU WORKFLOW\n';
    simulation += 'Récapitulatif et paiement\n';

    return simulation;
  }
}

export default WorkflowGeneratorV2;