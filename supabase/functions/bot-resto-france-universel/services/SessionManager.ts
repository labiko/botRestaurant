// 🗃️ GESTIONNAIRE DE SESSIONS - PERSISTANCE WORKFLOW
// SOLID - Single Responsibility : Gère uniquement les sessions
// Persistance complète de l'état et contexte utilisateur

// ⏱️ Configuration durée de session
const SESSION_DURATION_MINUTES = 120; // 2 heures - Durée raisonnable pour commandes livraison

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
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
   * Obtenir l'heure actuelle dans le bon fuseau horaire
   * Utilise le contexte global du TimezoneService configuré pour le restaurant
   */
  private getCurrentTime(): Date {
    console.log('🔍 [DEBUG_TIMEZONE] === DÉBUT getCurrentTime ===');
    
    if (!this.timezoneService) {
      console.error('🚨 [DEBUG_TIMEZONE] === ERREUR - TimezoneService null ===');
      throw new Error('TimezoneService non défini - appeler setTimezoneService() d\'abord');
    }
    
    const currentContext = this.timezoneService.getCurrentContext();
    console.log('🔍 [DEBUG_TIMEZONE] currentContext:', !!currentContext);
    if (currentContext) {
      console.log('🔍 [DEBUG_TIMEZONE_CALL] === APPEL getCurrentTime() ===');
      console.log('🔍 [DEBUG_TIMEZONE_CALL] Type de currentContext:', typeof currentContext);
      console.log('🔍 [DEBUG_TIMEZONE_CALL] currentContext.timezone:', currentContext.timezone);
      console.log('🔍 [DEBUG_TIMEZONE_CALL] Juste avant appel getCurrentTime()');
      
      const time = currentContext.getCurrentTime();
      
      console.log('🔍 [DEBUG_TIMEZONE_CALL] Juste après appel getCurrentTime()');
      
      // LOGS DÉTAILLÉS POUR DIAGNOSTIC
      console.log('🔍 [DEBUG_TIMEZONE_DETAIL] === ANALYSE COMPLÈTE TIME ===');
      console.log('🔍 [DEBUG_TIMEZONE_DETAIL] time.toISOString():', time.toISOString());
      console.log('🔍 [DEBUG_TIMEZONE_DETAIL] time.toString():', time.toString());
      console.log('🔍 [DEBUG_TIMEZONE_DETAIL] time.getTime():', time.getTime());
      console.log('🔍 [DEBUG_TIMEZONE_DETAIL] time.getTimezoneOffset():', time.getTimezoneOffset());
      console.log('🔍 [DEBUG_TIMEZONE_DETAIL] time.getHours():', time.getHours());
      console.log('🔍 [DEBUG_TIMEZONE_DETAIL] time.getMinutes():', time.getMinutes());
      console.log('🔍 [DEBUG_TIMEZONE_DETAIL] Context timezone:', currentContext.timezone);
      
      console.log('🔍 [DEBUG_TIMEZONE] === SUCCÈS getCurrentTime ===');
      return time;
    }
    console.error('🚨 [DEBUG_TIMEZONE] === ERREUR - Pas de contexte ===');
    throw new Error('Aucun contexte restaurant défini - TimezoneService non initialisé');
  }

  /**
   * Générer un timestamp formaté pour la base de données dans la timezone du restaurant
   */
  private getCurrentTimestamp(): string {
    console.log('🔍 [DEBUG_TIMESTAMP_FLOW] === DÉBUT getCurrentTimestamp ===');
    
    if (!this.timezoneService) {
      console.error('❌ [DEBUG_TIMESTAMP] TimezoneService non configuré, utilisation UTC');
      return new Date().toISOString().replace('T', ' ').replace('Z', '');
    }

    const context = this.timezoneService.getCurrentContext();
    if (!context) {
      console.error('❌ [DEBUG_TIMESTAMP] Context restaurant non trouvé, utilisation UTC');
      return new Date().toISOString().replace('T', ' ').replace('Z', '');
    }

    const now = new Date();
    console.log('🔍 [DEBUG_TIMESTAMP] Date UTC:', now.toISOString());
    console.log('🔍 [DEBUG_TIMESTAMP] Timezone restaurant:', context.timezone);

    // Utiliser Intl.DateTimeFormat pour formater dans la timezone du restaurant
    const formatter = new Intl.DateTimeFormat('sv-SE', { // sv-SE donne YYYY-MM-DD HH:mm:ss
      timeZone: context.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const formatted = formatter.format(now);
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    const timestamp = `${formatted}.${milliseconds}`;
    
    console.log('🔍 [DEBUG_TIMESTAMP_FINAL] Timestamp formaté avec timezone restaurant:', timestamp);
    console.log('🔍 [DEBUG_TIMESTAMP_FLOW] === FIN getCurrentTimestamp ===');
    
    return timestamp;
  }

  /**
   * Récupérer ou créer une session utilisateur
   * SOLID - Interface Segregation : Interface claire et cohérente
   */
  async getSession(phoneNumber: string): Promise<BotSession> {
    console.log(`🗃️ [SessionManager] Récupération session pour: ${phoneNumber}`);
    
    try {
      // Rechercher session existante et active
      const { data: existingSession, error } = await this.supabase
        .from('france_user_sessions')
        .select('*')
        .eq('phone_number', phoneNumber)
        .gt('expires_at', this.getCurrentTime().toISOString())
        .single();

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
          updates.sessionData = {
            ...existingSession.session_data,  // D'abord les données existantes
            ...updates.sessionData            // Puis les nouvelles (écrasent si même clé)
          };
          
          // Préserver spécifiquement pizzaOptionsMap si elle existait et n'est pas dans l'update
          if (existingSession.session_data.pizzaOptionsMap && !updates.sessionData.pizzaOptionsMap) {
            updates.sessionData.pizzaOptionsMap = existingSession.session_data.pizzaOptionsMap;
            updates.sessionData.totalPizzaOptions = existingSession.session_data.totalPizzaOptions;
            console.log(`✅ [SessionManager] PizzaOptionsMap préservée (${updates.sessionData.pizzaOptionsMap.length} options)`);
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
        expires_at: new Date(Date.now() + SESSION_DURATION_MINUTES * 60 * 1000), // 2 heures
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
      sessionData: dbRow.session_data || {}, // AJOUT: Mapping sessionData depuis BDD
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
      dbData.session_data = session.sessionData;
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
        console.warn('⚠️ [SessionManager] Restaurant par défaut non trouvé, utilisation ID=1');
        return 1;
      }

      return data.id;
      
    } catch (error) {
      console.error('❌ [SessionManager] Erreur récupération restaurant par défaut:', error);
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
      const newExpiresAt = new Date(Date.now() + additionalMinutes * 60 * 1000);
      
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
    console.log('🔍 [DEBUG_SESSION_DELETE] === DÉBUT SUPPRESSION ===');
    console.log(`🗑️ [SessionManager] Suppression sessions pour: ${phoneNumber}`);
    
    try {
      const { error } = await this.supabase
        .from('france_user_sessions')
        .delete()
        .eq('phone_number', phoneNumber);

      if (error) {
        console.error('🚨 [DEBUG_SESSION_DELETE] === ERREUR SUPABASE ===');
        console.error('❌ [SessionManager] Erreur suppression sessions:', error);
        console.error('🚨 [DEBUG_SESSION_DELETE] error.message:', error?.message);
        console.error('🚨 [DEBUG_SESSION_DELETE] error.code:', error?.code);
        throw error;
      }

      console.log(`✅ [SessionManager] Sessions supprimées pour: ${phoneNumber}`);
      console.log('🔍 [DEBUG_SESSION_DELETE] === SUCCÈS SUPPRESSION ===');
      
    } catch (error) {
      console.error('🚨 [DEBUG_SESSION_DELETE] === ERREUR CATCH ===');
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
      expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_DURATION_MINUTES);
      
      const { data: newSession, error } = await this.supabase
        .from('france_user_sessions')
        .insert({
          phone_number: phoneNumber,
          chat_id: phoneNumber,
          restaurant_id: restaurant.id,
          current_step: currentStep,
          session_data: JSON.stringify(sessionData),
          bot_state: {
            mode: 'delivery_mode_selection',
            context: 'restaurant_access'
          },
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
          created_at: this.getCurrentTimestamp(),
          updated_at: this.getCurrentTimestamp()
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