import { Injectable } from '@angular/core';

/**
 * Service global de gestion du fuseau horaire
 * Centralise la gestion des dates et heures selon le fuseau utilisateur
 */
@Injectable({
  providedIn: 'root'
})
export class FuseauHoraireService {

  // Configuration par défaut : Europe/Paris (UTC+1/+2 selon saison)
  private readonly DEFAULT_TIMEZONE = 'Europe/Paris';
  
  constructor() {}

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
    const now = new Date();
    // Utilise toISOString() mais compense le décalage UTC
    const offset = now.getTimezoneOffset();
    const localTime = new Date(now.getTime() - (offset * 60 * 1000));
    return localTime.toISOString();
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
}