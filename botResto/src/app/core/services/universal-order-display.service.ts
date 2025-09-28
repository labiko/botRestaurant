/**
 * Service universel d'affichage des commandes
 * Compatible avec tous les restaurants - Format EXACT de l'image rl1.png
 * Même logique que le bot WhatsApp pour la cohérence
 */

import { Injectable } from '@angular/core';

export interface FormattedItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sizeInfo?: string;
  formattedConfiguration: ConfigurationLine[];
  inlineConfiguration: string[];
  additionalItems?: string[];
  description?: string;
  expandedItems?: string[]; // Nouveau champ pour les pizzas détaillées du menu
}

export interface ConfigurationLine {
  category: string;
  value: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class UniversalOrderDisplayService {

  private loggedItems = new Set<string>(); // Éviter les logs répétés

  /**
   * Formater les items de commande universellement
   * RESPECTE LE FORMAT EXACT DE L'IMAGE rl1.png
   */
  formatOrderItems(items: any[]): FormattedItem[] {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    return items.map(item => {
      // Extension NonRégressive : Expansion des menu_pizza
      const expandedItems = this.expandMenuPizza(item);

      const formattedItem = {
        productName: this.getProductName(item),
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.price || 0,
        totalPrice: item.totalPrice || item.total_price || item.price || 0,
        sizeInfo: this.getSizeInfo(item),
        formattedConfiguration: this.formatConfiguration(item.configuration),
        inlineConfiguration: this.formatInlineConfiguration(item.configuration),
        additionalItems: this.formatAdditionalItems(item),
        description: item.productDescription || item.description,
        expandedItems: expandedItems // Nouveau champ pour les pizzas détaillées
      };


      return formattedItem;
    });
  }

  /**
   * Expansion spécialisée des menus pizza
   * Gère type:"menu_pizza" avec details.pizzas
   */
  private expandMenuPizza(item: any): string[] {
    // ÉTAPE 2: Extension progressive non-régressive
    if (item.type === 'menu_pizza' && item.details) {
      const result: string[] = [];

      // 1. PIZZAS (existant - garantie non-régression)
      if (item.details.pizzas && Array.isArray(item.details.pizzas)) {
        item.details.pizzas.forEach((pizza: any) => {
          const name = pizza.name || 'Pizza';
          const size = pizza.size ? ` (${pizza.size})` : '';
          result.push(`${name}${size}`);
        });
      }

      // 2. EXTENSION SÉCURISÉE: Ajouter boissons et accompagnements
      if (result.length > 0) { // Seulement si pizzas OK

        // Boissons (Array)
        if (item.details.beverages && Array.isArray(item.details.beverages)) {
          item.details.beverages.forEach((beverage: any) => {
            result.push(`${beverage.name || 'Boisson'}`);
          });
        }

        // Accompagnements (Object unique)
        if (item.details.sides && item.details.sides.name) {
          result.push(`${item.details.sides.name}`);
        }
      }

      return result;
    }

    // Retourner tableau vide pour les autres types
    return [];
  }

  /**
   * Extraire le nom du produit (universel)
   */
  private getProductName(item: any): string {
    // Priorité au nouveau format universel du bot
    const productName = item.productName || item.name || item.display_name || 'Produit';
    const categoryName = item.categoryName || '';
    const productIcon = item.icon || '';

    // Log unique par item pour éviter les boucles infinies
    const itemKey = `${item.productId || item.id || productName}_${categoryName}`;
    if (!this.loggedItems.has(itemKey)) {
      this.loggedItems.add(itemKey);
    }

    // Ajouter l'icône si elle existe et si elle n'est pas déjà dans le nom
    const nameWithIcon = productIcon && !productName.includes(productIcon)
      ? `${productIcon} ${productName}`
      : productName;

    return categoryName ? `${nameWithIcon} (${categoryName})` : nameWithIcon;
  }

  /**
   * Extraire l'info de taille (XL, M, L, etc.)
   */
  private getSizeInfo(item: any): string | undefined {
    if (item.configuration?.size && Array.isArray(item.configuration.size)) {
      const size = item.configuration.size[0];
      if (size?.size_name || size?.variant_name) {
        return size.size_name || size.variant_name;
      }
    }
    return item.size_name || undefined;
  }

  /**
   * Configuration inline (tags colorés sous le nom du produit)
   * FORMAT: "Merguez    Ketchup    Mayonnaise"
   */
  private formatInlineConfiguration(config: any): string[] {
    if (!config) return [];
    
    const inlineItems: string[] = [];
    
    // Récupérer les éléments principaux pour l'affichage inline
    Object.entries(config).forEach(([key, value]) => {
      if (this.isInlineCategory(key)) {
        const formatted = this.formatConfigValue(value);
        if (formatted && !this.shouldSkipValue(formatted)) {
          if (key === 'sauce') {
            // Pour les sauces, séparer en éléments individuels
            const sauces = formatted.split(', ');
            inlineItems.push(...sauces);
          } else {
            inlineItems.push(formatted);
          }
        }
      }
    });
    
    return inlineItems;
  }

  /**
   * Configuration détaillée avec icônes (format liste)
   * FORMAT: "▷ Sauce: Ketchup, Mayonnaise"
   */
  private formatConfiguration(config: any): ConfigurationLine[] {
    const lines: ConfigurationLine[] = [];
    
    if (!config) return lines;
    
    Object.entries(config).forEach(([key, value]) => {
      // Skip 'pizzas' pour éviter duplication avec expandMenuPizza
      if (key === 'pizzas') return;

      const formattedValue = this.formatConfigValue(value);
      if (formattedValue && !this.shouldSkipValue(formattedValue)) {
        lines.push({
          category: this.getCategoryLabel(key),
          value: formattedValue,
          icon: this.getCategoryIcon(key)
        });
      }
    });
    
    return lines;
  }

  /**
   * Elements additionnels (boissons, accompagnements)
   * FORMAT: "🧊 + ICE TEA 33CL"
   */
  private formatAdditionalItems(item: any): string[] {
    const additionalItems: string[] = [];

    // Gérer les boissons incluses
    if (item.selected_drink) {
      const drinkName = `${item.selected_drink.name} ${item.selected_drink.variant || ''}`.trim();
      additionalItems.push(`🧊 + ${drinkName}`);
    } else if (item.includes_drink) {
      additionalItems.push('🧊 + Boisson incluse');
    }

    // Gérer les accompagnements supplémentaires
    if (item.extras && Array.isArray(item.extras)) {
      item.extras.forEach((extra: any) => {
        const extraName = extra.name || extra.option_name || String(extra);
        additionalItems.push(`➕ ${extraName}`);
      });
    }

    return additionalItems;
  }

  /**
   * Formater une valeur de configuration (même logique que le bot)
   */
  private formatConfigValue(value: any): string {
    if (Array.isArray(value)) {
      return value.map(v => {
        // Gérer spécifiquement les objets size (avec size_name, variant_name)
        if (v.size_name || v.variant_name) {
          return v.size_name || v.variant_name;
        }
        // Gérer les options normales avec option_name ou name (format pizzas)
        return v.option_name || v.name || v;
      }).join(', ');
    }
    
    if (typeof value === 'object' && value !== null) {
      // Priorité aux propriétés spécifiques selon le type d'objet
      return value.size_name || value.variant_name || value.option_name ||
             value.label || value.name || value.text || value.title || value.value;
    }
    
    return String(value);
  }

  /**
   * Vérifier si une valeur doit être ignorée
   */
  private shouldSkipValue(value: any): boolean {
    const skipPatterns = ['pas de', 'sans', 'aucun', 'pas de suppléments'];
    const valueStr = String(value).toLowerCase();
    return skipPatterns.some(pattern => valueStr.includes(pattern));
  }

  /**
   * Déterminer si une catégorie doit être affichée en inline
   */
  private isInlineCategory(key: string): boolean {
    const inlineCategories = ['viande', 'sauce', 'garniture'];
    return inlineCategories.includes(key.toLowerCase());
  }

  /**
   * Obtenir le label d'affichage pour une catégorie
   */
  private getCategoryLabel(key: string): string {
    const categoryLabels: { [key: string]: string } = {
      'sauce': 'Sauce',
      'viande': 'Viande', 
      'garniture': 'Garniture',
      'extras': 'Extras',
      'extras_choice': 'Suppléments',
      'boisson': 'Boisson',
      'size': 'Taille',
      'base': 'Base',
      'accompagnement': 'Accompagnement'
    };
    
    return categoryLabels[key.toLowerCase()] || this.capitalizeFirst(key);
  }

  /**
   * Obtenir l'icône pour une catégorie
   */
  private getCategoryIcon(key: string): string {
    const categoryIcons: { [key: string]: string } = {
      'sauce': '▷',
      'viande': '▷',
      'garniture': '▷', 
      'extras': '▷',
      'extras_choice': '▷',
      'boisson': '🧊',
      'size': '📏',
      'base': '🍞',
      'accompagnement': '🍟'
    };
    
    return categoryIcons[key.toLowerCase()] || '▷';
  }

  /**
   * Capitaliser la première lettre
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Récupérer le nom WhatsApp depuis l'ID d'adresse
   */
  async getWhatsAppNameFromAddressId(addressId: number): Promise<string | null> {
    // Cette méthode devra être implémentée avec un service d'adresses
    // Pour l'instant, retourner null
    return null;
  }

  /**
   * Formater les informations enrichies de livraison
   */
  formatDeliveryInfo(order: any): any {
    return {
      ...order,
      hasValidationCode: !!order.delivery_validation_code,
      formattedValidationCode: order.delivery_validation_code,
      customerWhatsAppName: null // À implémenter
    };
  }
}