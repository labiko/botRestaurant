import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface RestaurantSchedule {
  restaurant_id: number;
  day_of_week: number; // 0=dimanche, 1=lundi, ..., 6=samedi
  open_time: string;   // Format "HH:MM"
  close_time: string;  // Format "HH:MM"
  is_closed: boolean;  // Fermé exceptionnellement ce jour
}

export interface RestaurantStatus {
  id: number;
  name: string;
  status: 'ouvert' | 'ferme' | 'temporairement_ferme';
  current_schedule: RestaurantSchedule[];
  is_open_now: boolean;
  next_opening: string | null;
  reason_closed?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private supabase: SupabaseService) { }

  async getRestaurantSchedule(restaurantId: number): Promise<RestaurantSchedule[]> {
    const { data } = await this.supabase
      .from('restaurant_horaires')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('day_of_week');
    return data || [];
  }

  async updateSchedule(restaurantId: number, schedule: RestaurantSchedule[]): Promise<void> {
    // Supprimer les anciens horaires
    await this.supabase
      .from('restaurant_horaires')
      .delete()
      .eq('restaurant_id', restaurantId);

    // Insérer les nouveaux
    if (schedule.length > 0) {
      await this.supabase
        .from('restaurant_horaires')
        .insert(schedule);
    }
  }

  async updateRestaurantStatus(restaurantId: number, status: string, reason?: string): Promise<void> {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString()
    };
    
    if (reason) {
      updateData.reason_closed = reason;
    }

    await this.supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', restaurantId);
  }

  isRestaurantOpen(schedule: RestaurantSchedule[], currentStatus: string): {
    isOpen: boolean;
    reason: 'status_closed' | 'outside_hours' | 'temporarily_closed' | 'open';
    nextOpenTime?: string;
  } {
    // Même logique que dans le bot WhatsApp
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    // Vérifier le statut général
    if (currentStatus === 'ferme') {
      return { isOpen: false, reason: 'status_closed' };
    }

    if (currentStatus === 'temporairement_ferme') {
      return { isOpen: false, reason: 'temporarily_closed' };
    }

    // Vérifier les horaires du jour
    const todaySchedule = schedule.find(s => s.day_of_week === currentDay);
    
    if (!todaySchedule || todaySchedule.is_closed) {
      // Trouver la prochaine ouverture
      const nextOpenTime = this.findNextOpenTime(schedule, now);
      return { isOpen: false, reason: 'outside_hours', nextOpenTime };
    }

    // Vérifier si dans les horaires
    if (currentTime >= todaySchedule.open_time && currentTime <= todaySchedule.close_time) {
      return { isOpen: true, reason: 'open' };
    }

    const nextOpenTime = this.findNextOpenTime(schedule, now);
    return { isOpen: false, reason: 'outside_hours', nextOpenTime };
  }

  private findNextOpenTime(schedule: RestaurantSchedule[], from: Date): string {
    const currentDay = from.getDay();
    const currentTime = from.toTimeString().slice(0, 5);

    // Chercher dans les 7 prochains jours
    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const daySchedule = schedule.find(s => s.day_of_week === checkDay);
      
      if (daySchedule && !daySchedule.is_closed) {
        // Si c'est aujourd'hui, vérifier si l'heure d'ouverture est dans le futur
        if (i === 0 && currentTime < daySchedule.open_time) {
          return `Aujourd'hui à ${daySchedule.open_time}`;
        }
        // Si c'est un autre jour
        else if (i > 0) {
          const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          return `${dayNames[checkDay]} à ${daySchedule.open_time}`;
        }
      }
    }

    return 'Horaires non définis';
  }

  async getRestaurantStatus(restaurantId: number): Promise<RestaurantStatus | null> {
    const { data: restaurant } = await this.supabase
      .from('restaurants')
      .select('id, nom, status, reason_closed')
      .eq('id', restaurantId)
      .single();

    if (!restaurant) return null;

    const schedule = await this.getRestaurantSchedule(restaurantId);
    const openStatus = this.isRestaurantOpen(schedule, restaurant.status);

    return {
      id: restaurant.id,
      name: restaurant.nom,
      status: restaurant.status,
      current_schedule: schedule,
      is_open_now: openStatus.isOpen,
      next_opening: openStatus.nextOpenTime || null,
      reason_closed: restaurant.reason_closed
    };
  }

  getWeekDays() {
    return [
      { name: 'Dimanche', value: 0 },
      { name: 'Lundi', value: 1 },
      { name: 'Mardi', value: 2 },
      { name: 'Mercredi', value: 3 },
      { name: 'Jeudi', value: 4 },
      { name: 'Vendredi', value: 5 },
      { name: 'Samedi', value: 6 }
    ];
  }
}