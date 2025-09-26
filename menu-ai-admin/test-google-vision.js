// test-google-vision.js - Script de test rapide pour Google Vision
const fs = require('fs');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

async function testGoogleVision() {
  console.log('🚀 Test Google Vision OCR...\n');

  try {
    // Configuration
    const client = new ImageAnnotatorClient({
      projectId: 'menu-audit-ocr',
      keyFilename: './config/google-service-account.json'
    });

    console.log('✅ Client Google Vision initialisé');

    // Charger l'image de test
    const imagePath = 'C:\\Users\\diall\\Documents\\BOT-RESTO\\BOT-UNIVERSEL\\IMAGES\\pn1.png';

    if (!fs.existsSync(imagePath)) {
      console.log('❌ Image de test introuvable:', imagePath);
      return;
    }

    console.log('📸 Image chargée:', imagePath);

    // Test de détection de texte
    const startTime = Date.now();
    const [result] = await client.textDetection(imagePath);
    const processingTime = Date.now() - startTime;

    console.log('⏱️ Temps de traitement:', processingTime + 'ms');

    if (!result.textAnnotations || result.textAnnotations.length === 0) {
      console.log('❌ Aucun texte détecté');
      return;
    }

    // Afficher le texte complet détecté
    const fullText = result.textAnnotations[0].description;
    console.log('📝 TEXTE COMPLET DÉTECTÉ:');
    console.log('=' + '='.repeat(50));
    console.log(fullText);
    console.log('=' + '='.repeat(50));

    // Analyser la structure
    const lines = fullText.split('\n').filter(line => line.trim());
    console.log(`\n📊 ANALYSE: ${lines.length} lignes détectées`);

    // Détecter les produits potentiels
    let productCount = 0;
    let priceCount = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Détecter les noms de produits (majuscules, patterns spécifiques)
      if (/^[A-Z][A-Z\s\d]+$/.test(trimmedLine) ||
          /^(LE|LA|LES)\s+[A-Z]/.test(trimmedLine) ||
          /^\d+$/.test(trimmedLine) ||
          /BURGER|CHEESE|BACON|FISH|CHICKEN/.test(trimmedLine)) {
        console.log(`🍔 Produit potentiel [${index}]: "${trimmedLine}"`);
        productCount++;
      }

      // Détecter les prix
      if (/\d+[,.]?\d*\s*[€EUR]|\d+[,.]?\d*\s*euro/i.test(trimmedLine)) {
        console.log(`💰 Prix détecté [${index}]: "${trimmedLine}"`);
        priceCount++;
      }
    });

    console.log(`\n📈 RÉSUMÉ:`);
    console.log(`   - Lignes totales: ${lines.length}`);
    console.log(`   - Produits potentiels: ${productCount}`);
    console.log(`   - Prix détectés: ${priceCount}`);
    console.log(`   - Temps de traitement: ${processingTime}ms`);
    console.log(`   - Coût estimé: ~0.15 centime`);

    console.log('\n✅ Test Google Vision réussi !');

  } catch (error) {
    console.log('\n❌ ERREUR lors du test:', error.message);

    if (error.code === 'ENOENT') {
      console.log('💡 Vérifiez que le fichier de clé existe:');
      console.log('   ./config/google-service-account.json');
    }

    if (error.message.includes('UNAUTHENTICATED')) {
      console.log('💡 Problème d\'authentification:');
      console.log('   - Vérifiez le fichier de clé JSON');
      console.log('   - Vérifiez le project ID');
    }

    if (error.message.includes('PERMISSION_DENIED')) {
      console.log('💡 Permissions insuffisantes:');
      console.log('   - Vérifiez que Vision API est activée');
      console.log('   - Vérifiez les rôles du service account');
    }
  }
}

// Lancer le test
testGoogleVision();