import { Injectable } from '@angular/core';
import { SupabaseFranceService } from './supabase-france.service';
import { DeliveryOrder } from './delivery-orders.service';
import { AppConfigService } from './app-config.service';

export interface DeliveryToken {
  id: number;
  token: string;
  order_id: number;
  driver_id: number;
  created_at: string;
  expires_at: string;
  absolute_expires_at: string;
  used: boolean;
  suspended: boolean;
  reactivated: boolean;
  updated_at: string;
}

export interface TokenValidationResult {
  valid: boolean;
  reason?: string;
  orderId?: number;
  driverId?: number;
  orderData?: DeliveryOrder;
}

export interface TokenGenerationData {
  orderId: number;
  driverId: number;
  expiresInMinutes?: number;
  absoluteExpiresInHours?: number;
}

export interface ActiveDriver {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_online: boolean;
  restaurant_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryTokenService {

  // Configuration des tokens selon le plan
  private readonly CONFIG = {
    TOKEN_EXPIRY_MINUTES: 15,
    TOKEN_ABSOLUTE_EXPIRY_HOURS: 2,
    REACTIVATION_THRESHOLD_MINUTES: 5,
    TOKEN_LENGTH: 32
  };

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private appConfigService: AppConfigService
  ) {}

  /**
   * Générer un token sécurisé cryptographiquement
   */
  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    // Utiliser crypto.getRandomValues pour la sécurité
    const array = new Uint8Array(this.CONFIG.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < this.CONFIG.TOKEN_LENGTH; i++) {
      token += chars[array[i] % chars.length];
    }
    
