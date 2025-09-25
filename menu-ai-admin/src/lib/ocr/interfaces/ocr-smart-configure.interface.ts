// Interfaces pour ÉTAPE 2 : Smart Configure avec intégration Workflow V2
import { ExtractedProduct } from './ocr-provider.interface';
import { WorkflowStep, OptionItem } from '@/lib/workflow-generator-v2';

export interface WorkflowSuggestion {
  productType: 'simple' | 'modular' | 'variant' | 'composite';
  confidence: number; // 0-1
  steps: WorkflowStep[];
  optionGroups: Record<string, OptionItem[]>;
  reasoning: string;
}

export interface CategoryMapping {
  originalCategory?: string;
  suggestedCategoryId: number;
  suggestedCategoryName: string;
  confidence: number; // 0-1
  icon: string;
}

export interface RestaurantTemplate {
  sourceSlug: string;
  sourceName: string;
  categories: CategoryTemplateItem[];
  baseConfig: RestaurantConfigTemplate;
}

export interface CategoryTemplateItem {
  id: number;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
}

export interface RestaurantConfigTemplate {
  delivery_zone_km: number;
  min_order_amount: number;
  delivery_fee: number;
  business_hours: any;
}

export interface OCRSmartConfigure {
  extractedProducts: ExtractedProduct[];
  workflowSuggestions: WorkflowSuggestion[];
  categoryMappings: CategoryMapping[];
  restaurantTemplate: RestaurantTemplate;
  newRestaurantData: {
    name: string;
    slug: string;
    whatsapp_number: string;
    address?: string;
    city?: string;
    phone?: string;
  };
}

export interface ProductAnalysisResult {
  product: ExtractedProduct;
  detectedType: 'simple' | 'modular' | 'variant' | 'composite';
  workflowSuggestion: WorkflowSuggestion;
  categoryMapping: CategoryMapping;
  pricingSuggestion: {
    onSitePrice: number;
    deliveryPrice: number; // +1€ automatique
    confidence: number;
  };
}