// ⚙️ GESTIONNAIRE DE CONFIGURATION - MULTI-RESTAURANTS
// SOLID - Single Responsibility : Gère uniquement les configurations restaurant
// Configuration isolée par restaurant, sans impact sur les autres

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  IRestaurantConfigManager,
  RestaurantConfig,
  WorkflowDefinition,
  WorkflowStep,
  MessageTemplate
} from '../types.ts';

/**
 * Gestionnaire de configurations restaurant
 * SOLID - Single Responsibility : Gère uniquement les configs, pas l'exécution
 */
export class ConfigurationManager implements IRestaurantConfigManager {
  
  private supabase: SupabaseClient;
  private configCache: Map<number, RestaurantConfig> = new Map();
  private workflowCache: Map<number, WorkflowDefinition[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseUrl: string, supabaseServiceRoleKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  /**
   * Récupérer la configuration complète d'un restaurant
   * SOLID - Interface Segregation : Interface claire pour récupération config
   */
  async getConfig(restaurantId: number): Promise<RestaurantConfig> {
    console.log(`⚙️ [ConfigManager] Récupération config restaurant: ${restaurantId}`);
    
    // Vérifier cache
    const cached = this.getCachedConfig(restaurantId);
    if (cached) {
      console.log(`📋 [ConfigManager] Config trouvée en cache: ${cached.brandName}`);
      return cached;
    }

    try {
      // Récupérer depuis la base
      const { data: configData, error } = await this.supabase
        .from('restaurant_bot_configs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('❌ [ConfigManager] Erreur récupération config:', error);
        // Retourner config par défaut
        return await this.getDefaultConfig(restaurantId);
      }

      const config = this.mapDatabaseToConfig(configData);
      
      // Mettre en cache
      this.setCachedConfig(restaurantId, config);
      
      console.log(`✅ [ConfigManager] Config chargée: ${config.brandName}`);
      return config;
      
    } catch (error) {
      console.error('❌ [ConfigManager] Erreur getConfig:', error);
      return await this.getDefaultConfig(restaurantId);
    }
  }

  /**
   * Récupérer les workflows d'un restaurant
   * SOLID - Dependency Inversion : Dépend de l'abstraction, pas de l'implémentation
   */
  async getWorkflows(restaurantId: number): Promise<WorkflowDefinition[]> {
    console.log(`🔄 [ConfigManager] Récupération workflows restaurant: ${restaurantId}`);
    
    // Vérifier cache
    const cached = this.getCachedWorkflows(restaurantId);
    if (cached) {
      console.log(`📋 [ConfigManager] ${cached.length} workflows en cache`);
      return cached;
    }

    try {
      const { data: workflowsData, error } = await this.supabase
        .from('workflow_definitions')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('workflow_id');

      if (error) {
        console.error('❌ [ConfigManager] Erreur récupération workflows:', error);
        return [];
      }

      const workflows = workflowsData.map(this.mapDatabaseToWorkflow);
      
      // Mettre en cache
      this.setCachedWorkflows(restaurantId, workflows);
      
      console.log(`✅ [ConfigManager] ${workflows.length} workflows chargés`);
      return workflows;
      
    } catch (error) {
      console.error('❌ [ConfigManager] Erreur getWorkflows:', error);
      return [];
    }
  }

  /**
   * Récupérer les étapes d'un workflow
   * SOLID - Open/Closed : Extensible sans modification
   */
  async getWorkflowSteps(workflowId: number): Promise<WorkflowStep[]> {
    console.log(`📋 [ConfigManager] Récupération étapes workflow: ${workflowId}`);
    
    try {
      const { data: stepsData, error } = await this.supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .eq('is_active', true)
        .order('step_order');

      if (error) {
        console.error('❌ [ConfigManager] Erreur récupération étapes:', error);
        return [];
      }

      const steps = stepsData.map(this.mapDatabaseToStep);
      
      console.log(`✅ [ConfigManager] ${steps.length} étapes chargées`);
      return steps;
      
    } catch (error) {
      console.error('❌ [ConfigManager] Erreur getWorkflowSteps:', error);
      return [];
    }
  }

  /**
   * Récupérer un template de message
   * SOLID - Single Responsibility : Une fonction pour une tâche
   */
  async getMessageTemplate(
    restaurantId: number, 
    templateKey: string, 
    language: string = 'fr'
  ): Promise<MessageTemplate | null> {
    
    console.log(`💬 [ConfigManager] Récupération template: ${templateKey} (${language})`);
    
    try {
      const { data: templateData, error } = await this.supabase
        .from('message_templates')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('template_key', templateKey)
        .eq('language', language)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ [ConfigManager] Template non trouvé:', error);
        return null;
      }

      return {
        templateKey: templateData.template_key,
        content: templateData.template_content,
        variables: templateData.variables || [],
        language: templateData.language
      };
      
    } catch (error) {
      console.error('❌ [ConfigManager] Erreur getMessageTemplate:', error);
      return null;
    }
  }

