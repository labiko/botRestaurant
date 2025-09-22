// ===================================================================
// TEST API WORKFLOW SCRIPTS
// ===================================================================
// Script pour tester l'API directement et diagnostiquer les problèmes

// Test 1: POST - Créer un script de test
async function testCreateScript() {
  console.log('🧪 Test 1: Création script via API');

  const testData = {
    productId: 123,
    productName: "TEST PRODUCT",
    sqlScript: "-- Script de test généré le " + new Date().toISOString() + "\nSELECT 'test' AS test_column;",
    modificationsSummary: {
      updates: 0,
      inserts: 1,
      deletes: 0,
      total_options: 1
    }
  };

  try {
    const response = await fetch('/api/workflow-scripts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data:', data);

    if (data.success) {
      console.log('✅ Test 1 RÉUSSI - Script créé avec ID:', data.script.id);
      return data.script.id;
    } else {
      console.error('❌ Test 1 ÉCHOUÉ:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Test 1 ERREUR RÉSEAU:', error);
    return null;
  }
}

// Test 2: GET - Récupérer les scripts
async function testGetScripts(productId) {
  console.log('🧪 Test 2: Récupération scripts pour productId:', productId);

  try {
    const response = await fetch(`/api/workflow-scripts/${productId}`);
    const data = await response.json();

    console.log('Response data:', data);

    if (data.success) {
      console.log('✅ Test 2 RÉUSSI - Scripts trouvés:', data.scripts.length);
      return data.scripts;
    } else {
      console.error('❌ Test 2 ÉCHOUÉ:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Test 2 ERREUR RÉSEAU:', error);
    return [];
  }
}

// Test complet
async function runAllTests() {
  console.log('🚀 Démarrage tests API workflow-scripts');

  // Test création
  const scriptId = await testCreateScript();

  if (scriptId) {
    // Test récupération
    await testGetScripts(123);
  }

  console.log('🏁 Tests terminés');
}

// Instructions d'utilisation
console.log(`
===================================================================
INSTRUCTIONS POUR TESTER L'API :

1. Ouvrir la console du navigateur sur la page workflow-edit
2. Copier-coller ce script complet
3. Exécuter : runAllTests()
4. Vérifier les logs pour voir où ça échoue

Alternative pour test simple :
testCreateScript().then(id => console.log('Script ID:', id));
===================================================================
`);

// Export pour utilisation
window.testWorkflowAPI = {
  testCreateScript,
  testGetScripts,
  runAllTests
};