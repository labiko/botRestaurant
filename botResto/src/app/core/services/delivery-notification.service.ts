import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseFranceService } from './supabase-france.service';
import { WhatsAppNotificationFranceService } from './whatsapp-notification-france.service';
import { PhoneFormatService } from './phone-format.service';

export interface DeliveryNotification {
  id: number;
  assignment_id: number;
  notification_type: 'assignment_offer' | 'assignment_accepted' | 'assignment_rejected' | 'delivery_started' | 'delivery_completed';
  recipient_type: 'driver' | 'restaurant' | 'customer';
  recipient_id: string;
  notification_data: any;
  sent_at: string;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed';
  error_message?: string;
}

export interface NotificationTemplate {
  type: string;
  title: string;
  message: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  key: string;
  label: string;
  type: 'accept' | 'reject' | 'info';
}

export interface NotificationStats {
  total_sent: number;
  delivery_rate: number;
  response_rate: number;
  avg_response_time: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryNotificationService {
  private notificationsSubject = new BehaviorSubject<DeliveryNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  // Templates de messages pré-définis
  private readonly messageTemplates = {
    // Messages pour livreurs
    assignment_offer: {
      title: "🚚 NOUVELLE LIVRAISON DISPONIBLE",
      message: `
📋 **Commande:** {{orderNumber}}
🏪 **Restaurant:** {{restaurantName}}
💰 **Montant:** {{totalAmount}}
📍 **Adresse:** {{deliveryAddress}}
📱 **Client:** {{customerPhone}}

⏰ **Vous avez {{timeoutMinutes}} minutes pour répondre**

Répondez:
✅ **ACCEPTER** pour prendre la livraison
❌ **REFUSER** pour passer
      `.trim()
    },
    
    assignment_accepted: {
      title: "✅ LIVRAISON ACCEPTÉE",
      message: `
Parfait ! Vous avez accepté la livraison de la commande {{orderNumber}}.

📍 **Restaurant:** {{restaurantName}}
📞 **Restaurant:** {{restaurantPhone}}
📍 **Adresse livraison:** {{deliveryAddress}}
💰 **Montant:** {{totalAmount}}

🚗 **Prochaines étapes:**
1. Rendez-vous au restaurant
2. Récupérez la commande
3. Contactez le client si nécessaire
4. Effectuez la livraison

📱 **Contact client:** {{customerPhone}}
      `.trim()
    },

    delivery_started: {
      title: "🚗 LIVRAISON EN COURS",
      message: `
Votre livraison pour la commande {{orderNumber}} a commencé.

📍 **Destination:** {{deliveryAddress}}
💰 **Montant à encaisser:** {{totalAmount}}
🔢 **Code de validation:** {{validationCode}}

⚠️ **Important:** Demandez le code de validation au client pour confirmer la livraison.
      `.trim()
    },

    // Messages pour restaurants
    driver_assigned: {
      title: "✅ LIVREUR ASSIGNÉ",
      message: `
La commande {{orderNumber}} a été prise en charge.

👤 **Livreur:** {{driverName}}
📱 **Contact:** {{driverPhone}}
⏱️ **ETA:** {{estimatedTime}}

La commande peut maintenant être marquée "En livraison" quand le livreur arrive.
      `.trim()
    },

    no_driver_available: {
      title: "⚠️ AUCUN LIVREUR DISPONIBLE",
      message: `
Aucun livreur n'est actuellement disponible pour la commande {{orderNumber}}.

Options:
• Attendre qu'un livreur se connecte
• Proposer au client de venir récupérer
• Utiliser un service de livraison externe

La commande reste en statut "Prête".
      `.trim()
    },

    // Messages pour clients
    driver_assigned_customer: {
      title: "✅ LIVREUR EN ROUTE",
      message: `
Bonne nouvelle ! Votre commande {{orderNumber}} a été prise en charge.

👤 **Votre livreur:** {{driverName}}
📱 **Contact livreur:** {{driverPhone}}
⏱️ **Livraison estimée:** {{estimatedTime}}

Vous pouvez contacter votre livreur si nécessaire.

Merci pour votre patience !
      `.trim()
    },

    delivery_completed_customer: {
      title: "✅ LIVRAISON TERMINÉE",
      message: `
Votre commande {{orderNumber}} a été livrée avec succès !

💰 **Montant payé:** {{totalAmount}}
⭐ **Merci pour votre confiance**

N'hésitez pas à nous recontacter pour vos prochaines commandes !

{{restaurantName}}
📱 {{restaurantPhone}}
      `.trim()
    }
  };

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private whatsAppFranceService: WhatsAppNotificationFranceService,
    private phoneFormatService: PhoneFormatService
  ) {}

