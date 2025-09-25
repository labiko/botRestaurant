// Service d'intégration base de données pour ÉTAPE 3 : Database Integration
import { OCRSmartConfigure, ProductAnalysisResult } from '../interfaces/ocr-smart-configure.interface';
import { WorkflowGeneratorV2, UniversalWorkflow } from '@/lib/workflow-generator-v2';

export interface DatabaseIntegrationResult {
  success: boolean;
  restaurantId?: number;
  categoriesCreated?: number;
  productsCreated?: number;
  sql?: string;
  simulation?: string;
  error?: string;
  warnings?: string[];
}

export class DatabaseIntegrationService {

  /**
   * Intègre complètement la configuration Smart OCR en base de données
   */
  static async integrateSmartConfiguration(
    smartConfig: OCRSmartConfigure,
    analysisResults: ProductAnalysisResult[]
  ): Promise<DatabaseIntegrationResult> {

    try {
      // 1. Créer le restaurant
      const restaurantSQL = this.generateRestaurantSQL(smartConfig);

      // 2. Créer les catégories (22 catégories Pizza Yolo 77)
      const categoriesSQL = this.generateCategoriesSQL(smartConfig);

      // 3. Créer tous les produits avec workflows
      const productsSQL = await this.generateProductsSQL(smartConfig, analysisResults);

      // 4. SQL complet transactionnel
      const completeSQL = this.wrapInTransaction([
        restaurantSQL,
        categoriesSQL,
        productsSQL
      ]);

      // 5. Simulation bot pour tous les produits
      const simulation = this.generateBotSimulation(analysisResults);

      return {
        success: true,
        restaurantId: 999, // ID temporaire pour preview
        categoriesCreated: smartConfig.restaurantTemplate.categories.length,
        productsCreated: smartConfig.extractedProducts.length,
        sql: completeSQL,
        simulation,
        warnings: this.generateWarnings(analysisResults)
      };

    } catch (error) {
      console.error('Erreur intégration database:', error);
      return {
        success: false,
        error: `Erreur lors de l'intégration : ${error}`
      };
    }
  }

  /**
   * Génère le SQL pour créer le restaurant
   */
  private static generateRestaurantSQL(smartConfig: OCRSmartConfigure): string {
    const { newRestaurantData, restaurantTemplate } = smartConfig;
    const config = restaurantTemplate.baseConfig;

    return `
-- ========================================
-- 🏪 CRÉATION RESTAURANT : ${newRestaurantData.name.toUpperCase()}
-- ========================================

INSERT INTO france_restaurants (
  name, slug, whatsapp_number,
  address, city, phone,
  delivery_zone_km, min_order_amount, delivery_fee,
  business_hours, is_active
) VALUES (
  '${newRestaurantData.name}',
  '${newRestaurantData.slug}',
  '${newRestaurantData.whatsapp_number}',
  ${newRestaurantData.address ? `'${newRestaurantData.address}'` : 'NULL'},
  ${newRestaurantData.city ? `'${newRestaurantData.city}'` : 'NULL'},
  ${newRestaurantData.phone ? `'${newRestaurantData.phone}'` : 'NULL'},
  ${config.delivery_zone_km},
  ${config.min_order_amount},
  ${config.delivery_fee},
  '${JSON.stringify(config.business_hours)}'::jsonb,
  true
);

-- Récupérer l'ID du restaurant créé
SELECT currval('france_restaurants_id_seq') as new_restaurant_id;
    `.trim();
  }

  /**
   * Génère le SQL pour créer les 22 catégories
   */
  private static generateCategoriesSQL(smartConfig: OCRSmartConfigure): string {
    const categories = smartConfig.restaurantTemplate.categories;

    let sql = `
-- ========================================
-- 📂 CRÉATION 22 CATÉGORIES (TEMPLATE PIZZA YOLO 77)
-- ========================================

INSERT INTO france_menu_categories (
  restaurant_id, name, slug, icon, display_order, is_active
) VALUES`;

    const values = categories.map(cat =>
      `  (currval('france_restaurants_id_seq'), '${cat.name}', '${cat.slug}', '${cat.icon}', ${cat.display_order}, true)`
    );

    sql += '\n' + values.join(',\n') + ';';

    return sql;
  }

