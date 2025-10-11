/**
 * Service de formatage universel pour les messages de panier
 * 100% UNIVERSEL - Même format pour TOUS les restaurants
 */
export class UniversalCartFormatter {
  // Mapping émojis par catégorie de produit
  private readonly CATEGORY_EMOJIS: Record<string, string> = {
    'tacos': '🌮',
    'pizza': '🍕',
    'pizzas': '🍕',
    'burger': '🍔',
    'burgers': '🍔',
    'sandwich': '🥪',
    'sandwichs': '🥪',
    'naan': '🫓',
    'naans': '🫓',
    'assiette': '🍽️',
    'assiettes': '🍽️',
    'salade': '🥗',
    'salades': '🥗',
    'pates': '🍝',
    'poulet': '🍗',
    'bowl': '🥙',
    'bowls': '🥙',
    'chicken': '🍗',
    'snacks': '🍟',
    'tex-mex': '🌮',
    'panini': '🥪',
    'menu-enfant': '👶',
    'chicken-box': '🍗',
    'gourmets': '🥘',
    'smashs': '🥩',
    'ice-cream': '🍨',
    'desserts': '🧁',
    'drinks': '🥤'
  };

  // Mapping émojis pour les composants
  private readonly COMPONENT_EMOJIS: Record<string, string> = {
    'sauce': '🍯',
    'sauces': '🍯',
    'viande': '🥩',
    'viandes': '🥩',
    'fromage': '🧀',
    'fromages': '🧀',
    'legume': '🥬',
    'legumes': '🥬',
    'supplement': '➕',
    'supplements': '➕',
    'extras': '➕',
    'boisson': '🥤',
    'boissons': '🥤',
    'drink': '🥤',
    'dessert': '🍰',
    'accompagnement': '🍟',
    'taille': '📏',
    'size': '📏'
  };

  /**
   * Formate un prix selon la devise du restaurant
   */
  private formatPrice(amount: number, currency: string = 'EUR'): string {
    switch (currency) {
      case 'EUR':
        return `${amount}€`;
      case 'GNF':
        return `${amount.toLocaleString('fr-FR')} GNF`;
      case 'XOF':
        return `${amount.toLocaleString('fr-FR')} FCFA`;
      default:
        return `${amount}€`;
    }
  }

  /**
   * Formater le message complet d'ajout au panier
   */
  formatAdditionMessage(
    product: any,
    cart: any[],
    quantity: number = 1,
    currency: string = 'EUR'
  ): string {
    let message = '';


    // Section 1: Confirmation
    const productName = this.extractProductName(product.name);
    message += `✅ ${productName} ajouté !\n\n`;
    
    // Section 2: Détail du produit ajouté
    message += this.formatProductDetail(product, quantity, currency);
    
    // Section 3: Séparateur
    message += '\n━━━━━━━━━━━━━━━━━━━━\n';
    
    // Section 4: Panier complet
    message += this.formatCartSummary(cart, currency);
    
    // Section 5: Séparateur
    message += '\n━━━━━━━━━━━━━━━━━━━━\n';
    
    // Section 6: Total et compteur
    const total = this.calculateTotal(cart);
    const itemCount = this.countItems(cart);
    message += `💎 TOTAL: ${this.formatPrice(total, currency)}\n`;
    message += `📦 ${itemCount} produit${itemCount > 1 ? 's' : ''}\n\n`;
    
    // Section 7: Actions rapides
    message += this.formatActions();
    
    return message;
  }

  /**
   * Formater le détail d'un produit avec ses composants
   */
  private formatProductDetail(product: any, quantity: number, currency: string = 'EUR'): string {
    let detail = '';
    
    // Obtenir l'émoji du produit (priorité à la colonne icon)
    const categoryEmoji = this.getCategoryEmoji(product.name, product.icon);
    
    // Nom du produit avec émoji
    const displayName = quantity > 1 ? `${quantity}x ${product.name}` : product.name;
    detail += `*${categoryEmoji} → ${displayName}*\n`;
    
    // Afficher la configuration si elle existe
    if (product.configuration) {
      for (const [groupName, selections] of Object.entries(product.configuration)) {
        const formattedGroup = this.formatComponentGroup(groupName, selections as any[]);
        if (formattedGroup) {
          detail += formattedGroup;
        }
      }
    }
    
    // Prix
    detail += `   💰 ${this.formatPrice(product.price, currency)}\n`;
    
    return detail;
  }

  /**
   * Formater un groupe de composants (sauces, viandes, etc.)
   * Option C: Emoji de chaque option (depuis icon en base) + flèche
   */
  private formatComponentGroup(groupName: string, selections: any[]): string {
    if (!selections || selections.length === 0) {
      return '';
    }

    // Formater avec emoji + flèche pour chaque option
    let formatted = '';

    selections.forEach(s => {
      // Extraire le nom
      let name = '';
      if (s && typeof s === 'object' && (s.option_name || s.name)) {
        name = s.option_name || s.name;
      } else if (typeof s === 'string') {
        name = s;
      }

      // Ignorer si vide ou "Pas de..."
      if (!name || this.shouldSkipComponent(name)) {
        return;
      }

      // Extraire l'emoji depuis la colonne icon (priorité) ou fallback
      let icon = '•'; // Fallback par défaut
      if (s && typeof s === 'object' && s.icon) {
        icon = s.icon;
      }

      // Formater avec emoji + flèche + nom
      formatted += `   ${icon} → ${name}\n`;
    });

    return formatted;
  }

  /**
   * Déterminer si un composant doit être ignoré
   */
  private shouldSkipComponent(value: string): boolean {
    const skipPatterns = [
      'pas de',
      'sans',
      'aucun',
      'none',
      'no ',
      'rien'
    ];
    
    const lowerValue = value.toLowerCase();
    return skipPatterns.some(pattern => lowerValue.includes(pattern));
  }

