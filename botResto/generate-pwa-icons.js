/**
 * Script de génération des icônes PWA
 *
 * Installation requise :
 * npm install sharp --save-dev
 *
 * Utilisation :
 * node generate-pwa-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_IMAGE = path.join(__dirname, 'src', 'assets', 'images', 'botlogo.png');
const OUTPUT_DIR = path.join(__dirname, 'src', 'assets', 'icon');

// Tailles des icônes PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎨 Génération des icônes PWA...\n');
console.log(`📁 Source : ${SOURCE_IMAGE}`);
console.log(`📂 Destination : ${OUTPUT_DIR}\n`);

// Vérifier que l'image source existe
if (!fs.existsSync(SOURCE_IMAGE)) {
  console.error('❌ Erreur : Le fichier source n\'existe pas !');
  console.error(`   Fichier attendu : ${SOURCE_IMAGE}`);
  process.exit(1);
}

// Générer toutes les icônes
const promises = ICON_SIZES.map(size => {
  const outputFile = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

  return sharp(SOURCE_IMAGE)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(outputFile)
    .then(() => {
      console.log(`✅ Icône ${size}x${size} générée : ${path.basename(outputFile)}`);
    })
    .catch(err => {
      console.error(`❌ Erreur pour ${size}x${size} :`, err.message);
    });
});

// Attendre que toutes les icônes soient générées
Promise.all(promises)
  .then(() => {
    console.log('\n🎉 Toutes les icônes PWA ont été générées avec succès !');
    console.log(`\n📋 Prochaine étape : Ajouter le manifest dans index.html`);
  })
  .catch(err => {
    console.error('\n❌ Erreur lors de la génération :', err);
    process.exit(1);
  });