  /**
   * Sauvegarder une nouvelle configuration
   * SOLID - Command Pattern : Action spécifique encapsulée
   */
  async saveConfig(config: RestaurantConfig): Promise<void> {
    console.log(`💾 [ConfigManager] Sauvegarde config: ${config.brandName}`);
    
    try {
      const dbData = this.mapConfigToDatabase(config);
      
      const { error } = await this.supabase
        .from('restaurant_bot_configs')
        .upsert(dbData, { 
          onConflict: 'restaurant_id,config_name' 
        });

      if (error) {
        console.error('❌ [ConfigManager] Erreur sauvegarde config:', error);
        throw error;
      }
      
      // Invalider cache
      this.invalidateCache(config.restaurantId);
      
      console.log(`✅ [ConfigManager] Config sauvegardée: ${config.brandName}`);
      
    } catch (error) {
      console.error('❌ [ConfigManager] Erreur saveConfig:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau workflow
   * SOLID - Factory Method : Création encapsulée
   */
  async createWorkflow(workflow: WorkflowDefinition): Promise<number> {
    console.log(`➕ [ConfigManager] Création workflow: ${workflow.name}`);
    
    try {
      const dbData = this.mapWorkflowToDatabase(workflow);
      
      const { data, error } = await this.supabase
        .from('workflow_definitions')
        .insert(dbData)
        .select('id')
        .single();

      if (error) {
        console.error('❌ [ConfigManager] Erreur création workflow:', error);
        throw error;
      }
      
      // Invalider cache workflows
      this.invalidateWorkflowCache(workflow.restaurantId);
      
      console.log(`✅ [ConfigManager] Workflow créé avec ID: ${data.id}`);
      return data.id;
      
    } catch (error) {
      console.error('❌ [ConfigManager] Erreur createWorkflow:', error);
      throw error;
    }
  }

  /**
   * Ajouter une étape à un workflow
   * SOLID - Composition : Construction par ajout d'éléments
   */
  async addWorkflowStep(workflowId: number, step: WorkflowStep): Promise<void> {
    console.log(`➕ [ConfigManager] Ajout étape workflow: ${step.title}`);
    
    try {
      const dbData = this.mapStepToDatabase({ ...step, workflowId });
      
      const { error } = await this.supabase
        .from('workflow_steps')
        .insert(dbData);

      if (error) {
        console.error('❌ [ConfigManager] Erreur ajout étape:', error);
        throw error;
      }
      
      console.log(`✅ [ConfigManager] Étape ajoutée: ${step.title}`);
      
    } catch (error) {
      console.error('❌ [ConfigManager] Erreur addWorkflowStep:', error);
      throw error;
    }
  }

  // ================================================
  // MÉTHODES PRIVÉES - GESTION CACHE
  // ================================================

  private getCachedConfig(restaurantId: number): RestaurantConfig | null {
    const cacheKey = `config_${restaurantId}`;
    const expiry = this.cacheExpiry.get(cacheKey);
    
    if (expiry && Date.now() < expiry) {
      return this.configCache.get(restaurantId) || null;
    }
    
    // Cache expiré
    this.configCache.delete(restaurantId);
    this.cacheExpiry.delete(cacheKey);
    return null;
  }

  private setCachedConfig(restaurantId: number, config: RestaurantConfig): void {
    const cacheKey = `config_${restaurantId}`;
    this.configCache.set(restaurantId, config);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
  }

  private getCachedWorkflows(restaurantId: number): WorkflowDefinition[] | null {
    const cacheKey = `workflows_${restaurantId}`;
    const expiry = this.cacheExpiry.get(cacheKey);
    
    if (expiry && Date.now() < expiry) {
      return this.workflowCache.get(restaurantId) || null;
    }
    
    // Cache expiré
    this.workflowCache.delete(restaurantId);
    this.cacheExpiry.delete(cacheKey);
    return null;
  }

  private setCachedWorkflows(restaurantId: number, workflows: WorkflowDefinition[]): void {
    const cacheKey = `workflows_${restaurantId}`;
    this.workflowCache.set(restaurantId, workflows);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
  }

  private invalidateCache(restaurantId: number): void {
    this.configCache.delete(restaurantId);
    this.cacheExpiry.delete(`config_${restaurantId}`);
  }

  private invalidateWorkflowCache(restaurantId: number): void {
    this.workflowCache.delete(restaurantId);
    this.cacheExpiry.delete(`workflows_${restaurantId}`);
  }

  // ================================================
  // MÉTHODES PRIVÉES - MAPPING DONNÉES
  // ================================================

  private mapDatabaseToConfig(dbRow: any): RestaurantConfig {
    return {
      id: dbRow.id,
      restaurantId: dbRow.restaurant_id,
      brandName: dbRow.brand_name,
      welcomeMessage: dbRow.welcome_message,
      availableWorkflows: dbRow.available_workflows || [],
      defaultWorkflow: dbRow.default_workflow || 'menu_browsing',
      features: dbRow.features || {},
      languages: dbRow.languages || ['fr'],
      currency: dbRow.currency || 'EUR',
      timezone: dbRow.timezone || 'Europe/Paris'
    };
  }

  private mapConfigToDatabase(config: RestaurantConfig): Record<string, any> {
    return {
      restaurant_id: config.restaurantId,
      config_name: 'main',
      brand_name: config.brandName,
      welcome_message: config.welcomeMessage,
      available_workflows: config.availableWorkflows,
      default_workflow: config.defaultWorkflow,
      features: config.features,
      languages: config.languages,
      currency: config.currency,
      timezone: config.timezone,
      updated_at: new Date().toISOString()
    };
  }

  private mapDatabaseToWorkflow(dbRow: any): WorkflowDefinition {
    return {
      id: dbRow.id,
      restaurantId: dbRow.restaurant_id,
      workflowId: dbRow.workflow_id,
      name: dbRow.name,
      description: dbRow.description,
      triggerConditions: dbRow.trigger_conditions || [],
      steps: dbRow.steps || [],
      maxDurationMinutes: dbRow.max_duration_minutes || 30,
      isActive: dbRow.is_active
    };
  }

  private mapWorkflowToDatabase(workflow: WorkflowDefinition): Record<string, any> {
    return {
      restaurant_id: workflow.restaurantId,
      workflow_id: workflow.workflowId,
      name: workflow.name,
      description: workflow.description,
      trigger_conditions: workflow.triggerConditions,
      steps: workflow.steps,
      max_duration_minutes: workflow.maxDurationMinutes,
      is_active: workflow.isActive,
      updated_at: new Date().toISOString()
    };
  }

  private mapDatabaseToStep(dbRow: any): WorkflowStep {
    return {
      id: dbRow.id,
      workflowId: dbRow.workflow_id,
      stepId: dbRow.step_id,
      stepOrder: dbRow.step_order,
      stepType: dbRow.step_type,
      title: dbRow.title,
      description: dbRow.description,
      selectionConfig: dbRow.selection_config || {},
      validationRules: dbRow.validation_rules || [],
      displayConfig: dbRow.display_config || {},
      nextStepLogic: dbRow.next_step_logic,
      errorHandling: dbRow.error_handling || { maxRetries: 3, retryMessage: 'Choix invalide, retapez votre choix.' }
    };
  }

  private mapStepToDatabase(step: WorkflowStep): Record<string, any> {
    return {
      workflow_id: step.workflowId,
      step_id: step.stepId,
      step_order: step.stepOrder,
      step_type: step.stepType,
      title: step.title,
      description: step.description,
      selection_config: step.selectionConfig,
      validation_rules: step.validationRules,
      display_config: step.displayConfig,
      next_step_logic: step.nextStepLogic,
      error_handling: step.errorHandling,
      is_active: true,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Configuration par défaut si aucune trouvée
   * SOLID - Default Object Pattern : Objet par défaut sûr
   */
  private async getDefaultConfig(restaurantId: number): Promise<RestaurantConfig> {
    console.log(`🔧 [ConfigManager] Utilisation config par défaut pour restaurant: ${restaurantId}`);

    // 💰 Récupérer la vraie devise depuis france_restaurants
    let restaurantCurrency = 'EUR';
    let restaurantName = 'Restaurant Bot';

    try {
      const { data: restaurant } = await this.supabase
        .from('france_restaurants')
        .select('currency, name')
        .eq('id', restaurantId)
        .single();

      if (restaurant) {
        restaurantCurrency = restaurant.currency || 'EUR';
        restaurantName = restaurant.name || 'Restaurant Bot';
        console.log(`💰 [ConfigManager] Devise récupérée: ${restaurantCurrency} pour ${restaurantName}`);
      }
    } catch (error) {
      console.error(`❌ [ConfigManager] Erreur récupération devise:`, error);
    }

    return {
      id: 0,
      restaurantId,
      brandName: restaurantName,
      welcomeMessage: 'Bienvenue ! Choisissez votre commande.',
      availableWorkflows: ['MENU_1_WORKFLOW', 'MENU_2_WORKFLOW', 'MENU_3_WORKFLOW', 'MENU_4_WORKFLOW'],
      defaultWorkflow: 'menu_browsing',
      features: {
        cartEnabled: true,
        deliveryEnabled: true,
        paymentDeferred: true,
        locationDetection: true
      },
      languages: ['fr'],
      currency: restaurantCurrency,
      timezone: 'Europe/Paris'
    };
  }
}