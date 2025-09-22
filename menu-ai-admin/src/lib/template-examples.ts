// 📝 EXEMPLES D'UTILISATION DES TEMPLATES
// =======================================
// Comment utiliser le système de templates manuels

import { TemplateProcessor, WorkflowTemplate } from './template-processor';

// 🎯 EXEMPLE 1: Utiliser un template preset (menu enfant)
export function exempleMenuEnfant() {
  console.log('🍽️ EXEMPLE: Menu Enfant avec template preset');

  const processedWorkflow = TemplateProcessor.processTemplate(
    'menu_enfant',
    {
      // Pas de modifications, on utilise le template tel quel
    },
    {
      name: 'MENU P\'TIT CHEF',
      restaurantId: 15,
      basePrice: 8.50,
      categoryId: 45
    }
  );

  const sql = TemplateProcessor.generateSQL(processedWorkflow);
  console.log('📄 SQL généré:', sql);
  return sql;
}

// 🎯 EXEMPLE 2: Modifier un template existant (réorganiser les steps)
export function exempleMenuModifie() {
  console.log('🔧 EXEMPLE: Menu avec steps réorganisés (boisson avant plat)');

  const processedWorkflow = TemplateProcessor.processTemplate(
    'menu_enfant',
    {
      // On inverse l'ordre : boisson d'abord, puis plat
      steps: [
        {
          step: 1,
          type: "options_selection",
          prompt: "Choisissez d'abord votre boisson",
          option_groups: ["Boisson enfant"],
          required: true,
          max_selections: 1
        },
        {
          step: 2,
          type: "options_selection",
          prompt: "Maintenant votre plat principal",
          option_groups: ["Plat principal"],
          required: true,
          max_selections: 1
        }
      ]
    },
    {
      name: 'MENU ENFANT INVERSÉ',
      restaurantId: 15,
      basePrice: 8.50,
      categoryId: 45
    }
  );

  return TemplateProcessor.generateSQL(processedWorkflow);
}

// 🎯 EXEMPLE 3: Utiliser le template de base avec placeholders
export function exempleTemplateBase() {
  console.log('⚙️ EXEMPLE: Template de base personnalisé');

  const processedWorkflow = TemplateProcessor.processTemplate(
    'base',
    {
      placeholders: {
        'ELEMENT_PRINCIPAL': 'pizza',
        'GROUPE_PRINCIPAL': 'Tailles pizza',
        'ELEMENT_SECONDAIRE': 'boisson',
        'GROUPE_SECONDAIRE': 'Boissons 50CL',
        'ELEMENT_OPTIONNEL': 'EXTRAS',
        'GROUPE_OPTIONNEL': 'Suppléments pizza'
      }
    },
    {
      name: 'PIZZA PERSONNALISÉE',
      restaurantId: 15,
      basePrice: 12.00,
      categoryId: 46
    }
  );

  return TemplateProcessor.generateSQL(processedWorkflow);
}

// 🎯 EXEMPLE 4: Template entièrement personnalisé avec étapes multiples
export function exempleTemplateComplexe() {
  console.log('🚀 EXEMPLE: Template complexe avec 5 étapes');

  const templateCustom: WorkflowTemplate = {
    meta: {
      name: 'Menu Gastronomique',
      description: 'Menu complet avec choix multiples',
      use_case: 'Restaurant gastronomique'
    },
    workflow_config: {
      workflow_type: 'composite_workflow',
      requires_steps: true,
      steps: [
        {
          step: 1,
          type: "options_selection",
          prompt: "Choisissez votre mise en bouche",
          option_groups: ["Amuse-bouches"],
          required: true,
          max_selections: 1
        },
        {
          step: 2,
          type: "options_selection",
          prompt: "Sélectionnez votre entrée",
          option_groups: ["Entrées chaudes", "Entrées froides"],
          required: true,
          max_selections: 1
        },
        {
          step: 3,
          type: "options_selection",
          prompt: "Votre plat principal",
          option_groups: ["Viandes", "Poissons", "Végétarien"],
          required: true,
          max_selections: 1
        },
        {
          step: 4,
          type: "options_selection",
          prompt: "Accompagnements (2 maximum)",
          option_groups: ["Légumes", "Féculents"],
          required: true,
          max_selections: 2
        },
        {
          step: 5,
          type: "options_selection",
          prompt: "Dessert de votre choix",
          option_groups: ["Desserts chauds", "Desserts froids", "Fromages"],
          required: true,
          max_selections: 1
        }
      ]
    }
  };

  // Utiliser directement le template personnalisé
  const processedWorkflow = {
    productName: 'MENU DÉGUSTATION CHEF',
    restaurantId: 15,
    basePrice: 45.00,
    deliveryPrice: 46.00,
    categoryId: 47,
    workflowConfig: templateCustom.workflow_config,
    compositeItems: [
      {
        optionGroup: 'Amuse-bouches',
        options: [
          { name: 'Velouté parmentier', priceModifier: 0, displayOrder: 1 },
          { name: 'Tartare saumon', priceModifier: 0, displayOrder: 2 }
        ]
      },
      {
        optionGroup: 'Entrées chaudes',
        options: [
          { name: 'Foie gras poêlé', priceModifier: 8, displayOrder: 1 },
          { name: 'Saint-Jacques snackées', priceModifier: 6, displayOrder: 2 }
        ]
      },
      {
        optionGroup: 'Viandes',
        options: [
          { name: 'Bœuf Angus', priceModifier: 0, displayOrder: 1 },
          { name: 'Agneau des Pyrénées', priceModifier: 3, displayOrder: 2 }
        ]
      }
      // etc...
    ]
  };

  return TemplateProcessor.generateSQL(processedWorkflow);
}

