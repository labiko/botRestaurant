import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { WhatsAppNotificationService } from './whatsapp-notification.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantPasswordRecoveryService {

  constructor(
    private supabase: SupabaseService,
    private whatsappService: WhatsAppNotificationService
  ) { }

  /**
   * Récupère et envoie le mot de passe du restaurant par WhatsApp
   * @param phone Numéro de téléphone du restaurant
   * @returns Promise<{success: boolean, message: string}>
   */
  async sendPassword(phone: string): Promise<{success: boolean, message: string}> {
    try {
      console.log('🔍 Recherche du restaurant avec le téléphone:', phone);

      // Nettoyer le numéro (enlever le + si présent)
      const cleanPhone = phone.trim().replace('+', '');
      console.log('📱 Téléphone nettoyé:', cleanPhone);

      // Chercher le restaurant par son numéro de téléphone
      console.log('🔍 Recherche dans restaurants avec telephone =', cleanPhone);
      const { data: restaurant, error: restaurantError } = await this.supabase
        .from('restaurants')
        .select(`
          id,
          nom,
          password,
          telephone,
          statut
        `)
        .eq('telephone', cleanPhone)
        .eq('statut', 'ouvert')
        .single();

      console.log('🗄️ Résultat de la requête:', { restaurant, error: restaurantError });

      if (restaurantError || !restaurant) {
        console.error('❌ Restaurant non trouvé:', restaurantError);
        return {
          success: false,
          message: 'PHONE_NOT_FOUND'
        };
      }

      // Vérifier que le restaurant a un mot de passe
      if (!restaurant.password) {
        console.log('❌ Pas de mot de passe configuré pour ce restaurant');
        return {
          success: false,
          message: 'NO_PASSWORD'
        };
      }

      // Créer le message WhatsApp moderne
      const message = this.createPasswordMessage(
        restaurant.nom, 
        restaurant.password, 
        restaurant.telephone
      );

      // Utiliser telephone avec le préfixe + pour WhatsApp
      const whatsappNumber = '+' + restaurant.telephone;
      
      // Envoyer le message
      const sent = await this.whatsappService.sendMessage(
        whatsappNumber,
        message,
        `PASSWORD_RECOVERY_${Date.now()}`
      );

      if (sent) {
        console.log(`✅ Mot de passe envoyé à ${restaurant.nom} (${whatsappNumber})`);
        
        // Optionnel : Logger l'envoi en base de données
        await this.logPasswordRecovery(restaurant.telephone, restaurant.nom);

        return {
          success: true,
          message: 'PASSWORD_SENT'
        };
      } else {
        console.error('❌ Échec envoi WhatsApp');
        return {
          success: false,
          message: 'SEND_FAILED'
        };
      }

    } catch (error) {
      console.error('❌ Erreur récupération mot de passe:', error);
      return {
        success: false,
        message: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Crée un message WhatsApp moderne pour l'envoi du mot de passe
   */
  private createPasswordMessage(restaurantName: string, password: string, phone: string): string {
    return `🔐 MOT DE PASSE RESTAURANT

Salut ${restaurantName} 👋

Votre mot de passe: *${password}*

Connectez-vous maintenant sur l'app !

${restaurantName}`;
  }

  /**
   * Enregistre la tentative de récupération en base (optionnel)
   */
  private async logPasswordRecovery(phone: string, restaurantName: string): Promise<void> {
    try {
      // Désactivé pour éviter l'erreur de table inexistante
      // const { error } = await this.supabase
      //   .from('restaurant_logs')
      //   .insert({
      //     email: email,
      //     action: 'password_recovery',
      //     details: `Mot de passe envoyé à ${restaurantName}`,
      //     created_at: new Date().toISOString()
      //   });

      // if (error) {
      //   console.error('❌ Erreur log récupération:', error);
      // } else {
      //   console.log('📝 Log récupération enregistré');
      // }
      
      console.log('📝 Log récupération (simulé):', `Mot de passe envoyé à ${restaurantName} (${phone})`);
    } catch (error) {
      console.error('❌ Erreur système log:', error);
    }
  }

  /**
   * Valide le format de l'email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

}