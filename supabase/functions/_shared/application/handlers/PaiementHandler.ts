/**
 * Handler pour le Paiement - Application Layer
 * Gère les différents modes de paiement
 */

import { Session } from '../../domain/entities/Session.ts';
import { Order, OrderMode, OrderStatus, PaymentMode, PaymentStatus, PaymentMethod } from '../../domain/entities/Order.ts';
import { IIncomingMessage, IMessageService } from '../../core/interfaces/IMessageService.ts';
import { IConversationHandler } from '../orchestrators/ConversationOrchestrator.ts';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository.ts';
import { ClientRepository } from '../../infrastructure/repositories/ClientRepository.ts';

export class PaiementHandler implements IConversationHandler {
  constructor(
    private messageService: IMessageService,
    private orderRepository: OrderRepository,
    private clientRepository: ClientRepository
  ) {}

  canHandle(session: Session, message: IIncomingMessage): boolean {
    const validStates = ['PAYMENT_SELECTION', 'LIVRAISON_CALCULATION'];
    
    if (!validStates.includes(session.state)) return false;

    if (session.state === 'PAYMENT_SELECTION') {
      return /^[1-2]$/.test(message.content.trim());
    }

    if (session.state === 'LIVRAISON_CALCULATION') {
      const response = message.content.trim().toLowerCase();
      return ['oui', 'non', 'o', 'n', 'yes', 'no'].includes(response);
    }

    return false;
  }

  async handle(session: Session, message: IIncomingMessage): Promise<void> {
    const phoneNumber = message.from.replace(/@.*/, '');

    if (session.state === 'PAYMENT_SELECTION') {
      await this.handlePaymentSelection(phoneNumber, session, message);
    } else if (session.state === 'LIVRAISON_CALCULATION') {
      await this.handleDeliveryConfirmation(phoneNumber, session, message);
    }
  }

  private async handlePaymentSelection(
    phoneNumber: string,
    session: Session,
    message: IIncomingMessage
  ): Promise<void> {
    const choice = message.content.trim();
    const mode = session.context.mode;

    if (choice === '1') {
      // Paiement maintenant
      await this.handlePaymentNow(phoneNumber, session);
    } else if (choice === '2') {
      // Paiement plus tard
      await this.handlePaymentLater(phoneNumber, session, mode);
    }
  }

  private async handleDeliveryConfirmation(
    phoneNumber: string,
    session: Session,
    message: IIncomingMessage
  ): Promise<void> {
    const response = message.content.trim().toLowerCase();

    if (['oui', 'o', 'yes'].includes(response)) {
      // Confirmation de livraison, passer au paiement
      const paymentMessage = `💳 Mode de paiement pour la livraison:

1️⃣ Payer maintenant (Orange Money/Wave)
2️⃣ Payer à la livraison (cash)

Total à payer: ${session.context.total?.toLocaleString('fr-FR')} GNF

Répondez avec votre choix.`;

      await this.messageService.sendTextMessage(phoneNumber, paymentMessage);
      session.updateState('PAYMENT_SELECTION');
      
    } else if (['non', 'n', 'no'].includes(response)) {
      // Refus, retourner au choix du mode
      const backMessage = `❌ Livraison annulée.

📦 Comment souhaitez-vous récupérer votre commande?

1️⃣ Sur place 🍽️
2️⃣ À emporter 📦
3️⃣ Essayer une autre adresse de livraison 🛵

Répondez avec votre choix.`;

      await this.messageService.sendTextMessage(phoneNumber, backMessage);
      session.updateState('MODE_SELECTION');
    }
  }

  private async handlePaymentNow(phoneNumber: string, session: Session): Promise<void> {
    const total = session.context.total || session.context.sousTotal || 0;
    
    const paymentMessage = `💳 Choisissez votre méthode de paiement:

1️⃣ Orange Money
2️⃣ Wave

Montant à payer: ${total.toLocaleString('fr-FR')} GNF

⚠️ Note: Le paiement mobile sera simulé pour cette démonstration.`;

    await this.messageService.sendTextMessage(phoneNumber, paymentMessage);
    session.updateState('PAYMENT_PROCESSING');

    // Simuler le traitement du paiement après 2 secondes
    setTimeout(async () => {
      await this.processPayment(phoneNumber, session, 'orange_money');
    }, 2000);
  }

