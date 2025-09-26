// test-google-vision-separate.js - Script de test SÉPARÉ pour Google Vision
// Ce script ne fait pas partie du projet principal - TESTS UNIQUEMENT

const fs = require('fs');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

async function testGoogleVisionSeparate() {
  console.log('🚀 Test Google Vision OCR SÉPARÉ (hors projet principal)...\n');

  try {
    // Configuration
    const client = new ImageAnnotatorClient({
      projectId: 'menu-audit-ocr',
      keyFilename: './config/google-service-account.json'
    });

    console.log('✅ Client Google Vision initialisé');

    // Image de test burger
    const imagePath = 'C:\\Users\\diall\\Documents\\BOT-RESTO\\BOT-UNIVERSEL\\IMAGES\\pn1.png';

    if (!fs.existsSync(imagePath)) {
      console.log('❌ Image de test introuvable:', imagePath);
      return;
    }

    console.log('📸 Image chargée:', imagePath);

    // Test détection texte
    const startTime = Date.now();
    const [result] = await client.textDetection(imagePath);
    const processingTime = Date.now() - startTime;

    console.log('⏱️ Temps de traitement:', processingTime + 'ms');

    if (!result.textAnnotations || result.textAnnotations.length === 0) {
      console.log('❌ Aucun texte détecté');
      return;
    }

    // Texte complet détecté
    const fullText = result.textAnnotations[0].description;
    console.log('📝 TEXTE COMPLET GOOGLE VISION:');
    console.log('=' + '='.repeat(60));
    console.log(fullText);
    console.log('=' + '='.repeat(60));

    // COMPARAISON : Appel OpenAI GPT-4o pour comparaison
    console.log('\n🆚 COMPARAISON AVEC OPENAI GPT-4o...\n');

    await compareWithOpenAI(imagePath);

    console.log('\n✅ Test de comparaison Google Vision vs OpenAI terminé !');

  } catch (error) {
    console.log('\n❌ ERREUR lors du test Google Vision:', error.message);

    if (error.code === 'ENOENT') {
      console.log('💡 Vérifiez le fichier de clé: ./config/google-service-account.json');
    }
    if (error.message.includes('UNAUTHENTICATED')) {
      console.log('💡 Problème d\'authentification - vérifiez project ID et clé JSON');
    }
    if (error.message.includes('PERMISSION_DENIED')) {
      console.log('💡 Vision API non activée ou permissions insuffisantes');
    }
  }
}

async function compareWithOpenAI(imagePath) {
  try {
    // Vérifier la clé OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ OPENAI_API_KEY manquante - Comparaison OpenAI ignorée');
      console.log('💡 Définissez OPENAI_API_KEY pour activer la comparaison');
      return;
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Lire l'image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse cette image de menu burger et extrait les informations des produits en JSON structuré.

              Format demandé :
              {
                "products": [
                  {
                    "name": "nom du produit",
                    "description": "composition détaillée",
                    "price_onsite": prix_sur_place,
                    "price_delivery": prix_livraison
                  }
                ]
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500
    });

    const processingTime = Date.now() - startTime;
    console.log('⏱️ OpenAI temps de traitement:', processingTime + 'ms');

    const content = response.choices[0].message.content;
    console.log('📝 RÉSULTAT OPENAI GPT-4o:');
    console.log('=' + '='.repeat(60));
    console.log(content);
    console.log('=' + '='.repeat(60));

    // Essayer de parser le JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('\n🎯 PRODUITS STRUCTURÉS OPENAI:');
        console.log(JSON.stringify(parsed, null, 2));

        if (parsed.products) {
          console.log(`\n📊 OpenAI: ${parsed.products.length} produits détectés`);
        }
      }
    } catch (e) {
      console.log('⚠️ JSON OpenAI non parsable - format texte retourné');
    }

  } catch (error) {
    console.log('❌ Erreur OpenAI:', error.message);
  }
}

// Lancer le test de comparaison
testGoogleVisionSeparate();