// Test unitaire pour débugger le problème de création de session
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration (à adapter selon tes valeurs)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://vywbhlnzvfqtiurwmrac.supabase.co';
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'fake-key';

class TestSessionCreation {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.supabaseUrl = SUPABASE_URL;
    this.supabaseKey = SUPABASE_KEY;
    console.log('✅ Constructor: URLs initialisées');
  }

  async testDirectAccess() {
    console.log('🔵 [TEST] Début testDirectAccess');
    const phoneNumber = '33620951645@c.us';
    const restaurant = { id: 1, name: 'Pizza Test' };

    try {
      console.log('🔴 [TRY_CREATE] Création session directe...');
      console.log('🔴 [TRY_CREATE] this existe?', this !== undefined);
      console.log('🔴 [TRY_CREATE] supabaseUrl:', this.supabaseUrl ? 'EXISTS' : 'MISSING');
      console.log('🔴 [TRY_CREATE] supabaseKey:', this.supabaseKey ? 'EXISTS' : 'MISSING');
      
      // Test import
      console.log('🔴 [TRY_CREATE] Import en cours...');
      const supabaseModule = await import('https://esm.sh/@supabase/supabase-js@2');
      const createClient = supabaseModule.createClient;
      console.log('🔴 [TRY_CREATE] Import OK, createClient type:', typeof createClient);
      
      // Test création client
      console.log('🔴 [TRY_CREATE] Création client avec URL et Key...');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      console.log('🔴 [TRY_CREATE] Client créé avec succès!');
      
      // Test requête
      console.log('🔴 [TRY_CREATE] Test requête SELECT...');
      const { data, error } = await supabase
        .from('france_user_sessions')
        .select('*')
        .eq('phone_number', phoneNumber)
        .limit(1);
      
      if (error) {
        console.error('❌ Erreur SELECT:', error);
      } else {
        console.log('✅ SELECT réussi, sessions trouvées:', data?.length || 0);
      }
      
      console.log('🟢 [TEST] Tout fonctionne!');
      
    } catch (error) {
      console.error('💥 [ERREUR_TEST]:', error);
      console.error('💥 [ERREUR_TEST] Message:', error?.message);
      console.error('💥 [ERREUR_TEST] Stack:', error?.stack);
    }
  }

  async testWithFunction() {
    console.log('🔵 [TEST] Test avec appel de fonction');
    
    try {
      console.log('🔴 Avant appel fonction');
      await this.createSessionTest();
      console.log('🟢 Après appel fonction');
    } catch (error) {
      console.error('💥 Erreur appel fonction:', error);
    }
  }

  private async createSessionTest() {
    console.log('📍 Dans createSessionTest');
    console.log('📍 this existe?', this !== undefined);
    console.log('📍 supabaseUrl:', this.supabaseUrl);
    return 'OK';
  }
}

// Exécution des tests
async function runTests() {
  console.log('=== DÉBUT DES TESTS ===');
  
  const tester = new TestSessionCreation();
  
  console.log('\n--- Test 1: Accès direct ---');
  await tester.testDirectAccess();
  
  console.log('\n--- Test 2: Avec fonction ---');
  await tester.testWithFunction();
  
  console.log('\n=== FIN DES TESTS ===');
}

// Lancer les tests
if (import.meta.main) {
  runTests().catch(console.error);
}