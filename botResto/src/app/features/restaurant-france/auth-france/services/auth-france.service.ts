import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseFranceService } from '../../../../core/services/supabase-france.service';
import { PhoneFormatService } from '../../../../core/services/phone-format.service';
import { DriverSessionMonitorService } from '../../../../core/services/driver-session-monitor.service';

export interface FranceUser {
  id: number;
  type: 'restaurant' | 'driver';
  firstName?: string;
  lastName?: string;
  name?: string; // Pour restaurants
  restaurantName?: string; // Nom du restaurant (pour drivers)
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
  // Initialiser avec undefined pour indiquer qu'on est en cours de vérification
  private currentUserSubject = new BehaviorSubject<FranceUser | null | undefined>(undefined);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private phoneFormatService: PhoneFormatService,
    private driverSessionMonitorService: DriverSessionMonitorService
  ) {
    this.checkExistingSession();
  }

  /**
   * Vérification de session existante au démarrage
   */
  private async checkExistingSession(): Promise<void> {
    try {
      
      const sessionData = localStorage.getItem('france_auth_session');
      if (!sessionData) {
        // Important: émettre null pour indiquer qu'il n'y a pas de session
        this.currentUserSubject.next(null);
        return;
      }

      const session = JSON.parse(sessionData);

      const isValid = await this.validateSession(session.id);
        
      if (isValid) {
        const user = await this.getUserFromSession(session.id);
        if (user) {
          this.setCurrentUser(user);
        } else {
          console.warn('⚠️ [AuthFrance] Impossible de récupérer les données utilisateur');
          this.clearSession();
        }
      } else {
        console.warn('⚠️ [AuthFrance] Session expirée ou invalide');
        this.clearSession();
      }
    } catch (error) {
      console.error('❌ [AuthFrance] Erreur vérification session:', error);
      this.clearSession();
    }
  }

  /**
   * Connexion restaurant
   */
  async loginRestaurant(phone: string, password: string): Promise<AuthResult> {
    try {

      // Rechercher le restaurant par téléphone
      const { data: restaurant, error } = await this.supabaseFranceService.client
        .from('france_restaurants')
        .select('id, name, phone, whatsapp_number, password_hash, is_active')
        .or(`phone.eq.${phone},whatsapp_number.eq.${phone}`)
        .single();


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

      // CAS SPÉCIAL : Premier mot de passe (password_hash vide ou null)
      if (!restaurant.password_hash || restaurant.password_hash.trim() === '') {
        // Si aucun mot de passe saisi : demander création
        if (!password || password.trim() === '') {
          return {
            success: false,
            message: 'Première connexion : créez votre mot de passe'
          };
        }

        // Créer et enregistrer le nouveau mot de passe
        const created = await this.createFirstPassword(restaurant.id, password.trim());
        if (!created) {
          return {
            success: false,
            message: 'Erreur lors de la création du mot de passe'
          };
        }

        // Mettre à jour l'objet restaurant pour la suite
        restaurant.password_hash = password.trim();
        console.log('🔐 [AuthFrance] Premier mot de passe créé pour restaurant:', restaurant.id);
      }

      // Vérifier le mot de passe (LOGIQUE NORMALE EXISTANTE - AUCUN CHANGEMENT)
      const passwordValid = restaurant.password_hash === password ||
                           await this.verifyPassword(password, restaurant.password_hash);


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

      // Valider le format du numéro de téléphone
      const phoneValidation = this.phoneFormatService.isValidDriverPhone(phone);
      if (!phoneValidation.valid) {
        return { 
          success: false, 
          message: phoneValidation.message || 'Format de téléphone invalide' 
        };
      }

      // Normaliser le numéro pour la recherche
      const normalizedPhone = this.phoneFormatService.normalizeForStorage(phone);

      // Rechercher le livreur par téléphone avec nom du restaurant
      const { data: driver, error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('id, restaurant_id, first_name, last_name, phone_number, email, password, is_active, france_restaurants(name)')
        .eq('phone_number', normalizedPhone)
        .single();

      console.log('🔍 [AuthFrance] Recherche livreur:', { 
        normalizedPhone, 
        driver, 
        error 
      });

      if (error || !driver) {
        console.error('Livreur non trouvé:', error);
        return { success: false, message: 'Livreur non trouvé' };
      }

      if (!driver.is_active) {
        return { success: false, message: 'Compte livreur désactivé' };
      }

      // Vérifier le code à 6 chiffres
      console.log('🔐 [AuthFrance] Vérification code:', {
        provided: password,
        stored: driver.password,
        match: driver.password === password
      });

      if (driver.password !== password) {
        return { success: false, message: 'Code incorrect' };
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
        restaurantName: driver.france_restaurants?.[0]?.name,
        phoneNumber: normalizedPhone,
        email: driver.email,
        restaurantId: driver.restaurant_id,
        isActive: driver.is_active
      };

      this.setCurrentUser(user);
      
      // NOUVEAU: Démarrer monitoring session pour livreur
      this.driverSessionMonitorService.startMonitoring(user.id);
      
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
   * NOUVEAU : Authentifier un livreur par token (méthode publique)
   * Utilisée par le service delivery-token pour l'auto-login
   */
  public authenticateDriverByToken(driver: FranceUser): void {
    this.setCurrentUser(driver);
    
    // NOUVEAU: Démarrer monitoring session pour livreur authentifié par token
    if (driver.type === 'driver') {
      this.driverSessionMonitorService.startMonitoring(driver.id);
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      // NOUVEAU: Arrêter monitoring avant déconnexion
      this.driverSessionMonitorService.stopMonitoring();
      
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
      
      // Sessions plus longues pour les livreurs (30 jours) vs restaurants (24h)
      if (sessionData.user_type === 'driver') {
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours pour livreurs
        console.log('👤 [AuthFrance] Session livreur - 30 jours');
      } else {
        expiresAt.setHours(expiresAt.getHours() + 24); // 24h pour restaurants
      }

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
        .select('user_id, user_type, session_token')
        .eq('id', sessionId)
        .single();


      if (error || !session) {
        console.error('❌ [AuthFrance] Session non trouvée ou erreur:', error);
        return null;
      }

      if (session.user_type === 'restaurant') {
        
        const { data: restaurant, error: restError } = await this.supabaseFranceService.client
          .from('france_restaurants')
          .select('id, name, phone, whatsapp_number, is_active')
          .eq('id', session.user_id)
          .single();


        if (restaurant && !restError) {
          return {
            id: restaurant.id,
            type: 'restaurant',
            name: restaurant.name,
            phoneNumber: restaurant.whatsapp_number || restaurant.phone,
            restaurantId: restaurant.id,
            isActive: restaurant.is_active
          };
        }
      } else if (session.user_type === 'driver') {
        console.log('🚴 [AuthFrance] Récupération données livreur...');
        
        const { data: driver, error: driverError } = await this.supabaseFranceService.client
          .from('france_delivery_drivers')
          .select('id, restaurant_id, first_name, last_name, phone_number, email, is_active, france_restaurants(name)')
          .eq('id', session.user_id)
          .single();

        console.log('🚴 [AuthFrance] Livreur récupéré:', { driver, driverError });

        if (driver && !driverError) {
          return {
            id: driver.id,
            type: 'driver',
            firstName: driver.first_name,
            lastName: driver.last_name,
            restaurantName: driver.france_restaurants?.[0]?.name,
            phoneNumber: driver.phone_number,
            email: driver.email,
            restaurantId: driver.restaurant_id,
            isActive: driver.is_active
          };
        }
      }

      console.warn('⚠️ [AuthFrance] Type utilisateur non géré ou données manquantes');
      return null;
    } catch (error) {
      console.error('❌ [AuthFrance] Erreur récupération utilisateur:', error);
      return null;
    }
  }

  /**
   * Créer le premier mot de passe d'un restaurant
   */
  private async createFirstPassword(restaurantId: number, password: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_restaurants')
        .update({
          password_hash: password,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      return !error;
    } catch (error) {
      console.error('❌ [AuthFrance] Erreur création premier mot de passe:', error);
      return false;
    }
  }

  /**
   * Vérifier mot de passe (obsolète - gardé pour compatibilité restaurants)
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      // Comparaison simple pour les restaurants
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
    const user = this.currentUserSubject.value;
    return user === undefined ? null : user;
  }

  /**
   * Vérifier si authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Récupérer l'ID du restaurant connecté
   * Retourne null si pas authentifié - permet de détecter les erreurs
   */
  getCurrentRestaurantId(): number | null {
    const user = this.getCurrentUser();

    if (user && user.restaurantId) {
      return user.restaurantId;
    }

    console.error('❌ Aucun restaurant connecté - getCurrentRestaurantId() retourne null');
    return null;
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