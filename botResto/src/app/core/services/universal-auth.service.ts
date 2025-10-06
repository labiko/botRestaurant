import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseFranceService } from './supabase-france.service';

export interface Country {
  id?: number;
  code: string;
  name: string;
  flag: string;
  phone_prefix: string;
  remove_leading_zero: boolean;
  phone_format: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

/**
 * Service centralisé pour la gestion de l'authentification
 * Gère la normalisation des numéros de téléphone de manière dynamique
 * Utilisé par les restaurants ET les livreurs
 */
@Injectable({
  providedIn: 'root'
})
export class UniversalAuthService {

  private countriesSubject = new BehaviorSubject<Country[]>([]);
  public countries$ = this.countriesSubject.asObservable();
  private countriesCache: Country[] = [];

  constructor(
    private supabaseFranceService: SupabaseFranceService
  ) {
    this.loadCountries();
  }

  /**
   * Charge les pays depuis la table Supabase supported_countries
   */
  private async loadCountries(): Promise<void> {
    try {
      console.log('🌍 [UniversalAuth] Chargement pays depuis supported_countries...');

      const { data: countries, error } = await this.supabaseFranceService.client
        .from('supported_countries')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ [UniversalAuth] Erreur chargement pays:', error);
        return;
      }

      if (countries && countries.length > 0) {
        console.log(`✅ [UniversalAuth] ${countries.length} pays chargés:`, countries.map(c => c.name).join(', '));
        this.countriesCache = countries;
        this.countriesSubject.next(this.countriesCache);
      } else {
        console.warn('⚠️ [UniversalAuth] Aucun pays trouvé en base');
      }
    } catch (error) {
      console.error('❌ [UniversalAuth] Erreur lors du chargement des pays:', error);
    }
  }

  /**
   * Formate un numéro local vers le format international
   * @param localNumber Numéro local saisi par l'utilisateur
   * @param countryCode Code pays
   * @returns Numéro au format international
   */
  formatToInternational(localNumber: string, countryCode: string): string {
    const country = this.countriesCache.find(c => c.code === countryCode);
    if (!country) {
      throw new Error(`Pays non supporté: ${countryCode}`);
    }

    // Nettoyer les espaces
    let cleaned = localNumber.replace(/\s/g, '');

    // Enlever le 0 initial si la règle l'exige
    if (country.remove_leading_zero && cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Retourner le format international
    return country.phone_prefix + cleaned;
  }

  /**
   * Obtenir la liste des pays supportés
   * @returns Observable de la liste des pays
   */
  getSupportedCountries(): Observable<Country[]> {
    return this.countries$;
  }

  /**
   * Obtenir la liste des pays supportés de manière synchrone
   * @returns Liste des pays avec leurs informations
   */
  getSupportedCountriesSync(): Array<{code: string, name: string, flag: string, prefix: string}> {
    return this.countriesCache.map(country => ({
      code: country.code,
      name: country.name,
      flag: country.flag,
      prefix: country.phone_prefix
    }));
  }

  /**
   * Rafraîchir la liste des pays
   */
  async refreshCountries(): Promise<void> {
    await this.loadCountries();
  }

  /**
   * Convertir un préfixe téléphonique vers le code pays
   * @param phonePrefix Préfixe téléphonique (ex: '33', '224')
   * @returns Code pays (ex: 'FR', 'GN') ou null si non trouvé
   */
  getCountryCodeFromPrefix(phonePrefix: string): string | null {
    const country = this.countriesCache.find(c => c.phone_prefix === phonePrefix);
    return country ? country.code : null;
  }

  /**
   * Obtenir les informations complètes d'un pays par son préfixe
   * @param phonePrefix Préfixe téléphonique
   * @returns Objet Country ou null
   */
  getCountryByPrefix(phonePrefix: string): Country | null {
    return this.countriesCache.find(c => c.phone_prefix === phonePrefix) || null;
  }

  /**
   * Obtenir les informations complètes d'un pays par son code
   * @param countryCode Code pays (ex: 'FR', 'GN')
   * @returns Objet Country ou null
   */
  getCountryByCode(countryCode: string): Country | null {
    return this.countriesCache.find(c => c.code === countryCode) || null;
  }

  /**
   * Détecte le pays à partir du numéro de téléphone
   * @param phone Numéro de téléphone à analyser
   * @returns Code pays ou null si non détecté
   */
  detectCountryFromPhone(phone: string): string | null {
    // Nettoyer le numéro (espaces, tirets, parenthèses)
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Détection par préfixe international dynamique
    for (const country of this.countriesCache) {
      if (cleaned.startsWith(country.phone_prefix)) {
        return country.code;
      }
    }

    // Détection par format local (patterns regex)
    for (const country of this.countriesCache) {
      try {
        const regex = new RegExp(country.phone_format);
        if (regex.test(cleaned)) {
          return country.code;
        }
      } catch (e) {
        console.warn(`Pattern invalide pour ${country.code}: ${country.phone_format}`);
      }
    }

    return null; // Pays non détecté
  }

  /**
   * Génère tous les formats possibles pour un numéro de téléphone
   * @param phone Numéro de téléphone
   * @param country Code pays optionnel
   * @returns Tableau des formats possibles
   */
  generatePhoneFormats(phone: string, country?: string): string[] {
    const formats: string[] = [];
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Format saisi tel quel (nettoyé)
    formats.push(cleaned);

    // Détecter le pays si non fourni
    const detectedCountry = country || this.detectCountryFromPhone(cleaned);

    if (!detectedCountry) {
      return formats;
    }

    const countryConfig = this.countriesCache.find(c => c.code === detectedCountry);
    if (!countryConfig) {
      return formats;
    }

    const prefix = countryConfig.phone_prefix;
    const removeLeadingZero = countryConfig.remove_leading_zero;

    // Générer les formats selon la configuration du pays
    if (cleaned.startsWith(prefix)) {
      // Format international → local
      const localNumber = cleaned.substring(prefix.length);
      if (removeLeadingZero) {
        formats.push('0' + localNumber);
      }
      formats.push(localNumber);
    } else if (cleaned.startsWith('0') && removeLeadingZero) {
      // Format local avec 0 → international
      formats.push(prefix + cleaned.substring(1));
      formats.push(cleaned.substring(1));
    } else if (!cleaned.startsWith('0')) {
      // Format sans préfixe → ajouter les variantes
      formats.push(prefix + cleaned);
      if (removeLeadingZero) {
        formats.push('0' + cleaned);
      }
    }

    // Supprimer les doublons et retourner
    return [...new Set(formats)];
  }

  /**
   * Normalise un numéro de téléphone en supprimant les caractères non numériques
   * @param phone Numéro de téléphone à normaliser
   * @returns Numéro normalisé (chiffres uniquement)
   */
  normalizePhoneNumber(phone: string): string {
    return phone.replace(/[\s\-\(\)\.]/g, '');
  }

  /**
   * Construit une condition OR pour la recherche SQL
   * @param phoneFormats Tableau de formats de numéro
   * @param fields Champs à rechercher (par défaut: phone et whatsapp_number)
   * @returns Chaîne de condition OR pour Supabase
   */
  buildOrCondition(phoneFormats: string[], fields: string[] = ['phone', 'whatsapp_number']): string {
    const conditions: string[] = [];

    phoneFormats.forEach(format => {
      fields.forEach(field => {
        conditions.push(`${field}.eq.${format}`);
      });
    });

    return conditions.join(',');
  }
}