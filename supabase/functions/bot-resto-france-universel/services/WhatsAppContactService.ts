/**
 * Service de récupération des informations de contact WhatsApp
 * SOLID - Single Responsibility : Gestion uniquement des contacts WhatsApp
 * Récupération du nom WhatsApp via Green API GetContactInfo
 */

export interface WhatsAppContactInfo {
  name?: string;
  contactName?: string;
  avatar?: string;
  isBusiness?: boolean;
}

export class WhatsAppContactService {
  private contactCache = new Map<string, WhatsAppContactInfo>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(
    private greenApiUrl: string,
    private instanceId: string,
    private apiToken: string
  ) {}

  /**
   * Récupérer le nom WhatsApp d'un contact
   */
  async getContactName(phoneNumber: string): Promise<string | null> {
    try {
      console.log(`📞 [WhatsAppContact] Récupération nom pour: ${phoneNumber}`);
      
      // Nettoyer le numéro de téléphone
      const cleanPhone = phoneNumber.replace('@c.us', '');
      const chatId = `${cleanPhone}@c.us`;
      
      // Vérifier le cache
      const cachedInfo = this.getCachedContact(chatId);
      if (cachedInfo) {
        console.log(`📋 [WhatsAppContact] Cache hit pour: ${phoneNumber}`);
        return cachedInfo.name || cachedInfo.contactName || null;
      }
      
      // Appel API GetContactInfo
      const contactInfo = await this.getContactInfo(chatId);
      
      if (contactInfo) {
        // Mettre en cache
        this.setCachedContact(chatId, contactInfo);
        
        const name = contactInfo.name || contactInfo.contactName || null;
        console.log(`✅ [WhatsAppContact] Nom récupéré: "${name}" pour ${phoneNumber}`);
        return name;
      }
      
      console.log(`❌ [WhatsAppContact] Aucun nom trouvé pour: ${phoneNumber}`);
      return null;
      
    } catch (error) {
      console.error('❌ [WhatsAppContact] Erreur récupération nom:', error);
      return null;
    }
  }

  /**
   * Appeler l'API Green API GetContactInfo
   */
  private async getContactInfo(chatId: string): Promise<WhatsAppContactInfo | null> {
    try {
      const url = `${this.greenApiUrl}/waInstance${this.instanceId}/getContactInfo/${this.apiToken}`;
      
      console.log(`🌐 [WhatsAppContact] Appel API: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId
        })
      });

      if (!response.ok) {
        console.error(`❌ [WhatsAppContact] Erreur HTTP ${response.status}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log(`📱 [WhatsAppContact] Réponse API:`, JSON.stringify(data, null, 2));

      // Green API peut retourner différents formats selon l'état
      if (data && (data.name || data.contactName)) {
        return {
          name: data.name,
          contactName: data.contactName,
          avatar: data.avatar,
          isBusiness: data.isBusiness
        };
      }

      return null;
      
    } catch (error) {
      console.error('❌ [WhatsAppContact] Exception API GetContactInfo:', error);
      return null;
    }
  }

  /**
   * Récupérer contact du cache
   */
  private getCachedContact(chatId: string): WhatsAppContactInfo | null {
    const expiry = this.cacheExpiry.get(chatId);
    const now = Date.now();
    
    if (expiry && now > expiry) {
      // Cache expiré
      this.contactCache.delete(chatId);
      this.cacheExpiry.delete(chatId);
      return null;
    }
    
    return this.contactCache.get(chatId) || null;
  }

  /**
   * Mettre en cache les informations de contact
   */
  private setCachedContact(chatId: string, contactInfo: WhatsAppContactInfo): void {
    this.contactCache.set(chatId, contactInfo);
    this.cacheExpiry.set(chatId, Date.now() + this.CACHE_DURATION);
    
    console.log(`💾 [WhatsAppContact] Mise en cache: ${chatId} (expire dans ${this.CACHE_DURATION/1000/60}min)`);
  }

  /**
   * Nettoyer le cache expiré (maintenance)
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [chatId, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.contactCache.delete(chatId);
        this.cacheExpiry.delete(chatId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 [WhatsAppContact] ${cleanedCount} entrées de cache supprimées`);
    }
  }

  /**
   * Obtenir les statistiques du cache
   */
  getCacheStats(): { totalCached: number; activeEntries: number } {
    const now = Date.now();
    let activeEntries = 0;
    
    for (const expiry of this.cacheExpiry.values()) {
      if (now <= expiry) {
        activeEntries++;
      }
    }
    
    return {
      totalCached: this.contactCache.size,
      activeEntries
    };
  }
}