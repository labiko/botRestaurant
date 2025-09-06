// 🏛️ INTERFACES ET TYPES - BOT UNIVERSEL
// Architecture SOLID : Contrats clairs et séparation des responsabilités

// ================================================
// 1. INTERFACES CORE (SOLID - Interface Segregation)
// ================================================

/** Interface pour la gestion des messages */
export interface IMessageHandler {
  handleMessage(phoneNumber: string, message: string): Promise<void>;
}

/** Interface pour la gestion des sessions */
export interface ISessionManager {
  getSession(phoneNumber: string): Promise<BotSession>;
  updateSession(sessionId: string, updates: Partial<BotSession>): Promise<void>;
  clearSession(phoneNumber: string): Promise<void>;
}

/** Interface pour la gestion des configurations restaurant */
export interface IRestaurantConfigManager {
  getConfig(restaurantId: number): Promise<RestaurantConfig>;
  getWorkflows(restaurantId: number): Promise<WorkflowDefinition[]>;
  getWorkflowSteps(workflowId: number): Promise<WorkflowStep[]>;
}

/** Interface pour l'exécution des workflows */
export interface IWorkflowExecutor {
  executeStep(step: WorkflowStep, context: WorkflowContext): Promise<StepResult>;
  validateInput(input: string, step: WorkflowStep): Promise<ValidationResult>;
  buildNextStep(currentStep: WorkflowStep, result: StepResult): Promise<WorkflowStep | null>;
}

/** Interface pour les requêtes produits */
export interface IProductQueryService {
  queryProducts(config: ProductQueryConfig): Promise<Product[]>;
  getProductsByCategory(restaurantId: number, category: string): Promise<Product[]>;
  getProductById(productId: number): Promise<Product | null>;
}

/** Interface pour l'envoi de messages */
export interface IMessageSender {
  sendMessage(phoneNumber: string, content: string): Promise<void>;
  sendFormattedMessage(phoneNumber: string, template: MessageTemplate, variables: Record<string, any>): Promise<void>;
}

// ================================================
// 2. TYPES DE DONNÉES CORE
// ================================================

/** Configuration complète d'un restaurant */
export interface RestaurantConfig {
  id: number;
  restaurantId: number;
  brandName: string;
  welcomeMessage: string;
  availableWorkflows: string[];
  defaultWorkflow: string;
  features: RestaurantFeatures;
  languages: string[];
  currency: string;
  timezone: string;
}

/** Features activées par restaurant */
export interface RestaurantFeatures {
  cartEnabled: boolean;
  deliveryEnabled: boolean;
  paymentDeferred: boolean;
  locationDetection: boolean;
  multiLanguage?: boolean;
  loyaltyProgram?: boolean;
}

/** Définition d'un workflow */
export interface WorkflowDefinition {
  id: number;
  restaurantId: number;
  workflowId: string;
  name: string;
  description?: string;
  triggerConditions: TriggerCondition[];
  steps: string[]; // IDs des étapes
  maxDurationMinutes: number;
  isActive: boolean;
}

/** Étape de workflow */
export interface WorkflowStep {
  id: number;
  workflowId: number;
  stepId: string;
  stepOrder: number;
  stepType: StepType;
  title: string;
  description?: string;
  selectionConfig: SelectionConfig;
  validationRules: ValidationRule[];
  displayConfig: DisplayConfig;
  nextStepLogic?: NextStepLogic;
  errorHandling: ErrorHandling;
}

/** Types d'étapes possibles */
export type StepType = 
  | 'PRODUCT_SELECTION'
  | 'QUANTITY_INPUT' 
  | 'MULTIPLE_CHOICE'
  | 'TEXT_INPUT'
  | 'VALIDATION'
  | 'SUMMARY';

/** Configuration de sélection pour une étape */
export interface SelectionConfig {
  selectionType: 'SINGLE' | 'MULTIPLE';
  minSelections: number;
  maxSelections: number;
  productQuery?: ProductQueryConfig;
  options?: SelectionOption[];
  allowCustomInput?: boolean;
}

