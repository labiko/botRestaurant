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

      // Get restaurant details separately
      const { data: restaurant, error: restaurantError } = await this.supabase
        .from('restaurants')
        .select('id, nom, latitude, longitude')
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
            longitude: restaurant.longitude
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

  async loginDelivery(phone: string, code: string): Promise<boolean> {
    try {
      // Query delivery_users table for authentication
      const { data: deliveryUser, error: userError } = await this.supabase
        .from('delivery_users')
        .select('*')
        .eq('telephone', phone)
        .eq('code_acces', code)
        .eq('status', 'actif')
        .single();
      
      if (userError || !deliveryUser) {
        console.error('Delivery user not found or invalid code:', userError);
        return false;
      }

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
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async logout() {
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
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }
}