import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { SupabaseFranceService } from './supabase-france.service';
import { DeliveryOrder } from './delivery-orders.service';
import { AppConfigService } from './app-config.service';
import { AuthFranceService, FranceUser } from '../../features/restaurant-france/auth-france/services/auth-france.service';
import { FuseauHoraireService } from './fuseau-horaire.service';

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
  isPostAcceptance?: boolean; // Indique si c'est un accès après acceptation
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
    TOKEN_EXPIRY_MINUTES: 60, // 1 heure pour laisser plus de temps aux livreurs
    TOKEN_ABSOLUTE_EXPIRY_HOURS: 2, // 2 heures comme spécifié initialement
    REACTIVATION_THRESHOLD_MINUTES: 5,
    TOKEN_LENGTH: 32
  };

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private appConfigService: AppConfigService,
    private authFranceService: AuthFranceService,
    private fuseauHoraireService: FuseauHoraireService
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
      
      // 0. NOUVEAU : Récupérer le restaurant de la commande pour le fuseau horaire
      const { data: orderData, error: orderError } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('restaurant_id')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error(`❌ [DeliveryToken] Impossible de récupérer restaurant pour commande ${orderId}`);
        return {
          success: false,
          tokens: [],
          message: 'Commande introuvable'
        };
      }

      const restaurantId = orderData.restaurant_id;
      console.log(`🌍 [DeliveryToken] Commande ${orderId} → Restaurant ${restaurantId}`);
      
      // 1. Récupérer les livreurs actifs
      const activeDrivers = await this.getActiveDriversForOrder(orderId);
      if (activeDrivers.length === 0) {
        return {
          success: false,
          tokens: [],
          message: 'Aucun livreur actif disponible'
        };
      }

      // 2. NOUVEAU : Générer les tokens avec fuseau horaire du restaurant
      const tokensToInsert = await Promise.all(activeDrivers.map(async (driver) => {
        // Utiliser le fuseau horaire spécifique au restaurant pour TOUS les timestamps
        const createdAt = await this.fuseauHoraireService.getRestaurantFutureTimeForDatabase(restaurantId, 0); // 0 min = maintenant
        const expiresAt = await this.fuseauHoraireService.getRestaurantFutureTimeForDatabase(restaurantId, this.CONFIG.TOKEN_EXPIRY_MINUTES);
        const absoluteExpiresAt = await this.fuseauHoraireService.getRestaurantFutureTimeForDatabaseHours(restaurantId, this.CONFIG.TOKEN_ABSOLUTE_EXPIRY_HOURS);

        console.log(`🕐 [DeliveryToken] Restaurant ${restaurantId} - Token livreur ${driver.id}:`);
        console.log(`   created_at: ${createdAt}`);
        console.log(`   expires_at: ${expiresAt}`);
        console.log(`   absolute_expires_at: ${absoluteExpiresAt}`);
        console.log(`   ✅ Différence attendue: +${this.CONFIG.TOKEN_EXPIRY_MINUTES} minutes`);

        return {
          token: this.generateSecureToken(),
          order_id: orderId,
          driver_id: driver.id,
          created_at: createdAt, // ✅ Utiliser heure restaurant au lieu de NOW() PostgreSQL
          expires_at: expiresAt,
          absolute_expires_at: absoluteExpiresAt,
          used: false,
          suspended: false,
          reactivated: false
        };
      }));

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
          token_generated_at: this.fuseauHoraireService.getCurrentTimeForDatabase(),
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
            total_amount, delivery_address, customer_name, phone_number, items, created_at
          ),
          france_delivery_drivers!driver_id (id, first_name, last_name, phone_number)
        `)
        .eq('token', tokenString)
        .single();

      if (error || !token) {
        console.log('❌ [DeliveryToken] Token inexistant');
        return { valid: false, reason: 'Token inexistant' };
      }

      // 🕐 CORRECTION TIMEZONE : Utiliser l'heure du restaurant pour la comparaison
      const restaurantId = token.france_orders.restaurant_id;
      const currentTime = await this.fuseauHoraireService.getRestaurantFutureTimeForDatabase(restaurantId, 0);

      // ✅ COMPARAISON DIRECTE DES STRINGS (format PostgreSQL: YYYY-MM-DD HH:MM:SS)
      // Plus besoin de convertir en Date JavaScript, évite les bugs de timezone
      console.log(`🕐 [TIMEZONE_VALIDATION] Restaurant ${restaurantId}:`);
      console.log(`🕐 [TIMEZONE_VALIDATION] Heure restaurant (currentTime): ${currentTime}`);
      console.log(`🕐 [TIMEZONE_VALIDATION] Token expires_at: ${token.expires_at}`);
      console.log(`🕐 [TIMEZONE_VALIDATION] Token absolute_expires_at: ${token.absolute_expires_at}`);
      console.log(`🕐 [TIMEZONE_VALIDATION] Comparaison: ${token.expires_at} > ${currentTime} = ${token.expires_at > currentTime}`);

      // Vérifications de validité
      console.log('🔍 [DEBUG_VALIDATE] === DÉBUT VÉRIFICATIONS ===');
      console.log('🔍 [DEBUG_VALIDATE] token.used:', token.used);
      console.log('🔍 [DEBUG_VALIDATE] token.suspended:', token.suspended);
      console.log('🔍 [DEBUG_VALIDATE] token.france_orders.status:', token.france_orders.status);
      console.log('🔍 [DEBUG_VALIDATE] token.france_orders.driver_id:', token.france_orders.driver_id);
      console.log('🔍 [DEBUG_VALIDATE] token.driver_id:', token.driver_id);

      if (token.used) {
        console.log('🔍 [DEBUG_VALIDATE] → Token UTILISÉ, vérification post-acceptation');
        // Si token utilisé, vérifier si c'est pour accès post-acceptation
        if (token.france_orders.driver_id === token.driver_id) {
          console.log('🔍 [DEBUG_VALIDATE] → Token utilisé par le bon livreur');
          // NOUVEAU: Refuser si commande déjà livrée
          if (token.france_orders.status === 'livree') {
            console.log('❌ [DeliveryToken] Commande déjà livrée');
            return { valid: false, reason: 'Commande déjà livrée' };
          }

          // Token utilisé mais par le bon livreur - permettre l'accès si pas expiré
          if (token.expires_at > currentTime) {
            console.log('✅ [DeliveryToken] Accès post-acceptation autorisé');
            return {
              valid: true,
              orderId: token.order_id,
              driverId: token.driver_id,
              orderData: token.france_orders as DeliveryOrder,
              isPostAcceptance: true
            };
          } else {
            console.log('❌ [DeliveryToken] Session expirée (3h)');
            return { valid: false, reason: 'Session expirée (3h)' };
          }
        } else {
          console.log('❌ [DeliveryToken] Token déjà utilisé');
          return { valid: false, reason: 'Token déjà utilisé' };
        }
      } else {
        console.log('🔍 [DEBUG_VALIDATE] → Token NON utilisé, vérifications normales');
      }

      if (token.suspended) {
        console.log('❌ [DeliveryToken] Token suspendu');
        return { valid: false, reason: 'Commande temporairement indisponible' };
      }

      console.log('🔍 [DEBUG_VALIDATE] → Vérification expiration relative');
      console.log('🔍 [DEBUG_VALIDATE] token.expires_at:', token.expires_at);
      console.log('🔍 [DEBUG_VALIDATE] currentTime:', currentTime);
      console.log('🔍 [DEBUG_VALIDATE] token.expires_at < currentTime =', token.expires_at < currentTime);

      if (token.expires_at < currentTime) {
        console.log('❌ [DeliveryToken] Token expiré (relative) - expires_at < currentTime');
        console.log(`❌ [TIMEZONE_VALIDATION] ${token.expires_at} < ${currentTime}`);
        return { valid: false, reason: 'Lien expiré' };
      }

      console.log('🔍 [DEBUG_VALIDATE] → Vérification expiration absolue');
      console.log('🔍 [DEBUG_VALIDATE] token.absolute_expires_at:', token.absolute_expires_at);
      console.log('🔍 [DEBUG_VALIDATE] token.absolute_expires_at < currentTime =', token.absolute_expires_at < currentTime);

      if (token.absolute_expires_at < currentTime) {
        console.log('❌ [DeliveryToken] Token expiré (absolue) - absolute_expires_at < currentTime');
        console.log(`❌ [TIMEZONE_VALIDATION] ${token.absolute_expires_at} < ${currentTime}`);
        return { valid: false, reason: 'Lien définitivement expiré' };
      }

      console.log('🔍 [DEBUG_VALIDATE] → Vérification statut commande');
      console.log('🔍 [DEBUG_VALIDATE] token.france_orders.status:', token.france_orders.status);

      // Pour les tokens non utilisés, vérifier que la commande est disponible
      if (token.france_orders.status !== 'prete') {
        console.log('🔍 [DEBUG_VALIDATE] → Commande status !== prete');
        // MODIFICATION: Permettre l'accès si la commande est assignée (token déjà associé au bon livreur)
        if (token.france_orders.status === 'assignee') {
          console.log('🔍 [DEBUG_VALIDATE] → Status = assignee, accès autorisé');
          console.log('✅ [DeliveryToken] Accès autorisé - Token non utilisé mais commande assignée');
          return {
            valid: true,
            orderId: token.order_id,
            driverId: token.driver_id,
            orderData: token.france_orders as DeliveryOrder,
            isPostAcceptance: true
          };
        }
        console.log('❌ [DeliveryToken] Commande non disponible, status:', token.france_orders.status);
        console.log('🔍 [DEBUG_VALIDATE] → REJETÉ - Commande non disponible');
        return { valid: false, reason: 'Commande non disponible' };
      }

      console.log('🔍 [DEBUG_VALIDATE] → Vérification driver_id');
      console.log('🔍 [DEBUG_VALIDATE] token.france_orders.driver_id:', token.france_orders.driver_id);

      if (token.france_orders.driver_id) {
        console.log('🔍 [DEBUG_VALIDATE] → Commande déjà assignée à un livreur');
        // MODIFICATION: Permettre l'accès (token déjà associé au bon livreur)
        console.log('✅ [DeliveryToken] Accès autorisé - Token du livreur assigné');
        return {
          valid: true,
          orderId: token.order_id,
          driverId: token.driver_id,
          orderData: token.france_orders as DeliveryOrder,
          isPostAcceptance: true
        };
      }

      console.log('🔍 [DEBUG_VALIDATE] → Toutes vérifications passées !');
      console.log('✅ [DeliveryToken] Token valide');

      // DEBUG: Tracer driver_id
      console.log('🔍 [DEBUG_VALIDATE] token.driver_id:', token.driver_id);
      console.log('🔍 [DEBUG_VALIDATE] token object:', token);

      const validResult = {
        valid: true,
        orderId: token.order_id,
        driverId: token.driver_id,
        orderData: token.france_orders as DeliveryOrder
      };

      console.log('🔍 [DEBUG_VALIDATE] === FIN VALIDATION - RETOUR VALIDE ===');
      console.log('🔍 [DEBUG_VALIDATE] Result:', validResult);

      return validResult;

    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur validateToken:', error);
      console.log('🔍 [DEBUG_VALIDATE] === FIN VALIDATION - ERREUR EXCEPTION ===');
      return { valid: false, reason: 'Erreur lors de la validation' };
    }
  }

  /**
   * NOUVEAU : Valider un token ET authentifier automatiquement le livreur
   * Utilisé par le guard pour l'authentification automatique
   */
  validateAndAuthenticateToken(tokenString: string): Observable<{success: boolean, driver?: FranceUser, message: string}> {
    return from(this.validateAndAuthenticateTokenAsync(tokenString));
  }

  private async validateAndAuthenticateTokenAsync(tokenString: string): Promise<{success: boolean, driver?: FranceUser, message: string}> {
    try {
      console.log(`🔐 [DeliveryToken] Tentative d'authentification par token...`);

      // 1. Valider le token
      const validation = await this.validateToken(tokenString);
      if (!validation.valid) {
        console.log('❌ [DeliveryToken] Token invalide:', validation.reason);
        return { 
          success: false, 
          message: validation.reason || 'Token invalide' 
        };
      }

      // 2. Récupérer les infos du livreur depuis la BDD
      const { data: driverData, error: driverError } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('*')
        .eq('id', validation.driverId!)
        .single();

      if (driverError || !driverData) {
        console.error('❌ [DeliveryToken] Erreur récupération livreur:', driverError);
        return { 
          success: false, 
          message: 'Livreur introuvable' 
        };
      }

      // 3. Créer l'objet utilisateur pour l'authentification
      const driver: FranceUser = {
        id: driverData.id,
        type: 'driver',
        firstName: driverData.first_name,
        lastName: driverData.last_name,
        name: `${driverData.first_name} ${driverData.last_name}`,
        phoneNumber: driverData.phone_number,
        email: driverData.email || `driver${driverData.id}@delivery.com`, // Email par défaut si absent
        restaurantId: driverData.restaurant_id,
        restaurantName: '', // TODO: Récupérer le nom du restaurant si nécessaire
        isActive: driverData.is_active
      };

      // 4. Mettre à jour l'authentification dans AuthFranceService
      const authenticated = await this.authFranceService.authenticateDriverByToken(driver);

      if (!authenticated) {
        console.error('❌ [DeliveryToken] Échec création session persistante');
        return {
          success: false,
          message: 'Erreur lors de la création de la session'
        };
      }

      console.log('✅ [DeliveryToken] Authentification par token réussie pour:', driver.name);

      return {
        success: true,
        driver: driver,
        message: 'Authentification réussie'
      };

    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur validateAndAuthenticateToken:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'authentification'
      };
    }
  }

  /**
   * Accepter une commande par token (fonction atomique)
   */
  async acceptOrderByToken(tokenString: string): Promise<{success: boolean, message: string}> {
    const startTime = Date.now();
    console.log(`🚀 [ACCEPT_DETAILED] ======== DÉBUT ACCEPTATION ========`);
    console.log(`🚀 [ACCEPT_DETAILED] Token: ${tokenString.substring(0, 8)}...${tokenString.substring(-4)}`);
    console.log(`🚀 [ACCEPT_DETAILED] Timestamp début: ${new Date(startTime).toISOString()}`);
    console.log(`🚀 [ACCEPT_DETAILED] Token complet pour debug:`, tokenString);

    try {
      // 1. VALIDATION DU TOKEN
      console.log(`🔍 [ACCEPT_DETAILED] ÉTAPE 1: Validation du token`);
      console.log(`🔍 [ACCEPT_DETAILED] Appel validateToken() en cours...`);
      const validation = await this.validateToken(tokenString);
      console.log(`🔍 [ACCEPT_DETAILED] Retour de validateToken() reçu`);
      console.log(`🔍 [ACCEPT_DETAILED] validation.valid:`, validation.valid);
      console.log(`🔍 [ACCEPT_DETAILED] validation.reason:`, validation.reason);
      console.log(`🔍 [ACCEPT_DETAILED] Résultat validation complète:`, JSON.stringify(validation, null, 2));
      
      if (!validation.valid) {
        console.error(`❌ [ACCEPT_DETAILED] ÉCHEC ÉTAPE 1: Token invalide - ${validation.reason}`);
        return { success: false, message: validation.reason || 'Token invalide' };
      }
      console.log(`✅ [ACCEPT_DETAILED] ÉTAPE 1 RÉUSSIE: Token valide`);

      // Si c'est un accès post-acceptation, ne pas ré-accepter
      if (validation.isPostAcceptance) {
        console.log(`✅ [ACCEPT_DETAILED] COURT-CIRCUIT: Accès post-acceptation détecté`);
        return { success: true, message: 'Accès autorisé à votre commande' };
      }

      // 2. PRÉPARATION APPEL RPC
      console.log(`🔧 [ACCEPT_DETAILED] ÉTAPE 2: Préparation appel RPC`);
      console.log(`🔧 [ACCEPT_DETAILED] Paramètres RPC:`);
      console.log(`   - p_token: ${tokenString}`);
      console.log(`   - p_order_id: ${validation.orderId} (type: ${typeof validation.orderId})`);
      console.log(`   - driverId récupéré: ${validation.driverId} (type: ${typeof validation.driverId})`);

      // 3. VÉRIFICATION ÉTAT PRÉ-ACCEPTATION
      console.log(`🔍 [ACCEPT_DETAILED] ÉTAPE 3: Vérification état pré-acceptation`);
      const preCheckResult = await this.supabaseFranceService.client
        .from('france_orders')
        .select('id, status, driver_id, driver_assignment_status, updated_at')
        .eq('id', validation.orderId!)
        .single();
      
      console.log(`🔍 [ACCEPT_DETAILED] État commande AVANT acceptation:`, preCheckResult.data);
      if (preCheckResult.error) {
        console.error(`❌ [ACCEPT_DETAILED] Erreur pré-vérification:`, preCheckResult.error);
      }

      // 4. APPEL FONCTION RPC ATOMIQUE
      console.log(`🚀 [ACCEPT_DETAILED] ÉTAPE 4: Exécution accept_order_atomic`);
      const rpcStartTime = Date.now();
      
      const { data, error } = await this.supabaseFranceService.client.rpc('accept_order_atomic', {
        p_token: tokenString,
        p_order_id: validation.orderId!
      });
      
      const rpcEndTime = Date.now();
      console.log(`🚀 [ACCEPT_DETAILED] Durée RPC: ${rpcEndTime - rpcStartTime}ms`);
      console.log(`🚀 [ACCEPT_DETAILED] Résultat RPC - data:`, data);
      console.log(`🚀 [ACCEPT_DETAILED] Résultat RPC - error:`, error);

      if (error) {
        console.error(`❌ [ACCEPT_DETAILED] ÉCHEC ÉTAPE 4: Erreur RPC`);
        console.error(`❌ [ACCEPT_DETAILED] Error code: ${error.code}`);
        console.error(`❌ [ACCEPT_DETAILED] Error message: ${error.message}`);
        console.error(`❌ [ACCEPT_DETAILED] Error details: ${error.details}`);
        console.error(`❌ [ACCEPT_DETAILED] Error hint: ${error.hint}`);
        return { success: false, message: error.message || 'Erreur lors de l\'acceptation' };
      }

      console.log(`✅ [ACCEPT_DETAILED] ÉTAPE 4 RÉUSSIE: RPC exécutée avec succès`);

      // 5. VÉRIFICATION POST-ACCEPTATION
      console.log(`🔍 [ACCEPT_DETAILED] ÉTAPE 5: Vérification post-acceptation`);
      const postCheckResult = await this.supabaseFranceService.client
        .from('france_orders')
        .select('id, status, driver_id, driver_assignment_status, updated_at')
        .eq('id', validation.orderId!)
        .single();
      
      console.log(`🔍 [ACCEPT_DETAILED] État commande APRÈS acceptation:`, postCheckResult.data);
      if (postCheckResult.error) {
        console.error(`❌ [ACCEPT_DETAILED] Erreur post-vérification:`, postCheckResult.error);
      }

      // 6. VÉRIFICATION TOKEN APRÈS ACCEPTATION
      console.log(`🔍 [ACCEPT_DETAILED] ÉTAPE 6: Vérification token post-acceptation`);
      const tokenCheckResult = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .select('token, used, updated_at')
        .eq('token', tokenString)
        .single();
      
      console.log(`🔍 [ACCEPT_DETAILED] État token APRÈS acceptation:`, tokenCheckResult.data);
      if (tokenCheckResult.error) {
        console.error(`❌ [ACCEPT_DETAILED] Erreur vérification token:`, tokenCheckResult.error);
      }

      const endTime = Date.now();
      console.log(`✅ [ACCEPT_DETAILED] ======== ACCEPTATION TERMINÉE ========`);
      console.log(`✅ [ACCEPT_DETAILED] Durée totale: ${endTime - startTime}ms`);
      console.log(`✅ [ACCEPT_DETAILED] Statut: SUCCÈS`);
      
      return { success: true, message: 'Commande acceptée avec succès !' };

    } catch (error) {
      const endTime = Date.now();
      console.error(`💥 [ACCEPT_DETAILED] ======== EXCEPTION CAPTURÉE ========`);
      console.error(`💥 [ACCEPT_DETAILED] Durée avant exception: ${endTime - startTime}ms`);
      console.error(`💥 [ACCEPT_DETAILED] Type d'erreur:`, (error as any)?.constructor?.name);
      console.error(`💥 [ACCEPT_DETAILED] Message d'erreur:`, (error as any)?.message);
      console.error(`💥 [ACCEPT_DETAILED] Stack trace:`, (error as any)?.stack);
      console.error(`💥 [ACCEPT_DETAILED] Erreur complète:`, error);
      
      return { success: false, message: 'Erreur lors de l\'acceptation de la commande' };
    }
  }

  /**
   * Réactiver les tokens après un refus (Option B)
   */
  async reactivateTokensAfterRefusal(orderId: number): Promise<{success: boolean, reactivatedTokens: DeliveryToken[], message: string}> {
    try {
      console.log(`🔄 [DeliveryToken] Réactivation des tokens pour commande ${orderId}...`);

      // CORRECTION : Utiliser les fonctions SQL du serveur pour le fuseau horaire correct
      const { data: reactivatedTokens, error } = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .update({
          suspended: false,
          reactivated: true,
          expires_at: 'NOW() + INTERVAL \'' + this.CONFIG.TOKEN_EXPIRY_MINUTES + ' minutes\'',
          updated_at: 'NOW()'
        })
        .eq('order_id', orderId)
        .eq('suspended', true)
        .eq('used', false)
        .gt('absolute_expires_at', this.fuseauHoraireService.getCurrentTimeForDatabase())
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

      // NOUVEAU : Récupérer le restaurant de la commande pour le fuseau horaire
      const { data: orderData, error: orderError } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('restaurant_id')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error(`❌ [DeliveryToken] Impossible de récupérer restaurant pour commande ${orderId}`);
        return {
          success: false,
          reactivatedTokens: [],
          message: 'Commande introuvable'
        };
      }

      const restaurantId = orderData.restaurant_id;
      console.log(`🌍 [DeliveryToken] Rappel commande ${orderId} → Restaurant ${restaurantId}`);

      // DIAGNOSTIC: Vérifier les tokens existants AVANT réactivation
      const { data: existingTokens, error: checkError } = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .select('id, token, expires_at, absolute_expires_at, used, suspended, created_at')
        .eq('order_id', orderId);
        
      console.log(`🔍 [DeliveryToken] DIAGNOSTIC - Tokens existants pour commande ${orderId}:`, existingTokens);
      
      if (existingTokens) {
        const restaurantTime = await this.fuseauHoraireService.getRestaurantCurrentTime(restaurantId);
        existingTokens.forEach((token, index) => {
          console.log(`📝 [DeliveryToken] Token ${index + 1}:`);
          console.log(`   ID: ${token.id}, Token: ${token.token?.substring(0, 8)}...`);
          console.log(`   Créé: ${token.created_at}`);
          console.log(`   expires_at: ${token.expires_at} (${new Date(token.expires_at) < restaurantTime ? 'EXPIRÉ' : 'VALIDE'})`);
          console.log(`   absolute_expires_at: ${token.absolute_expires_at} (${new Date(token.absolute_expires_at) < restaurantTime ? 'EXPIRÉ' : 'VALIDE'})`);
          console.log(`   Utilisé: ${token.used}, Suspendu: ${token.suspended}`);
        });
      }

      // Réactiver les tokens expirés mais non utilisés (différent de reactivateTokensAfterRefusal)
      const now = Date.now();
      const newExpiryTime = new Date(now + this.CONFIG.TOKEN_EXPIRY_MINUTES * 60000);
      console.log(`🕐 [DeliveryToken] DIAGNOSTIC TEMPOREL COMPLET:`);
      console.log(`   Timestamp: ${now}`);
      console.log(`   Date locale: ${new Date(now).toString()}`);
      console.log(`   Date ISO (UTC): ${new Date(now).toISOString()}`);
      console.log(`   Date locale string: ${new Date(now).toLocaleString('fr-FR')}`);
      console.log(`   Fuseau détecté: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
      console.log(`   Offset UTC: ${new Date(now).getTimezoneOffset()} minutes`);
      console.log(`   TOKEN_EXPIRY_MINUTES: ${this.CONFIG.TOKEN_EXPIRY_MINUTES}`);
      console.log(`   Calcul: ${now} + ${this.CONFIG.TOKEN_EXPIRY_MINUTES * 60000} = ${now + this.CONFIG.TOKEN_EXPIRY_MINUTES * 60000}`);
      console.log(`🔄 [DeliveryToken] Nouvelle expiration:`);
      console.log(`   ISO (UTC): ${newExpiryTime.toISOString()}`);
      console.log(`   Locale: ${newExpiryTime.toLocaleString('fr-FR')}`);
      
      // NOUVEAU : Utilisation du fuseau horaire spécifique au restaurant
      const adjustedExpiryTime = await this.fuseauHoraireService.getRestaurantFutureTimeForDatabase(restaurantId, this.CONFIG.TOKEN_EXPIRY_MINUTES);
      const adjustedAbsoluteExpiry = await this.fuseauHoraireService.getRestaurantFutureTimeForDatabaseHours(restaurantId, this.CONFIG.TOKEN_ABSOLUTE_EXPIRY_HOURS);
      
      console.log(`🌍 [DeliveryToken] FUSEAUX HORAIRES RESTAURANT ${restaurantId}:`);
      console.log(`   Expiration (${this.CONFIG.TOKEN_EXPIRY_MINUTES}min): ${adjustedExpiryTime}`);
      console.log(`   Expiration absolue (${this.CONFIG.TOKEN_ABSOLUTE_EXPIRY_HOURS}h): ${adjustedAbsoluteExpiry}`);
      
      const { data: reactivatedTokens, error } = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .update({
          suspended: false,
          reactivated: true,
          token: this.generateSecureToken(), // 🔥 NOUVEAU TOKEN !
          expires_at: adjustedExpiryTime, // 🔥 AVEC TIMEZONE RESTAURANT !
          absolute_expires_at: adjustedAbsoluteExpiry, // 🔥 AVEC TIMEZONE RESTAURANT !
          updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
        })
        .eq('order_id', orderId)
        .eq('used', false)
        // Supprimer la condition absolute_expires_at pour permettre la réactivation des tokens expirés
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
      
      // DIAGNOSTIC: Afficher les tokens réactivés
      if (reactivatedTokens && reactivatedTokens.length > 0) {
        console.log(`📋 [DeliveryToken] DIAGNOSTIC - Tokens réactivés:`);
        reactivatedTokens.forEach((token, index) => {
          console.log(`   Token ${index + 1}: ID=${token.id}, expires_at=${token.expires_at}`);
        });
      } else {
        console.log(`⚠️ [DeliveryToken] DIAGNOSTIC - Aucun token réactivé. Vérifiez les conditions :`);
        console.log(`   - order_id = ${orderId}`);
        console.log(`   - used = false`);
        console.log(`   - absolute_expires_at > ${this.fuseauHoraireService.getCurrentTimeForDatabase()}`);
      }

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
   * Récupérer les tokens existants pour une commande
   */
  async getTokensForOrder(orderId: number): Promise<DeliveryToken[]> {
    try {
      const { data: tokens, error } = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [DeliveryToken] Erreur récupération tokens:', error);
        return [];
      }

      return tokens || [];
    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur getTokensForOrder:', error);
      return [];
    }
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

  /**
   * Marquer le token d'un livreur comme utilisé après validation OTP
   */
  async markTokenAsUsedAfterOTP(orderId: number, driverId: number): Promise<boolean> {
    try {
      console.log(`🔒 [DeliveryToken] Désactivation token après OTP - Commande ${orderId}, Livreur ${driverId}`);

      const { error } = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .update({
          used: true,
          updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
        })
        .eq('order_id', orderId)
        .eq('driver_id', driverId);

      if (error) {
        console.error('❌ [DeliveryToken] Erreur désactivation token après OTP:', error);
        return false;
      }

      console.log(`✅ [DeliveryToken] Token désactivé après validation OTP`);
      return true;
    } catch (error) {
      console.error('❌ [DeliveryToken] Erreur markTokenAsUsedAfterOTP:', error);
      return false;
    }
  }
}