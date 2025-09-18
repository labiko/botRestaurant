// 🎯 TYPES POUR LE SYSTÈME D'AUTOMATISATION MENU
// ===================================================

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  business_hours: any;
  delivery_fee: number;
  min_order_amount: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
  restaurant_id: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  product_type: 'simple' | 'composite' | 'modular';
  price_on_site_base: number;
  price_delivery_base: number;
  workflow_type?: string;
  requires_steps: boolean;
  steps_config?: any;
  composition?: string;
  display_order: number;
  category_id: number;
  restaurant_id: number;
}

export interface CompositeItem {
  id: number;
  composite_product_id: number;
  component_name: string;
  quantity: number;
  unit: string;
}

export interface TemplateData {
  restaurants: Restaurant[];
  categories: Category[];
  products: Product[];
  composite_items: CompositeItem[];
  product_options?: any[];
  product_sizes?: any[];
  product_variants?: any[];
}

export interface ModificationCommand {
  type: 'DUPLICATE' | 'ADD_TO_CATEGORY' | 'MODIFY_EXISTING' | 'ADD_CATEGORY';
  target: string;
  parameters: {
    newName?: string;
    newPrice?: number;
    categoryName?: string;
    modifications?: Record<string, any>;
  };
  restaurantId: number;
}

export interface AIResponse {
  success: boolean;
  sql?: string;
  explanation?: string;
  error?: string;
  confidence: number;
}