  /**
   * Envoyer une notification d'offre d'assignation à un livreur
   */
  async sendAssignmentOffer(
    assignmentId: number,
    driverId: number,
    orderData: any
  ): Promise<boolean> {
    try {
      console.log(`📱 [DeliveryNotification] Envoi offre assignation au livreur ${driverId}`);

      // 1. Récupérer les données du livreur
      const driver = await this.getDriverDetails(driverId);
      if (!driver) {
        console.error(`❌ [DeliveryNotification] Livreur ${driverId} introuvable`);
        return false;
      }

      // 2. Formater le message
      const message = this.formatMessage('assignment_offer', {
        orderNumber: orderData.order_number,
        restaurantName: orderData.restaurant_name,
        totalAmount: `${orderData.total_amount}€`,
        deliveryAddress: orderData.delivery_address,
        customerPhone: orderData.phone_number,
        timeoutMinutes: '3'
      });

      // 3. Enregistrer la notification en base
      const notificationId = await this.saveNotification(assignmentId, {
        notification_type: 'assignment_offer',
        recipient_type: 'driver',
        recipient_id: driver.phone_number,
        notification_data: {
          message: message,
          order_id: orderData.id,
          assignment_id: assignmentId
        }
      });

      if (!notificationId) {
        console.error('❌ [DeliveryNotification] Erreur sauvegarde notification');
        return false;
      }

      // 4. Envoyer via WhatsApp - formatter le numéro pour WhatsApp
      const whatsappPhone = this.phoneFormatService.formatForWhatsApp(driver.phone_number);
      const sent = await this.sendWhatsAppMessage(whatsappPhone, message);
      
      // 5. Mettre à jour le statut d'envoi
      await this.updateNotificationStatus(notificationId, sent ? 'sent' : 'failed');

      return sent;

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur envoi offre assignation:', error);
      return false;
    }
  }

  /**
   * Envoyer confirmation d'acceptation d'assignation
   */
  async sendAssignmentAccepted(
    assignmentId: number,
    driverId: number,
    orderData: any
  ): Promise<boolean> {
    try {
      console.log(`✅ [DeliveryNotification] Envoi confirmation acceptation au livreur ${driverId}`);

      const driver = await this.getDriverDetails(driverId);
      if (!driver) return false;

      const message = this.formatMessage('assignment_accepted', {
        orderNumber: orderData.order_number,
        restaurantName: orderData.restaurant_name,
        restaurantPhone: orderData.restaurant_phone,
        deliveryAddress: orderData.delivery_address,
        totalAmount: `${orderData.total_amount}€`,
        customerPhone: orderData.phone_number
      });

      const notificationId = await this.saveNotification(assignmentId, {
        notification_type: 'assignment_accepted',
        recipient_type: 'driver',
        recipient_id: driver.phone_number,
        notification_data: { message, order_id: orderData.id }
      });

      if (!notificationId) return false;

      const whatsappPhone = this.phoneFormatService.formatForWhatsApp(driver.phone_number);
      const sent = await this.sendWhatsAppMessage(whatsappPhone, message);
      await this.updateNotificationStatus(notificationId, sent ? 'sent' : 'failed');

      return sent;

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur confirmation acceptation:', error);
      return false;
    }
  }

  /**
   * Notifier restaurant qu'un livreur a été assigné
   */
  async notifyRestaurantDriverAssigned(
    assignmentId: number,
    orderData: any,
    driverData: any
  ): Promise<boolean> {
    try {
      console.log(`🏪 [DeliveryNotification] Notification restaurant - livreur assigné`);

      const message = this.formatMessage('driver_assigned', {
        orderNumber: orderData.order_number,
        driverName: `${driverData.first_name} ${driverData.last_name}`,
        driverPhone: this.phoneFormatService.formatForDisplay(driverData.phone_number),
        estimatedTime: '30-45 min'
      });

      const notificationId = await this.saveNotification(assignmentId, {
        notification_type: 'assignment_accepted',
        recipient_type: 'restaurant',
        recipient_id: orderData.restaurant_phone,
        notification_data: { message, order_id: orderData.id, driver_id: driverData.id }
      });

      if (!notificationId) return false;

      const sent = await this.sendWhatsAppMessage(orderData.restaurant_phone, message);
      await this.updateNotificationStatus(notificationId, sent ? 'sent' : 'failed');

      return sent;

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur notification restaurant:', error);
      return false;
    }
  }

