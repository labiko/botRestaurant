import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  // Auth methods
  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  // Database methods
  from(table: string) {
    return this.supabase.from(table);
  }

  // Restaurant specific methods
  async getRestaurantByEmail(email: string) {
    return await this.supabase
      .from('restaurants')
      .select('*')
      .eq('email', email)
      .single();
  }

  // Delivery specific methods
  async getDeliveryByPhone(phone: string) {
    return await this.supabase
      .from('livreurs')
      .select('*')
      .eq('telephone', phone)
      .single();
  }

  async validateDeliveryCode(phone: string, code: string) {
    const { data, error } = await this.getDeliveryByPhone(phone);
    if (error || !data) return false;
    
    // TODO: Implement proper code validation logic
    // For now, just check if code matches a field in the database
    return data.code_acces === code;
  }
}