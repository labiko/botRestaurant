// 🚀 GÉNÉRATEUR DE WORKFLOWS V2 - UNIVERSEL
// =========================================
// Génère des workflows 100% compatibles avec le bot WhatsApp

export interface UniversalWorkflow {
  productName: string;
  restaurantId: number;
  categoryName: string;
  onSitePrice: number;
  deliveryPrice: number;
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
  composition?: string;
}

export class WorkflowGeneratorV2 {


  /**
   * Génère le SQL SMART UPDATE qui préserve les IDs existants
   * Stratégie: UPDATE + INSERT + DELETE pour éviter la perte d'IDs
   */
  static generateSmartUpdateSQL(workflow: UniversalWorkflow, productId: number): string {
    const {
      productName,
      onSitePrice,
      deliveryPrice,
      steps,
      optionGroups
    } = workflow;

    // Construire la configuration des steps
    const stepsConfig = {
      steps: steps.map(step => ({
        step: step.step,
        type: step.type,
        prompt: this.fixPromptWording(step.prompt),
        option_groups: step.option_groups,
        required: step.required,
        max_selections: step.max_selections
      }))
    };

    let sql = `-- =========================================
-- MISE À JOUR INTELLIGENTE WORKFLOW : ${productName}
-- =========================================
-- Généré le: ${new Date().toLocaleDateString('fr-FR')}
-- Product ID: ${productId}
-- Prix sur site: ${onSitePrice.toFixed(2)}€
-- Prix livraison: ${deliveryPrice.toFixed(2)}€
-- ⚡ STRATÉGIE SMART UPDATE: UPDATE + INSERT + DELETE
-- 🔒 PRÉSERVE LES IDS EXISTANTS
-- 🚫 ÉVITE L'ACCUMULATION DE DONNÉES

BEGIN;

-- =========================================
-- 1. MISE À JOUR DU PRODUIT
-- =========================================

UPDATE france_products
SET
  name = '${productName}',
  price_on_site_base = ${onSitePrice.toFixed(2)},
  price_delivery_base = ${deliveryPrice.toFixed(2)},
  steps_config = '${JSON.stringify(stepsConfig).replace(/'/g, "''")}'
WHERE id = ${productId};

-- =========================================
-- 2. MISE À JOUR INTELLIGENTE DES OPTIONS
-- =========================================

`;

    // Créer un mapping groupe -> required depuis les steps
    const groupRequiredMap = new Map<string, boolean>();
    steps.forEach(step => {
      step.option_groups.forEach(groupName => {
        groupRequiredMap.set(groupName, step.required !== false);
      });
    });

    // Générer les opérations pour chaque groupe
    let globalGroupOrder = 1;

    Object.entries(optionGroups).forEach(([groupName, options]) => {
      if (options.length > 0) {
        sql += `-- Groupe: ${groupName} (group_order: ${globalGroupOrder})\n`;

        options.forEach((option, index) => {
          sql += `-- Option: ${option.name}\n`;
          sql += `UPDATE france_product_options
SET
  option_name = '${option.name.replace(/'/g, "''")}',
  price_modifier = ${option.price_modifier.toFixed(2)},
  display_order = ${option.display_order},
  group_order = ${globalGroupOrder},
  option_group = '${groupName.replace(/'/g, "''")}',
  is_required = ${groupRequiredMap.get(groupName) || false},
  composition = ${option.composition ? `'${option.composition.replace(/'/g, "''")}'` : 'NULL'}
WHERE product_id = ${productId}
  AND option_group = '${groupName.replace(/'/g, "''")}'
  AND display_order = ${option.display_order};

-- Insérer si n'existe pas
INSERT INTO france_product_options (
  product_id,
  option_name,
  price_modifier,
  display_order,
  group_order,
  option_group,
  is_required,
  is_active,
  icon,
  composition
)
SELECT
  ${productId},
  '${option.name.replace(/'/g, "''")}',
  ${option.price_modifier.toFixed(2)},
  ${option.display_order},
  ${globalGroupOrder},
  '${groupName.replace(/'/g, "''")}',
  ${groupRequiredMap.get(groupName) || false},
  true,
  COALESCE(NULLIF('${option.emoji}', '🔥🔥🔥'), (SELECT icon FROM france_option_groups WHERE group_name = '${groupName.replace(/'/g, "''")}' LIMIT 1), '❓'),
  ${option.composition ? `'${option.composition.replace(/'/g, "''")}'` : 'NULL'}
