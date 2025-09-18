// 🎯 TYPES POUR MENU AI ADMIN
// ===============================

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
  category_name?: string;
  restaurant_name?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
  restaurant_id: number;
  restaurant_name?: string;
}

export interface ModificationCommand {
  type: 'DUPLICATE' | 'ADD_TO_CATEGORY' | 'MODIFY_EXISTING' | 'ADD_CATEGORY';
  command: string;
  restaurantId: number;
}

export interface AIResponse {
  success: boolean;
  sql?: string;
  explanation?: string;
  preview?: {
    action: string;
    sourceProduct?: Product;
    newProduct?: Partial<Product>;
    category?: Category;
  };
  error?: string;
  confidence: number;
}