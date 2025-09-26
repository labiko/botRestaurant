'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileImage, CheckCircle, AlertTriangle, Copy, Play, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price_on_site: number;
  price_delivery: number;
  workflow_type?: string;
}

interface BotMessage {
  productName: string;
  description: string;
  price: number;
  commandNumber: number;
  missingDeliveryPrice?: boolean;
}

interface FlyerProduct {
  name: string;
  description: string;
  priceOnSite?: number;
  priceDelivery?: number;
}

interface Discrepancy {
  type: 'price_mismatch' | 'description_mismatch' | 'missing_in_bot' | 'missing_in_flyer';
  field: string;
  dbValue: any;
  comparedValue: any;
  message: string;
}

interface TripleComparison {
  productId: string;
  database: Product;
  botMessage?: BotMessage;
  flyerData?: FlyerProduct;
  discrepancies: Discrepancy[];
  suggestedFixes: string[];
  status: 'match' | 'mismatch' | 'missing';
}

interface Script {
  id: number;
  script_sql: string;
  command_source: string;
  ai_explanation: string;
  category_name: string;
  dev_status: string;
  prod_status: string;
  created_at: string;
}

export default function AuditBotFlyer() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);

  // Zone messages bot
  const [botMessages, setBotMessages] = useState<string>('');
  const [parsedBotProducts, setParsedBotProducts] = useState<BotMessage[]>([]);

  // Zone flyer upload
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [flyerProducts, setFlyerProducts] = useState<FlyerProduct[]>([]);

  // Résultats de comparaison
  const [comparisonResults, setComparisonResults] = useState<TripleComparison[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Scripts SQL intégrés
  const [scripts, setScripts] = useState<Script[]>([]);

  // Charger restaurants
  useEffect(() => {
    loadRestaurants();
    loadScriptsHistory();
  }, []);

  // Charger catégories quand restaurant sélectionné
  useEffect(() => {
    if (selectedRestaurant) {
      loadCategories(selectedRestaurant);
      setSelectedCategory('');
      setProducts([]);
      setComparisonResults([]);
    }
  }, [selectedRestaurant]);

  // Charger produits quand catégorie sélectionnée
  useEffect(() => {
    if (selectedRestaurant && selectedCategory) {
      loadProducts(selectedRestaurant, selectedCategory);
      setComparisonResults([]);
    }
  }, [selectedRestaurant, selectedCategory]);

  // Parser messages bot quand texte change
  useEffect(() => {
    if (botMessages.trim()) {
      const parsed = parseBotMessages(botMessages);
      setParsedBotProducts(parsed);
    } else {
      setParsedBotProducts([]);
    }
  }, [botMessages]);

  const loadRestaurants = async () => {
    try {
      const response = await fetch(`/api/get-restaurants`);
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error('Erreur chargement restaurants:', error);
      toast.error('Erreur lors du chargement des restaurants');
    }
  };

  const loadCategories = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/get-categories?restaurant_id=${restaurantId}`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const loadProducts = async (restaurantId: string, categoryId: string) => {
    try {
      const response = await fetch(`/api/get-products?restaurant_id=${restaurantId}&category_id=${categoryId}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      toast.error('Erreur lors du chargement des produits');
    }
  };

  const loadScriptsHistory = async () => {
    try {
      const response = await fetch('/api/scripts-history');
      const data = await response.json();
      if (data.success) {
        setScripts(data.scripts || []);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  const parseBotMessages = (messages: string): BotMessage[] => {
    const lines = messages.split('\n').map(line => line.trim()).filter(line => line);
    const products: BotMessage[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('EUR - Tapez')) {
        const priceMatch = line.match(/(\d+(?:\.\d+)?)\s*EUR/);
        const commandMatch = line.match(/Tapez (\d+)/);

        if (priceMatch && commandMatch) {
          const price = parseFloat(priceMatch[1]);
          const commandNumber = parseInt(commandMatch[1]);

          // Récupérer nom et description des lignes précédentes
          let productName = '';
          let description = '';

          if (i >= 2) {
            productName = lines[i-2].replace(/^[🍔🍕🥤🌮🍗🥪🍟]*\s*/, '').trim();
            description = lines[i-1].trim();
          }

          products.push({
            productName,
            description,
            price,
            commandNumber,
            missingDeliveryPrice: !line.toLowerCase().includes('livraison')
          });
        }
      }
    }

    return products;
  };

  const similarityScore = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const s2 = str2.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));

    return commonWords.length / Math.max(words1.length, words2.length);
  };

  const detectDiscrepancies = (dbProduct: Product, botMessage?: BotMessage, flyerData?: FlyerProduct): Discrepancy[] => {
    const discrepancies: Discrepancy[] = [];

    // Comparaison avec bot
    if (botMessage) {
      if (Math.abs(botMessage.price - dbProduct.price_on_site) > 0.01) {
        discrepancies.push({
          type: 'price_mismatch',
          field: 'price_on_site',
          dbValue: dbProduct.price_on_site,
          comparedValue: botMessage.price,
          message: `Prix différent dans le bot: ${botMessage.price}€ vs ${dbProduct.price_on_site}€ en base`
        });
      }

      if (botMessage.missingDeliveryPrice) {
        discrepancies.push({
          type: 'missing_in_bot',
          field: 'price_delivery',
          dbValue: dbProduct.price_delivery,
          comparedValue: null,
          message: 'Prix livraison manquant dans les messages du bot'
        });
      }
    } else {
      discrepancies.push({
        type: 'missing_in_bot',
        field: 'product',
        dbValue: dbProduct.name,
        comparedValue: null,
        message: 'Produit absent des messages du bot'
      });
    }

    // Comparaison avec flyer
    if (flyerData) {
      if (flyerData.priceOnSite && Math.abs(flyerData.priceOnSite - dbProduct.price_on_site) > 0.01) {
        discrepancies.push({
          type: 'price_mismatch',
          field: 'price_on_site_flyer',
          dbValue: dbProduct.price_on_site,
          comparedValue: flyerData.priceOnSite,
          message: `Prix sur place différent dans le flyer: ${flyerData.priceOnSite}€ vs ${dbProduct.price_on_site}€ en base`
        });
      }
    }

    return discrepancies;
  };

  const generateSQLFixes = (product: Product, discrepancies: Discrepancy[]): string[] => {
    const fixes: string[] = [];

    discrepancies.forEach(issue => {
      switch (issue.type) {
        case 'price_mismatch':
          if (issue.field === 'price_on_site') {
            fixes.push(`UPDATE france_products SET price_on_site = ${issue.comparedValue} WHERE id = '${product.id}';`);
          } else if (issue.field === 'price_delivery') {
            fixes.push(`UPDATE france_products SET price_delivery = ${issue.comparedValue} WHERE id = '${product.id}';`);
          }
          break;
        case 'description_mismatch':
          fixes.push(`UPDATE france_products SET description = '${issue.comparedValue}' WHERE id = '${product.id}';`);
          break;
        case 'missing_in_bot':
          fixes.push(`-- Produit manquant dans le bot : ${product.name}`);
          break;
      }
    });

    return fixes;
  };

  const performTripleComparison = (): TripleComparison[] => {
    return products.map(dbProduct => {
      const botMatch = parsedBotProducts.find(bot =>
        similarityScore(bot.productName, dbProduct.name) > 0.6
      );

      const flyerMatch = flyerProducts.find(flyer =>
        similarityScore(flyer.name, dbProduct.name) > 0.6
      );

      const discrepancies = detectDiscrepancies(dbProduct, botMatch, flyerMatch);
      const suggestedFixes = generateSQLFixes(dbProduct, discrepancies);

      return {
        productId: dbProduct.id,
        database: dbProduct,
        botMessage: botMatch,
        flyerData: flyerMatch,
        discrepancies,
        suggestedFixes,
        status: discrepancies.length > 0 ? 'mismatch' : 'match'
      };
    });
  };

  const analyzeComparison = async () => {
    if (!products.length) {
      toast.error('Veuillez sélectionner un restaurant et une catégorie');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Simuler analyse OCR des images uploadées
      if (uploadedImages.length > 0) {
        // Simulation - en production, utiliser l'OCR existant
        const mockFlyerProducts: FlyerProduct[] = products.map(p => ({
          name: p.name,
          description: p.description,
          priceOnSite: p.price_on_site + (Math.random() > 0.7 ? 0.5 : 0),
          priceDelivery: p.price_delivery
        }));
        setFlyerProducts(mockFlyerProducts);
      }

      // Effectuer la comparaison triple
      const results = performTripleComparison();
      setComparisonResults(results);

      // Générer et sauvegarder le script SQL si des corrections sont nécessaires
      const hasIssues = results.some(r => r.discrepancies.length > 0);
      if (hasIssues) {
        await generateAndSaveScript(results);
      }

    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAndSaveScript = async (results: TripleComparison[]) => {
    const allFixes = results
      .filter(result => result.suggestedFixes.length > 0)
      .flatMap(result => result.suggestedFixes);

    if (allFixes.length === 0) return;

    const restaurant = restaurants.find(r => r.id === selectedRestaurant);
    const category = categories.find(c => c.id === selectedCategory);

    const scriptSQL = `BEGIN;

-- Corrections automatiques pour ${restaurant?.name}
-- Catégorie: ${category?.name}
-- Audit Bot vs Flyer généré le: ${new Date().toLocaleString('fr-FR')}

${allFixes.join('\n')}

-- Vérification des modifications
SELECT p.name, p.price_delivery, p.price_on_site, p.description
FROM france_products p
WHERE p.restaurant_id = '${selectedRestaurant}'
  AND p.category_id = '${selectedCategory}';

COMMIT;`;

    try {
      const response = await fetch('/api/scripts-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_sql: scriptSQL,
          command_source: `audit-bot-flyer: ${restaurant?.name} - ${category?.name}`,
          ai_explanation: `Audit automatique Bot vs Flyer détectant ${results.filter(r => r.discrepancies.length > 0).length} produits avec des incohérences`,
          category_name: category?.name || 'Audit Bot vs Flyer'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Script SQL généré et sauvegardé');
        loadScriptsHistory();
      }
    } catch (error) {
      console.error('Erreur sauvegarde script:', error);
      toast.error('Erreur lors de la sauvegarde du script');
    }
  };

  const executeScript = async (scriptId: number, environment: 'DEV' | 'PROD') => {
    try {
      const response = await fetch('/api/execute-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId, environment })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Script exécuté avec succès en ${environment}`);
        loadScriptsHistory();
      } else {
        toast.error(`Erreur d'exécution: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur exécution script:', error);
      toast.error('Erreur lors de l\'exécution du script');
    }
  };

  const copyScript = async (script: string) => {
    try {
      await navigator.clipboard.writeText(script);
      toast.success('Script copié dans le presse-papiers');
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      toast.error('Seules les images sont acceptées');
    }

    setUploadedImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'match': return 'bg-green-100 text-green-800 border-green-200';
      case 'mismatch': return 'bg-red-100 text-red-800 border-red-200';
      case 'missing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'match': return <CheckCircle className="w-4 h-4" />;
      case 'mismatch': return <AlertTriangle className="w-4 h-4" />;
      case 'missing': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  const auditScripts = scripts.filter(s => s.command_source?.includes('audit-bot-flyer'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔍 Audit Bot vs Flyer</h1>
          <p className="text-gray-600">Vérification intelligente catégorie par catégorie avec triple comparaison automatique</p>
        </div>
      </div>

      {/* Section 1: Sélection Restaurant et Catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Sélection Restaurant et Catégorie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Restaurant</label>
              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map(restaurant => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Catégorie</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={!selectedRestaurant}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Zone Triple Comparaison */}
      {selectedCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Colonne 1: Base de Données */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Base de Données ({products.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map(product => (
                  <div key={product.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">🍔 {product.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="text-xs space-y-1">
                      <div>Prix sur place: <span className="font-medium">{product.price_on_site}€</span></div>
                      <div>Prix livraison: <span className="font-medium">{product.price_delivery}€</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Colonne 2: Messages Bot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 Messages Bot ({parsedBotProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  placeholder="Collez ici les messages du bot...&#10;&#10;Exemple:&#10;🍔 CHEESEBURGER&#10;STEAK 45G, FROMAGE, CORNICHONS&#10;5 EUR - Tapez 1"
                  value={botMessages}
                  onChange={(e) => setBotMessages(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg text-sm resize-none"
                />

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {parsedBotProducts.map((botProduct, index) => (
                    <div key={index} className="p-2 bg-blue-50 border rounded">
                      <div className="text-sm font-medium">{botProduct.productName}</div>
                      <div className="text-xs text-gray-600">{botProduct.description}</div>
                      <div className="text-xs">
                        {botProduct.price}€ - Cmd #{botProduct.commandNumber}
                        {botProduct.missingDeliveryPrice && (
                          <span className="text-red-500 ml-2">⚠️ Prix livraison manquant</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Colonne 3: Flyer OCR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📄 Flyer Analysé ({flyerProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="flyer-upload"
                  />
                  <label htmlFor="flyer-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Uploader flyers</p>
                  </label>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Flyer ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {flyerProducts.map((flyerProduct, index) => (
                    <div key={index} className="p-2 bg-orange-50 border rounded">
                      <div className="text-sm font-medium">{flyerProduct.name}</div>
                      <div className="text-xs">
                        {flyerProduct.priceOnSite}€ / {flyerProduct.priceDelivery}€
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bouton d'analyse */}
      {selectedCategory && (
        <div className="flex justify-center">
          <Button
            onClick={analyzeComparison}
            disabled={isAnalyzing || !products.length}
            className="px-8 py-2"
          >
            {isAnalyzing ? 'Analyse en cours...' : 'Analyser et Comparer'}
          </Button>
        </div>
      )}

      {/* Section 3: Résultats de Comparaison */}
      {comparisonResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Résultats de Comparaison
              <div className="flex gap-2 ml-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  ✅ Base ↔ Bot: {comparisonResults.filter(r => !r.discrepancies.some(d => d.message.includes('bot'))).length}/{comparisonResults.length}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  ✅ Base ↔ Flyer: {comparisonResults.filter(r => !r.discrepancies.some(d => d.message.includes('flyer'))).length}/{comparisonResults.length}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  🚨 {comparisonResults.filter(r => r.discrepancies.length > 0).length} corrections nécessaires
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparisonResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{result.database.name}</h4>
                      <p className="text-sm text-gray-600">{result.database.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${getStatusColor(result.status)}`}>
                      {getStatusIcon(result.status)}
                      {result.status === 'match' ? 'Conforme' : 'Incohérences'}
                    </span>
                  </div>

                  {result.discrepancies.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-red-700">Incohérences détectées:</h5>
                      <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                        {result.discrepancies.map((disc, i) => (
                          <li key={i}>{disc.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Système SQL Intégré */}
      {auditScripts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛠️ Scripts SQL Générés ({auditScripts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditScripts.map((script) => (
                <div key={script.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{script.command_source}</h4>
                      <p className="text-sm text-gray-600">{script.ai_explanation}</p>
                      <p className="text-xs text-gray-500">Créé le: {new Date(script.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${script.dev_status === 'executed' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                        DEV: {script.dev_status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${script.prod_status === 'executed' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                        PROD: {script.prod_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => executeScript(script.id, 'DEV')}
                      disabled={script.dev_status === 'executed'}
                    >
                      <TestTube className="w-4 h-4 mr-1" />
                      Exécuter DEV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => executeScript(script.id, 'PROD')}
                      disabled={script.dev_status !== 'executed' || script.prod_status === 'executed'}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Exécuter PROD
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyScript(script.script_sql)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copier Script
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}