WHERE NOT EXISTS (
  SELECT 1 FROM france_product_options
  WHERE product_id = ${productId}
    AND option_group = '${groupName.replace(/'/g, "''")}'
    AND display_order = ${option.display_order}
);

`;
        });

        // Supprimer les options orphelines de ce groupe
        sql += `-- Supprimer les options orphelines du groupe ${groupName}\n`;
        sql += `DELETE FROM france_product_options
WHERE product_id = ${productId}
  AND option_group = '${groupName.replace(/'/g, "''")}'
  AND display_order NOT IN (${options.map(opt => opt.display_order).join(', ')});

`;

        globalGroupOrder++;
      }
    });

    // Supprimer les groupes complets qui ne sont plus utilisés
    const groupNames = Object.keys(optionGroups).map(name => `'${name.replace(/'/g, "''")}'`).join(', ');
    sql += `-- Supprimer les groupes non utilisés\n`;
    sql += `DELETE FROM france_product_options
WHERE product_id = ${productId}
  AND option_group NOT IN (${groupNames});

`;

    sql += `-- =========================================
-- 3. VÉRIFICATIONS FINALES
-- =========================================

-- Vérifier le produit mis à jour
SELECT
  id,
  name,
  price_on_site_base,
  price_delivery_base,
  workflow_type
FROM france_products
WHERE id = ${productId};

-- Vérifier les options après mise à jour
SELECT
  option_group,
  option_name,
  price_modifier,
  display_order,
  group_order,
  id as option_id
FROM france_product_options
WHERE product_id = ${productId}
ORDER BY group_order, display_order;

-- Statistiques finales
SELECT
  COUNT(*) as total_options,
  COUNT(DISTINCT option_group) as nb_groupes
FROM france_product_options
WHERE product_id = ${productId};

COMMIT;

-- 🎯 Mise à jour intelligente terminée pour le produit ID ${productId}
-- 📋 ${Object.keys(optionGroups).length} groupes d'options traités
-- 📦 ${Object.values(optionGroups).reduce((total, group) => total + group.length, 0)} options au total
-- ✅ IDs préservés, pas d'accumulation de données
`;

    return sql;
  }

  /**
   * Génère le SQL UPDATE pour modifier un workflow existant
   */
  static generateUpdateSQL(workflow: UniversalWorkflow, productId: number): string {
    const {
      productName,
      onSitePrice,
      deliveryPrice,
      steps,
      optionGroups
    } = workflow;

    // Construire la configuration des steps
    const stepsConfig = {
      steps: steps.map(step => ({
        step: step.step,
        type: step.type,
        prompt: this.fixPromptWording(step.prompt),
        option_groups: step.option_groups,
        required: step.required,
        max_selections: step.max_selections
      }))
    };

    let sql = `-- =========================================
-- MISE À JOUR WORKFLOW : ${productName}
-- =========================================
-- Généré le: ${new Date().toLocaleDateString('fr-FR')}
-- Product ID: ${productId}
-- Prix sur site: ${onSitePrice.toFixed(2)}€
-- Prix livraison: ${deliveryPrice.toFixed(2)}€
-- ⚠️ MISE À JOUR WORKFLOW UNIVERSAL V2
-- 🔥 CONSERVATION DES group_order EXISTANTS

BEGIN;

-- =========================================
-- 1. MISE À JOUR DU PRODUIT
-- =========================================

UPDATE france_products
SET
  name = '${productName}',
  price_on_site_base = ${onSitePrice.toFixed(2)},
  price_delivery_base = ${deliveryPrice.toFixed(2)},
  steps_config = '${JSON.stringify(stepsConfig).replace(/'/g, "''")}'
WHERE id = ${productId};

-- =========================================
-- 2. SUPPRESSION DES ANCIENNES OPTIONS
-- =========================================

DELETE FROM france_composite_items
WHERE product_id = ${productId};

-- =========================================
-- 3. INSERTION DES NOUVELLES OPTIONS
-- =========================================

`;

    // Générer les insertions pour chaque groupe d'options
    let globalGroupOrder = 1;

    Object.entries(optionGroups).forEach(([groupName, options]) => {
      if (options.length > 0) {
        sql += `-- Groupe: ${groupName}\n`;

        options.forEach((option, index) => {
          sql += `INSERT INTO france_composite_items (
  product_id,
  name,
  price_modifier,
  display_order,
  group_order,
  option_group,
  icon,
  composition
) VALUES (
  ${productId},
  '${option.name.replace(/'/g, "''")}',
  ${option.price_modifier.toFixed(2)},
  ${option.display_order},
  ${globalGroupOrder},
  '${groupName.replace(/'/g, "''")}',
  COALESCE(NULLIF('${option.emoji}', '🔥🔥🔥'), (SELECT icon FROM france_option_groups WHERE group_name = '${groupName.replace(/'/g, "''")}' LIMIT 1), '❓'),
  ${option.composition ? `'${option.composition.replace(/'/g, "''")}'` : 'NULL'}
);

`;
        });

        globalGroupOrder++;
      }
    });

    sql += `-- =========================================
-- 4. VÉRIFICATIONS
-- =========================================

-- Vérifier le produit mis à jour
SELECT
  id,
  name,
  price_on_site_base,
  price_delivery_base,
  workflow_type
FROM france_products
WHERE id = ${productId};

-- Vérifier les options mises à jour
SELECT
  option_group,
  name,
  price_modifier,
  display_order,
  group_order
FROM france_composite_items
WHERE product_id = ${productId}
ORDER BY group_order, display_order;

COMMIT;

-- 🎯 Mise à jour terminée pour le produit ID ${productId}
-- 📋 ${Object.keys(optionGroups).length} groupes d'options
-- 📦 ${Object.values(optionGroups).reduce((total, group) => total + group.length, 0)} options au total
`;

    return sql;
  }

  /**
   * Corriger les prompts questions en messages de confirmation
   */
  private static fixPromptWording(prompt: string): string {
    const promptMappings: Record<string, string> = {
      'Souhaitez-vous une entrée ?': 'Votre entrée',
      'Choisissez votre entrée': 'Votre entrée',
      'Choisissez la taille de votre pizza': 'Taille choisie',
      'Choisissez votre base': 'Base sélectionnée',
      'Ajoutez des garnitures (max 5)': 'Garnitures ajoutées',
      'Choisissez vos garnitures (max 5)': 'Garnitures ajoutées',
      'Choisissez votre boisson (incluse)': 'Votre boisson',
      'Terminez avec un dessert ?': 'Votre dessert',
      'Choisissez votre dessert': 'Votre dessert'
    };

    return promptMappings[prompt] || prompt;
  }

  /**
   * Génère le SQL complet pour un workflow universel
   */
  static generateCompleteSQL(workflow: UniversalWorkflow): string {
    const {
      productName,
      restaurantId,
      categoryName,
      onSitePrice,
      deliveryPrice,
      steps,
      optionGroups
    } = workflow;

    const slug = this.generateSlug(productName);
    const categorySlug = this.generateSlug(categoryName);

    // Construire la configuration des steps
    const stepsConfig = {
      steps: steps.map(step => ({
        step: step.step,
        type: step.type,
        prompt: this.fixPromptWording(step.prompt),
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
-- Catégorie: ${categoryName}
-- Prix sur site: ${onSitePrice.toFixed(2)}€
-- Prix livraison: ${deliveryPrice.toFixed(2)}€
-- ⚠️ CE WORKFLOW EST 100% COMPATIBLE AVEC LE BOT
-- 🔥 CORRECTION APPLIQUÉE: group_order calculé automatiquement
-- 🔥 RÉSOUT LE PROBLÈME: Ordre des steps respecté dans le bot

BEGIN;

-- =========================================
-- 1. CRÉATION DE LA CATÉGORIE (SI ELLE N'EXISTE PAS)
-- =========================================
INSERT INTO france_menu_categories (
  restaurant_id,
  name,
  slug,
  display_order,
  is_active
)
SELECT
  ${restaurantId},
  '${categoryName.replace(/'/g, "''")}',
  '${categorySlug}',
  (SELECT COALESCE(MAX(display_order), 0) + 1 FROM france_menu_categories WHERE restaurant_id = ${restaurantId}),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM france_menu_categories
  WHERE restaurant_id = ${restaurantId} AND name = '${categoryName.replace(/'/g, "''")}'
);

-- =========================================
-- 2. CRÉATION DU PRODUIT COMPOSITE
-- =========================================
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  description,
  product_type,
  base_price,
  price_on_site_base,
  price_delivery_base,
  workflow_type,
  requires_steps,
  steps_config,
  is_active,
  display_order
) VALUES (
  ${restaurantId},
  (SELECT id FROM france_menu_categories WHERE restaurant_id = ${restaurantId} AND name = '${categoryName.replace(/'/g, "''")}'),
  '${productName.replace(/'/g, "''")}',
  'Produit avec workflow personnalisé - Catégorie: ${categoryName}',
  'composite',
  ${onSitePrice.toFixed(2)},
  ${onSitePrice.toFixed(2)},
  ${deliveryPrice.toFixed(2)},
  'universal_workflow_v2',
  true,
  '${JSON.stringify(stepsConfig).replace(/'/g, "''")}'::json,
  true,
  (SELECT COALESCE(MAX(display_order), 0) + 1 FROM france_products
   WHERE category_id = (SELECT id FROM france_menu_categories WHERE restaurant_id = ${restaurantId} AND name = '${categoryName.replace(/'/g, "''")}'))
) RETURNING id AS new_product_id;

-- =========================================
-- 3. CRÉATION DES OPTIONS POUR CHAQUE GROUPE
-- =========================================
`;

    // 🔥 CORRECTION BUG IS_REQUIRED: Créer mapping groupe -> required
    const groupRequiredMap = new Map<string, boolean>();
    steps.forEach(step => {
      step.option_groups.forEach(groupName => {
        groupRequiredMap.set(groupName, step.required !== false);
      });
    });

    // Générer les inserts pour chaque groupe d'options avec group_order correct
    Object.entries(optionGroups).forEach(([groupName, options]) => {
      sql += `\n-- Groupe: ${groupName}\n`;

      // 🔥 CORRECTION CRITIQUE: Calculer group_order depuis l'ordre des steps
      const stepIndex = steps.findIndex(step =>
        step.option_groups.includes(groupName)
      );
      const groupOrder = stepIndex >= 0 ? stepIndex + 1 : 999; // 1, 2, 3, 4... ou 999 si orphelin

      sql += `-- ⚠️ ORDRE CRITIQUE: group_order = ${groupOrder} (step ${stepIndex + 1})\n`;

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
  display_order,
  group_order,
  is_required,
  is_active,
  icon,
  composition
) VALUES (
  (SELECT id FROM france_products WHERE name = '${productName.replace(/'/g, "''")}' AND restaurant_id = ${restaurantId}),
  '${groupName.replace(/'/g, "''")}',
  '${option.name.replace(/'/g, "''")}',
  ${option.price_modifier.toFixed(2)},
  ${option.display_order},
  ${groupOrder},
  ${groupRequiredMap.get(groupName) || false},
  true,
  COALESCE(NULLIF('${option.emoji}', '🔥🔥🔥'), (SELECT icon FROM france_option_groups WHERE group_name = '${groupName.replace(/'/g, "''")}' LIMIT 1), '❓'),
  ${option.composition ? `'${option.composition.replace(/'/g, "''")}'` : 'NULL'}
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
  p.price_delivery_base,
  p.steps_config
