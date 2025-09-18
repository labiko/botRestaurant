// 🎯 PAGE PRINCIPALE - MENU AI ADMIN
// ====================================

'use client';

import { useState } from 'react';
import CategoryEditModal from '@/components/CategoryEditModal';

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

  const handleAnalyze = async () => {
    if (!command.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, restaurantId: 1 })
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

    // Confirmation pour l'environnement PROD
    if (environment === 'PROD') {
      const confirmed = window.confirm(
        '⚠️ ATTENTION: Vous êtes sur l\'environnement PRODUCTION!\n\n' +
        'Cette action va modifier la base de données de production.\n\n' +
        'Êtes-vous absolument certain de vouloir continuer?'
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: result.sql,
          environment
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult({ ...result, executed: true, environment: data.environment });
        setCommand('');
      } else {
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
          return `INSERT INTO france_products (name, slug, category_id, restaurant_id, price_on_site_base, price_delivery_base, product_type, display_order, composition, requires_steps, steps_config, created_at, updated_at) VALUES ('${change.newProduct.name}', '${change.newProduct.slug}', ${change.newProduct.category_id}, ${change.newProduct.restaurant_id}, ${change.newProduct.price_on_site_base}, ${change.newProduct.price_delivery_base}, '${change.newProduct.product_type}', ${change.newProduct.display_order}, '${change.newProduct.composition || ''}', ${change.newProduct.requires_steps}, '${JSON.stringify(change.newProduct.steps_config || {})}', NOW(), NOW())`;

        case 'UPDATE':
          return `UPDATE france_products SET name = '${change.newProduct.name}', slug = '${change.newProduct.slug}', price_on_site_base = ${change.newProduct.price_on_site_base}, price_delivery_base = ${change.newProduct.price_delivery_base}, product_type = '${change.newProduct.product_type}', composition = '${change.newProduct.composition || ''}', updated_at = NOW() WHERE id = ${change.productId}`;

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

            {/* Sélecteur d'environnement */}
            <div className="flex flex-col items-end">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Environnement
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as 'DEV' | 'PROD')}
                className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                  environment === 'PROD'
                    ? 'bg-red-50 border-red-300 text-red-800'
                    : 'bg-green-50 border-green-300 text-green-800'
                }`}
              >
                <option value="DEV">🧪 DÉVELOPPEMENT</option>
                <option value="PROD">🚀 PRODUCTION</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {environment === 'PROD' ? '⚠️ Attention - Base PROD' : '✅ Base de test'}
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
    </div>
  );
}
