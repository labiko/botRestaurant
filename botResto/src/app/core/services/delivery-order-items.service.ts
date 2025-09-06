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
    console.log('🔍 [DeliveryOrderItems] hasOrderItems - Order:', order.order_number || order.id);
    console.log('🔍 [DeliveryOrderItems] hasOrderItems - Items:', order.items);
    console.log('🔍 [DeliveryOrderItems] hasOrderItems - Items type:', typeof order.items);
    
    if (!order.items) {
      console.log('❌ [DeliveryOrderItems] hasOrderItems - No items found');
      return false;
    }
    
    // Les items peuvent être une string JSON ou un objet
    if (typeof order.items === 'string') {
      console.log('🔍 [DeliveryOrderItems] hasOrderItems - Items is string, parsing...');
      try {
        const parsedItems = JSON.parse(order.items);
        console.log('🔍 [DeliveryOrderItems] hasOrderItems - Parsed items:', parsedItems);
        const hasItems = parsedItems && Object.keys(parsedItems).length > 0;
        console.log('✅ [DeliveryOrderItems] hasOrderItems - String result:', hasItems);
        return hasItems;
      } catch (error) {
        console.error(`❌ [DeliveryOrderItems] Erreur parsing items string:`, error);
        return false;
      }
    }
    
    // Si c'est déjà un objet
    console.log('🔍 [DeliveryOrderItems] hasOrderItems - Items is object, checking keys...');
    console.log('🔍 [DeliveryOrderItems] hasOrderItems - Object keys:', Object.keys(order.items));
    
    // Vérifier si au moins une entrée a des données valides
    const hasValidItems = Object.values(order.items).some((value: any) => {
      // Format restaurant (avec .item)
      if (value && value.item) return true;
      // Format livreur (objet direct avec productId)
      if (value && typeof value === 'object' && value.productId) return true;
      return false;
    });
    
    console.log('✅ [DeliveryOrderItems] hasOrderItems - Has valid items:', hasValidItems);
    return hasValidItems;
  }

  /**
   * Parse et retourne les items d'une commande
   * COPIÉ EXACTEMENT de history.page.ts (lignes 286-321)
   */
  getOrderItems(order: DeliveryOrder): any[] {
    console.log('🔍 [DeliveryOrderItems] getOrderItems - Order:', order.order_number || order.id);
    console.log('🔍 [DeliveryOrderItems] getOrderItems - Raw items:', order.items);
    
    if (!order.items) {
      console.log('❌ [DeliveryOrderItems] getOrderItems - No items, returning empty array');
      return [];
    }
    
    try {
      let itemsData = order.items;
      
      // Parser si c'est une string JSON
      if (typeof order.items === 'string') {
        console.log('🔍 [DeliveryOrderItems] getOrderItems - Parsing JSON string...');
        itemsData = JSON.parse(order.items);
        console.log('🔍 [DeliveryOrderItems] getOrderItems - Parsed data:', itemsData);
      }
      
      // Les items sont dans un format objet avec des clés comme "item_2_..."
      const itemsArray: any[] = [];
      console.log('🔍 [DeliveryOrderItems] getOrderItems - Processing items data...');
      
      if (itemsData && typeof itemsData === 'object') {
        console.log('🔍 [DeliveryOrderItems] itemsData object entries:', Object.entries(itemsData));
        console.log('🔍 [DeliveryOrderItems] itemsData keys:', Object.keys(itemsData));
        console.log('🔍 [DeliveryOrderItems] itemsData structure:', JSON.stringify(itemsData, null, 2));
        
        Object.entries(itemsData).forEach(([key, value]: [string, any]) => {
          console.log(`🔍 [DeliveryOrderItems] Processing key: ${key}, value:`, value);
          console.log(`🔍 [DeliveryOrderItems] Value type: ${typeof value}`);
          
          let processedItem: any = null;
          
          // Format restaurant (avec propriété .item)
          if (value && value.item) {
            console.log(`✅ [DeliveryOrderItems] Format restaurant - Found item in key ${key}:`, value.item);
            processedItem = {
              ...value.item,
              quantity: value.quantity || 1,
              key: key
            };
          } 
          // Format livreur (objet direct)
          else if (value && typeof value === 'object' && value.productId) {
            console.log(`✅ [DeliveryOrderItems] Format livreur - Direct item in key ${key}:`, value);
            processedItem = {
              ...value,
              key: key
            };
          } else {
            console.log(`❌ [DeliveryOrderItems] Unknown format for key ${key}, value structure:`, value);
          }
          
          if (processedItem) {
            itemsArray.push(processedItem);
          }
        });
      } else {
        console.log('❌ [DeliveryOrderItems] itemsData is not a valid object:', itemsData);
      }
      
      console.log('✅ [DeliveryOrderItems] getOrderItems - Final items array:', itemsArray);
      console.log('✅ [DeliveryOrderItems] getOrderItems - Items count:', itemsArray.length);
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