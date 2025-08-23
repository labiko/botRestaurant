/**
 * Repository pour les Menus
 * Infrastructure Layer - Implémentation Supabase
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { IRepositoryWithFilter } from '../../core/interfaces/IRepository.ts';

export interface Menu {
  id: string;
  restaurantId: string;
  nomPlat: string;
  description?: string;
  prix: number;
  categorie: 'entree' | 'plat' | 'dessert' | 'boisson' | 'accompagnement';
  disponible: boolean;
  photoUrl?: string;
  ordreAffichage: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MenuRecord {
  id: string;
  restaurant_id: string;
  nom_plat: string;
  description?: string;
  prix: number;
  categorie: 'entree' | 'plat' | 'dessert' | 'boisson' | 'accompagnement';
  disponible: boolean;
  photo_url?: string;
  ordre_affichage: number;
  created_at?: string;
  updated_at?: string;
}

export class MenuRepository implements IRepositoryWithFilter<Menu> {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Menu | null> {
    const { data, error } = await this.supabase
      .from('menus')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Menu[]> {
    const { data, error } = await this.supabase
      .from('menus')
      .select('*')
      .eq('disponible', true)
      .order('ordre_affichage', { ascending: true });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findByFilter(filter: Record<string, any>): Promise<Menu[]> {
    let query = this.supabase.from('menus').select('*');

    Object.entries(filter).forEach(([key, value]) => {
      const dbKey = this.mapFieldToDb(key);
      query = query.eq(dbKey, value);
    });

    const { data, error } = await query.order('ordre_affichage', { ascending: true });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findOne(filter: Record<string, any>): Promise<Menu | null> {
    const results = await this.findByFilter(filter);
    return results.length > 0 ? results[0] : null;
  }

  async create(menu: Menu): Promise<Menu> {
    const record = this.mapToRecord(menu);

    const { data, error } = await this.supabase
      .from('menus')
      .insert(record)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create menu: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, updates: Partial<Menu>): Promise<Menu | null> {
    const record = this.mapToRecord(updates as Menu, true);

    const { data, error } = await this.supabase
      .from('menus')
      .update(record)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to update menu:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('menus')
      .delete()
      .eq('id', id);

    return !error;
  }

  /**
   * Méthodes spécifiques aux menus
   */

  async findByRestaurant(restaurantId: string, availableOnly: boolean = true): Promise<Menu[]> {
    let query = this.supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (availableOnly) {
      query = query.eq('disponible', true);
    }

    const { data, error } = await query.order('ordre_affichage', { ascending: true });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findByRestaurantAndCategory(
    restaurantId: string, 
    categorie: Menu['categorie']
  ): Promise<Menu[]> {
    const { data, error } = await this.supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('categorie', categorie)
      .eq('disponible', true)
      .order('ordre_affichage', { ascending: true });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findByRestaurantPaginated(
    restaurantId: string,
    page: number,
    pageSize: number
  ): Promise<{
    data: Menu[];
    total: number;
    hasNext: boolean;
    currentPage: number;
  }> {
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await this.supabase
      .from('menus')
      .select('*', { count: 'exact' })
      .eq('restaurant_id', restaurantId)
      .eq('disponible', true)
      .order('ordre_affichage', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error || !data) {
      return {
        data: [],
        total: 0,
        hasNext: false,
        currentPage: page
      };
    }

    return {
      data: data.map(record => this.mapToEntity(record)),
      total: count || 0,
      hasNext: (count || 0) > offset + pageSize,
      currentPage: page
    };
  }

  async searchMenuItems(searchTerm: string, restaurantId?: string): Promise<Menu[]> {
    let query = this.supabase
      .from('menus')
      .select('*')
      .or(`nom_plat.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .eq('disponible', true);

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query
      .order('ordre_affichage', { ascending: true })
      .limit(20);

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async getMenuByIds(menuIds: string[]): Promise<Menu[]> {
    if (menuIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from('menus')
      .select('*')
      .in('id', menuIds)
      .eq('disponible', true);

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async updateAvailability(id: string, disponible: boolean): Promise<boolean> {
    const { error } = await this.supabase
      .from('menus')
      .update({ 
        disponible, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    return !error;
  }

  async getCategoriesForRestaurant(restaurantId: string): Promise<Menu['categorie'][]> {
    const { data, error } = await this.supabase
      .from('menus')
      .select('categorie')
      .eq('restaurant_id', restaurantId)
      .eq('disponible', true);

    if (error || !data) return [];

    const categories = [...new Set(data.map(item => item.categorie))];
    return categories as Menu['categorie'][];
  }

  private mapFieldToDb(field: string): string {
    const mapping: Record<string, string> = {
      restaurantId: 'restaurant_id',
      nomPlat: 'nom_plat',
      photoUrl: 'photo_url',
      ordreAffichage: 'ordre_affichage',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };
    
    return mapping[field] || field;
  }

  private mapToEntity(record: MenuRecord): Menu {
    return {
      id: record.id,
      restaurantId: record.restaurant_id,
      nomPlat: record.nom_plat,
      description: record.description,
      prix: record.prix,
      categorie: record.categorie,
      disponible: record.disponible,
      photoUrl: record.photo_url,
      ordreAffichage: record.ordre_affichage,
      createdAt: record.created_at ? new Date(record.created_at) : undefined,
      updatedAt: record.updated_at ? new Date(record.updated_at) : undefined
    };
  }

  private mapToRecord(menu: Menu, isUpdate: boolean = false): Partial<MenuRecord> {
    const record: Partial<MenuRecord> = {
      restaurant_id: menu.restaurantId,
      nom_plat: menu.nomPlat,
      description: menu.description,
      prix: menu.prix,
      categorie: menu.categorie,
      disponible: menu.disponible,
      photo_url: menu.photoUrl,
      ordre_affichage: menu.ordreAffichage
    };

    if (!isUpdate) {
      record.id = menu.id;
    }

    return record;
  }
}