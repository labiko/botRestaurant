import { Injectable } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFranceService } from '../../../core/services/supabase-france.service';

export type ProductType = 'simple' | 'modular' | 'variant' | 'composite';

export interface FranceProduct {
  id: number;
  restaurant_id: number;
  category_id: number;
  name: string;
  description?: string;
  product_type: ProductType;
  base_price?: number;
  composition?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  price_on_site_base?: number;
  price_delivery_base?: number;
  workflow_type?: string;
  requires_steps: boolean;
  steps_config?: any;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  price_on_site: number;
  price_delivery?: number;
  quantity?: number;
  unit?: string;
  is_menu: boolean;
  includes_description?: string;
  display_order: number;
  is_active: boolean;
}

export interface ProductSize {
  id: number;
  product_id: number;
  size_name: string;
  price_on_site: number;
  price_delivery?: number;
  includes_drink: boolean;
  display_order: number;
}

export interface ProductOption {
  id: number;
  product_id: number;
  option_group: string;
  option_name: string;
  price_modifier: number;
  is_required: boolean;
  max_selections: number;
  display_order: number;
  is_active: boolean;
  group_order: number;
}

export interface MenuCategory {
  id: number;
  restaurant_id: number;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export interface CompositeItem {
  id: number;
  composite_product_id: number;
  component_name: string;
  quantity: number;
  unit: string;
}

export interface ProductDisplayConfig {
  id: number;
  restaurant_id: number;
  product_id: number;
  display_type: string;
  template_name?: string;
  show_variants_first: boolean;
  custom_header_text?: string;
  custom_footer_text?: string;
  emoji_icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductManagementService {
  private supabase: SupabaseClient;

  constructor(private supabaseFranceService: SupabaseFranceService) {
    this.supabase = this.supabaseFranceService.client;
  }

  /**
   * Get restaurant configuration including hide_delivery_info flag
   */
  getRestaurantConfig(restaurantId: number): Observable<any> {
    return from(
      this.supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      })
    );
  }

