import { Injectable } from '@angular/core';

/**
 * Service centralisé pour la gestion de l'authentification
 * Gère la normalisation des numéros de téléphone pour 3 pays : FR, GN, CI
 * Utilisé par les restaurants ET les livreurs
 */
@Injectable({
  providedIn: 'root'
})
export class UniversalAuthService {

  // Configuration simple par pays
  private readonly COUNTRY_RULES = {
    'FR': {
      prefix: '33',
      removeLeadingZero: true,
      format: /^0[1-9]\d{8}$/,
      name: 'France',
      flag: '🇫🇷'
    },
    'GN': {
      prefix: '224',
      removeLeadingZero: false,
      format: /^6\d{8}$/,
      name: 'Guinée',
      flag: '🇬🇳'
    },
    'CI': {
      prefix: '225',
      removeLeadingZero: true,
      format: /^0[4-7]\d{7}$/,
      name: 'Côte d\'Ivoire',
      flag: '🇨🇮'
    }
  };

  constructor() {}

  /**
   * Formate un numéro local vers le format international
   * @param localNumber Numéro local saisi par l'utilisateur
   * @param countryCode Code pays ('FR', 'GN', 'CI')
   * @returns Numéro au format international
   */
  formatToInternational(localNumber: string, countryCode: string): string {
    const rule = this.COUNTRY_RULES[countryCode as keyof typeof this.COUNTRY_RULES];
    if (!rule) {
      throw new Error(`Pays non supporté: ${countryCode}`);
    }

    // Nettoyer les espaces
    let cleaned = localNumber.replace(/\s/g, '');

    // Enlever le 0 initial si la règle l'exige
    if (rule.removeLeadingZero && cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Retourner le format international
    return rule.prefix + cleaned;
  }

  /**
   * Obtenir la liste des pays supportés
   * @returns Liste des pays avec leurs informations
   */
  getSupportedCountries(): Array<{code: string, name: string, flag: string, prefix: string}> {
    return Object.entries(this.COUNTRY_RULES).map(([code, rule]) => ({
      code,
      name: rule.name,
      flag: rule.flag,
      prefix: rule.prefix
    }));
  }

  /**
   * Détecte le pays à partir du numéro de téléphone
   * @param phone Numéro de téléphone à analyser
   * @returns Code pays ('FR', 'GN', 'CI') ou null si non détecté
   */
  detectCountryFromPhone(phone: string): string | null {
    // Nettoyer le numéro (espaces, tirets, parenthèses)
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Détection par préfixe international
    if (cleaned.startsWith('33')) return 'FR';
    if (cleaned.startsWith('224')) return 'GN';
    if (cleaned.startsWith('225')) return 'CI';

    // Détection par format local France
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      const secondDigit = cleaned[1];
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(secondDigit)) {
        return 'FR';
      }
    }

    // Détection par format local Guinée
    if (cleaned.startsWith('6') && cleaned.length === 9) return 'GN';

    // Détection par format local Côte d'Ivoire
    if (cleaned.startsWith('0') && cleaned.length >= 8 && cleaned.length <= 10) {
      const secondDigit = cleaned[1];
      if (['1', '2', '3', '4', '5', '6', '7'].includes(secondDigit)) {
        return 'CI';
      }
    }

    return null; // Pays non détecté
  }

  /**
   * Génère tous les formats possibles pour un numéro de téléphone
   * @param phone Numéro de téléphone
   * @param country Code pays optionnel ('FR', 'GN', 'CI')
   * @returns Tableau des formats possibles
   */
  generatePhoneFormats(phone: string, country?: string): string[] {
    const formats: string[] = [];
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Format saisi tel quel (nettoyé)
    formats.push(cleaned);

    // Détecter le pays si non fourni
    const detectedCountry = country || this.detectCountryFromPhone(cleaned);

    // Générer les formats selon le pays
    if (detectedCountry === 'FR') {
      if (cleaned.startsWith('33')) {
        // Format international → local
        formats.push('0' + cleaned.substring(2)); // 33612345678 → 0612345678
      } else if (cleaned.startsWith('0')) {
        // Format local → international
        formats.push('33' + cleaned.substring(1)); // 0612345678 → 33612345678
      } else if (cleaned.length === 9) {
        // Sans préfixe → ajouter les deux
        formats.push('0' + cleaned); // 612345678 → 0612345678
        formats.push('33' + cleaned); // 612345678 → 33612345678
      }
    }

    if (detectedCountry === 'GN') {
      if (cleaned.startsWith('224')) {
        // Format international → local
        formats.push(cleaned.substring(3)); // 224613001718 → 613001718
      } else if (cleaned.length === 9 && cleaned.startsWith('6')) {
        // Format local → international
        formats.push('224' + cleaned); // 613001718 → 224613001718
      } else if (cleaned.startsWith('0') && cleaned.length === 10) {
        // Avec 0 optionnel
        formats.push(cleaned.substring(1)); // 0613001718 → 613001718
        formats.push('224' + cleaned.substring(1)); // 0613001718 → 224613001718
      }
    }

    if (detectedCountry === 'CI') {
      if (cleaned.startsWith('225')) {
        // Format international → local
        const localNumber = cleaned.substring(3);
        formats.push('0' + localNumber); // 2250701234567 → 0701234567
        formats.push(localNumber); // 2250701234567 → 701234567
      } else if (cleaned.startsWith('0')) {
        // Format local → international
        formats.push('225' + cleaned.substring(1)); // 0701234567 → 2250701234567
      } else if (cleaned.length >= 7 && cleaned.length <= 9) {
        // Sans préfixe → ajouter les deux
        formats.push('0' + cleaned); // 701234567 → 0701234567
        formats.push('225' + cleaned); // 701234567 → 225701234567
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