// src/lib/ocr/config.ts
// Configuration OCR simplifiée - OpenAI uniquement
export interface OCRConfig {
  defaultProvider: 'openai';
  openai: {
    apiKey: string;
    model: string;
  };
}

// Configuration OCR avec variables d'environnement Vercel
export const getOCRConfig = (): OCRConfig => {
  return {
    defaultProvider: 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o'
    }
  };
};

// Export des variables pour faciliter l'utilisation (pattern Vercel)
export const OCR_CONFIG = getOCRConfig();