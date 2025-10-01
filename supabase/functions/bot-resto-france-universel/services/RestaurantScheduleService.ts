/**
 * 🕒 Service dédié pour la gestion des horaires de restaurant - Version universelle
 * Gère la vérification d'ouverture et calcul des prochaines ouvertures
 */

export interface ScheduleCheckResult {
  isOpen: boolean;
  status: 'open' | 'exceptionally_closed' | 'inactive' | 'closed_today' | 'outside_hours' | 'no_schedule';
  message?: string;
  nextOpenTime?: string;
  currentSchedule?: {
    opening: string;
    closing: string;
  };
}

export interface BusinessHours {
  [day: string]: {
    isOpen: boolean;
    opening?: string;
    closing?: string;
  };
}

export class RestaurantScheduleService {
  private readonly DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  /**
   * Vérification principale des horaires d'un restaurant
   * Ordre de priorité : fermeture exceptionnelle > statut actif > horaires normaux
   */
  checkRestaurantSchedule(restaurant: any): ScheduleCheckResult {
    const restaurantTimezone = restaurant.timezone || 'Europe/Paris'; // Fallback par sécurité
    console.log(`🕒 [ScheduleService] Vérification horaires pour: ${restaurant.name || restaurant.nom}`);
    console.log(`🕒 [ScheduleService] is_active: ${restaurant.is_active}`);
    console.log(`🕒 [ScheduleService] is_exceptionally_closed: ${restaurant.is_exceptionally_closed}`);
    
    // CONDITION: Les deux doivent être vraies pour que le restaurant soit ouvert
    // is_active = true ET is_exceptionally_closed = false
    if (!restaurant.is_active || restaurant.is_exceptionally_closed) {
      console.log('🚫 [ScheduleService] Restaurant fermé - Conditions non respectées');
      
      if (restaurant.is_exceptionally_closed) {
        console.log('🚫 [ScheduleService] Raison: Fermeture exceptionnelle');
        return {
          isOpen: false,
          status: 'exceptionally_closed'
        };
      }
      
      if (!restaurant.is_active) {
        console.log('🚫 [ScheduleService] Raison: Restaurant désactivé');
        return {
          isOpen: false,
          status: 'inactive'
        };
      }
    }

    // PRIORITÉ 3: Vérifier horaires normaux
    const businessHours = restaurant.business_hours as BusinessHours;
    
    if (!businessHours || typeof businessHours !== 'object') {
      console.log('❌ [ScheduleService] Pas d\'horaires configurés');
      return {
        isOpen: false,
        status: 'no_schedule'
      };
    }

    // Obtenir le jour actuel en français selon le timezone du restaurant
    const now = new Date();
    const currentDay = this.getCurrentDay(restaurantTimezone);
    const currentTime = this.getCurrentTime(restaurantTimezone);
    
    console.log(`🕒 [ScheduleService] Jour: ${currentDay}, Heure: ${currentTime}`);
    
    const todaySchedule = businessHours[currentDay];
    
    if (!todaySchedule) {
      console.log(`❌ [ScheduleService] Pas d'horaire pour ${currentDay}`);
      return {
        isOpen: false,
        status: 'closed_today',
        nextOpenTime: this.calculateNextOpenTime(businessHours, restaurantTimezone)
      };
    }

    if (!todaySchedule.isOpen) {
      console.log(`🚫 [ScheduleService] Restaurant fermé le ${currentDay}`);
      return {
        isOpen: false,
        status: 'closed_today',
        nextOpenTime: this.calculateNextOpenTime(businessHours, restaurantTimezone)
      };
    }

    // Vérifier si dans les heures d'ouverture
    if (todaySchedule.opening && todaySchedule.closing) {
      const isWithinHours = this.isWithinOperatingHours(
        currentTime, 
        todaySchedule.opening, 
        todaySchedule.closing
      );
      
      console.log(`🕒 [ScheduleService] Horaires ${todaySchedule.opening}-${todaySchedule.closing}, Dans horaires: ${isWithinHours}`);
      
      if (isWithinHours) {
        console.log('✅ [ScheduleService] Restaurant OUVERT');
        return {
          isOpen: true,
          status: 'open',
          currentSchedule: {
            opening: todaySchedule.opening,
            closing: todaySchedule.closing
          }
        };
      } else {
        console.log('🚫 [ScheduleService] Restaurant fermé - Hors horaires');
        return {
          isOpen: false,
          status: 'outside_hours',
          nextOpenTime: this.calculateNextOpenTime(businessHours, restaurantTimezone)
        };
      }
    }

    console.log('❌ [ScheduleService] Horaires non configurés pour aujourd\'hui');
    return {
      isOpen: false,
      status: 'no_schedule'
    };
  }

