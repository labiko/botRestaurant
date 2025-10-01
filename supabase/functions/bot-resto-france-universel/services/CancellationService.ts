/**
 * Service de gestion des annulations client
 * SOLID - Single Responsibility : Gestion uniquement des annulations
 * Pattern identique à AddressManagementService
 */

// ⏱️ Configuration durée de session
const SESSION_DURATION_MINUTES = 120; // 2 heures - Durée raisonnable pour commandes livraison

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Obtenir l'heure actuelle dans le bon fuseau horaire PARIS
 * ✅ Version finale optimisée avec format Paris validé
 */
function getCurrentTime(timezone: string = 'Europe/Paris'): Date {
  // Formatter pour timezone configuré (gère automatiquement heure d'été/hiver)
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const utcNow = new Date();
  const formatted = formatter.format(utcNow);

  // Parsing du format DD/MM/YYYY HH:mm:ss
  const parts = formatted.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (parts) {
    const [, day, month, year, hour, minute, second] = parts;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  }

  // Fallback UTC si parsing échoue
  return utcNow;
}
import { QueryPerformanceMonitor } from './QueryPerformanceMonitor.ts';
// Import commenté car service non utilisé directement dans ce contexte
// Le messageSender est injecté depuis UniversalBot qui gère déjà WhatsApp

export interface CancellableOrder {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  phone_number: string;
  driver_id?: number;
  delivery_address?: string;
  created_at?: string;
  restaurant_id?: number;
}

export interface CancellationResult {
  success: boolean;
  orderNumber: string;
  message: string;
  driverNotified: boolean;
}

export class CancellationService {
  private supabase: SupabaseClient;
  
  constructor(
    private supabaseUrl: string,
    private supabaseKey: string,
    private messageSender?: any // IMessageSender pour notifications livreur
  ) {
    this.initSupabase();
  }