  /**
   * Notifier client qu'un livreur a été assigné
   */
  async notifyCustomerDriverAssigned(
    assignmentId: number,
    orderData: any,
    driverData: any
  ): Promise<boolean> {
    try {
      console.log(`👤 [DeliveryNotification] Notification client - livreur assigné`);

      const message = this.formatMessage('driver_assigned_customer', {
        orderNumber: orderData.order_number,
        driverName: driverData.first_name,
        driverPhone: this.phoneFormatService.formatForDisplay(driverData.phone_number),
        estimatedTime: '30-45 min'
      });

      const notificationId = await this.saveNotification(assignmentId, {
        notification_type: 'assignment_accepted',
        recipient_type: 'customer',
        recipient_id: orderData.phone_number,
        notification_data: { message, order_id: orderData.id, driver_id: driverData.id }
      });

      if (!notificationId) return false;

      const sent = await this.sendWhatsAppMessage(orderData.phone_number, message);
      await this.updateNotificationStatus(notificationId, sent ? 'sent' : 'failed');

      return sent;

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur notification client:', error);
      return false;
    }
  }

  /**
   * Notifier restaurant qu'aucun livreur n'est disponible
   */
  async notifyRestaurantNoDrivers(orderId: number): Promise<boolean> {
    try {
      console.log(`⚠️ [DeliveryNotification] Notification restaurant - pas de livreurs`);

      // Récupérer les données de la commande
      const orderData = await this.getOrderDetails(orderId);
      if (!orderData) return false;

      const message = this.formatMessage('no_driver_available', {
        orderNumber: orderData.order_number
      });

      // Créer une assignation fictive pour tracking
      const assignmentId = await this.createNotificationOnlyRecord(orderId);
      if (!assignmentId) return false;

      const notificationId = await this.saveNotification(assignmentId, {
        notification_type: 'assignment_rejected',
        recipient_type: 'restaurant',
        recipient_id: orderData.restaurant_phone,
        notification_data: { message, order_id: orderId, reason: 'no_drivers_available' }
      });

      if (!notificationId) return false;

      const sent = await this.sendWhatsAppMessage(orderData.restaurant_phone, message);
      await this.updateNotificationStatus(notificationId, sent ? 'sent' : 'failed');

      return sent;

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur notification pas de livreurs:', error);
      return false;
    }
  }

  /**
   * Envoyer notification de début de livraison
   */
  async sendDeliveryStarted(orderId: number, driverId: number): Promise<boolean> {
    try {
      console.log(`🚗 [DeliveryNotification] Notification début livraison`);

      const orderData = await this.getOrderDetails(orderId);
      const driver = await this.getDriverDetails(driverId);

      if (!orderData || !driver) return false;

      const message = this.formatMessage('delivery_started', {
        orderNumber: orderData.order_number,
        deliveryAddress: orderData.delivery_address,
        totalAmount: `${orderData.total_amount}€`,
        validationCode: orderData.delivery_validation_code || '0000'
      });

      // Récupérer l'assignation active
      const assignment = await this.getActiveAssignment(orderId, driverId);
      if (!assignment) return false;

      const notificationId = await this.saveNotification(assignment.id, {
        notification_type: 'delivery_started',
        recipient_type: 'driver',
        recipient_id: driver.phone_number,
        notification_data: { message, order_id: orderId }
      });

      if (!notificationId) return false;

      const whatsappPhone = this.phoneFormatService.formatForWhatsApp(driver.phone_number);
      const sent = await this.sendWhatsAppMessage(whatsappPhone, message);
      await this.updateNotificationStatus(notificationId, sent ? 'sent' : 'failed');

      return sent;

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur notification début livraison:', error);
      return false;
    }
  }

  /**
   * Envoyer notification de livraison terminée
   */
  async sendDeliveryCompleted(orderId: number, driverId: number): Promise<boolean> {
    try {
      console.log(`✅ [DeliveryNotification] Notification livraison terminée`);

      const orderData = await this.getOrderDetails(orderId);
      if (!orderData) return false;

      // Message pour le client
      const customerMessage = this.formatMessage('delivery_completed_customer', {
        orderNumber: orderData.order_number,
        totalAmount: `${orderData.total_amount}€`,
        restaurantName: orderData.restaurant_name,
        restaurantPhone: orderData.restaurant_phone
      });

      const assignment = await this.getActiveAssignment(orderId, driverId);
      if (!assignment) return false;

      const notificationId = await this.saveNotification(assignment.id, {
        notification_type: 'delivery_completed',
        recipient_type: 'customer',
        recipient_id: orderData.phone_number,
        notification_data: { message: customerMessage, order_id: orderId }
      });

      if (!notificationId) return false;

      const sent = await this.sendWhatsAppMessage(orderData.phone_number, customerMessage);
      await this.updateNotificationStatus(notificationId, sent ? 'sent' : 'failed');

      return sent;

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur notification livraison terminée:', error);
      return false;
    }
  }

