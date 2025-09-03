import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DeliveryCounters {
  myOrdersCount: number;
  availableOrdersCount: number;
  historyOrdersCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryCountersService {
  
  private countersSubject = new BehaviorSubject<DeliveryCounters>({
    myOrdersCount: 0,
    availableOrdersCount: 0,
    historyOrdersCount: 0
  });

  public counters$ = this.countersSubject.asObservable();

  constructor() {
    console.log('🔢 [DeliveryCounters] Service initialisé');
  }

  /**
   * Mettre à jour le compteur "Mes commandes"
   */
  updateMyOrdersCount(count: number): void {
    const current = this.countersSubject.value;
    this.countersSubject.next({
      ...current,
      myOrdersCount: count
    });
    console.log(`🔢 [DeliveryCounters] Mes commandes: ${count}`);
  }

  /**
   * Mettre à jour le compteur "Commandes disponibles"
   */
  updateAvailableOrdersCount(count: number): void {
    const current = this.countersSubject.value;
    this.countersSubject.next({
      ...current,
      availableOrdersCount: count
    });
    console.log(`🔢 [DeliveryCounters] Disponibles: ${count}`);
  }

  /**
   * Mettre à jour le compteur "Historique"
   */
  updateHistoryOrdersCount(count: number): void {
    const current = this.countersSubject.value;
    this.countersSubject.next({
      ...current,
      historyOrdersCount: count
    });
    console.log(`🔢 [DeliveryCounters] Historique: ${count}`);
  }

  /**
   * Obtenir les compteurs actuels (synchrone)
   */
  getCurrentCounters(): DeliveryCounters {
    return this.countersSubject.value;
  }

  /**
   * Réinitialiser tous les compteurs
   */
  resetCounters(): void {
    this.countersSubject.next({
      myOrdersCount: 0,
      availableOrdersCount: 0,
      historyOrdersCount: 0
    });
    console.log('🔢 [DeliveryCounters] Compteurs réinitialisés');
  }
}