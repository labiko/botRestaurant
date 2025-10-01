import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseFranceService } from './supabase-france.service';
import { FuseauHoraireService } from './fuseau-horaire.service';

export interface FranceDriver {
  id: number;
  restaurant_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  is_active: boolean;
  is_online?: boolean;  // NOUVEAU - Statut en ligne
  current_latitude?: number;
  current_longitude?: number;
  last_location_update?: string;
  created_at: string;
  updated_at: string;
  // Stats calculées
  total_deliveries?: number;
  today_deliveries?: number;
  active_orders?: number;
}

export interface CreateDriverRequest {
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  access_code: string;
  is_online: boolean;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DriversFranceService {
  private driversSubject = new BehaviorSubject<FranceDriver[]>([]);
  public drivers$ = this.driversSubject.asObservable();

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private fuseauHoraireService: FuseauHoraireService
  ) { }

  /**
   * Charger les livreurs d'un restaurant
   */
  async loadDrivers(restaurantId: number): Promise<void> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement livreurs:', error);
        this.driversSubject.next([]);
        return;
      }

      // Enrichir avec les statistiques
      const enrichedDrivers = await Promise.all(
        (data || []).map(async (driver: any) => {
          const stats = await this.getDriverStats(driver.id);
          return {
            ...driver,
            ...stats
          };
        })
      );

      this.driversSubject.next(enrichedDrivers);
      console.log(`✅ [DriversFrance] ${enrichedDrivers.length} livreurs chargés`);
    } catch (error) {
      console.error('Erreur service livreurs:', error);
      this.driversSubject.next([]);
    }
  }

  /**
   * Obtenir les statistiques d'un livreur
   */
  private async getDriverStats(driverId: number): Promise<Partial<FranceDriver>> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Compter les livraisons totales
      const { count: totalDeliveries } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', driverId)
        .eq('status', 'livree');

      // Compter les livraisons du jour
      const { count: todayDeliveries } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', driverId)
        .eq('status', 'livree')
        .gte('updated_at', today);

      // Compter les commandes actives
      const { count: activeOrders } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', driverId)
        .in('status', ['prete', 'en_livraison']);

      return {
        total_deliveries: totalDeliveries || 0,
        today_deliveries: todayDeliveries || 0,
        active_orders: activeOrders || 0
      };
    } catch (error) {
      console.error('Erreur calcul statistiques livreur:', error);
      return {
        total_deliveries: 0,
        today_deliveries: 0,
        active_orders: 0
      };
    }
  }

  /**
   * Créer un nouveau livreur
   */
  async createDriver(restaurantId: number, driverData: CreateDriverRequest): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .insert({
          restaurant_id: restaurantId,
          first_name: driverData.first_name,
          last_name: driverData.last_name,
          phone_number: driverData.phone_number,
          email: driverData.email,
          password: driverData.access_code, // Code 6 chiffres au lieu du hash
          is_active: driverData.is_active,
          is_online: driverData.is_online
        });

      if (error) {
        console.error('Erreur création livreur:', error);
        return false;
      }

      // Recharger la liste
      await this.loadDrivers(restaurantId);
      return true;
    } catch (error) {
      console.error('Erreur service création livreur:', error);
      return false;
    }
  }

  /**
   * Mettre à jour le statut d'un livreur
   */
  async updateDriverStatus(driverId: number, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .update({
          is_active: isActive,
          updated_at: await this.fuseauHoraireService.getCurrentDatabaseTimeForRestaurant()
        })
        .eq('id', driverId);

      if (error) {
        console.error('Erreur mise à jour statut livreur:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur service mise à jour statut:', error);
      return false;
    }
  }

  /**
   * NOUVEAU - Mettre à jour le statut en ligne d'un livreur
   */
  async updateDriverOnlineStatus(driverId: number, isOnline: boolean): Promise<boolean> {
    try {
      const updateData: any = {
        is_online: isOnline,
        updated_at: await this.fuseauHoraireService.getCurrentDatabaseTimeForRestaurant()
      };

      // Si on met en ligne, mettre à jour la localisation
      if (isOnline) {
        updateData.last_location_update = await this.fuseauHoraireService.getCurrentDatabaseTimeForRestaurant();
      }

      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .update(updateData)
        .eq('id', driverId);

      if (error) {
        console.error('Erreur mise à jour statut en ligne livreur:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur service mise à jour statut en ligne:', error);
      return false;
    }
  }

  /**
   * Supprimer un livreur
   */
  async deleteDriver(driverId: number): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .delete()
        .eq('id', driverId);

      if (error) {
        console.error('Erreur suppression livreur:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur service suppression livreur:', error);
      return false;
    }
  }

  /**
   * Obtenir le nombre de livreurs actifs pour un restaurant
   */
  async getActiveDriversCount(restaurantId: number): Promise<number> {
    try {
      const { count } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .eq('is_online', true); // AJOUTÉ : même logique que findAvailableDrivers

      return count || 0;
    } catch (error) {
      console.error('Erreur comptage livreurs actifs:', error);
      return 0;
    }
  }

  /**
   * Helpers de formatage
   */
  getDriverFullName(driver: FranceDriver): string {
    // Si first_name et last_name sont identiques, afficher seulement une fois
    if (driver.first_name === driver.last_name) {
      return driver.first_name;
    }
    return `${driver.first_name} ${driver.last_name}`;
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'success' : 'medium';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  formatPhone(phone: string): string {
    // Format français: +33 6 12 34 56 78
    if (phone.startsWith('33')) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 7)} ${phone.slice(7, 9)} ${phone.slice(9)}`;
    }
    return phone;
  }
}