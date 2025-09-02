import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseFranceService } from '../../../../core/services/supabase-france.service';
import * as bcrypt from 'bcryptjs';

export interface FranceUser {
  id: number;
  type: 'restaurant' | 'driver';
  firstName?: string;
  lastName?: string;
  name?: string; // Pour restaurants
  phoneNumber: string;
  email?: string;
  restaurantId: number;
  isActive: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: FranceUser;
  message?: string;
  redirectUrl?: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
  userType: 'restaurant' | 'driver';
}

@Injectable({
  providedIn: 'root'
})
export class AuthFranceService {
  private currentUserSubject = new BehaviorSubject<FranceUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private supabaseFranceService: SupabaseFranceService) {
    this.checkExistingSession();
  }

  /**
   * Vérification de session existante au démarrage
   */
  private async checkExistingSession(): Promise<void> {
    try {
      const sessionData = localStorage.getItem('france_auth_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const isValid = await this.validateSession(session.id);
        
        if (isValid) {
          const user = await this.getUserFromSession(session.id);
          if (user) {
            this.setCurrentUser(user);
          }
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Erreur vérification session:', error);
      this.clearSession();
    }
  }

  /**
   * Connexion restaurant
   */
  async loginRestaurant(phone: string, password: string): Promise<AuthResult> {
    try {
      console.log('🏪 [AuthFrance] Connexion restaurant:', phone);

      // Rechercher le restaurant par téléphone
      const { data: restaurant, error } = await this.supabaseFranceService.client
        .from('france_restaurants')
        .select('id, name, phone, whatsapp_number, password_hash, is_active')
        .or(`phone.eq.${phone},whatsapp_number.eq.${phone}`)
        .single();

      console.log('🔍 [AuthFrance] Résultat recherche:', { restaurant, error });

      if (error) {
        console.error('❌ [AuthFrance] Erreur SQL:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      }

      if (error || !restaurant) {
        console.error('Restaurant non trouvé:', error);
        return { success: false, message: 'Restaurant non trouvé' };
      }

      if (!restaurant.is_active) {
        return { success: false, message: 'Compte restaurant désactivé' };
      }

      // Vérifier le mot de passe
      console.log('🔐 [AuthFrance] Vérification mot de passe:', {
        provided: password,
        stored: restaurant.password_hash,
        direct: restaurant.password_hash === password
      });

      const passwordValid = restaurant.password_hash === password || 
                           await this.verifyPassword(password, restaurant.password_hash);

      console.log('✅ [AuthFrance] Mot de passe valide:', passwordValid);

      if (!passwordValid) {
        return { success: false, message: 'Mot de passe incorrect' };
      }

      // Créer la session
      const sessionResult = await this.createSession({
        user_id: restaurant.id,
        user_type: 'restaurant',
        session_token: this.generateSessionToken()
      });

      if (!sessionResult.success) {
        return { success: false, message: 'Erreur création session' };
      }

      const user: FranceUser = {
        id: restaurant.id,
        type: 'restaurant',
        name: restaurant.name,
        phoneNumber: phone,
        restaurantId: restaurant.id,
        isActive: restaurant.is_active
      };

      this.setCurrentUser(user);
      
      return { 
        success: true, 
        user,
        redirectUrl: '/restaurant-france/dashboard-france'
      };

    } catch (error) {
      console.error('Erreur connexion restaurant:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  /**
   * Connexion livreur
   */
  async loginDriver(phone: string, password: string): Promise<AuthResult> {
    try {
      console.log('🚴 [AuthFrance] Connexion livreur:', phone);

      // Rechercher le livreur par téléphone
      const { data: driver, error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('id, restaurant_id, first_name, last_name, phone_number, email, password_hash, is_active')
        .eq('phone_number', phone)
        .single();

      if (error || !driver) {
        console.error('Livreur non trouvé:', error);
        return { success: false, message: 'Livreur non trouvé' };
      }

      if (!driver.is_active) {
        return { success: false, message: 'Compte livreur désactivé' };
      }

      // Vérifier le mot de passe
      const passwordValid = await this.verifyPassword(password, driver.password_hash);

      if (!passwordValid) {
        return { success: false, message: 'Mot de passe incorrect' };
      }

      // Créer la session
      const sessionResult = await this.createSession({
        user_id: driver.id,
        user_type: 'driver',
        session_token: this.generateSessionToken()
      });

      if (!sessionResult.success) {
        return { success: false, message: 'Erreur création session' };
      }

      const user: FranceUser = {
        id: driver.id,
        type: 'driver',
        firstName: driver.first_name,
        lastName: driver.last_name,
        phoneNumber: phone,
        email: driver.email,
        restaurantId: driver.restaurant_id,
        isActive: driver.is_active
      };

      this.setCurrentUser(user);
      
      return { 
        success: true, 
        user,
        redirectUrl: '/restaurant-france/delivery-france'
      };

    } catch (error) {
      console.error('Erreur connexion livreur:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  /**
   * Connexion générique
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    if (credentials.userType === 'restaurant') {
      return this.loginRestaurant(credentials.phone, credentials.password);
    } else {
      return this.loginDriver(credentials.phone, credentials.password);
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      const sessionData = localStorage.getItem('france_auth_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // Supprimer la session de la base
        await this.supabaseFranceService.client
          .from('france_auth_sessions')
          .delete()
          .eq('id', session.id);
      }
      
      this.clearSession();
      console.log('✅ [AuthFrance] Déconnexion réussie');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      this.clearSession();
    }
  }

  /**
   * Créer une session
   */
  private async createSession(sessionData: any): Promise<{ success: boolean }> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Session 24h

      const { data, error } = await this.supabaseFranceService.client
        .from('france_auth_sessions')
        .insert([{
          ...sessionData,
          expires_at: expiresAt.toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ [AuthFrance] Erreur création session:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          sessionData
        });
        return { success: false };
      }

      // Sauvegarder en localStorage
      localStorage.setItem('france_auth_session', JSON.stringify({
        id: data.id,
        session_token: data.session_token,
        user_type: data.user_type,
        expires_at: data.expires_at
      }));

      return { success: true };
    } catch (error) {
      console.error('Erreur création session:', error);
      return { success: false };
    }
  }

  /**
   * Valider une session
   */
  private async validateSession(sessionId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_auth_sessions')
        .select('expires_at')
        .eq('id', sessionId)
        .single();

      if (error || !data) {
        return false;
      }

      return new Date(data.expires_at) > new Date();
    } catch (error) {
      console.error('Erreur validation session:', error);
      return false;
    }
  }

  /**
   * Récupérer utilisateur depuis session
   */
  private async getUserFromSession(sessionId: string): Promise<FranceUser | null> {
    try {
      const { data: session, error } = await this.supabaseFranceService.client
        .from('france_auth_sessions')
        .select('user_id, user_type, phone_number, restaurant_id')
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        return null;
      }

      if (session.user_type === 'restaurant') {
        const { data: restaurant } = await this.supabaseFranceService.client
          .from('france_restaurants')
          .select('id, name, is_active')
          .eq('id', session.user_id)
          .single();

        if (restaurant) {
          return {
            id: restaurant.id,
            type: 'restaurant',
            name: restaurant.name,
            phoneNumber: session.phone_number,
            restaurantId: session.restaurant_id,
            isActive: restaurant.is_active
          };
        }
      } else if (session.user_type === 'driver') {
        const { data: driver } = await this.supabaseFranceService.client
          .from('france_delivery_drivers')
          .select('id, first_name, last_name, email, is_active')
          .eq('id', session.user_id)
          .single();

        if (driver) {
          return {
            id: driver.id,
            type: 'driver',
            firstName: driver.first_name,
            lastName: driver.last_name,
            phoneNumber: session.phone_number,
            email: driver.email,
            restaurantId: session.restaurant_id,
            isActive: driver.is_active
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  }

  /**
   * Vérifier mot de passe
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      // Si le hash commence par $2, c'est du bcrypt
      if (hash && hash.startsWith('$2')) {
        return await bcrypt.compare(password, hash);
      }
      // Sinon comparaison simple (temporaire)
      return password === hash;
    } catch (error) {
      console.error('Erreur vérification mot de passe:', error);
      return false;
    }
  }

  /**
   * Définir l'utilisateur courant
   */
  private setCurrentUser(user: FranceUser): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Effacer la session
   */
  private clearSession(): void {
    localStorage.removeItem('france_auth_session');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Récupérer l'utilisateur courant
   */
  getCurrentUser(): FranceUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifier si authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Générer un token de session unique
   */
  private generateSessionToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${Date.now()}_${result}`;
  }
}