/** Configuration de requête produit */
export interface ProductQueryConfig {
  table: string; // 'france_products', 'france_product_variants'
  joins?: string[];
  filters: Record<string, any>;
  orderBy?: string;
  limit?: number;
}

/** Configuration d'affichage */
export interface DisplayConfig {
  format: 'LIST' | 'GRID' | 'CAROUSEL';
  showPrices: boolean;
  showDescriptions: boolean;
  showImages?: boolean;
  itemsPerPage: number;
  customTemplate?: string;
}

/** Règle de validation */
export interface ValidationRule {
  type: 'REQUIRED' | 'MIN_LENGTH' | 'MAX_LENGTH' | 'REGEX' | 'CUSTOM';
  value?: any;
  errorMessage: string;
  customValidator?: string; // Nom de fonction personnalisée
}

/** Logique pour étape suivante */
export interface NextStepLogic {
  conditions: StepCondition[];
  defaultNextStep?: string;
}

/** Condition pour passer à l'étape suivante */
export interface StepCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;
  nextStep: string;
}

/** Gestion des erreurs */
export interface ErrorHandling {
  maxRetries: number;
  retryMessage: string;
  escalationStep?: string; // Étape de fallback
}

// ================================================
// 3. TYPES CONTEXTE ET SESSION
// ================================================

/** Session enrichie du bot */
export interface BotSession {
  id: string;
  phoneNumber: string;
  restaurantId: number;
  botState: BotState;
  sessionData?: Record<string, any>; // AJOUT: Données de session flexibles (categories, deliveryMode, etc.)
  currentWorkflowId?: string;
  workflowStepId?: string;
  workflowData: WorkflowData;
  cart: CartItem[];
  totalAmount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** État du bot */
export interface BotState {
  mode: BotMode;
  lastInteraction: Date;
  language: string;
  context: Record<string, any>;
}

export type BotMode = 
  | 'menu_browsing'
  | 'workflow_active'
  | 'cart_management'
  | 'checkout_process';

/** Données du workflow en cours */
export interface WorkflowData {
  workflowId: string;
  currentStepId: string;
  stepHistory: string[];
  selectedItems: Record<string, any>;
  validationErrors: ValidationError[];
  completedAt?: Date;
}

/** Contexte d'exécution de workflow */
export interface WorkflowContext {
  session: BotSession;
  currentStep: WorkflowStep;
  userInput: string;
  previousResults: StepResult[];
}

// ================================================
// 4. TYPES RÉSULTATS ET RÉPONSES
// ================================================

/** Résultat d'exécution d'étape */
export interface StepResult {
  success: boolean;
  data?: any;
  errors?: ValidationError[];
  nextStepId?: string;
  message?: string;
  shouldUpdateSession: boolean;
}

/** Résultat de validation */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  transformedValue?: any;
}

/** Erreur de validation */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

// ================================================
// 5. TYPES PRODUITS ET BUSINESS
// ================================================

/** Produit unifié */
export interface Product {
  id: number;
  restaurantId: number;
  name: string;
  description?: string;
  composition?: string;
  basePrice: number;
  deliveryPrice?: number;
  category: string;
  isActive: boolean;
  metadata: Record<string, any>;
}

/** Item dans le panier */
export interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options: CartItemOption[];
  metadata: Record<string, any>;
}

/** Option d'item panier */
export interface CartItemOption {
  optionId: string;
  name: string;
  value: string;
  priceModifier: number;
}

/** Template de message */
export interface MessageTemplate {
  templateKey: string;
  content: string;
  variables: string[];
  language: string;
}

// ================================================
// 6. TYPES CONFIGURATION
// ================================================

/** Option de sélection */
export interface SelectionOption {
  id: string;
  label: string;
  value: any;
  isDefault?: boolean;
}

/** Condition de déclenchement */
export interface TriggerCondition {
  type: 'MESSAGE_PATTERN' | 'MENU_SELECTION' | 'CART_STATE' | 'USER_STATE';
  pattern?: string;
  conditions: Record<string, any>;
}

// ================================================
// 7. TYPES UTILITAIRES
// ================================================

/** Réponse API standardisée */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: Record<string, any>;
}