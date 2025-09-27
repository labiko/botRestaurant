# 🚀 **PLAN OCR ONBOARDING - ARCHITECTURE API MODULAIRE**

## 🔧 **ARCHITECTURE API FLEXIBLE - PROVIDER PATTERN**

### **Structure modulaire pour changement d'API facile :**

```
src/lib/ocr/
├── providers/
│   ├── openai-provider.ts              # Provider OpenAI (actuel)
│   ├── google-vision-provider.ts       # Provider Google Vision API
│   └── azure-cognitive-provider.ts     # Provider Azure Cognitive Services
├── interfaces/
│   └── ocr-provider.interface.ts       # Interface commune
├── ocr-service.ts                      # Service principal (facade)
└── config.ts                          # Configuration providers
```

## 📋 **INTERFACE COMMUNE POUR TOUS LES PROVIDERS**

```typescript
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
```

## 🔌 **PROVIDERS IMPLÉMENTÉS**

### **1. OpenAI Provider (Actuel)**
```typescript
// src/lib/ocr/providers/openai-provider.ts
export class OpenAIProvider implements OCRProvider {
  name = 'OpenAI Vision';

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async extractText(image: Buffer): Promise<OCRResult> {
    const base64Image = image.toString('base64');

    const response = await openai.chat.completions.create({
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
    });

    return this.parseResponse(response);
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

  private parseResponse(response: any): OCRResult {
    // Logique de parsing de la réponse OpenAI
    // ...
  }
}
```

### **2. Google Vision Provider**
```typescript
// src/lib/ocr/providers/google-vision-provider.ts
export class GoogleVisionProvider implements OCRProvider {
  name = 'Google Vision API';

  isConfigured(): boolean {
    return !!process.env.GOOGLE_VISION_API_KEY;
  }

  async extractText(image: Buffer): Promise<OCRResult> {
    // Implémentation Google Vision API
    const [result] = await this.visionClient.textDetection({
      image: { content: image.toString('base64') }
    });

    const rawText = result.fullTextAnnotation?.text || '';

    // Post-processing avec intelligence pour structurer
    const products = await this.structureTextWithAI(rawText);

    return {
      success: true,
      text: rawText,
      products,
      confidence: 85,
      provider: 'google-vision',
      processingTime: Date.now()
    };
  }

  getSupportedFormats(): string[] {
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf'];
  }

  getMaxFileSize(): number {
    return 20 * 1024 * 1024; // 20MB
  }

  getCostEstimate(imageSize: number): number {
    return 0.005; // Moins cher que OpenAI
  }

  private async structureTextWithAI(rawText: string): Promise<ExtractedProduct[]> {
    // Post-processing intelligent pour extraire les produits du texte brut
    // Peut utiliser des règles métier ou un LLM léger
  }
}
```

### **3. Azure Cognitive Provider**
```typescript
// src/lib/ocr/providers/azure-cognitive-provider.ts
export class AzureCognitiveProvider implements OCRProvider {
  name = 'Azure Cognitive Services';

  isConfigured(): boolean {
    return !!(process.env.AZURE_COGNITIVE_API_KEY && process.env.AZURE_COGNITIVE_ENDPOINT);
  }

  async extractText(image: Buffer): Promise<OCRResult> {
    // Implémentation Azure Cognitive Services Read API
    // Similaire à Google Vision avec post-processing intelligent
  }

  getCostEstimate(imageSize: number): number {
    return 0.003; // Le moins cher
  }
}
```

## ⚙️ **SERVICE PRINCIPAL (FACADE)**

```typescript
// src/lib/ocr/ocr-service.ts
export class OCRService {
  private providers: Map<string, OCRProvider> = new Map();
  private defaultProvider: string;

  constructor() {
    this.registerProviders();
    this.defaultProvider = this.detectBestProvider();
  }

  private registerProviders() {
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('google', new GoogleVisionProvider());
    this.providers.set('azure', new AzureCognitiveProvider());
  }

  private detectBestProvider(): string {
    // Logique de sélection automatique selon la configuration
    if (this.providers.get('openai')?.isConfigured()) return 'openai';
    if (this.providers.get('google')?.isConfigured()) return 'google';
    if (this.providers.get('azure')?.isConfigured()) return 'azure';

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
```

