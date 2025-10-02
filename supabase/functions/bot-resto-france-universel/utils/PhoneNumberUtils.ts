/**
 * Utilitaire pour l'extraction et le formatage des numéros de téléphone internationaux
 * Support multi-pays automatique via détection du code pays
 */

/**
 * Mapping des codes pays connus avec leurs métadonnées
 */
interface CountryCodeInfo {
  code: string;
  country: string;
  digitLength: number; // Longueur totale attendue (code + numéro)
}

const KNOWN_COUNTRY_CODES: CountryCodeInfo[] = [
  // Codes 3 chiffres (Afrique principalement)
  { code: '224', country: 'Guinea', digitLength: 12 },
  { code: '225', country: 'Ivory Coast', digitLength: 13 },
  { code: '221', country: 'Senegal', digitLength: 12 },
  { code: '223', country: 'Mali', digitLength: 11 },
  { code: '226', country: 'Burkina Faso', digitLength: 11 },
  { code: '227', country: 'Niger', digitLength: 11 },
  { code: '228', country: 'Togo', digitLength: 11 },
  { code: '229', country: 'Benin', digitLength: 11 },

  // Codes 2 chiffres (Europe principalement)
  { code: '33', country: 'France', digitLength: 11 },
  { code: '32', country: 'Belgium', digitLength: 11 },
  { code: '41', country: 'Switzerland', digitLength: 11 },
  { code: '34', country: 'Spain', digitLength: 11 },
  { code: '39', country: 'Italy', digitLength: 12 },

  // Codes 1 chiffre
  { code: '1', country: 'USA/Canada', digitLength: 11 },
  { code: '7', country: 'Russia', digitLength: 11 },
];

export class PhoneNumberUtils {

  /**
   * Extrait le code pays d'un numéro de téléphone international
   * @param phoneNumber - Numéro au format international (ex: "33753058254")
   * @returns Code pays (ex: "33") ou null si non trouvé
   */
  static extractCountryCode(phoneNumber: string): string | null {
    if (!phoneNumber || phoneNumber.length < 8) {
      return null;
    }

    // Nettoyer le numéro (enlever espaces, +, etc.)
    let cleaned = phoneNumber.replace(/[^\d]/g, '');

    // Enlever le + initial si présent
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    // Tester les codes par ordre de longueur (3, 2, 1)
    for (const codeInfo of KNOWN_COUNTRY_CODES) {
      if (cleaned.startsWith(codeInfo.code)) {
        // Vérifier que la longueur totale est cohérente
        if (cleaned.length === codeInfo.digitLength ||
            cleaned.length === codeInfo.digitLength - 1 ||
            cleaned.length === codeInfo.digitLength + 1) {
          console.log(`✅ [PhoneUtils] Code pays détecté: ${codeInfo.code} (${codeInfo.country})`);
          return codeInfo.code;
        }
      }
    }

    console.warn(`⚠️ [PhoneUtils] Code pays non reconnu pour: ${phoneNumber}`);
    return null;
  }

  /**
   * Obtient les infos du pays depuis le code
   */
  static getCountryInfo(countryCode: string): CountryCodeInfo | null {
    return KNOWN_COUNTRY_CODES.find(c => c.code === countryCode) || null;
  }

  /**
   * Formate un numéro pour WhatsApp (ajoute @c.us)
   */
  static formatForWhatsApp(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/[^\d]/g, '');
    return `${cleaned}@c.us`;
  }
}
