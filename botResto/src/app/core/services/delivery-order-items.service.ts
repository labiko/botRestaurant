import { Injectable } from '@angular/core';
import { DeliveryOrder } from './delivery-orders.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryOrderItemsService {

  constructor() { }

  /**
   * Vérifie si une commande a des items
   * COPIÉ EXACTEMENT de history.page.ts (lignes 264-284)
   */
  hasOrderItems(order: DeliveryOrder): boolean {
    if (!order.items) {
      return false;
    }
    
    // Les items peuvent être une string JSON ou un objet
    if (typeof order.items === 'string') {
      try {
        const parsedItems = JSON.parse(order.items);
        const hasItems = parsedItems && Object.keys(parsedItems).length > 0;
        return hasItems;
      } catch (error) {
        console.error(`❌ [DeliveryOrderItems] Erreur parsing items string:`, error);
        return false;
      }
    }
    
    // Si c'est déjà un objet
    const hasItems = order.items && Object.keys(order.items).length > 0;
    return hasItems;
  }

  /**
   * Parse et retourne les items d'une commande
   * COPIÉ EXACTEMENT de history.page.ts (lignes 286-321)
   */
  getOrderItems(order: DeliveryOrder): any[] {
    if (!order.items) {
      return [];
    }
    
    try {
      let itemsData = order.items;
      
      // Parser si c'est une string JSON
      if (typeof order.items === 'string') {
        itemsData = JSON.parse(order.items);
      }
      
      // Les items sont dans un format objet avec des clés comme "item_2_..."
      const itemsArray: any[] = [];
      
      if (itemsData && typeof itemsData === 'object') {
        Object.entries(itemsData).forEach(([key, value]: [string, any]) => {
          // Extraire les données de l'item
          if (value && value.item) {
            const processedItem = {
              ...value.item,
              quantity: value.quantity || 1,
              key: key
            };
            itemsArray.push(processedItem);
          }
        });
      }
      
      return itemsArray;
    } catch (error) {
      console.error(`❌ [DeliveryOrderItems] Erreur parsing items:`, error);
      return [];
    }
  }

  /**
   * Vérifie si des options sont sélectionnées
   * COPIÉ EXACTEMENT de history.page.ts (lignes 323-333)
   */
  hasSelectedOptions(selectedOptions: any): boolean {
    if (!selectedOptions) return false;
    if (typeof selectedOptions === 'string') {
      try {
        selectedOptions = JSON.parse(selectedOptions);
      } catch {
        return false;
      }
    }
    return selectedOptions && Object.keys(selectedOptions).length > 0;
  }

  /**
   * Retourne les groupes d'options sélectionnées
   * COPIÉ EXACTEMENT de history.page.ts (lignes 335-350)
   */
  getSelectedOptionsGroups(selectedOptions: any): any[] {
    if (!this.hasSelectedOptions(selectedOptions)) return [];
    
    if (typeof selectedOptions === 'string') {
      try {
        selectedOptions = JSON.parse(selectedOptions);
      } catch {
        return [];
      }
    }

    return Object.entries(selectedOptions).map(([groupName, options]) => ({
      groupName,
      options: Array.isArray(options) ? options : [options]
    }));
  }

  /**
   * Formate le nom d'un groupe d'options
   * COPIÉ EXACTEMENT de history.page.ts (lignes 352-361)
   */
  formatOptionGroupName(groupName: string): string {
    const mapping: Record<string, string> = {
      'sauces': 'Sauces',
      'viandes': 'Viandes', 
      'legumes': 'Légumes',
      'fromages': 'Fromages',
      'boissons': 'Boissons'
    };
    return mapping[groupName] || groupName;
  }

  /**
   * Vérifie si l'heure de mise à jour doit être affichée
   * COPIÉ EXACTEMENT de history.page.ts (lignes 363-369)
   */
  shouldShowUpdateTime(order: DeliveryOrder): boolean {
    if (!order.updated_at) return false;
    const updatedTime = new Date(order.updated_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - updatedTime.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }

  /**
   * Retourne le texte de l'heure de mise à jour
   * COPIÉ EXACTEMENT de history.page.ts (lignes 371-380)
   */
  getUpdateTimeText(order: DeliveryOrder): string {
    if (!order.updated_at) return '';
    const updatedTime = new Date(order.updated_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - updatedTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes === 1) return 'Il y a 1 minute';
    return `Il y a ${diffMinutes} minutes`;
  }

}