// Script à copier-coller dans la console du navigateur pour vérifier l'état

// Vérifier si l'impression automatique est activée
const autoPrintStatus = localStorage.getItem('autoPrintEnabled');
console.log('🖨️ ÉTAT IMPRESSION AUTOMATIQUE');
console.log('================================');
console.log('Status dans localStorage:', autoPrintStatus);
console.log('Impression automatique:', autoPrintStatus === 'true' ? '✅ ACTIVÉE' : '❌ DÉSACTIVÉE');

if (autoPrintStatus !== 'true') {
  console.log('\n⚠️ POUR ACTIVER:');
  console.log('1. Allez dans Paramètres → Restaurant');
  console.log('2. Activez le toggle "Impression Automatique"');
  console.log('3. Confirmez une commande');
  console.log('4. Le ticket apparaîtra ici dans la console');
} else {
  console.log('\n✅ Prêt pour l\'impression !');
  console.log('Confirmez une commande et le ticket s\'affichera ici.');
}

// Pour activer manuellement depuis la console (test rapide)
console.log('\n📝 Pour activer maintenant, exécutez:');
console.log("localStorage.setItem('autoPrintEnabled', 'true');");