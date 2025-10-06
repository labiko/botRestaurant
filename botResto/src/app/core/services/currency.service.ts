import { Injectable } from '@angular/core';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const AVAILABLE_CURRENCIES: { [key: string]: CurrencyConfig } = {
  'GNF': {
    code: 'GNF',
    symbol: 'GNF',
    name: 'Franc Guinéen',
    locale: 'fr-FR',
    decimals: 0
  },
  'XOF': {
    code: 'XOF',
    symbol: 'CFA',
    name: 'Franc CFA (Mali)',
    locale: 'fr-FR', 
    decimals: 0
  },
  'EUR': {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'fr-FR',
    decimals: 2
  },
  'USD': {
    code: 'USD',
    symbol: '$',
    name: 'Dollar US',
    locale: 'en-US',
    decimals: 2
  }
};

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly CURRENCY_KEY = 'app_currency';
  private currentCurrency: CurrencyConfig;

  constructor() {
    // Charger la devise depuis le localStorage ou utiliser GNF par défaut
    const savedCurrency = localStorage.getItem(this.CURRENCY_KEY);
    if (savedCurrency && AVAILABLE_CURRENCIES[savedCurrency]) {
      this.currentCurrency = AVAILABLE_CURRENCIES[savedCurrency];
    } else {
      this.currentCurrency = AVAILABLE_CURRENCIES['GNF'];
    }
  }

  /**
   * Obtenir la configuration de devise actuelle
   */
  getCurrentCurrency(): CurrencyConfig {
    return this.currentCurrency;
  }

  /**
   * Définir une nouvelle devise
   */
  setCurrency(currencyCode: string): void {
    if (AVAILABLE_CURRENCIES[currencyCode]) {
      // Ne log que si la devise change vraiment
      const isChanging = this.currentCurrency.code !== currencyCode;

      this.currentCurrency = AVAILABLE_CURRENCIES[currencyCode];
      localStorage.setItem(this.CURRENCY_KEY, currencyCode);

      if (isChanging) {
        console.log(`💱 Currency changed to: ${currencyCode}`);
      }
    } else {
      console.error(`❌ Unknown currency code: ${currencyCode}`);
    }
  }

  /**
   * Formater un prix avec la devise actuelle
   */
  formatPrice(amount: number): string {
    const currency = this.getCurrentCurrency();
    
    // Pour les devises sans décimales (GNF, XOF), s'assurer que le montant est entier
    const displayAmount = currency.decimals === 0 ? Math.round(amount) : amount;
    
    const formatted = displayAmount.toLocaleString(currency.locale, {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals
    });
    
    return `${formatted} ${currency.symbol}`;
  }

  /**
   * Formater un prix pour l'affichage dans les formulaires (sans devise)
   */
  formatAmountOnly(amount: number): string {
    const currency = this.getCurrentCurrency();
    const displayAmount = currency.decimals === 0 ? Math.round(amount) : amount;
    
    return displayAmount.toLocaleString(currency.locale, {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals
    });
  }

  /**
   * Convertir une chaîne en nombre (enlève les séparateurs de milliers)
   */
  parseAmount(amountString: string): number {
    // Enlever tous les espaces et remplacer la virgule par un point si nécessaire
    const cleaned = amountString.replace(/\s/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  /**
   * Obtenir la liste des devises disponibles
   */
  getAvailableCurrencies(): CurrencyConfig[] {
    return Object.values(AVAILABLE_CURRENCIES);
  }

  /**
   * Obtenir le symbole de la devise actuelle
   */
  getCurrencySymbol(): string {
    return this.currentCurrency.symbol;
  }

  /**
   * Obtenir le code de la devise actuelle
   */
  getCurrencyCode(): string {
    return this.currentCurrency.code;
  }

  /**
   * Vérifier si la devise actuelle utilise des décimales
   */
  hasDecimals(): boolean {
    return this.currentCurrency.decimals > 0;
  }
}