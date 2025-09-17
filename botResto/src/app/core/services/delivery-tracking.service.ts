import { Injectable } from '@angular/core';
import { SupabaseFranceService } from './supabase-france.service';
import { DeliveryNotificationService } from './delivery-notification.service';

export interface OrderTrackingStats {
  orderId: number;
  orderNumber: string;
  notifiedCount: number;
  viewedCount: number;
  refusedCount: number;
  acceptedCount: number;
  lastActionDriverName?: string;
  lastActionType?: string;
  lastActionTimestamp?: string;
  lastTokenUpdate?: string;
  currentStatus: string;
  canForceRelease: boolean;
  canSendReminder: boolean;
}

export interface DeliveryTrackingData {
  activeOrders: OrderTrackingStats[];
  totalActiveOrders: number;
  totalPendingNotifications: number;
  averageResponseTime: number; // en minutes
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryTrackingService {

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private deliveryNotificationService: DeliveryNotificationService
  ) {}

  /**
   * Récupérer les statistiques de suivi pour toutes les commandes en cours
   */
  async getDeliveryTrackingData(restaurantId: number): Promise<DeliveryTrackingData> {
    try {

      // Récupérer toutes les commandes prêtes et assignées du restaurant
      const { data: activeOrders, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          id,
          order_number, 
          status,
          created_at,
          driver_id
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['prete', 'assignee'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [DeliveryTracking] Erreur récupération commandes:', error);
        return {
          activeOrders: [],
          totalActiveOrders: 0,
          totalPendingNotifications: 0,
          averageResponseTime: 0
        };
      }

      if (!activeOrders || activeOrders.length === 0) {
        return {
          activeOrders: [],
          totalActiveOrders: 0,
          totalPendingNotifications: 0,
          averageResponseTime: 0
        };
      }

      // Récupérer les statistiques pour chaque commande
      const trackingPromises = activeOrders.map(order => 
        this.getOrderTrackingStats(order.id, order.order_number, order.status, order.driver_id)
      );

      const trackingStats = await Promise.all(trackingPromises);

      // Calculer les métriques globales
      const totalPendingNotifications = trackingStats.filter(stat => 
        stat.currentStatus === 'prete' && stat.notifiedCount > 0 && stat.acceptedCount === 0
      ).length;

      // Calculer le temps de réponse moyen (simulation pour l'instant)
      const averageResponseTime = this.calculateAverageResponseTime(trackingStats);


      return {
        activeOrders: trackingStats,
        totalActiveOrders: trackingStats.length,
        totalPendingNotifications,
        averageResponseTime
      };

    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur getDeliveryTrackingData:', error);
      return {
        activeOrders: [],
        totalActiveOrders: 0,
        totalPendingNotifications: 0,
        averageResponseTime: 0
      };
    }
  }

  /**
   * Récupérer les statistiques de suivi pour une commande spécifique
   */
  private async getOrderTrackingStats(
    orderId: number, 
    orderNumber: string, 
    status: string,
    driverId?: number
  ): Promise<OrderTrackingStats> {
    try {
      // Utiliser la fonction SQL get_order_delivery_stats
      const { data: stats, error } = await this.supabaseFranceService.client
        .rpc('get_order_delivery_stats', { p_order_id: orderId });

      if (error) {
        console.error(`❌ [DeliveryTracking] Erreur stats commande ${orderId}:`, error);
        console.error(`❌ [DeliveryTracking] Détail erreur:`, JSON.stringify(error, null, 2));
        return {
          orderId,
          orderNumber,
          notifiedCount: 0,
          viewedCount: 0,
          refusedCount: 0,
          acceptedCount: 0,
          currentStatus: status,
          canForceRelease: status === 'assignee',
          canSendReminder: status === 'prete'
        };
      }

      const stat = stats && stats.length > 0 ? stats[0] : null;

      return {
        orderId,
        orderNumber,
        notifiedCount: stat?.notified_count || 0,
        viewedCount: stat?.viewed_count || 0,
        refusedCount: stat?.refused_count || 0,
        acceptedCount: stat?.accepted_count || 0,
        lastActionDriverName: stat?.last_action_driver_name || undefined,
        lastActionType: stat?.last_action_type || undefined,
        lastActionTimestamp: stat?.last_action_timestamp || undefined,
        lastTokenUpdate: stat?.last_token_update || undefined,
        currentStatus: status,
        canForceRelease: status === 'assignee' && !!driverId,
        canSendReminder: status === 'prete' && (stat?.notified_count || 0) > 0
      };

    } catch (error) {
      console.error(`❌ [DeliveryTracking] Erreur getOrderTrackingStats pour commande ${orderId}:`, error);
      return {
        orderId,
        orderNumber,
        notifiedCount: 0,
        viewedCount: 0,
        refusedCount: 0,
        acceptedCount: 0,
        currentStatus: status,
        canForceRelease: status === 'assignee',
        canSendReminder: status === 'prete'
      };
    }
  }

  /**
   * Calculer le temps de réponse moyen (en minutes)
   */
  private calculateAverageResponseTime(stats: OrderTrackingStats[]): number {
    // Pour l'instant, simulation basique
    // Dans une version future, on peut calculer basé sur les timestamps réels
    const acceptedOrders = stats.filter(s => s.acceptedCount > 0);
    
    if (acceptedOrders.length === 0) {
      return 0;
    }

    // Simulation : entre 5 et 15 minutes
    return Math.round(Math.random() * 10) + 5;
  }

  /**
   * Forcer la libération d'une commande (Action d'urgence)
   */
  async forceReleaseOrder(
    orderId: number, 
    restaurantId: number,
    reason: string = 'Libération forcée par le restaurant'
  ): Promise<{success: boolean, message: string}> {
    try {

      const { data: result, error } = await this.supabaseFranceService.client
        .rpc('force_release_order', {
          p_order_id: orderId,
          p_restaurant_id: restaurantId,
          p_reason: reason
        });

      if (error) {
        console.error('❌ [DeliveryTracking] Erreur Force Release:', error);
        return {
          success: false,
          message: 'Erreur lors de la libération forcée'
        };
      }

      if (result) {
        return {
          success: true,
          message: 'Commande libérée avec succès'
        };
      } else {
        return {
          success: false,
          message: 'Impossible de libérer cette commande'
        };
      }

    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur forceReleaseOrder:', error);
      return {
        success: false,
        message: 'Erreur lors de la libération forcée'
      };
    }
  }

  /**
   * Envoyer des notifications de rappel pour une commande
   */
  async sendReminderNotifications(orderId: number): Promise<{success: boolean, message: string}> {
    try {

      // Utiliser le système de réactivation (Option B)
      const result = await this.deliveryNotificationService.sendReactivationNotifications(orderId);

      if (result.success) {
        return {
          success: true,
          message: `${result.sentCount} rappels envoyés avec succès`
        };
      } else {
        console.error('❌ [DeliveryTracking] Échec envoi rappels:', result.message);
        return {
          success: false,
          message: result.message
        };
      }

    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur sendReminderNotifications:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'envoi des rappels'
      };
    }
  }

