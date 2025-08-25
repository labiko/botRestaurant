import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  type: 'restaurant' | 'delivery';
  restaurantId?: string;
  deliveryId?: string;
  deliveryPhone?: string;
  restaurant?: {
    id: string;
    nom: string;
    latitude: number;
    longitude: number;
    currency?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private supabase: SupabaseService) {
    this.checkSession();
    this.loadStoredUser();
  }

  private async checkSession() {
    const session = await this.supabase.getSession();
    if (session) {
      // TODO: Load user details based on session
    }
  }

  async loginRestaurant(email: string, password: string): Promise<boolean> {
    try {
      // Query restaurant_users table for authentication with restaurant coordinates
      const { data: restaurantUser, error: userError } = await this.supabase
        .from('restaurant_users')
        .select(`
          id,
          restaurant_id,
          email,
          nom,
          role
        `)
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (userError || !restaurantUser) {
        console.error('Restaurant user not found:', userError);
        return false;
      }

      // Get restaurant details separately including currency
      const { data: restaurant, error: restaurantError } = await this.supabase
        .from('restaurants')
        .select('id, nom, latitude, longitude, currency')
        .eq('id', restaurantUser.restaurant_id)
        .single();
      
      if (restaurantError || !restaurant) {
        console.error('Restaurant not found:', restaurantError);
        return false;
      }

      // TODO: Implement proper password hashing verification
      // For demo, we'll use a simple check or allow any password
      // In production: bcrypt.compare(password, restaurantUser.password_hash)
      
      if (password) { // Accept any non-empty password for demo
        const user: User = {
          id: restaurantUser.id.toString(),
          email: restaurantUser.email,
          name: restaurantUser.nom,
          type: 'restaurant',
          restaurantId: restaurantUser.restaurant_id,
          restaurant: restaurant ? {
            id: restaurant.id,
            nom: restaurant.nom,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
            currency: restaurant.currency || 'GNF'
          } : undefined
        };
        
        console.log('User created with restaurant info:', user);
        
        // Update last login
        await this.supabase
          .from('restaurant_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', restaurantUser.id);
        
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async loginDelivery(phone: string, code: string): Promise<{success: boolean, error?: string}> {
    try {
      // Normaliser le numéro de téléphone pour la vérification
      const normalizedPhone = this.normalizePhoneForLogin(phone.trim());
      
      console.log('🔍 Login attempt:', { original: phone, normalized: normalizedPhone, code });
      
      // D'abord chercher le livreur sans conditions de blocage pour diagnostic
      const { data: deliveryUserCheck, error: checkError } = await this.supabase
        .from('delivery_users')
        .select('*')
        .eq('telephone', normalizedPhone)
        .maybeSingle();
      
      // Si pas trouvé du tout
      if (!deliveryUserCheck) {
        console.error('📱 Numéro de téléphone non trouvé:', normalizedPhone);
        return { success: false, error: 'PHONE_NOT_FOUND' };
      }
      
      // Si trouvé mais mauvais code
      if (deliveryUserCheck.code_acces !== code) {
        console.error('🔐 Code d\'accès incorrect pour:', normalizedPhone);
        return { success: false, error: 'INVALID_CODE' };
      }
      
      // Si trouvé mais bloqué
      if (deliveryUserCheck.is_blocked === true) {
        console.error('🚫 Livreur bloqué:', normalizedPhone);
        return { success: false, error: 'USER_BLOCKED' };
      }
      
      // Si trouvé mais inactif
      if (deliveryUserCheck.status !== 'actif') {
        console.error('💤 Livreur inactif:', normalizedPhone);
        return { success: false, error: 'USER_INACTIVE' };
      }
      
      // Tout est OK, procéder à la connexion
      const deliveryUser = deliveryUserCheck;

      const user: User = {
        id: deliveryUser.id.toString(),
        phone: deliveryUser.telephone,
        name: deliveryUser.nom,
        type: 'delivery',
        deliveryId: deliveryUser.id,
        deliveryPhone: deliveryUser.telephone
      };
      
      // Update last login and set online status
      await this.supabase
        .from('delivery_users')
        .update({ 
          is_online: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', deliveryUser.id);
      
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Démarrer la vérification périodique de blocage pour les livreurs
      this.startBlockedUserCheck(deliveryUser.id);
      console.log(`🔍 Vérification périodique de blocage démarrée pour livreur ${deliveryUser.id}`);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  async logout() {
    const currentUser = this.getCurrentUser();
    
    // Si c'est un livreur, le marquer comme offline
    if (currentUser && currentUser.type === 'delivery' && currentUser.deliveryId) {
      await this.supabase
        .from('delivery_users')
        .update({ 
          is_online: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', Number(currentUser.deliveryId));
      
      // Arrêter la vérification de blocage
      this.stopBlockedUserCheck();
    }

    await this.supabase.signOut();
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getUserType(): 'restaurant' | 'delivery' | null {
    const user = this.currentUserSubject.value;
    return user ? user.type : null;
  }

  loadStoredUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
      
      // Si c'est un livreur, vérifier s'il n'est pas bloqué
      if (user.type === 'delivery') {
        this.startBlockedUserCheck(user.deliveryId);
      }
    }
  }

  async checkIfUserIsBlocked(userId: string, userType: 'restaurant' | 'delivery'): Promise<boolean> {
    try {
      if (userType === 'delivery') {
        const { data: deliveryUser } = await this.supabase
          .from('delivery_users')
          .select('is_blocked, status')
          .eq('id', userId)
          .single();

        return deliveryUser?.is_blocked === true || deliveryUser?.status !== 'actif';
      }
      return false;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }


  private blockCheckInterval: any;

  startBlockedUserCheck(deliveryId: string | number) {
    // Nettoyer l'intervalle précédent s'il existe
    if (this.blockCheckInterval) {
      clearInterval(this.blockCheckInterval);
    }

    // Vérifier toutes les 1 minute si le livreur est bloqué (optimisé pour les performances)
    this.blockCheckInterval = setInterval(async () => {
      const currentUser = this.getCurrentUser();
      
      if (currentUser && currentUser.type === 'delivery' && currentUser.deliveryId) {
        console.log(`🔍 Vérification du statut de blocage pour livreur ${currentUser.deliveryId} (${currentUser.name})`);
        
        try {
          const isBlocked = await this.checkIfUserIsBlocked(currentUser.deliveryId.toString(), 'delivery');
          
          if (isBlocked) {
            console.log('🚫 LIVREUR BLOQUÉ DÉTECTÉ - DÉCONNEXION FORCÉE');
            await this.forceLogoutBlockedDelivery(Number(currentUser.deliveryId));
          }
        } catch (error) {
          console.error('❌ Erreur lors de la vérification de blocage:', error);
        }
      } else {
        this.stopBlockedUserCheck();
      }
    }, 60000); // 1 minute (60000ms) - optimisé pour les performances
  }

  stopBlockedUserCheck() {
    if (this.blockCheckInterval) {
      clearInterval(this.blockCheckInterval);
      this.blockCheckInterval = null;
    }
  }

  async forceLogoutBlockedDelivery(deliveryId: number) {
    try {
      // Marquer comme offline dans la base
      await this.supabase
        .from('delivery_users')
        .update({ 
          is_online: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', deliveryId);

      // Supprimer les sessions actives
      await this.supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', deliveryId)
        .eq('user_type', 'delivery');

      // Déconnecter localement
      this.stopBlockedUserCheck();
      await this.logout();
      
      // Rediriger vers la page de connexion avec un message
      window.location.href = '/auth/login?userType=delivery&blocked=true';
    } catch (error) {
      console.error('Error during forced logout:', error);
    }
  }

  private normalizePhoneForLogin(phone: string): string {
    const cleanPhone = phone.trim();
    
    // Format français complet: 33667326357 → +33667326357
    if (/^33[1-9][0-9]{8}$/.test(cleanPhone)) {
      return '+' + cleanPhone;
    }
    
    // Format français sans indicatif pays: 667326357 → +33667326357
    if (/^[1-9][0-9]{8}$/.test(cleanPhone)) {
      return '+33' + cleanPhone;
    }
    
    // Format guinéen complet: 224622879890 → +224622879890
    if (/^224[6-7][0-9]{8}$/.test(cleanPhone)) {
      return '+' + cleanPhone;
    }
    
    // Format guinéen local: 622879890 → +224622879890
    if (/^[6-7][0-9]{8}$/.test(cleanPhone)) {
      return '+224' + cleanPhone;
    }
    
    // Si c'est déjà au format international avec +
    if (/^\+33[1-9][0-9]{8}$/.test(cleanPhone) || /^\+224[6-7][0-9]{8}$/.test(cleanPhone)) {
      return cleanPhone;
    }
    
    // Retourner tel quel si aucun pattern ne correspond
    return cleanPhone;
  }
}