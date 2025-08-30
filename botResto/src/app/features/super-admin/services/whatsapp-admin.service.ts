import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface RestaurantNotificationData {
  restaurantName: string;
  ownerName: string;
  phone: string;
  email?: string;
  planType?: string;
  validityPeriod?: string;
  activationCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppAdminService {
  // Utiliser les mêmes credentials Green API
  private readonly GREEN_API_INSTANCE_ID = '7105303512';
  private readonly GREEN_API_TOKEN = '022e5da3d2e641ab99a3f70539270b187fbfa80635c44b71ad';
  private readonly baseUrl = 'https://7105.api.greenapi.com';

  // Templates pour les restaurants
  private readonly RESTAURANT_TEMPLATES = {
    welcome: `🎉 *BIENVENUE SUR NOTRE PLATEFORME !*

🏪 Restaurant: {restaurantName}
👤 Propriétaire: {ownerName}
📧 Email: {email}

✅ *Votre inscription est confirmée !*

🔐 *Code d'activation:* {activationCode}
📱 *Plan:* {planType}
⏱️ *Période d'essai:* {validityPeriod}

📚 *Prochaines étapes:*
1️⃣ Connectez-vous sur app.restaurant.com
2️⃣ Configurez votre menu
3️⃣ Ajoutez vos plats avec photos
4️⃣ Définissez vos zones de livraison
5️⃣ Commencez à recevoir des commandes !

💡 *Besoin d'aide ?*
📞 Support: +224 XXX XXX XXX
📧 Email: support@restaurant.com
💬 WhatsApp: Répondez à ce message

Bienvenue dans la famille ! 🚀`,

    accountActivated: `✅ *COMPTE ACTIVÉ AVEC SUCCÈS !*

🏪 {restaurantName}

Votre compte est maintenant actif et prêt à recevoir des commandes !

🎯 *Statut:* Actif
📱 *Plan:* {planType}
📅 *Valide jusqu'au:* {validityPeriod}

🚀 Vous pouvez maintenant:
• Recevoir des commandes
• Gérer votre menu
• Suivre vos livreurs
• Consulter vos statistiques

Bonne vente ! 💪`,

    subscriptionReminder: `⏰ *RAPPEL - RENOUVELLEMENT D'ABONNEMENT*

🏪 {restaurantName}

Votre abonnement {planType} expire dans {daysRemaining} jours.

💳 *Options de renouvellement:*
• Mensuel: {monthlyPrice}
• Annuel: {yearlyPrice} (économisez 20%)

🔄 Pour renouveler:
1. Connectez-vous à votre compte
2. Allez dans Paramètres > Abonnement
3. Choisissez votre plan

Questions ? Contactez le support.`,

    accountSuspended: `⚠️ *COMPTE TEMPORAIREMENT SUSPENDU*

🏪 {restaurantName}

Votre compte a été temporairement suspendu.

📝 *Raison:* {suspensionReason}
📅 *Date:* {suspensionDate}

Pour réactiver votre compte:
📞 Contactez le support: +224 XXX XXX XXX
📧 Email: support@restaurant.com

Nous sommes là pour vous aider.`,

    performanceReport: `📊 *RAPPORT HEBDOMADAIRE*

🏪 {restaurantName}
📅 Semaine du {weekStart} au {weekEnd}

📈 *Vos performances:*
• Commandes: {totalOrders}
• Revenus: {totalRevenue}
• Note moyenne: {averageRating} ⭐
• Taux de satisfaction: {satisfactionRate}%

🏆 *Top 3 plats:*
1. {topDish1}
2. {topDish2}
3. {topDish3}

💡 *Conseil de la semaine:*
{weeklyTip}

Continuez comme ça ! 🚀`,

    newFeature: `🆕 *NOUVELLE FONCTIONNALITÉ !*

🏪 {restaurantName}

Nous avons le plaisir de vous annoncer:

✨ *{featureTitle}*

{featureDescription}

🎯 *Avantages pour vous:*
{featureBenefits}

📚 *Comment l'utiliser:*
{featureInstructions}

Des questions ? On est là pour vous aider !`,

    systemMaintenance: `🔧 *MAINTENANCE PROGRAMMÉE*

🏪 {restaurantName}

Une maintenance est prévue:

📅 *Date:* {maintenanceDate}
⏰ *Heure:* {maintenanceTime}
⏱️ *Durée estimée:* {maintenanceDuration}

Pendant cette période:
• Réception des commandes: ❌
• Accès au tableau de bord: ❌
• WhatsApp Bot: ✅ (mode limité)

Merci de votre compréhension.`,

    accountBlocked: `🚫 *COMPTE BLOQUÉ*

🏪 {restaurantName}

Votre compte a été bloqué par l'administration.

📝 *Raison:* {reason}
📅 *Date:* {blockDate}

❌ *Conséquences:*
• Connexion impossible
• Réception des commandes suspendue
• Accès au tableau de bord bloqué

Pour faire appel à cette décision:
📞 Contactez le support: +224 XXX XXX XXX
📧 Email: support@restaurant.com

Nous restons à votre disposition.`,

    accountUnblocked: `✅ *COMPTE DÉBLOQUÉ*

🏪 {restaurantName}

Bonne nouvelle ! Votre compte a été débloqué.

✅ *Vous pouvez maintenant:*
• Vous connecter à nouveau
• Recevoir des commandes
• Accéder à votre tableau de bord

📅 *Date de déblocage:* {unblockDate}

Bienvenue de nouveau ! 🎉

Connectez-vous dès maintenant sur app.restaurant.com`,

    passwordReset: `🔐 *MOT DE PASSE RÉINITIALISÉ*

🏪 {restaurantName}

Votre mot de passe a été réinitialisé par l'administration.

🔄 *Prochaines étapes:*
1. Allez sur app.restaurant.com
2. Entrez votre numéro de téléphone: {phone}
3. Laissez le champ mot de passe vide
4. Un assistant vous guidera pour créer un nouveau mot de passe sécurisé

⚠️ *Important:*
• Votre ancien mot de passe ne fonctionne plus
• Vous devez créer un nouveau mot de passe pour vous reconnecter
• Cette opération est sécurisée et unique

Besoin d'aide ?
📞 Support: +224 XXX XXX XXX
📧 Email: support@restaurant.com`
  };

  constructor(private http: HttpClient) {}

  /**
   * Envoie un message de bienvenue lors de l'inscription
   */
  async sendWelcomeMessage(data: RestaurantNotificationData): Promise<boolean> {
    const message = this.fillTemplate(this.RESTAURANT_TEMPLATES.welcome, {
      restaurantName: data.restaurantName,
      ownerName: data.ownerName,
      email: data.email || 'Non renseigné',
      planType: data.planType || 'Essai Gratuit 30 jours',
      validityPeriod: data.validityPeriod || '30 jours',
      activationCode: data.activationCode || this.generateActivationCode()
    });

    return this.sendMessage(data.phone, message);
  }

  /**
   * Envoie une notification d'activation de compte
   */
  async sendAccountActivatedMessage(data: RestaurantNotificationData): Promise<boolean> {
    const message = this.fillTemplate(this.RESTAURANT_TEMPLATES.accountActivated, data);
    return this.sendMessage(data.phone, message);
  }

  /**
   * Envoie un rappel de renouvellement
   */
  async sendSubscriptionReminder(
    phone: string, 
    restaurantName: string, 
    daysRemaining: number,
    planDetails: any
  ): Promise<boolean> {
    const message = this.fillTemplate(this.RESTAURANT_TEMPLATES.subscriptionReminder, {
      restaurantName,
      daysRemaining,
      ...planDetails
    });
    return this.sendMessage(phone, message);
  }

  /**
   * Envoie une notification de suspension
   */
  async sendSuspensionNotice(
    phone: string,
    restaurantName: string,
    reason: string
  ): Promise<boolean> {
    const message = this.fillTemplate(this.RESTAURANT_TEMPLATES.accountSuspended, {
      restaurantName,
      suspensionReason: reason,
      suspensionDate: new Date().toLocaleDateString('fr-FR')
    });
    return this.sendMessage(phone, message);
  }

  /**
   * Envoie un message personnalisé en masse
   */
  async sendBulkMessage(
    restaurants: { phone: string; name: string }[],
    messageTemplate: string,
    variables?: any
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    for (const restaurant of restaurants) {
      const message = this.fillTemplate(messageTemplate, {
        restaurantName: restaurant.name,
        ...variables
      });

      const sent = await this.sendMessage(restaurant.phone, message);
      if (sent) successful++;
      else failed++;

      // Délai entre les messages pour éviter le spam
      await this.delay(1000);
    }

    return { successful, failed };
  }

  /**
   * Fonction générique d'envoi (réutilise la logique existante)
   */
  private async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      const cleanPhone = this.cleanPhoneNumber(phone);
      const chatId = `${cleanPhone}@c.us`;
      const url = `${this.baseUrl}/waInstance${this.GREEN_API_INSTANCE_ID}/sendMessage/${this.GREEN_API_TOKEN}`;

      const response = await this.http.post<any>(
        url,
        { chatId, message },
        { headers: { 'Content-Type': 'application/json' } }
      ).toPromise();

      return !!response?.idMessage;
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Nettoie le numéro de téléphone (réutilise la logique existante)
   */
  private cleanPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+')) {
      return cleaned.substring(1);
    }
    
    if (cleaned.startsWith('00')) {
      return cleaned.substring(2);
    }
    
    if (cleaned.startsWith('224')) {
      return cleaned;
    }
    
    if (cleaned.length === 8 || cleaned.length === 9) {
      return `224${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Remplit un template avec les données
   */
  private fillTemplate(template: string, data: any): string {
    let filled = template;
    
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      filled = filled.replace(regex, data[key]?.toString() || '');
    });
    
    return filled;
  }

  /**
   * Génère un code d'activation
   */
  private generateActivationCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  /**
   * Envoie une notification de blocage de compte
   */
  async sendAccountBlockedMessage(data: {
    restaurantName: string;
    ownerName: string;
    phone: string;
    reason: string;
  }): Promise<boolean> {
    const message = this.fillTemplate(this.RESTAURANT_TEMPLATES.accountBlocked, {
      restaurantName: data.restaurantName,
      reason: data.reason,
      blockDate: new Date().toLocaleDateString('fr-FR')
    });
    return this.sendMessage(data.phone, message);
  }

  /**
   * Envoie une notification de déblocage de compte
   */
  async sendAccountUnblockedMessage(data: {
    restaurantName: string;
    ownerName: string;
    phone: string;
  }): Promise<boolean> {
    const message = this.fillTemplate(this.RESTAURANT_TEMPLATES.accountUnblocked, {
      restaurantName: data.restaurantName,
      unblockDate: new Date().toLocaleDateString('fr-FR')
    });
    return this.sendMessage(data.phone, message);
  }

  /**
   * Envoie une notification de réinitialisation de mot de passe
   */
  async sendPasswordResetMessage(data: {
    restaurantName: string;
    ownerName: string;
    phone: string;
  }): Promise<boolean> {
    const message = this.fillTemplate(this.RESTAURANT_TEMPLATES.passwordReset, {
      restaurantName: data.restaurantName,
      phone: data.phone
    });
    return this.sendMessage(data.phone, message);
  }

  /**
   * Délai utilitaire
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}