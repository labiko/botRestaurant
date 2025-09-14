// 🍕 SERVICE D'AFFICHAGE UNIFIÉ POUR PIZZAS
// SOLID : Single Responsibility - Gestion de l'affichage des pizzas uniquement
// Ce service NE MODIFIE PAS le comportement existant des autres produits

import { IMessageSender } from '../types.ts';
import { SessionManager } from './SessionManager.ts';
import { QueryPerformanceMonitor } from './QueryPerformanceMonitor.ts';

/**
 * Service UNIVERSEL pour l'affichage unifié des pizzas
 * Configurable par restaurant - Utilise les données existantes sans rien inventer
 */
export class PizzaDisplayService {
  private displayConfig: any = null;
  private restaurantSettings: any = null;
  private sessionManager: SessionManager;
  
  constructor(
    private messageSender: IMessageSender,
    private supabaseUrl: string,
    private supabaseKey: string
  ) {
    this.sessionManager = new SessionManager(supabaseUrl, supabaseKey);
  }

  /**
   * Charger la configuration d'affichage pour un restaurant
   * UNIVERSEL - Chaque restaurant peut avoir sa propre config
   */
  async loadRestaurantConfig(restaurantId: number): Promise<boolean> {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      
      // Essayer de récupérer la configuration via la vue (si elle existe)
      try {
        const { data, error } = await supabase
          .from('v_restaurant_pizza_display_config')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .single();
        
        if (!error && data) {
          this.displayConfig = data.display_config;
          this.restaurantSettings = data.custom_settings;
          console.log(`✅ [PizzaDisplay] Configuration spécifique chargée pour restaurant ${restaurantId}`);
          return data.use_unified_display || false;
        }
      } catch (viewError) {
        console.log(`⚠️ [PizzaDisplay] Vue v_restaurant_pizza_display_config n'existe pas`);
      }
      
      // Essayer la table france_workflow_templates (si elle existe)
      try {
        const { data: defaultConfig } = await supabase
          .from('france_workflow_templates')
          .select('steps_config')
          .is('restaurant_id', null)
          .eq('template_name', 'pizza_unified_display_default')
          .single();
        
        if (defaultConfig?.steps_config) {
          this.displayConfig = defaultConfig.steps_config;
          console.log(`✅ [PizzaDisplay] Configuration par défaut chargée depuis france_workflow_templates`);
          return true;
        }
      } catch (templateError) {
        console.log(`⚠️ [PizzaDisplay] Table france_workflow_templates n'existe pas ou pas de config`);
      }
      
      // Utiliser la config par défaut intégrée
      console.log(`⚠️ [PizzaDisplay] Pas de config spécifique pour restaurant ${restaurantId}, utilisation config par défaut`);
      this.displayConfig = this.getDefaultConfig();
      return true;
      
    } catch (error) {
      console.error('❌ [PizzaDisplay] Erreur chargement config:', error);
      this.displayConfig = this.getDefaultConfig();
      return true; // Utiliser l'affichage unifié par défaut
    }
  }
  
  /**
   * Configuration par défaut si aucune n'est définie
   */
  private getDefaultConfig(): any {
    return {
      enabled: true,
      show_separator: true,
      global_numbering: true,
      separator_line: "━━━━━━━━━━━━━━━━━━━━━",
      apply_to_categories: ["pizzas"],
      apply_to_menu_categories: ["menu-pizza", "Menu Pizza", "menu_pizza", "menus"]
    };
  }
  
  /**
   * Vérifier si une catégorie doit utiliser l'affichage unifié
   */
  shouldUseUnifiedDisplay(categorySlug: string): boolean {
    if (!this.displayConfig?.enabled) return false;
    
    const pizzaCategories = this.displayConfig.apply_to_categories || ['pizzas'];
    const menuCategories = this.displayConfig.apply_to_menu_categories || ['menu-pizza', 'Menu Pizza', 'menu_pizza'];
    
    // DÉTECTION UNIVERSELLE : Toute catégorie contenant "menu" OU "pizza" dans le slug
    const isUniversalCategory = categorySlug.toLowerCase().includes('menu') || 
                               categorySlug.toLowerCase().includes('pizza');
    
    return pizzaCategories.includes(categorySlug) || 
           menuCategories.includes(categorySlug) ||
           isUniversalCategory;
  }
  
  /**
   * Point d'entrée principal - Détecte le contexte et applique le bon format
   * PRÉSERVE la compatibilité avec les workflows existants
   */
  async displayPizzas(
    phoneNumber: string,
    session: any,
    context: 'category_list' | 'menu_list' | 'workflow_selection',
    data: any
  ): Promise<void> {
    console.log(`🍕 [PizzaDisplay] Contexte: ${context}`);
    
    // Charger la config si pas déjà fait
    if (!this.displayConfig && session.restaurantId) {
      const useUnified = await this.loadRestaurantConfig(session.restaurantId);
      if (!useUnified) {
        console.log(`🍕 [PizzaDisplay] Affichage unifié désactivé pour ce restaurant`);
        return; // Le restaurant n'utilise pas l'affichage unifié
      }
    }
    
    switch(context) {
      case 'category_list':
        // Affichage des pizzas individuelles avec toutes les tailles
        return this.displayIndividualPizzas(phoneNumber, session, data);
      
      case 'menu_list':
        // Affichage des 4 menus composites (MENU 1, 2, 3, 4)
        return this.displayPizzaMenus(phoneNumber, session, data);
      
      case 'workflow_selection':
        // Affichage dans les workflows des menus (choix de pizza)
        return this.displayWorkflowPizzaChoice(phoneNumber, session, data);
    }
  }

  /**
   * Format 1: Pizzas individuelles dans la catégorie "Pizzas"
   * Affiche TOUTES les pizzas avec TOUTES les tailles disponibles
   */
  private async displayIndividualPizzas(
    phoneNumber: string,
    session: any,
    data: { pizzas: any[], restaurantName: string, deliveryMode: string }
  ): Promise<void> {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      
      // Construire le message d'en-tête avec actions au début
      let message = `🍕 🍕 Pizzas\n`;
      message += `📍 ${data.restaurantName}\n\n`;
      message += `ACTIONS RAPIDES:\n`;
      message += `⚡ 99 = Passer commande | 🗑️ 00 = Vider panier | 🍕 0 = Ajouter d'autres produits\n\n`;
      
      let globalIndex = 1; // Numérotation globale pour toutes les options
      const pizzaOptionsMap: any[] = []; // Créer le mapping ici pour synchronisation exacte
      
      // Pour chaque pizza
      for (const pizza of data.pizzas) {
        message += `━━━━━━━━━━━━━━━━━━━━━\n`;
        
        // Nom de la pizza (enlever l'emoji du nom car il est déjà présent)
        const pizzaName = pizza.name.replace(/^[^\s]+\s/, ''); // Enlève le premier emoji
        message += `🎯 *🍕 ${pizzaName}*\n`;
        
        // Description des ingrédients (utiliser le champ description existant)
        if (pizza.description) {
          message += `🧾 ${pizza.description}\n\n`;
        }
        
        // Récupérer les tailles depuis france_product_sizes
        const { data: sizes } = await supabase
          .from('france_product_sizes')
          .select('*')
          .eq('product_id', pizza.id)
          .eq('is_active', true)
          .order('display_order');
        
        if (sizes && sizes.length > 0) {
          message += `💰 Choisissez votre taille:\n`;
          
          for (const size of sizes) {
            // Utiliser le prix selon le mode (mais ils sont identiques d'après nos données)
            const price = data.deliveryMode === 'livraison' 
              ? (size.price_delivery || size.price_on_site)
              : size.price_on_site;
            
            // CRÉER LE MAPPING EN MÊME TEMPS QUE L'AFFICHAGE
            pizzaOptionsMap.push({
              optionNumber: globalIndex,
              pizzaId: pizza.id,
              pizzaName: pizza.name,
              sizeId: size.id,
              sizeName: size.size_name,
              price: price,
              type: 'individual_pizza' // DISCRIMINANT UNIVERSEL
            });
            
            message += `   🔸 ${size.size_name} (${price} EUR) - Tapez ${globalIndex}\n`;
            globalIndex++;
          }
        }
        
        message += '\n';
      }
      
      // Footer avec instructions  
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `💡 Tapez le numéro de votre choix`;
      
      // Envoyer le message formaté
      await this.messageSender.sendMessage(phoneNumber, message);
      
      // Mettre à jour la session avec le mapping créé localement
      await this.updateSessionWithDirectMapping(session, pizzaOptionsMap, globalIndex - 1);
      
    } catch (error) {
      console.error('❌ [PizzaDisplay] Erreur affichage individuel:', error);
      throw error;
    }
  }

  /**
   * Format 2: Menus composites dans la catégorie "Menu Pizza"
   * Utilise le MÊME template que les pizzas individuelles
   */
  private async displayPizzaMenus(
    phoneNumber: string,
    session: any,
    data: { menus: any[], restaurantName: string, deliveryMode: string }
  ): Promise<void> {
    try {
      // Construire le message d'en-tête avec actions au début (MÊME FORMAT que pizzas)
      let message = `📋 📋 Menu Pizza\n`;
      message += `📍 ${data.restaurantName}\n\n`;
      message += `ACTIONS RAPIDES:\n`;
      message += `⚡ 99 = Passer commande | 🗑️ 00 = Vider panier | 🍕 0 = Ajouter d'autres produits\n\n`;
      
      let globalIndex = 1; // Numérotation globale comme les pizzas
      const menuOptionsMap: any[] = []; // Créer le mapping pour synchronisation exacte
      
      // Pour chaque menu (MÊME LOGIQUE que displayIndividualPizzas)
      for (const menu of data.menus) {
        message += `━━━━━━━━━━━━━━━━━━━━━\n`;
        
        // Nom du menu (enlever l'emoji du nom car il est déjà présent)
        const menuName = menu.name.replace(/^[^\s]+\s/, ''); // Enlève le premier emoji
        message += `🎯 *📋 ${menuName}*\n`;
        
        // Description du menu (utiliser le champ description existant)
        if (menu.description) {
          message += `🧾 ${menu.description}\n\n`;
        }
        
        // Prix selon le mode (MÊME LOGIQUE que pizzas)
        const price = data.deliveryMode === 'livraison' 
          ? (menu.price_delivery_base || menu.price_on_site_base)
          : menu.price_on_site_base;
        
        message += `💰 Choisissez votre menu:\n`;
        
        // CRÉER LE MAPPING EN MÊME TEMPS QUE L'AFFICHAGE (comme pizzas)
        menuOptionsMap.push({
          optionNumber: globalIndex,
          pizzaId: menu.id, // Réutiliser la même structure
          pizzaName: menu.name,
          sizeId: null, // Pas de taille pour les menus
          sizeName: 'MENU',
          price: price,
          type: 'menu_pizza' // DISCRIMINANT UNIVERSEL
        });
        
        message += `   🔸 MENU (${price} EUR) - Tapez ${globalIndex}\n`;
        globalIndex++;
        
        message += '\n';
      }
      
      // Footer avec instructions (MÊME FORMAT que pizzas)
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `💡 Tapez le numéro de votre choix`;
      
      // Envoyer le message formaté
      await this.messageSender.sendMessage(phoneNumber, message);
      
      // Mettre à jour la session avec le mapping créé localement (MÊME LOGIQUE que pizzas)
      await this.updateSessionWithDirectMapping(session, menuOptionsMap, globalIndex - 1);
      
    } catch (error) {
      console.error('❌ [PizzaDisplay] Erreur affichage menus:', error);
      throw error;
    }
  }

  /**
   * Format 3: Choix de pizza dans un workflow de MENU
   * Affiche uniquement les pizzas de la taille requise
   */
  private async displayWorkflowPizzaChoice(
    phoneNumber: string,
    session: any,
    data: {
      menuType: string,
      stepNumber: number,
      totalSteps: number,
      pizzaSize: 'JUNIOR' | 'SENIOR' | 'MEGA',
      restaurantName: string
    }
  ): Promise<void> {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      
      // Récupérer toutes les pizzas avec la taille demandée
      const { data: pizzasWithSize } = await QueryPerformanceMonitor.measureQuery(
        'PIZZA_WITH_SIZES_INNER_JOIN',
        supabase
          .from('france_products')
          .select(`
            *,
            france_product_sizes!inner (*)
          `)
          .eq('france_product_sizes.size_name', data.pizzaSize)
          .eq('category_id', session.sessionData?.currentCategoryId)
          .eq('is_active', true)
          .order('display_order')
      );
      
      // Construire le message d'en-tête
      let message = `🍕 Choix Pizza ${data.stepNumber}/${data.totalSteps} pour ${data.menuType}\n`;
      message += `📍 ${data.restaurantName}\n\n`;
      
      // Pour chaque pizza disponible dans cette taille
      if (pizzasWithSize) {
        for (let i = 0; i < pizzasWithSize.length; i++) {
          const pizza = pizzasWithSize[i];
          message += `━━━━━━━━━━━━━━━━━━━━━\n`;
          
          // Nom de la pizza avec la taille
          const pizzaName = pizza.name.replace(/^[^\s]+\s/, ''); // Enlève le premier emoji
          message += `🎯 *🍕 ${pizzaName} ${data.pizzaSize}*\n`;
          
          // Description des ingrédients
          if (pizza.description) {
            message += `🧾 ${pizza.description}\n`;
          }
          
          // Prix inclus dans le menu
          message += `💰 Inclus dans le menu - Tapez ${i + 1}\n\n`;
        }
      }
      
      // Footer avec instructions
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `💡 Tapez le numéro de votre choix`;
      
      // Envoyer le message formaté
      await this.messageSender.sendMessage(phoneNumber, message);
      
    } catch (error) {
      console.error('❌ [PizzaDisplay] Erreur affichage workflow:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour la session avec le mapping direct (synchronisé avec l'affichage)
   * PRÉSERVE la structure de session existante
   */
  private async updateSessionWithDirectMapping(
    session: any,
    pizzaOptionsMap: any[],
    totalOptions: number
  ): Promise<void> {
    console.log(`🔧 [PizzaDisplay] DÉBUT updateSessionWithDirectMapping - ${pizzaOptionsMap.length} options`);
    
    try {
      // ✅ CENTRALISATION: Utilisation de SessionManager au lieu d'accès direct DB
      
      console.log(`🍕 [PizzaDisplay] Mapping créé avec ${pizzaOptionsMap.length} options:`, 
                  pizzaOptionsMap.slice(0, 3).map(opt => `${opt.optionNumber}: ${opt.pizzaName} ${opt.sizeName}`));
      
      console.log(`🔍 [PizzaDisplay] Session reçue:`, { 
        hasSession: !!session, 
        sessionId: session?.id, 
        hasSessionData: !!session?.sessionData,
        sessionDataKeys: session?.sessionData ? Object.keys(session.sessionData) : []
      });
      
      // Stocker le mapping dans la session (sans modifier la structure existante)
      if (session && session.id) {
        console.log(`📝 [PizzaDisplay] Préparation données session...`);
        
        const updatedSessionData = {
          ...session.sessionData,
          pizzaOptionsMap: pizzaOptionsMap,
          totalPizzaOptions: totalOptions
        };
        
        console.log(`💾 [PizzaDisplay] Tentative mise à jour session ID: ${session.id}`);
        
        // DEBUG: Afficher les données avant l'update
        console.log(`📋 [PizzaDisplay] Données à sauver:`, {
          sessionId: session.id,
          pizzaOptionsMapLength: pizzaOptionsMap.length,
          totalOptions: totalOptions,
          updatedSessionDataKeys: Object.keys(updatedSessionData),
          hasPizzaMap: !!updatedSessionData.pizzaOptionsMap
        });
        
        // ✅ CENTRALISATION: Remplacer accès direct DB par SessionManager
        console.log('📝 [PizzaDisplayService:422] Mise à jour session via SessionManager');
        await this.sessionManager.updateSession(session.id, {
          sessionData: updatedSessionData,
          workflowData: {
            ...session.workflowData,
            pizzaOptionsMap: pizzaOptionsMap,
            totalPizzaOptions: totalOptions
          }
        });
        
        console.log(`✅ [PizzaDisplay] Session mise à jour avec ${totalOptions} options de pizza`);
      } else {
        console.log(`❌ [PizzaDisplay] Session invalide:`, { hasSession: !!session, sessionId: session?.id });
      }
      
    } catch (error) {
      console.error('❌ [PizzaDisplay] Exception mise à jour session:', error);
      // Ne pas faire échouer l'affichage si la mise à jour échoue
    }
  }

  /**
   * Mettre à jour la session avec le mapping des choix pizza (LEGACY - garder pour compatibilité)
   * PRÉSERVE la structure de session existante
   */
  private async updateSessionWithPizzaMapping(
    session: any,
    pizzas: any[],
    totalOptions: number
  ): Promise<void> {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      
      // Créer le mapping des options (numéro -> pizza/taille)
      const pizzaOptionsMap: any[] = [];
      let optionIndex = 1;
      
      for (const pizza of pizzas) {
        // Récupérer les tailles pour cette pizza
        const { data: sizes } = await supabase
          .from('france_product_sizes')
          .select('*')
          .eq('product_id', pizza.id)
          .order('display_order');
        
        if (sizes) {
          for (const size of sizes) {
            pizzaOptionsMap.push({
              optionNumber: optionIndex,
              pizzaId: pizza.id,
              pizzaName: pizza.name,
              sizeId: size.id,
              sizeName: size.size_name,
              price: size.price_on_site
            });
            optionIndex++;
          }
        }
      }
      
      // Stocker le mapping dans la session (sans modifier la structure existante)
      if (session && session.id) {
        const updatedSessionData = {
          ...session.sessionData,
          pizzaOptionsMap: pizzaOptionsMap,
          totalPizzaOptions: totalOptions
        };
        
        // ✅ CENTRALISATION: Remplacer accès direct DB par SessionManager
        console.log('📝 [PizzaDisplayService:492] Mise à jour session via SessionManager');
        await this.sessionManager.updateSession(session.id, {
          sessionData: updatedSessionData
        });
        
        console.log(`✅ [PizzaDisplay] Session mise à jour avec ${totalOptions} options de pizza`);
      }
      
    } catch (error) {
      console.error('❌ [PizzaDisplay] Erreur mise à jour session:', error);
      // Ne pas faire échouer l'affichage si la mise à jour échoue
    }
  }
}