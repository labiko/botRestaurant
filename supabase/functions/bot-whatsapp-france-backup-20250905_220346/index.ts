/**
 * 🇫🇷 Bot WhatsApp France - Version simplifiée Pizza Yolo
 * Test rapide avec les nouvelles tables france_*
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Services pour gestion des adresses de livraison
import { GooglePlacesService } from './services/google-places.service.ts';
import { AddressManagementService } from './services/address-management.service.ts';
import type { 
  CustomerAddress, 
  GooglePlaceResult, 
  AddressValidationResponse,
  AddressSessionState 
} from './types/address.types.ts';

// Configuration
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const greenApiInstanceId = Deno.env.get('GREEN_API_INSTANCE_ID')!;
const greenApiToken = Deno.env.get('GREEN_API_TOKEN')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialisation des services d'adresses
const googlePlaces = new GooglePlacesService();
const addressManager = new AddressManagementService(supabase);

// Configuration délai d'expiration des sessions
const SESSION_EXPIRE_MINUTES = 240; // 4 heures (240 minutes) - était 30 minutes

// 💰 Fonction utilitaire pour préserver totalPrice et availableSupplements lors des mises à jour de session
function preserveTotalPriceContext(sessionContext: any, newContext: any): any {
  const currentTotalPrice = sessionContext?.totalPrice || 0;
  const newTotalPrice = newContext?.totalPrice;
  const currentAvailableSupplements = sessionContext?.availableSupplements;
  const newAvailableSupplements = newContext?.availableSupplements;
  
  // Préserver le totalPrice existant si aucune nouvelle valeur n'est fournie
  const preservedTotalPrice = newTotalPrice !== undefined ? newTotalPrice : currentTotalPrice;
  
  // Préserver availableSupplements existant si aucune nouvelle valeur n'est fournie OU si nouvelle valeur est undefined
  const preservedAvailableSupplements = (newAvailableSupplements !== undefined) ? newAvailableSupplements : currentAvailableSupplements;
  
  return {
    ...sessionContext,
    ...newContext,
    totalPrice: preservedTotalPrice,
    availableSupplements: preservedAvailableSupplements
  };
}

// Service WhatsApp
class WhatsAppService {
  private baseUrl = `https://api.green-api.com/waInstance${greenApiInstanceId}`;

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      console.log(`📤 Tentative d'envoi vers ${phoneNumber}: "${message}"`);
      console.log(`🔗 URL utilisée: ${this.baseUrl}/sendMessage/${greenApiToken}`);
      
      // Nettoyer le phoneNumber s'il contient déjà @c.us
      const cleanPhoneNumber = phoneNumber.replace('@c.us', '');
      const payload = {
        chatId: `${cleanPhoneNumber}@c.us`,
        message: message
      };
      console.log(`📦 Payload:`, JSON.stringify(payload));
      
      const response = await fetch(`${this.baseUrl}/sendMessage/${greenApiToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log(`📡 Statut réponse:`, response.status);
      console.log(`📡 Headers réponse:`, Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log(`📄 Corps réponse:`, responseText);
      
      if (response.ok) {
        console.log(`✅ Message envoyé avec succès vers ${phoneNumber}`);
        return true;
      } else {
        console.error(`❌ Échec envoi (${response.status}):`, responseText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      return false;
    }
  }
}

const whatsapp = new WhatsAppService();

// Fonction helper pour suggérer des commandes valides
function getSuggestionMessage(invalidInput: string, context: string = 'general'): string {
  const baseMessage = `❌ **Choix invalide : "${invalidInput}"**\n\n`;
  
  // Suggestions spécifiques basées sur l'entrée invalide
  let suggestions = '';
  
  if (invalidInput === '9' || invalidInput === '99' || invalidInput.includes('99')) {
    suggestions += '💡 **Peut-être vouliez-vous dire :**\n   • **99** = Finaliser la commande\n\n';
  } else if (invalidInput === '0' && context !== 'menu_selection') {
    suggestions += '💡 **Peut-être vouliez-vous dire :**\n   • **00** = Voir le panier complet\n   • **0** = Retour au menu\n\n';
  } else if (invalidInput.startsWith('0') && invalidInput.length > 1 && invalidInput !== '00') {
    suggestions += '💡 **Peut-être vouliez-vous dire :**\n   • **00** = Voir le panier complet\n\n';
  }
  
  // Actions valides selon le contexte
  let actions = '';
  
  switch (context) {
    case 'cart':
      actions = '🎯 **Actions valides :**\n⚡ **99** - Finaliser la commande\n🛒 **00** - Voir panier complet\n🍕 **0** - Retour au menu\n🔢 **1-X** - Sélectionner un article\n\n✨ Retapez votre choix';
      break;
    case 'address_selection':
      actions = '📍 **Votre adresse de livraison ?**\n\n🏠 Tapez **1** ou **2** pour vos adresses\n➕ Tapez **3** pour une nouvelle adresse\n📝 Ou saisissez directement votre adresse\n\n*Votre choix :*';
      break;
    case 'address_confirmation':
      actions = '🎯 **Actions valides :**\n✅ **1** - Confirmer l\'adresse\n🔄 **2** - Modifier l\'adresse\n❌ **annuler** - Retour\n\n✨ Retapez votre choix';
      break;
    default:
      actions = '🎯 **Actions disponibles :**\n🛒 **00** - Voir panier\n🍕 **0** - Retour au menu\n🔢 Ou tapez un numéro de produit\n\n✨ Retapez votre choix';
      break;
  }
    
  return baseMessage + suggestions + actions;
}

// Gestion des sessions simplifiée (inspirée du bot Conakry)
class SimpleSession {
  static async get(phoneNumber: string) {
    // Standardiser le format avec @c.us
    const standardPhone = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
    
    console.log('🔍 [SimpleSession.get] Recherche session pour:', standardPhone);
    
    const { data, error } = await supabase
      .from('france_sessions')
      .select('*')
      .eq('phone_whatsapp', standardPhone)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ [SimpleSession.get] Erreur récupération:', error);
    }

    console.log('📄 [SimpleSession.get] Session trouvée:', {
      sessionExists: !!data,
      sessionId: data?.id,
      sessionState: data?.state,
      contextKeys: data?.context ? Object.keys(data.context) : 'no-context'
    });

    return data;
  }

  static async create(phoneNumber: string, state = 'INITIAL') {
    // Standardiser le format avec @c.us
    const standardPhone = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
    
    const { data } = await supabase
      .from('france_sessions')
      .insert({
        id: crypto.randomUUID(),
        phone_whatsapp: standardPhone,
        state: state,
        context: {},
        expires_at: new Date(Date.now() + SESSION_EXPIRE_MINUTES * 60 * 1000).toISOString()
      })
      .select()
      .single();

    return data;
  }

  static async update(sessionId: string, updates: any) {
    console.log('💾 [SimpleSession.update] AVANT update - sessionId:', sessionId);
    console.log('💾 [SimpleSession.update] AVANT update - updates:', JSON.stringify(updates, null, 2));
    
    const { data, error } = await supabase
      .from('france_sessions')
      .update({
        ...updates,
        expires_at: new Date(Date.now() + SESSION_EXPIRE_MINUTES * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('❌ [SimpleSession.update] Erreur mise à jour:', error);
    }

    console.log('✅ [SimpleSession.update] APRÈS update - session mise à jour:', {
      sessionId: data?.id,
      newState: data?.state,
      contextKeys: data?.context ? Object.keys(data.context) : 'no-context'
    });

    return data;
  }

  static async deleteAllForPhone(phoneNumber: string) {
    // Standardiser le format avec @c.us
    const standardPhone = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
    
    const { error } = await supabase
      .from('france_sessions')
      .delete()
      .eq('phone_whatsapp', standardPhone);

    if (error) {
      console.error('Erreur suppression sessions:', error);
    } else {
      console.log('🗑️ Sessions supprimées pour:', phoneNumber);
    }
  }
}

// Fonction de détection format téléphone restaurant
function isPhoneNumberFormat(message: string): boolean {
  const cleanMessage = message.trim();
  const phoneRegex = /^\d{7,}$/; // Au moins 7 chiffres, que des chiffres
  return phoneRegex.test(cleanMessage);
}

// Fonction de recherche restaurant par téléphone
async function findRestaurantByPhone(phoneNumber: string) {
  try {
    console.log('🔍 Recherche restaurant avec numéro:', phoneNumber);
    
    // Essayer différents formats de normalisation
    const formats = [
      phoneNumber, // Format original (ex: 0177123456)
      `+33${phoneNumber.substring(1)}`, // Format international (ex: +330177123456)
      `33${phoneNumber.substring(1)}` // Format sans + (ex: 330177123456)
    ];
    
    for (const format of formats) {
      console.log('🔍 Test format:', format);
      const { data: restaurant } = await supabase
        .from('france_restaurants')
        .select('*')
        .or(`phone.eq.${format},whatsapp_number.eq.${format}`)
        .eq('is_active', true)
        .single();
      
      if (restaurant) {
        console.log('✅ Restaurant trouvé:', restaurant.name);
        return restaurant;
      }
    }
    
    console.log('❌ Aucun restaurant trouvé avec ce numéro');
    return null;
  } catch (error) {
    console.error('❌ Erreur recherche restaurant:', error);
    return null;
  }
}

// Fonction d'accès direct restaurant (point d'entrée QR code)
async function handleDirectRestaurantAccess(phoneNumber: string, restaurant: any) {
  try {
    console.log(`🎯 Accès direct restaurant: ${restaurant.name}`);
    
    // Premier message : Bienvenue personnalisé
    const welcomeMessage = `🇫🇷 Bonjour ! Bienvenue chez ${restaurant.name} !

🍕 ${restaurant.description || 'Découvrez notre délicieux menu'}

📍 ${restaurant.address || 'Restaurant disponible'}`;

    await whatsapp.sendMessage(phoneNumber, welcomeMessage);

    // Deuxième message : Choix du mode de livraison
    const deliveryModeMessage = `🚚 **Choisissez votre mode :**

📍 1 - Sur place
📦 2 - À emporter  
🚚 3 - Livraison

Tapez le numéro de votre choix.`;

    await whatsapp.sendMessage(phoneNumber, deliveryModeMessage);

    // Créer/Mettre à jour la session - État CHOOSING_DELIVERY_MODE
    await SimpleSession.deleteAllForPhone(phoneNumber);
    const session = await SimpleSession.create(phoneNumber, 'CHOOSING_DELIVERY_MODE');
    await SimpleSession.update(session.id, {
      context: {
        selectedRestaurantId: restaurant.id,
        selectedRestaurantName: restaurant.name
      }
    });

    
  } catch (error) {
    console.error('❌ Erreur accès direct restaurant:', error);
    await whatsapp.sendMessage(phoneNumber, '❌ Erreur lors de l\'accès au restaurant.');
  }
}

// Gestionnaire principal
async function handleIncomingMessage(phoneNumber: string, message: string) {
  console.log(`📱 Message reçu de ${phoneNumber}: "${message}"`);

  // PRIORITÉ 1: Détection numéro téléphone restaurant (accès QR code)
  if (isPhoneNumberFormat(message)) {
    console.log('📱 Format téléphone détecté:', message);
    const restaurant = await findRestaurantByPhone(message);
    
    if (restaurant) {
      console.log(`✅ Restaurant trouvé: ${restaurant.name}`);
      await handleDirectRestaurantAccess(phoneNumber, restaurant);
      return;
    } else {
      console.log('❌ Restaurant non trouvé pour ce numéro');
      await whatsapp.sendMessage(phoneNumber, `❌ Aucun restaurant trouvé avec le numéro ${message}.

💡 Vérifiez le numéro ou contactez le restaurant directement.`);
      return;
    }
  }

  // PRIORITÉ 2: Messages classiques (salut/bonjour) - Menu générique
  if (message.toLowerCase().includes('salut') || message.toLowerCase().includes('bonjour')) {
    // Test connexion BDD
    const { data: restaurants, error } = await supabase
      .from('france_restaurants')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('❌ Erreur BDD:', error);
      await whatsapp.sendMessage(phoneNumber, '❌ Erreur de connexion à la base de données.');
      return;
    }

    // Premier message : Bienvenue générique
    await whatsapp.sendMessage(phoneNumber, `🇫🇷 Bonjour ! Bienvenue sur notre système de commande !

🍕 ${restaurants?.length || 0} restaurant(s) disponible(s)
${restaurants?.[0] ? `✅ ${restaurants[0].name}` : '❌ Aucun restaurant'}

💡 Scannez le QR code du restaurant pour accéder directement à son menu !`);

    // Deuxième message : Exemple de menu (pas de commande sans restaurant spécifique)
    let menuText = '🍽️ *SYSTEME DE COMMANDE*\n\n';
    menuText += '📱 **Comment commander :**\n';
    menuText += '1. Scannez le QR code du restaurant\n';
    menuText += '2. Le menu apparaîtra automatiquement\n';
    menuText += '3. Tapez le numéro de votre choix\n\n';
    menuText += '💡 **Chaque restaurant a son menu personnalisé !**\n';
    menuText += '🔍 Exemple de catégories : Tacos, Burgers, Pizzas, etc.\n\n';
    menuText += '📱 **Scannez le QR code pour commencer !**';

    await whatsapp.sendMessage(phoneNumber, menuText);
    return;
  }

  // PRIORITÉ 3: Gestion complète des messages selon l'état de session
  const session = await SimpleSession.get(phoneNumber);
  
  console.log('🔄 [SESSION_GET] Session récupérée:', {
    sessionExists: !!session,
    sessionId: session?.id,
    sessionState: session?.state,
    selectedRestaurantId: session?.context?.selectedRestaurantId,
    contextKeys: session?.context ? Object.keys(session.context) : 'no-context'
  });
  
  if (session && session.context?.selectedRestaurantId) {
    // L'utilisateur a une session active avec restaurant sélectionné
    await handleSessionMessage(phoneNumber, session, message);
    return;
  }
  
  // Pas de session active - sélection par numéro = erreur
  const menuNumber = parseInt(message.trim());
  if (menuNumber >= 1 && menuNumber <= 9) {
    await whatsapp.sendMessage(phoneNumber, `🔍 Sélection catégorie ${menuNumber}

❌ **Session expirée ou restaurant non sélectionné**

💡 **Comment commander :**
📱 Scannez le QR code du restaurant souhaité
🍽️ Le menu apparaîtra automatiquement
🎯 Puis tapez le numéro de votre choix

**Scannez le QR code pour commencer !**`);
    return;
  }

  // PRIORITÉ 4: Réponse par défaut
  await whatsapp.sendMessage(phoneNumber, `🤖 Message reçu : "${message}"

🚧 Bot en cours de développement.

💡 **Comment commander :**
• Scannez le QR code du restaurant
• Ou tapez "salut" pour voir le menu général

Status : Tables france_* opérationnelles ✅`);
}

// Fonctions utilitaires
function formatPrice(price: number | null, currency: string = 'EUR'): string {
  if (price === null || price === undefined) {
    return 'Prix à définir';
  }
  return `${price.toLocaleString()} ${currency}`;
}

function getOptionEmoji(group: string): string {
  const groupLower = group.toLowerCase();
  if (groupLower.includes('viande') || groupLower.includes('meat')) return '🥩';
  if (groupLower.includes('sauce')) return '🍯';
  if (groupLower.includes('légume') || groupLower.includes('veggie')) return '🥬';
  if (groupLower.includes('fromage') || groupLower.includes('cheese')) return '🧀';
  if (groupLower.includes('boisson') || groupLower.includes('drink')) return '🥤';
  if (groupLower.includes('supplément') || groupLower.includes('extra')) return '➕';
  return '📝'; // default
}

function parseOrderCommand(command: string): number[] {
  const numbers = command.split(',')
    .map(n => parseInt(n.trim()))
    .filter(n => !isNaN(n) && n > 0);
  
  return numbers;
}

// 🆕 NOUVELLE FONCTION - Fonction pizza dédiée (ÉTAPE 4: Avec gestion menus interactifs)
async function showPizzaProducts(phoneNumber: string, restaurant: any, session: any, categoryKey: string) {
  console.log('🍕 [PIZZA] Affichage produits pizza - catégorie:', categoryKey);
  
  // Récupérer les produits pizza ET menus pizza depuis la BDD
  const { data: categoryProducts, error } = await supabase
    .from('france_products')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('category_id', categoryKey)
    .eq('is_active', true)
    .order('display_order');
  
  if (error || !categoryProducts || categoryProducts.length === 0) {
    console.error('❌ [PIZZA] Erreur produits pizza:', error);
    await whatsapp.sendMessage(phoneNumber, '❌ Aucune pizza disponible.');
    return;
  }
  
  // Utiliser uniquement les produits de la catégorie sans doublons
  const allProducts = [...categoryProducts];
  
  // Trouver le nom de la catégorie (même logique)
  const categories = session.context.categories || [];
  const category = categories.find((cat: any) => cat.id === categoryKey);
  const categoryName = category ? `${category.icon} ${category.name}` : 'Pizzas';
  
  console.log('🍕 [PIZZA] Traitement avec fonction dédiée - Produits trouvés:', allProducts.length, 
    '(Pizzas individuelles:', categoryProducts.length, 'Menus pizza:', allProducts.filter(m => 
      m.product_type === 'composite').length || 0, ')');
  
  // ÉTAPE 2: Logique pizza spécialisée avec suppléments
  let productMessage = `🍕 ${categoryName}\n📍 ${restaurant.name}\n\n`;
  let orderedMenu: any[] = [];
  let itemIndex = 1;
  
  // ÉTAPE 4: Traiter chaque produit (pizzas individuelles ET menus)
  for (const product of allProducts) {
    console.log(`🍕 [PIZZA] Produit: ${product.name}, Type: ${product.product_type}`);
    
    if (product.product_type === 'modular') {
      // Pizza modulaire - récupérer les tailles (même logique)
      const { data: sizes } = await supabase
        .from('france_product_sizes')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order');
      
      if (sizes && sizes.length > 0) {
        // Séparateur visuel pour Format A
        productMessage += `━━━━━━━━━━━━━━━━━━━━━\n`;
        productMessage += `🎯 **${product.name}**\n`;
        if (product.composition) {
          productMessage += `🧾 ${product.composition}\n`;
        }
        productMessage += `\n💰 Choisissez votre taille:\n`;
        
        sizes.forEach((size, index) => {
          const displayNumber = itemIndex <= 9 ? `${itemIndex}️⃣` : itemIndex === 10 ? `🔟` : `🔢${itemIndex}`;
          
          // Choisir le prix selon le mode de livraison (même logique)
          const isDelivery = session.context.deliveryMode === 'livraison';
          const selectedPrice = isDelivery ? (size.price_delivery || size.price_on_site || size.price) : (size.price_on_site || size.price);
          
          const formattedPrice = formatPrice(selectedPrice, 'EUR');
          const drinkInfo = size.includes_drink ? ' (+ boisson)' : '';
          
          productMessage += `   🔸 ${size.size_name} (${formattedPrice}) - Tapez ${itemIndex}${drinkInfo}\n`;
          
          const menuItem = {
            index: itemIndex,
            item: {
              ...product,
              size_id: size.id,
              size_name: size.size_name,
              final_price: selectedPrice,
              includes_drink: size.includes_drink,
              display_name: `${product.name} ${size.size_name}`,
              // 🆕 NOUVEAU: Marquer comme pizza pour traitement spécial
              is_pizza: true
            }
          };
          
          console.log('🍕 [PIZZA] Création menuItem pizza:', 
            'product:', product.name, 
            'size:', size.size_name, 
            'is_pizza:', menuItem.item.is_pizza);
            
          orderedMenu.push(menuItem);
          itemIndex++;
        });
        productMessage += '\n';
      }
    } else {
      // Pizza simple (cas rare mais géré)
      const displayNumber = itemIndex <= 9 ? `${itemIndex}️⃣` : itemIndex === 10 ? `🔟` : `🔢${itemIndex}`;
      
      // Choisir le prix selon le mode de livraison
      const isDelivery = session.context.deliveryMode === 'livraison';
      const selectedPrice = isDelivery ? (product.price_delivery_base || product.base_price) : (product.price_on_site_base || product.base_price);
      
      const formattedPrice = formatPrice(selectedPrice, 'EUR');
      productMessage += `${displayNumber} ${product.name} - ${formattedPrice}\n`;
      if (product.description) {
        productMessage += `   ${product.description}\n`;
      }
      
      orderedMenu.push({
        index: itemIndex,
        item: {
          ...product,
          final_price: selectedPrice,
          display_name: product.name,
          // 🆕 NOUVEAU: Marquer comme pizza
          is_pizza: true
        }
      });
      
      itemIndex++;
    }
    
    if (product.product_type === 'composite') {
      // 🆕 ÉTAPE 4: Menu pizza composite avec format identique aux pizzas
      const formattedPrice = product.price_on_site_base ? formatPrice(product.price_on_site_base, 'EUR') : 'Prix à définir';
      
      // Séparateur visuel identique aux pizzas
      productMessage += `━━━━━━━━━━━━━━━━━━━━━\n`;
      productMessage += `🎯 *${product.name}*\n`;
      if (product.composition) {
        productMessage += `🧾 ${product.composition}\n`;
      }
      productMessage += `\n💰 Choisissez votre option:\n`;
      productMessage += `   🔸 STANDARD (${formattedPrice}) - Tapez ${itemIndex}\n\n`;
      
      orderedMenu.push({
        index: itemIndex,
        item: {
          ...product,
          final_price: product.price_on_site_base,
          display_name: product.name,
          // 🆕 NOUVEAU: Marquer comme menu pizza interactif
          is_pizza_menu: true
        }
      });
      
      itemIndex++;
    }
  }

  const totalItems = orderedMenu.length;
  const cart = session.context.cart || {};
  const hasItemsInCart = Object.keys(cart).length > 0;
  
  // Messages d'aide spécialisés pour pizzas
  productMessage += `\n💡 Choisissez votre pizza: tapez le numéro`;
  if (totalItems > 0) {
    productMessage += `\nEx: 1 = ${orderedMenu[0]?.item.display_name}, 2 = ${orderedMenu[1]?.item.display_name || 'option #2'}`;
    productMessage += `\n🍕 Chaque pizza peut avoir des suppléments`;
  }
  
  if (hasItemsInCart) {
    // Afficher les options de finalisation si panier non vide (même logique)
    productMessage += `\n\n00 - Finaliser la commande`;
    productMessage += `\n000 - Continuer vos achats (garder le panier)`;
    productMessage += `\n0000 - Recommencer (vider le panier)`;
  } else {
    // Afficher les options classiques si panier vide (même logique)
    productMessage += `\n\n🔙 Tapez "0" pour les catégories`;
    productMessage += `\n🛒 Tapez "00" pour voir votre commande`;
    productMessage += `\n❌ Tapez "annuler" pour arrêter`;
  }

  // Mettre à jour la session (même logique)
  await SimpleSession.update(session.id, {
    state: 'VIEWING_CATEGORY',
    context: preserveTotalPriceContext(session.context, {
      currentCategory: categoryKey,
      currentCategoryProducts: categoryProducts,
      menuOrder: orderedMenu
    })
  });

  await whatsapp.sendMessage(phoneNumber, productMessage);
  console.log('✅ [PIZZA] Pizzas affichées avec fonction spécialisée:', totalItems, 'items au total');
}

// 🆕 NOUVELLE FONCTION - Gestion des suppléments pizza
async function handlePizzaSupplements(phoneNumber: string, session: any, pizzaItem: any): Promise<boolean> {
  console.log('🍕 [SUPPLEMENTS] Début gestion suppléments pour:', pizzaItem.display_name);
  
  // Récupérer les suppléments disponibles pour cette pizza
  const { data: supplements, error } = await supabase
    .from('france_product_options')
    .select('*')
    .eq('product_id', pizzaItem.id)
    .order('group_order', { ascending: true })
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('❌ [SUPPLEMENTS] Erreur récupération suppléments:', error);
    return false;
  }
  
  if (!supplements || supplements.length === 0) {
    console.log('ℹ️ [SUPPLEMENTS] Aucun supplément disponible pour cette pizza');
    return false;
  }
  
  // Grouper les suppléments par groupe et filtrer par taille
  const sizeName = pizzaItem.size_name;
  console.log('🍕 [SUPPLEMENTS] Filtrage pour taille:', sizeName);
  
  const supplementGroups: { [key: string]: any[] } = {};
  
  supplements.forEach(supplement => {
    // Filtrer les suppléments selon la taille sélectionnée
    let isCompatible = false;
    const optionName = supplement.option_name.toLowerCase();
    
    if (sizeName === 'JUNIOR') {
      isCompatible = optionName.includes('junior') || optionName.includes('junior/sénior');
    } else if (sizeName === 'SENIOR') {
      isCompatible = optionName.includes('sénior') || optionName.includes('junior/sénior');
    } else if (sizeName === 'MEGA') {
      isCompatible = optionName.includes('méga');
    }
    
    if (isCompatible) {
      if (!supplementGroups[supplement.option_group]) {
        supplementGroups[supplement.option_group] = [];
      }
      supplementGroups[supplement.option_group].push(supplement);
    }
  });
  
  if (Object.keys(supplementGroups).length === 0) {
    console.log('ℹ️ [SUPPLEMENTS] Aucun supplément compatible avec la taille:', sizeName);
    return false;
  }
  
  // Construire le message des suppléments
  let supplementMessage = `🍕 **${pizzaItem.display_name}**\n`;
  supplementMessage += `💰 Prix de base: ${formatPrice(pizzaItem.final_price, 'EUR')}\n\n`;
  supplementMessage += `➕ **Suppléments disponibles:**\n\n`;
  
  let optionIndex = 1;
  const availableOptions: any[] = [];
  
  Object.keys(supplementGroups).forEach(groupName => {
    supplementMessage += `**${groupName}:**\n`;
    
    supplementGroups[groupName].forEach(supplement => {
      const displayNumber = optionIndex <= 9 ? `${optionIndex}️⃣` : optionIndex === 10 ? `🔟` : `🔢${optionIndex}`;
      const formattedPrice = formatPrice(supplement.price_modifier, 'EUR');
      
      supplementMessage += `${displayNumber} ${supplement.option_name.replace(/junior\/sénior|junior|sénior|méga/gi, '').trim()} - +${formattedPrice}\n`;
      
      availableOptions.push({
        index: optionIndex,
        supplement: supplement,
        pizzaItem: pizzaItem
      });
      
      optionIndex++;
    });
    
    supplementMessage += '\n';
  });
  
  supplementMessage += `0️⃣ Aucun supplément (continuer)\n`;
  supplementMessage += `\n💡 Tapez le numéro du supplément souhaité ou "0" pour continuer sans supplément.`;
  
  // Sauvegarder les options disponibles dans la session
  console.log('🔍 [DEBUG SAVE] === SAUVEGARDE SUPPLEMENTS ===');
  console.log('🔍 [DEBUG SAVE] availableOptions créé:', JSON.stringify(availableOptions, null, 2));
  console.log('🔍 [DEBUG SAVE] availableOptions.length:', availableOptions.length);
  console.log('🔍 [DEBUG SAVE] Context AVANT sauvegarde:', JSON.stringify(session.context, null, 2));
  
  const newContext = preserveTotalPriceContext(session.context, {
    currentPizzaItem: pizzaItem,
    availableSupplements: availableOptions,
    supplementSelectionMode: true
  });
  
  console.log('🔍 [DEBUG SAVE] Context APRÈS preserveTotalPriceContext:', JSON.stringify(newContext, null, 2));
  
  await SimpleSession.update(session.id, {
    state: 'SELECTING_PIZZA_SUPPLEMENTS',
    context: newContext
  });
  
  console.log('🔍 [DEBUG SAVE] ✅ Session mise à jour - Envoi message WhatsApp');
  await whatsapp.sendMessage(phoneNumber, supplementMessage);
  console.log('✅ [SUPPLEMENTS] Suppléments proposés:', Object.keys(supplementGroups).length, 'groupes');
  
  return true;
}

// 🆕 NOUVELLE FONCTION - Traitement sélection supplément pizza
async function handlePizzaSupplementSelection(phoneNumber: string, session: any, choice: string): Promise<void> {
  console.log('🔍 [DEBUG] === DÉBUT handlePizzaSupplementSelection ===');
  console.log('🔍 [DEBUG] Choice reçu:', choice, 'Type:', typeof choice);
  
  const availableSupplements = session.context.availableSupplements || [];
  const currentPizzaItem = session.context.currentPizzaItem;
  
  console.log('🔍 [DEBUG] session.context COMPLET:', JSON.stringify(session.context, null, 2));
  console.log('🔍 [DEBUG] session.context.availableSupplements DIRECT:', session.context.availableSupplements);
  console.log('🔍 [DEBUG] availableSupplements APRÈS || []:', JSON.stringify(availableSupplements, null, 2));
  console.log('🔍 [DEBUG] availableSupplements.length:', availableSupplements.length);
  console.log('🔍 [DEBUG] currentPizzaItem:', currentPizzaItem ? currentPizzaItem.display_name : 'UNDEFINED');
  
  if (!currentPizzaItem) {
    console.error('❌ [SUPPLEMENTS] Pas de pizza en cours de configuration');
    await whatsapp.sendMessage(phoneNumber, '❌ Erreur: aucune pizza en cours de configuration.');
    return;
  }
  
  const choiceNum = parseInt(choice);
  console.log('🔍 [DEBUG] choiceNum après parseInt:', choiceNum, 'isNaN:', isNaN(choiceNum));
  
  if (choice === '0' || choiceNum === 0) {
    // Pas de supplément - gérer selon le contexte
    console.log('🍕 [SUPPLEMENTS] Aucun supplément sélectionné');
    
    if (session.context.offer1For2Active) {
      // Contexte offre 1=2
      if (session.context.isSecondFreePizza) {
        // 2ème pizza gratuite sans supplément - finaliser l'offre
        await finalizeOffer1For2(phoneNumber, session, session.context.firstPizzaWithSupplements, currentPizzaItem);
      } else {
        // 1ère pizza sans supplément - passer à la sélection de la 2ème
        await startSecondPizzaSelection(phoneNumber, session, session.context.offer1For2FirstPizza || currentPizzaItem, currentPizzaItem);
      }
    } else {
      // Contexte normal - ajouter au panier
      await addItemToCart(phoneNumber, session, currentPizzaItem, 1);
    }
    return;
  }
  
  // Vérifier si le choix est valide (logique dynamique)
  const maxChoice = availableSupplements.length;
  console.log('🔍 [DEBUG] === VALIDATION CHOIX ===');
  console.log('🔍 [DEBUG] choiceNum:', choiceNum);
  console.log('🔍 [DEBUG] maxChoice:', maxChoice);
  console.log('🔍 [DEBUG] Condition choiceNum < 1:', choiceNum < 1);
  console.log('🔍 [DEBUG] Condition choiceNum > maxChoice:', choiceNum > maxChoice);
  console.log('🔍 [DEBUG] Validation échoue:', choiceNum < 1 || choiceNum > maxChoice);
  
  if (choiceNum < 1 || choiceNum > maxChoice) {
    console.log('🔍 [DEBUG] ❌ VALIDATION ÉCHOUE - Envoi message erreur');
    await whatsapp.sendMessage(phoneNumber, 
      `❌ Choix invalide. Tapez un numéro entre 1 et ${maxChoice}, ou "0" pour aucun supplément.`);
    return;
  }
  
  console.log('🔍 [DEBUG] ✅ VALIDATION RÉUSSIE - Recherche supplément');
  const selectedSupplement = availableSupplements.find((opt: any) => opt.index === choiceNum);
  console.log('🔍 [DEBUG] selectedSupplement trouvé:', selectedSupplement ? selectedSupplement.option_name : 'UNDEFINED');
  
  // Ajouter le supplément à la pizza
  const pizzaWithSupplement = {
    ...currentPizzaItem,
    final_price: currentPizzaItem.final_price + selectedSupplement.supplement.price_modifier,
    display_name: `${currentPizzaItem.display_name} + ${selectedSupplement.supplement.option_name.replace(/junior\/sénior|junior|sénior|méga/gi, '').trim()}`,
    supplement_details: {
      group: selectedSupplement.supplement.option_group,
      name: selectedSupplement.supplement.option_name,
      price: selectedSupplement.supplement.price_modifier
    }
  };
  
  console.log('🍕 [SUPPLEMENTS] Pizza avec supplément configurée:', pizzaWithSupplement.display_name, 
    'Prix final:', pizzaWithSupplement.final_price);
  
  // Gérer selon le contexte
  if (session.context.offer1For2Active) {
    // Contexte offre 1=2
    if (session.context.isSecondFreePizza) {
      // 2ème pizza gratuite avec supplément - les suppléments restent gratuits
      pizzaWithSupplement.final_price = 0;
      pizzaWithSupplement.supplement_details.price = 0;
      pizzaWithSupplement.display_name = pizzaWithSupplement.display_name + ' (GRATUIT)';
      
      // Finaliser l'offre
      await finalizeOffer1For2(phoneNumber, session, session.context.firstPizzaWithSupplements, pizzaWithSupplement);
    } else {
      // 1ère pizza avec supplément - passer à la sélection de la 2ème
      await startSecondPizzaSelection(phoneNumber, session, session.context.offer1For2FirstPizza || pizzaWithSupplement, pizzaWithSupplement);
    }
  } else {
    // Contexte normal - ajouter au panier
    await addItemToCart(phoneNumber, session, pizzaWithSupplement, 1);
  }
}

// 🆕 NOUVELLE FONCTION - Gestion de l'offre 1 achetée = 2ème offerte
async function handlePizzaOffer1For2(phoneNumber: string, session: any, firstPizza: any): Promise<void> {
  console.log('🎁 [OFFRE] Début offre 1=2 pour:', firstPizza.display_name);
  
  let offerMessage = `🎁 **OFFRE SPÉCIALE ${firstPizza.size_name}** 🎁\n\n`;
  offerMessage += `✨ **1 ACHETÉE = 2ème OFFERTE !** ✨\n\n`;
  offerMessage += `🍕 Votre 1ère pizza: **${firstPizza.display_name}**\n`;
  offerMessage += `💰 Prix: ${formatPrice(firstPizza.final_price, 'EUR')}\n\n`;
  
  // Proposer les suppléments pour la première pizza
  const hasSupplements = await handlePizzaSupplements(phoneNumber, session, firstPizza);
  if (hasSupplements) {
    // Marquer que c'est dans le contexte d'une offre 1=2
    await SimpleSession.update(session.id, {
      state: 'SELECTING_PIZZA_SUPPLEMENTS',
      context: preserveTotalPriceContext(session.context, {
        currentPizzaItem: firstPizza,
        availableSupplements: session.context.availableSupplements,
        supplementSelectionMode: true,
        offer1For2Active: true, // 🆕 Flag pour offre 1=2
        offer1For2FirstPizza: firstPizza
      })
    });
    return;
  } else {
    // Pas de suppléments pour la première pizza - passer directement à la 2ème
    await startSecondPizzaSelection(phoneNumber, session, firstPizza, firstPizza);
  }
}

// 🆕 NOUVELLE FONCTION - Sélection de la 2ème pizza gratuite
async function startSecondPizzaSelection(phoneNumber: string, session: any, firstPizza: any, firstPizzaWithSupplements: any): Promise<void> {
  console.log('🎁 [OFFRE] Début sélection 2ème pizza gratuite');
  
  // Récupérer tous les pizzas de la même taille
  const restaurant = await supabase
    .from('france_restaurants')
    .select('id')
    .eq('id', session.context.selectedRestaurantId)
    .single();
  
  if (!restaurant.data) {
    console.error('❌ [OFFRE] Restaurant non trouvé');
    return;
  }
  
  // Récupérer les pizzas de même taille pour la 2ème pizza gratuite
  const { data: categoryProducts, error } = await supabase
    .from('france_products')
    .select('*')
    .eq('restaurant_id', restaurant.data.id)
    .eq('is_active', true)
    .order('display_order');
  
  if (error || !categoryProducts) {
    console.error('❌ [OFFRE] Erreur récupération pizzas:', error);
    return;
  }
  
  let secondPizzaMessage = `🎁 **2ème PIZZA ${firstPizza.size_name} - GRATUITE !** 🎁\n\n`;
  secondPizzaMessage += `✅ 1ère pizza: ${firstPizzaWithSupplements.display_name}\n`;
  secondPizzaMessage += `💰 Prix payé: ${formatPrice(firstPizzaWithSupplements.final_price, 'EUR')}\n\n`;
  secondPizzaMessage += `🆓 **Choisissez votre 2ème pizza gratuite:**\n\n`;
  
  let orderedSecondPizzas: any[] = [];
  let itemIndex = 1;
  
  // Filtrer et afficher seulement les pizzas de même taille
  for (const product of categoryProducts) {
    if (product.product_type === 'modular') {
      const { data: sizes } = await supabase
        .from('france_product_sizes')
        .select('*')
        .eq('product_id', product.id)
        .eq('size_name', firstPizza.size_name) // Même taille
        .order('display_order');
      
      if (sizes && sizes.length > 0) {
        const size = sizes[0];
        const displayNumber = itemIndex <= 9 ? `${itemIndex}️⃣` : itemIndex === 10 ? `🔟` : `🔢${itemIndex}`;
        
        secondPizzaMessage += `${displayNumber} ${product.name} ${size.size_name} - 🆓 GRATUIT\n`;
        if (product.composition) {
          secondPizzaMessage += `   🧾 ${product.composition}\n`;
        }
        
        const secondPizzaItem = {
          ...product,
          size_id: size.id,
          size_name: size.size_name,
          final_price: 0, // 🆓 GRATUIT
          includes_drink: size.includes_drink,
          display_name: `${product.name} ${size.size_name}`,
          is_pizza: true,
          is_free_pizza: true // 🆕 Marquer comme pizza gratuite
        };
        
        orderedSecondPizzas.push({
          index: itemIndex,
          item: secondPizzaItem
        });
        
        itemIndex++;
      }
    }
  }
  
  secondPizzaMessage += `\n💡 Tapez le numéro de votre 2ème pizza gratuite`;
  
  // Sauvegarder le contexte pour la sélection de la 2ème pizza
  await SimpleSession.update(session.id, {
    state: 'SELECTING_SECOND_FREE_PIZZA',
    context: preserveTotalPriceContext(session.context, {
      offer1For2Active: true,
      firstPizzaWithSupplements: firstPizzaWithSupplements,
      secondPizzaOptions: orderedSecondPizzas
    })
  });
  
  await whatsapp.sendMessage(phoneNumber, secondPizzaMessage);
  console.log('🎁 [OFFRE] 2ème pizza proposée - Options disponibles:', orderedSecondPizzas.length);
}

// 🆕 NOUVELLE FONCTION - Traitement sélection 2ème pizza gratuite
async function handleSecondFreePizzaSelection(phoneNumber: string, session: any, choice: string): Promise<void> {
  console.log('🎁 [OFFRE] Traitement sélection 2ème pizza gratuite:', choice);
  
  const secondPizzaOptions = session.context.secondPizzaOptions || [];
  const firstPizzaWithSupplements = session.context.firstPizzaWithSupplements;
  
  const choiceNum = parseInt(choice);
  if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > secondPizzaOptions.length) {
    await whatsapp.sendMessage(phoneNumber, 
      `❌ Choix invalide. Tapez un numéro entre 1 et ${secondPizzaOptions.length}.`);
    return;
  }
  
  const selectedSecondPizza = secondPizzaOptions.find((opt: any) => opt.index === choiceNum);
  if (!selectedSecondPizza) {
    await whatsapp.sendMessage(phoneNumber, '❌ Erreur: pizza non trouvée.');
    return;
  }
  
  // Proposer les suppléments pour la 2ème pizza (également gratuits)
  const hasSupplements = await handlePizzaSupplements(phoneNumber, session, selectedSecondPizza.item);
  if (hasSupplements) {
    // Sauvegarder le contexte pour les suppléments de la 2ème pizza
    await SimpleSession.update(session.id, {
      state: 'SELECTING_PIZZA_SUPPLEMENTS',
      context: preserveTotalPriceContext(session.context, {
        currentPizzaItem: selectedSecondPizza.item,
        availableSupplements: session.context.availableSupplements,
        supplementSelectionMode: true,
        offer1For2Active: true,
        firstPizzaWithSupplements: firstPizzaWithSupplements,
        isSecondFreePizza: true // 🆕 Flag pour 2ème pizza gratuite
      })
    });
  } else {
    // Pas de suppléments - finaliser l'offre
    await finalizeOffer1For2(phoneNumber, session, firstPizzaWithSupplements, selectedSecondPizza.item);
  }
}

// 🆕 NOUVELLE FONCTION - Finalisation offre 1=2
async function finalizeOffer1For2(phoneNumber: string, session: any, firstPizza: any, secondPizza: any): Promise<void> {
  console.log('🎁 [OFFRE] Finalisation offre 1=2');
  
  // Ajouter les deux pizzas au panier
  await addItemToCart(phoneNumber, session, firstPizza, 1, true); // Mode silencieux
  await addItemToCart(phoneNumber, session, secondPizza, 1, true); // Mode silencieux
  
  // Message de confirmation de l'offre
  let confirmationMessage = `🎁 **OFFRE 1=2 AJOUTÉE !** 🎁\n\n`;
  confirmationMessage += `✅ **Pizza payée:** ${firstPizza.display_name}\n`;
  confirmationMessage += `   💰 ${formatPrice(firstPizza.final_price, 'EUR')}\n\n`;
  confirmationMessage += `🆓 **Pizza offerte:** ${secondPizza.display_name}\n`;
  confirmationMessage += `   💰 Gratuite !\n\n`;
  confirmationMessage += `💸 **Économie:** ${formatPrice(firstPizza.final_price, 'EUR')}\n\n`;
  
  // Récupérer le panier mis à jour
  const updatedSession = await SimpleSession.get(phoneNumber);
  const currentCart = updatedSession?.context?.cart || {};
  let totalPrice = 0;
  
  Object.values(currentCart).forEach((cartItem: any) => {
    const itemTotal = (cartItem.item.final_price || cartItem.item.base_price) * cartItem.quantity;
    totalPrice += itemTotal;
  });
  
  confirmationMessage += `🛒 **Total panier:** ${formatPrice(totalPrice, 'EUR')}\n\n`;
  confirmationMessage += `Que voulez-vous faire ?\n`;
  confirmationMessage += `00 - Finaliser la commande\n`;
  confirmationMessage += `000 - Continuer vos achats\n`;
  confirmationMessage += `0000 - Recommencer (vider panier)`;
  
  await whatsapp.sendMessage(phoneNumber, confirmationMessage);
  
  // Retourner à l'état de visualisation catégorie
  await SimpleSession.update(session.id, {
    state: 'VIEWING_CATEGORY',
    context: preserveTotalPriceContext(session.context, {
      offer1For2Active: false,
      firstPizzaWithSupplements: null,
      secondPizzaOptions: null,
      isSecondFreePizza: false
    })
  });
  
  console.log('✅ [OFFRE] Offre 1=2 finalisée avec succès');
}

// 🆕 NOUVELLE FONCTION - Gestion menu pizza interactif
async function handlePizzaMenuSelection(phoneNumber: string, session: any, menuItem: any): Promise<void> {
  console.log('📋 [MENU] Début traitement menu pizza:', menuItem.display_name);
  
  // Analyser la composition du menu pour déterminer les sélections nécessaires
  const composition = menuItem.composition || '';
  console.log('📋 [MENU] Composition:', composition);
  
  let menuMessage = `🍽️ **${menuItem.display_name}**\n`;
  menuMessage += `💰 Prix fixe: ${formatPrice(menuItem.final_price, 'EUR')}\n\n`;
  menuMessage += `📝 **Composition:** ${composition}\n\n`;
  
  // Déterminer les sélections à faire selon le menu
  let selectionsNeeded = [];
  let currentSelectionIndex = 0;
  
  if (composition.includes('3 PIZZAS JUNIORS')) {
    selectionsNeeded = [
      { type: 'pizza', size: 'JUNIOR', count: 3, currentCount: 0 }
    ];
    menuMessage += `🍕 **Étape 1/1:** Choisissez vos 3 pizzas Junior\n\n`;
  } else if (composition.includes('2 PIZZAS SÉNIOR') || composition.includes('2 PIZZAS SENIOR')) {
    selectionsNeeded = [
      { type: 'pizza', size: 'SENIOR', count: 2, currentCount: 0 }
    ];
    menuMessage += `🍕 **Étape:** Choisissez vos 2 pizzas Sénior\n`;
    if (composition.includes('BOISSON')) {
      menuMessage += `🥤 (+ boisson 1.5L incluse)\n`;
    }
    menuMessage += '\n';
  } else if (composition.includes('1 PIZZAS MEGA') || composition.includes('1 PIZZA MEGA')) {
    selectionsNeeded = [
      { type: 'pizza', size: 'MEGA', count: 1, currentCount: 0 }
    ];
    menuMessage += `🍕 **Étape:** Choisissez votre pizza Méga\n`;
    if (composition.includes('NUGGETS') || composition.includes('WINGS')) {
      menuMessage += `🍗 (+ nuggets/wings inclus)\n`;
    }
    if (composition.includes('BOISSON')) {
      menuMessage += `🥤 (+ boisson 1.5L incluse)\n`;
    }
    menuMessage += '\n';
  } else {
    // Menu non reconnu - traitement générique
    console.log('📋 [MENU] Menu non reconnu - traitement générique');
    await addItemToCart(phoneNumber, session, menuItem, 1);
    return;
  }
  
  // Commencer le processus de sélection interactive
  await startInteractivePizzaMenuSelection(phoneNumber, session, menuItem, selectionsNeeded, currentSelectionIndex, menuMessage);
}

// 🆕 NOUVELLE FONCTION - Début sélection interactive menu pizza
async function startInteractivePizzaMenuSelection(
  phoneNumber: string, 
  session: any, 
  menuItem: any, 
  selectionsNeeded: any[], 
  currentSelectionIndex: number,
  baseMessage: string
): Promise<void> {
  console.log('📋 [MENU] Début sélection interactive - Index:', currentSelectionIndex);
  
  if (currentSelectionIndex >= selectionsNeeded.length) {
    // Toutes les sélections terminées - finaliser le menu
    await finalizePizzaMenu(phoneNumber, session, menuItem, selectionsNeeded);
    return;
  }
  
  const currentSelection = selectionsNeeded[currentSelectionIndex];
  const pizzaSize = currentSelection.size;
  const remainingCount = currentSelection.count - currentSelection.currentCount;
  
  // Récupérer toutes les pizzas de la taille demandée
  const restaurant = await supabase
    .from('france_restaurants')
    .select('id')
    .eq('id', session.context.selectedRestaurantId)
    .single();
  
  if (!restaurant.data) {
    console.error('❌ [MENU] Restaurant non trouvé');
    return;
  }
  
  const { data: allPizzas, error } = await supabase
    .from('france_products')
    .select('*')
    .eq('restaurant_id', restaurant.data.id)
    .eq('product_type', 'modular')
    .eq('is_active', true)
    .order('display_order');
  
  if (error || !allPizzas) {
    console.error('❌ [MENU] Erreur récupération pizzas:', error);
    return;
  }
  
  // Construire la liste des pizzas de la bonne taille
  let selectionMessage = baseMessage;
  selectionMessage += `🍕 **Pizza ${remainingCount}/${currentSelection.count} - Taille ${pizzaSize}**\n\n`;
  
  let availablePizzas: any[] = [];
  let itemIndex = 1;
  
  for (const pizza of allPizzas) {
    const { data: sizes } = await supabase
      .from('france_product_sizes')
      .select('*')
      .eq('product_id', pizza.id)
      .eq('size_name', pizzaSize)
      .order('display_order');
    
    if (sizes && sizes.length > 0) {
      const size = sizes[0];
      const displayNumber = itemIndex <= 9 ? `${itemIndex}️⃣` : itemIndex === 10 ? `🔟` : `🔢${itemIndex}`;
      
      selectionMessage += `${displayNumber} ${pizza.name} ${size.size_name}\n`;
      
      const pizzaItem = {
        ...pizza,
        size_id: size.id,
        size_name: size.size_name,
        final_price: 0, // Prix inclus dans le menu
        includes_drink: size.includes_drink,
        display_name: `${pizza.name} ${size.size_name}`,
        is_pizza: true,
        is_menu_pizza: true // 🆕 Marquer comme pizza de menu
      };
      
      availablePizzas.push({
        index: itemIndex,
        item: pizzaItem
      });
      
      itemIndex++;
    }
  }
  
  selectionMessage += `\n💡 Tapez le numéro de votre choix`;
  
  // Sauvegarder le contexte
  await SimpleSession.update(session.id, {
    state: 'SELECTING_MENU_PIZZA',
    context: preserveTotalPriceContext(session.context, {
      currentMenu: menuItem,
      selectionsNeeded: selectionsNeeded,
      currentSelectionIndex: currentSelectionIndex,
      availablePizzasForMenu: availablePizzas,
      baseMenuMessage: baseMessage
    })
  });
  
  await whatsapp.sendMessage(phoneNumber, selectionMessage);
  console.log('📋 [MENU] Sélection pizza proposée - Options:', availablePizzas.length);
}

// 🆕 NOUVELLE FONCTION - Traitement sélection pizza dans menu
async function handleMenuPizzaSelection(phoneNumber: string, session: any, choice: string): Promise<void> {
  console.log('📋 [MENU] Traitement sélection pizza menu:', choice);
  
  const availablePizzas = session.context.availablePizzasForMenu || [];
  const selectionsNeeded = session.context.selectionsNeeded || [];
  const currentSelectionIndex = session.context.currentSelectionIndex || 0;
  const menuItem = session.context.currentMenu;
  const baseMessage = session.context.baseMenuMessage;
  
  const choiceNum = parseInt(choice);
  if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > availablePizzas.length) {
    await whatsapp.sendMessage(phoneNumber, 
      `❌ Choix invalide. Tapez un numéro entre 1 et ${availablePizzas.length}.`);
    return;
  }
  
  const selectedPizza = availablePizzas.find((opt: any) => opt.index === choiceNum);
  if (!selectedPizza) {
    await whatsapp.sendMessage(phoneNumber, '❌ Erreur: pizza non trouvée.');
    return;
  }
  
  // Ajouter la pizza sélectionnée aux sélections
  const currentSelection = selectionsNeeded[currentSelectionIndex];
  if (!currentSelection.selectedPizzas) {
    currentSelection.selectedPizzas = [];
  }
  currentSelection.selectedPizzas.push(selectedPizza.item);
  currentSelection.currentCount++;
  
  console.log('📋 [MENU] Pizza ajoutée:', selectedPizza.item.display_name, 
    'Progression:', currentSelection.currentCount, '/', currentSelection.count);
  
  if (currentSelection.currentCount >= currentSelection.count) {
    // Cette sélection terminée - passer à la suivante
    await startInteractivePizzaMenuSelection(
      phoneNumber, 
      session, 
      menuItem, 
      selectionsNeeded, 
      currentSelectionIndex + 1,
      baseMessage
    );
  } else {
    // Continuer les sélections pour ce groupe
    await startInteractivePizzaMenuSelection(
      phoneNumber, 
      session, 
      menuItem, 
      selectionsNeeded, 
      currentSelectionIndex,
      baseMessage
    );
  }
}

// 🆕 NOUVELLE FONCTION - Finalisation menu pizza
async function finalizePizzaMenu(phoneNumber: string, session: any, menuItem: any, selectionsNeeded: any[]): Promise<void> {
  console.log('📋 [MENU] Finalisation menu pizza');
  
  // Construire l'item de menu final avec toutes les pizzas sélectionnées
  const finalMenuItem = {
    ...menuItem,
    selectedPizzas: selectionsNeeded.flatMap(selection => selection.selectedPizzas || []),
    display_name: `${menuItem.display_name} (configuré)`
  };
  
  let confirmationMessage = `✅ **Menu configuré !**\n\n`;
  confirmationMessage += `🍽️ **${finalMenuItem.display_name}**\n`;
  confirmationMessage += `💰 Prix: ${formatPrice(finalMenuItem.final_price, 'EUR')}\n\n`;
  confirmationMessage += `🍕 **Pizzas sélectionnées:**\n`;
  
  finalMenuItem.selectedPizzas.forEach((pizza: any, index: number) => {
    confirmationMessage += `${index + 1}. ${pizza.display_name}\n`;
  });
  
  confirmationMessage += `\nMenu ajouté au panier !`;
  
  // Ajouter le menu au panier
  await addItemToCart(phoneNumber, session, finalMenuItem, 1, true); // Mode silencieux
  
  await whatsapp.sendMessage(phoneNumber, confirmationMessage);
  
  // Retourner à l'état de visualisation catégorie
  await SimpleSession.update(session.id, {
    state: 'VIEWING_CATEGORY',
    context: preserveTotalPriceContext(session.context, {
      currentMenu: null,
      selectionsNeeded: null,
      currentSelectionIndex: 0,
      availablePizzasForMenu: null,
      baseMenuMessage: null
    })
  });
  
  console.log('✅ [MENU] Menu pizza finalisé avec succès');
}

// Fonction pour afficher les produits d'une catégorie avec support modulaire
async function showProductsInCategory(phoneNumber: string, restaurant: any, session: any, categoryKey: string) {
  console.log('🍕 Affichage produits catégorie:', categoryKey);
  
  // 🆕 REDIRECTION PIZZA - Détection et redirection vers fonction spécialisée
  const categories = session.context.categories || [];
  const category = categories.find((cat: any) => cat.id === categoryKey);
  const categorySlug = category?.slug || '';
  
  if (categorySlug === 'pizzas' || categorySlug === 'pizza') {
    console.log('🍕 [REDIRECTION] Catégorie pizza détectée - Redirection vers fonction spécialisée');
    return await showPizzaProducts(phoneNumber, restaurant, session, categoryKey);
  }
  
  // ✅ LOGIQUE EXISTANTE PRÉSERVÉE pour toutes les autres catégories
  // Récupérer les produits de cette catégorie depuis la BDD
  const { data: categoryProducts, error } = await supabase
    .from('france_products')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('category_id', categoryKey)
    .eq('is_active', true)
    .order('display_order');
  
  if (error || !categoryProducts || categoryProducts.length === 0) {
    console.error('❌ Erreur produits catégorie:', error);
    await whatsapp.sendMessage(phoneNumber, '❌ Aucun produit disponible dans cette catégorie.');
    return;
  }
  
  // Trouver le nom de la catégorie
  const categoryName = category ? `${category.icon} ${category.name}` : 'Catégorie';
  
  let productMessage = `🍽️ ${categoryName}\n📍 ${restaurant.name}\n\n`;
  let orderedMenu: any[] = [];
  let itemIndex = 1;
  
  // Traiter chaque produit selon son type
  for (const product of categoryProducts) {
    console.log(`📦 Produit: ${product.name}, Type: ${product.product_type}`);
    
    if (product.product_type === 'modular') {
      // Produit modulaire - récupérer les tailles
      const { data: sizes } = await supabase
        .from('france_product_sizes')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order');
      
      if (sizes && sizes.length > 0) {
        // Séparateur visuel pour Format A
        productMessage += `━━━━━━━━━━━━━━━━━━━━━\n`;
        productMessage += `🎯 **${product.name}**\n`;
        if (product.composition) {
          productMessage += `🧾 ${product.composition}\n`;
        }
        productMessage += `\n💰 Choisissez votre taille:\n`;
        
        sizes.forEach((size, index) => {
          const displayNumber = itemIndex <= 9 ? `${itemIndex}️⃣` : itemIndex === 10 ? `🔟` : `🔢${itemIndex}`;
          
          // Choisir le prix selon le mode de livraison
          const isDelivery = session.context.deliveryMode === 'livraison';
          const selectedPrice = isDelivery ? (size.price_delivery || size.price_on_site || size.price) : (size.price_on_site || size.price);
          
          const formattedPrice = formatPrice(selectedPrice, 'EUR');
          const drinkInfo = size.includes_drink ? ' (+ boisson)' : '';
          
          productMessage += `   🔸 ${size.size_name} (${formattedPrice}) - Tapez ${itemIndex}${drinkInfo}\n`;
          
          const menuItem = {
            index: itemIndex,
            item: {
              ...product,
              size_id: size.id,
              size_name: size.size_name,
              final_price: selectedPrice,
              includes_drink: size.includes_drink,
              display_name: `${product.name} ${size.size_name}`
            }
          };
          
          console.log('🔍 DEBUG création menuItem:', 
            'product:', product.name, 
            'size:', size.size_name, 
            'includes_drink dans size:', size.includes_drink,
            'includes_drink dans item:', menuItem.item.includes_drink);
            
          orderedMenu.push(menuItem);
          itemIndex++;
        });
        productMessage += '\n';
      }
    } else {
      // Produit simple - appliquer le format uniforme pour les menus
      const isDelivery = session.context.deliveryMode === 'livraison';
      const selectedPrice = isDelivery ? (product.price_delivery_base || product.base_price) : (product.price_on_site_base || product.base_price);
      const formattedPrice = selectedPrice ? formatPrice(selectedPrice, 'EUR') : 'Prix à définir';
      
      // Séparateur visuel identique aux pizzas pour les menus
      if (product.name && product.name.includes('MENU')) {
        productMessage += `━━━━━━━━━━━━━━━━━━━━━\n`;
        productMessage += `🎯 *${product.name}*\n`;
        if (product.composition || product.description) {
          productMessage += `🧾 ${product.composition || product.description}\n`;
        }
        productMessage += `\n💰 Choisissez votre option:\n`;
        productMessage += `   🔸 STANDARD (${formattedPrice}) - Tapez ${itemIndex}\n\n`;
      } else {
        // Format classique pour les produits non-menu
        const displayNumber = itemIndex <= 9 ? `${itemIndex}️⃣` : itemIndex === 10 ? `🔟` : `🔢${itemIndex}`;
        productMessage += `${displayNumber} ${product.name} - ${formattedPrice}\n`;
        if (product.description || product.composition) {
          productMessage += `   ${product.description || product.composition}\n`;
        }
      }
      
      orderedMenu.push({
        index: itemIndex,
        item: {
          ...product,
          final_price: selectedPrice,
          display_name: product.name
        }
      });
      
      itemIndex++;
    }
  }

  const totalItems = orderedMenu.length;
  const cart = session.context.cart || {};
  const hasItemsInCart = Object.keys(cart).length > 0;
  
  // Vérifier si la catégorie contient des produits modulaires
  const hasModularProducts = categoryProducts.some(product => product.product_type === 'modular');
  
  if (hasModularProducts) {
    productMessage += `\n💡 Choisissez votre option: tapez le numéro`;
    if (totalItems > 0) {
      productMessage += `\nEx: 1 = ${orderedMenu[0]?.item.display_name}, 2 = ${orderedMenu[1]?.item.display_name || 'option #2'}`;
      productMessage += `\n(Chaque produit sera configuré individuellement)`;
    }
  } else {
    productMessage += `\n💡 Pour commander: tapez les numéros`;
    if (totalItems > 0) {
      productMessage += `\nEx: 1,2,2 = 1× ${orderedMenu[0]?.item.display_name} + 2× ${orderedMenu[1]?.item.display_name || 'item #2'}`;
    }
  }
  
  if (hasItemsInCart) {
    // Afficher les options de finalisation si panier non vide
    productMessage += `\n\n00 - Finaliser la commande`;
    productMessage += `\n000 - Continuer vos achats (garder le panier)`;
    productMessage += `\n0000 - Recommencer (vider le panier)`;
  } else {
    // Afficher les options classiques si panier vide
    productMessage += `\n\n🔙 Tapez "0" pour les catégories`;
    productMessage += `\n🛒 Tapez "00" pour voir votre commande`;
    productMessage += `\n❌ Tapez "annuler" pour arrêter`;
  }

  // Mettre à jour la session
  await SimpleSession.update(session.id, {
    state: 'VIEWING_CATEGORY',
    context: preserveTotalPriceContext(session.context, {
      currentCategory: categoryKey,
      currentCategoryProducts: categoryProducts,
      menuOrder: orderedMenu
    })
  });

  await whatsapp.sendMessage(phoneNumber, productMessage);
  console.log('✅ Produits de catégorie affichés:', totalItems, 'items au total');
}

// Fonction pour traiter une commande multiple
async function handleMultipleOrderCommand(phoneNumber: string, session: any, orderNumbers: number[], menuOrder: any[]) {
  console.log('🛒 Traitement commande multiple:', orderNumbers);
  
  // Compter les occurrences de chaque produit
  const itemCounts = new Map<number, number>();
  orderNumbers.forEach(num => {
    itemCounts.set(num, (itemCounts.get(num) || 0) + 1);
  });

  // Vérifier s'il y a des produits avec boisson incluse
  let hasProductsWithDrinks = false;
  for (const [itemNumber] of itemCounts) {
    if (itemNumber > menuOrder.length) continue;
    const menuEntry = menuOrder.find((entry: any) => entry.index === itemNumber);
    if (menuEntry && menuEntry.item.includes_drink) {
      hasProductsWithDrinks = true;
      break;
    }
  }

  // Si des produits incluent des boissons, traiter individuellement
  if (hasProductsWithDrinks) {
    await whatsapp.sendMessage(phoneNumber, 
      '🥤 Votre commande contient des menus avec boissons incluses.\n' +
      '📝 Veuillez commander chaque menu individuellement pour choisir vos boissons.\n\n' +
      '💡 Tapez juste le numéro du menu souhaité (ex: "1" pour le premier menu).');
    return;
  }

  let totalAdded = 0;
  const addedItems: string[] = [];
  
  // Traiter chaque produit unique avec sa quantité (sans boisson incluse)
  for (const [itemNumber, quantity] of itemCounts) {
    if (itemNumber > menuOrder.length) {
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(itemNumber.toString(), 'cart') + `\n\n📋 Le menu contient ${menuOrder.length} articles.`);
      return;
    }
    
    const menuEntry = menuOrder.find((entry: any) => entry.index === itemNumber);
    if (menuEntry) {
      await addItemToCart(phoneNumber, session, menuEntry.item, quantity, true); // Mode silencieux
      addedItems.push(`${quantity}× ${menuEntry.item.display_name}`);
      totalAdded += quantity;
    }
  }
  
  // Récupérer la session mise à jour pour afficher le panier complet
  const updatedSession = await SimpleSession.get(phoneNumber);
  const currentCart = updatedSession?.context?.cart || {};
  
  // Message de confirmation avec panier complet
  const itemsList = addedItems.join('\n• ');
  let cartMessage = `✅ **${totalAdded} produit(s) ajouté(s) au panier !**\n\n• ${itemsList}\n\n`;
  
  cartMessage += `🛒 **Votre panier complet:**\n📍 Restaurant: ${updatedSession?.context?.selectedRestaurantName}\n\n`;
  let totalPrice = 0;
  
  Object.values(currentCart).forEach((cartItem: any) => {
    console.log('🛒 DEBUG cartItem:', JSON.stringify(cartItem, null, 2));
    
    const itemTotal = (cartItem.item.final_price || cartItem.item.base_price) * cartItem.quantity;
    totalPrice += itemTotal;
    
    const sizeName = cartItem.item.size_name ? ` ${cartItem.item.size_name}` : '';
    
    // Utiliser display_name si disponible, sinon fallback sur name + sizeName
    let itemName = cartItem.item.display_name || `${cartItem.item.name}${sizeName}`;
    
    console.log('🔍 DEBUG affichage panier:');
    console.log('  - item.name:', cartItem.item.name);
    console.log('  - item.display_name:', cartItem.item.display_name);
    console.log('  - sizeName:', sizeName);
    console.log('  - itemName final:', itemName);
    
    // Ajouter détails de configuration si présents
    if (cartItem.item.configuration_details && cartItem.item.configuration_details.length > 0) {
      itemName += ` (${cartItem.item.configuration_details.join(', ')})`;
    }
    
    cartMessage += `${cartItem.quantity}× ${itemName}\n   ${(cartItem.item.final_price || cartItem.item.base_price)} EUR\n\n`;
  });
  
  cartMessage += `💰 **Total: ${totalPrice.toFixed(2)} EUR**\n\n`;
  cartMessage += `**Que souhaitez-vous faire ?**\n🛒 00 - Voir le panier complet\n⚡ 99 - Finaliser maintenant\n🔙 0 - Retour au menu\n\nTapez un autre numéro pour continuer vos achats`;
  
  await whatsapp.sendMessage(phoneNumber, cartMessage);
}

// Fonction pour traiter une commande
async function handleOrderCommand(phoneNumber: string, session: any, command: string) {
  console.log('🛒 Traitement commande:', command);
  const orderNumbers = parseOrderCommand(command);
  
  if (orderNumbers.length === 0) {
    await whatsapp.sendMessage(phoneNumber, 
      '❓ Format de commande invalide. Utilisez des numéros séparés par des virgules.\nEx: 1,2,3');
    return;
  }

  const menuOrder = session.context.menuOrder || [];
  
  if (menuOrder.length === 0) {
    await whatsapp.sendMessage(phoneNumber, 
      '❌ Erreur: menu non disponible. Retapez le numéro du restaurant.');
    return;
  }

  // Vérifier si commande multiple contient des produits modulaires complexes
  if (orderNumbers.length > 1) {
    // Vérifier chaque produit pour voir s'il y a des produits modulaires avec plusieurs tailles/options
    let hasComplexModularProducts = false;
    
    for (const itemNumber of orderNumbers) {
      if (itemNumber > menuOrder.length) continue;
      
      const menuEntry = menuOrder.find((entry: any) => entry.index === itemNumber);
      if (menuEntry && menuEntry.item.product_type === 'modular') {
        // Vérifier si le produit a plusieurs tailles ou options obligatoires
        const { data: sizes } = await supabase
          .from('france_product_sizes')
          .select('id')
          .eq('product_id', menuEntry.item.id);
          
        const { data: requiredOptions } = await supabase
          .from('france_product_options')
          .select('id')
          .eq('product_id', menuEntry.item.id)
          .eq('is_required', true);
        
        // Si plus d'une taille OU des options obligatoires, c'est complexe
        if ((sizes && sizes.length > 1) || (requiredOptions && requiredOptions.length > 0)) {
          hasComplexModularProducts = true;
          break;
        }
      }
    }
    
    if (hasComplexModularProducts) {
      await whatsapp.sendMessage(phoneNumber, 
        '💡 Pour les produits avec options, commandez un par un.\nTapez juste le numéro du produit souhaité.');
      return;
    }
    
    // Si pas de produits modulaires complexes, traiter la commande multiple
    await handleMultipleOrderCommand(phoneNumber, session, orderNumbers, menuOrder);
    return;
  }

  const itemNumber = orderNumbers[0];
  
  // Vérifier que le numéro est valide
  if (itemNumber > menuOrder.length) {
    await whatsapp.sendMessage(phoneNumber, 
      getSuggestionMessage(itemNumber.toString(), 'cart') + `\n\n📋 Le menu contient ${menuOrder.length} articles.`);
    return;
  }

  const menuEntry = menuOrder.find((entry: any) => entry.index === itemNumber);
  if (!menuEntry) {
    await whatsapp.sendMessage(phoneNumber, '❌ Erreur: produit non trouvé.');
    return;
  }

  const selectedItem = menuEntry.item;
  console.log('🎯 Produit sélectionné:', selectedItem.display_name, 'Type:', selectedItem.product_type);
  console.log('🔍 DEBUG selectedItem complet:', JSON.stringify(selectedItem, null, 2));

  // 🆕 GESTION SPÉCIALE PIZZA ET MENUS - Vérifier le type
  if (selectedItem.is_pizza_menu) {
    // 🆕 ÉTAPE 4: Menu pizza interactif
    console.log('📋 [MENU] Menu pizza détecté - Traitement interactif');
    await handlePizzaMenuSelection(phoneNumber, session, selectedItem);
    return;
  }
  
  // 🆕 GESTION MENU ENFANT
  if (selectedItem.name === 'MENU ENFANT') {
    console.log('👶 [MENU ENFANT] Menu enfant détecté - Traitement interactif');
    await handleMenuEnfantSelection(phoneNumber, session, selectedItem);
    return;
  }
  
  if (selectedItem.is_pizza) {
    console.log('🍕 [PIZZA] Pizza détectée - Traitement spécialisé');
    
    // Vérifier s'il s'agit d'une taille Sénior ou Méga pour l'offre 1=2
    if (selectedItem.size_name === 'SENIOR' || selectedItem.size_name === 'MEGA') {
      console.log('🍕 [PIZZA] Taille éligible à l\'offre 1=2:', selectedItem.size_name);
      // Proposer l'offre 1 achetée = 2ème offerte
      await handlePizzaOffer1For2(phoneNumber, session, selectedItem);
      return;
    }
    
    // Proposer les suppléments pour la pizza
    const hasSupplements = await handlePizzaSupplements(phoneNumber, session, selectedItem);
    if (hasSupplements) {
      // Les suppléments ont été proposés, le workflow continue via SELECTING_PIZZA_SUPPLEMENTS
      return;
    } else {
      // Pas de suppléments disponibles - ajouter directement au panier
      console.log('🍕 [PIZZA] Aucun supplément - Ajout direct au panier');
      await addItemToCart(phoneNumber, session, selectedItem, 1);
      return;
    }
  }

  // ✅ LOGIQUE EXISTANTE PRÉSERVÉE pour les autres produits
  // Vérifier si le produit a des options obligatoires
  if (selectedItem.product_type === 'modular') {
    const { data: requiredOptions } = await supabase
      .from('france_product_options')
      .select('*')
      .eq('product_id', selectedItem.id)
      .eq('is_required', true)
      .order('display_order');

    console.log('🔍 DEBUG requiredOptions:', requiredOptions ? requiredOptions.length : 'null', 'options');

    if (requiredOptions && requiredOptions.length > 0) {
      // Produit modulaire avec options → Démarrer le processus de sélection
      console.log('🔧 Redirection vers configuration (options obligatoires détectées)');
      await startProductConfiguration(phoneNumber, session, selectedItem);
      return;
    }
  }

  // Vérifier si le produit inclut une boisson
  console.log('🔍 DEBUG includes_drink check:', 
    'selectedItem.includes_drink =', selectedItem.includes_drink, 
    'type =', typeof selectedItem.includes_drink);
  console.log('🔍 DEBUG selectedItem complet:', JSON.stringify(selectedItem, null, 2));
    
  if (selectedItem.includes_drink) {
    console.log('🥤 Produit avec boisson incluse, affichage choix boissons');
    await showDrinkSelection(phoneNumber, session, selectedItem);
    return;
  } else {
    console.log('❌ Pas de boisson incluse détectée, ajout direct au panier');
    console.log('❌ DEBUG - Raison: includes_drink =', selectedItem.includes_drink);
  }

  // Produit simple ou sans options obligatoires → Ajout direct au panier
  await addItemToCart(phoneNumber, session, selectedItem);
}

// Fonction pour démarrer la configuration d'un produit modulaire
async function startProductConfiguration(phoneNumber: string, session: any, selectedItem: any) {
  console.log('🔧 Configuration produit modulaire:', selectedItem.display_name);
  
  // Récupérer toutes les options du produit avec ordre dynamique depuis la DB
  const { data: allOptions } = await supabase
    .from('france_product_options')
    .select('*')
    .eq('product_id', selectedItem.id)
    .order('group_order', { ascending: true })
    .order('option_group', { ascending: true })
    .order('display_order', { ascending: true });

  if (!allOptions || allOptions.length === 0) {
    // Pas d'options → ajout direct au panier
    await addItemToCart(phoneNumber, session, selectedItem);
    return;
  }

  // Grouper les options par groupe en préservant l'ordre de la DB
  const optionGroups: Record<string, any[]> = {};
  const groupNamesOrdered: string[] = [];
  
  allOptions.forEach(option => {
    if (!optionGroups[option.option_group]) {
      optionGroups[option.option_group] = [];
      // Préserver l'ordre de la DB (group_order)
      groupNamesOrdered.push(option.option_group);
    }
    optionGroups[option.option_group].push(option);
  });

  console.log('📋 Groupes d\'options dans l\'ordre DB (group_order):', groupNamesOrdered);
  console.log('📋 Ordre alphabétique (Object.keys):', Object.keys(optionGroups));

  // Commencer par le premier groupe d'options avec l'ordre correct
  await showOptionGroup(phoneNumber, session, selectedItem, groupNamesOrdered[0], optionGroups, 0, groupNamesOrdered);
}

// Fonction pour afficher un groupe d'options
async function showOptionGroup(phoneNumber: string, session: any, selectedItem: any, groupName: string, allGroups: Record<string, any[]>, currentGroupIndex: number, groupNamesOrdered: string[]) {
  const options = allGroups[groupName];
  const isRequired = options[0]?.is_required || false;
  
  let optionMessage = `🔧 **Configuration: ${selectedItem.display_name}**\n\n`;
  
  // Afficher le récap des choix précédents
  const selectedOptions = session.context.selectedOptions || {};
  if (Object.keys(selectedOptions).length > 0) {
    Object.entries(selectedOptions).forEach(([group, option]: [string, any]) => {
      if (Array.isArray(option)) {
        // Sélection multiple
        const names = option.map((opt: any) => opt.option_name).join(' + ');
        optionMessage += `✅ ${group.charAt(0).toUpperCase() + group.slice(1)} : ${names}\n`;
      } else {
        // Sélection simple
        optionMessage += `✅ ${group.charAt(0).toUpperCase() + group.slice(1)} : ${option.option_name}\n`;
      }
    });
    optionMessage += '\n';
  }
  
  optionMessage += `📋 **${groupName.toUpperCase()}** ${isRequired ? '(obligatoire)' : '(optionnel)'}\n\n`;

  options.forEach((option, index) => {
    const emoji = (index + 1) <= 9 ? `${index + 1}️⃣` : `(${index + 1})`;
    const priceInfo = option.price_modifier > 0 ? ` (+${formatPrice(option.price_modifier, 'EUR')})` : '';
    optionMessage += `${emoji} ${option.option_name}${priceInfo}\n`;
  });

  if (!isRequired) {
    optionMessage += `\n0️⃣ Aucun supplément\n`;
  }

  // Vérifier si ce groupe permet plusieurs sélections
  const maxSelections = options[0]?.max_selections || 1;
  const isMultiSelection = maxSelections > 1;
  
  if (isMultiSelection) {
    optionMessage += `\n💡 Pour choisir vos ${groupName.toLowerCase()} (maximum ${maxSelections}): tapez les numéros`;
    if (options.length >= 3) {
      optionMessage += `\nEx: 1,3 = ${options[0].option_name} + ${options[2].option_name}, ou 2 = ${options[1].option_name} seule`;
    }
  } else {
    optionMessage += `\n💡 Pour choisir votre ${groupName.toLowerCase()}: tapez les numéros`;
    if (options.length >= 2) {
      const example2 = !isRequired ? ', 0 = Aucun supplément' : '';
      optionMessage += `\nEx: 1 = ${options[0].option_name}${example2}`;
    }
  }
  
  // Options de navigation
  const nextGroupIndex = currentGroupIndex + 1;
  if (nextGroupIndex < groupNamesOrdered.length) {
    const nextGroupName = groupNamesOrdered[nextGroupIndex];
    optionMessage += `\n\n00 - Finaliser cette étape (passer aux ${nextGroupName})`;
  } else {
    optionMessage += `\n\n00 - Finaliser cette étape (dernière étape)`;
  }
  optionMessage += `\n000 - Ajouter au panier et continuer les achats`;
  optionMessage += `\n0000 - Recommencer la configuration`;
  optionMessage += '\n\n❌ Tapez "annuler" pour arrêter';

  await whatsapp.sendMessage(phoneNumber, optionMessage);

  // Mettre à jour la session avec l'ordre correct des groupes
  console.log(`💾 Sauvegarde session - Groupe actuel: ${groupName} (index ${currentGroupIndex})`);
  console.log(`💾 Ordre des groupes sauvegardé:`, groupNamesOrdered);
  
  await SimpleSession.update(session.id, {
    state: 'CONFIGURING_PRODUCT',
    context: preserveTotalPriceContext(session.context, {
      configuringProduct: selectedItem,
      currentOptionGroup: groupName,
      allOptionGroups: allGroups,
      groupNamesOrdered: groupNamesOrdered, // ✅ SAUVEGARDER L'ORDRE CORRECT
      currentGroupIndex: currentGroupIndex,
      selectedOptions: session.context.selectedOptions || {}
    })
  });
}

// Fonction pour traiter le choix d'options
async function handleOptionSelection(phoneNumber: string, session: any, choice: string) {
  console.log(`🎯 handleOptionSelection appelé - Choix: "${choice}"`);
  
  const configuringProduct = session.context.configuringProduct;
  const currentGroup = session.context.currentOptionGroup;
  const allGroups = session.context.allOptionGroups;
  const currentGroupIndex = session.context.currentGroupIndex;
  const selectedOptions = session.context.selectedOptions || {};
  
  console.log(`🎯 Context - Groupe: ${currentGroup}, Index: ${currentGroupIndex}`);
  console.log(`🎯 Options disponibles:`, Object.keys(allGroups));
  
  const options = allGroups[currentGroup];
  const choiceNumber = parseInt(choice.trim());
  
  console.log(`🎯 Choix numérique: ${choiceNumber}, Options dans groupe: ${options?.length || 0}`);
  
  // Vérifier le choix
  if (choice.trim() === '00') {
    // 00 = Finaliser cette étape (passer au groupe suivant)
    console.log(`⏭️ Finalisation étape ${currentGroup} (passage au suivant)`);
  } else if (choice.trim() === '000') {
    // 000 = Ajouter au panier avec choix actuels
    console.log(`🛒 Ajout au panier avec choix actuels`);
    await finalizeProductConfiguration(phoneNumber, session, configuringProduct, selectedOptions);
    return;
  } else if (choice.trim() === '0000') {
    // 0000 = Recommencer la configuration
    console.log(`🔄 Recommencer la configuration`);
    await startProductConfiguration(phoneNumber, session, configuringProduct);
    return;
  } else if (choiceNumber === 0 && !options[0]?.is_required) {
    // Aucun supplément choisi pour groupe optionnel
    console.log(`⏭️ Aucun supplément choisi pour ${currentGroup}`);
  } else {
    // Traitement des sélections (simple ou multiple)
    const maxSelections = options[0]?.max_selections || 1;
    const choiceNumbers = choice.trim().split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    
    console.log(`🎯 Analyse choix: "${choice}" → [${choiceNumbers.join(', ')}], max: ${maxSelections}`);
    
    // Validation des choix
    const invalidChoices = choiceNumbers.filter(n => n < 1 || n > options.length);
    if (invalidChoices.length > 0) {
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(invalidChoices.join(', '), 'options') + `\n\n🔧 Tapez un numéro entre 1 et ${options.length}.`);
      return;
    }
    
    // Validation du nombre de sélections
    if (choiceNumbers.length > maxSelections) {
      await whatsapp.sendMessage(phoneNumber, 
        `❌ Trop de sélections. Maximum ${maxSelections} ${currentGroup}(s) autorisé(s).`);
      return;
    }
    
    if (choiceNumbers.length === 0) {
      await whatsapp.sendMessage(phoneNumber, 
        `❌ Choix invalide. Tapez un numéro entre ${options[0]?.is_required ? '1' : '0'} et ${options.length}, ou utilisez les options de navigation (00, 000, 0000).`);
      return;
    }
    
    // Enregistrer les sélections
    if (maxSelections === 1) {
      // Sélection simple
      const selectedOption = options[choiceNumbers[0] - 1];
      selectedOptions[currentGroup] = selectedOption;
      console.log(`✅ Option sélectionnée: ${selectedOption.option_name} pour ${currentGroup}`);
    } else {
      // Sélection multiple
      const selectedMultipleOptions = choiceNumbers.map(n => options[n - 1]);
      selectedOptions[currentGroup] = selectedMultipleOptions;
      const names = selectedMultipleOptions.map(opt => opt.option_name).join(' + ');
      console.log(`✅ Options sélectionnées: ${names} pour ${currentGroup}`);
    }
  }

  // Mettre à jour les selectedOptions dans la session
  await SimpleSession.update(session.id, {
    context: preserveTotalPriceContext(session.context, {
      selectedOptions: selectedOptions
    })
  });

  // 🆕 LOGIQUE SPÉCIALE TACOS UX - Gestion extras_choice
  if (currentGroup === 'extras_choice') {
    const selectedChoice = selectedOptions[currentGroup];
    console.log(`🎯 [TACOS UX] Choix extras_choice:`, selectedChoice?.option_name);
    
    if (selectedChoice?.option_name === 'Pas de suppléments') {
      // Choix 2: Pas de suppléments → Direct finalisation
      console.log(`🏁 [TACOS UX] Pas de suppléments choisi → Finalisation directe`);
      await finalizeProductConfiguration(phoneNumber, session, configuringProduct, selectedOptions);
      return;
    } else if (selectedChoice?.option_name === 'Ajouter des suppléments') {
      // Choix 1: Ajouter suppléments → Continuer vers groupe extras
      console.log(`➡️ [TACOS UX] Suppléments choisis → Passage aux extras`);
      // La logique normale continuera vers le groupe suivant (extras)
    }
  }

  // Passer au groupe suivant ou terminer
  const groupNamesOrdered = session.context.groupNamesOrdered || Object.keys(allGroups);
  const nextGroupIndex = currentGroupIndex + 1;
  
  console.log(`🔄 Progression: groupe actuel "${currentGroup}" (index ${currentGroupIndex})`);
  console.log(`🔄 Ordre des groupes:`, groupNamesOrdered);
  console.log(`🔄 Prochain index: ${nextGroupIndex}, Total groupes: ${groupNamesOrdered.length}`);

  if (nextGroupIndex < groupNamesOrdered.length) {
    // Afficher le groupe suivant
    console.log(`➡️ Passage au groupe suivant: ${groupNamesOrdered[nextGroupIndex]}`);
    await showOptionGroup(phoneNumber, session, configuringProduct, groupNamesOrdered[nextGroupIndex], allGroups, nextGroupIndex, groupNamesOrdered);
  } else {
    // Configuration terminée → calculer le prix final et ajouter au panier
    console.log(`🏁 Configuration terminée, finalisation...`);
    await finalizeProductConfiguration(phoneNumber, session, configuringProduct, selectedOptions);
  }
}

// Fonction pour finaliser la configuration et ajouter au panier
async function finalizeProductConfiguration(phoneNumber: string, session: any, baseItem: any, selectedOptions: Record<string, any>) {
  console.log('🏁 Finalisation configuration produit');
  
  // Calculer le prix final
  let finalPrice = baseItem.final_price || baseItem.base_price || 0;
  let configurationDetails = [];
  
  Object.values(selectedOptions).forEach((option: any) => {
    if (Array.isArray(option)) {
      // Sélection multiple
      option.forEach((opt: any) => {
        finalPrice += opt.price_modifier || 0;
        configurationDetails.push(opt.option_name);
      });
    } else {
      // Sélection simple
      finalPrice += option.price_modifier || 0;
      configurationDetails.push(option.option_name);
    }
  });

  // Créer l'item configuré
  const configuredItem = {
    ...baseItem,
    final_price: finalPrice,
    selected_options: selectedOptions,
    display_name: `${baseItem.display_name}${configurationDetails.length > 0 ? ` (${configurationDetails.join(', ')})` : ''}`,
    configuration_details: configurationDetails
  };

  // Confirmation avant ajout au panier
  let confirmMessage = `✅ **Tacos configuré avec succès !**\n\n`;
  confirmMessage += `🍽️ **${baseItem.name.toUpperCase()} (${formatPrice(finalPrice, 'EUR')})**\n`;
  
  if (configurationDetails.length > 0) {
    Object.entries(selectedOptions).forEach(([group, option]: [string, any]) => {
      if (Array.isArray(option)) {
        // Multi-sélection
        const optionNames = option.map(opt => opt.option_name).join(', ');
        confirmMessage += `• ${group.charAt(0).toUpperCase() + group.slice(1)}: ${optionNames}\n`;
      } else {
        // Sélection simple
        confirmMessage += `• ${group.charAt(0).toUpperCase() + group.slice(1)}: ${option.option_name}\n`;
      }
    });
    confirmMessage += '\n';
  }

  confirmMessage += `**Que souhaitez-vous faire ?**\n`;
  confirmMessage += `1️⃣ Ajouter au panier\n`;
  confirmMessage += `2️⃣ Recommencer\n`;
  confirmMessage += `0️⃣ Retour menu`;

  await whatsapp.sendMessage(phoneNumber, confirmMessage);

  // Mettre à jour la session
  await SimpleSession.update(session.id, {
    state: 'CONFIRMING_CONFIGURATION',
    context: preserveTotalPriceContext(session.context, {
      configuredItem: configuredItem
    })
  });
}

// Fonction pour gérer la confirmation de la configuration produit
async function handleConfigurationConfirmation(phoneNumber: string, session: any, choice: string) {
  console.log('✅ Confirmation configuration:', choice);
  
  const normalizedChoice = choice.toLowerCase().trim();
  
  switch (normalizedChoice) {
    case '1':
      // Ajouter au panier
      const configuredItem = session.context.configuredItem;
      await addItemToCart(phoneNumber, session, configuredItem);
      
      // Retour à l'affichage des produits - récupérer la session mise à jour
      const updatedSession = await SimpleSession.get(phoneNumber);
      if (updatedSession) {
        // ⚠️ NE PAS forcer ORDERING si la session est en DRINK_SELECTION (sélection boisson en cours)
        if (updatedSession.state !== 'DRINK_SELECTION') {
          await SimpleSession.update(session.id, {
            state: 'ORDERING',
            context: {
              ...updatedSession.context,
              configuredItem: null,
              currentConfiguration: null
            }
          });
        } else {
          // Session en DRINK_SELECTION : nettoyer seulement le contexte sans changer l'état
          await SimpleSession.update(session.id, {
            context: {
              ...updatedSession.context,
              configuredItem: null,
              currentConfiguration: null
            }
          });
        }
      }
      break;
      
    case '2':
      // Recommencer la configuration
      const baseItem = session.context.configuredItem;
      await startProductConfiguration(phoneNumber, session, baseItem);
      break;
      
    case '0':
      // Retour aux produits
      await whatsapp.sendMessage(phoneNumber, 
        `🔄 Retour à la sélection des produits.\n\n` +
        `Tapez le numéro d'un produit pour continuer.`);
      
      await SimpleSession.update(session.id, {
        state: 'ORDERING',
        context: preserveTotalPriceContext(session.context, {
          configuredItem: null,
          currentConfiguration: null
        })
      });
      
      // Afficher les produits de la catégorie actuelle
      const currentCategory = session.context.selectedCategory;
      if (currentCategory) {
        await showProductsInCategory(phoneNumber, session.context.selectedRestaurant, session, currentCategory);
      }
      break;
      
    default:
      await whatsapp.sendMessage(phoneNumber, 
        `❌ Choix non valide.\n\n` +
        `Tapez :\n` +
        `1️⃣ pour ajouter au panier\n` +
        `2️⃣ pour recommencer\n` +
        `0️⃣ pour retourner aux produits`);
  }
}

// Fonction pour récupérer les boissons 33CL disponibles
async function getAvailableDrinks(restaurantId: number): Promise<any[]> {
  try {
    // 1. D'abord récupérer l'ID de la catégorie DRINKS
    const { data: drinkCategory, error: categoryError } = await supabase
      .from('france_menu_categories')
      .select('id')
      .eq('slug', 'drinks')
      .eq('restaurant_id', restaurantId)
      .single();

    if (categoryError || !drinkCategory) {
      console.error('❌ [getAvailableDrinks] Catégorie DRINKS introuvable:', categoryError);
      return [];
    }

    // 2. UNIQUEMENT les boissons simples 33CL (product_type = 'simple')
    const { data: simpleProducts, error: simpleError } = await supabase
      .from('france_products')
      .select(`
        id,
        name,
        product_type,
        price_on_site_base,
        price_delivery_base,
        composition,
        display_order
      `)
      .eq('restaurant_id', restaurantId)
      .eq('category_id', drinkCategory.id)
      .eq('product_type', 'simple')
      .eq('is_active', true)
      .order('display_order');

    // 3. Mapper SEULEMENT les produits simples (33CL)
    const drinks33CL = (simpleProducts || []).map(p => ({
      id: p.id,
      name: p.name,
      variant_name: '33CL',
      price_on_site: p.price_on_site_base,
      price_delivery: p.price_delivery_base,
      product_type: p.product_type,
      display_order: p.display_order
    }));

    console.log(`🥤 [getAvailableDrinks] Catégorie DRINKS ID=${drinkCategory.id}, trouvé ${drinks33CL.length} boissons 33CL:`, 
      drinks33CL.slice(0, 3).map(d => `${d.name} (${d.variant_name})`));

    return drinks33CL;
  } catch (error) {
    console.error('❌ [getAvailableDrinks] Erreur critique:', error);
    return [];
  }
}

// Fonction pour afficher le choix de boisson
async function showDrinkSelection(phoneNumber: string, session: any, selectedItem: any, quantity: number = 1) {
  console.log('🥤 Affichage sélection boissons pour:', selectedItem.display_name);
  
  // Récupérer les boissons disponibles
  const drinks = await getAvailableDrinks(session.context.selectedRestaurantId);
  
  if (drinks.length === 0) {
    console.log('❌ Aucune boisson trouvée');
    // Fallback: ajouter directement au panier sans boisson
    await addItemToCart(phoneNumber, session, selectedItem);
    return;
  }

  // Construire le message de sélection - VERSION 1 modernisée
  // Utiliser le nom de base sans la boisson pour éviter l'affichage prématuré
  const baseDisplayName = selectedItem.display_name.split(' + ')[0]; // Retirer la partie boisson si présente
  let message = `🍔 **${baseDisplayName}**\n`;
  message += `🎁 Votre boisson offerte est incluse !\n\n`;
  message += `┌─ 🥤 **CHOISISSEZ VOTRE BOISSON**\n│\n`;

  drinks.forEach((drink, index) => {
    // Emoji spécifique selon la boisson
    let emoji = '🥤'; // default
    const drinkName = drink.name.toUpperCase();
    if (drinkName.includes('ZERO')) emoji = '⚫';
    else if (drinkName.includes('OASIS')) emoji = '🍊';
    else if (drinkName.includes('ICE TEA')) emoji = '🧊';
    else if (drinkName.includes('COCA')) emoji = '🥤';
    
    const isLast = index === drinks.length - 1;
    const prefix = isLast ? '└─' : '├─';
    message += `${prefix} ${index + 1}️⃣ ${emoji} **${drink.name}** ${drink.variant_name}\n`;
  });

  message += `\n💡 **Tapez simplement le chiffre de votre choix**`;

  // Sauvegarder l'état pour la prochaine étape
  console.log('🔄 [DRINK] AVANT sauvegarde session - sessionId:', session.id);
  const updatedSession = await SimpleSession.update(session.id, {
    state: 'DRINK_SELECTION',
    context: preserveTotalPriceContext(session.context, {
      selectedItemWithDrink: selectedItem,
      selectedQuantity: quantity,  // NOUVEAU : sauvegarder la quantité
      availableDrinks: drinks
    })
  });
  console.log('✅ [DRINK] APRÈS sauvegarde - State: DRINK_SELECTION');

  // VÉRIFICATION IMMÉDIATE : Re-récupérer la session pour vérifier la persistance
  const phoneFormatted = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
  const verifySession = await SimpleSession.get(phoneFormatted.replace('@c.us', ''));
  console.log('🔍 [DRINK] VÉRIFICATION IMMÉDIATE - Session ré-récupérée:', {
    sessionExists: !!verifySession,
    sessionId: verifySession?.id,
    sessionState: verifySession?.state,
    contextKeys: verifySession?.context ? Object.keys(verifySession.context) : 'no-context',
    hasSelectedItemWithDrink: !!verifySession?.context?.selectedItemWithDrink,
    hasAvailableDrinks: !!verifySession?.context?.availableDrinks
  });

  await whatsapp.sendMessage(phoneNumber, message);
}

// Fonction pour ajouter un item au panier (produits simples ou configurés)
async function addItemToCart(phoneNumber: string, session: any, item: any, quantity: number = 1, silent: boolean = false) {
  console.log('📦 addItemToCart - DÉBUT');
  console.log('🔍 DEBUG item reçu:', JSON.stringify(item, null, 2));
  console.log('🔍 DEBUG quantity:', quantity, 'silent:', silent);
  
  // 🆕 NOUVEAU : Détection des menus interactifs (AVANT toute autre logique)
  if (!silent && item.name && (
    item.name.includes('📋 MENU 1') || 
    item.name.includes('📋 MENU 2') || 
    item.name.includes('📋 MENU 3') || 
    item.name.includes('📋 MENU 4')
  )) {
    console.log('🍽 [MENU INTERACTIF] Menu détecté:', item.name);
    console.log('🍽 [MENU INTERACTIF] PhoneNumber:', phoneNumber);
    console.log('🍽 [MENU INTERACTIF] Session state avant:', session.state);
    console.log('🍽 [MENU INTERACTIF] Item complet:', JSON.stringify(item, null, 2));
    await startMenuConfiguration(phoneNumber, session, item);
    return; // Arrêter ici, la suite sera gérée par CONFIGURING_MENU
  }
  
  // 🥤 NOUVEAU : Vérification boisson pour produits configurés (AVANT ajout panier)
  // ⚠️ NE PAS redemander de boisson si elle est déjà sélectionnée
  if (item.includes_drink && !silent && !item.selected_drink) {
    console.log('🥤 Produit configuré avec boisson détectée, redirection vers sélection...');
    await showDrinkSelection(phoneNumber, session, item, quantity);
    return; // Arrêter ici, la suite sera gérée par DRINK_SELECTION
  }
  
  const cart: Record<string, { item: any; quantity: number }> = session.context.cart || {};
  
  // Créer une clé unique pour l'item (incluant les options si configuré)
  const itemKey = item.selected_options 
    ? `item_${item.id}_${JSON.stringify(item.selected_options)}`
    : `item_${item.id}_${item.size_id || 'base'}`;
    
  console.log('🔑 DEBUG itemKey généré:', itemKey);

  if (cart[itemKey]) {
    cart[itemKey].quantity += quantity;
    console.log('🔄 Quantité mise à jour pour item existant');
  } else {
    cart[itemKey] = {
      item: item,
      quantity: quantity
    };
    console.log('➕ Nouvel item ajouté au panier');
  }
  
  console.log('💾 Item stocké dans cart[itemKey]:', JSON.stringify(cart[itemKey], null, 2));

  // 💰 CORRECTION BUG: Calculer le total du panier après ajout
  let cartTotal = 0;
  Object.values(cart).forEach(cartItem => {
    const itemPrice = cartItem.item.final_price || cartItem.item.base_price || 0;
    cartTotal += itemPrice * cartItem.quantity;
  });
  console.log('💰 [addItemToCart] Total calculé:', cartTotal);
  console.log('🔍 [addItemToCart] TRACE - session.id:', session.id);
  console.log('🔍 [addItemToCart] TRACE - item.name:', item.name);
  console.log('🔍 [addItemToCart] TRACE - silent:', silent);

  // Sauvegarder le panier ET le total mis à jour dans la session
  await SimpleSession.update(session.id, {
    context: preserveTotalPriceContext(session.context, {
      cart: cart,
      totalPrice: cartTotal  // 💰 CORRECTION: Sauvegarder le total calculé
    })
  });
  console.log('💾 [addItemToCart] Panier et total sauvegardés - totalPrice:', cartTotal);

  // Utiliser le panier local (qui contient déjà le nouvel item)
  const updatedSession = await SimpleSession.get(phoneNumber);
  
  // Afficher confirmation d'ajout avec panier complet - VERSION MOBILE SIMPLIFIÉE
  let confirmMessage = `✅ *${item.name.toUpperCase()} ajouté !*\n\n`;
  
  // Emoji spécifique selon le type de produit
  let productEmoji = '🍽️'; // default
  if (item.name.toLowerCase().includes('tacos')) productEmoji = '🌮';
  else if (item.name.toLowerCase().includes('burger') || item.name.toLowerCase().includes('savoyard') || item.name.toLowerCase().includes('américain')) productEmoji = '🍔';
  else if (item.name.toLowerCase().includes('pizza')) productEmoji = '🍕';
  else if (item.name.toLowerCase().includes('sandwich')) productEmoji = '🥪';
  else if (item.name.toLowerCase().includes('naan')) productEmoji = '🫓';
  
  confirmMessage += `${productEmoji} *${item.name.toUpperCase()}*\n`;
  
  // Afficher les détails de configuration avec espaces
  if (item.selected_options) {
    Object.entries(item.selected_options).forEach(([group, option]: [string, any]) => {
      if (Array.isArray(option)) {
        const optionNames = option.map(opt => opt.option_name).join(', ');
        confirmMessage += `   ${getOptionEmoji(group)} ${optionNames}\n`;
      } else {
        confirmMessage += `   ${getOptionEmoji(group)} ${option.option_name}\n`;
      }
    });
  }
  
  // 🥤 NOUVEAU : Afficher la boisson sélectionnée si présente
  if (item.selected_drink) {
    confirmMessage += `   🥤 ${item.selected_drink.name} ${item.selected_drink.variant}\n`;
  }
  
  // Ajouter composition si disponible avec espaces et icône sur chaque ligne
  if (item.composition) {
    const compositionShort = item.composition.length > 30 ? 
      item.composition.substring(0, 30) + '...' : item.composition;
    
    // Séparer les lignes et ajouter l'icône à chaque ligne
    const compositionLines = compositionShort.split('\n');
    compositionLines.forEach(line => {
      if (line.trim()) { // Ignorer les lignes vides
        confirmMessage += `   📝 ${line.trim()}\n`;
      }
    });
  }
  
  confirmMessage += `   💰 *${formatPrice(item.final_price || item.base_price, 'EUR')}*\n`;
  
  confirmMessage += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  confirmMessage += `🛒 *MON PANIER*\n\n`;
  
  let totalPrice = 0;
  let cartIndex = 1;
  const cartItems = Object.values(cart);
  
  // Utiliser le panier local 'cart' qui contient déjà le nouvel item
  cartItems.forEach((cartItem: any) => {
    const itemTotal = (cartItem.item.final_price || cartItem.item.base_price) * cartItem.quantity;
    totalPrice += itemTotal;
    
    const sizeName = cartItem.item.size_name ? ` ${cartItem.item.size_name}` : '';
    
    // Utiliser display_name si disponible, sinon fallback sur name + sizeName
    let itemName = cartItem.item.display_name || `${cartItem.item.name}${sizeName}`;
    
    // Emoji spécifique pour le panier
    let cartEmoji = '🍽️';
    if (cartItem.item.name.toLowerCase().includes('tacos')) cartEmoji = '🌮';
    else if (cartItem.item.name.toLowerCase().includes('burger') || cartItem.item.name.toLowerCase().includes('américain') || cartItem.item.name.toLowerCase().includes('savoyard')) cartEmoji = '🍔';
    else if (cartItem.item.name.toLowerCase().includes('pizza')) cartEmoji = '🍕';
    else if (cartItem.item.name.toLowerCase().includes('sandwich')) cartEmoji = '🥪';
    else if (cartItem.item.name.toLowerCase().includes('naan')) cartEmoji = '🫓';
    
    confirmMessage += `${cartIndex}. ${cartEmoji} *${itemName}*\n`;
    
    // Ajouter composition courte si disponible avec icône sur chaque ligne
    if (cartItem.item.composition) {
      const compositionShort = cartItem.item.composition.length > 30 ? 
        cartItem.item.composition.substring(0, 30) + '...' : cartItem.item.composition;
      
      // Séparer les lignes et ajouter l'icône à chaque ligne
      const compositionLines = compositionShort.split('\n');
      compositionLines.forEach(line => {
        if (line.trim()) { // Ignorer les lignes vides
          confirmMessage += `   📝 ${line.trim()}\n`;
        }
      });
    }
    
    // Ajouter détails de configuration si présents avec icône
    if (cartItem.item.configuration_details && cartItem.item.configuration_details.length > 0) {
      confirmMessage += `   🔧 ${cartItem.item.configuration_details.join(', ')}\n`;
    }
    
    confirmMessage += `   💰 ${formatPrice(cartItem.item.final_price || cartItem.item.base_price, 'EUR')}\n\n`;
    
    cartIndex++;
  });
  
  confirmMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
  confirmMessage += `💎 *TOTAL: ${formatPrice(totalPrice, 'EUR')}*\n`;
  confirmMessage += `📦 ${Object.keys(cart).length} ${Object.keys(cart).length > 1 ? 'produits' : 'produit'}\n\n`;
  confirmMessage += `*ACTIONS RAPIDES:*\n`;
  confirmMessage += `⚡ *99* = Passer commande\n`;
  confirmMessage += `🛒 *00* = Voir panier complet\n`;
  confirmMessage += `🍕 *0*  = Ajouter d'autres produits`;
  
  // Envoyer le message seulement si pas en mode silencieux
  if (!silent) {
    await whatsapp.sendMessage(phoneNumber, confirmMessage);
  }

  // Mettre à jour la session - retour à VIEWING_CATEGORY
  await SimpleSession.update(session.id, {
    state: 'VIEWING_CATEGORY',
    context: preserveTotalPriceContext(session.context, {
      cart: cart,
      // Nettoyer les variables de configuration
      configuringProduct: undefined,
      currentOptionGroup: undefined,
      allOptionGroups: undefined,
      currentGroupIndex: undefined,
      selectedOptions: undefined,
      configuredItem: undefined
    })
  });
}

// Fonction principale de gestion des messages avec session
async function handleSessionMessage(phoneNumber: string, session: any, message: string) {
  const normalizedMessage = message.toLowerCase().trim();
  
  // Commandes globales
  if (normalizedMessage === 'annuler') {
    await SimpleSession.deleteAllForPhone(phoneNumber);
    await whatsapp.sendMessage(phoneNumber, '❌ Commande annulée. Tapez le numéro du restaurant pour recommencer.');
    return;
  }

  console.log('🔍 [DEBUG] État session AVANT traitement:', {
    phoneNumber,
    message,
    normalizedMessage,
    sessionState: session.state,
    sessionId: session.id,
    hasContext: !!session.context,
    contextKeys: session.context ? Object.keys(session.context) : []
  });

  switch (session.state) {
    case 'CHOOSING_DELIVERY_MODE':
      // Gestion du choix du mode de livraison
      const modeChoice = parseInt(message.trim());
      let deliveryMode = '';
      
      switch (modeChoice) {
        case 1:
          deliveryMode = 'sur_place';
          break;
        case 2:
          deliveryMode = 'a_emporter';
          break;
        case 3:
          deliveryMode = 'livraison';
          break;
        default:
          await whatsapp.sendMessage(phoneNumber, 
            `❌ Choix invalide. Tapez 1, 2 ou 3 :\n📍 1 - Sur place\n📦 2 - À emporter\n🚚 3 - Livraison`);
          return;
      }
      
      // Récupérer les infos restaurant
      const restaurant = await supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', session.context.selectedRestaurantId)
        .single();
      
      if (restaurant.data) {
        await showMenuAfterDeliveryModeChoice(phoneNumber, restaurant.data, deliveryMode);
      }
      break;

    case 'VIEWING_MENU':
      // Sélection de catégorie par numéro
      const categoryNumber = parseInt(message.trim());
      const categories = session.context.categories || [];
      
      if (categoryNumber >= 1 && categoryNumber <= categories.length) {
        const selectedCategory = categories[categoryNumber - 1];
        const restaurant = await supabase
          .from('france_restaurants')
          .select('*')
          .eq('id', session.context.selectedRestaurantId)
          .single();
        
        if (restaurant.data) {
          await showProductsInCategory(phoneNumber, restaurant.data, session, selectedCategory.id);
        }
      } else {
        await whatsapp.sendMessage(phoneNumber, 
          getSuggestionMessage(message, 'menu') + `\n\n📋 Choisissez entre 1 et ${categories.length}.`);
      }
      break;

    case 'DRINK_SELECTION':
      // Gestion sélection de boisson
      console.log('🍺 [DRINK_SELECTION] Message reçu:', normalizedMessage);
      console.log('🍺 [DRINK_SELECTION] Session context keys:', Object.keys(session.context || {}));
      console.log('🍺 [DRINK_SELECTION] selectedItemWithDrink présent:', !!session.context.selectedItemWithDrink);
      console.log('🍺 [DRINK_SELECTION] selectedQuantity:', session.context.selectedQuantity);
      
      const drinkChoice = parseInt(normalizedMessage);
      const availableDrinks = session.context.availableDrinks || [];
      
      console.log('🔍 [DRINK_SELECTION] availableDrinks count:', availableDrinks.length);
      console.log('🔍 [DRINK_SELECTION] drinkChoice parsed:', drinkChoice);
      console.log('🔍 [DRINK_SELECTION] availableDrinks complets:', JSON.stringify(availableDrinks, null, 2));
      
      if (isNaN(drinkChoice) || drinkChoice < 1 || drinkChoice > availableDrinks.length) {
        console.log('❌ Choix boisson invalide');
        await whatsapp.sendMessage(phoneNumber, 
          getSuggestionMessage(message, 'drinks') + `\n\n🥤 Choisissez entre 1 et ${availableDrinks.length}.`);
        return;
      }
      
      // Récupérer la boisson sélectionnée
      const selectedDrink = availableDrinks[drinkChoice - 1];
      const selectedItemWithDrink = session.context.selectedItemWithDrink;
      
      console.log('🍻 DEBUG selectedDrink:', JSON.stringify(selectedDrink, null, 2));
      console.log('🍽️ DEBUG selectedItemWithDrink AVANT modification:', JSON.stringify(selectedItemWithDrink, null, 2));
      
      // Ajouter l'information de la boisson choisie au produit
      selectedItemWithDrink.selected_drink = {
        name: selectedDrink.name,
        variant: selectedDrink.variant_name
      };
      
      const drinkName = `${selectedDrink.name} ${selectedDrink.variant_name}`;
      const originalDisplayName = selectedItemWithDrink.display_name;
      selectedItemWithDrink.display_name += ` + ${drinkName}`;
      
      console.log('🔍 DEBUG modification display_name:');
      console.log('  - Original:', originalDisplayName);
      console.log('  - Drink:', drinkName);
      console.log('  - Final:', selectedItemWithDrink.display_name);
      
      console.log('🍽️ DEBUG selectedItemWithDrink APRÈS modification:', JSON.stringify(selectedItemWithDrink, null, 2));
      
      // Ajouter au panier AVEC message de confirmation complet (silent: false)
      console.log('📦 [DRINK_SELECTION] Appel addItemToCart avec item modifié');
      console.log('🔍 [DRINK_SELECTION] TRACE - session.id avant addItemToCart:', session.id);
      console.log('🔍 [DRINK_SELECTION] TRACE - session.context.totalPrice AVANT addItemToCart:', session.context.totalPrice);
      
      const savedQuantity = session.context.selectedQuantity || 1;
      await addItemToCart(phoneNumber, session, selectedItemWithDrink, savedQuantity, false);
      
      // 🔍 VÉRIFICATION POST-AJOUT : Récupérer la session mise à jour
      const sessionAfterAdd = await SimpleSession.get(phoneNumber);
      console.log('🔍 [DRINK_SELECTION] TRACE - session.context.totalPrice APRÈS addItemToCart:', sessionAfterAdd?.context?.totalPrice);
      console.log('🔍 [DRINK_SELECTION] TRACE - session.id après addItemToCart:', sessionAfterAdd?.id);
      break;

    case 'CONFIGURING_MENU':
      // 🍽 NOUVEAU : Gestion des réponses pendant la configuration de menu
      console.log('🍽 [CONFIGURING_MENU] ==== RÉCEPTION MESSAGE ====');
      console.log('🍽 [CONFIGURING_MENU] Message brut:', message);
      console.log('🍽 [CONFIGURING_MENU] Message normalisé:', normalizedMessage);
      console.log('🍽 [CONFIGURING_MENU] PhoneNumber:', phoneNumber);
      console.log('🍽 [CONFIGURING_MENU] Session state:', session.state);
      
      if (normalizedMessage === 'annuler') {
        console.log('🍽 [CONFIGURING_MENU] Annulation demandée par l\'utilisateur');
        // Annuler la configuration et retourner au menu
        await SimpleSession.update(session.id, {
          state: 'VIEWING_MENU',
          context: {
            ...session.context,
            menuBeingConfigured: null
          }
        });
        console.log('🍽 [CONFIGURING_MENU] Session remise à VIEWING_MENU');
        await whatsapp.sendMessage(phoneNumber, '❌ Configuration du menu annulée.\n\n🔙 Retour au menu précédent.');
        return;
      }
      
      const menuConfig = session.context.menuBeingConfigured;
      console.log('🍽 [CONFIGURING_MENU] Configuration actuelle:', {
        menuType: menuConfig?.menuType,
        currentStep: menuConfig?.currentStep,
        totalSteps: menuConfig?.totalSteps
      });
      
      if (!menuConfig) {
        console.error('❌ [CONFIGURING_MENU] Aucune configuration de menu en cours');
        console.error('❌ [CONFIGURING_MENU] Session context:', JSON.stringify(session.context, null, 2));
        return;
      }
      
      // Gérer la réponse selon le type de menu et l'étape courante
      console.log('🍽 [CONFIGURING_MENU] Transmission vers handleMenuConfigurationResponse...');
      await handleMenuConfigurationResponse(phoneNumber, session, normalizedMessage);
      break;

    case 'CONFIGURING_MENU_ENFANT':
      // 👶 NOUVEAU : Gestion des réponses pendant la configuration MENU ENFANT
      console.log('👶 [CONFIGURING_MENU_ENFANT] Message reçu:', normalizedMessage);
      
      if (normalizedMessage === 'annuler') {
        await SimpleSession.update(session.id, {
          state: 'VIEWING_MENU',
          context: { ...session.context, menuEnfantConfig: null }
        });
        await whatsapp.sendMessage(phoneNumber, '❌ Configuration du menu enfant annulée.');
        return;
      }
      
      await handleMenuEnfantConfigurationResponse(phoneNumber, session, normalizedMessage);
      break;

    case 'CONFIGURING_UNIVERSAL_WORKFLOW':
      // 🏗️ NOUVEAU : Gestion des réponses du workflow universel
      console.log('🏗️ [UNIVERSAL WORKFLOW] Message reçu:', normalizedMessage);
      
      if (normalizedMessage === 'annuler') {
        await SimpleSession.update(session.id, {
          state: 'VIEWING_MENU',
          context: { ...session.context, workflowConfig: null }
        });
        await whatsapp.sendMessage(phoneNumber, '❌ Configuration annulée.');
        return;
      }
      
      await handleUniversalWorkflowResponse(phoneNumber, session, normalizedMessage);
      break;

    case 'ORDERING':
      // Gestion après ajout au panier
      if (normalizedMessage === '00') {
        // Voir le panier
        const cart = session.context.cart || {};
        if (Object.keys(cart).length === 0) {
          await whatsapp.sendMessage(phoneNumber, '🛒 Votre panier est vide.\nCommandez en tapant les numéros des produits.');
        } else {
          // Afficher le panier
          const currentCart = session.context.cart || {};
          let cartMessage = `🛒 **Votre commande**\n📍 Restaurant: ${session.context.selectedRestaurantName}\n\n`;
          let totalPrice = 0;
          
          Object.values(currentCart).forEach((cartItem: any) => {
            const itemTotal = (cartItem.item.final_price || cartItem.item.base_price) * cartItem.quantity;
            const displayName = cartItem.item.display_name || cartItem.item.name;
            
            console.log('🛒 DEBUG cartItem (ligne 1359):', JSON.stringify(cartItem, null, 2));
            console.log('🔍 DEBUG affichage panier (ligne 1359):');
            console.log('  - item.name:', cartItem.item.name);
            console.log('  - item.display_name:', cartItem.item.display_name);
            console.log('  - displayName final:', displayName);
            
            cartMessage += `${cartItem.quantity}× ${displayName}\n   ${formatPrice(itemTotal, 'EUR')}\n\n`;
            totalPrice += itemTotal;
          });
          
          cartMessage += `💰 **Total: ${formatPrice(totalPrice, 'EUR')}**\n\n`;
          cartMessage += `Que voulez-vous faire ?\n\n`;
          cartMessage += `00 - Finaliser la commande\n`;
          cartMessage += `000 - Continuer vos achats (garder le panier)\n`;
          cartMessage += `0000 - Recommencer (vider le panier)`;
          
          await whatsapp.sendMessage(phoneNumber, cartMessage);
          await SimpleSession.update(session.id, { state: 'CONFIRMING_ORDER' });
        }
      } else if (normalizedMessage === '99') {
        // Finaliser maintenant - calculer le total et passer en confirmation
        console.log('💰 Début calcul prix pour option 99');
        const currentCart = session.context.cart || {};
        console.log('🛒 Contenu panier:', JSON.stringify(currentCart, null, 2));
        let totalPrice = 0;
        
        Object.values(currentCart).forEach((cartItem: any) => {
          const itemTotal = (cartItem.item.final_price || cartItem.item.base_price) * cartItem.quantity;
          console.log(`📊 Item: ${cartItem.item.name}, Prix unitaire: ${cartItem.item.final_price || cartItem.item.base_price}, Quantité: ${cartItem.quantity}, Total item: ${itemTotal}`);
          totalPrice += itemTotal;
        });
        
        console.log('💰 Prix total calculé:', totalPrice);
        
        const updatedSession = await SimpleSession.update(session.id, { 
          state: 'CONFIRMING_ORDER',
          context: preserveTotalPriceContext(session.context, {
            totalPrice: totalPrice
          })
        });
        
        console.log('💾 Session mise à jour avec totalPrice:', updatedSession?.context?.totalPrice);
        await handleOrderFinalization(phoneNumber, updatedSession || session);
      } else if (normalizedMessage === '0') {
        // Retour au menu principal (préserver le mode de livraison)
        console.log('🔙 [ORDERING] Retour menu demandé - Mode livraison:', session.context.deliveryMode);
        console.log('🔙 [ORDERING] Panier actuel avant retour:', session.context.cart ? Object.keys(session.context.cart).length + ' items' : 'vide');
        console.log('🔙 [ORDERING] Total actuel:', session.context.totalPrice);
        
        const restaurant = await supabase
          .from('france_restaurants')
          .select('*')
          .eq('id', session.context.selectedRestaurantId)
          .single();
        
        if (restaurant.data && session.context.deliveryMode) {
          // Préserver le mode de livraison - appeler showMenuAfterDeliveryModeChoice
          console.log('✅ [ORDERING] Appel showMenuAfterDeliveryModeChoice avec panier préservé');
          await showMenuAfterDeliveryModeChoice(phoneNumber, restaurant.data, session.context.deliveryMode);
        } else {
          // Fallback si pas de mode défini
          console.log('⚠️ [ORDERING] Fallback handleDirectRestaurantAccess - panier peut être perdu!');
          await handleDirectRestaurantAccess(phoneNumber, restaurant.data);
        }
      } else {
        // Entrée invalide - afficher suggestions
        await whatsapp.sendMessage(phoneNumber, getSuggestionMessage(message, 'cart'));
      }
      break;

    case 'VIEWING_CATEGORY':
      const cart = session.context.cart || {};
      const hasItemsInCart = Object.keys(cart).length > 0;
      
      if (hasItemsInCart && normalizedMessage === '000') {
        // 000 = Continuer vos achats (garder le panier) - rester dans la catégorie
        await whatsapp.sendMessage(phoneNumber, '🛒 Continuez vos achats en tapant les numéros des produits.');
      } else if (hasItemsInCart && normalizedMessage === '0000') {
        // 0000 = Recommencer (vider le panier)
        await SimpleSession.update(session.id, {
          context: preserveTotalPriceContext(session.context, {
            cart: {},
            totalPrice: 0
          })
        });
        
        const restaurant = await supabase
          .from('france_restaurants')
          .select('*')
          .eq('id', session.context.selectedRestaurantId)
          .single();
        
        if (restaurant.data) {
          await handleDirectRestaurantAccess(phoneNumber, restaurant.data);
        }
      } else if (normalizedMessage === '0') {
        // Retour au menu principal (préserver le mode de livraison)
        console.log('🔙 [VIEWING_CATEGORY] Retour menu demandé - Mode livraison:', session.context.deliveryMode);
        console.log('🔙 [VIEWING_CATEGORY] Panier actuel avant retour:', session.context.cart ? Object.keys(session.context.cart).length + ' items' : 'vide');
        console.log('🔙 [VIEWING_CATEGORY] Total actuel:', session.context.totalPrice);
        
        const restaurant = await supabase
          .from('france_restaurants')
          .select('*')
          .eq('id', session.context.selectedRestaurantId)
          .single();
        
        if (restaurant.data && session.context.deliveryMode) {
          // Préserver le mode de livraison - appeler showMenuAfterDeliveryModeChoice
          console.log('✅ [VIEWING_CATEGORY] Appel showMenuAfterDeliveryModeChoice avec panier préservé');
          await showMenuAfterDeliveryModeChoice(phoneNumber, restaurant.data, session.context.deliveryMode);
        } else {
          // Fallback si pas de mode défini
          console.log('⚠️ [VIEWING_CATEGORY] Fallback handleDirectRestaurantAccess - panier peut être perdu!');
          await handleDirectRestaurantAccess(phoneNumber, restaurant.data);
        }
      } else if (normalizedMessage === '99') {
        // Finaliser la commande
        const cart = session.context.cart || {};
        if (Object.keys(cart).length === 0) {
          await whatsapp.sendMessage(phoneNumber, '🛒 Votre panier est vide.\nAjoutez des produits avant de finaliser.');
        } else {
          // Calculer le total et passer en mode confirmation de commande
          let totalPrice = 0;
          Object.values(cart).forEach((cartItem: any) => {
            const itemTotal = (cartItem.item.final_price || cartItem.item.base_price) * cartItem.quantity;
            totalPrice += itemTotal;
          });
          
          await SimpleSession.update(session.id, { 
            state: 'CONFIRMING_ORDER',
            context: preserveTotalPriceContext(session.context, {
              totalPrice: totalPrice
            })
          });
          
          // Vérifier si une adresse de livraison est requise
          await handleOrderFinalization(phoneNumber, session);
        }
      } else if (normalizedMessage === '00') {
        // Voir le panier
        const cart = session.context.cart || {};
        if (Object.keys(cart).length === 0) {
          await whatsapp.sendMessage(phoneNumber, '🛒 Votre panier est vide.\nCommandez en tapant les numéros des produits.');
        } else {
          // Afficher le panier en récupérant les données actuelles
          const currentCart = session.context.cart || {};
          let cartMessage = `🛒 **Votre commande**\n📍 Restaurant: ${session.context.selectedRestaurantName}\n\n`;
          let totalPrice = 0;
          
          Object.values(currentCart).forEach((cartItem: any) => {
            const itemTotal = (cartItem.item.final_price || cartItem.item.base_price) * cartItem.quantity;
            const displayName = cartItem.item.display_name || cartItem.item.name;
            
            console.log('🛒 DEBUG cartItem (ligne 1498):', JSON.stringify(cartItem, null, 2));
            console.log('🔍 DEBUG affichage panier (ligne 1498):');
            console.log('  - item.name:', cartItem.item.name);
            console.log('  - item.display_name:', cartItem.item.display_name);
            console.log('  - displayName final:', displayName);
            
            cartMessage += `${cartItem.quantity}× ${displayName}\n   ${formatPrice(itemTotal, 'EUR')}\n\n`;
            totalPrice += itemTotal;
          });
          
          cartMessage += `💰 **Total: ${formatPrice(totalPrice, 'EUR')}**\n\n`;
          cartMessage += `Que voulez-vous faire ?\n\n`;
          cartMessage += `00 - Finaliser la commande\n`;
          cartMessage += `000 - Continuer vos achats (garder le panier)\n`;
          cartMessage += `0000 - Recommencer (vider le panier)`;
          
          await whatsapp.sendMessage(phoneNumber, cartMessage);
          await SimpleSession.update(session.id, { state: 'CONFIRMING_ORDER' });
        }
      } else if (message.includes(',') || /^\d+$/.test(message.trim())) {
        // Commande de produits - avec gestion spéciale pizza
        await handleOrderCommand(phoneNumber, session, message);
      } else {
        await whatsapp.sendMessage(phoneNumber, 
          '💡 Pour commander: tapez les numéros (ex: 1,2,2)\n🔙 Tapez "0" pour les catégories\n🛒 Tapez "00" pour voir votre commande');
      }
      break;

    case 'CONFIRMING_ORDER':
      await handleOrderConfirmation(phoneNumber, session, message);
      break;

    case 'CONFIGURING_PRODUCT':
      await handleOptionSelection(phoneNumber, session, message);
      break;

    case 'CONFIRMING_CONFIGURATION':
      await handleConfigurationConfirmation(phoneNumber, session, message);
      break;

    // ========================================
    // NOUVEAUX ÉTATS - SYSTÈME D'ADRESSES
    // ========================================
    
    case 'CHOOSING_DELIVERY_ADDRESS':
      await handleDeliveryAddressChoice(phoneNumber, session, message);
      break;

    case 'REQUESTING_NEW_ADDRESS':
      await handleNewAddressInput(phoneNumber, session, message);
      break;

    case 'VALIDATING_ADDRESS':
      await handleAddressValidation(phoneNumber, session, message);
      break;

    case 'CONFIRMING_ADDRESS':
      await handleAddressConfirmation(phoneNumber, session, message);
      break;

    case 'REQUESTING_ADDRESS_LABEL':
      await handleAddressLabelInput(phoneNumber, session, message);
      break;

    // 🆕 NOUVEAU ÉTAT - GESTION SUPPLÉMENTS PIZZA
    case 'SELECTING_PIZZA_SUPPLEMENTS':
      await handlePizzaSupplementSelection(phoneNumber, session, message);
      break;

    // 🆕 NOUVEAU ÉTAT - SÉLECTION 2ÈME PIZZA GRATUITE
    case 'SELECTING_SECOND_FREE_PIZZA':
      await handleSecondFreePizzaSelection(phoneNumber, session, message);
      break;

    // 🆕 NOUVEAU ÉTAT - SÉLECTION PIZZA DANS MENU INTERACTIF
    case 'SELECTING_MENU_PIZZA':
      await handleMenuPizzaSelection(phoneNumber, session, message);
      break;

    default:
      console.error('❌ État de session non reconnu!');
      console.error('📊 État actuel:', session.state);
      console.error('📊 Message reçu:', message);
      console.error('📊 Message normalisé:', normalizedMessage);
      console.error('📊 Contexte session:', JSON.stringify(session.context, null, 2));
      
      await whatsapp.sendMessage(phoneNumber, 
        '❓ État de session non reconnu. Tapez le numéro du restaurant pour recommencer.');
  }
}

// Fonction pour afficher le menu après choix du mode de livraison
async function showMenuAfterDeliveryModeChoice(phoneNumber: string, restaurant: any, deliveryMode: string) {
  // Chargement dynamique des catégories depuis la BDD
  const { data: categories, error: catError } = await supabase
    .from('france_menu_categories')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('is_active', true)
    .order('display_order');

  if (catError || !categories || categories.length === 0) {
    console.error('❌ Erreur catégories:', catError);
    await whatsapp.sendMessage(phoneNumber, `❌ Menu temporairement indisponible pour ${restaurant.name}.

💡 Contactez le restaurant directement ou réessayez plus tard.`);
    return;
  }

  // Construction dynamique du menu
  let menuText = `🍽️ *MENU ${restaurant.name.toUpperCase()}*\n`;
  
  // Afficher le mode choisi
  const modeEmoji = deliveryMode === 'sur_place' ? '📍' : deliveryMode === 'a_emporter' ? '📦' : '🚚';
  const modeText = deliveryMode === 'sur_place' ? 'Sur place' : deliveryMode === 'a_emporter' ? 'À emporter' : 'Livraison';
  menuText += `${modeEmoji} *Mode: ${modeText}*\n\n`;
  
  const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  
  categories.forEach((category, index) => {
    const displayNumber = index < 9 ? numberEmojis[index] : index === 9 ? `🔟` : `${index + 1}`;
    menuText += `${displayNumber} ${category.icon || '🍽️'} ${category.name}\n`;
  });
  
  menuText += '\nTapez le numéro de votre choix pour voir les produits.';

  await whatsapp.sendMessage(phoneNumber, menuText);
  
  // Mettre à jour la session vers VIEWING_MENU avec le mode de livraison
  const session = await SimpleSession.get(phoneNumber);
  if (session) {
    console.log('📦 [showMenuAfterDeliveryModeChoice] Panier avant mise à jour:', session.context.cart ? Object.keys(session.context.cart).length + ' items' : 'vide');
    console.log('📦 [showMenuAfterDeliveryModeChoice] Total avant mise à jour:', session.context.totalPrice);
    console.log('📦 [showMenuAfterDeliveryModeChoice] État session avant:', session.state);
    
    const updatedContext = {
      ...session.context,
      categories: categories,
      deliveryMode: deliveryMode,
      cart: session.context.cart || {},  // Préserver explicitement le panier
      totalPrice: session.context.totalPrice || 0  // Préserver le total
    };
    
    console.log('📦 [showMenuAfterDeliveryModeChoice] Context mis à jour:', {
      cart: Object.keys(updatedContext.cart).length + ' items',
      totalPrice: updatedContext.totalPrice,
      deliveryMode: updatedContext.deliveryMode
    });
    
    await SimpleSession.update(session.id, {
      state: 'VIEWING_MENU',
      context: preserveTotalPriceContext(session.context, updatedContext)
    });
    
    // Vérifier immédiatement après la mise à jour
    const verifySession = await SimpleSession.get(phoneNumber);
    console.log('✅ [showMenuAfterDeliveryModeChoice] Vérification après maj:', {
      state: verifySession?.state,
      cart: verifySession?.context?.cart ? Object.keys(verifySession.context.cart).length + ' items' : 'vide',
      totalPrice: verifySession?.context?.totalPrice
    });
  } else {
    console.error('❌ [showMenuAfterDeliveryModeChoice] Aucune session trouvée pour:', phoneNumber);
  }
}

// Fonction pour construire le message de confirmation de commande
async function buildOrderConfirmationMessage(session: any, orderNumber: string | null): Promise<string> {
  let confirmationMessage = `✅ **Votre commande est confirmée !**

🍕 **${session.context.selectedRestaurantName}**`;

  if (orderNumber) {
    confirmationMessage += ` • 🎫 **#${orderNumber}**`;
  }
  
  confirmationMessage += `\n\n📋 **Votre commande:**\n`;
  
  // Détailler chaque item du panier
  const currentCart = session.context.cart || {};
  Object.values(currentCart).forEach((cartItem: any) => {
    const sizeName = cartItem.item.size_name ? ` ${cartItem.item.size_name}` : '';
    confirmationMessage += `🌮 ${cartItem.item.name}${sizeName}\n`;
    
    // Afficher les options sélectionnées
    if (cartItem.item.selected_options) {
      Object.entries(cartItem.item.selected_options).forEach(([group, option]: [string, any]) => {
        if (Array.isArray(option)) {
          // Multi-sélection
          const optionNames = option.map(opt => opt.option_name).join(', ');
          confirmationMessage += `• ${group.charAt(0).toUpperCase() + group.slice(1)}: ${optionNames}\n`;
        } else {
          // Sélection simple
          confirmationMessage += `• ${group.charAt(0).toUpperCase() + group.slice(1)}: ${option.option_name}\n`;
        }
      });
    }
    
    // 🥤 CORRECTION BUG: Afficher la boisson sélectionnée si présente
    if (cartItem.item.selected_drink) {
      confirmationMessage += `🥤 ${cartItem.item.selected_drink.name} ${cartItem.item.selected_drink.variant}\n`;
    }
    
    confirmationMessage += '\n';
  });
  
  // 💰 CORRECTION BUG: Recalculer le total à partir du panier réel (même logique que addItemToCart)
  let finalTotal = 0;
  Object.values(currentCart).forEach((cartItem: any) => {
    const itemPrice = cartItem.item.final_price || cartItem.item.base_price || 0;
    finalTotal += itemPrice * cartItem.quantity;
  });
  console.log('💰 [buildOrderConfirmationMessage] Total recalculé:', finalTotal);
  
  confirmationMessage += `💎 **Total: ${formatPrice(finalTotal, 'EUR')}**`;

  // Afficher les informations selon le mode de livraison
  if (session.context.deliveryMode === 'livraison') {
    // Mode livraison : afficher l'adresse et le code de validation
    if (session.context.selectedDeliveryAddress) {
      const deliveryAddress = session.context.selectedDeliveryAddress;
      confirmationMessage += `\n\n🚚 **Livraison à :**\n📍 ${deliveryAddress.address_label}\n${deliveryAddress.full_address}`;
    }
    
    // Afficher le code de validation si disponible
    if (session.context.savedOrder?.delivery_validation_code) {
      confirmationMessage += `\n\n🔒 **Code validation livraison : ${session.context.savedOrder.delivery_validation_code}**`;
      confirmationMessage += `\n📱 *Communiquez ce code au livreur à la réception*`;
    }
    
    confirmationMessage += `\n\n⏱️ **Temps estimé : 30-45 minutes**`;
    
  } else if (session.context.deliveryMode === 'a_emporter') {
    // Mode à emporter
    confirmationMessage += `\n\n📦 **Mode : À emporter**`;
    confirmationMessage += `\n\n⏱️ **Récupération dans : 20-30 minutes**`;
    confirmationMessage += `\n📱 *Donnez ce numéro : #${orderNumber}*`;
    
  } else if (session.context.deliveryMode === 'sur_place') {
    // Mode sur place
    confirmationMessage += `\n\n📍 **Mode : Sur place**`;
    confirmationMessage += `\n\n🪑 **Présentez-vous au restaurant**`;
    confirmationMessage += `\n📱 *Montrez ce numéro : #${orderNumber}*`;
    confirmationMessage += `\n⏱️ **Temps de préparation : 15-20 minutes**`;
  }

  confirmationMessage += `\n\n🔔 **Restaurant notifié automatiquement**`;

  // Vérifier si on a déjà les infos restaurant dans la session
  const restaurantPhone = session.context.selectedRestaurant?.whatsapp_number || 
                          session.context.selectedRestaurant?.phone;
                          
  if (restaurantPhone) {
    confirmationMessage += `\n📞 **Contact: ${restaurantPhone}**`;
  } else {
    // Si pas d'info téléphone dans la session, faire une requête
    try {
      const restaurant = await supabase
        .from('france_restaurants')
        .select('phone, whatsapp_number')
        .eq('id', session.context.selectedRestaurantId)
        .single();
      
      const phone = restaurant.data?.whatsapp_number || restaurant.data?.phone;
      if (phone) {
        confirmationMessage += `\n📞 **Contact: ${phone}**`;
      }
    } catch (error) {
      console.error('Erreur récupération téléphone restaurant:', error);
    }
  }
  
  confirmationMessage += `\n\nMerci pour votre confiance ! 🚀✨`;
  
  return confirmationMessage;
}

// Fonction simple pour générer un code de validation à 4 chiffres
function generateDeliveryCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Fonction pour sauvegarder la commande en base de données
async function saveOrderToDatabase(phoneNumber: string, session: any): Promise<string | null> {
  try {
    console.log('💾 [SaveOrder] DÉBUT - Sauvegarde en base');
    console.log('🛒 [SaveOrder] DÉBUT - Panier cartItems:', JSON.stringify(session.context?.cartItems || []));
    console.log('💰 [SaveOrder] DÉBUT - Total cartTotal:', session.context?.cartTotal);
    console.log('🏪 [SaveOrder] DÉBUT - Restaurant ID:', session.context?.selectedRestaurantId);
    console.log('📋 [SaveOrder] DÉBUT - Context complet:', JSON.stringify(session.context, null, 2));
    
    // Générer le numéro de commande au format DDMM-XXXX
    const today = new Date();
    const dayMonth = today.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }).replace('/', '');
    
    // Compter les commandes du jour pour ce restaurant
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const { count } = await supabase
      .from('france_orders')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', session.context.selectedRestaurantId)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString());
    
    const orderNumber = `${dayMonth}-${String((count || 0) + 1).padStart(4, '0')}`;
    
    // 🔍 LOGS DIAGNOSTICS: Analyser le total avant sauvegarde
    console.log('🔍 [saveOrderToDatabase] TRACE - session.id:', session.id);
    console.log('🔍 [saveOrderToDatabase] TRACE - phoneNumber:', phoneNumber);
    console.log('💰 [saveOrderToDatabase] session.context.totalPrice:', session.context.totalPrice);
    console.log('💰 [saveOrderToDatabase] Type totalPrice:', typeof session.context.totalPrice);
    console.log('💰 [saveOrderToDatabase] session.context.cart:', JSON.stringify(session.context.cart, null, 2));
    
    // Recalculer pour comparaison avec la logique de buildOrderConfirmationMessage
    let calculatedTotal = 0;
    if (session.context.cart) {
      Object.values(session.context.cart).forEach((cartItem: any) => {
        const itemPrice = cartItem.item.final_price || cartItem.item.base_price || 0;
        calculatedTotal += itemPrice * cartItem.quantity;
      });
    }
    console.log('💰 [saveOrderToDatabase] Total recalculé sur place:', calculatedTotal);

    // Préparer les données de la commande
    const orderData: any = {
      restaurant_id: session.context.selectedRestaurantId,
      phone_number: phoneNumber.replace('@c.us', ''),
      items: session.context.cart || {},
      total_amount: calculatedTotal, // 💰 CORRECTION: Utiliser le total recalculé au lieu de session.context.totalPrice
      delivery_mode: session.context.deliveryMode || null, // CHAMP MANQUANT AJOUTÉ !
      status: 'en_attente',
      order_number: orderNumber
      // 🕒 CORRECTION TIMEZONE: Laisser PostgreSQL utiliser DEFAULT NOW() avec timezone Europe/Paris
      // Suppression de: created_at: new Date().toISOString() qui forçait UTC
      // Suppression de: updated_at: new Date().toISOString() qui forçait UTC
    };

    // Ajouter les informations d'adresse de livraison si applicable
    if (session.context.deliveryMode === 'livraison' && session.context.selectedDeliveryAddress) {
      const deliveryAddress = session.context.selectedDeliveryAddress;
      orderData.delivery_address_id = deliveryAddress.id || null;
      orderData.delivery_address = deliveryAddress.full_address;
      console.log('📍 [SaveOrder] Adresse de livraison incluse:', deliveryAddress.full_address);
    }
    
    // Générer le code de validation UNIQUEMENT pour les livraisons
    if (session.context.deliveryMode === 'livraison') {
      const deliveryCode = generateDeliveryCode();
      orderData.delivery_validation_code = deliveryCode;
      console.log('🔒 [SaveOrder] Code de validation généré:', deliveryCode);
    }
    
    console.log('💾 Sauvegarde commande:', JSON.stringify(orderData, null, 2));
    
    // Insérer la commande en base
    const { data: order, error } = await supabase
      .from('france_orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur sauvegarde commande:', error);
      return null;
    }
    
    console.log('✅ Commande sauvegardée avec succès:', order.id);
    
    // Stocker l'ordre sauvegardé dans la session pour utilisation dans le message
    session.context.savedOrder = order;
    
    return orderNumber;
    
  } catch (error) {
    console.error('❌ Exception lors de la sauvegarde:', error);
    return null;
  }
}

// Fonction pour confirmer ou refuser la commande
async function handleOrderConfirmation(phoneNumber: string, session: any, response: string) {
  console.log('✅ Confirmation commande:', response);
  console.log('💰 TotalPrice dans session:', session.context.totalPrice);
  console.log('🛒 [OrderConfirmation] RÉCEPTION - Panier cartItems:', JSON.stringify(session.context?.cartItems || []));
  console.log('💰 [OrderConfirmation] RÉCEPTION - Total cartTotal:', session.context?.cartTotal);
  console.log('🏪 [OrderConfirmation] RÉCEPTION - Restaurant ID:', session.context?.selectedRestaurantId);
  console.log('🔍 Context complet session:', JSON.stringify(session.context, null, 2));
  const normalizedResponse = response.toLowerCase().trim();
  
  if (normalizedResponse === '1' || normalizedResponse === '00' || normalizedResponse === '99') {
    // Sauvegarder la commande en base de données
    const orderNumber = await saveOrderToDatabase(phoneNumber, session);
    
    // Construire le message de confirmation
    const confirmationMessage = await buildOrderConfirmationMessage(session, orderNumber);
    
    await whatsapp.sendMessage(phoneNumber, confirmationMessage);
    
    // Nettoyer la session
    await SimpleSession.deleteAllForPhone(phoneNumber);
    
  } else if (normalizedResponse === '2' || normalizedResponse === '000') {
    // Continuer les achats - préserver le panier
    const restaurant = await supabase
      .from('france_restaurants')
      .select('*')
      .eq('id', session.context.selectedRestaurantId)
      .single();
    
    if (restaurant.data && session.context.deliveryMode) {
      // Retour au menu avec panier préservé
      await showMenuAfterDeliveryModeChoice(phoneNumber, restaurant.data, session.context.deliveryMode);
    } else {
      // Fallback si pas de mode défini
      await handleDirectRestaurantAccess(phoneNumber, restaurant.data);
    }
  } else if (normalizedResponse === '3' || normalizedResponse === '0000') {
    // Vider le panier
    await SimpleSession.update(session.id, {
      state: 'VIEWING_MENU',
      context: preserveTotalPriceContext(session.context, {
        cart: {},
        totalPrice: 0
      })
    });
    
    const restaurant = await supabase
      .from('france_restaurants')
      .select('*')
      .eq('id', session.context.selectedRestaurantId)
      .single();
    
    if (restaurant.data) {
      await handleDirectRestaurantAccess(phoneNumber, restaurant.data);
    }
  } else {
    await whatsapp.sendMessage(phoneNumber, 
      '❓ Tapez votre choix : 1 (Finaliser), 2 (Continuer) ou 3 (Recommencer)');
  }
}

// Handler principal
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    
    // Vérifier que c'est un message entrant
    if (body.typeWebhook === 'incomingMessageReceived') {
      const phoneNumber = body.senderData?.sender;
      const message = body.messageData?.textMessageData?.textMessage;
      
      if (phoneNumber && message) {
        await handleIncomingMessage(phoneNumber, message);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur handler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ========================================
// NOUVELLES FONCTIONS - SYSTÈME D'ADRESSES
// ========================================

/**
 * Point d'entrée pour finaliser une commande
 * Vérifie si une adresse est nécessaire (mode livraison) ou passe directement à la confirmation
 */
