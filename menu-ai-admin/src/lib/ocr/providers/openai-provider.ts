// src/lib/ocr/providers/openai-provider.ts
import { OCRProvider, OCRResult, ExtractedProduct } from '../interfaces/ocr-provider.interface';

export class OpenAIProvider implements OCRProvider {
  name = 'OpenAI Vision';

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async extractText(image: Buffer): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      const base64Image = image.toString('base64');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o',
          messages: [{
            role: "user",
            content: [
              { type: "text", text: this.getPrompt() },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high"
                }
              }
            ]
          }],
          max_tokens: 3000,
          temperature: 0
        })
      });

      const processingTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          confidence: 0,
          processingTime,
          provider: this.name,
          error: `HTTP ${response.status}: ${await response.text()}`
        };
      }

      const data = await response.json();
      return this.parseResponse(data, processingTime);

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
    return ['jpg', 'jpeg', 'png', 'webp'];
  }

  getMaxFileSize(): number {
    return 10 * 1024 * 1024; // 10MB
  }

  getCostEstimate(imageSize: number): number {
    return 0.01; // ~1 centime par image
  }

  private getPrompt(): string {
    return `
    Analyse cette image de menu restaurant avec GRANDE ATTENTION et extrais TOUTES les informations.

    INSTRUCTIONS CRITIQUES:
    1. COMPTE d'abord le nombre EXACT de produits visibles sur l'image
    2. Extrais TOUS les produits - vérifie 2 FOIS pour n'en manquer AUCUN
    3. Pour les prix, regarde ATTENTIVEMENT:
       - Prix SUR PLACE (généralement à gauche ou en haut)
       - Prix LIVRAISON (généralement à droite ou en bas)
       - Les prix livraison sont souvent = prix sur place + 1€
    4. Si l'image a plusieurs colonnes ou rangées, traite CHAQUE colonne/rangée
    5. Inclus TOUS les produits même ceux avec des noms courts comme "180", "270", etc.

    Format JSON requis:
    {
      "menu_title": "titre exact du menu",
      "menu_info": "informations sur le service (ex: servis avec frites & boisson)",
      "total_products_detected": nombre_total_de_produits_vus,
      "products": [
        {
          "name": "nom exact du produit",
          "description": "description complète avec tous les ingrédients",
          "price_onsite": nombre_exact_en_euros,
          "price_delivery": nombre_exact_en_euros,
          "currency": "€",
          "position": "rangée_1" ou "rangée_2" si applicable
        }
      ]
    }

    Retourne UNIQUEMENT le JSON, sans aucun texte avant ou après.
    `;
  }

  private parseResponse(response: any, processingTime: number): OCRResult {
    try {
      const content = response.choices?.[0]?.message?.content?.trim();

      if (!content) {
        return {
          success: false,
          confidence: 0,
          processingTime,
          provider: this.name,
          error: 'No content in response'
        };
      }

      // Nettoyer le JSON si nécessaire
      let cleanContent = content;
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }

      const parsedContent = JSON.parse(cleanContent);

      // Convertir les produits au format ExtractedProduct
      const products: ExtractedProduct[] = (parsedContent.products || []).map((product: any) => ({
        name: product.name || '',
        description: product.description || '',
        price_onsite: product.price_onsite || 0,
        price_delivery: product.price_delivery || 0,
        position: product.position ? { x: 0, y: 0 } : undefined,
        confidence: 90 // Estimation pour OpenAI
      }));

      return {
        success: true,
        text: parsedContent.menu_title || '',
        confidence: 90, // Estimation basée sur les tests
        products,
        processingTime,
        provider: this.name
      };

    } catch (error) {
      return {
        success: false,
        confidence: 0,
        processingTime,
        provider: this.name,
        error: `JSON Parse Error: ${error instanceof Error ? error.message : 'Unknown parsing error'}`
      };
    }
  }
}