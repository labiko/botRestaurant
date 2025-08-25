import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { WhatsAppNotificationService } from './whatsapp-notification.service';

export interface VersementOTP {
  orderId: string;
  otpCode: string;
  generatedAt: string;
  attempts: number;
}

@Injectable({
  providedIn: 'root'
})
export class VersementOtpService {

  constructor(
    private supabase: SupabaseService,
    private whatsappService: WhatsAppNotificationService
  ) { }

  // Générer un code OTP 4 chiffres et l'envoyer au livreur
  async generateAndSendOTP(orderId: string): Promise<boolean> {
    try {
      console.log('🔐 Génération OTP versement pour commande:', orderId);

      // Récupérer les détails de la commande
      const { data: orderData, error: orderError } = await this.supabase
        .from('commandes')
        .select('numero_commande, livreur_phone, livreur_nom, total, paiement_mode')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('❌ Erreur récupération commande:', orderError);
        return false;
      }

      // Vérifier que c'est une commande livraison avec livreur
      if (orderData.paiement_mode !== 'livraison' || !orderData.livreur_phone) {
        console.error('❌ Commande non éligible pour OTP versement');
        return false;
      }

      // Générer code OTP 4 chiffres (1000-9999)
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const generatedAt = new Date().toISOString();

      // Sauvegarder l'OTP en base
      const { error: updateError } = await this.supabase
        .from('commandes')
        .update({
          versement_otp_code: otpCode,
          versement_otp_generated_at: generatedAt,
          versement_otp_attempts: 0
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('❌ Erreur sauvegarde OTP:', updateError);
        return false;
      }

      // Envoyer le code par WhatsApp au livreur
      const message = `🔐 CODE DE VERSEMENT

📦 Commande N°${orderData.numero_commande}
💰 Montant: ${new Intl.NumberFormat('fr-GN').format(orderData.total)} GNF

👨‍💼 Le restaurant demande confirmation
que vous avez versé l'argent.

🔢 CODE: ${otpCode}

⚠️ Communiquez ce code APRÈS avoir
versé l'argent au restaurant`;

      const sent = await this.whatsappService.sendMessage(
        orderData.livreur_phone,
        message,
        orderData.numero_commande
      );

      if (sent) {
        console.log(`✅ OTP ${otpCode} envoyé au livreur ${orderData.livreur_nom}`);
        return true;
      } else {
        console.error('❌ Échec envoi OTP au livreur');
        return false;
      }

    } catch (error) {
      console.error('❌ Erreur génération/envoi OTP:', error);
      return false;
    }
  }

  // Valider le code OTP saisi par le restaurant
  async validateOTP(orderId: string, inputCode: string): Promise<boolean> {
    try {
      console.log('🔍 Validation OTP versement:', { orderId, inputCode });

      // Récupérer les données OTP de la commande
      const { data: orderData, error: orderError } = await this.supabase
        .from('commandes')
        .select('versement_otp_code, versement_otp_attempts, livreur_phone, livreur_nom, numero_commande, total')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('❌ Erreur récupération données OTP:', orderError);
        return false;
      }

      // Vérifier si un OTP existe
      if (!orderData.versement_otp_code) {
        console.error('❌ Aucun OTP généré pour cette commande');
        return false;
      }

      // Vérifier le nombre d'tentatives
      if (orderData.versement_otp_attempts >= 3) {
        console.error('❌ Nombre maximum de tentatives atteint');
        return false;
      }

      // Incrémenter le nombre de tentatives
      const newAttempts = (orderData.versement_otp_attempts || 0) + 1;

      // Vérifier si le code correspond
      if (orderData.versement_otp_code === inputCode) {
        // Code valide - confirmer le versement
        const { error: confirmError } = await this.supabase
          .from('commandes')
          .update({
            versement_confirmed: true,
            versement_otp_validated_at: new Date().toISOString(),
            versement_otp_attempts: newAttempts
          })
          .eq('id', orderId);

        if (confirmError) {
          console.error('❌ Erreur confirmation versement:', confirmError);
          return false;
        }

        // Envoyer confirmation au livreur
        await this.sendConfirmationToDriver(
          orderData.livreur_phone,
          orderData.numero_commande,
          orderData.total
        );

        console.log('✅ OTP validé, versement confirmé');
        return true;

      } else {
        // Code incorrect - incrémenter tentatives
        const { error: attemptError } = await this.supabase
          .from('commandes')
          .update({
            versement_otp_attempts: newAttempts
          })
          .eq('id', orderId);

        if (attemptError) {
          console.error('❌ Erreur mise à jour tentatives:', attemptError);
        }

        console.log(`❌ Code incorrect. Tentative ${newAttempts}/3`);
        return false;
      }

    } catch (error) {
      console.error('❌ Erreur validation OTP:', error);
      return false;
    }
  }

  // Envoyer message de confirmation au livreur
  private async sendConfirmationToDriver(
    driverPhone: string,
    orderNumber: string,
    total: number
  ): Promise<void> {
    try {
      const confirmationMessage = `✅ VERSEMENT CONFIRMÉ

📦 Commande N°${orderNumber}
💰 Montant: ${new Intl.NumberFormat('fr-GN').format(total)} GNF

🎉 Le restaurant a confirmé la réception
de votre versement.

Vous pouvez maintenant marquer 
la commande comme livrée.`;

      await this.whatsappService.sendMessage(
        driverPhone,
        confirmationMessage,
        orderNumber
      );

      console.log('✅ Confirmation versement envoyée au livreur');

    } catch (error) {
      console.error('❌ Erreur envoi confirmation:', error);
    }
  }

  // Regénérer un nouveau code OTP
  async regenerateOTP(orderId: string): Promise<boolean> {
    try {
      console.log('🔄 Régénération OTP pour commande:', orderId);
      
      // Reset les tentatives et regénérer
      const { error: resetError } = await this.supabase
        .from('commandes')
        .update({
          versement_otp_attempts: 0
        })
        .eq('id', orderId);

      if (resetError) {
        console.error('❌ Erreur reset tentatives:', resetError);
        return false;
      }

      // Générer et envoyer nouveau code
      return await this.generateAndSendOTP(orderId);

    } catch (error) {
      console.error('❌ Erreur régénération OTP:', error);
      return false;
    }
  }

  // Vérifier l'état du versement
  async getVersementStatus(orderId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('commandes')
        .select('versement_confirmed, versement_otp_code, versement_otp_attempts, versement_otp_validated_at')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération statut versement:', error);
        return null;
      }

      return {
        confirmed: data.versement_confirmed,
        hasOTP: !!data.versement_otp_code,
        attempts: data.versement_otp_attempts || 0,
        validatedAt: data.versement_otp_validated_at
      };

    } catch (error) {
      console.error('❌ Erreur getVersementStatus:', error);
      return null;
    }
  }
}