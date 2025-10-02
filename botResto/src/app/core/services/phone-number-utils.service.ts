import { Injectable } from '@angular/core';

export interface CountryCodeConfig {
  code: string;
  name: string;
  flag: string;
  digitLength: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhoneNumberUtilsService {

  private readonly COUNTRY_CODES: CountryCodeConfig[] = [
    { code: '224', name: 'Guinée', flag: '🇬🇳', digitLength: 12 },
    { code: '221', name: 'Sénégal', flag: '🇸🇳', digitLength: 12 },
    { code: '223', name: 'Mali', flag: '🇲🇱', digitLength: 11 },
    { code: '228', name: 'Togo', flag: '🇹🇬', digitLength: 11 },
    { code: '33', name: 'France', flag: '🇫🇷', digitLength: 11 },
  ];

  /**
   * Obtient tous les codes pays disponibles
   */
  getAllCountryCodes(): CountryCodeConfig[] {
    return this.COUNTRY_CODES;
  }

  /**
   * Obtient le nom du pays depuis le code
   */
  getCountryName(code: string): string {
    const country = this.COUNTRY_CODES.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  }

  /**
   * Formate un numéro pour WhatsApp selon le code pays
   */
  formatForWhatsApp(phoneNumber: string, countryCode: string): string {
    let cleaned = phoneNumber.replace(/[^\d]/g, '');

    // Si le numéro ne commence pas déjà par le code pays, l'ajouter
    if (!cleaned.startsWith(countryCode)) {
      // Enlever le 0 initial si présent (numéros locaux)
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      cleaned = countryCode + cleaned;
    }

    return cleaned;
  }

  /**
   * Extrait le code pays d'un numéro de téléphone international
   */
  extractCountryCode(phoneNumber: string): string | null {
    if (!phoneNumber || phoneNumber.length < 8) {
      return null;
    }

    // Nettoyer le numéro
    let cleaned = phoneNumber.replace(/[^\d]/g, '');

    // Tester les codes par ordre de longueur (3, 2, 1)
    for (const codeInfo of this.COUNTRY_CODES) {
      if (cleaned.startsWith(codeInfo.code)) {
        // Vérifier que la longueur totale est cohérente
        if (cleaned.length === codeInfo.digitLength ||
            cleaned.length === codeInfo.digitLength - 1 ||
            cleaned.length === codeInfo.digitLength + 1) {
          return codeInfo.code;
        }
      }
    }

    return null;
  }
}
