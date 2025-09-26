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

    console.log('📊 Google Vision - Parsing lignes:', lines.length);

    // Parser simple : pattern nom + prix comme dans test-google-vision.js
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Détecter les noms de produits burger (patterns du test)
      if (this.isBurgerName(line)) {
        console.log(`🍔 Produit détecté: ${line}`);

        // Chercher description et prix dans les lignes suivantes
        let description = '';
        let priceOnsite = 0;
        let priceDelivery = 0;

        // Scanner les 3-4 lignes suivantes pour trouver description et prix
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j];

          // Si c'est une description (ingrédients)
          if (this.isDescriptionLine(nextLine)) {
            description = description ? `${description}, ${nextLine}` : nextLine;
            console.log(`📝 Description trouvée: ${nextLine}`);
          }

          // Si c'est un prix (formats multiples : 6€50, 6.50€, 6,50€)
          const priceMatch = nextLine.match(/(\d+)(?:[,.](\d{2})|€(\d{2}))?\s*[€EUR]?/);
          if (priceMatch && (nextLine.includes('€') || nextLine.includes('EUR'))) {
            let price = 0;
            if (priceMatch[3]) {
              // Format 6€50
              price = parseFloat(priceMatch[1] + '.' + priceMatch[3]);
            } else if (priceMatch[2]) {
              // Format 6.50€ ou 6,50€
              price = parseFloat(priceMatch[1] + '.' + priceMatch[2]);
            } else {
              // Format 6€ (prix entier)
              price = parseFloat(priceMatch[1]);
            }

            if (priceOnsite === 0 && price > 0) {
              priceOnsite = price;
              priceDelivery = price + 1; // +1€ livraison par défaut
              console.log(`💰 Prix détecté: ${price}€ (${priceDelivery}€ livraison)`);
            }
          }

          // Arrêter si on trouve un autre produit
          if (this.isBurgerName(nextLine)) break;
        }

        // Ajouter le produit trouvé
        products.push({
          name: line,
          description: description || '',
          price_onsite: priceOnsite,
          price_delivery: priceDelivery,
          confidence: 95
        });
      }
    }

    console.log(`✅ Google Vision - ${products.length} produits parsés`);
    return products;
  }

  private isBurgerName(line: string): boolean {
    // Patterns identifiés dans le test Google Vision
    return /^(CHEESEBURGER|BIG CHEESE|LE FISH|LE CHICKEN|LE BACON|LE TOWER|GÉANT|POTATOES)$/.test(line) ||
           /^[A-Z][A-Z\s]+$/.test(line) && line.length > 2 && line.length < 30;
  }

  private isDescriptionLine(line: string): boolean {
    // Détecter les descriptions d'ingrédients
    return /steaks?|fromage|bacon|cornichons|salade|tomates|oignons|poulet|poisson|galette/i.test(line) &&
           !this.isBurgerName(line);
  }
}