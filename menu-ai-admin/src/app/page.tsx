// 🎯 PAGE PRINCIPALE - MENU AI ADMIN
// ====================================

'use client';

import { useState, useEffect } from 'react';
import CategoryEditModal from '@/components/CategoryEditModal';
import ProdConfirmModal from '@/components/ProdConfirmModal';
import { Restaurant } from '@/lib/types';

interface AIResponse {
  success: boolean;
  sql?: string;
  explanation?: string;
  preview?: {
    action: string;
    sourceProduct?: any;
    newProduct?: any;
    category?: any;
  };
  error?: string;
  confidence: number;
  executed?: boolean;
  environment?: string;
}

export default function MenuAIAdmin() {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [environment, setEnvironment] = useState<'DEV' | 'PROD'>('DEV');
  const [copied, setCopied] = useState(false);

  // Nouveau mode liste
  const [mode, setMode] = useState<'command' | 'list' | 'modal'>('command');
  const [categoryName, setCategoryName] = useState('');
  const [originalList, setOriginalList] = useState('');
  const [modifiedList, setModifiedList] = useState('');
  const [categoryData, setCategoryData] = useState<any>(null);

  // États pour la modale d'édition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<any>(null);
  const [modalProducts, setModalProducts] = useState<any[]>([]);

  // États pour l'historique des scripts
  const [scripts, setScripts] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // États pour la modale PROD
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [selectedProdScript, setSelectedProdScript] = useState<any>(null);
  const [prodExecuting, setProdExecuting] = useState(false);

  // NOUVEAUX ÉTATS POUR LES RESTAURANTS
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  const handleAnalyze = async () => {
    if (!command.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, restaurantId: selectedRestaurant?.id || 1 })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Erreur de connexion au serveur',
        confidence: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!result?.sql) return;

    setLoading(true);
    try {
      // 1. Sauvegarder dans l'historique AVANT exécution
      console.log('🔄 [DEBUG] Début sauvegarde historique...');
      console.log('🔄 [DEBUG] Script SQL:', result.sql);
      console.log('🔄 [DEBUG] Command source:', command || 'Modification manuelle');

      try {
        const savePayload = {
          script_sql: result.sql,
          command_source: command || 'Modification manuelle',
          ai_explanation: result.explanation || 'Script généré',
          category_name: result.preview?.category || 'Modification'
        };

        console.log('🔄 [DEBUG] Payload sauvegarde:', savePayload);

        const saveResponse = await fetch('/api/scripts-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savePayload)
        });

        console.log('🔄 [DEBUG] Response status sauvegarde:', saveResponse.status);

        const saveData = await saveResponse.json();
        console.log('🔄 [DEBUG] Response data sauvegarde:', saveData);

        if (saveData.success) {
          console.log('✅ [DEBUG] Sauvegarde historique réussie');
        } else {
          console.error('❌ [DEBUG] Échec sauvegarde historique:', saveData.error);
        }
      } catch (saveError) {
        console.error('⚠️ [DEBUG] Erreur sauvegarde historique:', saveError);
      }

      // 2. Exécution automatique en DEV (plan mis à jour)
      console.log('🔄 [DEBUG] Début exécution SQL...');

      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: result.sql,
          environment: 'DEV' // Toujours DEV selon le nouveau plan
        })
      });

      console.log('🔄 [DEBUG] Response status exécution:', response.status);

      const data = await response.json();
      console.log('🔄 [DEBUG] Response data exécution:', data);

      if (data.success) {
        console.log('✅ [DEBUG] Exécution SQL réussie');
        setResult({ ...result, executed: true, environment: 'DEV' });
        setCommand('');
        // 3. Recharger l'historique pour afficher le nouveau script
        console.log('🔄 [DEBUG] showHistory:', showHistory);
        if (showHistory) {
          console.log('🔄 [DEBUG] Rechargement historique...');
          await loadScriptsHistory();
        }
      } else {
        console.error('❌ [DEBUG] Échec exécution SQL:', data.error);
        setResult({ ...result, error: data.error });
      }
    } catch (error) {
      console.error('Erreur exécution:', error);
      setResult({ ...result, error: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySQL = async () => {
    if (!result?.sql) return;

    try {
      await navigator.clipboard.writeText(result.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  // Nouvelle fonction : Charger une catégorie
  const handleLoadCategory = async () => {
    if (!categoryName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/load-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryName: categoryName.trim(),
          restaurantId: 1
        })
      });

      const data = await response.json();
      if (data.success) {
        setCategoryData(data);
        setOriginalList(data.productList);
        setModifiedList(data.productList);
      } else {
        setResult({ ...result, error: data.error } as any);
      }
    } catch (error) {
      console.error('Erreur chargement catégorie:', error);
      setResult({ ...result, error: 'Erreur de connexion au serveur' } as any);
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction : Analyser les différences
  const handleAnalyzeList = async () => {
    if (!originalList || !modifiedList || !categoryData) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalList,
          modifiedList,
          categoryId: categoryData.category.id,
          restaurantId: 1
        })
      });

      const data = await response.json();
      if (data.success) {
        // Convertir la réponse au format attendu
        const sqlStatements = data.changes?.map((change: any) => change.sql).join(';\n') || '';
        setResult({
          success: true,
          sql: sqlStatements,
          explanation: data.summary,
          preview: {
            action: `${data.changes?.length || 0} changement(s) détecté(s)`,
            changes: data.changes
          },
          confidence: data.confidence
        } as any);
      } else {
        setResult({ ...result, error: data.error } as any);
      }
    } catch (error) {
      console.error('Erreur analyse liste:', error);
      setResult({ ...result, error: 'Erreur de connexion au serveur' } as any);
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction : Ouvrir modale d'édition
  const handleOpenModal = async () => {
    if (!categoryName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/load-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryName: categoryName.trim(),
          restaurantId: 1
        })
      });

      const data = await response.json();
      if (data.success) {
        setModalCategory(data.category);
        setModalProducts(data.products);
        setIsModalOpen(true);
      } else {
        setResult({ ...result, error: data.error } as any);
      }
    } catch (error) {
      console.error('Erreur chargement catégorie:', error);
      setResult({ ...result, error: 'Erreur de connexion au serveur' } as any);
    } finally {
      setLoading(false);
    }
  };

  // Fonction : Traiter les changements de la modale
  const handleModalSave = (changes: any[]) => {
    // Générer SQL à partir des changements
    const sqlStatements = changes.map(change => {
      switch (change.type) {
        case 'ADD':
          return `INSERT INTO france_products (name, category_id, restaurant_id, price_on_site_base, price_delivery_base, product_type, display_order, composition, requires_steps, steps_config, created_at, updated_at) VALUES ('${change.newProduct.name}', ${change.newProduct.category_id}, ${change.newProduct.restaurant_id}, ${change.newProduct.price_on_site_base}, ${change.newProduct.price_delivery_base}, '${change.newProduct.product_type}', ${change.newProduct.display_order}, '${change.newProduct.composition || ''}', ${change.newProduct.requires_steps}, '${JSON.stringify(change.newProduct.steps_config || {})}', NOW(), NOW())`;

        case 'UPDATE':
          return `UPDATE france_products SET name = '${change.newProduct.name}', price_on_site_base = ${change.newProduct.price_on_site_base}, price_delivery_base = ${change.newProduct.price_delivery_base}, product_type = '${change.newProduct.product_type}', composition = '${change.newProduct.composition || ''}', updated_at = NOW() WHERE id = ${change.productId}`;

        case 'DELETE':
          return `DELETE FROM france_products WHERE id = ${change.productId}`;

        default:
          return '';
      }
    }).filter(sql => sql.length > 0);

    setResult({
      success: true,
      sql: `BEGIN;\n${sqlStatements.join(';\n')};\nCOMMIT;`,
      explanation: `${changes.length} modification(s) appliquée(s) à la catégorie ${modalCategory?.name}`,
      preview: {
        action: `Modifications catégorie ${modalCategory?.name}`,
        changes: changes
      },
      confidence: 95
    } as any);
  };

  // Fonction : Charger l'historique des scripts
  const loadScriptsHistory = async () => {
    try {
      const response = await fetch('/api/scripts-history');
      const data = await response.json();
      if (data.success) {
        setScripts(data.scripts);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  // Fonction : Exécuter un script
  const executeScript = async (scriptId: number, environment: string) => {
    try {
      const response = await fetch('/api/execute-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId, environment })
      });

      const data = await response.json();
      if (data.success) {
        // Recharger l'historique
        await loadScriptsHistory();
      }
      return data;
    } catch (error) {
      console.error('Erreur exécution script:', error);
      throw error;
    }
  };

  // Fonction : Ouvrir modale confirmation PROD
  const openProdModal = (script: any) => {
    setSelectedProdScript(script);
    setProdModalOpen(true);
  };

  // Fonction : Exécuter en PROD avec modale moderne
  const executeScriptInProd = async () => {
    if (!selectedProdScript) return;

    setProdExecuting(true);
    try {
      await executeScript(selectedProdScript.id, 'PROD');
      setProdModalOpen(false);
      setSelectedProdScript(null);
    } catch (error) {
      console.error('Erreur exécution PROD:', error);
    } finally {
      setProdExecuting(false);
    }
  };

  // Fonction : Générer rollback
  const generateRollback = async (scriptId: number) => {
    try {
      const response = await fetch('/api/generate-rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur génération rollback:', error);
      throw error;
    }
  };

  // Fonction : Supprimer un script
  const deleteScript = async (scriptId: number) => {
    try {
      const response = await fetch(`/api/delete-script?id=${scriptId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        await loadScriptsHistory();
      }
      return data;
    } catch (error) {
      console.error('Erreur suppression script:', error);
      throw error;
    }
  };

  // NOUVELLE FONCTION : Charger les restaurants
  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const response = await fetch('/api/restaurants');
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.restaurants);
        // Sélectionner automatiquement le premier restaurant (Pizza Yolo)
        if (data.restaurants.length > 0 && !selectedRestaurant) {
          setSelectedRestaurant(data.restaurants[0]);
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement restaurants:', error);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // Charger l'historique au montage du composant
  useEffect(() => {
    if (showHistory) {
      loadScriptsHistory();
    }
  }, [showHistory]);

  // NOUVEAU USEEFFECT : Charger les restaurants au démarrage
  useEffect(() => {
    loadRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🤖 Menu AI Modifier
              </h1>
              <p className="text-gray-600">
                Automatisation intelligente des modifications de menu
              </p>
            </div>

            {/* Sélecteur de restaurant */}
            <div className="flex flex-col items-end">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Restaurant
              </label>
              <select
                value={selectedRestaurant?.id || ''}
                onChange={(e) => {
                  const restaurantId = parseInt(e.target.value);
                  const restaurant = restaurants.find(r => r.id === restaurantId);
                  setSelectedRestaurant(restaurant || null);
                }}
                disabled={loadingRestaurants || restaurants.length === 0}
                className="px-3 py-2 border rounded-lg text-sm font-medium bg-blue-50 border-blue-300 text-blue-800"
              >
                {loadingRestaurants ? (
                  <option value="">⏳ Chargement...</option>
                ) : restaurants.length === 0 ? (
                  <option value="">❌ Aucun restaurant</option>
                ) : (
                  <>
                    <option value="">Sélectionner un restaurant</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        🏪 {restaurant.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedRestaurant
                  ? `✅ Restaurant: ${selectedRestaurant.name}`
                  : '⚠️ Sélectionnez un restaurant'}
              </p>
            </div>
          </div>
        </div>

        {/* Section Édition Modale Moderne */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            ✨ Édition Modale Moderne (Recommandé)
          </h2>
          <p className="mb-4 text-purple-100">
            Interface révolutionnaire : Chargez une catégorie complète et éditez tous les produits en temps réel
          </p>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-purple-100 mb-2">
                Nom de la catégorie
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: SALADES, PIZZAS, BURGERS, TACOS..."
                className="w-full p-3 border border-purple-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>
            <button
              onClick={handleOpenModal}
              disabled={loading || !categoryName.trim()}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center gap-2 transition-all transform hover:scale-105"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '🎛️'
              )}
              Ouvrir l'Éditeur
            </button>
          </div>

          <div className="mt-4 text-sm text-purple-200">
            💡 <strong>Avantages :</strong> Visualisation complète • Édition directe • Auto-calculs • Workflows complexes
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">💬 Commande</h2>

          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Exemple: Duplique L'AMERICAIN en MINI AMERICAIN à 8€"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || !command.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '🧠'
              )}
              Analyser
            </button>

            <button
              onClick={() => setCommand("Duplique L'AMERICAIN en MINI AMERICAIN à 8€")}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Exemple
            </button>
          </div>

          {/* Exemples de commandes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
            <div
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-100 text-sm"
              onClick={() => setCommand("Ajouter Coca Cherry 33CL - 2.50€ dans BOISSONS")}
            >
              Ajouter Coca Cherry 33CL - 2.50€ dans BOISSONS
            </div>
            <div
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-100 text-sm"
              onClick={() => setCommand("Changer prix AMERICAIN de 13.50€ à 14€")}
            >
              Changer prix AMERICAIN de 13.50€ à 14€
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={result.success ? "text-green-600" : "text-red-600"}>
                {result.success ? "✅" : "❌"}
              </span>
              <h2 className="text-xl font-semibold">Résultat de l'analyse</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${
                result.confidence > 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}>
                Confiance: {result.confidence}%
              </span>
            </div>

            {result.success ? (
              <div className="space-y-4">
                {/* Explanation */}
                {result.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    {result.explanation}
                  </div>
                )}

                {/* Preview */}
                {result.preview && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">📋 Aperçu de la modification:</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Action:</strong> {result.preview.action}</p>

                      {result.preview.sourceProduct && (
                        <div>
                          <strong>Produit source:</strong>
                          <div className="ml-4 bg-white p-2 rounded border">
                            {result.preview.sourceProduct.name} - {result.preview.sourceProduct.price_on_site_base}€
                          </div>
                        </div>
                      )}

                      {result.preview.newProduct && (
                        <div>
                          <strong>Nouveau produit:</strong>
                          <div className="ml-4 bg-green-50 p-2 rounded border border-green-200">
                            {result.preview.newProduct.name} - {result.preview.newProduct.price_on_site_base}€
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SQL Preview */}
                {result.sql && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">💾 SQL généré:</h4>
                      <button
                        onClick={handleCopySQL}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          copied
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {copied ? (
                          <>
                            ✅ Copié !
                          </>
                        ) : (
                          <>
                            📋 Copier
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                      {result.sql}
                    </pre>
                  </div>
                )}

                {/* Message de succès d'exécution */}
                {result.executed && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🎉</span>
                      <h4 className="font-semibold text-green-800">
                        Commande exécutée avec succès !
                      </h4>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Environnement: <strong>{result.environment || environment}</strong>
                    </p>
                    <p className="text-green-600 text-sm">
                      Les modifications ont été appliquées à la base de données.
                    </p>
                  </div>
                )}

                {/* Execute Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleExecute}
                    disabled={loading || !result.sql || result.executed}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 text-white font-medium ${
                      result.executed
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : result.executed ? (
                      "✅"
                    ) : (
                      "🚀"
                    )}
                    {result.executed ? 'Exécuté' : 'Exécuter'}
                  </button>

                  <button
                    onClick={() => setResult(null)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Nouvelle commande
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {result.error || 'Erreur inconnue'}
              </div>
            )}
          </div>
        )}

        {/* Section Historique des Scripts SQL */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              📜 Historique des Scripts SQL
            </h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showHistory
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {showHistory ? '👁️ Masquer' : '👁️ Afficher'}
            </button>
          </div>

          {showHistory && (
            <div className="space-y-4">
              {scripts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-lg">📭 Aucun script généré</p>
                  <p className="text-sm mt-2">Les scripts générés apparaîtront ici automatiquement</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm table-fixed">
                    <colgroup>
                      <col className="w-24" />
                      <col className="w-40" />
                      <col className="w-48" />
                      <col className="w-24" />
                      <col className="w-28" />
                      <col className="w-32" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left p-2 text-xs font-medium">Date</th>
                        <th className="text-left p-2 text-xs font-medium">Commande</th>
                        <th className="text-left p-2 text-xs font-medium">Script SQL</th>
                        <th className="text-center p-2 text-xs font-medium">DEV</th>
                        <th className="text-center p-2 text-xs font-medium">PROD</th>
                        <th className="text-center p-2 text-xs font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scripts.map((script) => (
                        <tr key={script.id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="p-2">
                            <div className="text-xs text-gray-300 leading-tight">
                              {new Date(script.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit'
                              })}
                              <br />
                              {new Date(script.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="truncate text-xs">
                              {script.command_source || 'Script généré'}
                            </div>
                            {script.category_name && (
                              <div className="text-xs text-blue-300 truncate">
                                📂 {script.category_name}
                              </div>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="relative group">
                              <div className="bg-gray-900 px-2 py-1 rounded text-green-400 font-mono text-xs truncate cursor-pointer hover:bg-gray-800"
                                   onClick={() => navigator.clipboard.writeText(script.script_sql)}
                                   title="Cliquer pour copier le script complet">
                                {script.script_sql.includes('UPDATE')
                                  ? script.script_sql.match(/UPDATE[^;]+/)?.[0] || 'UPDATE...'
                                  : script.script_sql.includes('INSERT')
                                  ? 'INSERT...'
                                  : script.script_sql.includes('DELETE')
                                  ? 'DELETE...'
                                  : script.script_sql.substring(0, 30) + '...'
                                }
                              </div>
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-blue-400 text-xs">📋</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                              script.dev_status === 'executed' ? 'bg-green-600' :
                              script.dev_status === 'error' ? 'bg-red-600' :
                              script.dev_status === 'rolled_back' ? 'bg-blue-600' :
                              'bg-yellow-600'
                            }`}>
                              {script.dev_status === 'pending' && '⏳'}
                              {script.dev_status === 'executed' && '✅'}
                              {script.dev_status === 'error' && '❌'}
                              {script.dev_status === 'rolled_back' && '↩️'}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                              script.prod_status === 'executed' ? 'bg-green-600' :
                              script.prod_status === 'error' ? 'bg-red-600' :
                              script.prod_status === 'rolled_back' ? 'bg-blue-600' :
                              script.prod_status === 'not_applied' ? 'bg-gray-600' :
                              'bg-yellow-600'
                            }`}>
                              {script.prod_status === 'not_applied' && '➖'}
                              {script.prod_status === 'pending' && '⏳'}
                              {script.prod_status === 'executed' && '✅'}
                              {script.prod_status === 'error' && '❌'}
                              {script.prod_status === 'rolled_back' && '↩️'}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {/* Nouveau plan: Icône PROD pour appliquer en production */}
                              {script.prod_status === 'not_applied' && (
                                <button
                                  onClick={() => openProdModal(script)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                                  title="Appliquer en PRODUCTION"
                                >
                                  🔴 PROD
                                </button>
                              )}

                              {/* Boutons Rollback compacts */}
                              {script.dev_status === 'executed' && (
                                <button
                                  onClick={() => generateRollback(script.id)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs"
                                  title="Rollback DEV"
                                >
                                  ↩️
                                </button>
                              )}

                              {script.prod_status === 'executed' && (
                                <button
                                  onClick={() => generateRollback(script.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                  title="Rollback PROD"
                                >
                                  ↩️
                                </button>
                              )}

                              {/* Bouton Supprimer compact */}
                              {script.prod_status === 'not_applied' && (
                                <button
                                  onClick={() => deleteScript(script.id)}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                                  title="Supprimer"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          Menu AI Modifier v1.0.0 - Powered by OpenAI & Supabase
        </div>
      </div>

      {/* Modale d'Édition Moderne */}
      <CategoryEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={modalCategory}
        products={modalProducts}
        onSave={handleModalSave}
      />

      {/* Modale Confirmation PROD */}
      <ProdConfirmModal
        isOpen={prodModalOpen}
        onClose={() => setProdModalOpen(false)}
        onConfirm={executeScriptInProd}
        scriptPreview={selectedProdScript?.script_sql || ''}
        loading={prodExecuting}
      />

    </div>
  );
}