## 🎛️ **CONFIGURATION SIMPLE**

### **Variables d'environnement :**
```env
# .env.local
# Provider par défaut (auto-détecté si non spécifié)
OCR_DEFAULT_PROVIDER=openai

# OpenAI (actuel)
OPENAI_API_KEY=sk-proj-VlH77DulL...
OPENAI_MODEL=gpt-4o

# Google Vision API (optionnel)
GOOGLE_VISION_API_KEY=your-google-api-key
GOOGLE_VISION_PROJECT_ID=your-project-id

# Azure Cognitive Services (optionnel)
AZURE_COGNITIVE_API_KEY=your-azure-key
AZURE_COGNITIVE_ENDPOINT=https://your-region.api.cognitive.microsoft.com
```

### **Interface utilisateur pour changer de provider :**
```typescript
// Composant Settings dans l'interface OCR
const OCRProviderSelector = () => {
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [availableProviders, setAvailableProviders] = useState([]);

  useEffect(() => {
    // Charger les providers disponibles
    fetch('/api/ocr/providers')
      .then(res => res.json())
      .then(data => setAvailableProviders(data.providers));
  }, []);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        Moteur OCR :
      </label>
      <select
        value={selectedProvider}
        onChange={(e) => setSelectedProvider(e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      >
        <option value="auto">🤖 Auto (Meilleur disponible)</option>
        {availableProviders
          .filter(p => p.configured)
          .map(provider => (
            <option key={provider.key} value={provider.key}>
              {provider.name} (~{provider.cost}€/image)
            </option>
          ))
        }
      </select>

      <div className="mt-2 text-xs text-gray-600">
        Providers configurés : {availableProviders.filter(p => p.configured).length}/{availableProviders.length}
      </div>

      {availableProviders.filter(p => !p.configured).length > 0 && (
        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
          <p className="font-medium text-yellow-800">Providers non configurés :</p>
          <ul className="text-yellow-700">
            {availableProviders
              .filter(p => !p.configured)
              .map(provider => (
                <li key={provider.key}>• {provider.name}</li>
              ))
            }
          </ul>
        </div>
      )}
    </div>
  );
};
```

## 📡 **API ENDPOINTS**

### **Extraction OCR :**
```typescript
// /api/ocr/extract
import { OCRService } from '@/lib/ocr/ocr-service';

const ocrService = new OCRService();

export async function POST(request: Request) {
  try {
    // Vérifier qu'au moins un provider est configuré
    if (!ocrService.isAnyProviderConfigured()) {
      return Response.json({
        success: false,
        error: 'Aucun provider OCR configuré'
      }, { status: 500 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const provider = formData.get('provider') as string;

    const imageBuffer = Buffer.from(await image.arrayBuffer());

    const result = await ocrService.extractMenu(imageBuffer, {
      provider: provider || undefined
    });

    return Response.json({
      success: true,
      ...result
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

### **Liste des providers :**
```typescript
// /api/ocr/providers
import { OCRService } from '@/lib/ocr/ocr-service';

export async function GET() {
  const ocrService = new OCRService();

  return Response.json({
    providers: ocrService.getAvailableProviders(),
    default: ocrService.getDefaultProvider()
  });
}
```

## 🏗️ **NOUVELLE NAVIGATION - 4 WORKFLOWS PARALLÈLES**

```
Menu AI Admin
├── 🏠 Dashboard
├── 🏪 Back-office Restaurant (existant)
├── 🔄 Duplication Restaurant (existant)
├── ⚙️ Workflow Universel (existant)
└── 🆕 **OCR Smart Onboarding** (NOUVEAU)
    ├── 📤 1. Upload & Extract
    ├── 🔧 2. Configure Workflows
    ├── 📊 3. Review & Edit
    ├── 🔍 4. SQL Preview
    └── 🚀 5. Deploy Restaurant
```

## 🎯 **WORKFLOW OCR COMPLET - 5 ÉTAPES**

### **ÉTAPE 1 : Upload & Extract** (`/ocr-onboarding/upload`)
```typescript
- Sélection du provider OCR (OpenAI/Google/Azure)
- Upload d'image (drag & drop)
- Extraction OCR + Vision AI
- Détection automatique des produits
- Classification : simple/composite/modular
- Confidence score par produit
```

### **ÉTAPE 2 : Configure Workflows** (`/ocr-onboarding/configure`)
```typescript
// Réutilisation de l'interface workflow-universal