async function handleOrderFinalization(phoneNumber: string, session: any) {
  try {
    console.log('🎯 [OrderFinalization] Vérification mode livraison:', session.context.deliveryMode);
    
    // Si c'est une livraison, demander l'adresse
    if (session.context.deliveryMode === 'livraison') {
      console.log('🚚 [OrderFinalization] Mode livraison détecté - demande d\'adresse');
      await initiateDeliveryAddressProcess(phoneNumber, session);
    } else {
      // Pour sur_place et a_emporter, passer directement à la confirmation
      console.log('📍 [OrderFinalization] Mode sur place/à emporter - confirmation directe');
      await handleOrderConfirmation(phoneNumber, session, '99');
    }
  } catch (error) {
    console.error('❌ [OrderFinalization] Erreur:', error);
    await whatsapp.sendMessage(phoneNumber, 'Erreur lors de la finalisation. Veuillez réessayer.');
  }
}

/**
 * Initier le processus de sélection d'adresse de livraison
 */
async function initiateDeliveryAddressProcess(phoneNumber: string, session: any) {
  try {
    console.log('🏠 [DeliveryAddress] Début processus sélection adresse');
    
    // Récupérer les adresses existantes du client
    const addressSelection = await addressManager.buildAddressSelectionMessage(phoneNumber);
    
    if (addressSelection.hasAddresses) {
      // Le client a des adresses existantes - afficher le menu de sélection
      console.log(`📋 [DeliveryAddress] ${addressSelection.addresses.length} adresses trouvées`);
      
      await SimpleSession.update(session.id, {
        state: 'CHOOSING_DELIVERY_ADDRESS',
        context: preserveTotalPriceContext(session.context, {
          addresses: addressSelection.addresses
        })
      });
      
      await whatsapp.sendMessage(phoneNumber, addressSelection.message);
    } else {
      // Première livraison - demander directement la nouvelle adresse
      console.log('🆕 [DeliveryAddress] Première livraison - demande nouvelle adresse');
      
      await SimpleSession.update(session.id, {
        state: 'REQUESTING_NEW_ADDRESS'
      });
      
      await whatsapp.sendMessage(phoneNumber, addressSelection.message);
    }
  } catch (error) {
    console.error('❌ [DeliveryAddress] Erreur initiation processus:', error);
    await whatsapp.sendMessage(phoneNumber, 'Erreur lors de la demande d\'adresse. Veuillez réessayer.');
  }
}

