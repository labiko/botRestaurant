import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFranceService } from '../../../core/services/supabase-france.service';

export interface WorkflowDefinition {
  id: number;
  restaurant_id: number;
  workflow_id: string;
  name: string;
  description?: string;
  trigger_conditions: TriggerCondition[];
  steps: string[];
  max_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: number;
  workflow_id: number;
  step_id: string;
  step_order: number;
  step_type: StepType;
  title: string;
  description?: string;
  selection_config: SelectionConfig;
  validation_rules: ValidationRule[];
  display_config: DisplayConfig;
  next_step_logic: NextStepLogic;
  error_handling: ErrorHandling;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type StepType = 
  | 'PRODUCT_SELECTION'
  | 'QUANTITY_INPUT' 
  | 'MULTIPLE_CHOICE'
  | 'TEXT_INPUT'
  | 'VALIDATION'
  | 'SUMMARY';

export interface SelectionConfig {
  selectionType: 'SINGLE' | 'MULTIPLE';
  minSelections: number;
  maxSelections: number;
  productQuery?: ProductQueryConfig;
  options?: SelectionOption[];
  allowCustomInput?: boolean;
}

export interface ProductQueryConfig {
  table: string;
  joins?: string[];
  filters: Record<string, any>;
  orderBy?: string;
  limit?: number;
}

export interface DisplayConfig {
  format: 'LIST' | 'GRID' | 'CAROUSEL';
  showPrices: boolean;
  showDescriptions: boolean;
  showImages?: boolean;
  itemsPerPage: number;
  customTemplate?: string;
}

export interface ValidationRule {
  type: 'REQUIRED' | 'MIN_LENGTH' | 'MAX_LENGTH' | 'REGEX' | 'CUSTOM';
  value?: any;
  errorMessage: string;
  customValidator?: string;
}

export interface NextStepLogic {
  conditions: StepCondition[];
  defaultNextStep?: string;
}

export interface StepCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;
  nextStep: string;
}

export interface ErrorHandling {
  maxRetries: number;
  retryMessage: string;
  escalationStep?: string;
}

export interface SelectionOption {
  id: string;
  label: string;
  value: any;
  isDefault?: boolean;
}

export interface TriggerCondition {
  type: 'MESSAGE_PATTERN' | 'MENU_SELECTION' | 'CART_STATE' | 'USER_STATE';
  pattern?: string;
  conditions: Record<string, any>;
}

export interface WorkflowTemplate {
  id: number;
  restaurant_id: number;
  template_name: string;
  description?: string;
  steps_config: any;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowConfigService {
  private supabase: SupabaseClient;

  constructor(private supabaseFranceService: SupabaseFranceService) {
    this.supabase = this.supabaseFranceService.client;
  }

  /**
   * Récupère toutes les définitions de workflow d'un restaurant
   */
  getWorkflowDefinitions(restaurantId: number): Observable<WorkflowDefinition[]> {
    return from(
      this.supabase
        .from('workflow_definitions')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('name')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkflowDefinition[];
      })
    );
  }

  /**
   * Récupère les étapes d'un workflow
   */
  getWorkflowSteps(workflowId: number): Observable<WorkflowStep[]> {
    return from(
      this.supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_order')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkflowStep[];
      })
    );
  }

  /**
   * Récupère les templates de workflow disponibles
   */
  getWorkflowTemplates(restaurantId: number): Observable<WorkflowTemplate[]> {
    return from(
      this.supabase
        .from('france_workflow_templates')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('template_name')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkflowTemplate[];
      })
    );
  }

  /**
   * Crée une nouvelle définition de workflow
   */
  createWorkflowDefinition(workflow: Omit<WorkflowDefinition, 'id' | 'created_at' | 'updated_at'>): Observable<WorkflowDefinition> {
    return from(
      this.supabase
        .from('workflow_definitions')
        .insert(workflow)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkflowDefinition;
      })
    );
  }

  /**
   * Met à jour une définition de workflow
   */
  updateWorkflowDefinition(workflowId: number, updates: Partial<WorkflowDefinition>): Observable<void> {
    return from(
      this.supabase
        .from('workflow_definitions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour le statut d'activité d'un workflow
   */
  updateWorkflowStatus(workflowId: number, isActive: boolean): Observable<void> {
    return from(
      this.supabase
        .from('workflow_definitions')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Crée une nouvelle étape de workflow
   */
  createWorkflowStep(step: Omit<WorkflowStep, 'id' | 'created_at' | 'updated_at'>): Observable<WorkflowStep> {
    return from(
      this.supabase
        .from('workflow_steps')
        .insert(step)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkflowStep;
      })
    );
  }

  /**
   * Met à jour une étape de workflow
   */
  updateWorkflowStep(stepId: number, updates: Partial<WorkflowStep>): Observable<void> {
    return from(
      this.supabase
        .from('workflow_steps')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', stepId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Supprime une définition de workflow et ses étapes
   */
  deleteWorkflowDefinition(workflowId: number): Observable<void> {
    return from(
      this.supabase.rpc('delete_workflow_with_steps', {
        workflow_id: workflowId
      })
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Réordonne les étapes d'un workflow
   */
  reorderWorkflowSteps(workflowId: number, stepOrders: { stepId: number, order: number }[]): Observable<void> {
    const updates = stepOrders.map(({ stepId, order }) =>
      this.supabase
        .from('workflow_steps')
        .update({ step_order: order })
        .eq('id', stepId)
    );

    return from(Promise.all(updates)).pipe(
      map(() => {
        // Pas de retour nécessaire
      })
    );
  }

  /**
   * Clone un workflow existant
   */
  cloneWorkflow(workflowId: number, newName: string): Observable<WorkflowDefinition> {
    return from(
      this.supabase.rpc('clone_workflow', {
        source_workflow_id: workflowId,
        new_workflow_name: newName
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkflowDefinition;
      })
    );
  }

  /**
   * Valide la configuration d'un workflow
   */
  validateWorkflowConfiguration(workflowId: number): Observable<{ isValid: boolean, errors: string[] }> {
    return from(
      this.supabase.rpc('validate_workflow_config', {
        workflow_id: workflowId
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as { isValid: boolean, errors: string[] };
      })
    );
  }

  /**
   * Récupère les workflows actifs pour un restaurant
   */
  getActiveWorkflows(restaurantId: number): Observable<WorkflowDefinition[]> {
    return from(
      this.supabase
        .from('workflow_definitions')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('name')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkflowDefinition[];
      })
    );
  }

  /**
   * Teste un workflow avec des données d'exemple
   */
  testWorkflow(workflowId: number, testData: any): Observable<{ success: boolean, result: any }> {
    return from(
      this.supabase.rpc('test_workflow_execution', {
        workflow_id: workflowId,
        test_data: testData
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as { success: boolean, result: any };
      })
    );
  }

  /**
   * Exporte la configuration d'un workflow
   */
  exportWorkflowConfig(workflowId: number): Observable<any> {
    return from(
      this.supabase.rpc('export_workflow_config', {
        workflow_id: workflowId
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      })
    );
  }

  /**
   * Importe une configuration de workflow
   */
  importWorkflowConfig(restaurantId: number, config: any): Observable<WorkflowDefinition> {
    return from(
      this.supabase.rpc('import_workflow_config', {
        restaurant_id: restaurantId,
        config: config
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkflowDefinition;
      })
    );
  }
}