Pour chaque produit détecté "composite" :
├── Configuration steps (obligatoires/optionnels)
├── Gestion option_groups (groupes prédéfinis)
├── Prix modifiers par option
├── Emojis et display_order
├── Templates pré-configurés (pizza, burger, formule)
└── Preview workflow bot en temps réel
```

### **ÉTAPE 3 : Review & Edit** (`/ocr-onboarding/review`)
```typescript
- Vue d'ensemble de tous les produits
- Correction des prix OCR
- Ajout d'icônes catégories/produits
- Validation finale des workflows
```

### **ÉTAPE 4 : SQL Preview** (`/ocr-onboarding/preview`)
```typescript
- SQL généré complet (restaurant + catégories + produits + options)
- Preview du restaurant final
- Simulation bot pour chaque produit composite
```

### **ÉTAPE 5 : Deploy** (`/ocr-onboarding/deploy`)
```typescript
- Exécution transactionnelle
- Logging détaillé
- Confirmation de création
```

## 🚀 **AVANTAGES DE CETTE ARCHITECTURE**

### **✅ Flexibilité maximale**
- **Changement de provider** sans modification de code
- **Sélection manuelle** ou automatique du provider
- **Ajout facile** de nouveaux providers

### **✅ Optimisation des coûts**
- **Comparaison automatique** des coûts par provider
- **Sélection intelligente** selon le budget
- **Transparence** sur les coûts par image

### **✅ Robustesse**
- **Validation** de la configuration des providers
- **Messages d'erreur** clairs si mal configuré
- **Interface adaptative** selon les providers disponibles

### **✅ Interface utilisateur simple**
```tsx
// Dans le composant upload
<OCRUploader
  onExtracted={(data) => console.log(data)}
  provider="auto" // ou "openai", "google", "azure"
  showProviderSelector={true}
/>
```

## 💡 **MIGRATION ET AJOUT DE PROVIDERS**

Pour **changer de provider** ou **ajouter un nouveau** :

1. **Ajouter la clé API** dans `.env.local`
2. **Créer le provider** selon l'interface `OCRProvider`
3. **L'enregistrer** dans `OCRService.registerProviders()`
4. **Utilisation automatique** !

**Exemple d'ajout d'un nouveau provider :**
```typescript
// src/lib/ocr/providers/claude-provider.ts
export class ClaudeProvider implements OCRProvider {
  name = 'Claude Vision';

  isConfigured(): boolean {
    return !!process.env.CLAUDE_API_KEY;
  }

  async extractText(image: Buffer): Promise<OCRResult> {
    // Implémentation Claude API
  }

  // ... autres méthodes
}

// Puis dans ocr-service.ts
this.providers.set('claude', new ClaudeProvider());
```

## 📋 **CHECKLIST DE DÉVELOPPEMENT**

### **Phase 1 - Infrastructure (2 jours)**
- [ ] Créer l'interface `OCRProvider`
- [ ] Implémenter `OpenAIProvider` (migration du code existant)
- [ ] Créer `OCRService` avec logique de sélection
- [ ] Créer API `/api/ocr/extract` et `/api/ocr/providers`

### **Phase 2 - Providers additionnels (2-3 jours)**
- [ ] Implémenter `GoogleVisionProvider`
- [ ] Implémenter `AzureCognitiveProvider`
- [ ] Tests comparatifs de précision

### **Phase 3 - Interface utilisateur (1-2 jours)**
- [ ] Composant `OCRProviderSelector`
- [ ] Intégration dans le workflow d'onboarding
- [ ] Tests utilisateur

### **Phase 4 - Documentation (1 jour)**
- [ ] Documentation des providers
- [ ] Guide de configuration
- [ ] Exemples d'utilisation

**Total estimé : 6-8 jours de développement**

Cette architecture garantit une **évolutivité maximale** avec un **effort minimal** pour changer ou ajouter des providers OCR, tout en maintenant une interface simple et des performances optimales !