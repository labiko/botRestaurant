import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantPaymentService {
  
  private readonly API_URL = 'https://www.labico.net/api';
  
  constructor(
    private http: HttpClient,
    private supabase: SupabaseService
  ) {}
  
  // 1. Récupérer le dernier paiement (priorité SUCCESS)
  async getLastPaymentStatus(commandeId: string) {
    try {
      // D'abord chercher un SUCCESS
      const { data: successPayment, error: successError } = await this.supabase
        .from('restaurant_payments')
        .select('*')
        .eq('commande_id', commandeId)
        .eq('status', 'SUCCESS')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      // Si pas d'erreur et paiement trouvé
      if (!successError && successPayment) {
        return successPayment;
      }
      
      // Si erreur est "PGRST116" (no rows), c'est normal, continuer
      if (successError && successError.code !== 'PGRST116') {
        console.error('Error fetching SUCCESS payment:', successError);
      }
      
      // Sinon prendre le plus récent
      const { data: lastPayment, error: lastError } = await this.supabase
        .from('restaurant_payments')
        .select('*')
        .eq('commande_id', commandeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      // Si pas d'erreur et paiement trouvé
      if (!lastError && lastPayment) {
        return lastPayment;
      }
      
      // Si erreur est "PGRST116" (no rows), c'est normal
      if (lastError && lastError.code !== 'PGRST116') {
        console.error('Error fetching last payment:', lastError);
      }
      
      return null;
    } catch (error) {
      console.error('Error in getLastPaymentStatus:', error);
      return null;
    }
  }
  
  // 2. Appeler l'API C# existante
  async triggerPayment(restaurantId: string, commandeId: string) {
    // Utiliser GET comme fallback (l'API supporte les deux)
    const url = `${this.API_URL}/TriggerPaymentForRestaurant?restaurantId=${restaurantId}&commandeId=${commandeId}`;
    
    console.log('Calling API:', url);
    
    try {
      // Essayer d'abord avec GET (évite les problèmes CORS avec POST)
      return await this.http.get(url).toPromise();
    } catch (error) {
      console.error('GET failed, trying POST:', error);
      
      // Si GET échoue, essayer POST
      const payload = {
        restaurantId: restaurantId,
        commandeId: commandeId
      };
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      return this.http.post(
        `${this.API_URL}/TriggerPaymentForRestaurant`, 
        payload,
        { headers }
      ).toPromise();
    }
  }
  
  // 3. Vérifier si paiement expiré (15 mins)
  isPaymentExpired(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffMinutes > 15;
  }
  
  // 4. Calculer temps restant
  getTimeRemaining(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = created.getTime() + (15 * 60 * 1000) - now.getTime();
    
    if (diffMs <= 0) return 'Expiré';
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // 5. Vérifier si le restaurant a une configuration de paiement active
  async hasPaymentConfiguration(restaurantId: string): Promise<boolean> {
    try {
      console.log('🔍 Service: Recherche config pour restaurant_id:', restaurantId);
      const { data, error } = await this.supabase
        .from('restaurant_payment_config')
        .select('id, restaurant_id, provider_name, is_active')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)  // AJOUT: Vérifier que la config est active
        .limit(1);
      
      if (error) {
        console.error('❌ Service: Erreur lors de la requête:', error);
        return false;
      }
      
      console.log('📊 Service: Données trouvées (is_active=true uniquement):', data);
      const hasActiveConfig = data && data.length > 0;
      console.log('✅ Service: Résultat hasActiveConfig:', hasActiveConfig);
      return hasActiveConfig;
    } catch (error) {
      console.error('❌ Service: Erreur dans hasPaymentConfiguration:', error);
      return false;
    }
  }
}