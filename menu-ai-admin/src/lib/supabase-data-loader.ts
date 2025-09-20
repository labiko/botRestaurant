// 🔗 CHARGEUR DE DONNÉES SUPABASE
// ===================================

import { createClient } from '@supabase/supabase-js';

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
  icon: string;
  display_order: number;
  restaurant_id: number;
}

export interface Restaurant {
  id: number;
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  description?: string;
}

export class SupabaseDataLoader {
  private supabase: any;

  constructor() {
    // Connexion à la base DEV ou PROD selon l'environnement
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'DEV';
    const supabaseUrl = environment === 'PROD'
      ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = environment === 'PROD'
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log(`🔗 Connexion Supabase ${environment}: ${supabaseUrl}`);

    this.supabase = createClient(supabaseUrl!, supabaseKey!);
  }

  /**
   * Récupère les données complètes d'un restaurant depuis Supabase
   */
  async getRestaurantData(restaurantId: number): Promise<any> {
    console.log(`🔄 Chargement données restaurant ${restaurantId} depuis Supabase...`);

    try {
      // Récupération restaurant
      const { data: restaurant, error: restaurantError } = await this.supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (restaurantError) throw restaurantError;

      // Récupération catégories
      const { data: categories, error: categoriesError } = await this.supabase
        .from('france_menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Récupération produits avec limite pour le prompt
      const { data: products, error: productsError } = await this.supabase
        .from('france_products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('category_id, display_order', { ascending: true })
        .limit(20); // Limiter pour OpenAI

      if (productsError) throw productsError;

      console.log(`✅ Données chargées depuis Supabase:`);
      console.log(`   - Restaurant: ${restaurant?.name}`);
      console.log(`   - ${categories?.length || 0} catégories`);
      console.log(`   - ${products?.length || 0} produits`);

      return {
        restaurant,
        categories: categories || [], // Toutes les catégories
        products: products || [],
        sample_workflows: this.extractWorkflows(products || [])
      };

    } catch (error) {
      console.error('❌ Erreur chargement Supabase:', error);
      throw error;
    }
  }

  /**
   * Récupère une catégorie spécifique avec ses produits complets
   */
  async getCategoryWithProducts(categoryId: number): Promise<any> {
    console.log(`🔄 Chargement catégorie ${categoryId}...`);

    try {
      // Récupération catégorie
      const { data: category, error: categoryError } = await this.supabase
        .from('france_menu_categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;

      // Récupération TOUS les produits de la catégorie
      const { data: products, error: productsError } = await this.supabase
        .from('france_products')
        .select('*')
        .eq('category_id', categoryId)
        .order('display_order', { ascending: true });

      if (productsError) throw productsError;

      console.log(`✅ Catégorie "${category?.name}" avec ${products?.length || 0} produits`);

      return {
        category,
        products: products || [],
        nextDisplayOrder: this.calculateNextDisplayOrder(products || []),
        productPatterns: this.analyzeProductPatterns(products || [])
      };

    } catch (error) {
      console.error('❌ Erreur chargement catégorie:', error);
      throw error;
    }
  }

  /**
   * Analyse les patterns des produits d'une catégorie
   */
  private analyzeProductPatterns(products: Product[]): any {
    if (!products.length) return {};

    const patterns = {
      namingStyle: this.detectNamingStyle(products),
      priceRange: this.detectPriceRange(products),
      commonType: this.detectCommonType(products),
      descriptionStyle: this.detectDescriptionStyle(products),
      avgNameLength: products.reduce((sum, p) => sum + p.name.length, 0) / products.length
    };

    return patterns;
  }

  /**
   * Détecte le style de nommage des produits
   */
  private detectNamingStyle(products: Product[]): string {
    const upperCaseCount = products.filter(p => p.name === p.name.toUpperCase()).length;
    const titleCaseCount = products.filter(p =>
      p.name === p.name.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    ).length;

    if (upperCaseCount > products.length * 0.7) return 'UPPERCASE';
    if (titleCaseCount > products.length * 0.7) return 'TitleCase';
    return 'Mixed';
  }

  /**
   * Détecte la gamme de prix
   */
  private detectPriceRange(products: Product[]): any {
    const prices = products.map(p => p.price_on_site_base);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, p) => sum + p, 0) / prices.length
    };
  }

