// ========================================
// CHARGEUR D'ENVIRONNEMENT AUTOMATIQUE
// ========================================

/**
 * Charge automatiquement le bon fichier .env selon APP_ENV
 * Usage : import './load-env.ts' en premier dans index.ts
 */

async function loadEnvironment() {
  // Récupérer l'environnement demandé (par défaut: dev)
  const appEnv = Deno.env.get('APP_ENV') || 'dev';

  console.log(`🔧 [ENV] Chargement environnement: ${appEnv}`);

  // Charger le fichier .env correspondant
  const envFile = `.env.${appEnv}`;

  try {
    // Lire le fichier .env spécifique
    const envContent = await Deno.readTextFile(envFile);

    // Parser et appliquer les variables
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();

      // Ignorer les commentaires et lignes vides
      if (trimmed.startsWith('#') || !trimmed || !trimmed.includes('=')) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('='); // Rejoindre au cas où la valeur contient des =

      // Définir la variable d'environnement
      Deno.env.set(key.trim(), value.trim());
    }

    console.log(`✅ [ENV] Environnement ${appEnv} chargé depuis ${envFile}`);
    console.log(`📡 [ENV] Supabase: ${Deno.env.get('SUPABASE_URL')?.substring(0, 30)}...`);
    console.log(`📱 [ENV] Green API: ${Deno.env.get('GREEN_API_URL')?.substring(0, 40)}...`);

  } catch (error) {
    console.error(`❌ [ENV] Impossible de charger ${envFile}:`, error);
    console.log(`💡 [ENV] Fallback vers .env.local`);

    // Fallback vers .env.local
    try {
      const envContent = await Deno.readTextFile('.env.local');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed || !trimmed.includes('=')) {
          continue;
        }
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        Deno.env.set(key.trim(), value.trim());
      }
      console.log('✅ [ENV] Fallback .env.local chargé');
    } catch {
      console.error('❌ [ENV] Aucun fichier d\'environnement trouvé');
    }
  }
}

// Auto-exécution au chargement du module
await loadEnvironment();