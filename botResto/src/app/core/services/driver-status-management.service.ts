import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseFranceService } from './supabase-france.service';
import { FranceDriver } from './drivers-france.service';

export interface DriverStatusUpdate {
  driverId: number;
  isActive: boolean;
  updatedAt: string;
}

export interface StatusChangeResult {
  success: boolean;
  message: string;
  driver?: FranceDriver;
  impactMessage?: string;
}

export interface StatusValidationResult {
  canChangeStatus: boolean;
  reason?: string;
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DriverStatusManagementService {
  
  private statusUpdatesSubject = new BehaviorSubject<DriverStatusUpdate | null>(null);
  public statusUpdates$ = this.statusUpdatesSubject.asObservable();

  constructor(private supabaseFranceService: SupabaseFranceService) {}

  /**
   * Valider si le changement de statut est possible
   */
  async validateStatusChange(driverId: number, newStatus: boolean): Promise<StatusValidationResult> {
    try {
      const warnings: string[] = [];
      
      // Récupérer les infos du livreur
      const { data: driver, error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('*, restaurant_id')
        .eq('id', driverId)
        .single();

      if (error || !driver) {
        return {
          canChangeStatus: false,
          reason: 'Livreur introuvable',
          warnings: []
        };
      }

      // Si on désactive, vérifier les commandes en cours
      if (!newStatus) {
        const { count: activeOrdersCount } = await this.supabaseFranceService.client
          .from('france_orders')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', driverId)
          .in('status', ['assignee', 'en_livraison']);

        if (activeOrdersCount && activeOrdersCount > 0) {
          warnings.push(`⚠️ Le livreur a ${activeOrdersCount} commande(s) en cours`);
        }
      }

      // Si on active, vérifier qu'il y a assez de livreurs
      if (newStatus) {
        const { count: activeDriversCount } = await this.supabaseFranceService.client
          .from('france_delivery_drivers')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', driver.restaurant_id)
          .eq('is_active', true);

        if ((activeDriversCount || 0) === 0) {
          warnings.push('✅ Ce sera le premier livreur actif du restaurant');
        }
      }

      return {
        canChangeStatus: true,
        warnings
      };

    } catch (error) {
      console.error('❌ [DriverStatusManagement] Erreur validation:', error);
      return {
        canChangeStatus: false,
        reason: 'Erreur lors de la validation',
        warnings: []
      };
    }
  }

  /**
   * Changer le statut d'un livreur avec validation complète
   */
  async changeDriverStatus(driverId: number, newStatus: boolean): Promise<StatusChangeResult> {
    try {
      console.log(`🔄 [DriverStatusManagement] Changement statut livreur ${driverId} vers ${newStatus ? 'actif' : 'inactif'}`);

      // 1. Validation préalable
      const validation = await this.validateStatusChange(driverId, newStatus);
      if (!validation.canChangeStatus) {
        return {
          success: false,
          message: validation.reason || 'Changement de statut impossible'
        };
      }

      // 2. Mise à jour en base de données
      const { data: updatedDriver, error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ [DriverStatusManagement] Erreur mise à jour:', error);
        return {
          success: false,
          message: 'Erreur lors de la mise à jour du statut'
        };
      }

      // 3. Notifier les abonnés du changement
      const statusUpdate: DriverStatusUpdate = {
        driverId,
        isActive: newStatus,
        updatedAt: new Date().toISOString()
      };
      this.statusUpdatesSubject.next(statusUpdate);

      // 4. Générer le message d'impact
      const impactMessage = this.generateImpactMessage(newStatus, validation.warnings);

      console.log(`✅ [DriverStatusManagement] Statut livreur ${driverId} mis à jour avec succès`);

      return {
        success: true,
        message: `Statut mis à jour avec succès`,
        driver: updatedDriver,
        impactMessage
      };

    } catch (error) {
      console.error('❌ [DriverStatusManagement] Erreur changement statut:', error);
      return {
        success: false,
        message: 'Erreur technique lors du changement de statut'
      };
    }
  }

  /**
   * Générer le message d'impact selon le changement de statut
   */
  generateImpactMessage(newStatus: boolean, warnings: string[]): string {
    let message = newStatus 
      ? '✅ Le livreur recevra à nouveau les notifications de nouvelles commandes.'
      : '⚠️ Le livreur ne recevra plus aucun lien WhatsApp pour accepter les commandes.';

    if (warnings.length > 0) {
      message += '\n\n' + warnings.join('\n');
    }

    return message;
  }

  /**
   * Obtenir les statistiques de statut pour un restaurant
   */
  async getStatusStatistics(restaurantId: number): Promise<{
    totalDrivers: number;
    activeDrivers: number;
    inactiveDrivers: number;
    onlineDrivers: number;
  }> {
    try {
      // Compter tous les livreurs
      const { count: totalCount } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId);

      // Compter les livreurs actifs
      const { count: activeCount } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true);

      // Compter les livreurs en ligne
      const { count: onlineCount } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .eq('is_online', true);

      return {
        totalDrivers: totalCount || 0,
        activeDrivers: activeCount || 0,
        inactiveDrivers: (totalCount || 0) - (activeCount || 0),
        onlineDrivers: onlineCount || 0
      };

    } catch (error) {
      console.error('❌ [DriverStatusManagement] Erreur statistiques:', error);
      return {
        totalDrivers: 0,
        activeDrivers: 0,
        inactiveDrivers: 0,
        onlineDrivers: 0
      };
    }
  }

  /**
   * Obtenir l'historique des changements de statut d'un livreur
   */
  async getDriverStatusHistory(driverId: number): Promise<DriverStatusUpdate[]> {
    try {
      // Cette fonctionnalité nécessiterait une table d'audit
      // Pour l'instant, retourner un array vide
      // TODO: Implémenter une table d'historique si nécessaire
      return [];
    } catch (error) {
      console.error('❌ [DriverStatusManagement] Erreur historique:', error);
      return [];
    }
  }

  /**
   * Vérifier si un livreur peut être activé (pas de restrictions)
   */
  async canActivateDriver(driverId: number): Promise<boolean> {
    const validation = await this.validateStatusChange(driverId, true);
    return validation.canChangeStatus;
  }

  /**
   * Vérifier si un livreur peut être désactivé (pas de commandes en cours critiques)
   */
  async canDeactivateDriver(driverId: number): Promise<boolean> {
    const validation = await this.validateStatusChange(driverId, false);
    return validation.canChangeStatus;
  }

  /**
   * Helpers pour l'UI
   */
  getStatusDisplayText(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  getStatusDisplayColor(isActive: boolean): 'success' | 'medium' {
    return isActive ? 'success' : 'medium';
  }

  getStatusDisplayIcon(isActive: boolean): string {
    return isActive ? 'checkmark-circle' : 'close-circle';
  }

  getActionButtonText(isActive: boolean): string {
    return isActive ? '❌ Désactiver' : '✅ Activer';
  }

  getActionButtonColor(isActive: boolean): 'warning' | 'success' {
    return isActive ? 'warning' : 'success';
  }
}