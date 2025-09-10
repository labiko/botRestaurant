// Edge Function de test pour débugger le code problématique d'UniversalBot

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SESSION_DURATION_MINUTES = 120; // Comme dans UniversalBot

class TestUniversalBotCode {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    this.supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    console.log('✅ Constructor: URLs initialisées');
  }

  // EXACTEMENT LE MÊME CODE QUI PLANTE DANS UNIVERSALBOT AVEC LOGS ORDONNÉS
  async testProblematicCode() {
    const startTime = Date.now();
    const logWithOrder = (message: string, step: number) => {
      const elapsed = Date.now() - startTime;
      console.log(`[${elapsed}ms] [STEP-${step.toString().padStart(2, '0')}] ${message}`);
    };

    logWithOrder('🔵 [TEST] Test du code problématique UniversalBot', 1);
    const phoneNumber = '33620951645@c.us';
    const restaurant = { id: 1, name: 'Pizza Yolo 77' };

    // Simulation des logs avant le problème
    logWithOrder('📝 [DirectAccess] Création de la session...', 2);
    logWithOrder('🚨 [AVANT_CREATE_SESSION] Juste avant appel createSessionForRestaurant', 3);
    
    let session;
    try {
      logWithOrder('🔴 [TRY_CREATE] Création session directe...', 4);
      logWithOrder('🔴 [TRY_CREATE] supabaseUrl: ' + (this.supabaseUrl ? 'EXISTS' : 'MISSING'), 5);
      logWithOrder('🔴 [TRY_CREATE] supabaseKey: ' + (this.supabaseKey ? 'EXISTS' : 'MISSING'), 6);
      
      // Importer createClient de manière sûre
      let createClient;
      try {
        logWithOrder('🔴 [TRY_CREATE] Import en cours...', 7);
        const supabaseModule = await import('https://esm.sh/@supabase/supabase-js@2');
        createClient = supabaseModule.createClient;
        logWithOrder('🔴 [TRY_CREATE] Import OK, createClient type: ' + typeof createClient, 8);
      } catch (importError) {
        console.error('💥 [ERREUR_IMPORT]:', importError);
        throw importError;
      }
      
      logWithOrder('🔴 [TRY_CREATE] Création client avec URL et Key...', 9);
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      logWithOrder('🔴 [TRY_CREATE] Client créé', 10);
      
      // Supprimer les sessions existantes
      logWithOrder('🔴 [TRY_CREATE] Début suppression sessions...', 11);
      await supabase
        .from('france_user_sessions')
        .delete()
        .eq('phone_number', phoneNumber);
      logWithOrder('🔴 [TRY_CREATE] Sessions supprimées', 12);
      
      // Créer nouvelle session
      logWithOrder('🔴 [TRY_CREATE] Préparation nouvelle session...', 13);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_DURATION_MINUTES);
      
      logWithOrder('🔴 [TRY_CREATE] Insert en cours...', 14);
      const { data: newSession, error } = await supabase
        .from('france_user_sessions')
        .insert({
          phone_number: phoneNumber,
          chat_id: phoneNumber,
          restaurant_id: restaurant.id,
          current_step: 'CHOOSING_DELIVERY_MODE',
          session_data: JSON.stringify({
            selectedRestaurantId: restaurant.id,
            selectedRestaurantName: restaurant.name
          }),
          cart_items: JSON.stringify([]),
          total_amount: 0,
          expires_at: expiresAt,
          workflow_data: JSON.stringify({}),
          workflow_step_id: null
        })
        .select()
        .single();
        
      logWithOrder('🔴 [TRY_CREATE] Insert terminé', 15);
        
      if (error) {
        logWithOrder('❌ [TRY_CREATE] Erreur insert: ' + error.message, 16);
        throw error;
      }
      
      session = newSession;
      logWithOrder('🟢 [TRY_CREATE] Session créée avec succès', 17);
      
      return { success: true, message: 'Code UniversalBot fonctionne!', sessionId: session?.id };
      
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`[${elapsed}ms] [ERROR] 💥 [ERREUR_APPEL_CREATE_SESSION]:`, error);
      console.error(`[${elapsed}ms] [ERROR] 💥 [ERREUR_APPEL_CREATE_SESSION] Message:`, error?.message);
      console.error(`[${elapsed}ms] [ERROR] 💥 [ERREUR_APPEL_CREATE_SESSION] Stack:`, error?.stack);
      console.error(`[${elapsed}ms] [ERROR] 💥 [ERREUR_APPEL_CREATE_SESSION] Type:`, typeof error);
      return { success: false, error: error?.message || 'Erreur inconnue' };
    }
  }
}

serve(async (req) => {
  const globalStartTime = Date.now();
  try {
    console.log(`[${Date.now() - globalStartTime}ms] [GLOBAL-01] 🚀 [EDGE_FUNCTION] Test du code problématique UniversalBot`);
    
    console.log(`[${Date.now() - globalStartTime}ms] [GLOBAL-02] 🏗️ [EDGE_FUNCTION] Création instance TestUniversalBotCode`);
    const tester = new TestUniversalBotCode();
    
    console.log(`[${Date.now() - globalStartTime}ms] [GLOBAL-03] 🔄 [EDGE_FUNCTION] Appel testProblematicCode()`);
    const result = await tester.testProblematicCode();
    
    console.log(`[${Date.now() - globalStartTime}ms] [GLOBAL-04] 🏁 [EDGE_FUNCTION] Fin du test, résultat:`, result);
    
    return new Response(
      JSON.stringify(result, null, 2),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: result.success ? 200 : 500
      }
    );
    
  } catch (error) {
    console.error(`[${Date.now() - globalStartTime}ms] [GLOBAL-ERROR] 💥 [EDGE_FUNCTION] Erreur globale:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Erreur Edge Function'
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

console.log('🔧 Edge Function test-session-debug démarrée');