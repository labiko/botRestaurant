// src/lib/ocr/providers/google-vision-provider.ts
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { OCRProvider, OCRResult, ExtractedProduct } from '../interfaces/ocr-provider.interface';

export class GoogleVisionProvider implements OCRProvider {
  name = 'Google Cloud Vision';
  private client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient({
      // Utilise les variables d'environnement pour l'authentification
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
      // Ou utilisation de la clé API directement
      apiKey: process.env.GOOGLE_CLOUD_API_KEY
    });
  }

  isConfigured(): boolean {
    return !!(process.env.GOOGLE_CLOUD_API_KEY ||
             (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_KEY_FILE));
  }

  async extractText(image: Buffer): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // Détection du texte avec Google Vision
      const [result] = await this.client.textDetection(image);
      const processingTime = Date.now() - startTime;

      if (!result.textAnnotations || result.textAnnotations.length === 0) {
        return {
          success: false,
          confidence: 0,
          processingTime,
          provider: this.name,
          error: 'Aucun texte détecté dans l\'image'
        };
      }

      // Le premier élément contient tout le texte détecté
      const fullText = result.textAnnotations[0]?.description || '';

      // Parsing du texte en produits structurés
      const products = this.parseMenuText(fullText, result.textAnnotations.slice(1));

      return {
        success: true,
        text: fullText,
        confidence: 95, // Google Vision est très fiable
        products,
        processingTime,
        provider: this.name
      };

    } catch (error) {
      return {
        success: false,
        confidence: 0,
        processingTime: Date.now() - startTime,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getSupportedFormats(): string[] {
    return ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'pdf'];
  }

  getMaxFileSize(): number {
    return 20 * 1024 * 1024; // 20MB
  }

  getCostEstimate(imageSize: number): number {
    return 0.0015; // ~0.15 centime par image
  }

  private parseMenuText(fullText: string, textAnnotations: any[]): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];

    // Nettoyer et diviser le texte en lignes
    const lines = fullText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    let currentProduct: Partial<ExtractedProduct> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Détecter les noms de produits (généralement en majuscules ou avec des patterns spécifiques)
      if (this.isProductName(line)) {
        // Sauvegarder le produit précédent s'il existe
        if (currentProduct && currentProduct.name) {
          products.push(this.finalizeProduct(currentProduct));
        }

        // Créer un nouveau produit
        currentProduct = {
          name: line,
          description: '',
          price_onsite: 0,
          price_delivery: 0,
          confidence: 95
        };

        // Chercher la description sur les lignes suivantes
        let descriptionLines: string[] = [];
        let j = i + 1;

        while (j < lines.length && !this.isProductName(lines[j]) && !this.isPriceLine(lines[j])) {
          if (!this.isPriceLine(lines[j])) {
            descriptionLines.push(lines[j]);
          }
          j++;
        }

        currentProduct.description = descriptionLines.join(' ');

        // Chercher les prix
        const prices = this.extractPrices(lines.slice(i, Math.min(i + 5, lines.length)));
        if (prices.onsite > 0) {
          currentProduct.price_onsite = prices.onsite;
          currentProduct.price_delivery = prices.delivery || prices.onsite + 1; // +1€ par défaut
        }
      }
    }

    // Ajouter le dernier produit
    if (currentProduct && currentProduct.name) {
      products.push(this.finalizeProduct(currentProduct));
    }

    return products;
  }

  private isProductName(line: string): boolean {
    // Patterns pour détecter les noms de produits
    const productPatterns = [
      /^[A-Z][A-Z\s\d]+$/,  // Tout en majuscules
      /^(LE|LA|LES)\s+[A-Z]/,  // Commence par LE/LA/LES
      /^\d+$/,  // Juste des chiffres (comme "180", "270")
      /^[A-Z]+BURGER/,  // Se termine par BURGER
      /^BIG\s/,  // Commence par BIG
      /^DOUBLE\s/  // Commence par DOUBLE
    ];

    return productPatterns.some(pattern => pattern.test(line.trim()));
  }

  private isPriceLine(line: string): boolean {
    // Détecter les lignes contenant des prix
    return /\d+[,.]?\d*\s*[€EUR]|\d+[,.]?\d*\s*euro/i.test(line);
  }

  private extractPrices(lines: string[]): { onsite: number; delivery?: number } {
    const prices = { onsite: 0, delivery: undefined as number | undefined };

    for (const line of lines) {
      const priceMatches = line.match(/(\d+[,.]?\d*)/g);
      if (priceMatches) {
        const numericPrices = priceMatches.map(p => parseFloat(p.replace(',', '.')));

        if (numericPrices.length === 1) {
          prices.onsite = numericPrices[0];
        } else if (numericPrices.length >= 2) {
          // Premier prix = sur place, deuxième = livraison
          prices.onsite = numericPrices[0];
          prices.delivery = numericPrices[1];
        }
      }
    }

    return prices;
  }

  private finalizeProduct(product: Partial<ExtractedProduct>): ExtractedProduct {
    return {
      name: product.name || '',
      description: product.description || '',
      price_onsite: product.price_onsite || 0,
      price_delivery: product.price_delivery || (product.price_onsite || 0) + 1,
      confidence: product.confidence || 95
    };
  }
}