  /**
   * Initialiser le client Supabase
   */
  private async initSupabase() {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  /**
   * Rechercher une commande annulable pour un client
   */
  async findCancellableOrder(phoneNumber: string): Promise<CancellableOrder | null> {
    try {
      console.log(`🔍 [CancellationService] Recherche commande annulable pour: ${phoneNumber}`);
      
      const cleanPhone = phoneNumber.replace('@c.us', '');
      
      const { data, error } = await QueryPerformanceMonitor.measureQuery(
        'FIND_CANCELABLE_ORDER',
        this.supabase
          .from('france_orders')
          .select('id, order_number, status, total_amount, phone_number, driver_id, delivery_address, created_at')
          .eq('phone_number', cleanPhone)
          .not('status', 'in', '("livree","servie","recuperee","annulee")')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      );

      if (error) {
        console.log(`ℹ️ [CancellationService] Aucune commande annulable trouvée:`, error.message);
        return null;
      }

      console.log(`✅ [CancellationService] Commande annulable trouvée: ${data.order_number}`);
      console.log(`🔒 [SECURITY] Vérification statut commande ${data.order_number}: ${data.status} - AUTORISÉE`);
      return data as CancellableOrder;
      
    } catch (error) {
      console.error('❌ [CancellationService] Exception:', error);
      return null;
    }
  }

  /**
   * Annuler une commande
   */
  async cancelOrder(orderId: number): Promise<CancellationResult> {
    try {
      console.log(`🚫 [CancellationService] Annulation commande ID: ${orderId}`);
      
      // 1. Récupérer info commande avant annulation
      const orderInfo = await this.getOrderInfo(orderId);
      if (!orderInfo) {
        return { 
          success: false, 
          orderNumber: '', 
          message: 'Commande introuvable', 
          driverNotified: false 
        };
      }

      // 2. Mettre à jour statut en BDD avec timestamp correct
      const { error } = await this.supabase
        .from('france_orders')
        .update({ 
          status: 'annulee', 
          updated_at: 'NOW()' // Utilise le fuseau PostgreSQL (Europe/Paris)
        })
        .eq('id', orderId)
        .not('status', 'in', '("livree","servie","recuperee","annulee")');

      if (error) {
        console.error('❌ [CancellationService] Erreur BDD:', error);
        return { 
          success: false, 
          orderNumber: orderInfo.order_number, 
          message: 'Erreur technique', 
          driverNotified: false 
        };
      }

      // 3. Notifier livreur si assigné
      let driverNotified = false;
      if (orderInfo.driver_id) {
        driverNotified = await this.notifyDriverOfCancellation(orderInfo);
      }

      console.log(`✅ [CancellationService] Commande ${orderInfo.order_number} annulée`);
      console.log(`🔒 [SECURITY] Annulation réussie - Commande: ${orderInfo.order_number}, Statut précédent: en cours`);
      return {
        success: true,
        orderNumber: orderInfo.order_number,
        message: 'Commande annulée avec succès',
        driverNotified
      };
      
    } catch (error) {
      console.error('❌ [CancellationService] Exception annulation:', error);
      return { 
        success: false, 
        orderNumber: '', 
        message: 'Erreur technique', 
        driverNotified: false 
      };
    }
  }

  /**
   * Notifier le livreur de l'annulation
   */
  private async notifyDriverOfCancellation(order: CancellableOrder): Promise<boolean> {
    try {
      if (!order.driver_id || !this.messageSender) return false;

      console.log(`📱 [CancellationService] Notification livreur ${order.driver_id}`);

      // Récupérer téléphone livreur
      const { data: driver, error } = await this.supabase
        .from('france_delivery_drivers')
        .select('phone_number, first_name')
        .eq('id', order.driver_id)
        .single();

      if (error || !driver?.phone_number) {
        console.error('❌ [CancellationService] Livreur introuvable:', error);
        return false;
      }

      // Envoyer message WhatsApp via messageSender injecté
      const message = this.formatDriverCancellationMessage(order);
      await this.messageSender.sendMessage(driver.phone_number, message);

      console.log(`✅ [CancellationService] Livreur ${driver.first_name || driver.phone_number} notifié`);
      return true;
      
    } catch (error) {
      console.error('❌ [CancellationService] Erreur notification livreur:', error);
      return false;
    }
  }

  /**
   * Récupérer les infos d'une commande
   */
  private async getOrderInfo(orderId: number): Promise<CancellableOrder | null> {
    try {
      const { data, error } = await this.supabase
        .from('france_orders')
        .select('id, order_number, status, total_amount, phone_number, driver_id, delivery_address, restaurant_id')
        .eq('id', orderId)
        .single();

      return error ? null : data as CancellableOrder;
    } catch (error) {
      console.error('❌ [CancellationService] Erreur getOrderInfo:', error);
      return null;
    }
  }

  /**
   * Gérer une demande d'annulation de commande avec création de session
   * Logique complète de traitement des annulations
   */
  async handleCancellationRequest(phoneNumber: string): Promise<{
    success: boolean;
    message: string;
    sessionCreated: boolean;
  }> {
    try {
      console.log(`🚫 [CancellationService] Demande annulation de: ${phoneNumber}`);
      
      // 1. Rechercher commande annulable
      const order = await this.findCancellableOrder(phoneNumber);
      
      if (!order) {
        return {
          success: false,
          message: this.formatNoOrderMessage(),
          sessionCreated: false
        };
      }
      
      // 2. Créer session temporaire pour confirmation
      const sessionCreated = await this.createCancellationSession(phoneNumber, {
        orderId: order.id,
        orderNumber: order.order_number
      });
      
      // 3. Retourner message de confirmation
      return {
        success: true,
        message: this.formatConfirmationMessage(order),
        sessionCreated
      };
      
    } catch (error) {
      console.error('❌ [CancellationService] Erreur handleCancellationRequest:', error);
      return {
        success: false,
        message: '❌ Erreur lors de la recherche de votre commande. Veuillez réessayer.',
        sessionCreated: false
      };
    }
  }

  /**
   * Gérer la confirmation d'annulation
   */
  async handleCancellationConfirmation(orderData: any, userResponse: string): Promise<{
    success: boolean;
    message: string;
    action: 'cancelled' | 'kept' | 'invalid_response';
  }> {
    try {
      console.log(`🔍 [CancellationService] handleCancellationConfirmation - userResponse: "${userResponse}"`);
      console.log(`🔍 [CancellationService] orderData:`, JSON.stringify(orderData, null, 2));
      
      const normalizedResponse = userResponse.toLowerCase().trim();
      console.log(`🔍 [CancellationService] normalizedResponse: "${normalizedResponse}"`);
      
      const { orderId, orderNumber } = orderData;
      console.log(`🔍 [CancellationService] orderId: ${orderId}, orderNumber: ${orderNumber}`);
      
      if (normalizedResponse === 'oui') {
        console.log(`✅ [CancellationService] User confirmed cancellation`);
        // Confirmer l'annulation
        console.log(`✅ [CancellationService] Annulation confirmée pour commande ${orderId}`);
        
        const result = await this.cancelOrder(orderId);
        
        if (result.success) {
          return {
            success: true,
            message: this.formatSuccessMessage(result.orderNumber),
            action: 'cancelled'
          };
        } else {
          return {
            success: false,
            message: `❌ Échec annulation: ${result.message}\n\n🔄 Tapez "annuler" pour réessayer.`,
            action: 'cancelled'
          };
        }
        
      } else if (normalizedResponse === 'non') {
        console.log(`❌ [CancellationService] User chose to keep the order`);
        // Annuler la demande d'annulation
        return {
          success: true,
          message: `✅ **COMMANDE CONSERVÉE**\n\n📋 Commande N°${orderNumber} maintenue\n\n💡 Tapez le numéro du resto pour accéder directement.`,
          action: 'kept'
        };
        
      } else {
        console.log(`❓ [CancellationService] Invalid response: "${normalizedResponse}"`);
        // Réponse non reconnue
        return {
          success: false,
          message: '⚠️ **Réponse non reconnue**\n\nTapez :\n✅ **OUI** pour annuler votre commande\n❌ **NON** pour la conserver',
          action: 'invalid_response'
        };
      }
      
    } catch (error) {
      console.error('❌ [CancellationService] Erreur handleCancellationConfirmation:', error);
      console.error('❌ [CancellationService] Error details:', {
        message: error.message,
        stack: error.stack,
        userResponse,
        orderData
      });
      return {
        success: false,
        message: '❌ Erreur lors de l\'annulation. Veuillez réessayer.',
        action: 'cancelled'
      };
    }
  }

  /**
   * Créer session temporaire pour confirmation annulation
   * SOLID - Single Responsibility : Le service gère sa propre persistance
   */
  private async createCancellationSession(phoneNumber: string, orderData: any): Promise<boolean> {
    try {
      console.log(`📋 [CancellationService] Création session pour: ${phoneNumber}`);
      
      // Supprimer anciennes sessions
      await this.supabase
        .from('france_user_sessions')
        .delete()
        .eq('phone_number', phoneNumber);
      
      // Créer nouvelle session
      const { error } = await this.supabase
        .from('france_user_sessions')
        .insert({
          phone_number: phoneNumber,
          restaurant_id: null,
          bot_state: 'AWAITING_CANCELLATION_CONFIRMATION',
          session_data: {
            pendingCancellationOrderId: orderData.orderId,
            pendingCancellationOrderNumber: orderData.orderNumber
          },
          expires_at: new Date(getCurrentTime().getTime() + SESSION_DURATION_MINUTES * 60 * 1000),
          created_at: getCurrentTime(),
          updated_at: getCurrentTime()
        });
        
      if (error) {
        console.error('❌ [CancellationService] Erreur création session:', error);
        return false;
      }
      
      console.log(`✅ [CancellationService] Session créée avec succès`);
      return true;
      
    } catch (error) {
      console.error('❌ [CancellationService] Exception création session:', error);
      return false;
    }
  }

  /**
   * Supprimer session d'annulation
   */
  async cleanupCancellationSession(phoneNumber: string): Promise<void> {
    try {
      await this.supabase
        .from('france_user_sessions')
        .delete()
        .eq('phone_number', phoneNumber);
        
      console.log(`🗑️ [CancellationService] Session nettoyée pour: ${phoneNumber}`);
    } catch (error) {
      console.error('❌ [CancellationService] Erreur nettoyage session:', error);
    }
  }

  /**
   * Formater le message de confirmation pour le client
   * FORMAT UNIVERSEL - Même structure pour tous les restaurants
   */
  formatConfirmationMessage(order: CancellableOrder): string {
    return `🚫 *Annuler commande #${order.order_number}* (${order.total_amount.toFixed(2)}€) ?

✅ *OUI* pour confirmer l'annulation
❌ *NON* pour garder votre commande`;
  }

  /**
   * Formater le message de succès
   */
  formatSuccessMessage(orderNumber: string): string {
    return `✅ **ANNULATION RÉUSSIE !**

📋 Commande N°${orderNumber} annulée
💰 Aucun montant débité
⏰ Annulation traitée immédiatement

🎯 **Que faire maintenant ?**
🍕 Tapez **"resto"** → Voir tous les restaurants  
🔢 Tapez **le numéro du resto** → Accéder directement
📞 Besoin d'aide ? Contactez le restaurant`;
  }

  /**
   * Message si aucune commande à annuler
   */
  formatNoOrderMessage(): string {
    return `😊 **TOUT EST EN ORDRE !**

Nous n'avons trouvé aucune commande à annuler.
Vos commandes récentes ont toutes été traitées avec succès.

🎯 **Prochaines actions :**
🍕 Tapez **"resto"** → Voir tous les restaurants
🔢 Tapez **le numéro du resto** → Accéder directement`;
  }

  /**
   * Message pour le livreur
   */
  private formatDriverCancellationMessage(order: CancellableOrder): string {
    return `🚫 **COMMANDE ANNULÉE PAR CLIENT**

📋 N°${order.order_number}
🏠 ${order.delivery_address || 'Adresse non spécifiée'}
💰 ${order.total_amount.toFixed(2)}€

⚠️ **Plus de livraison nécessaire**
Commande supprimée de vos tâches.

Merci de votre compréhension.`;
  }
}