  /**
   * Génère le message approprié selon le statut
   */
  getScheduleMessage(result: ScheduleCheckResult, restaurantName: string): string {
    switch (result.status) {
      case 'exceptionally_closed':
        return `🔴 **${restaurantName}** fermé · Fermeture exceptionnelle`;
        
      case 'inactive':
        return `⚫ **${restaurantName}** fermé · Restaurant désactivé`;
        
      case 'closed_today':
        const nextOpen = result.nextOpenTime ? `\n🟢 Prochaine ouverture: ${result.nextOpenTime}` : '';
        return `🔴 **${restaurantName}** fermé · Jour de fermeture${nextOpen}`;
        
      case 'outside_hours':
        const nextOpenHours = result.nextOpenTime ? `\n🟢 Prochaine ouverture: ${result.nextOpenTime}` : '';
        return `🔴 **${restaurantName}** fermé · Hors horaires${nextOpenHours}`;
        
      case 'no_schedule':
        return `⚠️ **${restaurantName}** · Horaires non configurés`;
        
      default:
        return `❓ **${restaurantName}** · Statut inconnu`;
    }
  }

  /**
   * Obtient le jour actuel en français
   */
  private getCurrentDay(timezone: string = 'Europe/Paris'): string {
    const now = new Date();
    const localeDateString = now.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short'
    });

    const dayMap: { [key: string]: number } = {
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3,
      'Thu': 4, 'Fri': 5, 'Sat': 6
    };

    const dayIndex = dayMap[localeDateString.split(',')[0]] || 0;
    return this.DAYS[dayIndex];
  }

  /**
   * Obtient l'heure actuelle au format HH:MM
   */
  private getCurrentTime(timezone: string = 'Europe/Paris'): string {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { 
      timeZone: timezone,
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    
    return timeString;
  }

  /**
   * Vérifie si l'heure actuelle est dans les horaires d'ouverture
   */
  private isWithinOperatingHours(currentTime: string, opening: string, closing: string): boolean {
    const [currentH, currentM] = currentTime.split(':').map(Number);
    const [openH, openM] = opening.split(':').map(Number);
    const [closeH, closeM] = closing.split(':').map(Number);
    
    const currentMinutes = currentH * 60 + currentM;
    const openMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;
    
    // Gestion fermeture le lendemain (ex: 23h-2h)
    if (closeMinutes <= openMinutes) {
      closeMinutes += 24 * 60; // Ajouter 24h

      // Si on est avant minuit, comparer normalement
      // Si on est après minuit, ajouter 24h à l'heure actuelle
      const adjustedCurrentMinutes = currentMinutes < openMinutes ?
        currentMinutes + 24 * 60 : currentMinutes;

      const result = adjustedCurrentMinutes >= openMinutes && adjustedCurrentMinutes <= closeMinutes;
      return result;
    }

    const result = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    
    return result;
  }

  /**
   * Calcule la prochaine heure d'ouverture
   */
  private calculateNextOpenTime(businessHours: BusinessHours, timezone: string = 'Europe/Paris'): string {
    const now = new Date();
    const currentDay = this.getCurrentDay(timezone);
    const currentTime = this.getCurrentTime(timezone);
    
    // Chercher dans les 7 prochains jours
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + i);
      const checkDay = this.DAYS[checkDate.getDay()];
      const daySchedule = businessHours[checkDay];
      
      if (daySchedule && daySchedule.isOpen && daySchedule.opening) {
        // Si c'est aujourd'hui, vérifier si ce n'est pas déjà passé
        if (i === 0) {
          const [openH, openM] = daySchedule.opening.split(':').map(Number);
          const [currentH, currentM] = currentTime.split(':').map(Number);
          
          const openMinutes = openH * 60 + openM;
          const currentMinutes = currentH * 60 + currentM;
          
          if (currentMinutes < openMinutes) {
            return `Aujourd'hui ${daySchedule.opening}`;
          }
        } else {
          const dayName = i === 1 ? 'Demain' : this.getDayName(checkDay);
          return `${dayName} ${daySchedule.opening}`;
        }
      }
    }
    
    return 'Horaires à définir';
  }

  /**
   * Convertit le nom du jour en français lisible
   */
  private getDayName(day: string): string {
    const names: {[key: string]: string} = {
      'lundi': 'Lundi',
      'mardi': 'Mardi', 
      'mercredi': 'Mercredi',
      'jeudi': 'Jeudi',
      'vendredi': 'Vendredi',
      'samedi': 'Samedi',
      'dimanche': 'Dimanche'
    };
    return names[day] || day;
  }
}