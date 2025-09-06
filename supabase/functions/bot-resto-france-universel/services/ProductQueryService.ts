// 📊 SERVICE REQUÊTE PRODUITS - ACCÈS DONNÉES UNIFIÉ
// SOLID - Single Responsibility : Gère uniquement les requêtes produits
// Configuration-driven : Requêtes basées sur configuration, pas de code en dur

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  IProductQueryService,
  Product,
  ProductQueryConfig
} from '../types.ts';

/**
 * Service de requête produits unifié
 * SOLID - Single Responsibility : Gère uniquement l'accès aux données produits
 */
export class ProductQueryService implements IProductQueryService {
  
  private supabase: SupabaseClient;
  private queryCache: Map<string, { data: Product[], expiry: number }> = new Map();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  constructor(supabaseUrl: string, supabaseServiceRoleKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  /**
   * Exécuter une requête produits configurée
   * SOLID - Strategy Pattern : Différentes stratégies selon la configuration
   */
  async queryProducts(config: ProductQueryConfig): Promise<Product[]> {
    console.log(`📊 [ProductQuery] Exécution requête: ${config.table}`);
    console.log(`🔍 [ProductQuery] Filtres:`, config.filters);
    
    try {
      // Vérifier cache
      const cacheKey = this.generateCacheKey(config);
      const cached = this.getCachedQuery(cacheKey);
      if (cached) {
        console.log(`📋 [ProductQuery] Résultat depuis cache: ${cached.length} produits`);
        return cached;
      }

      // Construire la requête Supabase
      let query = this.supabase.from(config.table).select(this.buildSelectClause(config));

      // Appliquer les filtres
      query = this.applyFilters(query, config.filters);

      // Appliquer l'ordre
      if (config.orderBy) {
        query = query.order(config.orderBy);
      }

      // Appliquer la limite
      if (config.limit) {
        query = query.limit(config.limit);
      }

      // Exécuter la requête
      const { data, error } = await query;

      if (error) {
        console.error('❌ [ProductQuery] Erreur requête:', error);
        return [];
      }

      // Mapper les résultats vers le format unifié
      const products = this.mapToProducts(data || [], config);
      
      // Mettre en cache
      this.setCachedQuery(cacheKey, products);
      
      console.log(`✅ [ProductQuery] ${products.length} produits récupérés`);
      return products;
      
    } catch (error) {
      console.error('❌ [ProductQuery] Erreur queryProducts:', error);
      return [];
    }
  }

  /**
   * Récupérer produits par catégorie
   * SOLID - Facade Pattern : Interface simplifiée pour cas courant
   */
  async getProductsByCategory(restaurantId: number, category: string): Promise<Product[]> {
    console.log(`📂 [ProductQuery] Récupération catégorie: ${category} pour restaurant: ${restaurantId}`);
    
    const config: ProductQueryConfig = {
      table: 'france_products',
      joins: ['france_menu_categories'],
      filters: {
        'france_products.restaurant_id': restaurantId,
        'france_products.is_active': true,
        'france_menu_categories.slug': category
      },
      orderBy: 'display_order'
    };

    return await this.queryProducts(config);
  }

  /**
   * Récupérer un produit par ID
   * SOLID - Single Responsibility : Une méthode pour une tâche
   */
  async getProductById(productId: number): Promise<Product | null> {
    console.log(`🔍 [ProductQuery] Récupération produit ID: ${productId}`);
    
    try {
      const { data, error } = await this.supabase
        .from('france_products')
        .select(`
          *,
          france_menu_categories (
            name,
            slug
          )
        `)
        .eq('id', productId)
        .single();

      if (error || !data) {
        console.error('❌ [ProductQuery] Produit non trouvé:', error);
        return null;
      }

      return this.mapSingleProduct(data);
      
    } catch (error) {
      console.error('❌ [ProductQuery] Erreur getProductById:', error);
      return null;
    }
  }

  /**
   * Recherche produits avec requête personnalisée
   * SOLID - Command Pattern : Encapsule la requête personnalisée
   */
  async customQuery(
    table: string,
    selectClause: string,
    whereClause: string,
    parameters: any[] = []
  ): Promise<Product[]> {
    
    console.log(`🔧 [ProductQuery] Requête personnalisée: ${table}`);
    console.log(`📝 [ProductQuery] WHERE: ${whereClause}`);
    
    try {
      // Construction de la requête brute si nécessaire
      // Pour l'instant, utiliser les méthodes Supabase standard
      
      const { data, error } = await this.supabase
        .from(table)
        .select(selectClause);
      // TODO: Ajouter support pour whereClause dynamique

      if (error) {
        console.error('❌ [ProductQuery] Erreur requête personnalisée:', error);
        return [];
      }

      return this.mapToProducts(data || [], { table, filters: {} });
      
    } catch (error) {
      console.error('❌ [ProductQuery] Erreur customQuery:', error);
      return [];
    }
  }

  // ================================================
  // REQUÊTES SPÉCIALISÉES PIZZA YOLO (COMPATIBILITÉ)
  // ================================================

  /**
   * Récupérer pizzas par taille (compatibilité Pizza Yolo)
   * SOLID - Adapter Pattern : Adapte l'ancien système au nouveau
   */
  async getPizzasBySize(restaurantId: number, sizeName: string): Promise<Product[]> {
    console.log(`🍕 [ProductQuery] Récupération pizzas ${sizeName} pour restaurant: ${restaurantId}`);
    
    const config: ProductQueryConfig = {
      table: 'france_product_sizes',
      joins: ['france_products', 'france_menu_categories'],
      filters: {
        'france_product_sizes.size_name': sizeName,
        'france_products.restaurant_id': restaurantId,
        'france_products.is_active': true,
        'france_menu_categories.slug': 'pizzas'
      },
      orderBy: 'display_order'
    };

    return await this.queryProducts(config);
  }

  /**
   * Récupérer boissons par variant (compatibilité)
   */
  async getDrinksByVariant(restaurantId: number, variantName: string): Promise<Product[]> {
    console.log(`🥤 [ProductQuery] Récupération boissons ${variantName} pour restaurant: ${restaurantId}`);
    
    const config: ProductQueryConfig = {
      table: 'france_product_variants',
      joins: ['france_products', 'france_menu_categories'],
      filters: {
        'france_product_variants.variant_name': variantName,
        'france_products.restaurant_id': restaurantId,
        'france_products.is_active': true,
        'france_menu_categories.slug': 'drinks'
      },
      orderBy: 'display_order'
    };

    return await this.queryProducts(config);
  }

  /**
   * Récupérer produits snacks avec nom spécifique (compatibilité)
   */
  async getSnacksByName(restaurantId: number, productName: string): Promise<Product[]> {
    console.log(`🍗 [ProductQuery] Récupération snacks "${productName}" pour restaurant: ${restaurantId}`);
    
    const config: ProductQueryConfig = {
      table: 'france_products',
      joins: ['france_menu_categories'],
      filters: {
        'france_products.name': productName,
        'france_products.restaurant_id': restaurantId,
        'france_products.is_active': true
      },
      limit: 1
    };

    return await this.queryProducts(config);
  }

  // ================================================
  // MÉTHODES PRIVÉES - CONSTRUCTION REQUÊTES
  // ================================================

  private buildSelectClause(config: ProductQueryConfig): string {
    let selectClause = '*';
    
    // Si des joins sont spécifiés, construire un select avec relations
    if (config.joins && config.joins.length > 0) {
      const relations = config.joins.map(join => {
        // Mapper les noms de tables aux relations Supabase
        switch (join) {
          case 'france_menu_categories':
            return 'france_menu_categories (id, name, slug)';
          case 'france_product_sizes':
            return 'france_product_sizes (id, size_name, price_on_site, price_delivery)';
          case 'france_product_variants':
            return 'france_product_variants (id, variant_name, price_on_site, price_delivery, quantity, unit)';
          default:
            return join;
        }
      });
      
      selectClause = `*, ${relations.join(', ')}`;
    }
    
    return selectClause;
  }

  private applyFilters(query: any, filters: Record<string, any>): any {
    for (const [field, value] of Object.entries(filters)) {
      if (value === null) {
        query = query.is(field, null);
      } else if (Array.isArray(value)) {
        query = query.in(field, value);
      } else {
        query = query.eq(field, value);
      }
    }
    return query;
  }

  private mapToProducts(data: any[], config: ProductQueryConfig): Product[] {
    return data.map(item => this.mapSingleProduct(item, config));
  }

  private mapSingleProduct(item: any, config?: ProductQueryConfig): Product {
    // Mapper selon la table source
    if (config?.table === 'france_product_sizes') {
      return this.mapProductSizeToProduct(item);
    } else if (config?.table === 'france_product_variants') {
      return this.mapProductVariantToProduct(item);
    } else {
      return this.mapDirectProduct(item);
    }
  }

  private mapDirectProduct(item: any): Product {
    return {
      id: item.id,
      restaurantId: item.restaurant_id,
      name: item.name,
      description: item.description,
      composition: item.composition,
      basePrice: parseFloat(item.price_on_site_base || item.base_price || '0'),
      deliveryPrice: parseFloat(item.price_delivery_base || item.basePrice || '0'),
      category: item.france_menu_categories?.slug || 'unknown',
      isActive: item.is_active,
      metadata: {
        productType: item.product_type,
        displayOrder: item.display_order,
        originalData: item
      }
    };
  }

  private mapProductSizeToProduct(item: any): Product {
    const product = item.france_products;
    return {
      id: product.id,
      restaurantId: product.restaurant_id,
      name: product.name,
      description: product.description,
      composition: product.composition,
      basePrice: parseFloat(item.price_on_site || '0'),
      deliveryPrice: parseFloat(item.price_delivery || item.price_on_site || '0'),
      category: product.france_menu_categories?.slug || 'pizzas',
      isActive: product.is_active,
      metadata: {
        sizeName: item.size_name,
        sizeId: item.id,
        productType: product.product_type,
        displayOrder: item.display_order,
        originalData: { product, size: item }
      }
    };
  }

  private mapProductVariantToProduct(item: any): Product {
    const product = item.france_products;
    return {
      id: product.id,
      restaurantId: product.restaurant_id,
      name: product.name,
      description: product.description,
      composition: product.composition,
      basePrice: parseFloat(item.price_on_site || '0'),
      deliveryPrice: parseFloat(item.price_delivery || item.price_on_site || '0'),
      category: product.france_menu_categories?.slug || 'drinks',
      isActive: product.is_active,
      metadata: {
        variantName: item.variant_name,
        variantId: item.id,
        quantity: item.quantity,
        unit: item.unit,
        productType: product.product_type,
        displayOrder: item.display_order,
        originalData: { product, variant: item }
      }
    };
  }

  // ================================================
  // GESTION CACHE
  // ================================================

  private generateCacheKey(config: ProductQueryConfig): string {
    return JSON.stringify({
      table: config.table,
      filters: config.filters,
      joins: config.joins || [],
      orderBy: config.orderBy,
      limit: config.limit
    });
  }

  private getCachedQuery(cacheKey: string): Product[] | null {
    const cached = this.queryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    
    // Cache expiré
    this.queryCache.delete(cacheKey);
    return null;
  }

  private setCachedQuery(cacheKey: string, products: Product[]): void {
    this.queryCache.set(cacheKey, {
      data: products,
      expiry: Date.now() + this.CACHE_TTL
    });
  }

  /**
   * Nettoyer le cache expiré
   */
  cleanExpiredCache(): number {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [key, value] of this.queryCache.entries()) {
      if (now >= value.expiry) {
        this.queryCache.delete(key);
        cleaned++;
      }
    }
    
    console.log(`🧹 [ProductQuery] ${cleaned} entrées de cache nettoyées`);
    return cleaned;
  }

  /**
   * Obtenir statistiques du cache
   */
  getCacheStats(): { totalEntries: number, totalSize: number } {
    let totalSize = 0;
    
    for (const value of this.queryCache.values()) {
      totalSize += value.data.length;
    }
    
    return {
      totalEntries: this.queryCache.size,
      totalSize
    };
  }
}