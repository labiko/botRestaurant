/**
 * Entité Commande - Domain Layer
 * Principe SOLID: Single Responsibility
 */

export interface IOrderItem {
  menuId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export type OrderMode = 'sur_place' | 'emporter' | 'livraison';
export type OrderStatus = 'en_attente' | 'confirmee' | 'preparation' | 'prete' | 'en_livraison' | 'livree' | 'terminee' | 'annulee';
export type PaymentMode = 'maintenant' | 'fin_repas' | 'recuperation' | 'livraison';
export type PaymentStatus = 'en_attente' | 'paye' | 'echoue' | 'rembourse';
export type PaymentMethod = 'orange_money' | 'wave' | 'cash' | 'carte';

export class Order {
  constructor(
    public id: string,
    public numeroCommande: string,
    public clientId: string,
    public restaurantId: string,
    public items: IOrderItem[],
    public sousTotal: number,
    public fraisLivraison: number,
    public total: number,
    public mode: OrderMode,
    public statut: OrderStatus = 'en_attente',
    public paiementMode?: PaymentMode,
    public paiementStatut: PaymentStatus = 'en_attente',
    public paiementMethode?: PaymentMethod,
    public adresseLivraison?: string,
    public latitudeLivraison?: number,
    public longitudeLivraison?: number,
    public distanceKm?: number,
    public livreurNom?: string,
    public livreurPhone?: string,
    public noteClient?: string,
    public noteRestaurant?: string,
    public createdAt?: Date,
    public confirmedAt?: Date,
    public preparedAt?: Date,
    public deliveredAt?: Date,
    public cancelledAt?: Date,
    public estimatedTime?: Date
  ) {}

  addItem(item: IOrderItem): void {
    const existingItem = this.items.find(i => i.menuId === item.menuId);
    
    if (existingItem) {
      existingItem.quantite += item.quantite;
      existingItem.sousTotal = existingItem.quantite * existingItem.prixUnitaire;
    } else {
      this.items.push(item);
    }
    
    this.recalculateTotals();
  }

  removeItem(menuId: string): void {
    this.items = this.items.filter(item => item.menuId !== menuId);
    this.recalculateTotals();
  }

  updateItemQuantity(menuId: string, quantity: number): void {
    const item = this.items.find(i => i.menuId === menuId);
    if (item) {
      item.quantite = quantity;
      item.sousTotal = item.quantite * item.prixUnitaire;
      this.recalculateTotals();
    }
  }

  private recalculateTotals(): void {
    this.sousTotal = this.items.reduce((sum, item) => sum + item.sousTotal, 0);
    this.total = this.sousTotal + this.fraisLivraison;
  }

  canBeCancelled(): boolean {
    const cancellableStatuses: OrderStatus[] = ['en_attente', 'confirmee'];
    return cancellableStatuses.includes(this.statut);
  }

  getEstimatedTime(): Date {
    if (this.estimatedTime) return this.estimatedTime;
    
    const now = new Date();
    let minutes = 0;
    
    switch (this.mode) {
      case 'sur_place':
        minutes = 15;
        break;
      case 'emporter':
        minutes = 25;
        break;
      case 'livraison':
        minutes = 40;
        break;
    }
    
    return new Date(now.getTime() + minutes * 60000);
  }

  getStatusMessage(): string {
    const messages: Record<OrderStatus, string> = {
      'en_attente': '⏳ En attente de confirmation',
      'confirmee': '✅ Commande confirmée',
      'preparation': '👨‍🍳 En préparation',
      'prete': '✅ Commande prête',
      'en_livraison': '🛵 En cours de livraison',
      'livree': '✅ Livrée',
      'terminee': '✅ Terminée',
      'annulee': '❌ Annulée'
    };
    
    return messages[this.statut] || '⏳ En cours...';
  }

  formatReceipt(): string {
    let receipt = `🧾 COMMANDE #${this.numeroCommande}\n`;
    receipt += `${'─'.repeat(30)}\n\n`;
    
    this.items.forEach(item => {
      receipt += `• ${item.quantite}× ${item.nom}\n`;
      receipt += `  ${item.prixUnitaire} × ${item.quantite} = ${item.sousTotal} GNF\n`;
    });
    
    receipt += `\n${'─'.repeat(30)}\n`;
    receipt += `💰 Sous-total: ${this.sousTotal} GNF\n`;
    
    if (this.mode === 'livraison') {
      if (this.fraisLivraison === 0) {
        receipt += `🚚 Livraison: GRATUITE ✅\n`;
      } else {
        receipt += `🚚 Livraison: ${this.fraisLivraison} GNF\n`;
      }
    }
    
    receipt += `${'─'.repeat(30)}\n`;
    receipt += `💰 TOTAL: ${this.total} GNF`;
    
    return receipt;
  }
}