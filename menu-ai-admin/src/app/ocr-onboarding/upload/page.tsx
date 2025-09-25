// ÉTAPE 1 : Upload & Extract (/ocr-onboarding/upload)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OCRUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [extractionResult, setExtractionResult] = useState<any>(null);

  // Charger les providers disponibles au démarrage
  useEffect(() => {
    loadAvailableProviders();
  }, []);

  const loadAvailableProviders = async () => {
    try {
      const response = await fetch('/api/ocr/providers');
      const data = await response.json();
      setAvailableProviders(data.providers || []);

      // Si aucun provider configuré, définir par défaut
      const configuredProviders = data.providers.filter((p: any) => p.configured);
      if (configuredProviders.length > 0) {
        setSelectedProvider(configuredProviders[0].key); // Utilise le premier provider configuré
      }
    } catch (error) {
      console.error('Erreur chargement providers:', error);
    } finally {
      setProvidersLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('provider', selectedProvider);

      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Nettoyer les anciennes données d'analyse avant de stocker les nouveaux résultats
        localStorage.removeItem('analysisResults');
        localStorage.removeItem('smartConfig');
        localStorage.removeItem('categoryConfigurations');
        localStorage.removeItem('integrationResult');
        localStorage.removeItem('finalWorkflows');

        // Stocker les nouveaux résultats et afficher la prévisualisation
        localStorage.setItem('ocrResults', JSON.stringify(result));
        setExtractionResult(result);
      } else {
        alert(`Erreur OCR: ${result.error}`);
      }
    } catch (error) {
      alert(`Erreur: ${error}`);
    } finally {
      setExtracting(false);
    }
  };

  const handleContinueToConfig = () => {
    router.push('/ocr-onboarding/configure');
  };

  const handleRetryExtraction = () => {
    setExtractionResult(null);
    setSelectedFile(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Navigation étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">📤 OCR Smart Onboarding - Upload & Extract</h1>
          <div className="text-sm text-gray-600">Étape 1/5</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
        </div>
      </div>

      {!extractionResult ? (
        <div className="bg-white rounded-lg shadow p-6">
          {/* Sélection du provider OCR */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Moteur OCR :</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={providersLoading}
            >
              {availableProviders
                .filter(provider => provider.configured)
                .map(provider => (
                  <option key={provider.key} value={provider.key}>
                    {provider.name} (~{provider.cost}€/image)
                  </option>
                ))
              }
            </select>

          {/* Statut des providers */}
          <div className="mt-2 text-xs">
            {providersLoading ? (
              <span className="text-gray-500">Chargement des providers...</span>
            ) : (
              <div>
                <span className="text-gray-600">
                  Providers configurés: {availableProviders.filter(p => p.configured).length}/{availableProviders.length}
                </span>
                {availableProviders.filter(p => !p.configured).length > 0 && (
                  <div className="mt-1 p-2 bg-yellow-50 rounded text-yellow-700">
                    <p className="font-medium">Providers non configurés :</p>
                    <ul className="ml-2">
                      {availableProviders
                        .filter(p => !p.configured)
                        .map(provider => (
                          <li key={provider.key}>• {provider.name}</li>
                        ))
                      }
                    </ul>
                    <p className="text-xs mt-1">Configurez les clés API sur Vercel pour les activer</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Zone de drop */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-lg font-medium">Cliquez pour sélectionner une image de menu</p>
            <p className="text-gray-600 mt-2">JPG, PNG, WEBP - Max 10MB</p>
          </label>

          {selectedFile && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="font-medium">✅ {selectedFile.name}</p>
              <p className="text-sm text-gray-600">{Math.round(selectedFile.size / 1024)} KB</p>
            </div>
          )}
        </div>

        {/* Bouton d'extraction */}
        <div className="mt-6">
          <button
            onClick={handleExtract}
            disabled={!selectedFile || extracting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {extracting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Extraction en cours...
              </div>
            ) : (
              'Extraire le menu avec OCR'
            )}
          </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Résultats de l'extraction */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-900">Extraction Réussie !</h2>
                <p className="text-green-700">{extractionResult.products?.length || 0} produits détectés</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{extractionResult.products?.length || 0}</div>
                <div className="text-sm text-blue-800">Produits</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(extractionResult.confidence || 0)}%</div>
                <div className="text-sm text-green-800">Confiance</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{extractionResult.processingTime || 0}ms</div>
                <div className="text-sm text-purple-800">Temps</div>
              </div>
            </div>

            {/* Liste des produits détectés */}
            <div className="max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-3">🍽️ Produits Détectés :</h3>
              <div className="space-y-2">
                {extractionResult.products?.map((product: any, index: number) => (
                  <div key={index} className="border rounded p-3 bg-gray-50">
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-gray-600 mt-1">{product.description}</div>
                    )}
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <div>
                        <span className="text-green-600">Sur place: {product.price_onsite || 0}€</span>
                        <span className="ml-4 text-blue-600">Livraison: {product.price_delivery || 0}€</span>
                      </div>
                      <span className="text-gray-500">Confiance: {Math.round(product.confidence || 0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleRetryExtraction}
                className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600"
              >
                🔄 Réessayer
              </button>
              <button
                onClick={handleContinueToConfig}
                className="flex-1 bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
              >
                Continuer vers Configuration IA →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}