  /**
   * Génère le SQL pour créer tous les produits avec workflows
   */
  private static async generateProductsSQL(
    smartConfig: OCRSmartConfigure,
    analysisResults: ProductAnalysisResult[]
  ): Promise<string> {

    let sql = `
-- ========================================
-- 🍽️ CRÉATION PRODUITS AVEC WORKFLOWS IA
-- ========================================
`;

    for (let i = 0; i < analysisResults.length; i++) {
      const result = analysisResults[i];
      const product = result.product;
      const categoryMapping = result.categoryMapping;
      const workflowSuggestion = result.workflowSuggestion;

      // Trouver la catégorie correspondante
      const category = smartConfig.restaurantTemplate.categories.find(
        c => c.id === categoryMapping.suggestedCategoryId
      );

      if (!category) {
        console.warn(`Catégorie non trouvée pour ${product.name}`);
        continue;
      }

      // Créer workflow universel pour WorkflowGeneratorV2
      const workflow: UniversalWorkflow = {
        productName: product.name,
        restaurantId: 999, // Sera remplacé par currval dans le SQL
        categoryName: category.name,
        onSitePrice: result.pricingSuggestion.onSitePrice,
        deliveryPrice: result.pricingSuggestion.deliveryPrice,
        steps: workflowSuggestion.steps,
        optionGroups: workflowSuggestion.optionGroups
      };

      // Utiliser WorkflowGeneratorV2 existant
      let productSQL = WorkflowGeneratorV2.generateCompleteSQL(workflow);

      // Remplacer l'ID restaurant par la référence currval
      productSQL = productSQL.replace(
        /restaurant_id = \d+/g,
        'restaurant_id = currval(\'france_restaurants_id_seq\')'
      );

      // Remplacer l'ID catégorie par une sous-requête
      productSQL = productSQL.replace(
        /category_id = \d+/g,
        `category_id = (SELECT id FROM france_menu_categories WHERE restaurant_id = currval('france_restaurants_id_seq') AND name = '${category.name}')`
      );

      sql += `
-- Produit ${i + 1}: ${product.name} (${result.detectedType})
-- Catégorie: ${category.icon} ${category.name}
-- Workflow: ${workflowSuggestion.steps.length} étapes
${productSQL}
`;
    }

    return sql;
  }

  /**
   * Encapsule dans une transaction sécurisée
   */
  private static wrapInTransaction(sqlParts: string[]): string {
    return `
BEGIN;

${sqlParts.join('\n\n')}

-- ========================================
-- ✅ VÉRIFICATIONS FINALES
-- ========================================

-- Vérifier restaurant créé
SELECT
  id, name, slug, whatsapp_number
FROM france_restaurants
WHERE id = currval('france_restaurants_id_seq');

-- Vérifier catégories créées
SELECT COUNT(*) as categories_created
FROM france_menu_categories
WHERE restaurant_id = currval('france_restaurants_id_seq');

-- Vérifier produits créés
SELECT COUNT(*) as products_created
FROM france_products
WHERE restaurant_id = currval('france_restaurants_id_seq');

-- Si tout est OK, valider la transaction
COMMIT;

-- En cas de problème, utiliser : ROLLBACK;
    `.trim();
  }

