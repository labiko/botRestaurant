/**
 * Entité Restaurant - Domain Layer
 * Principe SOLID: Single Responsibility
 */

export interface IHoraires {
  ouverture: string;
  fermeture: string;
}

export interface IHorairesJour {
  lundi: IHoraires;
  mardi: IHoraires;
  mercredi: IHoraires;
  jeudi: IHoraires;
  vendredi: IHoraires;
  samedi: IHoraires;
  dimanche: IHoraires;
}

export class Restaurant {
  constructor(
    public id: string,
    public nom: string,
    public adresse: string,
    public latitude: number,
    public longitude: number,
    public phoneWhatsapp: string,
    public tarifKm: number = 3000,
    public seuilGratuite: number = 100000,
    public minimumLivraison: number = 25000,
    public rayonLivraisonKm: number = 10,
    public horaires: IHorairesJour,
    public statut: 'ouvert' | 'ferme' | 'pause' = 'ouvert',
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  isOpen(): boolean {
    if (this.statut !== 'ouvert') return false;

    const now = new Date();
    const currentDay = this.getCurrentDayKey();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const todayHours = this.horaires[currentDay as keyof IHorairesJour];
    if (!todayHours) return false;

    return currentTime >= todayHours.ouverture && currentTime <= todayHours.fermeture;
  }

  private getCurrentDayKey(): string {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return days[new Date().getDay()];
  }

  calculateDeliveryFee(distanceKm: number, orderAmount: number): number {
    if (orderAmount >= this.seuilGratuite) {
      return 0;
    }
    return Math.ceil(distanceKm) * this.tarifKm;
  }

  canDeliver(distanceKm: number, orderAmount: number): boolean {
    return distanceKm <= this.rayonLivraisonKm && orderAmount >= this.minimumLivraison;
  }

  getDeliveryValidation(distanceKm: number, orderAmount: number): {
    canDeliver: boolean;
    reason?: string;
    suggestion?: string;
  } {
    if (distanceKm > this.rayonLivraisonKm) {
      return {
        canDeliver: false,
        reason: `Distance trop élevée (${distanceKm.toFixed(1)} km). Maximum: ${this.rayonLivraisonKm} km`,
        suggestion: 'à emporter'
      };
    }

    if (orderAmount < this.minimumLivraison) {
      const difference = this.minimumLivraison - orderAmount;
      return {
        canDeliver: false,
        reason: `Montant minimum pour livraison: ${this.minimumLivraison} GNF`,
        suggestion: `Ajoutez ${difference} GNF à votre panier`
      };
    }

    return { canDeliver: true };
  }
}