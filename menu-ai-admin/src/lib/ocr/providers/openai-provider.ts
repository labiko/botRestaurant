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
    Tu es un expert en extraction de menus restaurant. Analyse cette image et extrais UNIQUEMENT ce qui est RÉELLEMENT visible.

    RÈGLES ABSOLUES - ZÉRO TOLÉRANCE:
    1. 🚫 NE JAMAIS INVENTER d'ingrédients non visibles
    2. 🚫 NE JAMAIS SUPPOSER ou extrapoler des informations
    3. 🚫 NE JAMAIS AJOUTER d'ingrédients "standard" (salade, tomates, etc.) si pas visibles
    4. ✅ EXTRAIRE uniquement le texte EXACTEMENT tel qu'écrit
    5. ✅ Si un ingrédient n'est pas lisible ou visible → NE PAS l'inclure

    MÉTHODE STRICTE:
    1. Lis ligne par ligne, produit par produit
    2. Pour chaque produit:
       - Nom: copie EXACTEMENT le nom visible
       - Description: copie UNIQUEMENT les ingrédients/composition visibles
       - Prix: lis les prix affichés (souvent 2 colonnes: sur place + livraison)
    3. Ne complète RIEN, n'imagine RIEN

    EXEMPLES DE BONNE EXTRACTION:
    ✅ Si visible: "CHEESEBURGER - Steak 45g, fromage"
    ✅ Si visible: "BIG CHEESE - 2 Steaks 45g, cheddar, salade, oignons"
    ❌ N'ajoute PAS: cornichons, sauce, pain si non mentionnés

    Format JSON strict:
    {
      "total_products_detected": nombre_exact_de_produits_vus,
      "products": [
        {
          "name": "nom_exact_visible",
          "description": "ingrédients_uniquement_visibles",
          "price_onsite": prix_sur_place_ou_null,
          "price_delivery": prix_livraison_ou_null
        }
      ]
    }

    IMPORTANT: Si information manquante → utilise null, n'invente pas !
    Retourne UNIQUEMENT le JSON valide.
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