  private async handlePaymentLater(
    phoneNumber: string,
    session: Session,
    mode: string | undefined
  ): Promise<void> {
    try {
      // Créer la commande dans la base de données
      const order = await this.createOrder(phoneNumber, session, 'later');
      
      let confirmationMessage = `✅ Commande #${order.numeroCommande} confirmée!\n\n`;

    switch (mode) {
      case 'sur_place':
        confirmationMessage += `🍽️ COMMANDE SUR PLACE
📍 ${session.context.restaurantNom}
📱 Montrez ce numéro à l'accueil
⏱️ Table prête dans ~10-15 minutes
💰 À payer sur place: ${total.toLocaleString('fr-FR')} GNF

Nous vous attendons!`;
        break;

      case 'emporter':
        confirmationMessage += `📦 COMMANDE À EMPORTER
📍 À récupérer: ${session.context.restaurantNom}
⏱️ Prête dans ~20-25 minutes
💰 À payer au retrait: ${total.toLocaleString('fr-FR')} GNF

📲 Nous vous préviendrons quand c'est prêt!`;
        break;

      default:
        confirmationMessage += `📦 Commande confirmée
💰 Montant: ${total.toLocaleString('fr-FR')} GNF`;
    }

    confirmationMessage += `\n\nTapez 'annuler' si vous devez modifier (5 min max).`;

      await this.messageService.sendTextMessage(phoneNumber, confirmationMessage);
      
      // Sauvegarder les détails de la commande
      session.updateContext({
        orderNumber: order.numeroCommande,
        orderId: order.id,
        paymentMode: 'later',
        orderStatus: 'confirmed'
      });
      session.updateState('ORDER_CONFIRMED');

      // Proposer de sauvegarder en favori
      setTimeout(async () => {
        await this.proposeFavorite(phoneNumber, session);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      await this.messageService.sendTextMessage(
        phoneNumber,
        "❌ Erreur lors de la création de la commande. Veuillez réessayer."
      );
    }
  }

  private async processPayment(
    phoneNumber: string,
    session: Session,
    method: string
  ): Promise<void> {
    try {
      // Créer la commande avec paiement immédiat
      const order = await this.createOrder(phoneNumber, session, 'now', method as PaymentMethod);
      const total = session.context.total || session.context.sousTotal || 0;
      const mode = session.context.mode;

      const paymentSuccessMessage = `✅ Paiement réussi!
💳 ${method === 'orange_money' ? 'Orange Money' : 'Wave'}: ${total.toLocaleString('fr-FR')} GNF

✅ Commande #${order.numeroCommande} confirmée!\n\n`;

    let orderDetails = '';
    switch (mode) {
      case 'sur_place':
        orderDetails = `🍽️ COMMANDE SUR PLACE
📍 ${session.context.restaurantNom}
⏱️ Table prête dans ~10-15 minutes`;
        break;

      case 'emporter':
        orderDetails = `📦 COMMANDE À EMPORTER
📍 ${session.context.restaurantNom}
⏱️ Prête dans ~20-25 minutes`;
        break;

      case 'livraison':
        orderDetails = `🛵 LIVRAISON EN COURS
📍 ${session.context.adresseLivraison}
⏱️ Arrivée estimée: 30-40 minutes
👤 Livreur: Attribution en cours...

📲 Nous vous contacterons à l'approche!`;
        break;
    }

    const fullMessage = paymentSuccessMessage + orderDetails;
    await this.messageService.sendTextMessage(phoneNumber, fullMessage);

      session.updateContext({
        orderNumber: order.numeroCommande,
        orderId: order.id,
        paymentMode: 'paid',
        paymentMethod: method,
        orderStatus: 'confirmed'
      });
      session.updateState('ORDER_CONFIRMED');

      // Proposer de sauvegarder en favori
      setTimeout(async () => {
        await this.proposeFavorite(phoneNumber, session);
      }, 3000);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      await this.messageService.sendTextMessage(
        phoneNumber,
        "❌ Erreur lors du traitement du paiement. Veuillez réessayer."
      );
    }
  }

  private async proposeFavorite(phoneNumber: string, session: Session): Promise<void> {
    const favoriteMessage = `⭐ Souhaitez-vous enregistrer ${session.context.restaurantNom} comme favori?

Vous pourrez y accéder plus rapidement la prochaine fois!

Répondez OUI ou NON`;

    await this.messageService.sendTextMessage(phoneNumber, favoriteMessage);
    session.updateState('FAVORI_REQUEST');
  }

  private async createOrder(
    phoneNumber: string, 
    session: Session, 
    paymentTiming: 'now' | 'later',
    paymentMethod?: PaymentMethod
  ): Promise<Order> {
    // Récupérer ou créer le client
    const client = await this.clientRepository.findOrCreateByPhone(phoneNumber);
    
    // Générer un numéro de commande
    const orderNumber = this.generateOrderNumber();
    
    // Mapper le mode de livraison
    const orderMode: OrderMode = session.context.mode === 'sur_place' ? 'sur_place' :
                                 session.context.mode === 'emporter' ? 'emporter' : 'livraison';
    
    // Créer la commande
    const order = new Order(
      crypto.randomUUID(),
      orderNumber,
      client.id,
      session.context.restaurantId,
      session.context.panier || [],
      session.context.sousTotal || 0,
      session.context.fraisLivraison || 0,
      session.context.total || session.context.sousTotal || 0,
      orderMode,
      'en_attente' as OrderStatus,
      paymentTiming === 'now' ? 'prepaid' as PaymentMode : 'postpaid' as PaymentMode,
      paymentTiming === 'now' ? 'paid' as PaymentStatus : 'pending' as PaymentStatus,
      paymentMethod,
      session.context.adresseLivraison,
      session.context.positionClient?.lat,
      session.context.positionClient?.lng,
      session.context.distanceKm
    );
    
    // Sauvegarder en base de données
    return await this.orderRepository.create(order);
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `${year}${month}-${random}`;
  }
}