/**
 * Gérer le choix d'adresse de livraison parmi les adresses existantes
 */
async function handleDeliveryAddressChoice(phoneNumber: string, session: any, message: string) {
  try {
    const normalizedMessage = message.toLowerCase().trim();
    console.log(`🏠 [AddressChoice] Choix: "${normalizedMessage}"`);
    
    if (normalizedMessage === 'annuler') {
      await handleDirectRestaurantAccess(phoneNumber, session.context.selectedRestaurantData);
      return;
    }
    
    // Vérifier si c'est un numéro valide
    const choice = parseInt(normalizedMessage);
    const addresses = session.context.addresses || [];
    const isExactNumber = normalizedMessage === choice.toString();
    
    if (isNaN(choice) || choice < 1 || !isExactNumber) {
      await whatsapp.sendMessage(phoneNumber, getSuggestionMessage(message, 'address_selection'));
      return;
    }
    
    // Si c'est le dernier numéro, c'est "Nouvelle adresse"
    if (choice === addresses.length + 1) {
      console.log('➕ [AddressChoice] Nouvelle adresse demandée');
      
      await SimpleSession.update(session.id, {
        state: 'REQUESTING_NEW_ADDRESS'
      });
      
      await whatsapp.sendMessage(phoneNumber, '📍 **Nouvelle adresse de livraison**\n\nVeuillez saisir votre adresse complète:\n\n*Exemple: 15 rue de la Paix, Paris*');
      return;
    }
    
    // Vérifier si le choix est dans la plage valide
    if (choice > addresses.length) {
      await whatsapp.sendMessage(phoneNumber, getSuggestionMessage(message, 'address_selection'));
      return;
    }
    
    // Adresse sélectionnée
    const selectedAddress = addresses[choice - 1];
    console.log(`✅ [AddressChoice] Adresse sélectionnée: ${selectedAddress.address_label}`);
    
    // Sauvegarder l'adresse dans la session et procéder à la confirmation de commande
    const updatedSession = await SimpleSession.update(session.id, {
      state: 'CONFIRMING_ORDER',
      context: preserveTotalPriceContext(session.context, {
        selectedDeliveryAddress: selectedAddress
      })
    });
    
    await handleOrderConfirmation(phoneNumber, updatedSession || session, '99');
    
  } catch (error) {
    console.error('❌ [AddressChoice] Erreur:', error);
    await whatsapp.sendMessage(phoneNumber, 'Erreur lors de la sélection d\'adresse. Veuillez réessayer.');
  }
}

