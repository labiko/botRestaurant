// 🔍 DEBUG - Fonction createSessionForRestaurant PROBLÉMATIQUE
// Copiée depuis UniversalBot.ts pour analyse

/**
 * ❌ FONCTION PROBLÉMATIQUE - CAUSE L'ERREUR AU DÉMARRAGE
 */
async function createSessionForRestaurant(phoneNumber: string, restaurant: any): Promise<any> {
  console.log('🔥 [DEBUT_CREATE_SESSION] Début createSessionForRestaurant pour:', phoneNumber, 'restaurant:', restaurant.name);
  console.log('🚀 [VERSION_2024_12_20] Nouvelle version avec debug détaillé');
  console.log('🔥 [STEP0] Juste avant le try');
  try {
    console.log('🔥 [STEP1] Dans le try, avant import supabase...');
    // Import temporaire de supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    console.log('🔥 [STEP2] Import réussi, création client...');
    
    // ❌ PROBLÈME 1: Variables de classe undefined
    console.log('🔥 [STEP3] Variables de classe, URL:', this.supabaseUrl ? 'OK' : 'MANQUANTE');
    console.log('🔥 [STEP3.1] URL complète:', this.supabaseUrl);
    console.log('🔥 [STEP3.2] Key (premiers chars):', this.supabaseKey?.substring(0, 20) + '...');
    
    let supabase;
    try {
      console.log('🔥 [STEP3.3] Tentative createClient...');
      supabase = createClient(this.supabaseUrl, this.supabaseKey); // ❌ PEUT ÉCHOUER ICI
      console.log('🔥 [STEP4] Client supabase créé avec succès');
    } catch (createError) {
      console.error('💥 [ERREUR_CREATE_CLIENT]:', createError);
      throw createError;
    }
    
    // Supprimer les sessions existantes
    const deleteResult = await supabase
      .from('france_user_sessions')
      .delete()
      .eq('phone_number', phoneNumber);
    
    // ❌ PROBLÈME 2: SESSION_DURATION_MINUTES undefined
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_DURATION_MINUTES); // ❌ VARIABLE NON DÉFINIE
    
    const { data: newSession, error } = await supabase
      .from('france_user_sessions')
      .insert({
        phone_number: phoneNumber,
        chat_id: phoneNumber,
        restaurant_id: restaurant.id,
        current_step: 'CHOOSING_DELIVERY_MODE',
        bot_state: 'CHOOSING_DELIVERY_MODE',
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
    
    if (error) {
      console.error('❌ [CreateSession] Erreur création session:', error);
      throw error;
    }
    
    return newSession;
    
  } catch (error) {
    console.error('❌ [CreateSession] Erreur création session:', error);
    throw error;
  }
}

/* 🔍 PROBLÈMES IDENTIFIÉS :

1. ❌ SESSION_DURATION_MINUTES non défini
   - Variable utilisée mais pas définie dans la fonction

2. ❌ this.supabaseUrl et this.supabaseKey 
   - Peuvent être undefined/null au moment de l'appel

3. ❌ Import dynamique 
   - Peut échouer selon l'environnement

4. ❌ Appelée au DÉMARRAGE ?
   - Question : d'où vient l'appel pendant le boot ?

SOLUTION :
- Utiliser this.sessionManager.createSessionForRestaurant() à la place
- Ou corriger les variables manquantes
*/
