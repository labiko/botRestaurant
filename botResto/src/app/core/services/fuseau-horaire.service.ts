import { Injectable } from '@angular/core';
import { SupabaseFranceService } from './supabase-france.service';
import { AuthFranceService } from '../../features/restaurant-france/auth-france/services/auth-france.service';

/**
 * Service universel de gestion des fuseaux horaires
 * Supporte dynamiquement les fuseaux selon le restaurant
 * Compatible France (Europe/Paris) et Guinée-Conakry (Africa/Conakry)
 */
@Injectable({
  providedIn: 'root'
})
export class FuseauHoraireService {

  // Configuration par défaut : Europe/Paris (UTC+1/+2 selon saison)
  private readonly DEFAULT_TIMEZONE = 'Europe/Paris';
  
  // Cache des fuseaux horaires par restaurant pour performance
  private restaurantTimezoneCache = new Map<number, string>();
  
  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private authFranceService: AuthFranceService
  ) {}

  /**
   * Obtenir l'heure actuelle dans le fuseau configuré
   * Retourne un objet Date dans le fuseau local utilisateur
   */
  getCurrentTime(): Date {
    return new Date();
  }

  /**
   * Obtenir l'heure actuelle formatée pour la base de données
   * Respecte le fuseau horaire local sans conversion UTC forcée
   */
  getCurrentTimeForDatabase(): string {
    const now = this.getCurrentTime();
    // Pour timestamp without time zone, on retourne directement l'heure UTC
    // PostgreSQL stockera la valeur sans conversion
    return now.toISOString();
  }

  /**
   * NOUVEAU : Récupérer le fuseau horaire d'un restaurant
   */
  async getRestaurantTimezone(restaurantId: number): Promise<string> {
    // Vérifier le cache d'abord
    if (this.restaurantTimezoneCache.has(restaurantId)) {
      return this.restaurantTimezoneCache.get(restaurantId)!;
    }

    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_restaurants')
        .select('timezone')
        .eq('id', restaurantId)
        .single();

      if (error || !data) {
        console.warn(`⚠️ [FuseauHoraire] Impossible de récupérer timezone pour restaurant ${restaurantId}, utilisation par défaut`);
        this.restaurantTimezoneCache.set(restaurantId, this.DEFAULT_TIMEZONE);
        return this.DEFAULT_TIMEZONE;
      }

      const timezone = data.timezone || this.DEFAULT_TIMEZONE;
      this.restaurantTimezoneCache.set(restaurantId, timezone);
      console.log(`🌍 [FuseauHoraire] Restaurant ${restaurantId} → ${timezone}`);
      return timezone;

    } catch (error) {
      console.error(`❌ [FuseauHoraire] Erreur récupération timezone restaurant ${restaurantId}:`, error);
      return this.DEFAULT_TIMEZONE;
    }
  }

  /**
   * NOUVEAU : Obtenir l'heure actuelle dans le fuseau du restaurant
   */
  async getRestaurantCurrentTime(restaurantId: number): Promise<Date> {
    const timezone = await this.getRestaurantTimezone(restaurantId);
    const now = new Date();
    
    // Utiliser Intl.DateTimeFormat pour convertir dans le bon fuseau
    const timeInTimezone = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);

    const year = parseInt(timeInTimezone.find(part => part.type === 'year')!.value);
    const month = parseInt(timeInTimezone.find(part => part.type === 'month')!.value) - 1;
    const day = parseInt(timeInTimezone.find(part => part.type === 'day')!.value);
    const hour = parseInt(timeInTimezone.find(part => part.type === 'hour')!.value);
    const minute = parseInt(timeInTimezone.find(part => part.type === 'minute')!.value);
    const second = parseInt(timeInTimezone.find(part => part.type === 'second')!.value);

    return new Date(year, month, day, hour, minute, second);
  }

  /**
   * NOUVEAU : Calculer une date d'expiration future selon le fuseau du restaurant
   */
  async getRestaurantFutureTimeForDatabase(restaurantId: number, minutes: number): Promise<string> {
    const restaurantTime = await this.getRestaurantCurrentTime(restaurantId);
    const future = new Date(restaurantTime.getTime() + (minutes * 60 * 1000));
    
    // CORRECTION : Format local timestamp pour PostgreSQL (pas UTC)
    const year = future.getFullYear();
    const month = String(future.getMonth() + 1).padStart(2, '0');
    const day = String(future.getDate()).padStart(2, '0');
    const hour = String(future.getHours()).padStart(2, '0');
    const minute = String(future.getMinutes()).padStart(2, '0');
    const second = String(future.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  /**
   * NOUVEAU : Calculer une date d'expiration future en heures selon le fuseau du restaurant
   */
  async getRestaurantFutureTimeForDatabaseHours(restaurantId: number, hours: number): Promise<string> {
    return this.getRestaurantFutureTimeForDatabase(restaurantId, hours * 60);
  }

  /**
   * LEGACY : Calculer une date d'expiration future avec le fuseau horaire correct
   * @deprecated Utiliser getRestaurantFutureTimeForDatabase() à la place
   */
  getFutureTimeForDatabase(minutes: number): string {
    const now = this.getCurrentTime();
    const future = new Date(now.getTime() + (minutes * 60 * 1000));
    // Pour timestamp without time zone, on retourne directement l'heure UTC
    return future.toISOString();
  }

  /**
   * Calculer une date d'expiration future en heures avec le fuseau horaire correct
   * @param hours - Nombre d'heures à ajouter à l'heure actuelle
   */
  getFutureTimeForDatabaseHours(hours: number): string {
    return this.getFutureTimeForDatabase(hours * 60);
  }

  /**
   * Convertir une date en format local pour l'affichage
   * @param dateInput - Date ISO string ou Date object
   */
  formatToLocalTime(dateInput: string | Date): Date {
    if (typeof dateInput === 'string') {
      return new Date(dateInput);
    }
    return dateInput;
  }

  /**
   * Calculer la différence en minutes entre deux dates
   * @param dateRecente - Date la plus récente
   * @param dateAncienne - Date la plus ancienne
   */
  getDifferenceInMinutes(dateRecente: string | Date, dateAncienne: string | Date): number {
    const recent = this.formatToLocalTime(dateRecente);
    const ancienne = this.formatToLocalTime(dateAncienne);
    
    const diffMs = recent.getTime() - ancienne.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  /**
   * Formatter un délai en texte lisible (ex: "il y a 5 min")
   * @param minutes - Nombre de minutes écoulées
   */
  formatTimeAgo(minutes: number): string {
    if (minutes < 1) {
      return 'il y a quelques instants';
    } else if (minutes === 1) {
      return 'il y a 1 min';
    } else if (minutes < 60) {
      return `il y a ${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      if (hours === 1) {
        return 'il y a 1h';
      } else if (hours < 24) {
        return `il y a ${hours}h`;
      } else {
        const days = Math.floor(hours / 24);
        return `il y a ${days}j`;
      }
    }
  }

  /**
   * Calculer et formatter le temps écoulé depuis une date
   * @param pastDate - Date passée (string ISO ou Date)
   */
  getTimeAgo(pastDate: string | Date): string {
    const now = this.getCurrentTime();
    const minutes = this.getDifferenceInMinutes(now, pastDate);
    return this.formatTimeAgo(minutes);
  }

  /**
   * Obtenir le fuseau horaire actuel du navigateur
   */
  getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || this.DEFAULT_TIMEZONE;
  }

  /**
   * Formatter une date pour l'affichage avec le bon fuseau
   * @param date - Date à formatter
   * @param options - Options de formatage
   */
  formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = this.formatToLocalTime(date);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: this.getUserTimezone(),
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(dateObj);
  }

  /**
   * Débugger les informations de fuseau horaire
   */
  debugTimezoneInfo(): void {
    const now = new Date();
    console.log('🌍 [FuseauHoraire] Informations fuseau horaire:');
    console.log('- Fuseau détecté:', this.getUserTimezone());
    console.log('- Heure locale:', now.toString());
    console.log('- Heure UTC:', now.toUTCString());
    console.log('- Offset (min):', now.getTimezoneOffset());
    console.log('- Pour BDD:', this.getCurrentTimeForDatabase());
  }

  /**
   * NOUVEAU : Obtenir l'heure actuelle formatée pour la base de données
   * Récupère automatiquement le restaurant_id depuis l'utilisateur connecté
   * Idéal pour les mises à jour d'updated_at sans passer de paramètres
   */
  async getCurrentDatabaseTimeForRestaurant(): Promise<string> {
    try {
      // Récupérer l'utilisateur connecté pour obtenir le restaurant_id
      const currentUser = this.authFranceService.getCurrentUser();
      const restaurantId = currentUser?.restaurantId;
      alert(restaurantId)
      if (!restaurantId) {
        throw new Error('Aucun restaurant_id trouvé dans la session utilisateur');
      }
      
      // Utiliser la méthode existante avec 0 minutes (= maintenant)
      return await this.getRestaurantFutureTimeForDatabase(restaurantId, 0);
      
    } catch (error) {
      console.error(`❌ [FuseauHoraire] Erreur getCurrentDatabaseTimeForRestaurant:`, error);
      // Fallback sur l'heure UTC en cas d'erreur
      return this.getCurrentTimeForDatabase();
    }
  }

  /**
   * DEBUG : Tester le fuseau horaire du restaurant de l'utilisateur connecté
   */
  async debugCurrentUserTimezone(): Promise<{restaurantId: number, timezone: string, currentTime: string, formattedTime: string, user: any}> {
    console.log(`🔍 [DEBUG] === Test fuseau horaire pour utilisateur connecté ===`);
    
    try {
      // 1. Récupérer l'utilisateur connecté
      const currentUser = this.authFranceService.getCurrentUser();
      const restaurantId = currentUser?.restaurantId || 1; // Fallback sur 1
      
      console.log(`👤 [DEBUG] Utilisateur connecté:`, currentUser);
      console.log(`🏪 [DEBUG] Restaurant ID récupéré: ${restaurantId}`);
      
      // 2. Récupérer le fuseau horaire du restaurant
      const timezone = await this.getRestaurantTimezone(restaurantId);
      console.log(`🌍 [DEBUG] Fuseau horaire récupéré: ${timezone}`);
      
      // 3. Obtenir l'heure actuelle dans ce fuseau
      const restaurantTime = await this.getRestaurantCurrentTime(restaurantId);
      console.log(`🕒 [DEBUG] Heure actuelle dans ${timezone}:`, restaurantTime);
      
      // 4. Formater pour la base de données
      const formattedTime = await this.getRestaurantFutureTimeForDatabase(restaurantId, 0); // 0 minutes = maintenant
      console.log(`💾 [DEBUG] Heure formatée pour BDD: ${formattedTime}`);
      
      const result = {
        restaurantId,
        timezone,
        currentTime: restaurantTime.toString(),
        formattedTime,
        user: currentUser
      };
      
      console.log(`✅ [DEBUG] Résultat complet:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ [DEBUG] Erreur debug fuseau horaire utilisateur:`, error);
      throw error;
    }
  }
}