'use client';

import { useState, useEffect } from 'react';
import { Upload, FileImage, CheckCircle, AlertTriangle, Copy, Play, TestTube } from 'lucide-react';
// import WorkflowSqlHistory from '@/components/WorkflowSqlHistory'; // Commented out for now

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

interface ComparisonResult {
  productId: string;
  database: Product;
  flyerData?: FlyerProduct;
  discrepancies: Discrepancy[];
  suggestedFixes: string[];
  status: 'match' | 'mismatch' | 'missing';
}


export default function AuditBotFlyer() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);

  // Messages bot supprimés - Focus sur Base ↔ Flyer uniquement

  // Zone flyer upload
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [flyerProducts, setFlyerProducts] = useState<FlyerProduct[]>([]);

  // Résultats de comparaison
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  // Callback pour refresh des scripts depuis WorkflowSqlHistory
  const handleScriptsRefresh = () => {
    loadScriptsHistory();
  };

  // États pour l'édition in-line
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    name: string;
    composition: string;
    price_onsite: number;
    price_delivery: number;
  }>({ name: '', composition: '', price_onsite: 0, price_delivery: 0 });

  // Charger restaurants
  useEffect(() => {
    loadRestaurants();
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
    // Fonction conservée pour compatibilité mais utilisation via WorkflowSqlHistory
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

  const detectDiscrepancies = (dbProduct: Product, flyerData?: FlyerProduct): Discrepancy[] => {
    const discrepancies: Discrepancy[] = [];

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

        if (similarity < 0.95) { // Seuil strict pour détecter même les différences subtiles
          console.log(`   ❌ Différence détectée ! (seuil: 0.95)`);
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

  const performSimpleComparison = (flyerData: FlyerProduct[] = flyerProducts): ComparisonResult[] => {
    console.log('🔄 Démarrage comparaison simplifiée Base ↔ Flyer...');
    console.log(`📊 Données disponibles: ${products.length} BDD, ${flyerData.length} Flyer`);

    return products.map(dbProduct => {
      console.log(`\n🔍 === ANALYSE ${dbProduct.name} ===`);

      const flyerMatch = flyerData.find(flyer => {
        const score = similarityScore(flyer.name, dbProduct.name);
        console.log(`   Flyer "${flyer.name}" vs BDD "${dbProduct.name}" = ${score}`);
        return score > 0.6;
      });

      console.log(`   🎯 Match trouvé - Flyer: ${flyerMatch ? 'OUI (' + flyerMatch.name + ')' : 'NON'}`);

      const discrepancies = detectDiscrepancies(dbProduct, flyerMatch);
      const suggestedFixes = generateSQLFixes(dbProduct, discrepancies);

      console.log(`   📋 Résultat: ${discrepancies.length} incohérence(s) détectée(s)`);

      return {
        productId: dbProduct.id,
        database: dbProduct,
        botMessage: undefined, // Plus de logique bot
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

    // Vérification : au moins une image de flyer doit être fournie
    const hasFlyerImages = uploadedImages.length > 0;

    if (!hasFlyerImages) {
      alert('⚠️ Veuillez uploader au moins une image de flyer pour la comparaison');
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
            formData.append('provider', 'google'); // Utiliser Google Cloud Vision (testé et fonctionnel)

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
      const flyerProductsCount = extractedProducts.length;

      console.log(`📊 Comparaison: ${products.length} produits BDD vs ${flyerProductsCount} flyer`);

      if (flyerProductsCount === 0) {
        alert('❌ Aucun produit détecté dans les flyers.\n\n• Vérifiez que les images contiennent du texte lisible');
        return;
      }

      // Effectuer la comparaison avec les données disponibles
      const results = performSimpleComparison(extractedProducts);
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

  const generateAndSaveScript = async (results: ComparisonResult[]) => {
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

  // Fonctions d'édition in-line
  const startEditing = (product: any) => {
    setEditingProduct(product.id);
    setEditValues({
      name: product.name,
      composition: product.composition || product.description || '',
      price_onsite: product.price_on_site_base,
      price_delivery: product.price_delivery_base
    });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditValues({ name: '', composition: '', price_onsite: 0, price_delivery: 0 });
  };

  const saveEdit = async (productId: string) => {
    try {
      console.log('🔄 Sauvegarde édition produit:', productId, editValues);

      // Appel API pour sauvegarder les modifications
      const response = await fetch('/api/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          updates: editValues
        })
      });

      const data = await response.json();

      if (data.success) {
        // Mettre à jour la liste locale
        setProducts(prev => prev.map(p =>
          p.id === productId
            ? { ...p, ...editValues, composition: editValues.composition }
            : p
        ));

        // Générer et sauvegarder le script SQL automatiquement
        const updateSQL = generateUpdateSQL(productId, editValues);
        if (updateSQL) {
          await saveGeneratedScript(updateSQL, editValues.name, `Mise à jour manuelle via audit`);
        }

        alert('✅ Produit mis à jour avec succès');
        cancelEditing();

        // Relancer la comparaison pour mettre à jour les incohérences
        if (flyerProducts.length > 0) {
          const results = performSimpleComparison(flyerProducts);
          setComparisonResults(results);
        }
      } else {
        alert('❌ Erreur lors de la sauvegarde: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur sauvegarde édition:', error);
      alert('❌ Erreur de communication lors de la sauvegarde');
    }
  };

  const generateUpdateSQL = (productId: string, updates: any) => {
    const product = products.find(p => p.id === productId);
    if (!product) return '';

    const updateFields = [];
    const changes = [];

    if (updates.name !== product.name) {
      updateFields.push(`name = '${updates.name.replace(/'/g, "''")}'`);
      changes.push(`name: "${product.name}" → "${updates.name}"`);
    }

    if (updates.composition !== (product.composition || product.description)) {
      updateFields.push(`composition = '${updates.composition.replace(/'/g, "''")}'`);
      changes.push(`composition: "${product.composition || product.description}" → "${updates.composition}"`);
    }

    if (updates.price_onsite !== product.price_on_site_base) {
      updateFields.push(`price_on_site_base = ${updates.price_onsite}`);
      changes.push(`prix sur place: ${product.price_on_site_base}€ → ${updates.price_onsite}€`);
    }

    if (updates.price_delivery !== product.price_delivery_base) {
      updateFields.push(`price_delivery_base = ${updates.price_delivery}`);
      changes.push(`prix livraison: ${product.price_delivery_base}€ → ${updates.price_delivery}€`);
    }

    if (updateFields.length === 0) return '';

    return `-- Mise à jour produit "${updates.name}" (ID: ${productId})
-- Modifications: ${changes.join(', ')}
-- Généré automatiquement depuis Audit Bot vs Flyer

BEGIN;

UPDATE france_products
SET ${updateFields.join(',\n    ')},
    updated_at = NOW()
WHERE id = ${productId}
  AND restaurant_id = (SELECT id FROM france_restaurants WHERE slug = '${selectedRestaurant?.slug}');

-- Vérification
SELECT
    id, name, composition, price_on_site_base, price_delivery_base, updated_at
FROM france_products
WHERE id = ${productId};

COMMIT;`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'match': return <CheckCircle className="w-4 h-4" />;
      case 'mismatch': return <AlertTriangle className="w-4 h-4" />;
      case 'missing': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };


  // Fonction pour ajouter un script à l'historique depuis l'édition inline
  const saveGeneratedScript = async (scriptSQL: string, productName: string, explanation: string) => {
    const restaurant = restaurants.find(r => r.id === selectedRestaurant);
    const category = categories.find(c => c.id === selectedCategory);

    if (!restaurant || !category) return;

    try {
      const response = await fetch('/api/scripts-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_sql: scriptSQL,
          command_source: `audit-bot-flyer: ${restaurant.name} - ${productName}`,
          ai_explanation: explanation,
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔍 Audit Bot vs Flyer</h1>
          <p className="text-gray-600">Vérification intelligente catégorie par catégorie avec comparaison Base ↔ Flyer</p>
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

      {/* Section 2: Zone Comparaison */}
      {selectedCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne 1: Base de Données */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium flex items-center gap-2">
                📊 Base de Données ({products.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map(product => {
                  const isEditing = editingProduct === product.id;
                  const hasInconsistencies = comparisonResults.find(r => r.productId === product.id && r.discrepancies.length > 0);

                  return (
                    <div key={product.id} className={`p-3 border rounded-lg ${hasInconsistencies ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.name}
                            onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                            className="text-sm font-medium border border-gray-300 rounded px-2 py-1 w-full mr-2"
                          />
                        ) : (
                          <h4 className="font-medium">🍔 {product.name}</h4>
                        )}

                        {!isEditing && (
                          <button
                            onClick={() => startEditing(product)}
                            className="text-blue-600 hover:text-blue-800 ml-2"
                            title="Éditer ce produit"
                          >
                            ✏️
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Composition:</label>
                            <textarea
                              value={editValues.composition}
                              onChange={(e) => setEditValues(prev => ({ ...prev, composition: e.target.value }))}
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1 mt-1"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs font-medium text-gray-600">Prix sur place:</label>
                              <input
                                type="number"
                                step="0.5"
                                value={editValues.price_onsite}
                                onChange={(e) => setEditValues(prev => ({ ...prev, price_onsite: parseFloat(e.target.value) || 0 }))}
                                className="w-full text-xs border border-gray-300 rounded px-2 py-1 mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Prix livraison:</label>
                              <input
                                type="number"
                                step="0.5"
                                value={editValues.price_delivery}
                                onChange={(e) => setEditValues(prev => ({ ...prev, price_delivery: parseFloat(e.target.value) || 0 }))}
                                className="w-full text-xs border border-gray-300 rounded px-2 py-1 mt-1"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => saveEdit(product.id)}
                              className="flex-1 bg-green-600 text-white text-xs py-1 px-2 rounded hover:bg-green-700"
                            >
                              ✅ Sauvegarder
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex-1 bg-gray-400 text-white text-xs py-1 px-2 rounded hover:bg-gray-500"
                            >
                              ❌ Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                          {hasInconsistencies && (
                            <div className="mt-2 text-xs text-red-600">
                              <span className="font-medium">⚠️ {hasInconsistencies.discrepancies.length} incohérence(s) détectée(s)</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Colonne 2: Flyer OCR */}
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
`📊 Comparaison : Base de données ↔ Flyer analysé`
              </p>
              {uploadedImages.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {uploadedImages.length} image(s) uploadée(s) pour analyse OCR
                </p>
              )}
            </div>

            <button
              onClick={analyzeComparison}
              disabled={isAnalyzing || !products.length || !uploadedImages.length}
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
              {!uploadedImages.length
                ? "⚠️ Veuillez uploader au moins une image de flyer pour la comparaison"
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  ✅ Base ↔ Flyer: {comparisonResults.filter(r => r.discrepancies.length === 0).length}/{comparisonResults.length}
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

      {/* Section 4: Système SQL Intégré - Version simplifiée pour l'instant */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium flex items-center gap-2">
            🛠️ Scripts SQL - Audit Bot vs Flyer
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Les scripts SQL générés par l'audit et l'édition inline apparaîtront ici.
            Ils s'exécutent par défaut en DEV avec un bouton PROD pour la production.
          </p>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            📝 Scripts SQL en cours de développement...
            <br />
            <span className="text-sm">L'intégration avec le système WorkflowSqlHistory est en cours.</span>
          </div>
        </div>
      </div>
    </div>
  );
}