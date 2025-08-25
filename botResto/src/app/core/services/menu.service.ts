import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

// ====================================
// INTERFACES BASÉES SUR LA STRUCTURE DB
// ====================================

export interface MenuItem {
  id: string;
  restaurant_id: string;
  nom_plat: string;
  description?: string;
  prix: number; // en GNF entiers (ex: 220000 = 220 000 GNF)
  categorie: 'entree' | 'plat' | 'dessert' | 'boisson' | 'accompagnement';
  disponible: boolean;
  photo_url?: string;
  ordre_affichage: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMenuItemRequest {
  restaurant_id: string;
  nom_plat: string;
  description?: string;
  prix: number;
  categorie: 'entree' | 'plat' | 'dessert' | 'boisson' | 'accompagnement';
  disponible?: boolean;
  photo_url?: string;
  ordre_affichage?: number;
}

export interface UpdateMenuItemRequest {
  nom_plat?: string;
  description?: string;
  prix?: number;
  categorie?: 'entree' | 'plat' | 'dessert' | 'boisson' | 'accompagnement';
  disponible?: boolean;
  photo_url?: string;
  ordre_affichage?: number;
}

export interface MenuItemsStats {
  total_items: number;
  available_items: number;
  categories: {
    [key: string]: number;
  };
  average_price: number;
  most_expensive_item?: MenuItem;
  cheapest_item?: MenuItem;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private supabase = this.supabaseService.client;
  private currency: string = 'GNF'; // Devise par défaut

  constructor(private supabaseService: SupabaseService) {}

  // ====================================
  // CRUD OPERATIONS - MENU ITEMS
  // ====================================

  /**
   * Récupérer tous les menus d'un restaurant
   */
  async getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    console.log(`🍽️ Loading menu items for restaurant ${restaurantId}`);

    const { data, error } = await this.supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('categorie', { ascending: true })
      .order('ordre_affichage', { ascending: true })
      .order('nom_plat', { ascending: true });

    if (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }

    console.log(`✅ Loaded ${data?.length || 0} menu items`);
    return data || [];
  }

