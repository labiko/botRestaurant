import { Injectable } from '@angular/core';
import { SupabaseFranceService } from './supabase-france.service';

export interface RefusalReason {
  code: string;
  label: string;
  icon: string;
}

export interface OrderRefusalData {
  orderId: number;
  driverId: number;
  reason: string;
  customReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryRefusalService {

  // Raisons de refus prédéfinies
  private readonly REFUSAL_REASONS: RefusalReason[] = [
    {
      code: 'vehicle_issue',
      label: '🚗 Problème avec mon véhicule',
      icon: 'car'
    },
    {
      code: 'too_far',
      label: '📍 L\'adresse est trop éloignée',
      icon: 'location'
    },
    {
      code: 'busy',
      label: '⏰ Je ne suis plus disponible',
      icon: 'time'
    },
    {
      code: 'accident',
      label: '🚨 J\'ai eu un accident/problème',
      icon: 'warning'
    },
    {
      code: 'other',
      label: '📝 Autre raison',
      icon: 'create'
    }
  ];

  constructor(private supabaseFranceService: SupabaseFranceService) {}

  /**
   * Obtenir la liste des raisons de refus disponibles
   */
  getRefusalReasons(): RefusalReason[] {
    return [...this.REFUSAL_REASONS];
  }

  /**
   * Refuser une commande avec une raison explicite
   * NOTE: Cette méthode ne fait rien pour l'instant - logique future du système de tokens
   */
  async refuseOrder(refusalData: OrderRefusalData): Promise<{success: boolean, message: string}> {
    try {
      console.log('📝 [DeliveryRefusal] Refus de commande:', refusalData);
      
      // TODO: Ici sera implémentée la logique du système de tokens
      // Pour l'instant, on se contente de logger le refus
      
      // Simuler un succès pour ne pas casser l'UX existante
      await this.logRefusalForFuture(refusalData);
      
      return {
        success: true,
        message: 'Refus enregistré. Merci pour votre honnêteté !'
      };
    } catch (error) {
      console.error('❌ [DeliveryRefusal] Erreur lors du refus:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'enregistrement du refus'
      };
    }
  }

  /**
   * Logger temporairement les refus pour analyse future
   * Cette fonction sera remplacée par la logique des tokens plus tard
   */
  private async logRefusalForFuture(refusalData: OrderRefusalData): Promise<void> {
    try {
      // Logger dans la console pour l'instant
      console.log('🔍 [DeliveryRefusal] Données de refus à traiter:', {
        order_id: refusalData.orderId,
        driver_id: refusalData.driverId,
        reason: refusalData.reason,
        custom_reason: refusalData.customReason,
        timestamp: new Date().toISOString()
      });

      // TODO: Quand le système de tokens sera implémenté, cette fonction :
      // 1. Enregistrera le refus dans la table delivery_refusals
      // 2. Triggera la réactivation des autres tokens (Option B)
      // 3. Enverra les notifications WhatsApp de réactivation
      
    } catch (error) {
      console.error('❌ [DeliveryRefusal] Erreur logging refus:', error);
      throw error;
    }
  }

  /**
   * Obtenir le texte d'une raison de refus par son code
   */
  getReasonLabel(reasonCode: string): string {
    const reason = this.REFUSAL_REASONS.find(r => r.code === reasonCode);
    return reason ? reason.label : reasonCode;
  }

  /**
   * Obtenir l'icône d'une raison de refus par son code
   */
  getReasonIcon(reasonCode: string): string {
    const reason = this.REFUSAL_REASONS.find(r => r.code === reasonCode);
    return reason ? reason.icon : 'help';
  }
}