  /**
   * Obtenir les statistiques de notifications
   */
  async getNotificationStats(restaurantId: number, days: number = 7): Promise<NotificationStats> {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      // Requête complexe pour obtenir les stats
      const { data, error } = await this.supabaseFranceService.client
        .rpc('get_delivery_notification_stats', {
          restaurant_id: restaurantId,
          from_date: fromDate.toISOString()
        });

      if (error) {
        console.error('❌ [DeliveryNotification] Erreur récupération stats:', error);
        return {
          total_sent: 0,
          delivery_rate: 0,
          response_rate: 0,
          avg_response_time: 0
        };
      }

      return data || {
        total_sent: 0,
        delivery_rate: 0,
        response_rate: 0,
        avg_response_time: 0
      };

    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur service stats:', error);
      return {
        total_sent: 0,
        delivery_rate: 0,
        response_rate: 0,
        avg_response_time: 0
      };
    }
  }

  // ========== MÉTHODES PRIVÉES ==========

  /**
   * Formater un message avec les variables
   */
  private formatMessage(templateKey: string, variables: Record<string, string>): string {
    const template = (this.messageTemplates as any)[templateKey];
    if (!template) {
      console.error(`❌ [DeliveryNotification] Template ${templateKey} introuvable`);
      return `Notification: ${templateKey}`;
    }

    let message = template.title + '\n\n' + template.message;

    // Remplacer les variables {{variable}}
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      message = message.replace(new RegExp(placeholder, 'g'), value);
    }

    return message;
  }

  /**
   * Sauvegarder une notification en base
   */
  private async saveNotification(assignmentId: number, notificationData: Partial<DeliveryNotification>): Promise<number | null> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_notifications')
        .insert({
          assignment_id: assignmentId,
          ...notificationData,
          delivery_status: 'pending'
        })
        .select('id')
        .single();

      if (error || !data) {
        console.error('❌ [DeliveryNotification] Erreur sauvegarde notification:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur service sauvegarde:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le statut d'une notification
   */
  private async updateNotificationStatus(notificationId: number, status: string, errorMessage?: string): Promise<void> {
    try {
      const updateData: any = { delivery_status: status };
      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_notifications')
        .update(updateData)
        .eq('id', notificationId);

      if (error) {
        console.error('❌ [DeliveryNotification] Erreur mise à jour statut:', error);
      }
    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur service mise à jour statut:', error);
    }
  }

  /**
   * Envoyer un message WhatsApp
   */
  private async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Valider que le numéro est bien au format international
      console.log(`📱 [DeliveryNotification] Envoi WhatsApp vers ${phoneNumber}`);
      console.log(`Message: ${message}`);
      
      // Vérifier le format WhatsApp
      if (!phoneNumber.startsWith('+33')) {
        console.warn(`⚠️ [DeliveryNotification] Numéro pas au format WhatsApp: ${phoneNumber}`);
      }
      
      // TODO: Intégrer avec le service WhatsApp réel
      // return await this.whatsAppFranceService.sendTextMessage(phoneNumber, message);
      
      // Pour l'instant, simuler un succès
      return true;
    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur envoi WhatsApp:', error);
      return false;
    }
  }

  /**
   * Récupérer les détails d'un livreur
   */
  private async getDriverDetails(driverId: number): Promise<any | null> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('id, first_name, last_name, phone_number')
        .eq('id', driverId)
        .single();

      return error ? null : data;
    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur récupération livreur:', error);
      return null;
    }
  }

  /**
   * Récupérer les détails d'une commande
   */
  private async getOrderDetails(orderId: number): Promise<any | null> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          *,
          france_restaurants!inner (name, phone, whatsapp_number)
        `)
        .eq('id', orderId)
        .single();

      if (error || !data) return null;

      // Ajouter les champs du restaurant au niveau principal
      return {
        ...data,
        restaurant_name: data.france_restaurants.name,
        restaurant_phone: data.france_restaurants.whatsapp_number || data.france_restaurants.phone
      };
    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur récupération commande:', error);
      return null;
    }
  }

  /**
   * Récupérer l'assignation active d'une commande
   */
  private async getActiveAssignment(orderId: number, driverId: number): Promise<any | null> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .select('*')
        .eq('order_id', orderId)
        .eq('driver_id', driverId)
        .eq('assignment_status', 'accepted')
        .single();

      return error ? null : data;
    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur récupération assignation:', error);
      return null;
    }
  }

  /**
   * Créer un enregistrement d'assignation pour tracking seulement
   */
  private async createNotificationOnlyRecord(orderId: number): Promise<number | null> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .insert({
          order_id: orderId,
          driver_id: 0, // ID fictif
          assignment_status: 'expired',
          expires_at: new Date().toISOString()
        })
        .select('id')
        .single();

      return error ? null : data.id;
    } catch (error) {
      console.error('❌ [DeliveryNotification] Erreur création enregistrement:', error);
      return null;
    }
  }
}