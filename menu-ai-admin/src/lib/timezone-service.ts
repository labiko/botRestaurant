// 🌍 SERVICE CENTRALISÉ DE GESTION DES TIMEZONES
// ================================================
// Corrige le décalage 2h entre UTC et Europe/Paris
// Centralise toute la gestion des dates/heures du projet

/**
 * Service centralisé pour la gestion des fuseaux horaires
 * Résout le problème de décalage 2h (UTC vs Europe/Paris)
 */
export class TimezoneService {
  private static readonly TIMEZONE = 'Europe/Paris';
  private static readonly LOCALE = 'fr-FR';

  /**
   * Obtient l'heure actuelle pour insertion en base de données
   * Retourne un timestamp au format ISO avec le bon fuseau
   * Remplace: new Date().toISOString()
   */
  static getCurrentTimeForDB(): string {
    // Pour les colonnes "timestamp with time zone", utiliser directement
    // l'heure locale avec l'offset correct
    const now = new Date();

    // Obtenir l'offset actuel de Europe/Paris (en minutes)
    const offsetMinutes = this.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;
    const offsetSign = offsetMinutes <= 0 ? '+' : '-';
    const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;

    // Créer le timestamp avec l'offset correct
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: this.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const formatted = formatter.format(now);

    // Retourner avec l'offset Europe/Paris au lieu de Z
    return formatted.replace(' ', 'T') + '.000' + offsetString;
  }

  /**
   * Obtient l'offset de timezone en minutes pour Europe/Paris
   */
  private static getTimezoneOffset(): number {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const parisTime = new Date(utc.toLocaleString('en-US', { timeZone: this.TIMEZONE }));
    return (parisTime.getTime() - utc.getTime()) / 60000;
  }

  /**
   * Formate une date pour l'affichage avec le bon fuseau
   * Remplace: new Date(dateString).toLocaleString('fr-FR')
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString(this.LOCALE, {
      timeZone: this.TIMEZONE
    });
  }

  /**
   * Formate une date avec des options personnalisées
   * Compatible avec le format existant du projet
   */
  static formatDateWithOptions(
    dateString: string,
    options: Intl.DateTimeFormatOptions
  ): string {
    return new Date(dateString).toLocaleString(this.LOCALE, {
      timeZone: this.TIMEZONE,
      ...options
    });
  }

  /**
   * Formate seulement la date (jour/mois)
   * Remplace: new Date(script.created_at).toLocaleDateString('fr-FR', {...})
   */
  static formatDateOnly(
    dateString: string,
    options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit'
    }
  ): string {
    return new Date(dateString).toLocaleDateString(this.LOCALE, {
      timeZone: this.TIMEZONE,
      ...options
    });
  }

  /**
   * Formate seulement l'heure
   * Remplace: new Date(script.created_at).toLocaleTimeString('fr-FR', {...})
   */
  static formatTimeOnly(
    dateString: string,
    options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    }
  ): string {
    return new Date(dateString).toLocaleTimeString(this.LOCALE, {
      timeZone: this.TIMEZONE,
      ...options
    });
  }

  /**
   * Debug - Affiche les informations de timezone
   */
  static debugTimezone(): void {
    const now = new Date();
    console.log('🌍 [TimezoneService] Debug:');
    console.log('- Timezone configuré:', this.TIMEZONE);
    console.log('- Heure locale navigateur:', now.toString());
    console.log('- Heure UTC:', now.toUTCString());
    console.log('- Pour BDD (nouveau):', this.getCurrentTimeForDB());
    console.log('- Pour BDD (ancien):', now.toISOString());
    console.log('- Décalage détecté:', now.getTimezoneOffset(), 'minutes');
    console.log('- Offset Europe/Paris:', this.getTimezoneOffset(), 'minutes');

    // Test de formatage
    const testDate = this.getCurrentTimeForDB();
    console.log('- Test formatage:', this.formatDate(testDate));
  }
}

// Export par défaut pour compatibilité
export default TimezoneService;