/**
 * Gérer la saisie d'une nouvelle adresse
 */
async function handleNewAddressInput(phoneNumber: string, session: any, message: string) {
  try {
    const address = message.trim();
    console.log(`📝 [NewAddress] Saisie adresse: "${address}"`);
    
    if (!address || address.toLowerCase() === 'annuler') {
      await initiateDeliveryAddressProcess(phoneNumber, session);
      return;
    }
    
    if (address.length < 10) {
      await whatsapp.sendMessage(phoneNumber, '⚠️ **Adresse trop courte**\n\nVeuillez saisir une adresse complète avec le nom de la rue et la ville.\n\n*Exemple: 15 rue de la Paix, Paris*');
      return;
    }
    
    // Valider l'adresse avec Google Places API directement
    await SimpleSession.update(session.id, {
      state: 'VALIDATING_ADDRESS',
      context: preserveTotalPriceContext(session.context, {
        pendingAddressInput: address
      })
    });
    
    // Déclencher la validation
    await validateAddressWithGoogle(phoneNumber, session, address);
    
  } catch (error) {
    console.error('❌ [NewAddress] Erreur:', error);
    await whatsapp.sendMessage(phoneNumber, 'Erreur lors de la saisie d\'adresse. Veuillez réessayer.');
  }
}

