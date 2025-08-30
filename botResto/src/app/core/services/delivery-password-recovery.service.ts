import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { WhatsAppNotificationService } from './whatsapp-notification.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryPasswordRecoveryService {

  constructor(
    private supabase: SupabaseService,
    private whatsappService: WhatsAppNotificationService
  ) { }

  /**
   * Récupère et envoie le code d'accès du livreur par WhatsApp
   * @param phone Numéro de téléphone du livreur
   * @returns Promise<{success: boolean, message: string}>
   */
  async sendAccessCode(phone: string): Promise<{success: boolean, message: string}> {
    try {
      console.log('🔍 Recherche du livreur avec le téléphone:', phone);

      // Nettoyer le numéro de téléphone
      const cleanPhone = this.cleanPhoneNumber(phone);
      console.log('📱 Numéro original:', phone);
      console.log('📱 Numéro nettoyé:', cleanPhone);

      // Chercher le livreur dans la base de données
      console.log('🔍 Recherche dans delivery_users avec telephone =', cleanPhone);
      const { data: delivery, error: deliveryError } = await this.supabase
        .from('delivery_users')
        .select('nom, telephone, code_acces, status, is_blocked')
        .eq('telephone', cleanPhone)
        .single();

      console.log('🗄️ Résultat de la requête:', { delivery, error: deliveryError });

      if (deliveryError || !delivery) {
        console.error('❌ Livreur non trouvé:', deliveryError);
        return {
          success: false,
          message: 'PHONE_NOT_FOUND'
        };
      }

      // Vérifier que le livreur n'est pas bloqué
      if (delivery.is_blocked) {
        console.log('🚫 Livreur bloqué');
        return {
          success: false,
          message: 'USER_BLOCKED'
        };
      }

      // Vérifier que le livreur est actif
      if (delivery.status !== 'actif') {
        console.log('💤 Livreur inactif');
        return {
          success: false,
          message: 'USER_INACTIVE'
        };
      }

      // Créer le message WhatsApp moderne
      const message = this.createAccessCodeMessage(delivery.nom, delivery.code_acces);

      // Envoyer le message
      const sent = await this.whatsappService.sendMessage(
        cleanPhone,
        message,
        `ACCESS_CODE_${Date.now()}`
      );

      if (sent) {
        console.log(`✅ Code d'accès envoyé à ${delivery.nom} (${cleanPhone})`);
        
        // Optionnel : Logger l'envoi en base de données
        await this.logPasswordRecovery(cleanPhone, delivery.nom);

        return {
          success: true,
          message: 'CODE_SENT'
        };
      } else {
        console.error('❌ Échec envoi WhatsApp');
        return {
          success: false,
          message: 'SEND_FAILED'
        };
      }

    } catch (error) {
      console.error('❌ Erreur récupération code d\'accès:', error);
      return {
        success: false,
        message: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Crée un message WhatsApp moderne pour l'envoi du code d'accès
   */
  private createAccessCodeMessage(driverName: string, accessCode: string): string {
    return `🔐 CODE D'ACCÈS LIVREUR

Salut ${driverName} 👋

Votre code: *${accessCode}*

Connectez-vous maintenant sur l'app !

🚴‍♂️ Service Livraison`;
  }

  /**
   * Enregistre la tentative de récupération en base (optionnel)
   */
  private async logPasswordRecovery(phone: string, driverName: string): Promise<void> {
    try {
      // Désactivé pour éviter l'erreur de table inexistante
      // const { error } = await this.supabase
      //   .from('delivery_logs')
      //   .insert({
      //     phone: phone,
      //     action: 'password_recovery',
      //     details: `Code d'accès envoyé à ${driverName}`,
      //     created_at: new Date().toISOString()
      //   });

      // if (error) {
      //   console.error('❌ Erreur log récupération:', error);
      // } else {
      //   console.log('📝 Log récupération enregistré');
      // }
      
      console.log('📝 Log récupération (simulé):', `Code envoyé à ${driverName} (${phone})`);
    } catch (error) {
      console.error('❌ Erreur système log:', error);
    }
  }

  /**
   * Nettoie et formate le numéro de téléphone (sans validation pour tests)
   */
  private cleanPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques
    let cleaned = phone.replace(/[^\d]/g, '');
    
    // Retourner le numéro tel qu'il est saisi (pas de transformation)
    return cleaned;
  }

  /**
   * Valide le format du numéro de téléphone guinéen
   */
  validateGuineanPhone(phone: string): boolean {
    const cleaned = this.cleanPhoneNumber(phone);
    
    // Format attendu: 224 + 8 ou 9 chiffres (soit 11 ou 12 chiffres au total)
    return /^224[6-9]\d{7,8}$/.test(cleaned);
  }
}