  /**
   * Génère la simulation bot pour tous les produits
   */
  private static generateBotSimulation(analysisResults: ProductAnalysisResult[]): string {
    let simulation = `
🤖 SIMULATION BOT WHATSAPP - NOUVEAU RESTAURANT
===============================================

1️⃣ COMMANDE "resto"
Bot: 🏪 Restaurants disponibles :
     1. ${analysisResults[0]?.product.name || 'Nouveau Restaurant'} - 📍 Adresse

2️⃣ SÉLECTION "1"
Bot: 📋 Menu ${analysisResults[0]?.product.name || 'Nouveau Restaurant'} :

`;

    // Grouper par catégories
    const byCategory = analysisResults.reduce((acc, result) => {
      const catName = result.categoryMapping.suggestedCategoryName;
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(result);
      return acc;
    }, {} as Record<string, ProductAnalysisResult[]>);

    let productIndex = 1;
    for (const [categoryName, products] of Object.entries(byCategory)) {
      const icon = products[0].categoryMapping.icon;
      simulation += `     ${icon} ${categoryName.toUpperCase()}\n`;

      for (const result of products) {
        simulation += `     ${productIndex}. ${result.product.name} - ${result.pricingSuggestion.onSitePrice}€\n`;
        productIndex++;
      }
      simulation += '\n';
    }

    // Exemple de commande avec workflow
    const firstModular = analysisResults.find(r => r.workflowSuggestion.steps.length > 0);
    if (firstModular) {
      simulation += `3️⃣ SÉLECTION "${productIndex - analysisResults.length}" (${firstModular.product.name})
`;

      firstModular.workflowSuggestion.steps.forEach((step, i) => {
        simulation += `Bot: ${step.prompt}
${Object.entries(firstModular.workflowSuggestion.optionGroups[step.option_groups[0]] || {}).slice(0, 3).map((option, j) =>
  `     ${j + 1}. ${option[1]?.name || 'Option'} ${option[1]?.price_modifier ? `(+${option[1].price_modifier}€)` : ''}`
).join('\n')}

`;
      });
    }

    simulation += `4️⃣ FINALISATION
Bot: 📋 Récapitulatif commande :
     • ${firstModular?.product.name || 'Produit'} - ${firstModular?.pricingSuggestion.deliveryPrice || 0}€

     💰 Total : ${firstModular?.pricingSuggestion.deliveryPrice || 0}€

     Mode de service :
     1️⃣ Sur place
     2️⃣ À emporter
     3️⃣ Livraison (+2.50€)
`;

    return simulation;
  }

  /**
   * Génère les avertissements pour l'utilisateur
   */
  private static generateWarnings(analysisResults: ProductAnalysisResult[]): string[] {
    const warnings: string[] = [];

    // Vérifier la confiance des analyses
    const lowConfidenceProducts = analysisResults.filter(r =>
      r.workflowSuggestion.confidence < 0.7 || r.categoryMapping.confidence < 0.7
    );

    if (lowConfidenceProducts.length > 0) {
      warnings.push(
        `${lowConfidenceProducts.length} produits ont une confiance d'analyse < 70%. Vérifiez les workflows suggérés.`
      );
    }

    // Vérifier les prix manquants
    const noPriceProducts = analysisResults.filter(r =>
      r.pricingSuggestion.onSitePrice === 0
    );

    if (noPriceProducts.length > 0) {
      warnings.push(
        `${noPriceProducts.length} produits n'ont pas de prix détecté. Vérifiez les prix avant le déploiement.`
      );
    }

    // Vérifier les catégories par défaut
    const defaultCategoryProducts = analysisResults.filter(r =>
      r.categoryMapping.suggestedCategoryName === 'GOURMETS' && r.categoryMapping.confidence < 0.5
    );

    if (defaultCategoryProducts.length > 0) {
      warnings.push(
        `${defaultCategoryProducts.length} produits sont classés en catégorie par défaut (GOURMETS). Vérifiez le mapping.`
      );
    }

    return warnings;
  }

  /**
   * Valide la configuration avant intégration
   */
  static validateConfiguration(
    smartConfig: OCRSmartConfigure,
    analysisResults: ProductAnalysisResult[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Vérifier données restaurant
    if (!smartConfig.newRestaurantData.name) {
      errors.push('Nom du restaurant requis');
    }

    if (!smartConfig.newRestaurantData.whatsapp_number) {
      errors.push('Numéro WhatsApp requis');
    }

    // Vérifier qu'on a des produits
    if (smartConfig.extractedProducts.length === 0) {
      errors.push('Aucun produit extrait');
    }

    if (analysisResults.length === 0) {
      errors.push('Aucune analyse de produit');
    }

    // Vérifier correspondance
    if (smartConfig.extractedProducts.length !== analysisResults.length) {
      errors.push('Incohérence entre produits extraits et analyses');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}