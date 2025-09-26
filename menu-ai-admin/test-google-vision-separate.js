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

    // Image à analyser - peut être passée en paramètre ou définie par défaut
    const imagePath = process.argv[2] || 'C:\\Users\\diall\\Documents\\BOT-RESTO\\BOT-UNIVERSEL\\CATEGORIES\\BURGERS\\burgers.jpg';

    console.log('📁 Image sélectionnée:', imagePath);

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
    console.log('📝 Extraction du texte terminée');

    // Sauvegarder le résultat dans un fichier (même dossier que l'image source)
    const path = require('path');
    const imageDir = path.dirname(imagePath);
    const imageName = path.basename(imagePath, path.extname(imagePath));
    const outputPath = path.join(imageDir, `${imageName}_google_vision.txt`);
    const timestamp = new Date().toLocaleString('fr-FR');
    // Organiser le texte par produits
    const structuredText = organizeTextByProducts(fullText);

    const fileContent = `EXTRACTION GOOGLE VISION - ${timestamp}
=============================================================
TEMPS DE TRAITEMENT: ${processingTime}ms
IMAGE SOURCE: ${imagePath}
=============================================================

${structuredText}
`;

    fs.writeFileSync(outputPath, fileContent, 'utf8');
    console.log('💾 Résultat sauvegardé dans:', outputPath);

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

// Fonction pour organiser le texte par produits avec séparateurs
function organizeTextByProducts(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const products = [];
  let currentProduct = null;

  console.log('🔍 Organisation du texte par produits...');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ignorer les lignes de titre général et les mots-clés
    if (line.match(/^(NOS BURGERS|SERVIS AVEC|POTATOES|\+1€|SUR PLACE|LIVRAISON)$/i)) {
      continue;
    }

    // Améliorer la détection des noms de produits
    if (line.match(/^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s]{3,}$/) && !line.match(/^\d+€/) && !line.match(/^(SUR PLACE|LIVRAISON)$/)) {

      // Gérer les préfixes comme "DOUBLE" qui doivent être combinés avec la ligne suivante
      if (line === "DOUBLE" && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (nextLine && !nextLine.match(/^\d+€/) && !nextLine.match(/^(SUR PLACE|LIVRAISON)$/)) {
          // Combiner DOUBLE avec la ligne suivante
          const combinedName = `${line} ${nextLine}`;

          // Sauvegarder le produit précédent s'il existe
          if (currentProduct && currentProduct.name) {
            products.push(currentProduct);
          }

          currentProduct = {
            name: combinedName,
            composition: [],
            prix_sur_place: '',
            prix_livraison: '',
            autres_lignes: []
          };

          console.log(`📝 Nouveau produit combiné: ${combinedName}`);
          i++; // Ignorer la ligne suivante car elle a été combinée
          continue;
        }
      }

      // Ignorer les mots isolés qui sont probablement des préfixes ou des erreurs
      if (line.match(/^(DOUBLE|TRIPLE|GRANDE?|PETITE?|MENU)$/i)) {
        console.log(`⚠️ Préfixe isolé ignoré: ${line}`);
        continue;
      }

      // Sauvegarder le produit précédent s'il existe
      if (currentProduct && currentProduct.name) {
        products.push(currentProduct);
      }

      // Créer un nouveau produit
      currentProduct = {
        name: line,
        composition: [],
        prix_sur_place: '',
        prix_livraison: '',
        autres_lignes: []
      };

      console.log(`📝 Nouveau produit: ${line}`);
    }
    // Détecter les compositions (contient des virgules et pas de prix)
    else if (currentProduct && line.match(/[a-zA-Z].*,/) && !line.match(/\d+€/)) {
      currentProduct.composition.push(line);
      console.log(`   Composition: ${line}`);
    }
    // Détecter les prix
    else if (currentProduct && line.match(/\d+€/)) {
      // Simple heuristique : premier prix = sur place, deuxième = livraison
      if (!currentProduct.prix_sur_place) {
        currentProduct.prix_sur_place = line;
        console.log(`   Prix sur place: ${line}`);
      } else if (!currentProduct.prix_livraison) {
        currentProduct.prix_livraison = line;
        console.log(`   Prix livraison: ${line}`);
      }
    }
    // Autres lignes utiles
    else if (currentProduct) {
      currentProduct.autres_lignes.push(line);
    }
  }

  // Ajouter le dernier produit
  if (currentProduct && currentProduct.name) {
    products.push(currentProduct);
  }

  // Formater la sortie avec séparateurs
  let structured = '';

  products.forEach((product, index) => {
    structured += `${product.name}\n`;

    // Composition (nettoyer les virgules doubles)
    if (product.composition.length > 0) {
      const cleanComposition = product.composition.join(', ').replace(/,\s*,+/g, ',').replace(/,\s*$/, '');
      structured += `Composition: ${cleanComposition}\n`;
    }

    // Prix
    if (product.prix_sur_place) {
      structured += `Prix sur place: ${product.prix_sur_place}\n`;
    }
    if (product.prix_livraison) {
      structured += `Prix livraison: ${product.prix_livraison}\n`;
    }

    // Autres informations
    if (product.autres_lignes.length > 0) {
      structured += `Autres: ${product.autres_lignes.join(', ')}\n`;
    }

    // Séparateur entre les produits
    structured += '=============================================================\n';
  });

  console.log(`📊 ${products.length} produits organisés`);
  return structured;
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