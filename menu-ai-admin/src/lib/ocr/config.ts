// src/lib/ocr/config.ts
// Configuration OCR suivant le pattern Supabase pour Vercel
export interface OCRConfig {
  defaultProvider: 'openai' | 'google' | 'azure' | 'auto';
  openai?: {
    apiKey: string;
    model: string;
  };
  google?: {
    apiKey: string;
    projectId: string;
  };
  azure?: {
    apiKey: string;
    endpoint: string;
  };
}

// Configuration OCR avec variables d'environnement Vercel
export const getOCRConfig = (): OCRConfig => {
  return {
    defaultProvider: (process.env.OCR_DEFAULT_PROVIDER as any) || 'auto',
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o'
    },
    google: {
      apiKey: process.env.GOOGLE_VISION_API_KEY || '',
      projectId: process.env.GOOGLE_VISION_PROJECT_ID || ''
    },
    azure: {
      apiKey: process.env.AZURE_COGNITIVE_API_KEY || '',
      endpoint: process.env.AZURE_COGNITIVE_ENDPOINT || ''
    }
  };
};

// Export des variables pour faciliter l'utilisation (pattern Vercel)
export const OCR_CONFIG = getOCRConfig();