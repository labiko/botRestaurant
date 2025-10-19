import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'botResto',
  webDir: 'www',

  // Configuration Keyboard - Résout le problème du clavier masquant les boutons
  plugins: {
    Keyboard: {
      resize: 'body',           // Redimensionne le body quand clavier apparaît
      resizeOnFullScreen: true  // Redimensionne même en plein écran
    }
  }
};

export default config;
