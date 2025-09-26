'use client';

import { useState, useEffect } from 'react';
import { Upload, FileImage, CheckCircle, AlertTriangle, Copy, Play, TestTube } from 'lucide-react';

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
  price_on_site_base: number;
  price_delivery_base: number;
  composition?: string;
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
  dbValue: string | number | null;
  comparedValue: string | number | null;
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
      const response = await fetch(`/api/restaurants`);
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error('Erreur chargement restaurants:', error);
    }
  };

  const loadCategories = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadProducts = async (restaurantId: string, categoryId: string) => {
    try {
      const response = await fetch(`/api/products?restaurant_id=${restaurantId}&category_id=${categoryId}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
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

          let productName = '';
          let description = '';

          if (i >= 2 && lines[i-2] && lines[i-1]) {
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

    // Comparaison avec bot (seulement si messages bot fournis)
    if (parsedBotProducts.length > 0) {
      if (botMessage) {
        if (Math.abs(botMessage.price - dbProduct.price_on_site_base) > 0.01) {
          discrepancies.push({
            type: 'price_mismatch',
            field: 'price_on_site',
            dbValue: dbProduct.price_on_site_base,
            comparedValue: botMessage.price,
            message: `Prix différent dans le bot: ${botMessage.price}€ vs ${dbProduct.price_on_site_base}€ en base`
          });
        }

        if (botMessage.missingDeliveryPrice) {
          discrepancies.push({
            type: 'missing_in_bot',
            field: 'price_delivery',
            dbValue: dbProduct.price_delivery_base,
            comparedValue: null,
            message: 'Prix livraison manquant dans les messages du bot'
          });
        }

        // Comparaison des descriptions/compositions avec le bot
        if (botMessage.description && dbProduct.composition) {
          const similarity = similarityScore(botMessage.description.toLowerCase(), dbProduct.composition.toLowerCase());
          if (similarity < 0.6) {
            discrepancies.push({
              type: 'description_mismatch',
              field: 'composition_bot',
              dbValue: dbProduct.composition,
              comparedValue: botMessage.description,
              message: `Composition différente Bot - BDD: "${dbProduct.composition}" vs Bot: "${botMessage.description}"`
            });
          }
        }
      } else {
        // Seulement noter les produits manquants si on a des messages bot à comparer
        discrepancies.push({
          type: 'missing_in_bot',
          field: 'product',
          dbValue: dbProduct.name,
          comparedValue: null,
          message: 'Produit absent des messages du bot'
        });
      }
    }

    // Comparaison avec flyer (focus principal)
    if (flyerData) {
      if (flyerData.priceOnSite && Math.abs(flyerData.priceOnSite - dbProduct.price_on_site_base) > 0.01) {
        discrepancies.push({
          type: 'price_mismatch',
          field: 'price_on_site_flyer',
          dbValue: dbProduct.price_on_site_base,
          comparedValue: flyerData.priceOnSite,
          message: `Prix sur place différent dans le flyer: ${flyerData.priceOnSite}€ vs ${dbProduct.price_on_site_base}€ en base`
        });
      }

      if (flyerData.priceDelivery && Math.abs(flyerData.priceDelivery - dbProduct.price_delivery_base) > 0.01) {
        discrepancies.push({
          type: 'price_mismatch',
          field: 'price_delivery_flyer',
          dbValue: dbProduct.price_delivery_base,
          comparedValue: flyerData.priceDelivery,
          message: `Prix livraison différent dans le flyer: ${flyerData.priceDelivery}€ vs ${dbProduct.price_delivery_base}€ en base`
        });
      }

      // Comparaison des descriptions/compositions (DEBUG ACTIF)
      console.log(`🔍 Comparaison ${dbProduct.name}:`);
      console.log(`   BDD composition: "${dbProduct.composition || 'MANQUANT'}"`);
      console.log(`   Flyer description: "${flyerData?.description || 'MANQUANT'}"`);

      if (flyerData.description && dbProduct.composition) {
        const similarity = similarityScore(flyerData.description.toLowerCase(), dbProduct.composition.toLowerCase());
        console.log(`   Similarité calculée: ${similarity}`);

        if (similarity < 0.6) { // Seuil de similarité ajustable
          console.log(`   ❌ Différence détectée ! (seuil: 0.6)`);
          discrepancies.push({
            type: 'description_mismatch',
            field: 'composition',
            dbValue: dbProduct.composition,
            comparedValue: flyerData.description,
            message: `Composition différente - BDD: "${dbProduct.composition}" vs Flyer: "${flyerData.description}"`
          });
        } else {
          console.log(`   ✅ Compositions considérées similaires`);
        }
      } else {
        console.log(`   ⚠️ Comparaison impossible - données manquantes`);
      }
    } else if (flyerProducts.length > 0) {
      // Seulement noter les produits manquants si on a des flyers à comparer
      discrepancies.push({
        type: 'missing_in_flyer',
        field: 'product',
        dbValue: dbProduct.name,
        comparedValue: null,
        message: 'Produit absent du flyer analysé'
      });
    }

    return discrepancies;
  };

  const generateSQLFixes = (product: Product, discrepancies: Discrepancy[]): string[] => {
    const fixes: string[] = [];

    discrepancies.forEach(issue => {
      switch (issue.type) {
        case 'price_mismatch':
          if (issue.field === 'price_on_site' && typeof issue.comparedValue === 'number') {
            fixes.push(`UPDATE france_products SET price_on_site_base = ${issue.comparedValue} WHERE id = '${product.id}';`);
          } else if (issue.field === 'price_delivery' && typeof issue.comparedValue === 'number') {
            fixes.push(`UPDATE france_products SET price_delivery_base = ${issue.comparedValue} WHERE id = '${product.id}';`);
          } else if (issue.field === 'price_on_site_flyer' && typeof issue.comparedValue === 'number') {
            fixes.push(`UPDATE france_products SET price_on_site_base = ${issue.comparedValue} WHERE id = '${product.id}';`);
          } else if (issue.field === 'price_delivery_flyer' && typeof issue.comparedValue === 'number') {
            fixes.push(`UPDATE france_products SET price_delivery_base = ${issue.comparedValue} WHERE id = '${product.id}';`);
          }
          break;
        case 'description_mismatch':
          if (typeof issue.comparedValue === 'string') {
            if (issue.field === 'composition' || issue.field === 'composition_bot') {
              fixes.push(`UPDATE france_products SET composition = '${issue.comparedValue.replace(/'/g, "''")}' WHERE id = '${product.id}';`);
            } else {
              fixes.push(`UPDATE france_products SET description = '${issue.comparedValue.replace(/'/g, "''")}' WHERE id = '${product.id}';`);
            }
          }
          break;
        case 'missing_in_bot':
          fixes.push(`-- Produit manquant dans le bot : ${product.name}`);
          break;
        case 'missing_in_flyer':
          fixes.push(`-- Produit manquant dans le flyer : ${product.name}`);
          break;
      }
    });

    return fixes;
  };

  const performTripleComparison = (): TripleComparison[] => {
    console.log('🔄 Démarrage triple comparaison...');
    console.log(`📊 Données disponibles: ${products.length} BDD, ${parsedBotProducts.length} Bot, ${flyerProducts.length} Flyer`);

    return products.map(dbProduct => {
      console.log(`\n🔍 === ANALYSE ${dbProduct.name} ===`);

      const botMatch = parsedBotProducts.find(bot =>
        similarityScore(bot.productName, dbProduct.name) > 0.6
      );

      const flyerMatch = flyerProducts.find(flyer => {
        const score = similarityScore(flyer.name, dbProduct.name);
        console.log(`   Flyer "${flyer.name}" vs BDD "${dbProduct.name}" = ${score}`);
        return score > 0.6;
      });

      console.log(`   🎯 Match trouvé - Bot: ${botMatch ? 'OUI' : 'NON'}, Flyer: ${flyerMatch ? 'OUI (' + flyerMatch.name + ')' : 'NON'}`);

      const discrepancies = detectDiscrepancies(dbProduct, botMatch, flyerMatch);
      const suggestedFixes = generateSQLFixes(dbProduct, discrepancies);

      console.log(`   📋 Résultat: ${discrepancies.length} incohérence(s) détectée(s)`);

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

  // Parser simple : utilise directement ce que l'IA OpenAI retourne
  const parseExtractedTextToProducts = (result: any): FlyerProduct[] => {
    console.log('🔍 Parser - Result structure:', JSON.stringify(result, null, 2));

    // Format direct : result.products (structure OCR moderne)
    if (result.products && Array.isArray(result.products)) {
      console.log(`📊 Parsing ${result.products.length} structured products from direct result.products`);
      const products = result.products.map((product: any) => ({
        name: product.name,
        description: product.description || '', // ✅ Utilise la description complète de l'IA
        priceOnSite: product.price_onsite || product.price_on_site,
        priceDelivery: product.price_delivery
      }));
      console.log('✅ Produits parsés (direct):', products);
      return products;
    }

    // Format avec extracted_text comme objet JSON
    if (result.extracted_text && typeof result.extracted_text === 'object' && result.extracted_text.products) {
      console.log(`📊 Parsing from extracted_text object structure`);
      const products = result.extracted_text.products.map((product: any) => ({
        name: product.name,
        description: product.description || '',
        priceOnSite: product.price_onsite || product.price_on_site,
        priceDelivery: product.price_delivery
      }));
      console.log('✅ Produits parsés (extracted_text):', products);
      return products;
    }

    // Format avec extracted_text comme string JSON
    if (result.extracted_text && typeof result.extracted_text === 'string') {
      try {
        const parsed = JSON.parse(result.extracted_text);
        if (parsed.products && Array.isArray(parsed.products)) {
          console.log(`📊 Parsing from extracted_text string JSON`);
          const products = parsed.products.map((product: any) => ({
            name: product.name,
            description: product.description || '',
            priceOnSite: product.price_onsite || product.price_on_site,
            priceDelivery: product.price_delivery
          }));
          console.log('✅ Produits parsés (string JSON):', products);
          return products;
        }
      } catch (e) {
        console.warn('❌ Impossible de parser extracted_text comme JSON:', e);
      }
    }

    // Sinon, parsing minimal générique
    const products: FlyerProduct[] = [];
    const text = typeof result === 'string' ? result : result.extracted_text || '';
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    lines.forEach(line => {
      // Pattern simple : chercher prix (€) avec nom avant
      const match = line.match(/(.+?)\s*(\d+)[,.]?(\d{2})?\s*€/);
      if (match) {
        const name = match[1].trim();
        const price = parseFloat(match[2] + '.' + (match[3] || '00'));

        if (name.length > 2) {
          products.push({
            name: name,
            description: line,
            priceOnSite: price,
            priceDelivery: price + 1
          });
        }
      }
    });

    return products;
  };

  const analyzeComparison = async () => {
    if (!products.length) {
      alert('Aucun produit trouvé pour cette catégorie');
      return;
    }

    // Vérification : au moins une source de comparaison doit être fournie
    const hasBotMessages = botMessages.trim().length > 0;
    const hasFlyerImages = uploadedImages.length > 0;

    if (!hasBotMessages && !hasFlyerImages) {
      alert('⚠️ Veuillez fournir au moins une source de comparaison :\n• Messages du bot (copier-coller)\n• Images de flyers (upload)');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Analyser les images uploadées via l'API OCR réelle
      let extractedProducts: FlyerProduct[] = [];
      if (uploadedImages.length > 0) {
        console.log(`🔍 Analyse OCR de ${uploadedImages.length} image(s)...`);

        for (const imageFile of uploadedImages) {
          try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('provider', 'openai'); // Utiliser OpenAI par défaut

            const response = await fetch('/api/ocr/extract', {
              method: 'POST',
              body: formData
            });

            const result = await response.json();

            if (result.success) {
              console.log('✅ Résultat OCR complet:', JSON.stringify(result, null, 2));

              // Parser le résultat (IA structure ou texte brut)
              const parsedProducts = parseExtractedTextToProducts(result);
              console.log('🔍 Produits parsés:', JSON.stringify(parsedProducts, null, 2));

              extractedProducts.push(...parsedProducts);
              console.log(`📊 ${parsedProducts.length} produits détectés dans l'image`);

              // Vérifier spécifiquement le CHEESEBURGER
              const cheeseburger = parsedProducts.find(p => p.name.toUpperCase().includes('CHEESEBURGER'));
              if (cheeseburger) {
                console.log('🍔 CHEESEBURGER trouvé:', cheeseburger);
                console.log('📝 Description CHEESEBURGER:', cheeseburger.description);
              }
            } else {
              console.warn('⚠️ Échec OCR:', result.error || 'Erreur inconnue');
            }
          } catch (error) {
            console.error('❌ Erreur OCR pour image:', error);
            alert(`Erreur lors de l'analyse OCR d'une image: ${error.message}`);
          }
        }

        setFlyerProducts(extractedProducts);
        console.log(`🎯 Total produits flyer détectés: ${extractedProducts.length}`);
      }

      // Vérifier qu'on a au moins des données à comparer
      const botProductsCount = parsedBotProducts.length;
      const flyerProductsCount = extractedProducts.length;

      console.log(`📊 Comparaison: ${products.length} produits BDD vs ${botProductsCount} bot vs ${flyerProductsCount} flyer`);

      if (botProductsCount === 0 && flyerProductsCount === 0) {
        alert('❌ Aucun produit détecté dans vos sources de comparaison.\n\n• Vérifiez le format des messages bot\n• Vérifiez que les images de flyers contiennent du texte lisible');
        return;
      }

      // Effectuer la comparaison avec les données disponibles
      const results = performTripleComparison();
      setComparisonResults(results);

      // Générer et sauvegarder le script SQL si des corrections sont nécessaires
      const hasIssues = results.some(r => r.discrepancies.length > 0);
      if (hasIssues) {
        console.log(`🔧 Génération script SQL pour ${results.filter(r => r.discrepancies.length > 0).length} produits avec incohérences`);
        await generateAndSaveScript(results);
      } else {
        console.log('✅ Aucune incohérence détectée - pas de script SQL nécessaire');
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error);
      alert(`Erreur lors de l'analyse: ${error.message}`);
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

    if (!restaurant || !category) return;

    const scriptSQL = `BEGIN;

-- Corrections automatiques pour ${restaurant.name}
-- Catégorie: ${category.name}
-- Audit Bot vs Flyer généré le: ${new Date().toLocaleString('fr-FR')}

${allFixes.join('\n')}

-- Vérification des modifications
SELECT p.name, p.price_delivery_base, p.price_on_site_base, p.description, p.composition
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
          command_source: `audit-bot-flyer: ${restaurant.name} - ${category.name}`,
          ai_explanation: `Audit automatique Bot vs Flyer détectant ${results.filter(r => r.discrepancies.length > 0).length} produits avec des incohérences`,
          category_name: category.name
        })
      });

      const data = await response.json();
      if (data.success) {
        loadScriptsHistory();
      }
    } catch (error) {
      console.error('Erreur sauvegarde script:', error);
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
        loadScriptsHistory();
      }
    } catch (error) {
      console.error('Erreur exécution script:', error);
    }
  };

  const copyScript = async (script: string) => {
    try {
      await navigator.clipboard.writeText(script);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = script;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔍 Audit Bot vs Flyer</h1>
          <p className="text-gray-600">Vérification intelligente catégorie par catégorie avec triple comparaison automatique</p>
        </div>
      </div>

      {/* Section 1: Sélection Restaurant et Catégorie */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileImage className="w-5 h-5" />
          <h3 className="text-lg font-medium">Sélection Restaurant et Catégorie</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Restaurant</label>
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choisir un restaurant</option>
              {restaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedRestaurant}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Choisir une catégorie</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Zone Triple Comparaison */}
      {selectedCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne 1: Base de Données */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium flex items-center gap-2">
                📊 Base de Données ({products.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map(product => (
                  <div key={product.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">🍔 {product.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    {product.composition && (
                      <p className="text-xs text-blue-600 mb-2">
                        <span className="font-medium">Composition:</span> {product.composition}
                      </p>
                    )}
                    <div className="text-xs space-y-1">
                      <div>Prix sur place: <span className="font-medium">{product.price_on_site_base}€</span></div>
                      <div>Prix livraison: <span className="font-medium">{product.price_delivery_base}€</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne 2: Messages Bot */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium flex items-center gap-2">
                📱 Messages Bot ({parsedBotProducts.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <textarea
                  placeholder="Collez ici les messages du bot...

Exemple:
🍔 CHEESEBURGER
STEAK 45G, FROMAGE, CORNICHONS
5 EUR - Tapez 1"
                  value={botMessages}
                  onChange={(e) => setBotMessages(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {parsedBotProducts.map((botProduct, index) => (
                    <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded">
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
            </div>
          </div>

          {/* Colonne 3: Flyer OCR */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium flex items-center gap-2">
                📄 Flyer Analysé ({flyerProducts.length})
              </h3>
            </div>
            <div className="p-6">
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

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {flyerProducts.map((flyerProduct, index) => (
                    <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded">
                      <div className="text-sm font-medium">{flyerProduct.name}</div>
                      {flyerProduct.description && (
                        <div className="text-xs text-gray-700 mt-1 italic">
                          📝 {flyerProduct.description}
                        </div>
                      )}
                      <div className="text-xs font-medium mt-2 text-orange-700">
                        Sur place: {flyerProduct.priceOnSite || 'N/A'}€ • Livraison: {flyerProduct.priceDelivery || 'N/A'}€
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'analyse */}
      {selectedCategory && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {botMessages.trim() ? (
                  `✅ Triple comparaison : Base de données ↔ Messages Bot ↔ Flyer (${parsedBotProducts.length} produits bot détectés)`
                ) : (
                  `📊 Comparaison focus : Base de données ↔ Flyer analysé (Messages bot facultatifs)`
                )}
              </p>
              {uploadedImages.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {uploadedImages.length} image(s) uploadée(s) pour analyse OCR
                </p>
              )}
            </div>

            <button
              onClick={analyzeComparison}
              disabled={isAnalyzing || !products.length || (!botMessages.trim() && !uploadedImages.length)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyse en cours...
                </div>
              ) : (
                '🔍 Analyser et Comparer'
              )}
            </button>

            <p className="text-xs text-gray-500 mt-3">
              {!botMessages.trim() && !uploadedImages.length
                ? "⚠️ Veuillez fournir au moins une source de comparaison : messages bot OU images de flyers"
                : botMessages.trim() && uploadedImages.length > 0
                ? `✅ Prêt pour triple comparaison : Base ↔ Bot (${parsedBotProducts.length}) ↔ Flyer (${uploadedImages.length} images)`
                : botMessages.trim()
                ? `✅ Prêt pour comparaison : Base ↔ Bot (${parsedBotProducts.length} produits détectés)`
                : `✅ Prêt pour comparaison : Base ↔ Flyer (${uploadedImages.length} images à analyser)`
              }
            </p>
          </div>
        </div>
      )}

      {/* Section 3: Résultats de Comparaison */}
      {comparisonResults.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium flex items-center gap-2">
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
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {comparisonResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{result.database.name}</h4>
                      <p className="text-sm text-gray-600">{result.database.composition || result.database.description}</p>
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
          </div>
        </div>
      )}

      {/* Section 4: Système SQL Intégré */}
      {auditScripts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium flex items-center gap-2">
              🛠️ Scripts SQL Générés ({auditScripts.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {auditScripts.map((script) => (
                <div key={script.id} className="border border-gray-200 rounded-lg p-4">
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
                    <button
                      onClick={() => executeScript(script.id, 'DEV')}
                      disabled={script.dev_status === 'executed'}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TestTube className="w-4 h-4 mr-1" />
                      Exécuter DEV
                    </button>
                    <button
                      onClick={() => executeScript(script.id, 'PROD')}
                      disabled={script.dev_status !== 'executed' || script.prod_status === 'executed'}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Exécuter PROD
                    </button>
                    <button
                      onClick={() => copyScript(script.script_sql)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copier Script
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}