    return token;
  }

  /**
   * Récupérer les livreurs actifs d'un restaurant pour une commande
   */
  async getActiveDriversForOrder(orderId: number): Promise<ActiveDriver[]> {
    try {
      // Récupérer d'abord l'info de la commande pour avoir le restaurant_id
      const { data: orderData, error: orderError } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('restaurant_id')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('❌ [DeliveryToken] Erreur récupération commande:', orderError);
        return [];
      }

      console.log(`🔍 [DeliveryToken] Recherche livreurs pour restaurant ${orderData.restaurant_id}...`);

      // Récupérer les livreurs actifs et en ligne de ce restaurant
      const { data: drivers, error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('id, first_name, last_name, phone_number, is_online, is_active, restaurant_id')
        .eq('restaurant_id', orderData.restaurant_id)
        .eq('is_active', true)
        .eq('is_online', true);

      if (error) {
        console.error('❌ [DeliveryToken] Erreur récupération livreurs:', error);
        return [];
      }

      console.log(`🔍 [DeliveryToken] Requête livreurs - Critères: restaurant_id=${orderData.restaurant_id}, is_active=true, is_online=true`);
      console.log(`✅ [DeliveryToken] ${drivers?.length || 0} livreurs actifs trouvés:`, drivers);
      return drivers || [];
    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur getActiveDriversForOrder:', error);
      return [];
    }
  }

  /**
   * Générer des tokens pour tous les livreurs disponibles d'une commande
   */
  async generateTokensForOrder(orderId: number): Promise<{success: boolean, tokens: DeliveryToken[], message: string}> {
    try {
      console.log(`🔄 [DeliveryToken] Génération des tokens pour commande ${orderId}...`);
      
      // 1. Récupérer les livreurs actifs
      const activeDrivers = await this.getActiveDriversForOrder(orderId);
      if (activeDrivers.length === 0) {
        return {
          success: false,
          tokens: [],
          message: 'Aucun livreur actif disponible'
        };
      }

      // 2. Générer les tokens
      const tokensToInsert = activeDrivers.map(driver => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.CONFIG.TOKEN_EXPIRY_MINUTES * 60000);
        const absoluteExpiresAt = new Date(now.getTime() + this.CONFIG.TOKEN_ABSOLUTE_EXPIRY_HOURS * 3600000);

        return {
          token: this.generateSecureToken(),
          order_id: orderId,
          driver_id: driver.id,
          expires_at: expiresAt.toISOString(),
          absolute_expires_at: absoluteExpiresAt.toISOString(),
          used: false,
          suspended: false,
          reactivated: false
        };
      });

      // 3. Insérer en base de données
      const { data: insertedTokens, error } = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .insert(tokensToInsert)
        .select('*');

      if (error) {
        console.error('❌ [DeliveryToken] Erreur insertion tokens:', error);
        return {
          success: false,
          tokens: [],
          message: 'Erreur lors de la génération des tokens'
        };
      }

      // 4. Logger les actions de notification
      const actionsToLog = insertedTokens.map(token => ({
        order_id: orderId,
        driver_id: token.driver_id,
        token_id: token.id,
        action_type: 'notified',
        details: {
          method: 'whatsapp',
          token_generated_at: new Date().toISOString(),
          expires_at: token.expires_at
        }
      }));

      await this.supabaseFranceService.client
        .from('delivery_driver_actions')
        .insert(actionsToLog);

      console.log(`✅ [DeliveryToken] ${insertedTokens.length} tokens générés avec succès`);
      
      return {
        success: true,
        tokens: insertedTokens,
        message: `${insertedTokens.length} tokens générés avec succès`
      };

    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur generateTokensForOrder:', error);
      return {
        success: false,
        tokens: [],
        message: 'Erreur lors de la génération des tokens'
      };
    }
  }

  /**
   * Valider un token et récupérer les données associées
   */
  async validateToken(tokenString: string): Promise<TokenValidationResult> {
    try {
      console.log(`🔍 [DeliveryToken] Validation du token: ${tokenString.substring(0, 8)}...`);

      const { data: token, error } = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .select(`
          *,
          france_orders!order_id (
            id, status, driver_id, restaurant_id, order_number, 
            total_amount, delivery_address, customer_name, phone_number
          ),
          france_delivery_drivers!driver_id (id, first_name, last_name, phone_number)
        `)
        .eq('token', tokenString)
        .single();

      if (error || !token) {
        console.log('❌ [DeliveryToken] Token inexistant');
        return { valid: false, reason: 'Token inexistant' };
      }

      const now = new Date();

      // Vérifications de validité
      if (token.used) {
        console.log('❌ [DeliveryToken] Token déjà utilisé');
        return { valid: false, reason: 'Token déjà utilisé' };
      }

      if (token.suspended) {
        console.log('❌ [DeliveryToken] Token suspendu');
        return { valid: false, reason: 'Commande temporairement indisponible' };
      }

      if (new Date(token.expires_at) < now) {
        console.log('❌ [DeliveryToken] Token expiré (relative)');
        return { valid: false, reason: 'Lien expiré' };
      }

      if (new Date(token.absolute_expires_at) < now) {
        console.log('❌ [DeliveryToken] Token expiré (absolue)');
        return { valid: false, reason: 'Lien définitivement expiré' };
      }

      if (token.france_orders.status !== 'prete') {
        console.log('❌ [DeliveryToken] Commande non disponible, status:', token.france_orders.status);
        return { valid: false, reason: 'Commande non disponible' };
      }

      if (token.france_orders.driver_id) {
        console.log('❌ [DeliveryToken] Commande déjà assignée');
        return { valid: false, reason: 'Commande déjà assignée' };
      }

      console.log('✅ [DeliveryToken] Token valide');
      return {
        valid: true,
        orderId: token.order_id,
        driverId: token.driver_id,
        orderData: token.france_orders as DeliveryOrder
      };

    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur validateToken:', error);
      return { valid: false, reason: 'Erreur lors de la validation' };
    }
  }

  /**
   * Accepter une commande par token (fonction atomique)
   */
  async acceptOrderByToken(tokenString: string): Promise<{success: boolean, message: string}> {
    try {
      console.log(`🔄 [DeliveryToken] Tentative d'acceptation avec token: ${tokenString.substring(0, 8)}...`);

      // 1. Valider le token d'abord
      const validation = await this.validateToken(tokenString);
      if (!validation.valid) {
        return { success: false, message: validation.reason || 'Token invalide' };
      }

      // 2. Utiliser la fonction SQL atomique
      const { data, error } = await this.supabaseFranceService.client.rpc('accept_order_atomic', {
        p_token: tokenString,
        p_order_id: validation.orderId!,
        p_driver_id: validation.driverId!
      });

      if (error) {
        console.error('❌ [DeliveryToken] Erreur accept_order_atomic:', error);
        return { success: false, message: error.message || 'Erreur lors de l\'acceptation' };
      }

      console.log('✅ [DeliveryToken] Commande acceptée avec succès');
      return { success: true, message: 'Commande acceptée avec succès !' };

    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur acceptOrderByToken:', error);
      return { success: false, message: 'Erreur lors de l\'acceptation de la commande' };
    }
  }

  /**
   * Réactiver les tokens après un refus (Option B)
   */
  async reactivateTokensAfterRefusal(orderId: number): Promise<{success: boolean, reactivatedTokens: DeliveryToken[], message: string}> {
    try {
      console.log(`🔄 [DeliveryToken] Réactivation des tokens pour commande ${orderId}...`);

      // Réactiver les tokens suspendus non expirés absolument
      const newExpiryTime = new Date(Date.now() + this.CONFIG.TOKEN_EXPIRY_MINUTES * 60000);
      
      const { data: reactivatedTokens, error } = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .update({
          suspended: false,
          reactivated: true,
          expires_at: newExpiryTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('suspended', true)
        .eq('used', false)
        .gt('absolute_expires_at', new Date().toISOString())
        .select(`
          *,
          france_delivery_drivers!driver_id (
            id, first_name, last_name, phone_number
          )
        `);

      if (error) {
        console.error('❌ [DeliveryToken] Erreur réactivation tokens:', error);
        return {
          success: false,
          reactivatedTokens: [],
          message: 'Erreur lors de la réactivation des tokens'
        };
      }

      const tokenCount = reactivatedTokens?.length || 0;
      console.log(`✅ [DeliveryToken] ${tokenCount} tokens réactivés`);

      return {
        success: true,
        reactivatedTokens: reactivatedTokens || [],
        message: `${tokenCount} tokens réactivés avec succès`
      };

    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur reactivateTokensAfterRefusal:', error);
      return {
        success: false,
        reactivatedTokens: [],
        message: 'Erreur lors de la réactivation'
      };
    }
  }

  /**
   * Réactiver les tokens pour les rappels (tokens expirés non utilisés)
   */
  async reactivateTokensForReminders(orderId: number): Promise<{success: boolean, reactivatedTokens: DeliveryToken[], message: string}> {
    try {
      console.log(`🔔 [DeliveryToken] Réactivation tokens pour rappels commande ${orderId}...`);

      // Réactiver les tokens expirés mais non utilisés (différent de reactivateTokensAfterRefusal)
      const newExpiryTime = new Date(Date.now() + this.CONFIG.TOKEN_EXPIRY_MINUTES * 60000);
      
      const { data: reactivatedTokens, error } = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .update({
          suspended: false,
          reactivated: true,
          expires_at: newExpiryTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('used', false)
        .gt('absolute_expires_at', new Date().toISOString())
        .select(`
          *,
          france_delivery_drivers!driver_id (
            id, first_name, last_name, phone_number
          )
        `);

      if (error) {
        console.error('❌ [DeliveryToken] Erreur réactivation tokens rappels:', error);
        return {
          success: false,
          reactivatedTokens: [],
          message: 'Erreur lors de la réactivation des tokens'
        };
      }

      const tokenCount = reactivatedTokens?.length || 0;
      console.log(`✅ [DeliveryToken] ${tokenCount} tokens réactivés pour rappels`);

      return {
        success: tokenCount > 0,
        reactivatedTokens: reactivatedTokens || [],
        message: `${tokenCount} tokens réactivés pour rappels`
      };

    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur reactivateTokensForReminders:', error);
      return {
        success: false,
        reactivatedTokens: [],
        message: 'Erreur lors de la réactivation pour rappels'
      };
    }
  }

  /**
   * Générer l'URL complète pour un token
   */
  generateTokenUrl(token: string): string {
    return this.appConfigService.generateTokenUrl(token);
  }

  /**
   * Nettoyer les tokens expirés (fonction de maintenance)
   */
  async cleanupExpiredTokens(): Promise<{success: boolean, deletedCount: number, message: string}> {
    try {
      const { data: deletedCount, error } = await this.supabaseFranceService.client
        .rpc('cleanup_expired_tokens');

      if (error) {
        console.error('❌ [DeliveryToken] Erreur cleanup:', error);
        return {
          success: false,
          deletedCount: 0,
          message: 'Erreur lors du nettoyage'
        };
      }

      console.log(`🧹 [DeliveryToken] ${deletedCount} tokens expirés supprimés`);
      return {
        success: true,
        deletedCount: deletedCount || 0,
        message: `${deletedCount} tokens expirés supprimés`
      };

    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur cleanupExpiredTokens:', error);
      return {
        success: false,
        deletedCount: 0,
        message: 'Erreur lors du nettoyage'
      };
    }
  }
}