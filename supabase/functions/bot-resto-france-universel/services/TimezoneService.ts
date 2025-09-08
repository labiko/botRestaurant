/**
 * 🕐 Service centralisé pour la gestion des timezones
 * Fournit un contexte global pour tous les calculs temporels basés sur le timezone du restaurant
 */

export interface RestaurantContext {
  restaurant: any;
  timezone: string;
  getCurrentTime(): Date;
  formatTime(date: Date): string;
  formatDateTime(date: Date): string;
  getCurrentTimeString(): string;
  getCurrentDayName(): string;
  getLocalDate(): Date;
}

export class TimezoneService {
  private currentContext: RestaurantContext | null = null;

  /**
   * Créer un contexte pour un restaurant spécifique
   */
  createContext(restaurant: any): RestaurantContext {
    const timezone = restaurant?.timezone || 'Europe/Paris';
    
    const context: RestaurantContext = {
      restaurant,
      timezone,
      
      /**
       * Obtenir l'heure actuelle dans le timezone du restaurant
       */
      getCurrentTime(): Date {
        return new Date();
      },
      
      /**
       * Formater une heure dans le timezone du restaurant (HH:MM)
       */
      formatTime(date: Date): string {
        return date.toLocaleTimeString('fr-FR', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      },
      
      /**
       * Formater une date complète dans le timezone du restaurant
       */
      formatDateTime(date: Date): string {
        return date.toLocaleString('fr-FR', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      },
      
      /**
       * Obtenir l'heure actuelle formatée (HH:MM)
       */
      getCurrentTimeString(): string {
        return context.formatTime(new Date());
      },
      
      /**
       * Obtenir le nom du jour actuel en français
       */
      getCurrentDayName(): string {
        const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        const date = new Date();
        // Obtenir le jour selon le timezone
        const localeDateString = date.toLocaleDateString('fr-FR', {
          timeZone: timezone,
          weekday: 'long'
        });
        // Extraire le nom du jour et le normaliser
        const dayName = localeDateString.toLowerCase();
        return days.find(d => dayName.includes(d)) || days[date.getDay()];
      },
      
      /**
       * Obtenir une Date dans le timezone local du restaurant
       */
      getLocalDate(): Date {
        // Note: JavaScript Date reste en UTC internalement
        // Cette méthode est pour la compatibilité future
        return new Date();
      }
    };
    
    return context;
  }
  
  /**
   * Définir le contexte actuel (optionnel pour usage global)
   */
  setCurrentContext(restaurant: any): void {
    this.currentContext = this.createContext(restaurant);
  }
  
  /**
   * Obtenir le contexte actuel
   */
  getCurrentContext(): RestaurantContext | null {
    return this.currentContext;
  }
  
  /**
   * Nettoyer le contexte
   */
  clearContext(): void {
    this.currentContext = null;
  }
  
  /**
   * Méthode utilitaire : obtenir l'heure locale pour un timezone donné
   */
  static getTimeInTimezone(timezone: string, date: Date = new Date()): string {
    return date.toLocaleTimeString('fr-FR', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  
  /**
   * Méthode utilitaire : obtenir le jour de la semaine pour un timezone
   */
  static getDayInTimezone(timezone: string, date: Date = new Date()): number {
    const localeDateString = date.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short'
    });
    const dayMap: { [key: string]: number } = {
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3,
      'Thu': 4, 'Fri': 5, 'Sat': 6
    };
    return dayMap[localeDateString.split(',')[0]] || 0;
  }
}