/**
 * Valider une adresse avec Google Places API
 */
async function validateAddressWithGoogle(phoneNumber: string, session: any, address: string) {
  try {
    console.log(`🔍 [AddressValidation] Validation Google: "${address}"`);
    
    if (!googlePlaces.isConfigured()) {
      console.warn('⚠️ [AddressValidation] Google Places API non configurée - mode dégradé');
      // Mode dégradé : accepter l'adresse sans validation
      await handleAddressValidated(phoneNumber, session, {
        formatted_address: address,
        place_id: '',
        geometry: { location: { lat: 0, lng: 0 } }
      });
      return;
    }
    
    const validation = await googlePlaces.validateAddress(address);
    
    if (validation.isValid && validation.selectedAddress) {
      // Adresse trouvée - proposer la suggestion
      const suggestion = validation.selectedAddress;
      console.log(`✅ [AddressValidation] Adresse validée: ${suggestion.formatted_address}`);
      
      await SimpleSession.update(session.id, {
        state: 'CONFIRMING_ADDRESS',
        context: preserveTotalPriceContext(session.context, {
          addressSuggestion: suggestion,
          addressSuggestions: validation.suggestions
        })
      });
      
      const confirmMessage = `🎯 **Adresse trouvée !**\n\n📍 ${googlePlaces.formatAddressForWhatsApp(suggestion)}\n\n**1** ✅ Oui, livrer ici\n**2** 🔄 Corriger l'adresse\n\n*Tapez 1 ou 2*`;
      
      await whatsapp.sendMessage(phoneNumber, confirmMessage);
    } else {
      // Aucune adresse trouvée
      console.log('❌ [AddressValidation] Aucune adresse trouvée');
      
      await SimpleSession.update(session.id, {
        state: 'REQUESTING_NEW_ADDRESS'
      });
      
      await whatsapp.sendMessage(phoneNumber, `❌ **Adresse non trouvée**\n\nNous n'avons pas pu localiser "${address}".\n\nVeuillez vérifier l'orthographe et saisir une adresse plus précise:\n\n*Exemple: 15 rue de la Paix, 75001 Paris*`);
    }
  } catch (error) {
    console.error('❌ [AddressValidation] Erreur validation Google:', error);
    
    // Mode dégradé en cas d'erreur API
    await handleAddressValidated(phoneNumber, session, {
      formatted_address: address,
      place_id: '',
      geometry: { location: { lat: 0, lng: 0 } }
    });
  }
}

