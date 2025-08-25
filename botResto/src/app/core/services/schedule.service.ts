import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface RestaurantSchedule {
  restaurant_id: string;
  day_of_week: number; // 0=dimanche, 1=lundi, ..., 6=samedi
  open_time: string;   // Format "HH:MM"
  close_time: string;  // Format "HH:MM"
  is_closed: boolean;  // Fermé exceptionnellement ce jour
}

export interface RestaurantStatus {
  id: string;
  name: string;
  status: 'ouvert' | 'ferme' | 'temporairement_ferme';
  current_schedule: RestaurantSchedule[];
  is_open_now: boolean;
  next_opening: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private supabase: SupabaseService) { }

  async getRestaurantSchedule(restaurantId: string): Promise<RestaurantSchedule[]> {
    const { data } = await this.supabase
      .from('restaurants')
      .select('horaires')
      .eq('id', restaurantId)
      .single();
    
    if (!data?.horaires) {
      // Return default schedule if no horaires found
      return this.getDefaultSchedule(restaurantId);
    }
    
    // Convert JSONB horaires to RestaurantSchedule array
    const horaires = data.horaires;
    const schedule: RestaurantSchedule[] = [];
    
    const dayMap = {
      'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4,
      'vendredi': 5, 'samedi': 6, 'dimanche': 0
    };
    
    Object.entries(horaires).forEach(([day, hours]: [string, any]) => {
      if (hours && typeof hours === 'object') {
        // Use existing database values directly
        const openTime = hours.ouverture || '09:00';
        const closeTime = hours.fermeture || '18:00';
        
        schedule.push({
          restaurant_id: restaurantId,
          day_of_week: dayMap[day as keyof typeof dayMap] || 0,
          open_time: openTime,
          close_time: closeTime,
          is_closed: hours.ferme === true // Convert: ferme=true means closed
        });
      }
    });
    
    // Sort by day order
    schedule.sort((a, b) => a.day_of_week - b.day_of_week);
    
    return schedule;
  }

  private getDefaultSchedule(restaurantId: string): RestaurantSchedule[] {
    return [
      { restaurant_id: restaurantId, day_of_week: 0, open_time: '11:00', close_time: '22:00', is_closed: false }, // Dimanche
      { restaurant_id: restaurantId, day_of_week: 1, open_time: '19:00', close_time: '22:00', is_closed: false }, // Lundi
      { restaurant_id: restaurantId, day_of_week: 2, open_time: '19:00', close_time: '22:00', is_closed: false }, // Mardi
      { restaurant_id: restaurantId, day_of_week: 3, open_time: '19:00', close_time: '22:00', is_closed: false }, // Mercredi
      { restaurant_id: restaurantId, day_of_week: 4, open_time: '19:00', close_time: '22:00', is_closed: false }, // Jeudi
      { restaurant_id: restaurantId, day_of_week: 5, open_time: '19:00', close_time: '23:00', is_closed: false }, // Vendredi
      { restaurant_id: restaurantId, day_of_week: 6, open_time: '19:00', close_time: '23:00', is_closed: false }  // Samedi
    ];
  }

  async updateSchedule(restaurantId: string, schedule: RestaurantSchedule[]): Promise<void> {
    // Convert schedule array back to JSONB format
    const horaires: any = {};
    
    const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    
    schedule.forEach(item => {
      const dayName = dayNames[item.day_of_week];
      horaires[dayName] = {
        ouverture: item.open_time,
        fermeture: item.close_time,
        ferme: item.is_closed
      };
    });

    // Update restaurant horaires JSONB column
    await this.supabase
      .from('restaurants')
      .update({ horaires })
      .eq('id', restaurantId);
  }

  async updateRestaurantStatus(restaurantId: string, status: string, reason?: string): Promise<void> {
    const updateData: any = { 
      statut: status, 
      updated_at: new Date().toISOString()
    };

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

  async getRestaurantStatus(restaurantId: string): Promise<RestaurantStatus | null> {
    const { data: restaurant } = await this.supabase
      .from('restaurants')
      .select('id, nom, statut')
      .eq('id', restaurantId)
      .single();

    if (!restaurant) return null;

    const schedule = await this.getRestaurantSchedule(restaurantId);
    const openStatus = this.isRestaurantOpen(schedule, restaurant.statut);

    return {
      id: restaurant.id,
      name: restaurant.nom,
      status: restaurant.statut,
      current_schedule: schedule,
      is_open_now: openStatus.isOpen,
      next_opening: openStatus.nextOpenTime || null
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