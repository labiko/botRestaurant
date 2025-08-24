import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  type: 'restaurant' | 'delivery';
  restaurantId?: number;
  deliveryId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private supabase: SupabaseService) {
    this.checkSession();
  }

  private async checkSession() {
    const session = await this.supabase.getSession();
    if (session) {
      // TODO: Load user details based on session
    }
  }

  async loginRestaurant(email: string, password: string): Promise<boolean> {
    try {
      // First, check if restaurant exists
      const { data: restaurant, error: restaurantError } = await this.supabase.getRestaurantByEmail(email);
      
      if (restaurantError || !restaurant) {
        console.error('Restaurant not found');
        return false;
      }

      // Then authenticate with Supabase Auth (if configured)
      // For now, we'll use a simple password check
      // TODO: Implement proper authentication with Supabase Auth
      
      if (restaurant.password === password) { // This should be properly hashed
        const user: User = {
          id: restaurant.id.toString(),
          email: restaurant.email,
          name: restaurant.nom,
          type: 'restaurant',
          restaurantId: restaurant.id
        };
        
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
      const isValid = await this.supabase.validateDeliveryCode(phone, code);
      
      if (!isValid) {
        console.error('Invalid delivery code');
        return false;
      }

      const { data: delivery } = await this.supabase.getDeliveryByPhone(phone);
      
      if (delivery) {
        const user: User = {
          id: delivery.id.toString(),
          phone: delivery.telephone,
          name: delivery.nom,
          type: 'delivery',
          deliveryId: delivery.id
        };
        
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