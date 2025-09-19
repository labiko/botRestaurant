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
      // 1. Récupérer le produit avec restaurant_id pour sécurité
      this.supabase
        .from('france_products')
        .select('name, restaurant_id')
        .eq('id', productId)
        .single()
    ).pipe(
      switchMap(({ data: product, error: fetchError }) => {
        if (fetchError) throw fetchError;

        // 2. Mettre à jour le produit (comportement existant préservé)
        return from(
          this.supabase
            .from('france_products')
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq('id', productId)
        ).pipe(
          switchMap(({ error: updateError }) => {
            if (updateError) throw updateError;

            // 3. 🎯 SYNCHRONISER LES OPTIONS WORKFLOW (nouveau comportement)
            console.log(`🔄 Synchronisation options pour "${product.name}" (restaurant ${product.restaurant_id}): ${isActive}`);

            // D'abord récupérer les IDs des produits de ce restaurant
            return from(
              this.supabase
                .from('france_products')
                .select('id')
                .eq('restaurant_id', product.restaurant_id)
            ).pipe(
              switchMap(({ data: restaurantProducts, error: productError }) => {
                if (productError) throw productError;

                const productIds = restaurantProducts?.map(p => p.id) || [];

                // Puis synchroniser les options de ces produits seulement
                return from(
                  this.supabase
                    .from('france_product_options')
                    .update({ is_active: isActive })
                    .ilike('option_name', `%${product.name}%`)
                    .in('product_id', productIds)
                ).pipe(
                  switchMap(({ error: syncError }) => {
                    if (syncError) {
                      console.error('❌ Erreur synchronisation options:', syncError);
                      return from([null]);
                    } else {
                      console.log('✅ Options workflow synchronisées');

                      // 🎯 RÉORGANISATION TOTALE si désactivation
                      if (isActive === false) {
                        console.log('🔄 Réorganisation globale des numéros boissons...');
                        return from(this.renumberAllBeverageOptions(product.restaurant_id));
                      }

                      return from([null]);
                    }
                  })
                );
              })
            );
          })
        );
      }),
      map(() => {
        // Return void as expected (comportement existant préservé)
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
   * Met à jour uniquement le statut actif/inactif d'une taille de produit
   */
  updateProductSizeStatus(sizeId: number, isActive: boolean): Observable<void> {
    return from(
      this.supabase
        .from('france_product_sizes')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', sizeId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour uniquement le statut actif/inactif d'une option de produit (viande, sauce, etc.)
   */
  updateProductOptionStatus(optionId: number, isActive: boolean): Observable<void> {
    return from(
      this.supabase
        .from('france_product_options')
        .update({ 
          is_active: isActive
        })
        .eq('id', optionId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Crée une nouvelle taille pour un produit
   */
  createProductSize(productId: number, sizeData: Omit<ProductSize, 'id'>): Observable<ProductSize> {
    const newSize = {
      product_id: productId,
      size_name: sizeData.size_name,
      price_on_site: sizeData.price_on_site,
      price_delivery: sizeData.price_delivery,
      includes_drink: sizeData.includes_drink,
      display_order: sizeData.display_order || 0
    };

    return from(
      this.supabase
        .from('france_product_sizes')
        .insert(newSize)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ProductSize;
      })
    );
  }

  /**
   * Crée un nouveau produit
   */
  createProduct(restaurantId: number, productData: Partial<FranceProduct>): Observable<FranceProduct> {
    const newProduct = {
      restaurant_id: restaurantId,
      category_id: productData.category_id,
      name: productData.name,
      description: productData.description || null,
      product_type: productData.product_type,
      base_price: productData.base_price || null,
      composition: productData.composition || null,
      display_order: productData.display_order || 0,
      is_active: productData.is_active !== undefined ? productData.is_active : true,
      price_on_site_base: productData.price_on_site_base || null,
      price_delivery_base: productData.price_delivery_base || null,
      workflow_type: productData.workflow_type || null,
      requires_steps: productData.requires_steps !== undefined ? productData.requires_steps : false,
      steps_config: productData.steps_config || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return from(
      this.supabase
        .from('france_products')
        .insert(newProduct)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as FranceProduct;
      })
    );
  }

  /**
   * Crée une nouvelle option pour un produit
   */
  createProductOption(productId: number, optionData: Omit<ProductOption, 'id'>): Observable<ProductOption> {
    const newOption = {
      product_id: productId,
      option_group: optionData.option_group,
      option_name: optionData.option_name,
      price_modifier: optionData.price_modifier || 0,
      is_required: optionData.is_required || false,
      max_selections: optionData.max_selections || 1,
      display_order: optionData.display_order || 0,
      is_active: optionData.is_active !== undefined ? optionData.is_active : true,
      group_order: optionData.group_order || 0
    };

    return from(
      this.supabase
        .from('france_product_options')
        .insert(newOption)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ProductOption;
      })
    );
  }

  /**
   * Met à jour une option existante
   */
  updateProductOption(optionId: number, updates: Partial<ProductOption>): Observable<void> {
    return from(
      this.supabase
        .from('france_product_options')
        .update(updates)
        .eq('id', optionId)
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
   * Ajoute un élément composite à un produit
   */
  addCompositeItem(compositeItem: Omit<CompositeItem, 'id'>): Observable<CompositeItem> {
    return from(
      this.supabase
        .from('france_composite_items')
        .insert(compositeItem)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as CompositeItem;
      })
    );
  }

  /**
   * Met à jour un élément composite
   */
  updateCompositeItem(itemId: number, updates: Partial<CompositeItem>): Observable<void> {
    return from(
      this.supabase
        .from('france_composite_items')
        .update(updates)
        .eq('id', itemId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Supprime un élément composite
   */
  deleteCompositeItem(itemId: number): Observable<void> {
    return from(
      this.supabase
        .from('france_composite_items')
        .delete()
        .eq('id', itemId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Supprime tous les éléments composites d'un produit
   */
  deleteAllCompositeItems(productId: number): Observable<void> {
    return from(
      this.supabase
        .from('france_composite_items')
        .delete()
        .eq('composite_product_id', productId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour complètement un produit composite avec ses éléments
   * Utilise la fonction SQL update_composite_items
   */
  updateCompositeProduct(productId: number, productUpdates: Partial<FranceProduct>, compositeItems: CompositeItem[]): Observable<void> {
    // D'abord mettre à jour le produit principal
    return this.updateProduct(productId, productUpdates).pipe(
      switchMap(() => {
        // Ensuite mettre à jour les éléments composites
        // La fonction SQL attend: p_product_id en premier, p_items en second
        return from(
          this.supabase.rpc('update_composite_items', {
            p_product_id: productId,
            p_items: compositeItems
          })
        );
      }),
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
      // Récupérer slug de la catégorie
      this.supabase
        .from('france_menu_categories')
        .select('slug')
        .eq('id', categoryId)
        .single()
    ).pipe(
      switchMap(({ data: category, error: fetchError }) => {
        if (fetchError) throw fetchError;

        // Cast explicite pour TypeScript
        const categoryData = category as { slug: string };

        // Mise à jour standard de la catégorie
        return from(
          this.supabase
            .from('france_menu_categories')
            .update(updates)
            .eq('id', categoryId)
        ).pipe(
          switchMap(({ error }) => {
            if (error) throw error;

            // 🚫 SYNCHRONISATION GLOBALE BOISSONS SUPPRIMÉE
            // Désactiver toute la catégorie casse les workflows qui attendent des boissons incluses
            // Les restaurateurs gèrent plutôt les ruptures stock boisson par boisson

            return from([null]);
          })
        );
      }),
      map(() => {
        // Return void as expected
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
   * Renuméroте toutes les options boissons du restaurant
   */
  private async renumberAllBeverageOptions(restaurantId: number): Promise<void> {
    try {
      // 1. D'abord récupérer les IDs des produits qui ont des options boissons
      const { data: productsWithBeverageOptions, error: optionsError } = await this.supabase
        .from('france_product_options')
        .select('product_id')
        .eq('option_group', 'Boisson 33CL incluse');

      if (optionsError) throw optionsError;
      if (!productsWithBeverageOptions || productsWithBeverageOptions.length === 0) return;

      const productIdsWithBeverages = [...new Set(productsWithBeverageOptions.map(item => item.product_id))];

      // 2. Puis filtrer par restaurant
      const { data: productsWithBeverages, error: productsError } = await this.supabase
        .from('france_products')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .in('id', productIdsWithBeverages);

      if (productsError) throw productsError;
      if (!productsWithBeverages || productsWithBeverages.length === 0) return;

      // 3. Renuméroter les options de chaque produit
      const renumberPromises = productsWithBeverages.map(product =>
        this.renumberSingleProductOptions(product.id)
      );

      await Promise.all(renumberPromises);

      console.log(`✅ ${productsWithBeverages.length} produits renumérotés globalement`);

    } catch (error) {
      console.error('❌ Erreur réorganisation globale:', error);
      throw error;
    }
  }

  /**
   * Renuméroте les options boissons d'un seul produit
   */
  private async renumberSingleProductOptions(productId: number): Promise<void> {
    try {
      // Récupérer les options actives de ce produit
      const { data: activeOptions, error: optionsError } = await this.supabase
        .from('france_product_options')
        .select('id, option_name, display_order')
        .eq('product_id', productId)
        .eq('option_group', 'Boisson 33CL incluse')
        .eq('is_active', true);

      if (optionsError) throw optionsError;
      if (!activeOptions || activeOptions.length === 0) return;

      // 🎯 TRIER PAR NOM NETTOYÉ (sans émojis) pour éviter désordre
      const sortedOptions = activeOptions.sort((a, b) => {
        const cleanNameA = a.option_name.replace(/^[0-9️⃣🔟]+\s*/, '').trim();
        const cleanNameB = b.option_name.replace(/^[0-9️⃣🔟]+\s*/, '').trim();
        return cleanNameA.localeCompare(cleanNameB);
      });

      // Renuméroter avec séquence propre
      const updatePromises = sortedOptions.map((option, index) => {
        const newNumber = this.getNumberEmoji(index + 1);
        const cleanName = option.option_name.replace(/^[0-9️⃣🔟]+\s*/, '').trim();
        const newName = `${newNumber} ${cleanName}`;

        return this.supabase
          .from('france_product_options')
          .update({
            option_name: newName,
            display_order: index + 1 // Mettre à jour l'ordre d'affichage aussi
          })
          .eq('id', option.id);
      });

      await Promise.all(updatePromises);

      console.log(`✅ Produit ${productId}: ${sortedOptions.length} options renumérotées en séquence`);

    } catch (error) {
      console.error(`❌ Erreur renumérotation produit ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Génère l'emoji numéro correspondant
   */
  private getNumberEmoji(num: number): string {
    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];

    if (num <= 10) {
      return emojis[num - 1];
    }

    if (num === 11) return '1️⃣1️⃣';
    if (num === 12) return '1️⃣2️⃣';

    // Pour les nombres > 12, utiliser format textuel
    return `${num}️⃣`;
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