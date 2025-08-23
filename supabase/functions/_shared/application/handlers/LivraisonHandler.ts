/**
 * Handler pour la Livraison - Application Layer
 * Gère le calcul des frais de livraison selon les paramètres du restaurant
 */

import { Session } from '../../domain/entities/Session.ts';
import { IIncomingMessage, IMessageService } from '../../core/interfaces/IMessageService.ts';
import { IConversationHandler } from '../orchestrators/ConversationOrchestrator.ts';
import { RestaurantRepository } from '../../infrastructure/repositories/RestaurantRepository.ts';
import { LocationService } from '../services/LocationService.ts';

export class LivraisonHandler implements IConversationHandler {
  constructor(
    private messageService: IMessageService,
    private restaurantRepository: RestaurantRepository
  ) {}

  canHandle(session: Session, message: IIncomingMessage): boolean {
    return session.state === 'LIVRAISON_LOCATION' && (
      message.type === 'location' || 
      message.content.toLowerCase().includes('adresse')
    );
  }

  async handle(session: Session, message: IIncomingMessage): Promise<void> {
    const phoneNumber = message.from.replace(/@.*/, '');

    if (message.type === 'location' && message.location) {
      await this.handleLocationReceived(phoneNumber, session, message.location);
    } else {
      // Gérer l'adresse textuelle (à implémenter avec un service de géocodage)
      await this.handleAddressReceived(phoneNumber, session, message.content);
    }
  }

  private async handleLocationReceived(
    phoneNumber: string,
    session: Session,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    try {
      // Récupérer les informations du restaurant depuis la base de données
      const restaurantId = session.context.restaurantId;
      if (!restaurantId) {
        await this.messageService.sendTextMessage(
          phoneNumber,
          "❌ Erreur: restaurant non sélectionné. Recommencez votre commande."
        );
        return;
      }
      
      const restaurant = await this.restaurantRepository.findById(restaurantId);
      if (!restaurant) {
        await this.messageService.sendTextMessage(
          phoneNumber,
          "❌ Restaurant introuvable. Recommencez votre commande."
        );
        return;
      }
      
      const restaurantCoords = { 
        latitude: restaurant.latitude, 
        longitude: restaurant.longitude 
      };
      
      // Calculer la distance
      const distance = LocationService.calculateDistance(restaurantCoords, location);
      const roundedDistance = LocationService.roundUpDistance(distance);
      
      // Paramètres du restaurant depuis la base de données
      const restaurantParams = {
        tarifKm: restaurant.tarifKm,
        seuilGratuite: restaurant.seuilGratuite,
        minimumLivraison: restaurant.minimumLivraison,
        rayonLivraison: restaurant.rayonLivraison
      };

    const sousTotal = session.context.sousTotal || 0;

    // Vérifications
    if (sousTotal < restaurantParams.minimumLivraison) {
      await this.handleMinimumNotMet(phoneNumber, sousTotal, restaurantParams.minimumLivraison);
      return;
    }

    if (distance > restaurantParams.rayonLivraison) {
      await this.handleOutOfRange(phoneNumber, distance, restaurantParams.rayonLivraison);
      return;
    }

    // Calculer les frais
    const fraisLivraison = sousTotal >= restaurantParams.seuilGratuite ? 0 : roundedDistance * restaurantParams.tarifKm;
    const total = sousTotal + fraisLivraison;

    // Formater l'adresse
    const adresse = LocationService.formatAddress(location);

    let confirmationMessage = `📍 Adresse de livraison confirmée
📌 ${adresse} (${roundedDistance} km)

🛒 Sous-total: ${sousTotal.toLocaleString('fr-FR')} GNF\n`;

    if (fraisLivraison === 0) {
      confirmationMessage += `🎉 Livraison: GRATUITE! ✅
   (commande supérieure à ${restaurantParams.seuilGratuite.toLocaleString('fr-FR')} GNF)\n`;
    } else {
      confirmationMessage += `🚚 Frais de livraison: ${fraisLivraison.toLocaleString('fr-FR')} GNF
   (${roundedDistance} km × ${restaurantParams.tarifKm.toLocaleString('fr-FR')} GNF/km)\n`;
    }

    confirmationMessage += `────────────────────
💰 Total final: ${total.toLocaleString('fr-FR')} GNF

✅ Confirmer cette livraison? (OUI/NON)`;

      await this.messageService.sendTextMessage(phoneNumber, confirmationMessage);

      // Sauvegarder les détails de livraison
      session.updateContext({
        adresseLivraison: adresse,
        distanceKm: roundedDistance,
        fraisLivraison: fraisLivraison,
        total: total,
        positionClient: { lat: location.latitude, lng: location.longitude }
      });
      session.updateState('LIVRAISON_CALCULATION');
      
    } catch (error) {
      console.error('Error processing delivery:', error);
      await this.messageService.sendTextMessage(
        phoneNumber,
        "❌ Erreur lors du calcul de livraison. Veuillez réessayer."
      );
    }
  }

  private async handleAddressReceived(
    phoneNumber: string,
    session: Session,
    address: string
  ): Promise<void> {
    // Pour l'instant, demander la position GPS
    const message = `📍 Merci pour l'adresse: "${address}"

Pour un calcul précis des frais de livraison, partagez également votre position GPS.

Cliquez sur 📎 → Position → Position actuelle`;

    await this.messageService.sendTextMessage(phoneNumber, message);
  }

  private async handleMinimumNotMet(
    phoneNumber: string,
    currentTotal: number,
    minimum: number
  ): Promise<void> {
    const difference = minimum - currentTotal;
    
    const message = `⚠️ Désolé, le minimum pour livraison est ${minimum.toLocaleString('fr-FR')} GNF
Votre panier: ${currentTotal.toLocaleString('fr-FR')} GNF

Que souhaitez-vous faire?

1️⃣ Ajouter des articles (${difference.toLocaleString('fr-FR')} GNF minimum)
2️⃣ Choisir 'À emporter' à la place
3️⃣ Annuler la commande

Répondez avec votre choix.`;

    await this.messageService.sendTextMessage(phoneNumber, message);
  }

  private async handleOutOfRange(
    phoneNumber: string,
    distance: number,
    maxDistance: number
  ): Promise<void> {
    const message = `⚠️ Désolé, votre adresse est hors zone de livraison.
Distance: ${distance.toFixed(1)} km (maximum: ${maxDistance} km)

Que souhaitez-vous faire?

1️⃣ Choisir 'À emporter' à la place
2️⃣ Choisir un autre restaurant plus proche
3️⃣ Annuler la commande

Répondez avec votre choix.`;

    await this.messageService.sendTextMessage(phoneNumber, message);
  }
}