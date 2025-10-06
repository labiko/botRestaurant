// Test avec la license key décodée
const testLengopayDecoded = async () => {
  const config = {
    apiUrl: 'https://sandbox.lengopay.com/api/v1/payments',
    licenseKey: 'VeG4fnwhuaWTRpRbvuGpe6kLLXG7SC4jZSze0CmCWkgO8co4Kby86OYrPUfQONNZ', // Décodée
    websiteId: 'wyp6J7uN3pVG2Pjn',
    amount: 100,
    currency: 'GNF'
  };

  console.log('🧪 Test avec license key DÉCODÉE');
  console.log('🔑 License Key:', config.licenseKey);

  // Test 1: Basic avec la clé décodée
  console.log('\n📋 Test 1: Basic avec clé décodée');
  try {
    const response1 = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${config.licenseKey}`,
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

  // Test 2: Bearer avec la clé décodée
  console.log('\n📋 Test 2: Bearer avec clé décodée');
  try {
    const response2 = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.licenseKey}`,
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

  // Test 3: Clé directe sans prefix
  console.log('\n📋 Test 3: Clé directe sans prefix');
  try {
    const response3 = await fetch(config.apiUrl, {
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

    console.log('📊 Status:', response3.status);
    const result3 = await response3.text();
    console.log('📄 Response:', result3);
  } catch (error) {
    console.error('❌ Test 3 échoué:', error.message);
  }

  // Test 4: Clé dans le body
  console.log('\n📋 Test 4: Clé dans le body');
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

testLengopayDecoded();