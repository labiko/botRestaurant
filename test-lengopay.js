// Test direct API Lengopay pour diagnostiquer l'erreur 401
// Ce script teste différentes méthodes d'authentification

const testLengopayAPI = async () => {
  // Configuration réelle depuis la base de données
  const config = {
    apiUrl: 'https://sandbox.lengopay.com/api/v1/payments',
    licenseKey: 'VmVHNGZud2h1YVdUUnBSYnZ1R3BlNmtMTFhHN1NDNGpaU3plMENtQ1drZ084Y280S2J5ODZPWXJQVWZRT05OWg==',
    websiteId: 'wyp6J7uN3pVG2Pjn',
    amount: 100,
    currency: 'GNF'
  };

  console.log('🧪 Test API Lengopay - Diagnostic erreur 401');
  console.log('📡 URL:', config.apiUrl);
  console.log('🔑 License Key (premiers chars):', config.licenseKey.substring(0, 10) + '...');
  console.log('🌐 Website ID:', config.websiteId);

  // Test 1: Authentification Basic avec encodage Base64
  console.log('\n📋 Test 1: Authentification Basic avec encodage Base64');
  try {
    const authString = Buffer.from(config.licenseKey).toString('base64');
    console.log('🔐 Auth string (Base64):', authString.substring(0, 20) + '...');

    const response1 = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        websiteid: config.websiteId,
        amount: config.amount,
        currency: config.currency,
        return_url: 'https://test.com/success',
        failure_url: 'https://test.com/failure',
        callback_url: 'https://test.com/callback'
      })
    });

    console.log('📊 Status:', response1.status);
    const result1 = await response1.text();
    console.log('📄 Response:', result1);
  } catch (error) {
    console.error('❌ Test 1 échoué:', error.message);
  }

  // Test 2: Authentification directe (sans "Basic")
  console.log('\n📋 Test 2: Authentification directe (sans "Basic")');
  try {
    const response2 = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': config.licenseKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        websiteid: config.websiteId,
        amount: config.amount,
        currency: config.currency,
        return_url: 'https://test.com/success',
        failure_url: 'https://test.com/failure',
        callback_url: 'https://test.com/callback'
      })
    });

    console.log('📊 Status:', response2.status);
    const result2 = await response2.text();
    console.log('📄 Response:', result2);
  } catch (error) {
    console.error('❌ Test 2 échoué:', error.message);
  }

  // Test 3: Header X-API-Key au lieu d'Authorization
  console.log('\n📋 Test 3: Header X-API-Key');
  try {
    const response3 = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.licenseKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        websiteid: config.websiteId,
        amount: config.amount,
        currency: config.currency,
        return_url: 'https://test.com/success',
        failure_url: 'https://test.com/failure',
        callback_url: 'https://test.com/callback'
      })
    });

    console.log('📊 Status:', response3.status);
    const result3 = await response3.text();
    console.log('📄 Response:', result3);
  } catch (error) {
    console.error('❌ Test 3 échoué:', error.message);
  }

  // Test 4: License key dans le body au lieu du header
  console.log('\n📋 Test 4: License key dans le body');
  try {
    const response4 = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        license_key: config.licenseKey,
        websiteid: config.websiteId,
        amount: config.amount,
        currency: config.currency,
        return_url: 'https://test.com/success',
        failure_url: 'https://test.com/failure',
        callback_url: 'https://test.com/callback'
      })
    });

    console.log('📊 Status:', response4.status);
    const result4 = await response4.text();
    console.log('📄 Response:', result4);
  } catch (error) {
    console.error('❌ Test 4 échoué:', error.message);
  }
};

// Instructions d'utilisation
console.log('📝 INSTRUCTIONS:');
console.log('1. Remplacez VOTRE_LICENSE_KEY et VOTRE_WEBSITE_ID par les vraies valeurs');
console.log('2. Exécutez: node test-lengopay.js');
console.log('3. Analysez les résultats pour identifier la bonne méthode d\'authentification');
console.log('');

testLengopayAPI();