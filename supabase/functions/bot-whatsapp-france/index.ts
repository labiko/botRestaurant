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
    
    const { data } = await supabase
      .from('france_sessions')
      .select('*')
      .eq('phone_whatsapp', standardPhone)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

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
    const { data } = await supabase
      .from('france_sessions')
      .update({
        ...updates,
        expires_at: new Date(Date.now() + SESSION_EXPIRE_MINUTES * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

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

// Fonction pour afficher les produits d'une catégorie avec support modulaire
async function showProductsInCategory(phoneNumber: string, restaurant: any, session: any, categoryKey: string) {
  console.log('🍕 Affichage produits catégorie:', categoryKey);
  
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
  const categories = session.context.categories || [];
  const category = categories.find((cat: any) => cat.id === categoryKey);
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
        productMessage += `🎯 **${product.name}**\n`;
        
        sizes.forEach((size, index) => {
          const displayNumber = itemIndex <= 9 ? `${itemIndex}️⃣` : `(${itemIndex})`;
          
          // Choisir le prix selon le mode de livraison
          const isDelivery = session.context.deliveryMode === 'livraison';
          const selectedPrice = isDelivery ? (size.price_delivery || size.price_on_site || size.price) : (size.price_on_site || size.price);
          
          const formattedPrice = formatPrice(selectedPrice, 'EUR');
          const drinkInfo = size.includes_drink ? ' (+ boisson)' : '';
          
          productMessage += `${displayNumber} ${product.name} ${size.size_name} - ${formattedPrice}${drinkInfo}\n`;
          
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
      // Produit simple
      const displayNumber = itemIndex <= 9 ? `${itemIndex}️⃣` : `(${itemIndex})`;
      
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
    context: {
      ...session.context,
      currentCategory: categoryKey,
      currentCategoryProducts: categoryProducts,
      menuOrder: orderedMenu
    }
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
    
  if (selectedItem.includes_drink) {
    console.log('🥤 Produit avec boisson incluse, affichage choix boissons');
    await showDrinkSelection(phoneNumber, session, selectedItem);
    return;
  } else {
    console.log('❌ Pas de boisson incluse détectée, ajout direct au panier');
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
    context: {
      ...session.context,
      configuringProduct: selectedItem,
      currentOptionGroup: groupName,
      allOptionGroups: allGroups,
      groupNamesOrdered: groupNamesOrdered, // ✅ SAUVEGARDER L'ORDRE CORRECT
      currentGroupIndex: currentGroupIndex,
      selectedOptions: session.context.selectedOptions || {}
    }
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
    context: {
      ...session.context,
      selectedOptions: selectedOptions
    }
  });

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
    context: {
      ...session.context,
      configuredItem: configuredItem
    }
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
        await SimpleSession.update(session.id, {
          state: 'ORDERING',
          context: {
            ...updatedSession.context,
            configuredItem: null,
            currentConfiguration: null
          }
        });
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
        context: {
          ...session.context,
          configuredItem: null,
          currentConfiguration: null
        }
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
    const { data, error } = await supabase
      .from('france_product_variants')
      .select(`
        id,
        variant_name,
        price_on_site,
        price_delivery,
        quantity,
        unit,
        france_products!inner(
          id,
          name,
          restaurant_id
        )
      `)
      .eq('france_products.restaurant_id', restaurantId)
      .eq('quantity', 33)
      .eq('unit', 'cl')
      .order('display_order');

    if (error) {
      console.error('Erreur récupération boissons:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erreur getAvailableDrinks:', error);
    return [];
  }
}

// Fonction pour afficher le choix de boisson
async function showDrinkSelection(phoneNumber: string, session: any, selectedItem: any) {
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
  let message = `🍔 **${selectedItem.display_name}**\n`;
  message += `🎁 Votre boisson offerte est incluse !\n\n`;
  message += `┌─ 🥤 **CHOISISSEZ VOTRE BOISSON**\n│\n`;

  drinks.forEach((drink, index) => {
    // Emoji spécifique selon la boisson
    let emoji = '🥤'; // default
    const drinkName = drink.france_products.name.toUpperCase();
    if (drinkName.includes('ZERO')) emoji = '⚫';
    else if (drinkName.includes('OASIS')) emoji = '🍊';
    else if (drinkName.includes('ICE TEA')) emoji = '🧊';
    else if (drinkName.includes('COCA')) emoji = '🥤';
    
    const isLast = index === drinks.length - 1;
    const prefix = isLast ? '└─' : '├─';
    message += `${prefix} ${index + 1}️⃣ ${emoji} **${drink.france_products.name}** ${drink.variant_name}\n`;
  });

  message += `\n💡 **Tapez simplement le chiffre de votre choix**`;

  // Sauvegarder l'état pour la prochaine étape
  await SimpleSession.update(session.id, {
    state: 'DRINK_SELECTION',
    context: {
      ...session.context,
      selectedItemWithDrink: selectedItem,
      availableDrinks: drinks
    }
  });

  await whatsapp.sendMessage(phoneNumber, message);
}

// Fonction pour ajouter un item au panier (produits simples ou configurés)
async function addItemToCart(phoneNumber: string, session: any, item: any, quantity: number = 1, silent: boolean = false) {
  console.log('📦 addItemToCart - DÉBUT');
  console.log('🔍 DEBUG item reçu:', JSON.stringify(item, null, 2));
  console.log('🔍 DEBUG quantity:', quantity, 'silent:', silent);
  
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

  // Sauvegarder le panier mis à jour dans la session
  await SimpleSession.update(session.id, {
    context: {
      ...session.context,
      cart: cart
    }
  });
  console.log('💾 Panier sauvegardé en session');

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
    context: {
      ...session.context,
      cart: cart,
      // Nettoyer les variables de configuration
      configuringProduct: undefined,
      currentOptionGroup: undefined,
      allOptionGroups: undefined,
      currentGroupIndex: undefined,
      selectedOptions: undefined,
      configuredItem: undefined
    }
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

  console.log('🔍 Traitement message:', {
    phoneNumber,
    message,
    normalizedMessage,
    sessionState: session.state,
    sessionId: session.id
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
      console.log('🍺 DRINK_SELECTION - Message reçu:', normalizedMessage);
      const drinkChoice = parseInt(normalizedMessage);
      const availableDrinks = session.context.availableDrinks || [];
      
      console.log('🔍 DEBUG availableDrinks count:', availableDrinks.length);
      console.log('🔍 DEBUG drinkChoice parsed:', drinkChoice);
      
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
        name: selectedDrink.france_products.name,
        variant: selectedDrink.variant_name
      };
      
      const drinkName = `${selectedDrink.france_products.name} ${selectedDrink.variant_name}`;
      const originalDisplayName = selectedItemWithDrink.display_name;
      selectedItemWithDrink.display_name += ` + ${drinkName}`;
      
      console.log('🔍 DEBUG modification display_name:');
      console.log('  - Original:', originalDisplayName);
      console.log('  - Drink:', drinkName);
      console.log('  - Final:', selectedItemWithDrink.display_name);
      
      console.log('🍽️ DEBUG selectedItemWithDrink APRÈS modification:', JSON.stringify(selectedItemWithDrink, null, 2));
      
      // Ajouter au panier
      console.log('📦 Appel addItemToCart avec item modifié');
      await addItemToCart(phoneNumber, session, selectedItemWithDrink);
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
          context: {
            ...session.context,
            totalPrice: totalPrice
          }
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
          context: {
            ...session.context,
            cart: {},
            totalPrice: 0
          }
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
            context: {
              ...session.context,
              totalPrice: totalPrice
            }
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
        // Commande de produits
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
    const emoji = numberEmojis[index] || `${index + 1}️⃣`;
    menuText += `${emoji} ${category.icon || '🍽️'} ${category.name}\n`;
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
      context: updatedContext
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
    confirmationMessage += '\n';
  });
  
  confirmationMessage += `💎 **Total: ${formatPrice(session.context.totalPrice, 'EUR')}**`;

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
    
    // Préparer les données de la commande
    const orderData: any = {
      restaurant_id: session.context.selectedRestaurantId,
      phone_number: phoneNumber.replace('@c.us', ''),
      items: session.context.cart || {},
      total_amount: session.context.totalPrice || 0,
      status: 'en_attente',
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      context: {
        ...session.context,
        cart: {},
        totalPrice: 0
      }
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
        context: {
          ...session.context,
          addresses: addressSelection.addresses
        }
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
      context: {
        ...session.context,
        selectedDeliveryAddress: selectedAddress
      }
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
      context: {
        ...session.context,
        pendingAddressInput: address
      }
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
        context: {
          ...session.context,
          addressSuggestion: suggestion,
          addressSuggestions: validation.suggestions
        }
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
        context: {
          ...session.context,
          selectedDeliveryAddress: {
            id: null,
            full_address: validatedAddress.formatted_address,
            latitude: validatedAddress.geometry?.location?.lat || null,
            longitude: validatedAddress.geometry?.location?.lng || null,
            google_place_id: validatedAddress.place_id || null,
            address_label: autoLabel
          }
        }
      });
      console.log('🛒 [AddressValidated] APRÈS update session (non sauvegardée) - Panier:', JSON.stringify(updatedSession?.context?.cartItems || []));
      console.log('💰 [AddressValidated] APRÈS update session (non sauvegardée) - Total:', updatedSession?.context?.cartTotal);
      
    }
    
    // Procéder directement à la confirmation/enregistrement de commande
    console.log('🚀 [AddressValidated] Appel handleOrderConfirmation avec session...');
    console.log('🛒 [AddressValidated] Session pour handleOrderConfirmation - Panier:', JSON.stringify(session.context?.cartItems || []));
    console.log('💰 [AddressValidated] Session pour handleOrderConfirmation - Total:', session.context?.cartTotal);
    await handleOrderConfirmation(phoneNumber, session, '99');
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
        context: {
          ...session.context,
          selectedDeliveryAddress: savedAddress
        }
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
        context: {
          ...session.context,
          selectedDeliveryAddress: {
            id: null,
            full_address: validatedAddress.formatted_address,
            address_label: label
          }
        }
      });
      
      await handleOrderConfirmation(phoneNumber, session, '99');
    }
  } catch (error) {
    console.error('❌ [AddressLabel] Erreur:', error);
    await whatsapp.sendMessage(phoneNumber, 'Erreur lors de la saisie du nom. Veuillez réessayer.');
  }
}