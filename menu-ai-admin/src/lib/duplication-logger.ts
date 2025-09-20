// 📋 SERVICE DE LOGGING DES DUPLICATIONS
// ======================================

import { createClient } from '@supabase/supabase-js';

export interface DuplicationReport {
  id: number;
  sourceRestaurant: string;
  targetRestaurant: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  summary: {
    categoriesDuplicated: number;
    productsDuplicated: number;
    optionsDuplicated: number;
    workflowsConfigured: number;
  };
  details: {
    selectedCategories: number[];
    duplicateWorkflows: boolean;
    actions: any[];
  };
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  errorMessage?: string;
}

export interface ActionLog {
  actionType: string;
  entityType: string;
  sourceId?: number;
  targetId?: number;
  entityName: string;
  actionData?: any;
  success: boolean;
  errorMessage?: string;
}

export class DuplicationLogger {
  private supabase: any;
  private logId: number | null = null;
  private actions: ActionLog[] = [];
  private startTime: Date;

  constructor() {
    // Utiliser la même configuration que les autres services
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'DEV';
    const supabaseUrl = environment === 'PROD'
      ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = environment === 'PROD'
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD
      : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    this.supabase = createClient(supabaseUrl!, supabaseKey!);
    this.startTime = new Date();
  }

  /**
   * Démarre une nouvelle session de duplication
   */
  async startDuplication(
    sourceId: number,
    targetName: string,
    selectedCategories: number[],
    duplicateWorkflows: boolean,
    userSession?: string
  ): Promise<number> {
    try {
      console.log('📊 Début logging duplication...');

      const { data, error } = await this.supabase
        .from('duplication_logs')
        .insert({
          source_restaurant_id: sourceId,
          target_restaurant_id: null, // Sera mis à jour après création
          user_session: userSession || `session-${Date.now()}`,
          status: 'started',
          details: {
            selectedCategories,
            duplicateWorkflows,
            targetName,
            actions: []
          },
          started_at: this.startTime.toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;

      this.logId = data.id;
      console.log(`✅ Log duplication créé avec ID: ${this.logId}`);

      return this.logId;
    } catch (error) {
      console.error('❌ Erreur création log duplication:', error);
      throw error;
    }
  }

  /**
   * Log une action individuelle
   */
  async logAction(
    actionType: string,
    entityType: string,
    entityName: string,
    sourceId?: number,
    targetId?: number,
    actionData?: any,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    if (!this.logId) {
      console.warn('⚠️ Tentative de log sans session active');
      return;
    }

    const action: ActionLog = {
      actionType,
      entityType,
      sourceId,
      targetId,
      entityName,
      actionData,
      success,
      errorMessage
    };

    this.actions.push(action);

    try {
      // Enregistrer en base de données
      await this.supabase
        .from('duplication_actions')
        .insert({
          duplication_log_id: this.logId,
          action_type: actionType,
          entity_type: entityType,
          source_id: sourceId,
          target_id: targetId,
          entity_name: entityName,
          action_data: actionData,
          success,
          error_message: errorMessage
        });

      console.log(`📝 Action loggée: ${actionType} ${entityType} "${entityName}"`);
    } catch (error) {
      console.error('❌ Erreur logging action:', error);
    }
  }

  /**
   * Met à jour le statut de la duplication
   */
  async updateStatus(status: 'in_progress' | 'completed' | 'failed'): Promise<void> {
    if (!this.logId) return;

    try {
      await this.supabase
        .from('duplication_logs')
        .update({ status })
        .eq('id', this.logId);

      console.log(`📊 Statut mis à jour: ${status}`);
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
    }
  }

  /**
   * Met à jour l'ID du restaurant cible après création
   */
  async updateTargetRestaurant(targetRestaurantId: number): Promise<void> {
    if (!this.logId) return;

    try {
      await this.supabase
        .from('duplication_logs')
        .update({ target_restaurant_id: targetRestaurantId })
        .eq('id', this.logId);

      console.log(`🎯 Restaurant cible mis à jour: ${targetRestaurantId}`);
    } catch (error) {
      console.error('❌ Erreur mise à jour restaurant cible:', error);
    }
  }

  /**
   * Finalise la duplication avec succès
   */
  async completeDuplication(summary: {
    categoriesDuplicated: number;
    productsDuplicated: number;
    optionsDuplicated: number;
    workflowsConfigured: number;
  }): Promise<void> {
    if (!this.logId) return;

    const endTime = new Date();
    const durationSeconds = Math.round((endTime.getTime() - this.startTime.getTime()) / 1000);

    try {
      await this.supabase
        .from('duplication_logs')
        .update({
          status: 'completed',
          summary,
          completed_at: endTime.toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', this.logId);

      console.log(`🎉 Duplication completée en ${durationSeconds}s:`, summary);
    } catch (error) {
      console.error('❌ Erreur finalisation duplication:', error);
    }
  }

  /**
   * Marque la duplication comme échouée
   */
  async failDuplication(errorMessage: string): Promise<void> {
    if (!this.logId) return;

    const endTime = new Date();
    const durationSeconds = Math.round((endTime.getTime() - this.startTime.getTime()) / 1000);

    try {
      await this.supabase
        .from('duplication_logs')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: endTime.toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', this.logId);

      console.log(`❌ Duplication échouée après ${durationSeconds}s: ${errorMessage}`);
    } catch (error) {
      console.error('❌ Erreur marquage échec:', error);
    }
  }

  /**
   * Génère un rapport complet de la duplication
   */
  async generateReport(): Promise<DuplicationReport | null> {
    if (!this.logId) return null;

    try {
      // Récupérer le log principal
      const { data: log, error: logError } = await this.supabase
        .from('duplication_logs')
        .select(`
          *,
          source_restaurant:source_restaurant_id(name),
          target_restaurant:target_restaurant_id(name)
        `)
        .eq('id', this.logId)
        .single();

      if (logError) throw logError;

      // Récupérer les actions
      const { data: actions, error: actionsError } = await this.supabase
        .from('duplication_actions')
        .select('*')
        .eq('duplication_log_id', this.logId)
        .order('timestamp', { ascending: true });

      if (actionsError) throw actionsError;

      return {
        id: log.id,
        sourceRestaurant: log.source_restaurant?.name || 'Restaurant source',
        targetRestaurant: log.target_restaurant?.name || 'Restaurant cible',
        status: log.status,
        summary: log.summary || {
          categoriesDuplicated: 0,
          productsDuplicated: 0,
          optionsDuplicated: 0,
          workflowsConfigured: 0
        },
        details: {
          ...log.details,
          actions: actions || []
        },
        startedAt: log.started_at,
        completedAt: log.completed_at,
        durationSeconds: log.duration_seconds,
        errorMessage: log.error_message
      };
    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      return null;
    }
  }

  /**
   * Méthodes helper pour les types d'actions courantes
   */
  async logRestaurantCreation(name: string, targetId: number): Promise<void> {
    await this.logAction('create_restaurant', 'restaurant', name, undefined, targetId, { name });
  }

  async logCategoryDuplication(name: string, sourceId: number, targetId: number): Promise<void> {
    await this.logAction('duplicate_category', 'category', name, sourceId, targetId);
  }

  async logProductDuplication(name: string, sourceId: number, targetId: number, productType?: string): Promise<void> {
    await this.logAction('duplicate_product', 'product', name, sourceId, targetId, { productType });
  }

  async logOptionDuplication(name: string, sourceId: number, targetId: number): Promise<void> {
    await this.logAction('duplicate_option', 'option', name, sourceId, targetId);
  }

  /**
   * Récupère l'historique des duplications
   */
  static async getHistory(limit: number = 50): Promise<any[]> {
    try {
      const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'DEV';
      const supabaseUrl = environment === 'PROD'
        ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
        : process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = environment === 'PROD'
        ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD
        : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const supabase = createClient(supabaseUrl!, supabaseKey!);

      const { data, error } = await supabase
        .from('duplication_logs')
        .select(`
          *,
          source_restaurant:source_restaurant_id(name),
          target_restaurant:target_restaurant_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération historique:', error);
      return [];
    }
  }
}