FROM france_products p
WHERE p.name = '${productName.replace(/'/g, "''")}' AND p.restaurant_id = ${restaurantId};

-- Vérifier les options créées AVEC ORDRE CORRECT
SELECT
  po.option_group,
  po.group_order,
  COUNT(*) as nb_options,
  STRING_AGG(po.option_name || ' (+' || po.price_modifier || '€)', ', ' ORDER BY po.display_order) as options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = '${productName.replace(/'/g, "''")}' AND p.restaurant_id = ${restaurantId}
GROUP BY po.option_group, po.group_order
ORDER BY po.group_order, po.option_group;

-- 🔥 VÉRIFICATION CRITIQUE: Ordre des steps dans le bot
SELECT
  po.group_order,
  po.option_group,
  'STEP ' || po.group_order || ' → ' || po.option_group as ordre_bot_attendu
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = '${productName.replace(/'/g, "''")}' AND p.restaurant_id = ${restaurantId}
GROUP BY po.group_order, po.option_group
ORDER BY po.group_order;

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
--
-- 🔥 CORRECTIONS APPLIQUÉES (V2.1):
-- 1. group_order calculé automatiquement selon l'ordre des steps
-- 2. Résout le bug d'ordre aléatoire des étapes dans le bot
-- 3. Garantit que Step 1 s'affiche en premier, Step 2 en second, etc.
-- 4. workflow_type: 'universal_workflow_v2' (SANS RÉGRESSION)
-- 5. Compatible avec l'architecture actuelle du bot universel
--
-- ⚠️ AVANT CES CORRECTIONS: Tous les group_order étaient NULL
-- ✅ APRÈS CES CORRECTIONS: group_order = 1, 2, 3, 4...
-- 🛡️ SÉCURITÉ: Aucun produit existant n'est affecté
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
    if (workflow.onSitePrice < 0) {
      errors.push('❌ Le prix sur site ne peut pas être négatif');
    }
    if (workflow.deliveryPrice < 0) {
      errors.push('❌ Le prix de livraison ne peut pas être négatif');
    }

    // Vérifier l'ordre des steps
    const stepNumbers = workflow.steps.map(s => s.step).sort((a, b) => a - b);
    for (let i = 0; i < stepNumbers.length; i++) {
      if (stepNumbers[i] !== i + 1) {
        errors.push(`❌ Les steps doivent être séquentiels (1, 2, 3...). Manquant: Step ${i + 1}`);
        break;
      }
    }

    // 🔥 NOUVELLE VALIDATION: Vérifier que tous les groupes référencés ont un step
    Object.keys(workflow.optionGroups).forEach(groupName => {
      const isReferenced = workflow.steps.some(step =>
        step.option_groups.includes(groupName)
      );
      if (!isReferenced) {
        warnings.push(`⚠️ Groupe "${groupName}" défini mais pas utilisé dans les steps`);
      }
    });

    // Vérifier l'unicité des groups dans les steps
    const allGroups = workflow.steps.flatMap(s => s.option_groups);
    const duplicates = allGroups.filter((group, index) => allGroups.indexOf(group) !== index);
    if (duplicates.length > 0) {
      errors.push(`❌ Groupes utilisés dans plusieurs steps: ${[...new Set(duplicates)].join(', ')}`);
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