  /**
   * Formater le résumé du panier
   */
  private formatCartSummary(cart: any[], currency: string = 'EUR'): string {
    let summary = '🛒 MON PANIER\n\n';

    cart.forEach((item, index) => {
      console.log('🔍 DEBUG_CART_ITEM:', JSON.stringify(item, null, 2));
      console.log('🔍 DEBUG_CATEGORY_NAME:', item.categoryName);
      console.log('🔍 DEBUG_CATEGORY_ID:', item.categoryId);

      const categoryEmoji = this.getCategoryEmoji(item.productName, item.icon);
      const itemNumber = index + 1;

      // Prix - DIAGNOSTIC BOWL SUPPLÉMENTS
      const calculatedPrice = item.unitPrice * item.quantity;

      // 🚨 LOGS DIAGNOSTIC BOWL - Analyser le problème suppléments
      // Utiliser item.totalPrice si disponible, sinon calculatedPrice
      const finalPrice = item.totalPrice || calculatedPrice;

      // Ligne principale du produit avec catégorie si disponible
      const categoryDisplay = item.categoryName ? ` (${item.categoryName})` : '';
      summary += `${itemNumber}. ${categoryEmoji} ${item.productName}${categoryDisplay} - ${this.formatPrice(finalPrice, currency)}\n`;

      // Configuration détaillée pour menus pizza
      if (item.configuration || item.details) {
        const configuration = item.configuration || item.details;
        if (configuration.pizzas && Array.isArray(configuration.pizzas)) {
          configuration.pizzas.forEach((pizza: any, pizzaIndex: number) => {
            const pizzaName = pizza.option_name || pizza.name || '';
            summary += `   • Pizza ${pizzaIndex + 1}: ${pizzaName}\n`;
          });
        } else {
          const configDetails = this.formatConfigurationSummary(configuration);
          if (configDetails) {
            summary += `   🔧 ${configDetails}\n`;
          }
        }
      }
      
      if (index < cart.length - 1) {
        summary += '\n';
      }
    });
    
    return summary;
  }

  /**
   * Formater la configuration pour le résumé du panier
   */
  private formatConfigurationSummary(configuration: any): string {
    console.log('🔍 DEBUG_FORMAT_CONFIG: configuration reçue:', JSON.stringify(configuration));
    const details: string[] = [];
    
    for (const [_, selections] of Object.entries(configuration)) {
      if (Array.isArray(selections)) {
        const values = selections.map(s => {
          // Si c'est un objet avec option_name
          if (s && typeof s === 'object' && (s.option_name || s.name)) {
            return s.option_name || s.name;
          }
          // Si c'est déjà un string
          if (typeof s === 'string') {
            return s;
          }
          // Sinon retourner vide
          return '';
        }).filter(v => v !== '').join(', ');
        
        if (values && !this.shouldSkipComponent(values)) {
          details.push(values);
        }
      }
    }

    const result = details.join(', ');
    console.log('🔍 DEBUG_FORMAT_CONFIG: résultat final:', result);
    return result;
  }

  /**
   * Formater une description courte pour le panier
   */
  private formatShortDescription(description: string): string {
    // Extraire la partie entre parenthèses si elle existe
    const match = description.match(/\((.*?)\)/);
    if (match) {
      return `(${match[1]})`;
    }
    return '';
  }

  /**
   * Formater les actions rapides
   */
  private formatActions(): string {
    return 'ACTIONS RAPIDES:\n' +
           '⚡ 99 = Passer commande\n' +
           '🗑️ 00 = Vider panier\n' +
           '🍕 0  = Ajouter d\'autres produits';
  }

  /**
   * Calculer le total du panier
   */
  private calculateTotal(cart: any[]): number {
    return cart.reduce((total, item) => {
      // 🔍 DEBUG PRIX - Analyser les différences de calcul
      const unitPriceCalc = item.unitPrice * item.quantity;
      const totalPriceValue = item.totalPrice || unitPriceCalc;
      const priceDifference = totalPriceValue - unitPriceCalc;


      return total + totalPriceValue;
    }, 0);
  }

  /**
   * Compter le nombre total de produits
   */
  private countItems(cart: any[]): number {
    return cart.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  }

  /**
   * Obtenir l'émoji du produit (priorité à la colonne icon en base)
   */
  private getCategoryEmoji(productName: string, productIcon?: string): string {
    // PRIORITÉ 1: Utiliser l'icône de la base de données si disponible
    if (productIcon && productIcon.trim() !== '') {
      return productIcon;
    }

    // FALLBACK: Système automatique basé sur le nom (ancien comportement)
    const lowerName = productName?.toLowerCase() || '';

    // Rechercher dans le mapping
    for (const [key, emoji] of Object.entries(this.CATEGORY_EMOJIS)) {
      if (lowerName.includes(key)) {
        return emoji;
      }
    }

    // Émoji par défaut
    return '🍽️';
  }

  /**
   * Obtenir l'émoji d'un composant
   */
  private getComponentEmoji(groupName: string): string {
    const lowerName = groupName.toLowerCase();
    
    // Rechercher dans le mapping
    for (const [key, emoji] of Object.entries(this.COMPONENT_EMOJIS)) {
      if (lowerName.includes(key)) {
        return emoji;
      }
    }
    
    // Émoji par défaut
    return '•';
  }

  /**
   * Extraire le nom du produit sans la taille
   */
  private extractProductName(fullName: string): string {
    // Retirer les mentions de taille (MENU M, MENU L, etc.)
    return fullName.replace(/\s*(MENU\s+[SMLXL]+|TAILLE\s+[SMLXL]+)$/i, '').trim();
  }
}