  /**
   * Récupère tous les produits d'un restaurant avec leurs détails
   */
  getRestaurantProducts(restaurantId: number): Observable<FranceProduct[]> {
    return from(
      this.supabase
        .from('france_products')
        .select(`
          *,
          france_menu_categories(name, icon)
        `)
        .eq('restaurant_id', restaurantId)
        .order('display_order')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as FranceProduct[];
      })
    );
  }

  /**
   * Récupère les catégories du menu
   */
  getMenuCategories(restaurantId: number): Observable<MenuCategory[]> {
    return from(
      this.supabase
        .from('france_menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as MenuCategory[];
      })
    );
  }

  /**
   * Récupère les variantes d'un produit
   */
  getProductVariants(productId: number): Observable<ProductVariant[]> {
    return from(
      this.supabase
        .from('france_product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('display_order')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ProductVariant[];
      })
    );
  }

  /**
   * Récupère les tailles d'un produit
   */
  getProductSizes(productId: number): Observable<ProductSize[]> {
    return from(
      this.supabase
        .from('france_product_sizes')
        .select('*')
        .eq('product_id', productId)
        .order('display_order')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ProductSize[];
      })
    );
  }

  /**
   * Récupère les options d'un produit
   */
  getProductOptions(productId: number): Observable<ProductOption[]> {
    return from(
      this.supabase
        .from('france_product_options')
        .select('*')
        .eq('product_id', productId)
        .order('group_order', { ascending: true })
        .order('display_order', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ProductOption[];
      })
    );
  }

  /**
   * Récupère les éléments composites d'un produit
   */
  getCompositeItems(productId: number): Observable<CompositeItem[]> {
    return from(
      this.supabase
        .from('france_composite_items')
        .select('*')
        .eq('composite_product_id', productId)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as CompositeItem[];
      })
    );
  }

  /**
   * Récupère la configuration d'affichage d'un produit
   */
  getProductDisplayConfig(restaurantId: number, productId: number): Observable<ProductDisplayConfig | null> {
    return from(
      this.supabase
        .from('france_product_display_configs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('product_id', productId)
        .maybeSingle()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ProductDisplayConfig | null;
      })
    );
  }

  /**
   * Met à jour un produit
   */
  updateProduct(productId: number, updates: Partial<FranceProduct>): Observable<void> {
    return from(
      this.supabase
        .from('france_products')
        .update(updates)
        .eq('id', productId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour le statut d'activité d'un produit
   */
  updateProductStatus(productId: number, isActive: boolean): Observable<void> {
    return from(
      this.supabase
        .from('france_products')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', productId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour les prix d'un produit simple
   */
  updateSimpleProductPrices(productId: number, priceOnSite: number, priceDelivery: number): Observable<void> {
    return from(
      this.supabase
        .from('france_products')
        .update({ 
          price_on_site_base: priceOnSite,
          price_delivery_base: priceDelivery,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour une variante de produit
   */
  updateProductVariant(variantId: number, updates: Partial<ProductVariant>): Observable<void> {
    return from(
      this.supabase
        .from('france_product_variants')
        .update(updates)
        .eq('id', variantId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour une taille de produit
   */
  updateProductSize(sizeId: number, updates: Partial<ProductSize>): Observable<void> {
    return from(
      this.supabase
        .from('france_product_sizes')
        .update(updates)
        .eq('id', sizeId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour la configuration workflow d'un produit
   */
  updateProductWorkflow(productId: number, workflowType: string, requiresSteps: boolean, stepsConfig?: any): Observable<void> {
    return from(
      this.supabase
        .from('france_products')
        .update({ 
          workflow_type: workflowType,
          requires_steps: requiresSteps,
          steps_config: stepsConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Crée une nouvelle catégorie de menu
   */
  createMenuCategory(restaurantId: number, category: Omit<MenuCategory, 'id'>): Observable<MenuCategory> {
    return from(
      this.supabase
        .from('france_menu_categories')
        .insert({
          ...category,
          restaurant_id: restaurantId
        })
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as MenuCategory;
      })
    );
  }

  /**
   * Met à jour une catégorie de menu
   */
  updateMenuCategory(categoryId: number, updates: Partial<MenuCategory>): Observable<void> {
    return from(
      this.supabase
        .from('france_menu_categories')
        .update(updates)
        .eq('id', categoryId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Compte le nombre de variantes pour un produit
   */
  getVariantCount(productId: number): Observable<number> {
    return from(
      this.supabase
        .from('france_product_variants')
        .select('id', { count: 'exact' })
        .eq('product_id', productId)
    ).pipe(
      map(({ count, error }) => {
        if (error) throw error;
        return count || 0;
      })
    );
  }

  /**
   * Compte le nombre d'options pour un produit
   */
  getModuleCount(productId: number): Observable<number> {
    return from(
      this.supabase
        .from('france_product_options')
        .select('option_group', { count: 'exact' })
        .eq('product_id', productId)
    ).pipe(
      map(({ count, error }) => {
        if (error) throw error;
        return count || 0;
      })
    );
  }

  /**
   * Vérifie si un produit inclut des boissons
   */
  checkProductIncludesDrink(productId: number): Observable<boolean> {
    return this.getProductSizes(productId).pipe(
      map(sizes => sizes.some(size => size.includes_drink))
    );
  }

  /**
   * Récupère tous les détails d'un produit selon son type
   */
  getFullProductDetails(productId: number, productType: ProductType): Observable<any> {
    const baseProduct$ = from(
      this.supabase
        .from('france_products')
        .select('*')
        .eq('id', productId)
        .single()
    );

    switch (productType) {
      case 'simple':
        return baseProduct$;
        
      case 'variant':
        return baseProduct$.pipe(
          switchMap(({ data: product }) => 
            forkJoin({
              product: from([product]),
              variants: this.getProductVariants(productId)
            })
          )
        );
        
      case 'modular':
        return baseProduct$.pipe(
          switchMap(({ data: product }) => 
            forkJoin({
              product: from([product]),
              options: this.getProductOptions(productId),
              sizes: this.getProductSizes(productId)
            })
          )
        );
        
      case 'composite':
        return baseProduct$.pipe(
          switchMap(({ data: product }) => 
            forkJoin({
              product: from([product]),
              compositeItems: this.getCompositeItems(productId)
            })
          )
        );
        
      default:
        return baseProduct$;
    }
  }
}