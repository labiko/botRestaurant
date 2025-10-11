import { Injectable } from '@angular/core';
import { UniversalOrderDisplayService, FormattedItem } from './universal-order-display.service';
import { SupabaseFranceService } from './supabase-france.service';
import { AuthFranceService } from '../../features/restaurant-france/auth-france/services/auth-france.service';

@Injectable({ providedIn: 'root' })
export class PrintService {
  private autoPrintEnabled = false;
  private restaurantId: number | null = null;

  constructor(
    private universalOrderDisplayService: UniversalOrderDisplayService,
    private supabaseFranceService: SupabaseFranceService,
    private authFranceService: AuthFranceService
  ) {
    // Charger l'ID du restaurant
    this.restaurantId = this.authFranceService.getCurrentRestaurantId();

    // Charger la configuration depuis la base de données
    this.loadAutoPrintConfig();
  }

  /**
   * Charger la configuration d'impression depuis la base de données
   */
  private async loadAutoPrintConfig(): Promise<void> {
    if (this.restaurantId === null) {
      console.warn('⚠️ PrintService: Impossible de charger la config - Restaurant ID non disponible');
      return;
    }

    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_restaurants')
        .select('auto_print_enabled')
        .eq('id', this.restaurantId)
        .single();

      if (error) {
        console.error('❌ PrintService: Erreur chargement config impression:', error);
        return;
      }

      if (data) {
        this.autoPrintEnabled = data.auto_print_enabled ?? true;
        console.log('✅ PrintService: Config impression chargée depuis BDD:', this.autoPrintEnabled);
      }
    } catch (error) {
      console.error('❌ PrintService: Exception lors du chargement:', error);
    }
  }

  /**
   * Activer/désactiver l'impression automatique (sauvegarde en base)
   */
  async setAutoPrintEnabled(enabled: boolean): Promise<void> {
    this.autoPrintEnabled = enabled;

    if (this.restaurantId === null) {
      console.warn('⚠️ PrintService: Impossible de sauvegarder - Restaurant ID non disponible');
      return;
    }

    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_restaurants')
        .update({ auto_print_enabled: enabled })
        .eq('id', this.restaurantId);

      if (error) {
        console.error('❌ PrintService: Erreur sauvegarde config impression:', error);
        throw error;
      }

      console.log('✅ PrintService: Config impression sauvegardée en BDD:', enabled);
    } catch (error) {
      console.error('❌ PrintService: Exception lors de la sauvegarde:', error);
      throw error;
    }
  }

  getAutoPrintEnabled(): boolean {
    return this.autoPrintEnabled;
  }

  /**
   * Recharger la configuration depuis la base de données
   */
  async reloadAutoPrintConfig(): Promise<boolean> {
    await this.loadAutoPrintConfig();
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

  private async generateAndPrint(orderData: any): Promise<void> {
    // Génération du ticket
    const ticket = this.formatTicket(orderData);

    // Envoi Bluetooth à l'imprimante
    await this.printViaBluetooth(ticket);
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

  /**
   * Connecter l'imprimante via Web Bluetooth
   */
  private async connectPrinter(): Promise<any | null> {
    try {
      console.log('🔍 Recherche imprimante Bluetooth...');

      // Demander l'accès Bluetooth
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { namePrefix: 'BlueTooth' },
          { namePrefix: 'POS' },
          { namePrefix: 'Printer' }
        ],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      console.log('✅ Périphérique trouvé:', device.name);

      // Connecter au GATT server
      const server = await device.gatt!.connect();
      console.log('✅ Connecté au serveur GATT');

      // Obtenir le service d'impression
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      console.log('✅ Service obtenu');

      // Obtenir la caractéristique d'écriture
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      console.log('✅ Caractéristique obtenue');

      return characteristic;
    } catch (error) {
      console.error('❌ Erreur connexion Bluetooth:', error);
      return null;
    }
  }

  /**
   * Convertir texte en commandes ESC/POS
   */
  private convertToESCPOS(text: string): Uint8Array {
    const encoder = new TextEncoder();
    const ESC = 0x1B;
    const GS = 0x1D;

    // Commandes ESC/POS
    const INIT = [ESC, 0x40]; // Initialiser
    const ALIGN_CENTER = [ESC, 0x61, 0x01]; // Centrer
    const ALIGN_LEFT = [ESC, 0x61, 0x00]; // Aligner à gauche
    const BOLD_ON = [ESC, 0x45, 0x01]; // Gras ON
    const BOLD_OFF = [ESC, 0x45, 0x00]; // Gras OFF
    const CUT_PAPER = [GS, 0x56, 0x00]; // Couper papier
    const LINE_FEED = [0x0A]; // Saut de ligne

    // Construire le buffer
    const buffer: number[] = [];

    // Initialiser
    buffer.push(...INIT);

    // Ajouter le texte ligne par ligne
    const lines = text.split('\n');
    lines.forEach(line => {
      if (line.includes('====')) {
        // Lignes de séparation centrées
        buffer.push(...ALIGN_CENTER);
      } else {
        // Texte normal aligné à gauche
        buffer.push(...ALIGN_LEFT);
      }

      // Ajouter le texte
      const encoded = encoder.encode(line);
      buffer.push(...Array.from(encoded));
      buffer.push(...LINE_FEED);
    });

    // Sauts de ligne et coupe
    buffer.push(...LINE_FEED);
    buffer.push(...LINE_FEED);
    buffer.push(...CUT_PAPER);

    return new Uint8Array(buffer);
  }

  /**
   * Imprimer via Bluetooth
   */
  private async printViaBluetooth(ticket: string): Promise<void> {
    try {
      console.log('🖨️ Démarrage impression Bluetooth...');

      // Connecter à l'imprimante
      const characteristic = await this.connectPrinter();
      if (!characteristic) {
        console.error('❌ Impossible de connecter à l\'imprimante');
        return;
      }

      // Convertir le ticket en ESC/POS
      const escposData = this.convertToESCPOS(ticket);
      console.log('✅ Ticket converti en ESC/POS:', escposData.length, 'bytes');

      // Envoyer à l'imprimante (par chunks de 512 bytes)
      const chunkSize = 512;
      for (let i = 0; i < escposData.length; i += chunkSize) {
        const chunk = escposData.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
        console.log(`📤 Envoyé ${i + chunk.length}/${escposData.length} bytes`);
      }

      console.log('✅ Impression terminée !');
    } catch (error) {
      console.error('❌ Erreur impression:', error);
      // Fallback : afficher dans la console
      console.log('🖨️ IMPRESSION TICKET (fallback):');
      console.log(ticket);
    }
  }
}