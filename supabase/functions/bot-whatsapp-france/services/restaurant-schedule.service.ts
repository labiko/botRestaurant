/**
 * 🕒 Service dédié pour la gestion des horaires de restaurant
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
  private readonly TIMEZONE = 'Europe/Paris';
  private readonly DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  /**
   * Vérification principale des horaires d'un restaurant
   * Ordre de priorité : fermeture exceptionnelle > statut actif > horaires normaux
   */
  checkRestaurantSchedule(restaurant: any): ScheduleCheckResult {
    console.log(`🕒 [ScheduleService] Vérification horaires pour: ${restaurant.name}`);
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
        status: 'no_schedule',
        message: `🕒 **${restaurant.name}** - Horaires non disponibles.\n\n📞 Contactez le restaurant directement.`
      };
    }

    const now = new Date();
    const currentDay = this.getCurrentDayKey(now);
    const currentTime = this.getCurrentTime(now);
    
    console.log(`🕒 [ScheduleService] Jour: ${currentDay}, Heure: ${currentTime}`);
    
    const daySchedule = businessHours[currentDay];
    
    if (!daySchedule) {
      console.log('❌ [ScheduleService] Pas de planning pour ce jour');
      return {
        isOpen: false,
        status: 'closed_today',
        message: `🕒 **${restaurant.name}** est fermé aujourd'hui.`,
        nextOpenTime: this.calculateNextOpenTime(businessHours, now)
      };
    }

    if (!daySchedule.isOpen) {
      console.log('❌ [ScheduleService] Restaurant fermé ce jour');
      return {
        isOpen: false,
        status: 'closed_today',
        message: `🕒 **${restaurant.name}** est fermé aujourd'hui.`,
        nextOpenTime: this.calculateNextOpenTime(businessHours, now)
      };
    }

    // Vérification des heures d'ouverture
    const isCurrentlyOpen = this.isTimeInRange(
      currentTime, 
      daySchedule.opening!, 
      daySchedule.closing!
    );

    if (isCurrentlyOpen) {
      console.log('✅ [ScheduleService] Restaurant ouvert!');
      return {
        isOpen: true,
        status: 'open',
        currentSchedule: {
          opening: daySchedule.opening!,
          closing: daySchedule.closing!
        }
      };
    }

    console.log('❌ [ScheduleService] Restaurant fermé - hors horaires');
    return {
      isOpen: false,
      status: 'outside_hours',
      message: `🕒 **${restaurant.name}** est actuellement fermé.\n\n⏰ **Horaires aujourd'hui :** ${daySchedule.opening} - ${daySchedule.closing}`,
      nextOpenTime: this.calculateNextOpenTime(businessHours, now),
      currentSchedule: {
        opening: daySchedule.opening!,
        closing: daySchedule.closing!
      }
    };
  }

  /**
   * Génère un message personnalisé selon le statut
   */
  getScheduleMessage(scheduleResult: ScheduleCheckResult, restaurantName: string): string {
    if (scheduleResult.isOpen) {
      return `🟢 **${restaurantName}** ouvert`;
    }

    // Gestion des différents types de fermeture
    switch (scheduleResult.status) {
      case 'exceptionally_closed':
        return `🔴 **${restaurantName}** fermé · Fermeture exceptionnelle`;
      
      case 'inactive':
        return `🔴 **${restaurantName}** fermé · Restaurant indisponible`;
      
      case 'no_schedule':
        return `🔴 **${restaurantName}** fermé · Horaires à consulter`;
      
      default:
        // Fermeture normale (outside_hours, closed_today)
        const nextOpen = scheduleResult.nextOpenTime || 'Horaires à consulter';
        return `🔴 **${restaurantName}** fermé · Ouverture ${nextOpen.toLowerCase()}`;
    }
  }

  /**
   * Calcule la prochaine heure d'ouverture
   */
  private calculateNextOpenTime(businessHours: BusinessHours, currentDate: Date): string {
    const currentDayIndex = currentDate.getDay();
    const currentTime = this.getCurrentTime(currentDate);
    
    // Vérifier si le restaurant ouvre encore aujourd'hui
    const todayKey = this.DAYS[currentDayIndex];
    const today = businessHours[todayKey];
    
    if (today && today.isOpen && today.opening && currentTime < today.opening) {
      return `Aujourd'hui à ${today.opening}`;
    }
    
    // Chercher dans les 7 prochains jours
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDayKey = this.DAYS[nextDayIndex];
      const nextDay = businessHours[nextDayKey];
      
      if (nextDay && nextDay.isOpen && nextDay.opening) {
        const dayName = i === 1 ? 'Demain' : this.capitalizeDayName(nextDayKey);
        return `${dayName} à ${nextDay.opening}`;
      }
    }
    
    return 'Horaires à consulter';
  }

  /**
   * Vérifie si l'heure actuelle est dans la plage d'ouverture
   */
  private isTimeInRange(currentTime: string, opening: string, closing: string): boolean {
    // Gestion des horaires qui passent minuit (ex: 20:00 - 02:00)
    const isOvernight = opening > closing;
    
    if (isOvernight) {
      return currentTime >= opening || currentTime <= closing;
    }
    
    return currentTime >= opening && currentTime <= closing;
  }

  /**
   * Obtient la clé du jour actuel en français
   */
  private getCurrentDayKey(date: Date): string {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      timeZone: this.TIMEZONE 
    }).toLowerCase();
  }

  /**
   * Obtient l'heure actuelle au format HH:MM
   */
  private getCurrentTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: this.TIMEZONE
    });
  }

  /**
   * Capitalise le nom du jour
   */
  private capitalizeDayName(dayName: string): string {
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  }

  /**
   * Obtient les horaires complets formatés pour affichage
   */
  getFormattedSchedule(businessHours: BusinessHours): string {
    let schedule = '📅 **Horaires d\'ouverture :**\n\n';
    
    this.DAYS.forEach(day => {
      const daySchedule = businessHours[day];
      const dayName = this.capitalizeDayName(day);
      
      if (!daySchedule || !daySchedule.isOpen) {
        schedule += `${dayName}: Fermé\n`;
      } else {
        schedule += `${dayName}: ${daySchedule.opening} - ${daySchedule.closing}\n`;
      }
    });
    
    return schedule;
  }
}