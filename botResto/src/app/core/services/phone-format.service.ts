import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhoneFormatService {

  constructor() { }

  /**
   * Valider le format téléphone livreur (06 ou 07)
   */
  validateDriverPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    
    // Supprimer tous les espaces et caractères non-numériques
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Vérifier format exact : 06XXXXXXXX ou 07XXXXXXXX
    return /^0[67][0-9]{8}$/.test(cleanPhone);
  }

  /**
   * Formater pour WhatsApp (format international)
   * 0612345678 → +33612345678
   * 0712345678 → +33712345678
   */
  formatForWhatsApp(phone: string): string {
    if (!this.validateDriverPhone(phone)) {
      console.warn(`[PhoneFormat] Numéro invalide pour WhatsApp: ${phone}`);
      return phone; // Retourner tel quel si invalide
    }

    const cleanPhone = phone.replace(/\D/g, '');
    
    // Transformer 06/07 en +336/+337
    if (cleanPhone.startsWith('06')) {
      return '+336' + cleanPhone.substring(2);
    } else if (cleanPhone.startsWith('07')) {
      return '+337' + cleanPhone.substring(2);
    }
    
    return phone; // Fallback
  }

  /**
   * Formater pour affichage interface
   * 0612345678 → 06 12 34 56 78
   */
  formatForDisplay(phone: string): string {
    if (!this.validateDriverPhone(phone)) {
      return phone; // Retourner tel quel si invalide
    }

    const cleanPhone = phone.replace(/\D/g, '');
    
    // Format: 06 12 34 56 78
    return cleanPhone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  /**
   * Nettoyer et normaliser le numéro pour stockage BDD
   * " 06 12 34 56 78 " → "0612345678"
   */
  normalizeForStorage(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // Supprimer tous les caractères non-numériques sauf le premier 0
    const cleanPhone = phone.replace(/\D/g, '');
    
    // S'assurer qu'on a un format 06/07 correct
    if (this.validateDriverPhone(cleanPhone)) {
      return cleanPhone;
    }
    
    return phone; // Retourner tel quel si pas valide
  }

  /**
   * Validation complète avec message d'erreur
   */
  isValidDriverPhone(phone: string): { valid: boolean; message?: string } {
    if (!phone || typeof phone !== 'string') {
      return { valid: false, message: 'Numéro de téléphone requis' };
    }

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      return { valid: false, message: 'Le numéro doit contenir 10 chiffres' };
    }

    if (!cleanPhone.startsWith('06') && !cleanPhone.startsWith('07')) {
      return { valid: false, message: 'Le numéro doit commencer par 06 ou 07' };
    }

    if (!/^0[67][0-9]{8}$/.test(cleanPhone)) {
      return { valid: false, message: 'Format de numéro invalide' };
    }

    return { valid: true };
  }

  /**
   * Obtenir l'exemple de format attendu
   */
  getPhoneFormatExample(): string {
    return '06 12 34 56 78 ou 07 12 34 56 78';
  }
}