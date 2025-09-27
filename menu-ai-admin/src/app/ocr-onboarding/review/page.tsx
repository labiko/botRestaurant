// ÉTAPE 3 : Review & Edit (/ocr-onboarding/review)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OCRReviewPage() {
  const router = useRouter();
  const [ocrResults, setOcrResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const results = localStorage.getItem('ocrResults');
    if (results) {
      const parsed = JSON.parse(results);
      setOcrResults(parsed);
      setProducts(parsed.products || []);
    } else {
      router.push('/ocr-onboarding/upload');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleProductUpdate = (index: number, field: string, value: any) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleNext = () => {
    // Sauvegarder les modifications
    const updatedResults = { ...ocrResults, products };
    localStorage.setItem('ocrResults', JSON.stringify(updatedResults));
    router.push('/ocr-onboarding/preview');
  };

  const handleBack = () => {
    router.push('/ocr-onboarding/configure');
  };

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Navigation étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">📊 OCR Smart Onboarding - Review & Edit</h1>
          <div className="text-sm text-gray-600">Étape 3/5</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Correction des produits extraits</h2>

        <div className="space-y-6">
          {products.map((product, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Nom du produit */}
                <div>
                  <label className="block text-sm font-medium mb-1">Nom du produit</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleProductUpdate(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                {/* Icône (nouveau champ) */}
                <div>
                  <label className="block text-sm font-medium mb-1">Icône</label>
                  <input
                    type="text"
                    placeholder="🍔"
                    onChange={(e) => handleProductUpdate(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={product.description}
                  onChange={(e) => handleProductUpdate(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                />
              </div>

              {/* Prix */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prix sur place (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.price_onsite}
                    onChange={(e) => handleProductUpdate(index, 'price_onsite', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prix livraison (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.price_delivery}
                    onChange={(e) => handleProductUpdate(index, 'price_delivery', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Confiance OCR */}
              <div className="mt-3 text-sm">
                <span className={`px-2 py-1 rounded ${
                  product.confidence > 80 ? 'bg-green-100 text-green-800' :
                  product.confidence > 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Confiance OCR: {product.confidence}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600"
          >
            ← Retour
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Générer le SQL →
          </button>
        </div>
      </div>
    </div>
  );
}