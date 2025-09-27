// src/lib/ocr/ocr-service.ts
import { OCRProvider, OCRResult } from './interfaces/ocr-provider.interface';
import { OpenAIProvider } from './providers/openai-provider';
// Google Vision provider supprimé - tests séparés uniquement

export class OCRService {
  private providers: Map<string, OCRProvider> = new Map();
  private defaultProvider: string;

  constructor() {
    this.registerProviders();
    this.defaultProvider = this.detectBestProvider();
  }

  private registerProviders() {
    this.providers.set('openai', new OpenAIProvider());
    // Google Vision supprimé - tests séparés dans script dédié
    // this.providers.set('azure', new AzureCognitiveProvider()); // Future
  }

  private detectBestProvider(): string {
    // OpenAI uniquement - simplicité et fiabilité
    if (this.providers.get('openai')?.isConfigured()) return 'openai';
    // if (this.providers.get('azure')?.isConfigured()) return 'azure';

    throw new Error('Aucun provider OCR configuré. Veuillez configurer au moins une API.');
  }

  async extractMenu(
    image: Buffer,
    options?: {
      provider?: string;
    }
  ): Promise<OCRResult> {
    const providerName = options?.provider || this.defaultProvider;
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    if (!provider.isConfigured()) {
      throw new Error(`Provider ${providerName} is not properly configured`);
    }

    return await provider.extractText(image);
  }

  getAvailableProviders(): Array<{
    key: string;
    name: string;
    configured: boolean;
    cost: number;
    maxFileSize: number;
    formats: string[];
  }> {
    return Array.from(this.providers.entries()).map(([key, provider]) => ({
      key,
      name: provider.name,
      configured: provider.isConfigured(),
      cost: provider.getCostEstimate?.(1024 * 1024) || 0, // Coût pour 1MB
      maxFileSize: provider.getMaxFileSize(),
      formats: provider.getSupportedFormats()
    }));
  }

  getDefaultProvider(): string {
    return this.defaultProvider;
  }

  isAnyProviderConfigured(): boolean {
    return Array.from(this.providers.values()).some(provider => provider.isConfigured());
  }
}