// 🎯 EXEMPLE 5: Créer un template avec des composants modulaires
export function exempleComposantsModulaires() {
  console.log('🧩 EXEMPLE: Template avec composants modulaires');

  const customTemplate = TemplateProcessor.createCustomTemplate(
    'Salade Bowl Personnalisée',
    'Template pour salades avec ingrédients au choix',
    [
      'choix_base',        // Étape 1: Base (salade, quinoa, etc.)
      'choix_proteine',    // Étape 2: Protéine
      'choix_supplements', // Étape 3: Suppléments
      'choix_sauces',      // Étape 4: Sauces
      'choix_boisson_33cl' // Étape 5: Boisson
    ]
  );

  const processedWorkflow = {
    productName: 'SALADE BOWL CUSTOM',
    restaurantId: 15,
    basePrice: 11.50,
    deliveryPrice: 12.50,
    categoryId: 48,
    workflowConfig: customTemplate.workflow_config
  };

  return TemplateProcessor.generateSQL(processedWorkflow);
}

// 🎯 GUIDE D'UTILISATION PRATIQUE
export function guideUtilisation() {
  return `
🔧 GUIDE D'UTILISATION DES TEMPLATES
====================================

1. TEMPLATES PRESETS (prêts à l'emploi):
   - menu_enfant: Plat + boisson
   - bowl_personalise: Viande + boisson + suppléments
   - menu_complet: Entrée + plat + dessert + boisson
   - burger_customise: Viande + pain + sauces + extras
   - pizza_personnalisee: Taille + pâte + sauce + ingrédients

2. TEMPLATE DE BASE (avec placeholders):
   - Utilisez 'base' et remplacez [ELEMENT_PRINCIPAL], [GROUPE_PRINCIPAL], etc.

3. MODIFICATIONS COURANTES:

   a) Réorganiser les étapes:
      Changez les numéros de step: step: 1, step: 2, etc.

   b) Rendre une étape optionnelle:
      required: false

   c) Choix multiples:
      max_selections: 3 (au lieu de 1)

   d) Personnaliser les prompts:
      prompt: "Votre texte personnalisé"

4. UTILISATION:

   const workflow = TemplateProcessor.processTemplate(
     'nom_template',
     {
       // vos modifications
       steps: [...],
       placeholders: {...}
     },
     {
       name: 'NOM PRODUIT',
       restaurantId: 15,
       basePrice: 10.00,
       categoryId: 45
     }
   );

   const sql = TemplateProcessor.generateSQL(workflow);
   // Copiez-collez le SQL en base !

5. VALIDATION:
   const result = TemplateProcessor.validateTemplate(monTemplate);
   if (!result.valid) {
     console.log('Erreurs:', result.errors);
   }

💡 ASTUCE: Commencez avec un preset, modifiez-le selon vos besoins,
          puis générez le SQL pour l'exécuter en base !
`;
}

// 🎯 FONCTION DE TEST COMPLÈTE
export function testerTousLesExemples() {
  console.log('🧪 TEST DE TOUS LES EXEMPLES\n');

  console.log('1. Menu enfant standard:');
  console.log(exempleMenuEnfant());

  console.log('\n2. Menu avec steps inversés:');
  console.log(exempleMenuModifie());

  console.log('\n3. Template de base personnalisé:');
  console.log(exempleTemplateBase());

  console.log('\n4. Template complexe gastro:');
  console.log(exempleTemplateComplexe());

  console.log('\n5. Composants modulaires:');
  console.log(exempleComposantsModulaires());

  console.log('\n📖 Guide d\'utilisation:');
  console.log(guideUtilisation());
}