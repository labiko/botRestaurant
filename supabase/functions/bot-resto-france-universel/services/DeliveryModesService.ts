/**
 * 🚚 Service pour gérer les modes de livraison paramétrés par restaurant
 * Récupère et formate les modes depuis la table france_restaurant_service_modes
 */

export interface ServiceMode {
  mode: 'sur_place' | 'a_emporter' | 'livraison';
  displayName: string;
  isEnabled: boolean;
  displayOrder: number;
  description?: string;
  config?: any;
}

export class DeliveryModesService {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
  }

  /**
   * Récupère les modes de service disponibles pour un restaurant
   * Retourne uniquement les modes activés, triés par display_order
   */
  async getAvailableModes(restaurantId: number): Promise<ServiceMode[]> {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      console.log(`🚚 [DeliveryModes] Récupération des modes pour restaurant ${restaurantId}`);

      const { data, error } = await supabase
        .from('france_restaurant_service_modes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_enabled', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ [DeliveryModes] Erreur récupération modes:', error);
        // Fallback : retourner les modes par défaut
        return this.getDefaultModes();
      }

      if (!data || data.length === 0) {
        console.log('⚠️ [DeliveryModes] Aucun mode configuré, utilisation modes par défaut');
        return this.getDefaultModes();
      }

      console.log(`✅ [DeliveryModes] ${data.length} modes trouvés:`, data.map(m => m.service_mode));

      return data.map(row => ({
        mode: row.service_mode as 'sur_place' | 'a_emporter' | 'livraison',
        displayName: row.display_name,
        isEnabled: row.is_enabled,
        displayOrder: row.display_order,
        description: row.description,
        config: row.config
      }));

    } catch (error) {
      console.error('❌ [DeliveryModes] Erreur:', error);
      return this.getDefaultModes();
    }
  }

  /**
   * Vérifie si un mode spécifique est disponible
   */
  async isModeAvailable(restaurantId: number, mode: string): Promise<boolean> {
    const availableModes = await this.getAvailableModes(restaurantId);
    return availableModes.some(m => m.mode === mode);
  }

  /**
   * Formate le message de sélection des modes
   */
  formatModesMessage(modes: ServiceMode[]): string {
    if (modes.length === 0) {
      return "❌ Aucun mode de service disponible pour le moment.";
    }

    let message = "🚚 *Choisissez votre service :*\n";
    
    modes.forEach((mode, index) => {
      const emoji = this.getModeEmoji(mode.mode);
      message += `${emoji} ${index + 1} - ${mode.displayName}\n`;
    });
    
    message += "Tapez le numéro de votre choix.";
    
    return message;
  }

  /**
   * Obtient l'emoji correspondant au mode
   */
  private getModeEmoji(mode: string): string {
    const emojis: { [key: string]: string } = {
      'sur_place': '📍',
      'a_emporter': '📦',
      'livraison': '🚚'
    };
    return emojis[mode] || '🔷';
  }

  /**
   * Obtient la description explicative du mode
   */
  private getModeDescription(mode: string): string {
    const descriptions: { [key: string]: string } = {
      'sur_place': 'manger au restaurant',
      'a_emporter': 'récupérer et partir',
      'livraison': 'chez vous'
    };
    return descriptions[mode] || '';
  }

  /**
   * Retourne les modes par défaut (fallback)
   * Utilisé si aucune configuration en base
   */
  private getDefaultModes(): ServiceMode[] {
    return [
      {
        mode: 'sur_place',
        displayName: 'Sur place',
        isEnabled: true,
        displayOrder: 1
      },
      {
        mode: 'a_emporter',
        displayName: 'À emporter',
        isEnabled: true,
        displayOrder: 2
      },
      {
        mode: 'livraison',
        displayName: 'Livraison',
        isEnabled: true,
        displayOrder: 3
      }
    ];
  }
}