/**
 * Gérer la validation d'adresse
 */
async function handleAddressValidation(phoneNumber: string, session: any, message: string) {
  // Cet état n'attend pas de message utilisateur - la validation se fait automatiquement
  // Si on arrive ici, rediriger vers la demande d'adresse
  await handleNewAddressInput(phoneNumber, session, session.context.pendingAddressInput || '');
}

/**
 * Gérer la confirmation d'adresse suggérée par Google
 */
async function handleAddressConfirmation(phoneNumber: string, session: any, message: string) {
  try {
    const normalizedMessage = message.toLowerCase().trim();
    console.log(`✅ [AddressConfirmation] Choix: "${normalizedMessage}"`);
    
    if (normalizedMessage === 'annuler') {
      await initiateDeliveryAddressProcess(phoneNumber, session);
      return;
    }
    
    const choice = parseInt(normalizedMessage);
    
    if (choice === 1) {
      // Confirmer l'adresse suggérée
      const suggestion = session.context.addressSuggestion;
      console.log('✅ [AddressConfirmation] Adresse confirmée');
      
      await handleAddressValidated(phoneNumber, session, suggestion);
    } else if (choice === 2) {
      // Modifier l'adresse
      console.log('🔄 [AddressConfirmation] Modification demandée');
      
      await SimpleSession.update(session.id, {
        state: 'REQUESTING_NEW_ADDRESS'
      });
      
      await whatsapp.sendMessage(phoneNumber, '📝 **Saisir une nouvelle adresse**\n\nVeuillez saisir votre adresse de livraison:\n\n*Exemple: 25 boulevard Saint-Germain, Paris*');
    } else {
      await whatsapp.sendMessage(phoneNumber, getSuggestionMessage(message, 'address_confirmation'));
    }
  } catch (error) {
    console.error('❌ [AddressConfirmation] Erreur:', error);
    await whatsapp.sendMessage(phoneNumber, 'Erreur lors de la confirmation d\'adresse. Veuillez réessayer.');
  }
}

/**
 * Adresse validée - sauvegarder directement et procéder à l'enregistrement commande
 */
async function handleAddressValidated(phoneNumber: string, session: any, validatedAddress: GooglePlaceResult) {
  try {
    console.log('💾 [AddressValidated] Sauvegarde directe et finalisation commande');
    console.log('🛒 [AddressValidated] AVANT sauvegarde - Panier session:', JSON.stringify(session.context?.cartItems || []));
    console.log('💰 [AddressValidated] AVANT sauvegarde - Total session:', session.context?.cartTotal);
    console.log('🏪 [AddressValidated] AVANT sauvegarde - Restaurant ID:', session.context?.selectedRestaurantId);
    console.log('📋 [AddressValidated] AVANT sauvegarde - Context complet:', JSON.stringify(session.context, null, 2));
    
    // Générer un label automatique basé sur l'adresse
    const addressParts = validatedAddress.formatted_address.split(',');
    const autoLabel = `Adresse ${addressParts[0]?.trim() || 'Livraison'}`;
    
    // Sauvegarder l'adresse en base avec le label automatique (SANS message)
    console.log('💾 [AddressValidated] Sauvegarde en base...');
    const savedAddress = await addressManager.saveCustomerAddress(
      phoneNumber,
      validatedAddress,
      autoLabel
    );
    
    if (savedAddress) {
      console.log(`✅ [AddressValidated] Adresse sauvegardée avec ID: ${savedAddress.id}`);
      
      // Mettre à jour la session avec l'adresse sauvegardée et procéder à la confirmation de commande
      const updatedSession = await SimpleSession.update(session.id, {
        state: 'CONFIRMING_ORDER',
        context: {
          ...session.context,
          selectedDeliveryAddress: savedAddress
        }
      });
      console.log('🛒 [AddressValidated] APRÈS update session - Panier:', JSON.stringify(updatedSession?.context?.cartItems || []));
      console.log('💰 [AddressValidated] APRÈS update session - Total:', updatedSession?.context?.cartTotal);
      
      // PAS de message intermédiaire - on passe directement à la confirmation
    } else {
      console.error('❌ [AddressValidated] Erreur sauvegarde adresse');
      
      // Procéder quand même à la confirmation avec l'adresse non sauvegardée
      const updatedSession = await SimpleSession.update(session.id, {
        state: 'CONFIRMING_ORDER',
        context: preserveTotalPriceContext(session.context, {
          selectedDeliveryAddress: {
            id: null,
            full_address: validatedAddress.formatted_address,
            latitude: validatedAddress.geometry?.location?.lat || null,
            longitude: validatedAddress.geometry?.location?.lng || null,
            google_place_id: validatedAddress.place_id || null,
            address_label: autoLabel
          }
        })
      });
      console.log('🛒 [AddressValidated] APRÈS update session (non sauvegardée) - Panier:', JSON.stringify(updatedSession?.context?.cartItems || []));
      console.log('💰 [AddressValidated] APRÈS update session (non sauvegardée) - Total:', updatedSession?.context?.cartTotal);
      
    }
    
    // Récupérer la session mise à jour pour avoir l'adresse sauvegardée
    const refreshedSession = await SimpleSession.get(phoneNumber);
    if (!refreshedSession) {
      console.error('❌ [AddressValidated] Impossible de récupérer la session mise à jour');
      return;
    }
    
    // Procéder directement à la confirmation/enregistrement de commande avec la session mise à jour
    console.log('🚀 [AddressValidated] Appel handleOrderConfirmation avec session mise à jour...');
    console.log('🛒 [AddressValidated] Session pour handleOrderConfirmation - Panier:', JSON.stringify(refreshedSession.context?.cartItems || []));
    console.log('💰 [AddressValidated] Session pour handleOrderConfirmation - Total:', refreshedSession.context?.cartTotal);
    console.log('📍 [AddressValidated] Adresse avec ID dans session:', refreshedSession.context?.selectedDeliveryAddress?.id);
    await handleOrderConfirmation(phoneNumber, refreshedSession, '99');
  } catch (error) {
    console.error('❌ [AddressValidated] Erreur:', error);
    await whatsapp.sendMessage(phoneNumber, 'Erreur lors de la validation d\'adresse. Veuillez réessayer.');
  }
}

/**
 * Gérer la saisie du label de l'adresse
 */
async function handleAddressLabelInput(phoneNumber: string, session: any, message: string) {
  try {
    const label = message.trim();
    console.log(`🏷️ [AddressLabel] Label saisi: "${label}"`);
    
    if (!label || label.toLowerCase() === 'annuler') {
      await initiateDeliveryAddressProcess(phoneNumber, session);
      return;
    }
    
    if (label.length < 2 || label.length > 50) {
      await whatsapp.sendMessage(phoneNumber, '⚠️ **Nom invalide**\n\nLe nom doit contenir entre 2 et 50 caractères.\n\n*Exemples: Maison, Bureau, Chez Paul*\n\nTapez le nom pour cette adresse:');
      return;
    }
    
    // Sauvegarder l'adresse en base
    const validatedAddress = session.context.validatedAddress;
    console.log('💾 [AddressLabel] Sauvegarde en base...');
    
    const savedAddress = await addressManager.saveCustomerAddress(
      phoneNumber,
      validatedAddress,
      label
    );
    
    if (savedAddress) {
      console.log(`✅ [AddressLabel] Adresse sauvegardée avec ID: ${savedAddress.id}`);
      
      // Mettre à jour la session avec l'adresse sauvegardée et procéder à la confirmation de commande
      await SimpleSession.update(session.id, {
        state: 'CONFIRMING_ORDER',
        context: preserveTotalPriceContext(session.context, {
          selectedDeliveryAddress: savedAddress
        })
      });
      
      await whatsapp.sendMessage(phoneNumber, `💾 **Adresse "${label}" sauvegardée !**\n\n🚀 Finalisation de votre commande...`);
      
      // Procéder à la confirmation de commande
      await handleOrderConfirmation(phoneNumber, session, '99');
    } else {
      console.error('❌ [AddressLabel] Erreur sauvegarde adresse');
      await whatsapp.sendMessage(phoneNumber, 'Erreur lors de la sauvegarde. Votre commande sera finalisée avec l\'adresse saisie.');
      
      // Procéder quand même à la confirmation avec l'adresse non sauvegardée
      await SimpleSession.update(session.id, {
        state: 'CONFIRMING_ORDER',
        context: preserveTotalPriceContext(session.context, {
          selectedDeliveryAddress: {
            id: null,
            full_address: validatedAddress.formatted_address,
            address_label: label
          }
        })
      });
      
      await handleOrderConfirmation(phoneNumber, session, '99');
    }
  } catch (error) {
    console.error('❌ [AddressLabel] Erreur:', error);
    await whatsapp.sendMessage(phoneNumber, 'Erreur lors de la saisie du nom. Veuillez réessayer.');
  }
}

/**
 * 🍽 NOUVEAU : Démarrer la configuration d'un menu interactif
 */
async function startMenuConfiguration(phoneNumber: string, session: any, menuItem: any) {
  console.log('🍽 [MENU CONFIG] ==== DÉMARRAGE CONFIGURATION MENU ====');
  console.log('🍽 [MENU CONFIG] Menu:', menuItem.name);
  console.log('🍽 [MENU CONFIG] PhoneNumber:', phoneNumber);
  console.log('🍽 [MENU CONFIG] Session ID:', session.id);
  console.log('🍽 [MENU CONFIG] Session state actuel:', session.state);
  
  // Déterminer le type de menu et son workflow
  let menuType = '';
  let totalSteps = 0;
  
  if (menuItem.name.includes('📋 MENU 1')) {
    menuType = 'MENU_1';
    totalSteps = 1; // 3 pizzas JUNIOR
    console.log('🍽 [MENU CONFIG] Type détecté: MENU_1 (3 pizzas JUNIOR)');
  } else if (menuItem.name.includes('📋 MENU 2')) {
    menuType = 'MENU_2'; 
    totalSteps = 2; // 2 pizzas SÉNIOR + 1 boisson 1.5L
    console.log('🍽 [MENU CONFIG] Type détecté: MENU_2 (2 pizzas SÉNIOR + boisson)');
  } else if (menuItem.name.includes('📋 MENU 3')) {
    menuType = 'MENU_3';
    totalSteps = 3; // 1 pizza MEGA + nuggets/wings + 1 boisson 1.5L
    console.log('🍽 [MENU CONFIG] Type détecté: MENU_3 (1 pizza MEGA + accompagnement + boisson)');
  } else if (menuItem.name.includes('📋 MENU 4')) {
    menuType = 'MENU_4';
    totalSteps = 3; // 1 pizza SÉNIOR + nuggets/wings + 2 boissons 33CL
    console.log('🍽 [MENU CONFIG] Type détecté: MENU_4 (1 pizza SÉNIOR + accompagnement + 2 boissons)');
  } else {
    console.error('🍽 [MENU CONFIG] Type de menu non reconnu:', menuItem.name);
  }
  
  // Mettre à jour la session avec le state CONFIGURING_MENU
  console.log('🍽 [MENU CONFIG] Mise à jour session vers CONFIGURING_MENU...');
  await SimpleSession.update(session.id, {
    state: 'CONFIGURING_MENU',
    context: {
      ...session.context,
      menuBeingConfigured: {
        originalItem: menuItem,
        menuType: menuType,
        currentStep: 1,
        totalSteps: totalSteps,
        selectedComponents: {}
      }
    }
  });
  console.log('🍽 [MENU CONFIG] Session mise à jour - State: CONFIGURING_MENU');
  
  // Démarrer la première étape selon le type de menu
  console.log('🍽 [MENU CONFIG] Démarrage étape 1 pour:', menuType);
  await executeMenuStep(phoneNumber, menuType, 1);
  console.log('🍽 [MENU CONFIG] ==== CONFIGURATION DÉMARRÉE ====');
}

/**
 * 🍽 NOUVEAU : Exécuter une étape spécifique d'un menu
 */
async function executeMenuStep(phoneNumber: string, menuType: string, step: number) {
  console.log(`🍽 [MENU STEP] Exécution ${menuType} - Étape ${step}`);
  
  switch (menuType) {
    case 'MENU_1':
      await executeMenu1Step(phoneNumber, step);
      break;
    case 'MENU_2':
      await executeMenu2Step(phoneNumber, step);
      break;
    case 'MENU_3':
      await executeMenu3Step(phoneNumber, step);
      break;
    case 'MENU_4':
      await executeMenu4Step(phoneNumber, step);
      break;
  }
}

