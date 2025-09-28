// 🗃️ GESTIONNAIRE DE SESSIONS - PERSISTANCE WORKFLOW
// SOLID - Single Responsibility : Gère uniquement les sessions
// Persistance complète de l'état et contexte utilisateur

// ⏱️ Configuration durée de session
const SESSION_DURATION_MINUTES = 240; // 4 heures - TEMPORAIRE pour test décalage horaire

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { QueryPerformanceMonitor } from './QueryPerformanceMonitor.ts';
import { 
  ISessionManager, 
  BotSession, 
  BotState, 
  WorkflowData 
} from '../types.ts';
import { TimezoneService } from './TimezoneService.ts';

/**
 * Gestionnaire de sessions avec persistance complète
 * SOLID - Single Responsibility : Gère uniquement les sessions, pas la logique métier
 */
export class SessionManager implements ISessionManager {
  
  private supabase: SupabaseClient;
  private timezoneService: TimezoneService | null = null;

  constructor(supabaseUrl: string, supabaseServiceRoleKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  /**
   * Définir l'instance TimezoneService partagée
   */
  setTimezoneService(timezoneService: TimezoneService): void {
    this.timezoneService = timezoneService;
  }

  /**
   * Obtenir l'heure actuelle dans le bon fuseau horaire PARIS
   * ✅ Version finale optimisée avec format Paris validé + DEBUG
   */
  private getCurrentTime(): Date {

    // Formatter pour timezone Paris (gère automatiquement heure d'été/hiver)
    const parisFormatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const utcNow = new Date();

    // Format: "17/09/2025 22:06:36" (validé comme correct)
    const parisFormatted = parisFormatter.format(utcNow);

    // Parsing du format DD/MM/YYYY HH:mm:ss
    const parts = parisFormatted.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (parts) {
      const [, day, month, year, hour, minute, second] = parts;
      const parisDate = new Date(
        parseInt(year),
        parseInt(month) - 1, // Mois 0-indexé
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );


      return parisDate;
    }

    // Fallback UTC si parsing échoue (ne devrait jamais arriver)
    console.warn('🕐 [DEBUG_TIMEZONE] === FALLBACK UTC - PARSING ÉCHOUÉ ===');
    return utcNow;
  }



  /**
   * Vérifier si une session existe SANS la créer
   * Helper pour le contrôle anti-parasite
   */
  async checkSessionExists(phoneNumber: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('france_user_sessions')
        .select('id')
        .eq('phone_number', phoneNumber)
        .gt('expires_at', this.getCurrentTime().toISOString())
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Récupérer ou créer une session utilisateur
   * SOLID - Interface Segregation : Interface claire et cohérente
   */
  async getSession(phoneNumber: string): Promise<BotSession> {
    console.log(`🗃️ [SessionManager] Récupération session pour: ${phoneNumber}`);
    
    try {
      // Rechercher session existante et active
      const { data: existingSession, error } = await QueryPerformanceMonitor.measureQuery(
        'SESSION_SELECT_STAR_WITH_JSON',
        this.supabase
          .from('france_user_sessions')
          .select('*')
          .eq('phone_number', phoneNumber)
          .gt('expires_at', this.getCurrentTime().toISOString())
          .single()
      );

      if (existingSession && !error) {
        console.log(`✅ [SessionManager] Session existante trouvée: ${existingSession.id}`);
        return this.mapDatabaseToSession(existingSession);
      }

      // Créer nouvelle session
      console.log(`🆕 [SessionManager] Création nouvelle session pour: ${phoneNumber}`);
      return await this.createNewSession(phoneNumber);
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur récupération session:', error);
      
      // En cas d'erreur, créer session de secours
      return await this.createNewSession(phoneNumber);
    }
  }

  /**
   * Mettre à jour une session existante
   * SOLID - Open/Closed : Extensible pour nouveaux champs sans modification
   * FIX: Préserver les données existantes lors des mises à jour partielles
   */
  async updateSession(sessionId: string, updates: Partial<BotSession>): Promise<void> {
    console.log(`🔄 [SessionManager] Mise à jour session: ${sessionId}`);
    console.log(`📝 [SessionManager] Champs mis à jour:`, Object.keys(updates));
    
    try {
      // NOUVEAU: Toujours fusionner les données au lieu de les écraser
      if (updates.sessionData) {
        const { data: existingSession, error: fetchError } = await this.supabase
          .from('france_user_sessions')
          .select('session_data')
          .eq('id', sessionId)
          .single();

        if (!fetchError && existingSession?.session_data) {
          console.log(`🔄 [SessionManager] Fusion session_data:`, {
            existingKeys: Object.keys(existingSession.session_data),
            newKeys: Object.keys(updates.sessionData),
            hasPizzaOptionsMap: !!(existingSession.session_data.pizzaOptionsMap),
            preservingPizzaMap: !!(existingSession.session_data.pizzaOptionsMap && !updates.sessionData.pizzaOptionsMap)
          });
          
          // FUSION: Préserver les données existantes non présentes dans l'update
          
          // ✅ CORRUPTION FIX: Parser le JSON si c'est un string avant le spread
          const existingData = typeof existingSession.session_data === 'string' ? JSON.parse(existingSession.session_data) : existingSession.session_data;
          
          updates.sessionData = {
            ...existingData,  // D'abord les données existantes (parsées si nécessaire)
            ...updates.sessionData            // Puis les nouvelles (écrasent si même clé)
          };
          
          
          // 🚨 [TRACE_FONCTION_L177] FIX PIZZA BUG: Respecter le nettoyage explicite
          // Préserver pizzaOptionsMap SEULEMENT si elle n'est pas explicitement définie dans l'update
          if (existingSession.session_data.pizzaOptionsMap &&
              !updates.sessionData.hasOwnProperty('pizzaOptionsMap')) {
            updates.sessionData.pizzaOptionsMap = existingSession.session_data.pizzaOptionsMap;
            updates.sessionData.totalPizzaOptions = existingSession.session_data.totalPizzaOptions;
            console.log(`✅ [TRACE_FONCTION_L181] SessionManager - PizzaOptionsMap préservée (${updates.sessionData.pizzaOptionsMap.length} options)`);
          } else if (updates.sessionData.hasOwnProperty('pizzaOptionsMap') && updates.sessionData.pizzaOptionsMap === undefined) {
            console.log(`🚨 [TRACE_FONCTION_L183] SessionManager - PizzaOptionsMap NETTOYÉE explicitement (undefined)`);
          }
        }
      }
      
      // Mapper les updates vers le format base de données
      const dbUpdates = this.mapSessionToDatabase(updates);
      
      // Ajouter timestamp de mise à jour
      dbUpdates.updated_at = this.getCurrentTime();
      
      console.log(`💾 [SessionManager] Données finales à sauver:`, {
        sessionId,
        updateKeys: Object.keys(dbUpdates),
        hasSessionData: !!(dbUpdates.session_data),
        sessionDataKeys: dbUpdates.session_data ? Object.keys(dbUpdates.session_data) : 'null'
      });
      
      
      const { error } = await this.supabase
        .from('france_user_sessions')
        .update(dbUpdates)
        .eq('id', sessionId);

      if (error) {
        console.error('❌ [SessionManager] Erreur mise à jour session:', error);
        throw error;
      }
      
      console.log(`✅ [SessionManager] Session mise à jour: ${sessionId}`);
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur updateSession:', error);
      throw error;
    }
  }

  /**
   * Nettoyer/réinitialiser une session
   * SOLID - Command Pattern : Action claire et réversible
   */
  async clearSession(phoneNumber: string): Promise<void> {
    console.log(`🧹 [SessionManager] Nettoyage session: ${phoneNumber}`);
    
    try {
      const { error } = await this.supabase
        .from('france_user_sessions')
        .update({
          bot_state: { mode: 'menu_browsing' },
          current_workflow_id: null,
          workflow_step_id: null,
          workflow_data: {
            workflowId: '',
            currentStepId: '',
            stepHistory: [],
            selectedItems: {},
            validationErrors: []
          },
          cart_items: [],
          total_amount: 0,
          updated_at: this.getCurrentTime()
        })
        .eq('phone_number', phoneNumber);

      if (error) {
        console.error('❌ [SessionManager] Erreur clearSession:', error);
        throw error;
      }
      
      console.log(`✅ [SessionManager] Session nettoyée: ${phoneNumber}`);
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur clearSession:', error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle session utilisateur
   * SOLID - Factory Method : Création encapsulée avec valeurs par défaut
   */
  private async createNewSession(phoneNumber: string): Promise<BotSession> {
    console.log(`🆕 [SessionManager] Création session pour: ${phoneNumber}`);
    
    try {
      // Déterminer le restaurant par défaut (Pizza Yolo pour l'instant)
      const defaultRestaurantId = await this.getDefaultRestaurantId();
      
      // Données de la nouvelle session
      const sessionData = {
        phone_number: phoneNumber,
        restaurant_id: defaultRestaurantId,
        bot_state: {
          mode: 'menu_browsing' as const,
          lastInteraction: this.getCurrentTime(),
          language: 'fr',
          context: {}
        },
        current_workflow_id: null,
        workflow_step_id: null,
        workflow_data: {
          workflowId: '',
          currentStepId: '',
          stepHistory: [],
          selectedItems: {},
          validationErrors: []
        },
        cart_items: [],
        total_amount: 0,
        expires_at: new Date(this.getCurrentTime().getTime() + SESSION_DURATION_MINUTES * 60 * 1000), // 4 heures depuis heure Paris
        created_at: this.getCurrentTime(),
        updated_at: this.getCurrentTime()
      };

      const { data: newSession, error } = await this.supabase
        .from('france_user_sessions')
        .insert(sessionData)
        .select('*')
        .single();

      if (error) {
        console.error('❌ [SessionManager] Erreur création session:', error);
        throw error;
      }

      console.log(`✅ [SessionManager] Nouvelle session créée: ${newSession.id}`);
      return this.mapDatabaseToSession(newSession);
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur createNewSession:', error);
      throw error;
    }
  }

  /**
   * CENTRALISATION - Parser session_data de la DB vers Object
   * Gère automatiquement String → Object avec validation et sécurité
   */
  private parseSessionData(rawData: any): any {
    console.log('🔍 [SessionManager:276] parseSessionData() - Input type:', typeof rawData);
    
    // Validation de sécurité - détecter la corruption par spread operator
    if (typeof rawData === 'object' && rawData !== null) {
      // Vérifier si l'objet est corrompu (transformation string → char array)
      const keys = Object.keys(rawData);
      const isCorrupted = keys.length > 0 && keys.every(key => /^\d+$/.test(key));
      
      if (isCorrupted) {
        console.error('🚨 [SessionManager:283] CORRUPTION DÉTECTÉE - Object avec clés numériques (char array):', {
          keys: keys.slice(0, 10), // Afficher les 10 premières clés
          totalKeys: keys.length,
          sampleValues: keys.slice(0, 3).map(k => rawData[k])
        });
        return {};
      }
      
      console.log('✅ [SessionManager:291] parseSessionData() - Valid object, returning directly');
      return rawData;
    }
    
    // Si c'est un string JSON, parser avec validation
    if (typeof rawData === 'string') {
      // Validation de sécurité - vérifier la taille maximale (protection contre DoS)
      if (rawData.length > 100000) { // 100KB max
        console.error('🚨 [SessionManager:299] SÉCURITÉ - Session data trop volumineux:', rawData.length, 'caractères');
        return {};
      }
      
      try {
        const parsed = JSON.parse(rawData);
        
        // Validation post-parsing
        if (typeof parsed === 'object' && parsed !== null) {
          console.log('✅ [SessionManager:306] parseSessionData() - Successfully parsed and validated JSON string');
          return parsed;
        } else {
          console.warn('⚠️ [SessionManager:309] parseSessionData() - Parsed data is not an object');
          return {};
        }
      } catch (error) {
        console.warn('⚠️ [SessionManager:313] parseSessionData() - Échec parsing JSON string, retour objet vide:', error);
        return {};
      }
    }
    
    // Fallback objet vide
    console.log('⚠️ [SessionManager:318] parseSessionData() - Fallback to empty object for type:', typeof rawData);
    return {};
  }

  /**
   * CENTRALISATION - Stringify Object vers session_data pour la DB  
   * Gère automatiquement Object → String avec validation et sécurité
   */
  private stringifySessionData(data: any): string {
    console.log('🔍 [SessionManager:332] stringifySessionData() - Input type:', typeof data);
    
    // Validation de sécurité - détecter la corruption avant stringify
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      const isCorrupted = keys.length > 0 && keys.every(key => /^\d+$/.test(key));
      
      if (isCorrupted) {
        console.error('🚨 [SessionManager:339] CORRUPTION DÉTECTÉE avant stringify - Object avec clés numériques:', {
          keys: keys.slice(0, 10),
          totalKeys: keys.length
        });
        return '{}'; // Retourner objet vide sérialisé
      }
    }
    
    // Si c'est déjà un string, valider et retourner
    if (typeof data === 'string') {
      // Validation de sécurité - vérifier la taille
      if (data.length > 100000) {
        console.error('🚨 [SessionManager:350] SÉCURITÉ - String data trop volumineux:', data.length);
        return '{}';
      }
      console.log('✅ [SessionManager:353] stringifySessionData() - Already string, returning directly');
      return data;
    }
    
    // Si c'est un objet, stringify avec validation
    if (typeof data === 'object' && data !== null) {
      try {
        const stringified = JSON.stringify(data);
        
        // Validation post-stringify
        if (stringified.length > 100000) {
          console.error('🚨 [SessionManager:362] SÉCURITÉ - Stringified data trop volumineux:', stringified.length);
          return '{}';
        }
        
        console.log('✅ [SessionManager:366] stringifySessionData() - Successfully stringified and validated object');
        return stringified;
      } catch (error) {
        console.warn('⚠️ [SessionManager:314] stringifySessionData() - Échec stringify objet, retour {}:', error);
        return '{}';
      }
    }
    
    // Fallback string vide
    console.log('⚠️ [SessionManager:319] stringifySessionData() - Fallback to empty JSON');
    return '{}';
  }

  /**
   * Mapper données base vers objet Session
   * SOLID - Data Transfer Object : Transformation claire des données
   */
  private mapDatabaseToSession(dbRow: any): BotSession {
    // DEBUG: Vérifier les données récupérées depuis la base
    console.log(`🔍 [SessionManager] Mapping session ${dbRow.id}:`, {
      sessionDataKeys: dbRow.session_data ? Object.keys(dbRow.session_data) : 'null',
      hasPizzaOptionsMap: !!(dbRow.session_data?.pizzaOptionsMap),
      pizzaOptionsCount: dbRow.session_data?.pizzaOptionsMap?.length || 0,
      updatedAt: dbRow.updated_at
    });
    
    return {
      id: dbRow.id?.toString() || '',
      phoneNumber: dbRow.phone_number || '',
      restaurantId: dbRow.restaurant_id || 1,
      botState: dbRow.bot_state || {
        mode: 'menu_browsing',
        lastInteraction: this.getCurrentTime(),
        language: 'fr',
        context: {}
      },
      sessionData: this.parseSessionData(dbRow.session_data), // ✅ CENTRALISATION: Utilise la fonction centralisée
      currentWorkflowId: dbRow.current_workflow_id || undefined,
      workflowStepId: dbRow.workflow_step_id || undefined,
      workflowData: dbRow.workflow_data || {
        workflowId: '',
        currentStepId: '',
        stepHistory: [],
        selectedItems: {},
        validationErrors: []
      },
      cart: dbRow.cart_items || [],
      totalAmount: parseFloat(dbRow.total_amount || '0'),
      expiresAt: new Date(dbRow.expires_at),
      createdAt: new Date(dbRow.created_at),
      updatedAt: new Date(dbRow.updated_at)
    };
  }

  /**
   * Mapper objet Session vers données base
   * SOLID - Data Transfer Object : Transformation inverse
   */
  private mapSessionToDatabase(session: Partial<BotSession>): Record<string, any> {
    const dbData: Record<string, any> = {};

    if (session.restaurantId !== undefined) {
      dbData.restaurant_id = session.restaurantId;
    }
    
    if (session.botState !== undefined) {
      dbData.bot_state = session.botState;
    }
    
    if (session.sessionData !== undefined) { // AJOUT: Mapping sessionData vers BDD
      dbData.session_data = this.stringifySessionData(session.sessionData); // ✅ CENTRALISATION: Utilise la fonction centralisée
    }
    
    if (session.currentWorkflowId !== undefined) {
      dbData.current_workflow_id = session.currentWorkflowId;
    }
    
    if (session.workflowStepId !== undefined) {
      dbData.workflow_step_id = session.workflowStepId;
    }
    
    if (session.workflowData !== undefined) {
      dbData.workflow_data = session.workflowData;
    }
    
    if (session.cart !== undefined) {
      dbData.cart_items = session.cart;
    }
    
    if (session.totalAmount !== undefined) {
      dbData.total_amount = session.totalAmount;
    }
    
    if (session.expiresAt !== undefined) {
      dbData.expires_at = session.expiresAt;
    }

    return dbData;
  }

  /**
   * Obtenir l'ID du restaurant par défaut
   */
  private async getDefaultRestaurantId(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('france_restaurants')
        .select('id')
        .eq('slug', 'pizza-yolo-77')
        .single();

      if (error || !data) {
        console.warn('⚠️ [SessionManager] Restaurant par défaut NON TROUVÉ - utilisation ID=1');
        return 1;
      }

      return data.id;

    } catch (error) {
      console.error('❌ [SessionManager] Erreur récupération restaurant défaut - utilisation ID=1');
      return 1; // Fallback
    }
  }

  /**
   * Nettoyer les sessions expirées (maintenance)
   * SOLID - Single Responsibility : Une méthode pour une tâche
   */
  async cleanExpiredSessions(): Promise<number> {
    console.log('🧹 [SessionManager] Nettoyage sessions expirées...');
    
    try {
      const { data, error } = await this.supabase
        .from('france_user_sessions')
        .delete()
        .lt('expires_at', this.getCurrentTime().toISOString())
        .select('id');

      if (error) {
        console.error('❌ [SessionManager] Erreur nettoyage sessions:', error);
        return 0;
      }

      const cleanedCount = data?.length || 0;
      console.log(`✅ [SessionManager] ${cleanedCount} sessions expirées supprimées`);
      
      return cleanedCount;
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur cleanExpiredSessions:', error);
      return 0;
    }
  }

  /**
   * Prolonger une session active
   * SOLID - Command Pattern : Action spécifique et claire
   */
  async extendSession(sessionId: string, additionalMinutes: number = 30): Promise<void> {
    console.log(`⏰ [SessionManager] Prolongation session: ${sessionId} (+${additionalMinutes}min)`);
    
    try {
      const newExpiresAt = new Date(this.getCurrentTime().getTime() + additionalMinutes * 60 * 1000);
      
      const { error } = await this.supabase
        .from('france_user_sessions')
        .update({ 
          expires_at: newExpiresAt,
          updated_at: this.getCurrentTime()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('❌ [SessionManager] Erreur prolongation session:', error);
        throw error;
      }
      
      console.log(`✅ [SessionManager] Session prolongée jusqu'à: ${newExpiresAt.toLocaleString()}`);
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur extendSession:', error);
      throw error;
    }
  }

  /**
   * Obtenir statistiques des sessions actives
   * SOLID - Query Object : Requête encapsulée
   */
  async getActiveSessionsStats(): Promise<{
    totalActive: number;
    byMode: Record<string, number>;
    byRestaurant: Record<string, number>;
  }> {
    
    try {
      const { data, error } = await this.supabase
        .from('france_user_sessions')
        .select('bot_state, restaurant_id')
        .gt('expires_at', this.getCurrentTime().toISOString());

      if (error) {
        console.error('❌ [SessionManager] Erreur stats sessions:', error);
        return { totalActive: 0, byMode: {}, byRestaurant: {} };
      }

      const stats = {
        totalActive: data.length,
        byMode: {} as Record<string, number>,
        byRestaurant: {} as Record<string, number>
      };

      data.forEach(session => {
        // Stats par mode
        const mode = session.bot_state?.mode || 'unknown';
        stats.byMode[mode] = (stats.byMode[mode] || 0) + 1;
        
        // Stats par restaurant
        const restaurantId = session.restaurant_id?.toString() || 'unknown';
        stats.byRestaurant[restaurantId] = (stats.byRestaurant[restaurantId] || 0) + 1;
      });

      return stats;
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur getActiveSessionsStats:', error);
      return { totalActive: 0, byMode: {}, byRestaurant: {} };
    }
  }

  /**
   * Supprimer toutes les sessions d'un utilisateur par téléphone
   * SOLID - Single Responsibility : Suppression complète des sessions utilisateur
   */
  async deleteSessionsByPhone(phoneNumber: string): Promise<void> {
    console.log(`🗑️ [SessionManager] Suppression sessions pour: ${phoneNumber}`);
    
    try {
      const { error } = await this.supabase
        .from('france_user_sessions')
        .delete()
        .eq('phone_number', phoneNumber);

      if (error) {
        console.error('❌ [SessionManager] Erreur suppression sessions:', error);
        throw error;
      }

      console.log(`✅ [SessionManager] Sessions supprimées pour: ${phoneNumber}`);
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur deleteSessionsByPhone:', error);
      throw error;
    }
  }

  /**
   * Créer une session pour un restaurant spécifique
   * SOLID - Factory Pattern : Création centralisée des sessions restaurant
   */
  async createSessionForRestaurant(
    phoneNumber: string,
    restaurant: any,
    currentStep: string,
    sessionData: any = {}
  ): Promise<BotSession> {
    console.log(`📝 [SessionManager] Création session restaurant pour: ${phoneNumber}`);
    console.log(`📝 [SessionManager] Restaurant: ${restaurant.name} (ID: ${restaurant.id})`);


    try {
      const expiresAt = this.getCurrentTime();

      // Logique conditionnelle selon currentStep
      if (currentStep === 'POST_ORDER_NOTES') {
        // Notes post-commande : 5 minutes seulement
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
      } else {
        // Tous les autres cas : durée normale (4h actuellement)
        expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_DURATION_MINUTES);
      }
      
      const { data: newSession, error } = await this.supabase
        .from('france_user_sessions')
        .insert({
          phone_number: phoneNumber,
          chat_id: phoneNumber,
          restaurant_id: restaurant.id,
          current_step: currentStep,
          session_data: JSON.stringify(sessionData),
          bot_state: currentStep,
          workflow_data: {
            workflowId: 'restaurant_onboarding',
            currentStepId: currentStep,
            stepHistory: [],
            selectedItems: {},
            validationErrors: []
          },
          cart_items: [],
          total_amount: 0,
          expires_at: expiresAt,
          created_at: this.getCurrentTime(),
          updated_at: this.getCurrentTime()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [SessionManager] Erreur création session restaurant:', error);
        throw error;
      }

      console.log(`✅ [SessionManager] Session restaurant créée: ${newSession.id}`);
      return this.mapDatabaseToSession(newSession);
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur createSessionForRestaurant:', error);
      throw error;
    }
  }
}