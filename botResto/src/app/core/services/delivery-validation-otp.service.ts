import { Injectable } from '@angular/core';
import { SupabaseFranceService } from './supabase-france.service';
import { WhatsAppNotificationFranceService } from './whatsapp-notification-france.service';
import { FranceOrder } from './france-orders.service';

export interface DeliveryOTPResult {
  success: boolean;
  message: string;
}

export interface OTPValidationResult {
  isValid: boolean;
  expired: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryValidationOtpService {

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private whatsappNotificationService: WhatsAppNotificationFranceService
  ) {}

  /**
   * Vérifier si un code de validation existe pour la commande
   */
  async checkExistingOTP(order: FranceOrder): Promise<DeliveryOTPResult> {
    try {
      console.log(`🔐 [DeliveryValidationOTP] Vérification code existant pour commande ${order.order_number}`);

      // Vérifier si un code existe déjà
      if (!order.delivery_validation_code) {
        console.error('❌ [DeliveryValidationOTP] Aucun code de validation pour cette commande');
        return {
          success: false,
          message: 'Aucun code de validation pour cette commande'
        };
      }

      console.log(`✅ [DeliveryValidationOTP] Code existant trouvé pour commande ${order.order_number}`);
      return {
        success: true,
        message: 'Demandez le code de validation au client'
      };

    } catch (error) {
      console.error('❌ [DeliveryValidationOTP] Erreur vérification code:', error);
      return {
        success: false,
        message: 'Erreur lors de la vérification'
      };
    }
  }

  /**
   * Valider le code OTP saisi par le livreur
   */
  async validateDeliveryOTP(orderId: number, inputCode: string): Promise<OTPValidationResult> {
    try {
      console.log(`🔍 [DeliveryValidationOTP] Validation OTP pour commande ${orderId}`);

      // Récupérer l'OTP de la commande
      const { data: orderData, error: orderError } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('delivery_validation_code, date_validation_code, order_number')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('❌ [DeliveryValidationOTP] Erreur récupération données OTP:', orderError);
        return {
          isValid: false,
          expired: false,
          message: 'Erreur lors de la vérification du code'
        };
      }

      // Vérifier si un OTP existe
      if (!orderData.delivery_validation_code) {
        console.error('❌ [DeliveryValidationOTP] Aucun OTP généré pour cette commande');
        return {
          isValid: false,
          expired: false,
          message: 'Aucun code de validation généré'
        };
      }

      // SUPPRIMÉ : Vérification d'expiration - les codes OTP ne doivent jamais expirer

      // Vérifier si le code correspond
      const isCodeValid = orderData.delivery_validation_code === inputCode;

      if (isCodeValid) {
        console.log(`✅ [DeliveryValidationOTP] Code valide pour commande ${orderData.order_number}`);
        return {
          isValid: true,
          expired: false,
          message: 'Code valide !'
        };
      } else {
        console.log(`❌ [DeliveryValidationOTP] Code incorrect pour commande ${orderData.order_number}`);
        return {
          isValid: false,
          expired: false,
          message: 'Code incorrect. Vérifiez le code fourni par le client.'
        };
      }

    } catch (error) {
      console.error('❌ [DeliveryValidationOTP] Erreur validation OTP:', error);
      return {
        isValid: false,
        expired: false,
        message: 'Erreur lors de la validation du code'
      };
    }
  }

  /**
   * Nettoyer l'OTP après validation réussie
   */
  async clearDeliveryOTP(orderId: number): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_orders')
        .update({
          delivery_validation_code: null,
          date_validation_code: null
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ [DeliveryValidationOTP] Erreur nettoyage OTP:', error);
        return false;
      }

      console.log(`✅ [DeliveryValidationOTP] OTP nettoyé pour commande ${orderId}`);
      return true;
    } catch (error) {
      console.error('❌ [DeliveryValidationOTP] Erreur service nettoyage OTP:', error);
      return false;
    }
  }

  /**
   * Vérifier si un OTP existe déjà pour une commande
   */
  async hasActiveOTP(orderId: number): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('delivery_validation_code')
        .eq('id', orderId)
        .single();

      if (error || !data) {
        return false;
      }

      // Vérifier si OTP existe (pas d'expiration)
      return !!data.delivery_validation_code;
    } catch (error) {
      console.error('❌ [DeliveryValidationOTP] Erreur vérification OTP actif:', error);
      return false;
    }
  }

  /**
   * Obtenir les informations sur l'OTP actuel
   */
  async getOTPStatus(orderId: number): Promise<{
    hasOTP: boolean;
  }> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('delivery_validation_code')
        .eq('id', orderId)
        .single();

      if (error || !data || !data.delivery_validation_code) {
        return {
          hasOTP: false
        };
      }

      return {
        hasOTP: true
      };
    } catch (error) {
      console.error('❌ [DeliveryValidationOTP] Erreur statut OTP:', error);
      return {
        hasOTP: false
      };
    }
  }
}