  /**
   * Marquer une commande comme prête et déclencher les notifications
   */
  async markOrderReady(orderId: number, restaurantId: number): Promise<{success: boolean, message: string}> {
    try {

      // 1. Mettre à jour le statut de la commande
      const { error: updateError } = await this.supabaseFranceService.client
        .from('france_orders')
        .update({ 
          status: 'prete',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('restaurant_id', restaurantId);

      if (updateError) {
        console.error('❌ [DeliveryTracking] Erreur mise à jour statut:', updateError);
        return {
          success: false,
          message: 'Erreur lors de la mise à jour du statut'
        };
      }

      // 2. Déclencher les notifications aux livreurs
      const notificationResult = await this.deliveryNotificationService.notifyAvailableDrivers(orderId);

      if (notificationResult.success) {
        return {
          success: true,
          message: `Commande marquée prête et ${notificationResult.sentCount} livreurs notifiés`
        };
      } else {
        // Même si les notifications échouent, la commande est marquée prête
        console.warn('⚠️ [DeliveryTracking] Commande prête mais notifications échouées:', notificationResult.message);
        return {
          success: true,
          message: `Commande marquée prête mais erreur notifications: ${notificationResult.message}`
        };
      }

    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur markOrderReady:', error);
      return {
        success: false,
        message: 'Erreur lors du marquage comme prête'
      };
    }
  }

  /**
   * Obtenir l'historique des actions pour une commande
   */
  async getOrderActionHistory(orderId: number): Promise<any[]> {
    try {
      const { data: actions, error } = await this.supabaseFranceService.client
        .from('delivery_driver_actions')
        .select(`
          action_type,
          action_timestamp,
          details,
          france_delivery_drivers!driver_id (
            first_name,
            last_name,
            phone_number
          )
        `)
        .eq('order_id', orderId)
        .order('action_timestamp', { ascending: false });

      if (error) {
        console.error('❌ [DeliveryTracking] Erreur historique actions:', error);
        return [];
      }

      return actions || [];

    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur getOrderActionHistory:', error);
      return [];
    }
  }

  /**
   * Calculer le temps relatif depuis une date
   */
  getTimeAgo(timestamp: string | Date): string {
    if (!timestamp) return '';
    
    const now = new Date();
    const actionTime = new Date(timestamp);
    const diffMs = now.getTime() - actionTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'maintenant';
    } else if (diffMins < 60) {
      return `il y a ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `il y a ${diffHours}h${diffMins % 60 > 0 ? (diffMins % 60).toString().padStart(2, '0') : ''}`;
    } else {
      return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
  }

  /**
   * Formater une date en heure 24H
   */
  formatTime24H(timestamp: string | Date): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
}