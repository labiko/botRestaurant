// 📊 CHARGEUR DE DONNÉES TEMPLATE
// ===================================

import * as fs from 'fs';
import * as path from 'path';

export interface Product {
  id: number;
  name: string;
  description?: string;
  product_type: 'simple' | 'composite' | 'modular';
  price_on_site_base: number;
  price_delivery_base: number;
  workflow_type?: string;
  requires_steps: boolean;
  steps_config?: any;
  composition?: string;
  display_order: number;
  category_id: number;
  restaurant_id: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
  restaurant_id: number;
}

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
}

export class DataLoader {
  private templateData: any = null;

  constructor() {}

  /**
   * Charge les données depuis le fichier d'extraction
   */
  async loadTemplateData(): Promise<void> {
    if (this.templateData) {
      return;
    }

    console.log('🔄 Chargement des données template...');

    try {
      const dataFilePath = process.env.DATA_FILE_PATH ||
        'C:\\Users\\diall\\Documents\\BOT-RESTO\\BOT-UNIVERSEL\\DATA\\DATABASE\\data.txt';

      const rawData = fs.readFileSync(dataFilePath, 'utf-8');

      // Parse le fichier de données (format de votre extraction)
      this.templateData = this.parseExtractionFile(rawData);

      console.log(`✅ Données chargées:`);
      console.log(`   - ${this.templateData.restaurants?.length || 0} restaurants`);
      console.log(`   - ${this.templateData.categories?.length || 0} catégories`);
      console.log(`   - ${this.templateData.products?.length || 0} produits`);

    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      // En cas d'erreur, on initialise avec des données vides
      this.templateData = {
        restaurants: [],
        categories: [],
        products: [],
        composite_items: []
      };
    }
  }

  /**
   * Parse le fichier d'extraction SQL
   */
  private parseExtractionFile(rawData: string): any {
    const lines = rawData.split('\n');
    const result: any = {};

    for (const line of lines) {
      if (line.includes('|') && line.includes('data_type')) {
        continue; // Skip header
      }

      const match = line.match(/\|\s*(\w+)\s*\|\s*(\[.*\]|\{.*\})\s*\|/);
      if (match) {
        const [, dataType, jsonData] = match;

        try {
          const parsed = JSON.parse(jsonData);

          switch (dataType) {
            case 'RESTAURANTS':
              result.restaurants = parsed;
              break;
            case 'CATEGORIES':
              result.categories = parsed.map((item: any) => ({
                ...item.category,
                restaurant_id: item.restaurant_id,
                restaurant_name: item.restaurant_name
              }));
              break;
            case 'PRODUCTS':
              result.products = parsed.map((item: any) => ({
                ...item.product,
                category_id: item.category_id,
                category_name: item.category_name,
                restaurant_id: item.restaurant_id,
                restaurant_name: item.restaurant_name
              }));
              break;
            case 'COMPOSITE_ITEMS':
              result.composite_items = parsed;
              break;
          }
        } catch (parseError) {
          console.warn(`⚠️ Erreur parsing ${dataType}:`, parseError);
        }
      }
    }

    return result;
  }

  /**
   * Récupère toutes les données d'un restaurant
   */
  async getRestaurantData(restaurantId: number): Promise<any> {
    await this.loadTemplateData();

    const restaurant = this.templateData.restaurants?.find((r: any) => r.id === restaurantId);
    const categories = this.templateData.categories?.filter((c: any) => c.restaurant_id === restaurantId) || [];
    const products = this.templateData.products?.filter((p: any) => p.restaurant_id === restaurantId) || [];

    return {
      restaurant,
      categories: categories.slice(0, 5), // Limiter pour le prompt
      products: products.slice(0, 20), // Limiter pour le prompt
      sample_workflows: this.getSampleWorkflows(products)
    };
  }

  /**
   * Extrait des exemples de workflows
   */
  private getSampleWorkflows(products: Product[]): any {
    const workflows: any = {};

    products.forEach(product => {
      if (product.workflow_type && !workflows[product.workflow_type]) {
        workflows[product.workflow_type] = {
          example_product: product.name,
          steps_config: product.steps_config,
          product_type: product.product_type
        };
      }
    });

    return workflows;
  }

  /**
   * Trouve un produit par nom
   */
  findProductByName(name: string, restaurantId?: number): Product | null {
    if (!this.templateData) return null;

    return this.templateData.products?.find((p: Product) =>
      p.name.toLowerCase().includes(name.toLowerCase()) &&
      (!restaurantId || p.restaurant_id === restaurantId)
    ) || null;
  }

  /**
   * Trouve une catégorie par nom
   */
  findCategoryByName(name: string, restaurantId?: number): Category | null {
    if (!this.templateData) return null;

    return this.templateData.categories?.find((c: Category) =>
      c.name.toLowerCase().includes(name.toLowerCase()) &&
      (!restaurantId || c.restaurant_id === restaurantId)
    ) || null;
  }
}