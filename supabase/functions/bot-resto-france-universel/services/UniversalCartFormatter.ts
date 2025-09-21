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
   * Formater le message complet d'ajout au panier
   */
  formatAdditionMessage(
    product: any,
    cart: any[],
    quantity: number = 1
  ): string {
    let message = '';


    // Section 1: Confirmation
    const productName = this.extractProductName(product.name);
    message += `✅ ${productName} ajouté !\n\n`;
    
    // Section 2: Détail du produit ajouté
    message += this.formatProductDetail(product, quantity);
    
    // Section 3: Séparateur
    message += '\n━━━━━━━━━━━━━━━━━━━━\n';
    
    // Section 4: Panier complet
    message += this.formatCartSummary(cart);
    
    // Section 5: Séparateur
    message += '\n━━━━━━━━━━━━━━━━━━━━\n';
    
    // Section 6: Total et compteur
    const total = this.calculateTotal(cart);
    const itemCount = this.countItems(cart);
    message += `💎 TOTAL: ${total} EUR\n`;
    message += `📦 ${itemCount} produit${itemCount > 1 ? 's' : ''}\n\n`;
    
    // Section 7: Actions rapides
    message += this.formatActions();
    
    return message;
  }

  /**
   * Formater le détail d'un produit avec ses composants
   */
  private formatProductDetail(product: any, quantity: number): string {
    let detail = '';
    
    // Obtenir l'émoji de la catégorie
    const categoryEmoji = this.getCategoryEmoji(product.name);
    
    // Nom du produit avec émoji
    const displayName = quantity > 1 ? `${quantity}x ${product.name}` : product.name;
    detail += `${categoryEmoji} ${displayName}\n`;
    
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
    detail += `   💰 ${product.price} EUR\n`;
    
    return detail;
  }

  /**
   * Formater un groupe de composants (sauces, viandes, etc.)
   */
  private formatComponentGroup(groupName: string, selections: any[]): string {
    if (!selections || selections.length === 0) {
      return '';
    }
    
    // Extraire les noms des sélections de manière robuste
    const values = selections.map(s => {
      // Si c'est un objet avec option_name
      if (s && typeof s === 'object' && s.option_name) {
        return s.option_name;
      }
      // Si c'est déjà un string
      if (typeof s === 'string') {
        return s;
      }
      // Sinon retourner vide pour éviter [object Object]
      return '';
    }).filter(v => v !== '').join(', ');
    
    // Ne pas afficher si c'est "Pas de..." ou équivalent
    if (this.shouldSkipComponent(values)) {
      return '';
    }
    
    // Obtenir l'émoji approprié
    const emoji = this.getComponentEmoji(groupName);
    
    // Formater avec indentation
    return `   ${emoji} ${values}\n`;
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
  private formatCartSummary(cart: any[]): string {
    let summary = '🛒 MON PANIER\n\n';
    
    cart.forEach((item, index) => {
      const categoryEmoji = this.getCategoryEmoji(item.productName);
      const itemNumber = index + 1;
      
      // Ligne principale du produit
      summary += `${itemNumber}. ${categoryEmoji} ${item.productName}`;
      
      // Ajouter la description courte si elle existe
      if (item.productDescription && item.productDescription !== item.productName) {
        const shortDesc = this.formatShortDescription(item.productDescription);
        summary += ` ${shortDesc}`;
      }
      
      summary += '\n';
      
      // Configuration détaillée sur ligne séparée
      if (item.configuration) {
        const configDetails = this.formatConfigurationSummary(item.configuration);
        if (configDetails) {
          summary += `   🔧 ${configDetails}\n`;
        }
      }
      
      // Prix - DIAGNOSTIC BOWL SUPPLÉMENTS
      const calculatedPrice = item.unitPrice * item.quantity;

      // 🚨 LOGS DIAGNOSTIC BOWL - Analyser le problème suppléments
      // Utiliser item.totalPrice si disponible, sinon calculatedPrice
      const finalPrice = item.totalPrice || calculatedPrice;

      summary += `   💰 ${finalPrice} EUR\n`;
      
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
    const details: string[] = [];
    
    for (const [_, selections] of Object.entries(configuration)) {
      if (Array.isArray(selections)) {
        const values = selections.map(s => {
          // Si c'est un objet avec option_name
          if (s && typeof s === 'object' && s.option_name) {
            return s.option_name;
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
    
    return details.join(', ');
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
      return total + (item.unitPrice * item.quantity);
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
   * Obtenir l'émoji de la catégorie
   */
  private getCategoryEmoji(productName: string): string {
    const lowerName = productName.toLowerCase();
    
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