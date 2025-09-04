import { Injectable } from '@angular/core';
import { SupabaseFranceService } from './supabase-france.service';
import { DeliveryTokenService, DeliveryToken } from './delivery-token.service';
import { GreenApiFranceService } from '../../features/restaurant-france/services/green-api-france.service';

export interface NotificationData {
  orderId: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  deliveryAddress: string;
  restaurantName: string;
  preparationTime: string;
}

export interface WhatsAppNotificationResult {
  success: boolean;
  message: string;
  sentCount?: number;
  failedCount?: number;
  details?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryNotificationService {

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private deliveryTokenService: DeliveryTokenService,
    private greenApiService: GreenApiFranceService
  ) {}

  /**
   * Envoyer la notification initiale à tous les livreurs disponibles
   * Appelée quand une commande passe en statut "prete"
   */
  async notifyAvailableDrivers(orderId: number): Promise<WhatsAppNotificationResult> {
    try {
      console.log(`📱 [DeliveryNotification] Notification initiale pour commande ${orderId}...`);

      // 1. Générer les tokens pour tous les livreurs actifs
      const tokenResult = await this.deliveryTokenService.generateTokensForOrder(orderId);
      if (!tokenResult.success || tokenResult.tokens.length === 0) {
        return {
          success: false,
          message: tokenResult.message,
          sentCount: 0,
          failedCount: 0
        };
      }

      // 2. Récupérer les détails de la commande
      const orderData = await this.getOrderNotificationData(orderId);
      if (!orderData) {
        return {
          success: false,
          message: 'Impossible de récupérer les données de la commande',
          sentCount: 0,
          failedCount: 0
        };
      }

      // 3. Envoyer les notifications WhatsApp
      const results = await this.sendInitialWhatsAppNotifications(tokenResult.tokens, orderData);

      return results;

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur notifyAvailableDrivers:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'envoi des notifications',
        sentCount: 0,
        failedCount: 0
      };
    }
  }

  /**
   * Envoyer les notifications de réactivation (Option B)
   * Appelée quand un livreur refuse/annule une commande
   */
  async sendReactivationNotifications(orderId: number): Promise<WhatsAppNotificationResult> {
    try {
      console.log(`📱 [DeliveryNotification] Notifications de réactivation pour commande ${orderId}...`);

      // 1. Réactiver les tokens disponibles
      const reactivationResult = await this.deliveryTokenService.reactivateTokensAfterRefusal(orderId);
      if (!reactivationResult.success || reactivationResult.reactivatedTokens.length === 0) {
        return {
          success: false,
          message: reactivationResult.message,
          sentCount: 0,
          failedCount: 0
        };
      }

      // 2. Récupérer les données de la commande
      const orderData = await this.getOrderNotificationData(orderId);
      if (!orderData) {
        return {
          success: false,
          message: 'Impossible de récupérer les données de la commande',
          sentCount: 0,
          failedCount: 0
        };
      }

      // 3. Envoyer les notifications de réactivation
      const results = await this.sendReactivationWhatsAppNotifications(reactivationResult.reactivatedTokens, orderData);

      return results;

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur sendReactivationNotifications:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'envoi des notifications de réactivation',
        sentCount: 0,
        failedCount: 0
      };
    }
  }

  /**
   * Récupérer les données nécessaires pour les notifications
   */
  private async getOrderNotificationData(orderId: number): Promise<NotificationData | null> {
    try {
      const { data: order, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          id,
          order_number,
          customer_name,
          total_amount,
          delivery_address,
          created_at,
          france_restaurants!restaurant_id (
            name
          )
        `)
        .eq('id', orderId)
        .single();

      if (error || !order) {
        console.error('❌ [DeliveryNotification] Erreur récupération commande:', error);
        return null;
      }

      // Calculer le temps depuis la préparation
      const createdTime = new Date(order.created_at);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - createdTime.getTime()) / (1000 * 60));

      return {
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name || 'Client',
        totalAmount: parseFloat(order.total_amount),
        deliveryAddress: order.delivery_address || 'Adresse non spécifiée',
        restaurantName: (order.france_restaurants as any)?.name || 'Restaurant',
        preparationTime: `${diffMinutes} min`
      };

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur getOrderNotificationData:', error);
      return null;
    }
  }

  /**
   * Envoyer les messages WhatsApp initiaux
   */
  private async sendInitialWhatsAppNotifications(
    tokens: DeliveryToken[], 
    orderData: NotificationData
  ): Promise<WhatsAppNotificationResult> {
    
    console.log(`📨 [DeliveryNotification] Envoi de ${tokens.length} notifications initiales...`);
    
    let sentCount = 0;
    let failedCount = 0;
    const details: any[] = [];

    for (const token of tokens) {
      try {
        // Générer l'URL personnalisée pour ce livreur
        const personalizedUrl = this.deliveryTokenService.generateTokenUrl(token.token);
        
        // Créer le message WhatsApp
        const message = this.createInitialWhatsAppMessage(orderData, personalizedUrl);
        
        // TODO: Ici sera intégrée l'API WhatsApp réelle
        // Pour l'instant, on simule l'envoi
        const sendResult = await this.sendWhatsAppMessage(token.driver_id, message);
        
        if (sendResult.success) {
          sentCount++;
          details.push({
            driver_id: token.driver_id,
            status: 'sent',
            message: 'Message envoyé avec succès'
          });
        } else {
          failedCount++;
          details.push({
            driver_id: token.driver_id,
            status: 'failed',
            message: sendResult.error || 'Échec envoi'
          });
        }

      } catch (error) {
        console.error(`❌ [DeliveryNotification] Erreur envoi pour livreur ${token.driver_id}:`, error);
        failedCount++;
        details.push({
          driver_id: token.driver_id,
          status: 'failed',
          message: 'Erreur technique'
        });
      }
    }

    console.log(`✅ [DeliveryNotification] Notifications initiales: ${sentCount} envoyées, ${failedCount} échouées`);

    return {
      success: sentCount > 0,
      message: `${sentCount} notifications envoyées, ${failedCount} échouées`,
      sentCount,
      failedCount,
      details
    };
  }

  /**
   * Envoyer les messages WhatsApp de réactivation
   */
  private async sendReactivationWhatsAppNotifications(
    tokens: DeliveryToken[], 
    orderData: NotificationData
  ): Promise<WhatsAppNotificationResult> {
    
    console.log(`📨 [DeliveryNotification] Envoi de ${tokens.length} notifications de réactivation...`);
    
    let sentCount = 0;
    let failedCount = 0;
    const details: any[] = [];

    for (const token of tokens) {
      try {
        // Générer l'URL personnalisée (même token réactivé)
        const personalizedUrl = this.deliveryTokenService.generateTokenUrl(token.token);
        
        // Créer le message de réactivation
        const message = this.createReactivationWhatsAppMessage(orderData, personalizedUrl);
        
        // Envoyer le message
        const sendResult = await this.sendWhatsAppMessage(token.driver_id, message);
        
        if (sendResult.success) {
          sentCount++;
          details.push({
            driver_id: token.driver_id,
            status: 'sent',
            message: 'Message de réactivation envoyé'
          });
        } else {
          failedCount++;
          details.push({
            driver_id: token.driver_id,
            status: 'failed',
            message: sendResult.error || 'Échec envoi'
          });
        }

      } catch (error) {
        console.error(`❌ [DeliveryNotification] Erreur réactivation pour livreur ${token.driver_id}:`, error);
        failedCount++;
        details.push({
          driver_id: token.driver_id,
          status: 'failed',
          message: 'Erreur technique'
        });
      }
    }

    console.log(`✅ [DeliveryNotification] Réactivations: ${sentCount} envoyées, ${failedCount} échouées`);

    return {
      success: sentCount > 0,
      message: `${sentCount} notifications de réactivation envoyées, ${failedCount} échouées`,
      sentCount,
      failedCount,
      details
    };
  }

  /**
   * Créer le message WhatsApp initial
   */
  private createInitialWhatsAppMessage(orderData: NotificationData, personalizedUrl: string): string {
    return `🚨 *NOUVELLE COMMANDE DISPONIBLE* 🚨

📦 Commande #${orderData.orderNumber}
👤 Client: ${orderData.customerName}  
📍 Adresse: ${orderData.deliveryAddress}
💰 Total: ${orderData.totalAmount.toFixed(2)}€
🕒 Prête depuis ${orderData.preparationTime}

✅ *Cliquez pour accepter:*
${personalizedUrl}

⏱️ Lien valide 15 minutes
🚀 Premier arrivé, premier servi !`;
  }

  /**
   * Créer le message WhatsApp de réactivation
   */
  private createReactivationWhatsAppMessage(orderData: NotificationData, personalizedUrl: string): string {
    return `🔄 *COMMANDE DISPONIBLE À NOUVEAU* 🔄

📦 Commande #${orderData.orderNumber}
👤 Client: ${orderData.customerName}
💰 Total: ${orderData.totalAmount.toFixed(2)}€
ℹ️ Le livreur précédent a annulé

✅ *Votre lien est toujours actif:*
${personalizedUrl}

⏱️ Nouveau délai: 15 minutes
🚀 À vous de jouer !`;
  }

  /**
   * Envoyer un message WhatsApp à un livreur
   */
  private async sendWhatsAppMessage(driverId: number, message: string): Promise<{success: boolean, error?: string}> {
    try {
      console.log(`📱 [DeliveryNotification] Envoi WhatsApp au livreur ${driverId}...`);
      
      // Récupérer le numéro de téléphone du livreur
      const { data: driver, error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('phone_number, first_name, last_name')
        .eq('id', driverId)
        .single();

      if (error || !driver) {
        console.error(`❌ [DeliveryNotification] Livreur ${driverId} introuvable:`, error);
        return { success: false, error: 'Livreur introuvable' };
      }

      if (!driver.phone_number) {
        console.error(`❌ [DeliveryNotification] Numéro manquant pour livreur ${driverId}`);
        return { success: false, error: 'Numéro de téléphone manquant' };
      }

      // Envoyer via Green API
      const result = await this.greenApiService.sendMessage(driver.phone_number, message);
      
      if (result.success) {
        console.log(`✅ [DeliveryNotification] Message envoyé à ${driver.first_name} ${driver.last_name} (${driver.phone_number}) - ID: ${result.messageId}`);
        return { success: true };
      } else {
        console.error(`❌ [DeliveryNotification] Échec envoi à ${driver.phone_number}:`, result.error);
        return { success: false, error: result.error || 'Échec envoi WhatsApp' };
      }

    } catch (error) {
      console.error(`❌ [DeliveryNotification] Erreur sendWhatsAppMessage pour livreur ${driverId}:`, error);
      return { success: false, error: 'Erreur technique lors de l\'envoi' };
    }
  }
}