/**
 * 🍽 NOUVEAU : MENU 1 - 3 pizzas JUNIOR au choix
 */
async function executeMenu1Step(phoneNumber: string, step: number) {
  console.log(`🍽 [MENU 1] ==== DÉBUT ÉTAPE ${step} ====`);
  console.log(`🍽 [MENU 1] PhoneNumber: ${phoneNumber}`);
  
  if (step === 1) {
    // Étape 1 : Sélectionner 3 pizzas JUNIOR
    const session = await SimpleSession.get(phoneNumber);
    console.log(`🍽 [MENU 1] Session récupérée:`, {
      id: session?.id,
      state: session?.state,
      restaurantId: session?.context?.selectedRestaurantId
    });
    
    const restaurant = { id: session.context.selectedRestaurantId };
    
    console.log(`🍽 [MENU 1] Recherche pizzas JUNIOR pour restaurant:`, restaurant.id);
    
    // Récupérer toutes les pizzas JUNIOR (taille JUNIOR)
    const { data: juniorPizzas, error } = await supabase
      .from('france_product_sizes')
      .select(`
        *,
        france_products!inner (
          id, name, composition, restaurant_id, category_id, is_active
        )
      `)
      .eq('size_name', 'JUNIOR')
      .eq('france_products.restaurant_id', restaurant.id)
      .eq('france_products.is_active', true)
      .order('display_order');
      
    console.log(`🍽 [MENU 1] Requête BDD terminée:`, {
      error: error,
      pizzasCount: juniorPizzas?.length || 0,
      pizzasFound: juniorPizzas?.map(p => p.france_products.name) || []
    });
    
    if (error || !juniorPizzas || juniorPizzas.length === 0) {
      console.error('❌ [MENU 1] Erreur pizzas JUNIOR:', error);
      await whatsapp.sendMessage(phoneNumber, '❌ Aucune pizza JUNIOR disponible.');
      return;
    }
    
    // Construire le message de sélection
    let message = `✅ MENU 1 sélectionné !\n🍽 3 PIZZAS JUNIORS AU CHOIX\n\n`;
    message += `🍕 Étape 1/1 : Choisissez vos 3 PIZZAS JUNIOR\n\n`;
    
    let orderedPizzas: any[] = [];
    
    juniorPizzas.forEach((sizeData, index) => {
      const pizza = sizeData.france_products;
      const itemIndex = index + 1;
      
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `🎯 🍕 ${pizza.name}\n`;
      if (pizza.composition) {
        message += `🧾 ${pizza.composition}\n`;
      }
      
      const isDelivery = session.context.deliveryMode === 'livraison';
      const selectedPrice = isDelivery ? (sizeData.price_delivery || sizeData.price_on_site) : sizeData.price_on_site;
      const formattedPrice = formatPrice(selectedPrice, 'EUR');
      
      message += `💰 ${formattedPrice} - Tapez ${itemIndex}\n\n`;
      
      orderedPizzas.push({
        index: itemIndex,
        sizeData: sizeData,
        pizza: pizza,
        finalPrice: selectedPrice
      });
    });
    
    message += `Tapez vos 3 choix séparés par des virgules\n`;
    message += `Ex: 1,2,3 = ${orderedPizzas[0]?.pizza.name} + ${orderedPizzas[1]?.pizza.name || 'Pizza #2'} + ${orderedPizzas[2]?.pizza.name || 'Pizza #3'}\n\n`;
    message += `❌ Tapez "annuler" pour arrêter`;
    
    console.log(`🍽 [MENU 1] Pizzas préparées pour sélection:`, {
      count: orderedPizzas.length,
      pizzas: orderedPizzas.map(p => ({
        index: p.index,
        name: p.pizza.name,
        price: p.finalPrice
      }))
    });
    
    // Sauvegarder les options disponibles dans la session
    console.log(`🍽 [MENU 1] Mise à jour session avec pizzas disponibles...`);
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          availablePizzas: orderedPizzas
        }
      }
    });
    console.log(`🍽 [MENU 1] Session mise à jour avec ${orderedPizzas.length} pizzas`);
    
    console.log(`🍽 [MENU 1] Envoi du message de sélection (${message.length} caractères)`);
    await whatsapp.sendMessage(phoneNumber, message);
    console.log(`🍽 [MENU 1] Message envoyé avec succès`);
  }
}

/**
 * 🍽 NOUVEAU : Gérer les réponses utilisateur pendant la configuration de menu
 */
async function handleMenuConfigurationResponse(phoneNumber: string, session: any, message: string) {
  const menuConfig = session.context.menuBeingConfigured;
  console.log(`🍽 [MENU CONFIG] Réponse pour ${menuConfig.menuType} - Étape ${menuConfig.currentStep}/${menuConfig.totalSteps}`);
  
  switch (menuConfig.menuType) {
    case 'MENU_1':
      await handleMenu1Response(phoneNumber, session, message);
      break;
    case 'MENU_2':
      await handleMenu2Response(phoneNumber, session, message);
      break;
    case 'MENU_3':
      await handleMenu3Response(phoneNumber, session, message);
      break;
    case 'MENU_4':
      await handleMenu4Response(phoneNumber, session, message);
      break;
  }
}

/**
 * 🍽 NOUVEAU : MENU 1 - Gérer la sélection des 3 pizzas JUNIOR
 */
async function handleMenu1Response(phoneNumber: string, session: any, message: string) {
  console.log('🍽 [MENU 1] ==== TRAITEMENT RÉPONSE ====');
  console.log('🍽 [MENU 1] Message reçu:', message);
  console.log('🍽 [MENU 1] PhoneNumber:', phoneNumber);
  
  const menuConfig = session.context.menuBeingConfigured;
  console.log('🍽 [MENU 1] MenuConfig:', {
    menuType: menuConfig?.menuType,
    currentStep: menuConfig?.currentStep,
    totalSteps: menuConfig?.totalSteps,
    hasAvailablePizzas: !!(menuConfig?.availablePizzas?.length)
  });
  
  const availablePizzas = menuConfig.availablePizzas || [];
  console.log('🍽 [MENU 1] Pizzas disponibles:', availablePizzas.length);
  
  if (menuConfig.currentStep === 1) {
    console.log('🍽 [MENU 1] Étape 1 - Validation sélection pizzas');
    
    // Étape 1 : Vérifier la sélection de 3 pizzas
    const choices = message.split(',').map(choice => parseInt(choice.trim()));
    console.log('🍽 [MENU 1] Choix parsés:', choices);
    
    if (choices.length !== 3) {
      console.log('🍽 [MENU 1] Erreur: Nombre de choix incorrect:', choices.length);
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(message, 'menu_selection') + '\n\n🍕 Vous devez choisir exactement 3 pizzas.\nEx: 1,2,3');
      return;
    }
    
    // Vérifier que tous les choix sont valides
    for (const choice of choices) {
      if (isNaN(choice) || choice < 1 || choice > availablePizzas.length) {
        console.log('🍽 [MENU 1] Erreur: Choix invalide:', choice, '(min: 1, max:', availablePizzas.length, ')');
        await whatsapp.sendMessage(phoneNumber, 
          getSuggestionMessage(message, 'menu_selection') + `\n\n🍕 Choix invalide: ${choice}.\nChoisissez entre 1 et ${availablePizzas.length}.`);
        return;
      }
    }
    
    console.log('🍽 [MENU 1] Tous les choix sont valides, création des pizzas...');
    
    // Créer les pizzas sélectionnées
    const selectedPizzas = choices.map((choice, index) => {
      const pizzaOption = availablePizzas[choice - 1];
      console.log(`🍽 [MENU 1] Pizza ${index + 1}:`, {
        choice: choice,
        pizzaName: pizzaOption.pizza.name,
        size: pizzaOption.sizeData.size_name,
        price: pizzaOption.finalPrice
      });
      
      return {
        id: pizzaOption.pizza.id,
        name: pizzaOption.pizza.name,
        size_id: pizzaOption.sizeData.id,
        size_name: pizzaOption.sizeData.size_name,
        final_price: pizzaOption.finalPrice,
        display_name: `${pizzaOption.pizza.name} ${pizzaOption.sizeData.size_name}`,
        composition: pizzaOption.pizza.composition,
        is_pizza: true
      };
    });
    
    console.log('🍽 [MENU 1] Pizzas créées:', selectedPizzas.length);
    
    // Créer le menu final avec les 3 pizzas
    const finalMenuPrice = 25; // Prix fixe du MENU 1
    const menuFinal = {
      id: menuConfig.originalItem.id,
      name: menuConfig.originalItem.name,
      final_price: finalMenuPrice,
      display_name: `${menuConfig.originalItem.name} PERSONNALISÉ`,
      menu_components: selectedPizzas,
      is_configured_menu: true
    };
    
    console.log('🍽 [MENU 1] Menu final créé:', {
      id: menuFinal.id,
      name: menuFinal.name,
      price: menuFinal.final_price,
      componentsCount: menuFinal.menu_components.length
    });
    
    // Ajouter le menu complet au panier et terminer
    console.log('🍽 [MENU 1] Ajout du menu au panier...');
    await addItemToCart(phoneNumber, session, menuFinal, 1, false);
    console.log('🍽 [MENU 1] Menu ajouté au panier avec succès');
    
    // Retourner à l'état ORDERING
    console.log('🍽 [MENU 1] Retour à l\'état ORDERING et nettoyage session...');
    await SimpleSession.update(session.id, {
      state: 'ORDERING',
      context: {
        ...session.context,
        menuBeingConfigured: null
      }
    });
    console.log('🍽 [MENU 1] ==== MENU 1 TERMINÉ AVEC SUCCÈS ====');
  }
}

/**
 * 🍽 NOUVEAU : MENU 2 - 2 pizzas SÉNIOR + 1 boisson 1.5L
 */
async function executeMenu2Step(phoneNumber: string, step: number) {
  console.log(`🍽 [MENU 2] Étape ${step}`);
  
  const session = await SimpleSession.get(phoneNumber);
  const restaurant = { id: session.context.selectedRestaurantId };
  
  if (step === 1) {
    // Étape 1 : Sélectionner 2 pizzas SÉNIOR
    const { data: seniorPizzas, error } = await supabase
      .from('france_product_sizes')
      .select(`
        *,
        france_products!inner (
          id, name, composition, restaurant_id, category_id, is_active
        )
      `)
      .eq('size_name', 'SENIOR')
      .eq('france_products.restaurant_id', restaurant.id)
      .eq('france_products.is_active', true)
      .order('display_order');
    
    if (error || !seniorPizzas || seniorPizzas.length === 0) {
      console.error('❌ [MENU 2] Erreur pizzas SÉNIOR:', error);
      await whatsapp.sendMessage(phoneNumber, '❌ Aucune pizza SÉNIOR disponible.');
      return;
    }
    
    let message = `✅ MENU 2 sélectionné !\n🍽 2 PIZZAS SÉNIOR AU CHOIX + 1 BOISSON 1.5L\n\n`;
    message += `🍕 Étape 1/2 : Choisissez vos 2 PIZZAS SÉNIOR\n\n`;
    
    let orderedPizzas: any[] = [];
    
    seniorPizzas.forEach((sizeData, index) => {
      const pizza = sizeData.france_products;
      const itemIndex = index + 1;
      
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `🎯 🍕 ${pizza.name}\n`;
      if (pizza.composition) {
        message += `🧾 ${pizza.composition}\n`;
      }
      
      const isDelivery = session.context.deliveryMode === 'livraison';
      const selectedPrice = isDelivery ? (sizeData.price_delivery || sizeData.price_on_site) : sizeData.price_on_site;
      const formattedPrice = formatPrice(selectedPrice, 'EUR');
      
      message += `💰 ${formattedPrice} - Tapez ${itemIndex}\n\n`;
      
      orderedPizzas.push({
        index: itemIndex,
        sizeData: sizeData,
        pizza: pizza,
        finalPrice: selectedPrice
      });
    });
    
    message += `Tapez vos 2 choix séparés par des virgules\n`;
    message += `Ex: 1,2 = ${orderedPizzas[0]?.pizza.name} + ${orderedPizzas[1]?.pizza.name || 'Pizza #2'}\n\n`;
    message += `❌ Tapez "annuler" pour arrêter`;
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          availablePizzas: orderedPizzas
        }
      }
    });
    
    await whatsapp.sendMessage(phoneNumber, message);
    
  } else if (step === 2) {
    // Étape 2 : Sélectionner 1 boisson 1.5L
    const { data: drinks, error } = await supabase
      .from('france_products')
      .select(`
        *,
        france_product_variants!inner (
          id, variant_name, price_on_site, price_delivery, quantity, unit, display_order
        )
      `)
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .eq('france_product_variants.variant_name', '1L5')
      .order('display_order');
    
    if (error || !drinks || drinks.length === 0) {
      console.error('❌ [MENU 2] Erreur boissons 1.5L:', error);
      await whatsapp.sendMessage(phoneNumber, '❌ Aucune boisson 1.5L disponible.');
      return;
    }
    
    let message = `✅ Pizzas sélectionnées !\n\n`;
    message += `🥤 Étape 2/2 : Choisissez votre BOISSON 1.5L\n\n`;
    
    let orderedDrinks: any[] = [];
    
    drinks.forEach((drink, index) => {
      const variant = drink.france_product_variants[0];
      const itemIndex = index + 1;
      
      message += `${itemIndex}️⃣ ${drink.name} ${variant.variant_name}\n`;
      
      orderedDrinks.push({
        index: itemIndex,
        variant: variant,
        drink: drink
      });
    });
    
    message += `\nTapez votre choix (ex: 1)\n`;
    message += `❌ Tapez "annuler" pour arrêter`;
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          availableDrinks: orderedDrinks
        }
      }
    });
    
    await whatsapp.sendMessage(phoneNumber, message);
  }
}

async function handleMenu2Response(phoneNumber: string, session: any, message: string) {
  console.log('🍽 [MENU 2] Traitement réponse:', message);
  
  const menuConfig = session.context.menuBeingConfigured;
  
  if (menuConfig.currentStep === 1) {
    // Étape 1 : Validation des 2 pizzas SÉNIOR
    const availablePizzas = menuConfig.availablePizzas || [];
    const choices = message.split(',').map(choice => parseInt(choice.trim()));
    
    if (choices.length !== 2) {
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(message, 'menu_selection') + '\n\n🍕 Vous devez choisir exactement 2 pizzas.\nEx: 1,2');
      return;
    }
    
    for (const choice of choices) {
      if (isNaN(choice) || choice < 1 || choice > availablePizzas.length) {
        await whatsapp.sendMessage(phoneNumber, 
          getSuggestionMessage(message, 'menu_selection') + `\n\n🍕 Choix invalide: ${choice}.\nChoisissez entre 1 et ${availablePizzas.length}.`);
        return;
      }
    }
    
    // Sauvegarder les pizzas sélectionnées et passer à l'étape 2
    const selectedPizzas = choices.map(choice => {
      const pizzaOption = availablePizzas[choice - 1];
      return {
        id: pizzaOption.pizza.id,
        name: pizzaOption.pizza.name,
        size_id: pizzaOption.sizeData.id,
        size_name: pizzaOption.sizeData.size_name,
        final_price: pizzaOption.finalPrice,
        display_name: `${pizzaOption.pizza.name} ${pizzaOption.sizeData.size_name}`,
        composition: pizzaOption.pizza.composition,
        is_pizza: true
      };
    });
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          currentStep: 2,
          selectedComponents: { pizzas: selectedPizzas }
        }
      }
    });
    
    // Passer à l'étape 2 (boissons)
    await executeMenuStep(phoneNumber, 'MENU_2', 2);
    
  } else if (menuConfig.currentStep === 2) {
    // Étape 2 : Validation boisson 1.5L
    const availableDrinks = menuConfig.availableDrinks || [];
    const drinkChoice = parseInt(message.trim());
    
    if (isNaN(drinkChoice) || drinkChoice < 1 || drinkChoice > availableDrinks.length) {
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(message, 'menu_selection') + `\n\n🥤 Choix invalide.\nChoisissez entre 1 et ${availableDrinks.length}.`);
      return;
    }
    
    // Créer le menu final
    const selectedPizzas = menuConfig.selectedComponents.pizzas;
    const drinkOption = availableDrinks[drinkChoice - 1];
    const selectedDrink = {
      name: drinkOption.drink.name,
      variant: drinkOption.variant.variant_name
    };
    
    const finalMenuPrice = 25; // Prix fixe du MENU 2
    const menuFinal = {
      id: menuConfig.originalItem.id,
      name: menuConfig.originalItem.name,
      final_price: finalMenuPrice,
      display_name: `${menuConfig.originalItem.name} PERSONNALISÉ`,
      menu_components: selectedPizzas,
      selected_drink: selectedDrink,
      is_configured_menu: true
    };
    
    // Ajouter le menu complet au panier et terminer
    await addItemToCart(phoneNumber, session, menuFinal, 1, false);
    
    // Retourner à l'état ORDERING
    await SimpleSession.update(session.id, {
      state: 'ORDERING',
      context: {
        ...session.context,
        menuBeingConfigured: null
      }
    });
  }
}

/**
 * 🍽 NOUVEAU : MENU 3 - 1 pizza MEGA + (NUGGETS 14 ou WINGS 12) + 1 boisson 1.5L
 */
async function executeMenu3Step(phoneNumber: string, step: number) {
  console.log(`🍽 [MENU 3] Étape ${step}`);
  
  const session = await SimpleSession.get(phoneNumber);
  const restaurant = { id: session.context.selectedRestaurantId };
  
  if (step === 1) {
    // Étape 1 : Sélectionner 1 pizza MEGA
    const { data: megaPizzas, error } = await supabase
      .from('france_products')
      .select(`
        *,
        france_product_sizes!inner (
          id, size_name, price_on_site, price_delivery, display_order, includes_drink
        )
      `)
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .eq('france_product_sizes.size_name', 'MEGA')
      .order('display_order');
    
    if (error || !megaPizzas || megaPizzas.length === 0) {
      console.error('❌ [MENU 3] Erreur pizzas MEGA:', error);
      await whatsapp.sendMessage(phoneNumber, '❌ Aucune pizza MEGA disponible.');
      return;
    }
    
    let message = `✅ MENU 3 sélectionné !\n🍽 1 PIZZA MEGA + 14 NUGGETS OU 12 WINGS + 1 BOISSON 1.5L\n\n`;
    message += `🍕 Étape 1/3 : Choisissez votre PIZZA MEGA\n\n`;
    
    let orderedPizzas: any[] = [];
    
    megaPizzas.forEach((pizza, index) => {
      const sizeData = pizza.france_product_sizes[0]; // Premier élément car INNER join
      const itemIndex = index + 1;
      
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `🎯 🍕 ${pizza.name}\n`;
      if (pizza.composition) {
        message += `🧾 ${pizza.composition}\n`;
      }
      
      const isDelivery = session.context.deliveryMode === 'livraison';
      const selectedPrice = isDelivery ? (sizeData.price_delivery || sizeData.price_on_site) : sizeData.price_on_site;
      const formattedPrice = formatPrice(selectedPrice, 'EUR');
      
      message += `💰 ${formattedPrice} - Tapez ${itemIndex}\n\n`;
      
      orderedPizzas.push({
        index: itemIndex,
        sizeData: sizeData,
        pizza: pizza,
        finalPrice: selectedPrice
      });
    });
    
    message += `Tapez votre choix (ex: 1)\n`;
    message += `❌ Tapez "annuler" pour arrêter`;
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          availablePizzas: orderedPizzas
        }
      }
    });
    
    await whatsapp.sendMessage(phoneNumber, message);
    
  } else if (step === 2) {
    // Étape 2 : Choisir NUGGETS 14 ou WINGS 12
    let message = `✅ Pizza sélectionnée !\n\n`;
    message += `🍗 Étape 2/3 : Choisissez votre accompagnement\n\n`;
    message += `1️⃣ 🍗 NUGGETS 14 PIÈCES\n`;
    message += `2️⃣ 🔥 WINGS 12 PIÈCES\n\n`;
    message += `Tapez votre choix (1 ou 2)\n`;
    message += `❌ Tapez "annuler" pour arrêter`;
    
    await whatsapp.sendMessage(phoneNumber, message);
    
  } else if (step === 3) {
    // Étape 3 : Sélectionner 1 boisson 1.5L (même logique que MENU 2)
    console.log('🍺 [MENU 3] Recherche boissons 1L5 pour restaurant:', restaurant.id);
    
    const { data: drinks, error } = await supabase
      .from('france_products')
      .select(`
        *,
        france_product_variants!inner (
          id, variant_name, price_on_site, price_delivery, quantity, unit, display_order
        )
      `)
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .eq('france_product_variants.variant_name', '1L5')
      .order('display_order');
    
    console.log('🍺 [MENU 3] Résultats requête boissons:', { 
      error: error, 
      count: drinks?.length || 0,
      drinks: drinks?.map(d => ({ name: d.name, variants: d.france_product_variants?.map(v => v.variant_name) }))
    });
    
    if (error || !drinks || drinks.length === 0) {
      console.error('❌ [MENU 3] Erreur boissons 1.5L:', error);
      await whatsapp.sendMessage(phoneNumber, '❌ Aucune boisson 1.5L disponible.');
      return;
    }
    
    let message = `✅ Accompagnement sélectionné !\n\n`;
    message += `🥤 Étape 3/3 : Choisissez votre BOISSON 1.5L\n\n`;
    
    let orderedDrinks: any[] = [];
    
    drinks.forEach((drink, index) => {
      const variant = drink.france_product_variants[0];
      const itemIndex = index + 1;
      
      message += `${itemIndex}️⃣ ${drink.name} ${variant.variant_name}\n`;
      
      orderedDrinks.push({
        index: itemIndex,
        variant: variant,
        drink: drink
      });
    });
    
    message += `\nTapez votre choix (ex: 1)\n`;
    message += `❌ Tapez "annuler" pour arrêter`;
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          availableDrinks: orderedDrinks
        }
      }
    });
    
    await whatsapp.sendMessage(phoneNumber, message);
  }
}

async function handleMenu3Response(phoneNumber: string, session: any, message: string) {
  console.log('🍽 [MENU 3] Traitement réponse:', message);
  
  const menuConfig = session.context.menuBeingConfigured;
  
  if (menuConfig.currentStep === 1) {
    // Étape 1 : Validation pizza MEGA
    const availablePizzas = menuConfig.availablePizzas || [];
    const pizzaChoice = parseInt(message.trim());
    
    if (isNaN(pizzaChoice) || pizzaChoice < 1 || pizzaChoice > availablePizzas.length) {
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(message, 'menu_selection') + `\n\n🍕 Choix invalide.\nChoisissez entre 1 et ${availablePizzas.length}.`);
      return;
    }
    
    // Sauvegarder la pizza sélectionnée et passer à l'étape 2
    const pizzaOption = availablePizzas[pizzaChoice - 1];
    const selectedPizza = {
      id: pizzaOption.pizza.id,
      name: pizzaOption.pizza.name,
      size_id: pizzaOption.sizeData.id,
      size_name: pizzaOption.sizeData.size_name,
      final_price: pizzaOption.finalPrice,
      display_name: `${pizzaOption.pizza.name} ${pizzaOption.sizeData.size_name}`,
      composition: pizzaOption.pizza.composition,
      is_pizza: true
    };
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          currentStep: 2,
          selectedComponents: { pizza: selectedPizza }
        }
      }
    });
    
    // Passer à l'étape 2 (nuggets/wings)
    await executeMenuStep(phoneNumber, 'MENU_3', 2);
    
  } else if (menuConfig.currentStep === 2) {
    // Étape 2 : Validation NUGGETS ou WINGS
    const choice = parseInt(message.trim());
    
    if (choice !== 1 && choice !== 2) {
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(message, 'menu_selection') + '\n\n🍗 Choisissez 1 pour NUGGETS ou 2 pour WINGS.');
      return;
    }
    
    // Récupérer le produit nuggets/wings correspondant
    const productName = choice === 1 ? 'NUGGETS 14 PIÈCES (MENU)' : 'WINGS 12 PIÈCES (MENU)';
    
    const { data: snackProduct, error } = await supabase
      .from('france_products')
      .select('*')
      .eq('name', productName)
      .eq('restaurant_id', session.context.selectedRestaurantId)
      .single();
    
    if (error || !snackProduct) {
      console.error('❌ [MENU 3] Erreur produit accompagnement:', error);
      await whatsapp.sendMessage(phoneNumber, '❌ Produit accompagnement non trouvé.');
      return;
    }
    
    const selectedSnack = {
      id: snackProduct.id,
      name: snackProduct.name,
      display_name: snackProduct.name,
      composition: snackProduct.composition
    };
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          currentStep: 3,
          selectedComponents: {
            ...menuConfig.selectedComponents,
            snack: selectedSnack
          }
        }
      }
    });
    
    // Passer à l'étape 3 (boissons)
    await executeMenuStep(phoneNumber, 'MENU_3', 3);
    
  } else if (menuConfig.currentStep === 3) {
    // Étape 3 : Validation boisson 1.5L
    const availableDrinks = menuConfig.availableDrinks || [];
    const drinkChoice = parseInt(message.trim());
    
    if (isNaN(drinkChoice) || drinkChoice < 1 || drinkChoice > availableDrinks.length) {
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(message, 'menu_selection') + `\n\n🥤 Choix invalide.\nChoisissez entre 1 et ${availableDrinks.length}.`);
      return;
    }
    
    // Créer le menu final
    const selectedPizza = menuConfig.selectedComponents.pizza;
    const selectedSnack = menuConfig.selectedComponents.snack;
    const drinkOption = availableDrinks[drinkChoice - 1];
    const selectedDrink = {
      name: drinkOption.drink.name,
      variant: drinkOption.variant.variant_name
    };
    
    const finalMenuPrice = 32; // Prix fixe du MENU 3
    const menuFinal = {
      id: menuConfig.originalItem.id,
      name: menuConfig.originalItem.name,
      final_price: finalMenuPrice,
      display_name: `${menuConfig.originalItem.name} PERSONNALISÉ`,
      menu_components: [selectedPizza, selectedSnack],
      selected_drink: selectedDrink,
      is_configured_menu: true
    };
    
    // Ajouter le menu complet au panier et terminer
    await addItemToCart(phoneNumber, session, menuFinal, 1, false);
    
    // Retourner à l'état ORDERING
    await SimpleSession.update(session.id, {
      state: 'ORDERING',
      context: {
        ...session.context,
        menuBeingConfigured: null
      }
    });
  }
}

