// ============================================================================
// SERVICE: PAYMENT LINK SERVICE
// Description: Service Angular pour envoyer des liens de paiement
// Utilisé par: Back office restaurant + Application livreur
// ============================================================================

import { Injectable } from '@angular/core';
import { FRANCE_CONFIG } from '../../config/environment-config';

export interface SendPaymentLinkRequest {
  orderId: number;
  senderId?: number;
  senderType: 'restaurant' | 'driver' | 'system';
  customMessage?: string;
  expiresIn?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface SendPaymentLinkResponse {
  success: boolean;
  paymentLinkId?: number;
  paymentUrl?: string;
  messageSent: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentLinkService {

  /**
   * Envoyer un lien de paiement à un client
   */
  async sendPaymentLink(request: SendPaymentLinkRequest): Promise<SendPaymentLinkResponse> {
    console.log('💳 [PaymentLinkService] Envoi lien paiement pour commande:', request.orderId);

    // Laisser la fonction Supabase utiliser la config DB ou les fallbacks
    const requestWithUrls = {
      ...request
      // successUrl et cancelUrl supprimés - utilise la config DB
    };

    console.log('🔗 [PaymentLinkService] Utilisation config DB pour les URLs de callback');

    try {
      const response = await fetch(
        `${FRANCE_CONFIG.supabaseFranceUrl}/functions/v1/payment-link-sender`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestWithUrls)
        }
      );

      const result: SendPaymentLinkResponse = await response.json();

      if (!result.success) {
        console.error('❌ [PaymentLinkService] Erreur:', result.error);
        throw new Error(result.error || 'Erreur envoi lien');
      }

      console.log('✅ [PaymentLinkService] Lien envoyé avec succès');
      return result;

    } catch (error: any) {
      console.error('❌ [PaymentLinkService] Erreur:', error);
      throw error;
    }
  }

  /**
   * Envoyer un lien depuis le back office restaurant
   */
  async sendFromRestaurant(orderId: number, customMessage?: string): Promise<SendPaymentLinkResponse> {
    return this.sendPaymentLink({
      orderId,
      senderType: 'restaurant',
      customMessage
    });
  }

  /**
   * Envoyer un lien depuis l'application livreur
   */
  async sendFromDriver(orderId: number, driverId: number, customMessage?: string): Promise<SendPaymentLinkResponse> {
    return this.sendPaymentLink({
      orderId,
      senderId: driverId,
      senderType: 'driver',
      customMessage
    });
  }
}