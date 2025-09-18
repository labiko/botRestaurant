// 📊 CHARGEUR DE DONNÉES TEMPLATE
// ===================================

import * as fs from 'fs-extra';
import * as path from 'path';
import { TemplateData, Restaurant, Category, Product } from './types';

export class DataLoader {
  private templateData: TemplateData | null = null;

  constructor(private dataFilePath: string) {}

  /**
   * Charge les données depuis le fichier d'extraction
   */
  async loadTemplateData(): Promise<TemplateData> {
    if (this.templateData) {
      return this.templateData;
    }

    console.log('🔄 Chargement des données template...');

    try {
      const rawData = await fs.readFile(this.dataFilePath, 'utf-8');

      // Parse le fichier de données (format de votre extraction)
      const parsed = this.parseExtractionFile(rawData);

      this.templateData = {
        restaurants: parsed.restaurants || [],
        categories: parsed.categories || [],
        products: parsed.products || [],
        composite_items: parsed.composite_items || [],
        product_options: parsed.product_options || [],
        product_sizes: parsed.product_sizes || [],
        product_variants: parsed.product_variants || []
      };

      console.log(`✅ Données chargées:`);
      console.log(`   - ${this.templateData.restaurants.length} restaurants`);
      console.log(`   - ${this.templateData.categories.length} catégories`);
      console.log(`   - ${this.templateData.products.length} produits`);

      return this.templateData;

    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      throw error;
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
            case 'PRODUCT_OPTIONS':
              result.product_options = parsed;
              break;
            case 'PRODUCT_SIZES':
              result.product_sizes = parsed;
              break;
            case 'PRODUCT_VARIANTS':
              result.product_variants = parsed;
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
   * Trouve un produit par nom
   */
  findProductByName(name: string, restaurantId?: number): Product | null {
    if (!this.templateData) return null;

    return this.templateData.products.find(p =>
      p.name.toLowerCase().includes(name.toLowerCase()) &&
      (!restaurantId || p.restaurant_id === restaurantId)
    ) || null;
  }

  /**
   * Trouve une catégorie par nom
   */
  findCategoryByName(name: string, restaurantId?: number): Category | null {
    if (!this.templateData) return null;

    return this.templateData.categories.find(c =>
      c.name.toLowerCase().includes(name.toLowerCase()) &&
      (!restaurantId || c.restaurant_id === restaurantId)
    ) || null;
  }

  /**
   * Récupère tous les produits d'une catégorie
   */
  getProductsByCategory(categoryId: number): Product[] {
    if (!this.templateData) return [];

    return this.templateData.products.filter(p => p.category_id === categoryId);
  }

  /**
   * Récupère les éléments composites d'un produit
   */
  getCompositeItems(productId: number): any[] {
    if (!this.templateData) return [];

    return this.templateData.composite_items?.filter(ci =>
      ci.composite_product_id === productId
    ) || [];
  }
}