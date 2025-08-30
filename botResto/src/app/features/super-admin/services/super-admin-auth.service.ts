import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from '../../../core/services/supabase.service';

export interface SuperAdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'support';
  permissions: string[];
  mfaEnabled: boolean;
  lastLogin: Date;
  createdAt: Date;
}

export interface LoginResult {
  success: boolean;
  requiresMfa: boolean;
  user?: SuperAdminUser;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminAuthService {
  private currentUserSubject = new BehaviorSubject<SuperAdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private sessionTimeout: any;
  private readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 heures
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor(private supabase: SupabaseService) {
    this.loadStoredUser();
    this.setupInactivityTimer();
  }

  /**
   * Connexion du super admin
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Vérifier les credentials en base
      const { data: admin, error } = await this.supabase
        .from('super_admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !admin) {
        return { success: false, requiresMfa: false, error: 'Utilisateur non trouvé' };
      }

      // Vérifier le mot de passe (en production, utiliser un hash sécurisé)
      const isValidPassword = await this.verifyPassword(password, admin.password_hash);
      
      if (!isValidPassword) {
        return { success: false, requiresMfa: false, error: 'Mot de passe incorrect' };
      }

      // Si 2FA activé, demander le code
      if (admin.mfa_secret) {
        // Stocker temporairement les infos pour la vérification MFA
        this.storeTemporarySession(admin);
        return { success: false, requiresMfa: true };
      }

      // Connexion réussie sans 2FA
      const user = this.mapToSuperAdminUser(admin);
      this.setCurrentUser(user);
      await this.updateLastLogin(admin.id);
      
      return { success: true, requiresMfa: false, user };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, requiresMfa: false, error: 'Erreur système' };
    }
  }

  /**
   * Vérification du code MFA
   */
  async verifyMfa(code: string): Promise<LoginResult> {
    try {
      const tempSession = this.getTemporarySession();
      if (!tempSession) {
        return { success: false, requiresMfa: false, error: 'Session expirée' };
      }

      // Vérifier le code 2FA (implémentation simplifiée)
      const isValidCode = await this.verifyTotpCode(tempSession.mfa_secret, code);
      
      if (!isValidCode) {
        return { success: false, requiresMfa: false, error: 'Code incorrect' };
      }

      // Connexion réussie avec 2FA
      const user = this.mapToSuperAdminUser(tempSession);
      this.setCurrentUser(user);
      await this.updateLastLogin(tempSession.id);
      this.clearTemporarySession();

      return { success: true, requiresMfa: false, user };
    } catch (error) {
      console.error('Erreur lors de la vérification MFA:', error);
      return { success: false, requiresMfa: false, error: 'Erreur système' };
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    this.currentUserSubject.next(null);
    this.clearStoredUser();
    this.clearTemporarySession();
    this.clearSessionTimeout();
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): SuperAdminUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifier les permissions
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions.includes(permission) || false;
  }

  /**
   * Vérifier le rôle
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Renouveler la session
   */
  refreshSession(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.setCurrentUser(user); // Remet à jour les timeouts
    }
  }

  /**
   * Vérifier la validité de la session
   */
  async validateSession(): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;

    try {
      // Vérifier que l'utilisateur existe encore en base
      const { data, error } = await this.supabase
        .from('super_admins')
        .select('id, email, role')
        .eq('id', user.id)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Erreur validation session:', error);
      return false;
    }
  }

  // ========== MÉTHODES PRIVÉES ==========

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Implémentation simplifiée - en production, utiliser bcrypt ou similaire
    return password === hash; // À remplacer par une vraie vérification de hash
  }

  private async verifyTotpCode(secret: string, code: string): Promise<boolean> {
    // Implémentation simplifiée du TOTP - en production, utiliser une lib dédiée
    return code === '123456'; // Code de test
  }

  private mapToSuperAdminUser(admin: any): SuperAdminUser {
    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || [],
      mfaEnabled: !!admin.mfa_secret,
      lastLogin: admin.last_login ? new Date(admin.last_login) : new Date(),
      createdAt: new Date(admin.created_at)
    };
  }

  private setCurrentUser(user: SuperAdminUser): void {
    this.currentUserSubject.next(user);
    this.storeUser(user);
    this.setupSessionTimeout();
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('super_admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Erreur mise à jour dernière connexion:', error);
    }
  }

  private storeUser(user: SuperAdminUser): void {
    localStorage.setItem('super_admin_user', JSON.stringify(user));
    localStorage.setItem('super_admin_login_time', new Date().getTime().toString());
  }

  private loadStoredUser(): void {
    try {
      const storedUser = localStorage.getItem('super_admin_user');
      const loginTime = localStorage.getItem('super_admin_login_time');

      if (storedUser && loginTime) {
        const user = JSON.parse(storedUser);
        const loginTimestamp = parseInt(loginTime);
        const now = new Date().getTime();

        // Vérifier si la session n'a pas expiré
        if (now - loginTimestamp < this.SESSION_DURATION) {
          this.currentUserSubject.next(user);
          this.setupSessionTimeout();
        } else {
          this.clearStoredUser();
        }
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur stocké:', error);
      this.clearStoredUser();
    }
  }

  private clearStoredUser(): void {
    localStorage.removeItem('super_admin_user');
    localStorage.removeItem('super_admin_login_time');
  }

  private storeTemporarySession(admin: any): void {
    sessionStorage.setItem('temp_admin_session', JSON.stringify(admin));
  }

  private getTemporarySession(): any {
    const temp = sessionStorage.getItem('temp_admin_session');
    return temp ? JSON.parse(temp) : null;
  }

  private clearTemporarySession(): void {
    sessionStorage.removeItem('temp_admin_session');
  }

  private setupSessionTimeout(): void {
    this.clearSessionTimeout();
    
    this.sessionTimeout = setTimeout(() => {
      this.logout();
      console.log('Session expirée - déconnexion automatique');
    }, this.SESSION_DURATION);
  }

  private clearSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  private setupInactivityTimer(): void {
    let inactivityTimer: any;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      if (this.isAuthenticated()) {
        inactivityTimer = setTimeout(() => {
          this.logout();
          console.log('Inactivité détectée - déconnexion automatique');
        }, this.INACTIVITY_TIMEOUT);
      }
    };

    // Écouter les événements d'activité
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Initialiser le timer
    resetInactivityTimer();
  }
}