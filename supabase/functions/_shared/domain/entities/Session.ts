/**
 * Entité Session - Domain Layer
 * Gestion de l'état de conversation
 */

import { IOrderItem } from './Order.ts';

export type ConversationState = 
  | 'INITIAL'
  | 'CHOOSING_RESTAURANT'
  | 'WAITING_LOCATION'
  | 'VIEWING_ALL_RESTOS'
  | 'VIEWING_MENU'
  | 'BUILDING_CART'
  | 'CART_CONFIRMATION'
  | 'CART_MODIFICATION'
  | 'MODE_SELECTION'
  | 'SUR_PLACE'
  | 'EMPORTER'
  | 'LIVRAISON_LOCATION'
  | 'LIVRAISON_CALCULATION'
  | 'PAYMENT_SELECTION'
  | 'PAYMENT_PROCESSING'
  | 'ORDER_CONFIRMED'
  | 'FAVORI_REQUEST';

export interface ISessionContext {
  restaurantId?: string;
  restaurantNom?: string;
  panier?: IOrderItem[];
  sousTotal?: number;
  mode?: 'sur_place' | 'emporter' | 'livraison';
  positionClient?: {
    lat: number;
    lng: number;
  };
  adresseLivraison?: string;
  fraisLivraison?: number;
  distanceKm?: number;
  messagePrecedent?: string;
  currentPage?: number;
  restaurantsList?: Array<{
    id: string;
    nom: string;
    distance?: number;
  }>;
  menuPage?: number;
  lastActivity?: Date;
  orderId?: string;
  orderNumber?: string;
}

export class Session {
  constructor(
    public id: string,
    public phoneWhatsapp: string,
    public state: ConversationState,
    public context: ISessionContext,
    public expiresAt: Date,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  resetSession(): void {
    this.state = 'INITIAL';
    this.context = {};
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }

  updateState(newState: ConversationState): void {
    this.state = newState;
    this.updatedAt = new Date();
    this.extendExpiration();
  }

  updateContext(updates: Partial<ISessionContext>): void {
    this.context = { ...this.context, ...updates };
    this.updatedAt = new Date();
    this.extendExpiration();
  }

  private extendExpiration(): void {
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  }

  addToCart(item: IOrderItem): void {
    if (!this.context.panier) {
      this.context.panier = [];
    }

    const existingItem = this.context.panier.find(i => i.menuId === item.menuId);
    
    if (existingItem) {
      existingItem.quantite += item.quantite;
      existingItem.sousTotal = existingItem.quantite * existingItem.prixUnitaire;
    } else {
      this.context.panier.push(item);
    }

    this.recalculateCartTotal();
  }

  removeFromCart(menuId: string): void {
    if (!this.context.panier) return;
    
    this.context.panier = this.context.panier.filter(item => item.menuId !== menuId);
    this.recalculateCartTotal();
  }

  clearCart(): void {
    this.context.panier = [];
    this.context.sousTotal = 0;
  }

  private recalculateCartTotal(): void {
    if (!this.context.panier) {
      this.context.sousTotal = 0;
      return;
    }
    
    this.context.sousTotal = this.context.panier.reduce(
      (sum, item) => sum + item.sousTotal,
      0
    );
  }

  formatCart(): string {
    if (!this.context.panier || this.context.panier.length === 0) {
      return '🛒 Votre panier est vide';
    }

    let message = '🛒 Votre panier:\n\n';
    
    this.context.panier.forEach(item => {
      message += `• ${item.quantite}× ${item.nom} - ${item.sousTotal.toLocaleString('fr-FR')} GNF\n`;
    });
    
    message += `\n${'─'.repeat(30)}\n`;
    message += `💰 Sous-total: ${this.context.sousTotal?.toLocaleString('fr-FR')} GNF`;
    
    return message;
  }

  canProceedToCheckout(): boolean {
    return (
      this.context.panier !== undefined &&
      this.context.panier.length > 0 &&
      this.context.sousTotal !== undefined &&
      this.context.sousTotal > 0
    );
  }
}