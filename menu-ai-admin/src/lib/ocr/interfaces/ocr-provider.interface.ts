// src/lib/ocr/interfaces/ocr-provider.interface.ts
export interface OCRProvider {
  name: string;
  isConfigured(): boolean;
  extractText(image: Buffer): Promise<OCRResult>;
  getSupportedFormats(): string[];
  getMaxFileSize(): number;
  getCostEstimate?(imageSize: number): number;
}

export interface OCRResult {
  success: boolean;
  text?: string;
  confidence: number;
  products?: ExtractedProduct[];
  processingTime: number;
  provider: string;
  error?: string;
}

export interface ExtractedProduct {
  name: string;
  description?: string;
  price_onsite?: number;
  price_delivery?: number;
  position?: { x: number; y: number };
  confidence: number;
}