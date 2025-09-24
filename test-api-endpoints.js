/**
 * Script de test des APIs Back Office Restaurant
 * Usage: node test-api-endpoints.js
 */

async function testEndpoint(url, method = 'GET', body = null) {
  try {
    console.log(`\n🔍 Test ${method} ${url}`);

    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`📊 Status: ${response.status}`);
    console.log(`✅ Response:`, JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error(`❌ Erreur test ${url}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests API Back Office Restaurant\n');

  const baseUrl = 'http://localhost:3000/api';

  // Test 1: Récupération des restaurants
  console.log('='.repeat(60));
  console.log('TEST 1: Récupération des restaurants');
  console.log('='.repeat(60));
  await testEndpoint(`${baseUrl}/restaurants/management`);

  // Test 2: Récupération des icônes
  console.log('='.repeat(60));
  console.log('TEST 2: Récupération des icônes');
  console.log('='.repeat(60));
  await testEndpoint(`${baseUrl}/icons`);

  // Test 3: Récupération des icônes avec filtres
  console.log('='.repeat(60));
  console.log('TEST 3: Récupération des icônes avec filtres');
  console.log('='.repeat(60));
  await testEndpoint(`${baseUrl}/icons?category=plats&search=pizza`);

  // Test 4: Récupération des catégories (nécessite restaurant_id)
  console.log('='.repeat(60));
  console.log('TEST 4: Récupération des catégories (restaurant_id=1)');
  console.log('='.repeat(60));
  await testEndpoint(`${baseUrl}/categories?restaurant_id=1`);

  // Test 5: Récupération des produits (nécessite restaurant_id et category_id)
  console.log('='.repeat(60));
  console.log('TEST 5: Récupération des produits (restaurant_id=1, category_id=1)');
  console.log('='.repeat(60));
  await testEndpoint(`${baseUrl}/products?restaurant_id=1&category_id=1`);

  console.log('\n🎉 Tests terminés !');
  console.log('\n💡 Pour lancer les tests:');
  console.log('1. Démarrer le serveur Next.js: npm run dev');
  console.log('2. Dans un autre terminal: node test-api-endpoints.js');
}

// Vérifier si nous sommes dans Node.js
if (typeof window === 'undefined') {
  runTests();
} else {
  console.log('Ce script doit être exécuté avec Node.js, pas dans un navigateur');
}