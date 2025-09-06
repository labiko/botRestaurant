import { Injectable } from '@angular/core';
import { FuseauHoraireService } from './fuseau-horaire.service';
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

  constructor(
    private supabase: SupabaseService,
    private fuseauHoraireService: FuseauHoraireService
  ) {
    this.checkSession();
    this.loadStoredUser();
  }

  private async checkSession() {
    const session = await this.supabase.getSession();
    if (session) {
      // TODO: Load user details based on session
    }
  }

  async loginRestaurant(phone: string, password: string): Promise<{success: boolean, error?: string, restaurant?: any}> {
    try {
      // Normaliser le numéro de téléphone
      const normalizedPhone = this.normalizePhoneForRestaurant(phone.trim());
      console.log('🔍 Restaurant login attempt:', { original: phone, normalized: normalizedPhone });
      
      // Debug: chercher d'abord le restaurant sans condition de statut
      const { data: debugRestaurant, error: debugError } = await this.supabase
        .from('restaurants')
        .select('id, nom, telephone, statut, status, password, first_login, is_blocked')
        .eq('telephone', normalizedPhone)
        .single();
      
      console.log('🔍 Debug restaurant search result:', { 
        found: !!debugRestaurant, 
        error: debugError,
        restaurant: debugRestaurant 
      });
      
      if (!debugRestaurant) {
        console.log('🔍 Restaurant NOT FOUND. Trying different phone formats...');
        // Essayer aussi avec phone_whatsapp
        const { data: altRestaurant } = await this.supabase
          .from('restaurants')
          .select('id, nom, telephone, phone_whatsapp, statut, status, password, first_login, is_blocked')
          .eq('phone_whatsapp', normalizedPhone)
          .single();
        console.log('🔍 Alternative search result:', altRestaurant);
      }

      // Query restaurants table directly for authentication - try both telephone fields
      let restaurant = null;
      let restaurantError = null;

      // First try with telephone field
      const { data: restaurantByPhone, error: errorByPhone } = await this.supabase
        .from('restaurants')
        .select(`
          id,
          nom,
          password,
          telephone,
          phone_whatsapp,
          latitude,
          longitude,
          currency,
          statut,
          is_blocked,
          first_login
        `)
        .eq('telephone', normalizedPhone)
        .in('statut', ['ouvert', 'ferme']) // Permettre connexion même si fermé
        .maybeSingle();

      if (restaurantByPhone) {
        restaurant = restaurantByPhone;
        console.log('🔍 Restaurant found by telephone field:', normalizedPhone);
      } else {
        console.log('🔍 Restaurant not found by telephone, trying phone_whatsapp field...');
        
        // Try with phone_whatsapp field
        const { data: restaurantByWhatsApp, error: errorByWhatsApp } = await this.supabase
          .from('restaurants')
          .select(`
            id,
            nom,
            password,
            telephone,
            phone_whatsapp,
            latitude,
            longitude,
            currency,
            statut,
            is_blocked,
            first_login
          `)
          .eq('phone_whatsapp', normalizedPhone)
          .in('statut', ['ouvert', 'ferme'])
          .maybeSingle();

        if (restaurantByWhatsApp) {
          restaurant = restaurantByWhatsApp;
          console.log('🔍 Restaurant found by phone_whatsapp field:', normalizedPhone);
        } else {
          restaurantError = errorByWhatsApp || errorByPhone || { message: 'Restaurant not found' };
          console.log('🔍 Restaurant not found in either telephone field');
        }
      }

      if (restaurantError || !restaurant) {
        console.error('Restaurant not found:', restaurantError);
        return { success: false, error: 'RESTAURANT_NOT_FOUND' };
      }

      // Vérifier si le restaurant est bloqué
      if (restaurant.is_blocked === true) {
        console.error('Restaurant bloqué:', normalizedPhone);
        return { success: false, error: 'RESTAURANT_BLOCKED' };
      }

      // Cas de première connexion (password null ou first_login = true)
      console.log('🔍 Checking first login:', { 
        password: restaurant.password, 
        first_login: restaurant.first_login,
        passwordIsNull: restaurant.password === null,
        firstLoginIsTrue: restaurant.first_login === true,
        providedPassword: password,
        providedPasswordLength: password ? password.length : 0
      });
      
      if (restaurant.password === null || restaurant.first_login === true) {
        console.log('🔍 First login detected - password is null or first_login is true');
        
        // Si aucun mot de passe n'est fourni, demander à l'utilisateur d'en créer un
        if (!password || password.trim() === '') {
          console.log('🔍 No password provided for first login - requesting password setup');
          return { success: false, error: 'FIRST_LOGIN_SETUP_REQUIRED', restaurant: restaurant };
        }
        
        // Si un mot de passe est fourni mais trop court
        if (password.trim().length < 6) {
          console.log('🔍 Password too short for first login');
          return { success: false, error: 'PASSWORD_TOO_SHORT' };
        }
        
        // Mot de passe valide fourni - définir le nouveau mot de passe
        console.log('🔍 Valid password provided for first login - updating database');
        const { error: updateError } = await this.supabase
          .from('restaurants')
          .update({ 
            password: password, // TODO: hasher le mot de passe en production
            first_login: false,
            updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
          })
          .eq('id', restaurant.id);

        if (updateError) {
          console.error('Erreur mise à jour mot de passe:', updateError);
          return { success: false, error: 'UPDATE_ERROR' };
        }

        console.log('🔐 Premier mot de passe défini avec succès pour:', restaurant.nom);
      } else {
        // Authentification normale
        console.log('🔍 Normal authentication:', { 
          providedPassword: password, 
          storedPassword: restaurant.password,
          match: password === restaurant.password
        });
        
        // TODO: Implement proper password hashing verification
        // For demo, we'll use a simple check
        // In production: bcrypt.compare(password, restaurant.password)
        
        if (password !== restaurant.password) {
          console.error('Password incorrect');
          return { success: false, error: 'INVALID_PASSWORD' };
        }
      }

      // Connexion réussie
      const user: User = {
        id: restaurant.id,
        phone: restaurant.telephone,
        name: restaurant.nom,
        type: 'restaurant',
        restaurantId: restaurant.id,
        restaurant: {
          id: restaurant.id,
          nom: restaurant.nom,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          currency: restaurant.currency || 'GNF'
        }
      };
      
      console.log('User created with restaurant info:', user);
      
      // Update last login (add a last_login field to restaurants table if needed)
      await this.supabase
        .from('restaurants')
        .update({ 
          updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
        })
        .eq('id', restaurant.id);
      
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  async loginDelivery(phone: string, code: string): Promise<{success: boolean, error?: string}> {
    try {
      // Utiliser le numéro tel qu'il est saisi, sans normalisation
      const cleanPhone = phone.trim();
      
      console.log('🔍 Login attempt:', { phone: cleanPhone, code });
      
      // D'abord chercher le livreur sans conditions de blocage pour diagnostic
      const { data: deliveryUserCheck, error: checkError } = await this.supabase
        .from('delivery_users')
        .select('*')
        .eq('telephone', cleanPhone)
        .maybeSingle();
      
      // Si pas trouvé du tout
      if (!deliveryUserCheck) {
        console.error('📱 Numéro de téléphone non trouvé:', cleanPhone);
        return { success: false, error: 'PHONE_NOT_FOUND' };
      }
      
      // Si trouvé mais mauvais code
      if (deliveryUserCheck.code_acces !== code) {
        console.error('🔐 Code d\'accès incorrect pour:', cleanPhone);
        return { success: false, error: 'INVALID_CODE' };
      }
      
      // Si trouvé mais bloqué
      if (deliveryUserCheck.is_blocked === true) {
        console.error('🚫 Livreur bloqué:', cleanPhone);
        return { success: false, error: 'USER_BLOCKED' };
      }
      
      // Si trouvé mais inactif
      if (deliveryUserCheck.status !== 'actif') {
        console.error('💤 Livreur inactif:', cleanPhone);
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
          updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
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
          updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
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
      
      // Démarrer les vérifications périodiques selon le type d'utilisateur
      if (user.type === 'delivery') {
        this.startBlockedUserCheck(user.deliveryId, 'delivery');
      } else if (user.type === 'restaurant') {
        this.startBlockedUserCheck(user.restaurantId, 'restaurant');
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
      } else if (userType === 'restaurant') {
        const { data: restaurant } = await this.supabase
          .from('restaurants')
          .select('is_blocked, statut')
          .eq('id', userId)
          .single();

        return restaurant?.is_blocked === true;
      }
      return false;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }


  private blockCheckInterval: any;

  startBlockedUserCheck(userId: string | number, userType?: 'restaurant' | 'delivery') {
    // Nettoyer l'intervalle précédent s'il existe
    if (this.blockCheckInterval) {
      clearInterval(this.blockCheckInterval);
    }

    // Vérifier toutes les 1 minute si l'utilisateur est bloqué (optimisé pour les performances)
    this.blockCheckInterval = setInterval(async () => {
      const currentUser = this.getCurrentUser();
      
      if (currentUser) {
        if (currentUser.type === 'delivery' && currentUser.deliveryId) {
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
        } else if (currentUser.type === 'restaurant' && currentUser.restaurantId) {
          console.log(`🔍 Vérification du statut de blocage pour restaurant ${currentUser.restaurantId} (${currentUser.name})`);
          
          try {
            const isBlocked = await this.checkIfUserIsBlocked(currentUser.restaurantId, 'restaurant');
            
            if (isBlocked) {
              console.log('🚫 RESTAURANT BLOQUÉ DÉTECTÉ - DÉCONNEXION FORCÉE');
              await this.forceLogoutBlockedRestaurant(currentUser.restaurantId);
            }
          } catch (error) {
            console.error('❌ Erreur lors de la vérification de blocage restaurant:', error);
          }
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
          updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
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

  async forceLogoutBlockedRestaurant(restaurantId: string) {
    try {
      // Marquer la dernière activité comme nulle pour forcer la déconnexion
      await this.supabase
        .from('restaurants')
        .update({ 
          last_activity_at: null,
          updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
        })
        .eq('id', restaurantId);

      // Supprimer les sessions actives si la table existe
      const { error: sessionError } = await this.supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', restaurantId)
        .eq('user_type', 'restaurant');

      console.log('Sessions restaurant supprimées:', sessionError ? 'Erreur' : 'Succès');

      // Déconnecter localement
      this.stopBlockedUserCheck();
      await this.logout();
      
      // Rediriger vers la page de connexion avec un message
      window.location.href = '/auth/login?userType=restaurant&blocked=true';
    } catch (error) {
      console.error('Error during forced restaurant logout:', error);
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

  private normalizePhoneForRestaurant(phone: string): string {
    const cleanPhone = phone.trim();
    
    // Pour les restaurants, on stocke sans le + dans la base
    // Retirer le + si présent
    if (cleanPhone.startsWith('+')) {
      return cleanPhone.substring(1);
    }
    
    // Si c'est déjà sans +, retourner tel quel
    return cleanPhone;
  }
}