/**
 * 🍽 NOUVEAU : MENU 4 - 1 pizza SÉNIOR + (WINGS 6 ou NUGGETS 8) + 2 boissons 33CL
 */
async function executeMenu4Step(phoneNumber: string, step: number) {
  console.log(`🍽 [MENU 4] Étape ${step}`);
  
  const session = await SimpleSession.get(phoneNumber);
  const restaurant = { id: session.context.selectedRestaurantId };
  
  if (step === 1) {
    // Étape 1 : Sélectionner 1 pizza SÉNIOR (même logique que MENU 2 étape 1)
    const { data: seniorPizzas, error } = await supabase
      .from('france_product_sizes')
      .select(`
        *,
        france_products!inner (
          id, name, composition, restaurant_id, category_id, is_active
        )
      `)
      .eq('size_name', 'SENIOR')
      .eq('france_products.restaurant_id', restaurant.id)
      .eq('france_products.is_active', true)
      .order('display_order');
    
    if (error || !seniorPizzas || seniorPizzas.length === 0) {
      console.error('❌ [MENU 4] Erreur pizzas SÉNIOR:', error);
      await whatsapp.sendMessage(phoneNumber, '❌ Aucune pizza SÉNIOR disponible.');
      return;
    }
    
    let message = `✅ MENU 4 sélectionné !\n🍽 1 PIZZA SÉNIOR + 6 WINGS OU 8 NUGGETS + 2 BOISSONS 33CL\n\n`;
    message += `🍕 Étape 1/3 : Choisissez votre PIZZA SÉNIOR\n\n`;
    
    let orderedPizzas: any[] = [];
    
    seniorPizzas.forEach((sizeData, index) => {
      const pizza = sizeData.france_products;
      const itemIndex = index + 1;
      
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `🎯 🍕 ${pizza.name}\n`;
      if (pizza.composition) {
        message += `🧾 ${pizza.composition}\n`;
      }
      
      const isDelivery = session.context.deliveryMode === 'livraison';
      const selectedPrice = isDelivery ? (sizeData.price_delivery || sizeData.price_on_site) : sizeData.price_on_site;
      const formattedPrice = formatPrice(selectedPrice, 'EUR');
      
      message += `💰 ${formattedPrice} - Tapez ${itemIndex}\n\n`;
      
      orderedPizzas.push({
        index: itemIndex,
        sizeData: sizeData,
        pizza: pizza,
        finalPrice: selectedPrice
      });
    });
    
    message += `Tapez votre choix (ex: 1)\n`;
    message += `❌ Tapez "annuler" pour arrêter`;
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          availablePizzas: orderedPizzas
        }
      }
    });
    
    await whatsapp.sendMessage(phoneNumber, message);
    
  } else if (step === 2) {
    // Étape 2 : Choisir WINGS 6 ou NUGGETS 8
    let message = `✅ Pizza sélectionnée !\n\n`;
    message += `🍗 Étape 2/3 : Choisissez votre accompagnement\n\n`;
    message += `1️⃣ 🔥 WINGS 6 PIÈCES\n`;
    message += `2️⃣ 🍗 NUGGETS 8 PIÈCES\n\n`;
    message += `Tapez votre choix (1 ou 2)\n`;
    message += `❌ Tapez "annuler" pour arrêter`;
    
    await whatsapp.sendMessage(phoneNumber, message);
    
  } else if (step === 3) {
    // Étape 3 : Sélectionner 2 boissons 33CL
    console.log('🍽 [MENU 4] Début étape 3 - recherche boissons 33CL');
    console.log('🍽 [MENU 4] Restaurant ID:', restaurant.id);
    
    const { data: drinks, error } = await supabase
      .from('france_product_variants')
      .select(`
        *,
        france_products!inner (
          id, name, restaurant_id, category_id, is_active
        )
      `)
      .eq('variant_name', '33CL')
      .eq('france_products.restaurant_id', restaurant.id)
      .eq('france_products.is_active', true)
      .order('display_order');
    
    console.log('🍽 [MENU 4] Résultat recherche boissons:', { 
      found: !!drinks && drinks.length > 0, 
      count: drinks?.length || 0, 
      error: error?.message 
    });
    
    if (error || !drinks || drinks.length === 0) {
      console.error('❌ [MENU 4] Erreur boissons 33CL:', error);
      console.log('🍽 [MENU 4] Drinks trouvés:', drinks);
      await whatsapp.sendMessage(phoneNumber, '❌ Aucune boisson 33CL disponible.');
      return;
    }
    
    console.log('🍽 [MENU 4] Construction du message boissons...');
    let message = `✅ Accompagnement sélectionné !\n\n`;
    message += `🥤 Étape 3/3 : Choisissez vos 2 BOISSONS 33CL\n\n`;
    console.log('🍽 [MENU 4] Message base créé');
    
    let orderedDrinks: any[] = [];
    console.log('🍽 [MENU 4] Début boucle drinks, nombre:', drinks.length);
    
    drinks.forEach((drink, index) => {
      console.log(`🍽 [MENU 4] Traitement drink ${index}:`, drink.france_products?.name || 'Nom indisponible');
      
      const variant = drink.france_products?.[0] || drink;
      const itemIndex = index + 1;
      
      console.log(`🍽 [MENU 4] Variant pour drink ${index}:`, { variant_name: drink.variant_name, price: drink.price_on_site });
      
      message += `${itemIndex}️⃣ ${drink.france_products?.name || 'Boisson'} ${drink.variant_name}\n`;
      
      orderedDrinks.push({
        index: itemIndex,
        variant: drink,
        drink: drink.france_products || drink
      });
      
      console.log(`🍽 [MENU 4] Drink ${index} ajouté au message`);
    });
    
    console.log('🍽 [MENU 4] Fin boucle drinks, orderedDrinks length:', orderedDrinks.length);
    
    message += `\nTapez vos 2 choix séparés par des virgules\n`;
    message += `Ex: 1,2 = ${orderedDrinks[0]?.drink.name || 'Boisson #1'} + ${orderedDrinks[1]?.drink.name || 'Boisson #2'}\n`;
    message += `❌ Tapez "annuler" pour arrêter`;
    
    console.log('🍽 [MENU 4] Message final construit, longueur:', message.length);
    console.log('🍽 [MENU 4] Début mise à jour session...');
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          availableDrinks: orderedDrinks
        }
      }
    });
    
    console.log('🍽 [MENU 4] Session mise à jour, envoi du message...');
    await whatsapp.sendMessage(phoneNumber, message);
    console.log('🍽 [MENU 4] Message envoyé avec succès !');
  }
}

async function handleMenu4Response(phoneNumber: string, session: any, message: string) {
  console.log('🍽 [MENU 4] Traitement réponse:', message);
  
  const menuConfig = session.context.menuBeingConfigured;
  
  if (menuConfig.currentStep === 1) {
    // Étape 1 : Validation pizza SÉNIOR
    const availablePizzas = menuConfig.availablePizzas || [];
    const pizzaChoice = parseInt(message.trim());
    
    if (isNaN(pizzaChoice) || pizzaChoice < 1 || pizzaChoice > availablePizzas.length) {
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(message, 'menu_selection') + `\n\n🍕 Choix invalide.\nChoisissez entre 1 et ${availablePizzas.length}.`);
      return;
    }
    
    // Sauvegarder la pizza sélectionnée et passer à l'étape 2
    const pizzaOption = availablePizzas[pizzaChoice - 1];
    const selectedPizza = {
      id: pizzaOption.pizza.id,
      name: pizzaOption.pizza.name,
      size_id: pizzaOption.sizeData.id,
      size_name: pizzaOption.sizeData.size_name,
      final_price: pizzaOption.finalPrice,
      display_name: `${pizzaOption.pizza.name} ${pizzaOption.sizeData.size_name}`,
      composition: pizzaOption.pizza.composition,
      is_pizza: true
    };
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          currentStep: 2,
          selectedComponents: { pizza: selectedPizza }
        }
      }
    });
    
    // Passer à l'étape 2 (nuggets/wings)
    await executeMenuStep(phoneNumber, 'MENU_4', 2);
    
  } else if (menuConfig.currentStep === 2) {
    // Étape 2 : Validation WINGS ou NUGGETS
    const choice = parseInt(message.trim());
    
    if (choice !== 1 && choice !== 2) {
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(message, 'menu_selection') + '\n\n🍗 Choisissez 1 pour WINGS ou 2 pour NUGGETS.');
      return;
    }
    
    // Récupérer le produit wings/nuggets correspondant
    const productName = choice === 1 ? 'WINGS 6 PIÈCES (MENU)' : 'NUGGETS 8 PIÈCES (MENU)';
    console.log(`🍽 [MENU 4] Recherche produit: "${productName}" pour restaurant ${session.context.selectedRestaurantId}`);
    console.log(`🍽 [MENU 4] Choix utilisateur: ${choice} (${choice === 1 ? 'WINGS' : 'NUGGETS'})`);
    
    const { data: snackProduct, error } = await supabase
      .from('france_products')
      .select('*')
      .eq('name', productName)
      .eq('restaurant_id', session.context.selectedRestaurantId)
      .single();
    
    console.log(`🍽 [MENU 4] Résultat recherche:`, { 
      found: !!snackProduct, 
      productName: snackProduct?.name,
      productId: snackProduct?.id,
      error: error?.message 
    });
    
    if (error || !snackProduct) {
      console.error('❌ [MENU 4] Erreur produit accompagnement:', error);
      await whatsapp.sendMessage(phoneNumber, '❌ Produit accompagnement non trouvé.');
      return;
    }
    
    const selectedSnack = {
      id: snackProduct.id,
      name: snackProduct.name,
      display_name: snackProduct.name,
      composition: snackProduct.composition
    };
    
    await SimpleSession.update(session.id, {
      context: {
        ...session.context,
        menuBeingConfigured: {
          ...session.context.menuBeingConfigured,
          currentStep: 3,
          selectedComponents: {
            ...menuConfig.selectedComponents,
            snack: selectedSnack
          }
        }
      }
    });
    
    // Passer à l'étape 3 (boissons)
    console.log('🍽 [MENU 4] Passage à l\'étape 3 (boissons)...');
    await executeMenuStep(phoneNumber, 'MENU_4', 3);
    
  } else if (menuConfig.currentStep === 3) {
    // Étape 3 : Validation 2 boissons 33CL
    const availableDrinks = menuConfig.availableDrinks || [];
    const choices = message.split(',').map(choice => parseInt(choice.trim()));
    
    if (choices.length !== 2) {
      await whatsapp.sendMessage(phoneNumber, 
        getSuggestionMessage(message, 'menu_selection') + '\n\n🥤 Vous devez choisir exactement 2 boissons.\nEx: 1,2');
      return;
    }
    
    for (const choice of choices) {
      if (isNaN(choice) || choice < 1 || choice > availableDrinks.length) {
        await whatsapp.sendMessage(phoneNumber, 
          getSuggestionMessage(message, 'menu_selection') + `\n\n🥤 Choix invalide: ${choice}.\nChoisissez entre 1 et ${availableDrinks.length}.`);
        return;
      }
    }
    
    // Créer le menu final
    const selectedPizza = menuConfig.selectedComponents.pizza;
    const selectedSnack = menuConfig.selectedComponents.snack;
    const selectedDrinks = choices.map(choice => {
      const drinkOption = availableDrinks[choice - 1];
      return {
        name: drinkOption.drink.name,
        variant: drinkOption.variant.variant_name
      };
    });
    
    const finalMenuPrice = 22; // Prix fixe du MENU 4
    const menuFinal = {
      id: menuConfig.originalItem.id,
      name: menuConfig.originalItem.name,
      final_price: finalMenuPrice,
      display_name: `${menuConfig.originalItem.name} PERSONNALISÉ`,
      menu_components: [selectedPizza, selectedSnack],
      selected_drinks: selectedDrinks, // Note: 'selected_drinks' au pluriel pour MENU 4
      is_configured_menu: true
    };
    
    // Ajouter le menu complet au panier et terminer
    await addItemToCart(phoneNumber, session, menuFinal, 1, false);
    
    // Retourner à l'état ORDERING
    await SimpleSession.update(session.id, {
      state: 'ORDERING',
      context: {
        ...session.context,
        menuBeingConfigured: null
      }
    });
  }
}/**
 * 👶 FONCTION : handleMenuEnfantSelection
 * Démarrer la configuration interactive du MENU ENFANT
 */
async function handleMenuEnfantSelection(phoneNumber: string, session: any, selectedItem: any) {
  console.log('👶 [MENU ENFANT] Début de la configuration');
  
  // Initialiser la configuration du menu enfant
  const menuEnfantConfig = {
    originalItem: selectedItem,
    currentStep: 1,
    totalSteps: 2,
    selectedMain: null,
    selectedDrink: null
  };
  
  // Changer l'état de la session
  await SimpleSession.update(session.id, {
    state: 'CONFIGURING_MENU_ENFANT',
    context: {
      ...session.context,
      menuEnfantConfig
    }
  });
  
  // Afficher le choix du plat principal
  let message = `👶 **MENU ENFANT** - 7€ (8€ livraison)\n\n`;
  message += `🍽 **Étape 1/2 : Choisissez votre plat principal**\n\n`;
  message += `1️⃣ Cheeseburger\n`;
  message += `2️⃣ Nuggets\n\n`;
  message += `📝 Tapez le numéro de votre choix\n`;
  message += `❌ Tapez "annuler" pour annuler`;
  
  await whatsapp.sendMessage(phoneNumber, message);
}

/**
 * 👶 FONCTION : handleMenuEnfantConfigurationResponse
 * Gérer les réponses de configuration du MENU ENFANT
 */
async function handleMenuEnfantConfigurationResponse(phoneNumber: string, session: any, response: string) {
  const menuConfig = session.context.menuEnfantConfig;
  
  if (!menuConfig) {
    console.error('❌ [MENU ENFANT] Configuration manquante');
    return;
  }
  
  console.log('👶 [MENU ENFANT] Étape:', menuConfig.currentStep, 'Réponse:', response);
  
  if (menuConfig.currentStep === 1) {
    // Étape 1 : Choix du plat principal
    let selectedMain = null;
    
    if (response === '1') {
      selectedMain = 'Cheeseburger';
    } else if (response === '2') {
      selectedMain = 'Nuggets';
    } else {
      await whatsapp.sendMessage(phoneNumber, '❌ Choix invalide. Tapez 1 pour Cheeseburger ou 2 pour Nuggets.');
      return;
    }
    
    // Sauvegarder le choix et passer à l'étape 2
    const updatedConfig = {
      ...menuConfig,
      selectedMain,
      currentStep: 2
    };
    
    await SimpleSession.update(session.id, {
      state: 'CONFIGURING_MENU_ENFANT',
      context: {
        ...session.context,
        menuEnfantConfig: updatedConfig
      }
    });
    
    // Afficher le choix de boisson
    let message = `👶 **MENU ENFANT** avec **${selectedMain}**\n\n`;
    message += `🥤 **Étape 2/2 : Choisissez votre boisson**\n\n`;
    message += `1️⃣ Compote\n`;
    message += `2️⃣ Caprisun\n\n`;
    message += `📝 Tapez le numéro de votre choix\n`;
    message += `❌ Tapez "annuler" pour annuler`;
    
    await whatsapp.sendMessage(phoneNumber, message);
    
  } else if (menuConfig.currentStep === 2) {
    // Étape 2 : Choix de la boisson
    let selectedDrink = null;
    
    if (response === '1') {
      selectedDrink = 'Compote';
    } else if (response === '2') {
      selectedDrink = 'Caprisun';
    } else {
      await whatsapp.sendMessage(phoneNumber, '❌ Choix invalide. Tapez 1 pour Compote ou 2 pour Caprisun.');
      return;
    }
    
    // Configuration terminée - créer l'item final
    const finalMenuItem = {
      id: menuConfig.originalItem.id,
      name: menuConfig.originalItem.name,
      display_name: `MENU ENFANT (${menuConfig.selectedMain} + ${selectedDrink})`,
      price_on_site: menuConfig.originalItem.price_on_site,
      price_delivery: menuConfig.originalItem.price_delivery,
      composition: `${menuConfig.selectedMain} + Frites + Kinder Surprise + ${selectedDrink}`,
      product_type: 'composite',
      is_configured_menu: true,
      menu_components: {
        main: menuConfig.selectedMain,
        drink: selectedDrink,
        extras: ['Frites', 'Kinder Surprise']
      }
    };
    
    // Ajouter au panier
    await addItemToCart(phoneNumber, session, finalMenuItem, 1, false);
    
    // Retourner à l'état ORDERING
    await SimpleSession.update(session.id, {
      state: 'ORDERING',
      context: {
        ...session.context,
        menuEnfantConfig: null
      }
    });
    
    // Message de confirmation
    let confirmMessage = `✅ **MENU ENFANT ajouté au panier !**\n\n`;
    confirmMessage += `🍽 ${menuConfig.selectedMain}\n`;
    confirmMessage += `🍟 Frites\n`;
    confirmMessage += `🎁 Kinder Surprise\n`;
    confirmMessage += `🥤 ${selectedDrink}\n\n`;
    confirmMessage += `💰 Prix : ${finalMenuItem.price_on_site}€\n\n`;
    confirmMessage += `🛒 Tapez "00" pour voir votre panier`;
    
    await whatsapp.sendMessage(phoneNumber, confirmMessage);
  }
}// ============================================
// LOGIQUE GÉNÉRALISÉE - APPROCHE HYBRIDE
// ============================================

/**
 * 🏗️ NOUVELLE ARCHITECTURE : Détection universelle des workflows
 */
async function handleProductSelectionUniversal(phoneNumber: string, session: any, selectedItem: any) {
  console.log('🏗️ [UNIVERSAL] Traitement universel du produit:', selectedItem.name);
  
  // 1. Récupérer les capacités du restaurant
  const restaurantFeatures = await getRestaurantFeatures(session.context.selectedRestaurantId);
  
  // 2. Analyser le type de workflow du produit
  if (selectedItem.workflow_type && selectedItem.requires_steps) {
    console.log('🔄 [WORKFLOW] Produit nécessitant un workflow:', selectedItem.workflow_type);
    
    // Vérifier si le restaurant supporte ce type de workflow
    if (restaurantSupportsWorkflow(restaurantFeatures, selectedItem.workflow_type)) {
      await handleUniversalWorkflow(phoneNumber, session, selectedItem);
      return;
    } else {
      console.log('⚠️ [WORKFLOW] Restaurant ne supporte pas ce workflow');
      await whatsapp.sendMessage(phoneNumber, '❌ Ce produit n\'est pas disponible pour ce restaurant.');
      return;
    }
  }
  
  // 3. Traitement selon le type de workflow
  switch (selectedItem.workflow_type) {
    case 'pizza_config':
      if (restaurantFeatures.has('pizzas')) {
        await handlePizzaWorkflow(phoneNumber, session, selectedItem);
      } else {
        await addItemToCart(phoneNumber, session, selectedItem); // Fallback
      }
      break;
      
    case 'composite_selection':
      if (restaurantFeatures.has('composite_menus')) {
        await handleCompositeWorkflow(phoneNumber, session, selectedItem);
      } else {
        await addItemToCart(phoneNumber, session, selectedItem); // Fallback
      }
      break;
      
    case 'pizza_menu_config':
      if (restaurantFeatures.has('interactive_workflows')) {
        await handlePizzaMenuSelection(phoneNumber, session, selectedItem);
      } else {
        await addItemToCart(phoneNumber, session, selectedItem); // Fallback
      }
      break;
      
    default:
      // Produit simple - ajout direct au panier
      console.log('📦 [SIMPLE] Produit simple - ajout direct');
      await addItemToCart(phoneNumber, session, selectedItem);
  }
}

/**
 * 🔍 FONCTION : Récupérer les capacités d'un restaurant
 */
async function getRestaurantFeatures(restaurantId: number): Promise<Map<string, any>> {
  console.log('🔍 [FEATURES] Récupération des capacités restaurant:', restaurantId);
  
  const { data: features, error } = await supabase
    .from('france_restaurant_features')
    .select('feature_type, is_enabled, config')
    .eq('restaurant_id', restaurantId)
    .eq('is_enabled', true);
    
  if (error) {
    console.error('❌ [FEATURES] Erreur récupération capacités:', error);
    return new Map(); // Fallback vide
  }
  
  const featuresMap = new Map();
  features?.forEach(feature => {
    featuresMap.set(feature.feature_type, feature.config || {});
  });
  
  console.log('✅ [FEATURES] Capacités récupérées:', Array.from(featuresMap.keys()));
  return featuresMap;
}

/**
 * ✅ FONCTION : Vérifier si un restaurant supporte un workflow
 */
function restaurantSupportsWorkflow(features: Map<string, any>, workflowType: string): boolean {
  switch (workflowType) {
    case 'pizza_config':
    case 'pizza_menu_config':
      return features.has('pizzas') || features.has('interactive_workflows');
      
    case 'composite_selection':
      return features.has('composite_menus') || features.has('interactive_workflows');
      
    default:
      return false;
  }
}

/**
 * 🔄 FONCTION : Workflow universel basé sur la configuration
 */
async function handleUniversalWorkflow(phoneNumber: string, session: any, selectedItem: any) {
  console.log('🔄 [UNIVERSAL WORKFLOW] Démarrage workflow pour:', selectedItem.name);
  
  try {
    const stepsConfig = JSON.parse(selectedItem.steps_config || '{}');
    
    if (!stepsConfig.steps || stepsConfig.steps.length === 0) {
      console.error('❌ [WORKFLOW] Configuration des étapes manquante');
      await addItemToCart(phoneNumber, session, selectedItem); // Fallback
      return;
    }
    
    // Initialiser la configuration du workflow
    const workflowConfig = {
      originalItem: selectedItem,
      currentStep: 1,
      totalSteps: stepsConfig.steps.length,
      selections: {},
      stepsConfig: stepsConfig
    };
    
    // Changer l'état de la session
    await SimpleSession.update(session.id, {
      state: 'CONFIGURING_UNIVERSAL_WORKFLOW',
      context: {
        ...session.context,
        workflowConfig
      }
    });
    
    // Afficher la première étape
    await showWorkflowStep(phoneNumber, workflowConfig, 1);
    
  } catch (error) {
    console.error('❌ [WORKFLOW] Erreur parsing configuration:', error);
    await addItemToCart(phoneNumber, session, selectedItem); // Fallback
  }
}

/**
 * 📋 FONCTION : Afficher une étape du workflow
 */
async function showWorkflowStep(phoneNumber: string, config: any, stepNumber: number) {
  const step = config.stepsConfig.steps[stepNumber - 1];
  
  if (!step) {
    console.error('❌ [WORKFLOW] Étape introuvable:', stepNumber);
    return;
  }
  
  let message = `🔄 **${config.originalItem.name}**\n\n`;
  message += `📋 **Étape ${stepNumber}/${config.totalSteps} : ${step.title}**\n\n`;
  
  step.options.forEach((option: string, index: number) => {
    message += `${index + 1}️⃣ ${option}\n`;
  });
  
  message += `\n📝 Tapez le numéro de votre choix\n`;
  message += `❌ Tapez "annuler" pour annuler`;
  
  await whatsapp.sendMessage(phoneNumber, message);
}

/**
 * 🔄 FONCTION : Gérer les réponses du workflow universel
 */
async function handleUniversalWorkflowResponse(phoneNumber: string, session: any, response: string) {
  const config = session.context.workflowConfig;
  
  if (!config) {
    console.error('❌ [UNIVERSAL WORKFLOW] Configuration manquante');
    return;
  }
  
  const currentStep = config.stepsConfig.steps[config.currentStep - 1];
  const choiceIndex = parseInt(response) - 1;
  
  // Valider le choix
  if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= currentStep.options.length) {
    await whatsapp.sendMessage(phoneNumber, 
      `❌ Choix invalide. Tapez un numéro entre 1 et ${currentStep.options.length}.`);
    return;
  }
  
  // Enregistrer la sélection
  config.selections[`step_${config.currentStep}`] = currentStep.options[choiceIndex];
  
  if (config.currentStep < config.totalSteps) {
    // Passer à l'étape suivante
    config.currentStep++;
    
    await SimpleSession.update(session.id, {
      state: 'CONFIGURING_UNIVERSAL_WORKFLOW',
      context: {
        ...session.context,
        workflowConfig: config
      }
    });
    
    await showWorkflowStep(phoneNumber, config, config.currentStep);
    
  } else {
    // Workflow terminé - créer l'item final
    await finishUniversalWorkflow(phoneNumber, session, config);
  }
}

/**
 * ✅ FONCTION : Finaliser le workflow universel
 */
async function finishUniversalWorkflow(phoneNumber: string, session: any, config: any) {
  console.log('✅ [WORKFLOW] Finalisation workflow');
  
  // Créer la description finale
  let finalComposition = config.stepsConfig.final_format || config.originalItem.composition;
  
  // Remplacer les placeholders avec les sélections
  Object.keys(config.selections).forEach((key, index) => {
    const placeholder = `{${config.stepsConfig.steps[index]?.type === 'single_choice' ? 
      ['main', 'drink', 'option'][index] || `choice${index + 1}` : 
      `choice${index + 1}`}}`;
    finalComposition = finalComposition.replace(placeholder, config.selections[key]);
  });
  
  // Créer la description d'affichage
  const selectionsArray = Object.values(config.selections);
  const displayName = `${config.originalItem.name} (${selectionsArray.join(' + ')})`;
  
  // Créer l'item final
  const finalMenuItem = {
    id: config.originalItem.id,
    name: config.originalItem.name,
    display_name: displayName,
    price_on_site: config.originalItem.price_on_site,
    price_delivery: config.originalItem.price_delivery,
    composition: finalComposition,
    product_type: 'composite',
    is_configured_menu: true,
    workflow_selections: config.selections
  };
  
  // Ajouter au panier
  await addItemToCart(phoneNumber, session, finalMenuItem, 1, false);
  
  // Retourner à l'état ORDERING
  await SimpleSession.update(session.id, {
    state: 'ORDERING',
    context: {
      ...session.context,
      workflowConfig: null
    }
  });
  
  // Message de confirmation
  let confirmMessage = `✅ **${config.originalItem.name} ajouté au panier !**\n\n`;
  confirmMessage += `📋 **Configuration :**\n`;
  Object.values(config.selections).forEach((selection: any) => {
    confirmMessage += `• ${selection}\n`;
  });
  confirmMessage += `\n💰 **Prix :** ${finalMenuItem.price_on_site}€\n\n`;
  confirmMessage += `🛒 Tapez "00" pour voir votre panier`;
  
  await whatsapp.sendMessage(phoneNumber, confirmMessage);
}