  /**
   * Récupérer les menus par catégorie
   */
  async getMenuItemsByCategory(restaurantId: string, categorie: string): Promise<MenuItem[]> {
    const { data, error } = await this.supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('categorie', categorie)
      .eq('disponible', true)
      .order('ordre_affichage', { ascending: true })
      .order('nom_plat', { ascending: true });

    if (error) {
      console.error('Error fetching menu items by category:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Créer un nouvel item de menu
   */
  async createMenuItem(request: CreateMenuItemRequest): Promise<MenuItem> {
    console.log(`🍽️ Creating new menu item:`, request);

    // Valider le prix (doit être positif)
    if (request.prix <= 0) {
      throw new Error('Le prix doit être supérieur à 0');
    }

    // Définir l'ordre d'affichage par défaut si non spécifié
    if (request.ordre_affichage === undefined) {
      const { count } = await this.supabase
        .from('menus')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', request.restaurant_id)
        .eq('categorie', request.categorie);
      
      request.ordre_affichage = (count || 0) + 1;
    }

    const { data, error } = await this.supabase
      .from('menus')
      .insert({
        restaurant_id: request.restaurant_id,
        nom_plat: request.nom_plat.trim(),
        description: request.description?.trim() || null,
        prix: request.prix,
        categorie: request.categorie,
        disponible: request.disponible ?? true,
        photo_url: request.photo_url?.trim() || null,
        ordre_affichage: request.ordre_affichage
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating menu item:', error);
      
      // Messages d'erreur personnalisés
      if (error.code === '23505') {
        throw new Error('Un plat avec ce nom existe déjà dans cette catégorie');
      }
      
      throw error;
    }

    console.log(`✅ Menu item created successfully:`, data);
    return data;
  }

  /**
   * Mettre à jour un item de menu
   */
  async updateMenuItem(itemId: string, request: UpdateMenuItemRequest): Promise<MenuItem> {
    console.log(`🍽️ Updating menu item ${itemId}:`, request);

    // Valider le prix si fourni
    if (request.prix !== undefined && request.prix <= 0) {
      throw new Error('Le prix doit être supérieur à 0');
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Ne mettre à jour que les champs fournis
    if (request.nom_plat !== undefined) {
      updateData.nom_plat = request.nom_plat.trim();
    }
    if (request.description !== undefined) {
      updateData.description = request.description?.trim() || null;
    }
    if (request.prix !== undefined) {
      updateData.prix = request.prix;
    }
    if (request.categorie !== undefined) {
      updateData.categorie = request.categorie;
    }
    if (request.disponible !== undefined) {
      updateData.disponible = request.disponible;
    }
    if (request.photo_url !== undefined) {
      updateData.photo_url = request.photo_url?.trim() || null;
    }
    if (request.ordre_affichage !== undefined) {
      updateData.ordre_affichage = request.ordre_affichage;
    }

    const { data, error } = await this.supabase
      .from('menus')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }

    console.log(`✅ Menu item updated successfully:`, data);
    return data;
  }

  /**
   * Supprimer un item de menu
   */
  async deleteMenuItem(itemId: string): Promise<void> {
    console.log(`🗑️ Deleting menu item ${itemId}`);

    const { error } = await this.supabase
      .from('menus')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }

    console.log(`✅ Menu item deleted successfully`);
  }

  /**
   * Basculer la disponibilité d'un item
   */
  async toggleMenuItemAvailability(itemId: string): Promise<MenuItem> {
    // D'abord récupérer l'état actuel
    const { data: currentItem, error: fetchError } = await this.supabase
      .from('menus')
      .select('disponible')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      console.error('Error fetching current menu item:', fetchError);
      throw fetchError;
    }

    // Basculer la disponibilité
    const newAvailability = !currentItem.disponible;
    
    return await this.updateMenuItem(itemId, {
      disponible: newAvailability
    });
  }

  // ====================================
  // STATISTIQUES ET ANALYSE
  // ====================================

  /**
   * Obtenir les statistiques du menu d'un restaurant
   */
  async getMenuStats(restaurantId: string): Promise<MenuItemsStats> {
    console.log(`📊 Calculating menu stats for restaurant ${restaurantId}`);

    const menuItems = await this.getMenuItemsByRestaurant(restaurantId);

    if (menuItems.length === 0) {
      return {
        total_items: 0,
        available_items: 0,
        categories: {},
        average_price: 0
      };
    }

    const availableItems = menuItems.filter(item => item.disponible);
    const categories: { [key: string]: number } = {};
    let totalPrice = 0;

    // Calculer les statistiques
    menuItems.forEach(item => {
      categories[item.categorie] = (categories[item.categorie] || 0) + 1;
      totalPrice += item.prix;
    });

    // Trouver les items les plus chers et moins chers
    const sortedByPrice = [...menuItems].sort((a, b) => a.prix - b.prix);
    
    const stats: MenuItemsStats = {
      total_items: menuItems.length,
      available_items: availableItems.length,
      categories,
      average_price: Math.round(totalPrice / menuItems.length),
      cheapest_item: sortedByPrice[0],
      most_expensive_item: sortedByPrice[sortedByPrice.length - 1]
    };

    console.log(`📊 Menu stats calculated:`, stats);
    return stats;
  }

  /**
   * Réorganiser l'ordre d'affichage des items d'une catégorie
   */
  async reorderMenuItems(items: Array<{id: string, ordre_affichage: number}>): Promise<void> {
    console.log(`🔄 Reordering menu items:`, items);

    // Mettre à jour chaque item avec son nouvel ordre
    const updates = items.map(item => 
      this.supabase
        .from('menus')
        .update({ 
          ordre_affichage: item.ordre_affichage,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
    );

    await Promise.all(updates);
    console.log(`✅ Menu items reordered successfully`);
  }

  // ====================================
  // UTILITAIRES
  // ====================================

  /**
   * Définir la devise actuelle
   */
  setCurrency(currency: string) {
    this.currency = currency;
  }

  /**
   * Obtenir la devise actuelle
   */
  getCurrency(): string {
    return this.currency;
  }

  /**
   * Formater le prix pour l'affichage avec la devise configurée
   */
  formatPrice(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} ${this.currency}`;
  }

  /**
   * Convertir le prix d'affichage vers format base de données
   */
  convertToBaseAmount(amount: number): number {
    return Math.round(amount);
  }

  /**
   * Obtenir la liste des catégories disponibles
   */
  getAvailableCategories(): Array<{value: string, label: string, icon: string}> {
    return [
      { value: 'entree', label: 'Entrées', icon: 'restaurant' },
      { value: 'plat', label: 'Plats principaux', icon: 'pizza' },
      { value: 'accompagnement', label: 'Accompagnements', icon: 'leaf' },
      { value: 'dessert', label: 'Desserts', icon: 'ice-cream' },
      { value: 'boisson', label: 'Boissons', icon: 'wine' }
    ];
  }
}