  /**
   * Détecte le type de produit le plus commun
   */
  private detectCommonType(products: Product[]): string {
    const typeCounts = products.reduce((acc, p) => {
      acc[p.product_type] = (acc[p.product_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(typeCounts).reduce((a, b) =>
      typeCounts[a] > typeCounts[b] ? a : b
    );
  }

  /**
   * Détecte le style de description
   */
  private detectDescriptionStyle(products: Product[]): string {
    const withComposition = products.filter(p => p.composition && p.composition.length > 10);
    const shortNames = products.filter(p => p.name.length < 20);

    if (withComposition.length > products.length * 0.5) return 'Detailed';
    if (shortNames.length > products.length * 0.7) return 'Short';
    return 'Standard';
  }

  /**
   * Calcule le prochain display_order
   */
  private calculateNextDisplayOrder(products: Product[]): number {
    if (!products.length) return 1;
    const maxOrder = Math.max(...products.map(p => p.display_order || 0));
    return maxOrder + 1;
  }

  /**
   * Trouve un produit par nom dans un restaurant
   */
  async findProductByName(name: string, restaurantId: number): Promise<Product | null> {
    try {
      const { data: products, error } = await this.supabase
        .from('france_products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .ilike('name', `%${name}%`)
        .limit(1);

      if (error) throw error;

      return products?.[0] || null;
    } catch (error) {
      console.error('❌ Erreur recherche produit:', error);
      return null;
    }
  }

  /**
   * Trouve une catégorie par nom dans un restaurant
   */
  async findCategoryByName(name: string, restaurantId: number): Promise<Category | null> {
    try {
      const { data: categories, error } = await this.supabase
        .from('france_menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .ilike('name', `%${name}%`)
        .limit(1);

      if (error) throw error;

      return categories?.[0] || null;
    } catch (error) {
      console.error('❌ Erreur recherche catégorie:', error);
      return null;
    }
  }

  /**
   * Extrait les workflows des produits
   */
  private extractWorkflows(products: Product[]): any {
    const workflows: any = {};

    products.forEach(product => {
      if (product.workflow_type && !workflows[product.workflow_type]) {
        workflows[product.workflow_type] = {
          example_product: product.name,
          steps_config: product.steps_config,
          product_type: product.product_type,
          requires_steps: product.requires_steps
        };
      }
    });

    return workflows;
  }

  /**
   * Récupère le prochain display_order pour une catégorie
   */
  async getNextDisplayOrder(categoryId: number): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('france_products')
        .select('display_order')
        .eq('category_id', categoryId)
        .order('display_order', { ascending: false })
        .limit(1);

      if (error) throw error;

      return (data?.[0]?.display_order || 0) + 1;
    } catch (error) {
      console.error('❌ Erreur display_order:', error);
      return 1;
    }
  }

  /**
   * Récupère tous les restaurants disponibles
   */
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      console.log('🔄 Chargement des restaurants...');

      const { data: restaurants, error } = await this.supabase
        .from('france_restaurants')
        .select('id, name, slug, address, phone, created_at')
        .order('name', { ascending: true });

      if (error) throw error;

      console.log(`✅ ${restaurants?.length || 0} restaurants chargés`);

      return restaurants || [];
    } catch (error) {
      console.error('❌ Erreur chargement restaurants:', error);
      return [];
    }
  }

  /**
   * Récupère les statistiques d'un restaurant
   */
  async getRestaurantStats(restaurantId: number): Promise<any> {
    try {
      // Compter les catégories
      const { count: categoriesCount, error: categoriesError } = await this.supabase
        .from('france_menu_categories')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId);

      if (categoriesError) {
        console.error('❌ Erreur comptage catégories:', categoriesError);
      }

      // Compter les produits
      const { count: productsCount, error: productsError } = await this.supabase
        .from('france_products')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId);

      if (productsError) {
        console.error('❌ Erreur comptage produits:', productsError);
      }

      // Compter les workflows (produits avec workflow_type non null)
      const { count: workflowsCount, error: workflowsError } = await this.supabase
        .from('france_products')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .not('workflow_type', 'is', null);

      if (workflowsError) {
        console.error('❌ Erreur comptage workflows:', workflowsError);
      }

      // Compter les options (france_composite_items)
      const { count: optionsCount, error: optionsError } = await this.supabase
        .from('france_composite_items')
        .select('france_products!inner(restaurant_id)', { count: 'exact', head: true })
        .eq('france_products.restaurant_id', restaurantId);

      if (optionsError) {
        console.error('❌ Erreur comptage options:', optionsError);
      }

      const stats = {
        categories: categoriesCount || 0,
        products: productsCount || 0,
        workflows: workflowsCount || 0,
        options: optionsCount || 0
      };

      console.log(`📊 Stats restaurant ${restaurantId}:`, stats);

      return stats;
    } catch (error) {
      console.error('❌ Erreur calcul statistiques restaurant:', error);
      return { categories: 0, products: 0, workflows: 0, options: 0 };
    }
  }
}