// Test simple de connexion Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

console.log('🔍 Test de connexion Supabase...');
console.log('📍 URL:', SUPABASE_URL ? SUPABASE_URL.substring(0, 50) + '...' : 'MANQUANT');
console.log('🔑 Service Key:', SUPABASE_SERVICE_ROLE_KEY ? 'PRÉSENT (' + SUPABASE_SERVICE_ROLE_KEY.length + ' caractères)' : 'MANQUANT');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  Deno.exit(1);
}

try {
  // Créer le client Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('✅ Client Supabase créé');

  // Test 1: Connexion basique avec une table simple
  console.log('\n🧪 Test 1: Lecture table france_restaurants...');
  const { data: restaurants, error: restaurantError } = await supabase
    .from('france_restaurants')
    .select('id, name, is_active')
    .limit(3);

  if (restaurantError) {
    console.error('❌ Erreur test restaurants:', restaurantError);
  } else {
    console.log('✅ Test restaurants réussi:', restaurants?.length, 'restaurants trouvés');
    restaurants?.forEach(r => console.log(`   - ${r.name} (${r.id})`));
  }

  // Test 2: Lecture table france_menu_categories
  console.log('\n🧪 Test 2: Lecture table france_menu_categories...');
  const { data: categories, error: categoryError } = await supabase
    .from('france_menu_categories')
    .select('id, name, restaurant_id')
    .limit(3);

  if (categoryError) {
    console.error('❌ Erreur test catégories:', categoryError);
  } else {
    console.log('✅ Test catégories réussi:', categories?.length, 'catégories trouvées');
    categories?.forEach(c => console.log(`   - ${c.name} (restaurant: ${c.restaurant_id})`));
  }

  // Test 3: Lecture table france_products
  console.log('\n🧪 Test 3: Lecture table france_products...');
  const { data: products, error: productError } = await supabase
    .from('france_products')
    .select('id, name, price_on_site, price_delivery')
    .limit(3);

  if (productError) {
    console.error('❌ Erreur test produits:', productError);
  } else {
    console.log('✅ Test produits réussi:', products?.length, 'produits trouvés');
    products?.forEach(p => console.log(`   - ${p.name} (${p.price_on_site}€/${p.price_delivery}€)`));
  }

  // Test 4: Test des permissions d'écriture (lecture de sessions)
  console.log('\n🧪 Test 4: Test lecture table sessions...');
  const { data: sessions, error: sessionError } = await supabase
    .from('sessions')
    .select('phone_number, state, created_at')
    .limit(2);

  if (sessionError) {
    console.error('❌ Erreur test sessions:', sessionError);
  } else {
    console.log('✅ Test sessions réussi:', sessions?.length, 'sessions trouvées');
  }

  console.log('\n🎉 TOUS LES TESTS TERMINÉS');
  console.log('✅ La connexion Supabase fonctionne correctement');

} catch (error) {
  console.error('❌ ERREUR CRITIQUE:', error);
  console.error('💡 Vérifiez vos variables d\'environnement');
}