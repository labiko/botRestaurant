// ═══════════════════════════════════════════════════════════════
// 🍽️ RESTAURANT PAYMENT SERVICE - INTÉGRATION LENGOPAY
// Inspiré du payment-service existant qui fonctionne parfaitement
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 🔑 CONFIGURATION SUPABASE
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// 🔑 CONFIGURATION LENGOPAY PAR DÉFAUT (FALLBACK)
const DEFAULT_LENGOPAY_CONFIG = {
  apiUrl: "https://sandbox.lengopay.com/api/v1/payments",
  licenseKey: Deno.env.get('LENGOPAY_LICENSE_KEY') ?? '',
  websiteId: Deno.env.get('LENGOPAY_WEBSITE_ID') ?? '',
  currency: "GNF",
  callbackUrl: "https://www.labico.net/api/RestaurantLengoPayCallback",
  returnUrl: "https://www.labico.net/api/RestaurantLengoPayCallback"
};

class RestaurantPaymentService {
  supabase;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }

  /**
   * 🔧 RÉCUPÉRER CONFIGURATION LENGOPAY DU RESTAURANT
   */
  async getRestaurantLengoPayConfig(restaurantId: string) {
    try {
      const { data: config } = await this.supabase
        .from('restaurant_payment_config')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('provider_name', 'lengopay')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (config) {
        console.log(`✅ [RestaurantPayment] Config trouvée pour restaurant ${restaurantId}`);
        return {
          apiUrl: config.api_url,
          licenseKey: config.license_key,
          websiteId: config.website_id,
          currency: "GNF",
          callbackUrl: config.callback_url,
          returnUrl: config.callback_url,
          telephoneMarchand: config.telephone_marchand || '628406028'
        };
      } else {
        console.log(`⚠️ [RestaurantPayment] Aucune config trouvée pour restaurant ${restaurantId}, utilisation config par défaut`);
        return {
          ...DEFAULT_LENGOPAY_CONFIG,
          telephoneMarchand: '628406028'
        };
      }
    } catch (error) {
      console.error(`❌ [RestaurantPayment] Erreur récupération config:`, error);
      return {
        ...DEFAULT_LENGOPAY_CONFIG,
        telephoneMarchand: '628406028'
      };
    }
  }

  /**
   * 🍽️ CRÉER PAIEMENT RESTAURANT LENGOPAY
   * @param restaurantId ID du restaurant
   * @param commandeId ID de la commande
   * @param amount Montant en GNF
   * @param clientPhone Téléphone client
   */ 
  async createRestaurantPayment(restaurantId: string, commandeId: string, amount: number, clientPhone: string) {
    try {
      console.log(`🔄 [RestaurantPayment] === DÉBUT CRÉATION PAIEMENT ===`);
      console.log(`📋 [RestaurantPayment] Restaurant: ${restaurantId}`);
      console.log(`📋 [RestaurantPayment] Commande: ${commandeId}`);
      console.log(`📋 [RestaurantPayment] Montant: ${amount} GNF`);
      console.log(`📋 [RestaurantPayment] Client phone (pour info): ${clientPhone}`);
      
      // 🔧 RÉCUPÉRER LA CONFIGURATION LENGOPAY DU RESTAURANT
      console.log(`🔧 [RestaurantPayment] Récupération config restaurant...`);
      const lengoPayConfig = await this.getRestaurantLengoPayConfig(restaurantId);
      console.log(`✅ [RestaurantPayment] Config récupérée:`, {
        apiUrl: lengoPayConfig.apiUrl,
        websiteId: lengoPayConfig.websiteId,
        telephoneMarchand: lengoPayConfig.telephoneMarchand,
        callbackUrl: lengoPayConfig.callbackUrl
      });
      
      // 📱 UTILISER LE TÉLÉPHONE MARCHAND DE LA CONFIG AU LIEU DU CLIENT
      const merchantPhone = lengoPayConfig.telephoneMarchand;
      console.log(`📱 [RestaurantPayment] ⚠️ IMPORTANT: Utilisation téléphone MARCHAND pour recevoir l'argent: ${merchantPhone}`);
      console.log(`📱 [RestaurantPayment] ℹ️ Le client ${clientPhone} N'EST PAS utilisé pour le paiement`);
      
      // 🌐 CRÉER PAYLOAD LENGOPAY AVEC TÉLÉPHONE MARCHAND
      const paymentPayload = {
        websiteid: lengoPayConfig.websiteId,
        amount: amount,
        currency: lengoPayConfig.currency,
        type_account: "lp-om-gn",
        account: merchantPhone,
        callback_url: lengoPayConfig.callbackUrl,
        return_url: lengoPayConfig.returnUrl
      };
      
      console.log(`📦 [RestaurantPayment] Payload final LengoPay:`, paymentPayload);
      
      // 🌐 APPEL API LENGOPAY AVEC AUTHENTIFICATION DU RESTAURANT
      console.log(`🚀 [RestaurantPayment] Envoi requête vers LengoPay...`);
      console.log(`🌐 [RestaurantPayment] URL: ${lengoPayConfig.apiUrl}`);
      const response = await fetch(lengoPayConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${lengoPayConfig.licenseKey}`
        },
        body: JSON.stringify(paymentPayload)
      });

      console.log(`📡 [RestaurantPayment] Status réponse HTTP: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [RestaurantPayment] Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const paymentData = await response.json();
      console.log(`📥 [RestaurantPayment] === RÉPONSE LENGOPAY COMPLÈTE ===`);
      console.log(`📥 [RestaurantPayment] Status: ${paymentData.status}`);
      console.log(`📥 [RestaurantPayment] Message: ${paymentData.message || 'Aucun message'}`);
      console.log(`📥 [RestaurantPayment] Pay ID: ${paymentData.pay_id || 'Aucun'}`);
      console.log(`📥 [RestaurantPayment] Payment URL: ${paymentData.payment_url || 'Aucun'}`);
      console.log(`📥 [RestaurantPayment] Data complète:`, paymentData);

      if (paymentData.status === "Success" && paymentData.payment_url) {
        console.log(`✅ [RestaurantPayment] Paiement créé avec succès !`);
        
        // 💾 SAUVEGARDER DANS RESTAURANT_PAYMENTS
        console.log(`💾 [RestaurantPayment] Sauvegarde en base...`);
        await this.saveRestaurantPayment({
          restaurantId,
          commandeId,
          paymentId: paymentData.pay_id,
          clientPhone,
          amount,
          paymentUrl: paymentData.payment_url,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        });

        console.log(`🎉 [RestaurantPayment] === SUCCÈS COMPLET ===`);
        return {
          success: true,
          paymentId: paymentData.pay_id,
          paymentUrl: paymentData.payment_url,
          message: 'Paiement restaurant créé avec succès'
        };
      } else {
        console.error(`❌ [RestaurantPayment] === ÉCHEC CRÉATION PAIEMENT ===`);
        console.error(`❌ [RestaurantPayment] Status reçu: ${paymentData.status} (attendu: "Success")`);
        console.error(`❌ [RestaurantPayment] Message d'erreur: ${paymentData.message || 'Aucun message d\'erreur'}`);
        console.error(`❌ [RestaurantPayment] URL paiement: ${paymentData.payment_url || 'Manquant'}`);
        
        return {
          success: false,
          error: paymentData.message || 'Erreur création paiement',
          message: 'Échec création paiement LengoPay',
          lengopayStatus: paymentData.status,
          lengopayData: paymentData
        };
      }
    } catch (error) {
      console.error('❌ [RestaurantPayment] Erreur création:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur technique lors de la création du paiement restaurant'
      };
    }
  }

  /**
   * 📱 NORMALISER NUMÉRO DE TÉLÉPHONE (MÊME LOGIQUE)
   */
  normalizePhoneNumber(phone: string): string {
    if (!phone) return '628406028'; // Fallback test number
    
    // Nettoyer le numéro
    let cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
    
    // Si ça commence par 224, c'est déjà bon
    if (cleaned.startsWith('224')) {
      return cleaned.substring(3); // Enlever 224
    }
    
    // Si ça commence par 6, c'est un numéro guinéen sans indicatif
    if (cleaned.startsWith('6') && cleaned.length === 9) {
      return cleaned;
    }
    
    // Sinon, utiliser le numéro de test
    return '628406028';
  }

  /**
   * 💾 SAUVEGARDER DANS RESTAURANT_PAYMENTS
   */
  async saveRestaurantPayment(paymentData: any) {
    try {
      const restaurantPaymentData = {
        restaurant_id: paymentData.restaurantId,
        commande_id: paymentData.commandeId,
        payment_id: paymentData.paymentId,
        status: paymentData.status,
        amount: paymentData.amount,
        client_phone: paymentData.clientPhone,
        message: "Paiement initié depuis bot restaurant",
        payment_url: paymentData.paymentUrl,
        raw_json: {
          payment_url: paymentData.paymentUrl,
          created_from: "restaurant-payment-service",
          restaurant_id: paymentData.restaurantId,
          commande_id: paymentData.commandeId
        },
        created_at: paymentData.createdAt,
        updated_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('restaurant_payments')
        .upsert(restaurantPaymentData);

      if (error) {
        console.error('❌ [RestaurantPayment] Erreur sauvegarde:', error);
      } else {
        console.log('✅ [RestaurantPayment] Sauvegardé dans restaurant_payments');
      }
    } catch (error) {
      console.error('❌ [RestaurantPayment] Erreur sauvegarde:', error);
    }
  }

  /**
   * 🔍 VÉRIFIER STATUT PAIEMENT RESTAURANT
   */
  async checkRestaurantPaymentStatus(paymentId: string) {
    try {
      console.log(`🔍 [RestaurantPayment] Vérification statut: ${paymentId}`);
      
      const { data: payment } = await this.supabase
        .from('restaurant_payments')
        .select('*')
        .eq('payment_id', paymentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (payment) {
        console.log(`📋 [RestaurantPayment] Paiement trouvé, statut: ${payment.status}`);
        return {
          success: true,
          status: payment.status,
          message: payment.status === 'SUCCESS' ? 'Paiement confirmé' : `Statut: ${payment.status}`,
          paymentData: payment
        };
      }

      return {
        success: false,
        status: 'NOT_FOUND',
        message: 'Paiement restaurant non trouvé'
      };
    } catch (error) {
      console.error('❌ [RestaurantPayment] Erreur vérification statut:', error);
      return {
        success: false,
        status: 'ERROR',
        message: 'Erreur technique lors de la vérification'
      };
    }
  }
}

// 🚀 EDGE FUNCTION HANDLER
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const restaurantPaymentService = new RestaurantPaymentService();
    const url = new URL(req.url);
    const method = req.method;
    const action = url.searchParams.get('action');

    if (method === 'POST' && action === 'create') {
      // 🍽️ CRÉER PAIEMENT RESTAURANT
      const body = await req.json();
      const { restaurantId, commandeId, amount, clientPhone } = body;

      if (!restaurantId || !commandeId || !amount || !clientPhone) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Paramètres manquants: restaurantId, commandeId, amount, clientPhone requis'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await restaurantPaymentService.createRestaurantPayment(
        restaurantId, commandeId, amount, clientPhone
      );

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (method === 'GET' && action === 'status') {
      // 🔍 VÉRIFIER STATUT
      const paymentId = url.searchParams.get('paymentId');
      if (!paymentId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'paymentId requis'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await restaurantPaymentService.checkRestaurantPaymentStatus(paymentId);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Action non supportée',
        usage: {
          create: 'POST /?action=create (body: {restaurantId, commandeId, amount, clientPhone})',
          status: 'GET /?action=status&paymentId=xxx'
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ [RestaurantPaymentService] Erreur globale:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Erreur interne du service de paiement restaurant'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

console.log('🍽️ [RestaurantPaymentService] Service de paiement restaurant démarré');
console.log('🔧 [RestaurantPaymentService] Configuration LengoPay chargée');