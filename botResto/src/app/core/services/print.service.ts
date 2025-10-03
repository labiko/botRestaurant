import { Injectable } from '@angular/core';
import { UniversalOrderDisplayService, FormattedItem } from './universal-order-display.service';

@Injectable({ providedIn: 'root' })
export class PrintService {
  private autoPrintEnabled = false;

  constructor(
    private universalOrderDisplayService: UniversalOrderDisplayService
  ) {
    // Charger la configuration depuis localStorage
    const saved = localStorage.getItem('autoPrintEnabled');
    this.autoPrintEnabled = saved === 'true';
  }

  setAutoPrintEnabled(enabled: boolean): void {
    this.autoPrintEnabled = enabled;
    localStorage.setItem('autoPrintEnabled', enabled.toString());
  }

  getAutoPrintEnabled(): boolean {
    return this.autoPrintEnabled;
  }

  async printOrderAsync(orderData: any): Promise<void> {
    console.log('🔍 PrintService.printOrderAsync appelé');
    console.log('🔍 autoPrintEnabled:', this.autoPrintEnabled);
    console.log('🔍 orderData COMPLET:', orderData);
    console.log('🔍 delivery_mode:', orderData.delivery_mode);
    console.log('🔍 delivery_address:', orderData.delivery_address);
    console.log('🔍 delivery_latitude:', orderData.delivery_latitude);
    console.log('🔍 delivery_longitude:', orderData.delivery_longitude);

    // Exécution asynchrone sans bloquer l'UI
    setTimeout(() => {
      if (this.autoPrintEnabled) {
        console.log('✅ Impression déclenchée !');
        this.generateAndPrint(orderData);
      } else {
        console.log('⚠️ Impression désactivée - Activez le toggle dans Paramètres');
      }
    }, 0);
  }

  private generateAndPrint(orderData: any): void {
    // Génération du ticket
    const ticket = this.formatTicket(orderData);

    // Mode simulation (pour l'instant)
    console.log('🖨️ IMPRESSION TICKET:');
    console.log(ticket);

    // Plus tard: envoi Bluetooth à l'imprimante
  }

  private formatTicket(order: any): string {
    // Utiliser le service universel pour parser les items
    let articlesText = 'Aucun article';

    if (order.items && Array.isArray(order.items)) {
      // Parser les items avec le service universel
      const formattedItems: FormattedItem[] = this.universalOrderDisplayService.formatOrderItems(order.items);

      // Formatter chaque item pour le ticket
      articlesText = formattedItems.map((item: FormattedItem) => {
        let itemLine = `- ${item.quantity}x ${item.productName}: ${item.totalPrice.toFixed(2)}€`;

        // Ajouter la taille si présente
        if (item.sizeInfo) {
          itemLine += ` (${item.sizeInfo})`;
        }

        // Ajouter la configuration inline si présente
        if (item.inlineConfiguration && item.inlineConfiguration.length > 0) {
          itemLine += `\n  → ${item.inlineConfiguration.join(', ')}`;
        }

        // Ajouter les items supplémentaires (pour les menus)
        if (item.additionalItems && item.additionalItems.length > 0) {
          item.additionalItems.forEach(addItem => {
            itemLine += `\n  + ${addItem}`;
          });
        }

        // Ajouter les items expandés (pour les menus pizza)
        if (item.expandedItems && item.expandedItems.length > 0) {
          item.expandedItems.forEach(expItem => {
            itemLine += `\n  • ${expItem}`;
          });
        }

        return itemLine;
      }).join('\n\n');
    }

    // Formatter le mode de livraison
    const deliveryModeMap: { [key: string]: string } = {
      'sur_place': 'Sur place',
      'a_emporter': 'À emporter',
      'livraison': 'Livraison'
    };
    const deliveryModeText = deliveryModeMap[order.delivery_mode] || order.delivery_mode || 'Non spécifié';

    // Formater l'adresse ou les coordonnées GPS
    let addressText = '';
    if (order.delivery_mode === 'livraison') {
      if (order.delivery_address && order.delivery_address.trim() !== '') {
        // Cas 1: Adresse texte (peut aussi contenir "Position GPS:")
        addressText = `\nAdresse: ${order.delivery_address}`;
      } else if (order.delivery_latitude && order.delivery_longitude) {
        // Cas 2: Coordonnées GPS numériques
        const lat = typeof order.delivery_latitude === 'string'
          ? parseFloat(order.delivery_latitude)
          : order.delivery_latitude;
        const lon = typeof order.delivery_longitude === 'string'
          ? parseFloat(order.delivery_longitude)
          : order.delivery_longitude;
        addressText = `\n📍 GPS: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      } else if (order.delivery_address_coordinates?.latitude && order.delivery_address_coordinates?.longitude) {
        // Cas 3: Coordonnées dans un objet imbriqué
        const lat = typeof order.delivery_address_coordinates.latitude === 'string'
          ? parseFloat(order.delivery_address_coordinates.latitude)
          : order.delivery_address_coordinates.latitude;
        const lon = typeof order.delivery_address_coordinates.longitude === 'string'
          ? parseFloat(order.delivery_address_coordinates.longitude)
          : order.delivery_address_coordinates.longitude;
        addressText = `\n📍 GPS: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      }
    }

    return `
============================
     ${order.restaurant_name || 'RESTAURANT'}
============================
Commande #${order.order_number || order.id}
${new Date().toLocaleString('fr-FR')}

CLIENT: ${order.customer_name || 'Non spécifié'}
TEL: ${order.customer_phone || 'Non spécifié'}${addressText}

COMMANDE:
${articlesText}

----------------------------
TOTAL: ${(order.total_amount || 0).toFixed(2)}€
Mode: ${deliveryModeText}
${order.notes ? `Notes: ${order.notes}` : ''}
============================
`;
  }
}