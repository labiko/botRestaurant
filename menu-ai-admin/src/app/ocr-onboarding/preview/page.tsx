// ÉTAPE 4 : SQL Preview (/ocr-onboarding/preview)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OCRPreviewPage() {
  const router = useRouter();
  const [ocrResults, setOcrResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const results = localStorage.getItem('ocrResults');
    if (results) {
      setOcrResults(JSON.parse(results));
      generateSQL(JSON.parse(results));
    } else {
      router.push('/ocr-onboarding/upload');
      return;
    }
    setLoading(false);
  }, [router]);

  const generateSQL = async (results: any) => {
    setGenerating(true);
    try {
      // Générer le SQL basé sur les produits OCR
      const sql = generateSQLFromProducts(results.products);
      setGeneratedSQL(sql);
    } catch (error) {
      console.error('Erreur génération SQL:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateSQLFromProducts = (products: any[]) => {
    const restaurantName = "Restaurant OCR"; // TODO: récupérer depuis un formulaire
    const categoryName = "Menu Détecté";

    let sql = `-- SQL généré par OCR Smart Onboarding
BEGIN;

-- 1. Création du restaurant
INSERT INTO restaurants (name, slug, description, phone, city, delivery_fee, delivery_zone_km, is_active)
VALUES ('${restaurantName}', '${restaurantName.toLowerCase().replace(/\s+/g, '-')}', 'Restaurant importé via OCR', '', '', 2.50, 5, true)
RETURNING id as restaurant_id;

-- 2. Création de la catégorie
INSERT INTO menu_categories (restaurant_id, name, slug, display_order, is_active)
VALUES ((SELECT id FROM restaurants WHERE slug = '${restaurantName.toLowerCase().replace(/\s+/g, '-')}' ORDER BY id DESC LIMIT 1),
        '${categoryName}', '${categoryName.toLowerCase().replace(/\s+/g, '-')}', 1, true)
RETURNING id as category_id;

-- 3. Insertion des produits
`;

    products.forEach((product, index) => {
      sql += `
INSERT INTO menu_items (
  restaurant_id,
  category_id,
  name,
  slug,
  description,
  price_onsite,
  price_delivery,
  display_order,
  is_active
) VALUES (
  (SELECT id FROM restaurants WHERE slug = '${restaurantName.toLowerCase().replace(/\s+/g, '-')}' ORDER BY id DESC LIMIT 1),
  (SELECT id FROM menu_categories WHERE slug = '${categoryName.toLowerCase().replace(/\s+/g, '-')}' ORDER BY id DESC LIMIT 1),
  '${product.name.replace(/'/g, "''")}',
  '${product.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}',
  '${(product.description || '').replace(/'/g, "''")}',
  ${product.price_onsite || 0},
  ${product.price_delivery || (product.price_onsite + 1) || 1},
  ${index + 1},
  true
);`;
    });

    sql += `

-- 4. Vérifications
SELECT COUNT(*) as total_products FROM menu_items
WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = '${restaurantName.toLowerCase().replace(/\s+/g, '-')}' ORDER BY id DESC LIMIT 1);

COMMIT;
-- En cas de problème: ROLLBACK;`;

    return sql;
  };

  const handleNext = () => {
    // Sauvegarder le SQL généré
    localStorage.setItem('generatedSQL', generatedSQL);
    router.push('/ocr-onboarding/deploy');
  };

  const handleBack = () => {
    router.push('/ocr-onboarding/review');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSQL);
    alert('SQL copié dans le presse-papiers !');
  };

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Navigation étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🔍 OCR Smart Onboarding - SQL Preview</h1>
          <div className="text-sm text-gray-600">Étape 4/5</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">SQL Généré</h2>
          <button
            onClick={copyToClipboard}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            📋 Copier
          </button>
        </div>

        {generating ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3">Génération du SQL...</span>
          </div>
        ) : (
          <>
            {/* Aperçu des données */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">📊 Résumé</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Produits:</span> {ocrResults?.products?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Provider:</span> {ocrResults?.provider}
                </div>
                <div>
                  <span className="font-medium">Confiance:</span> {ocrResults?.confidence}%
                </div>
              </div>
            </div>

            {/* Code SQL */}
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-96 overflow-y-auto">
                <code>{generatedSQL}</code>
              </pre>
            </div>

            {/* Avertissement */}
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <div className="flex">
                <div className="text-yellow-400 text-xl mr-3">⚠️</div>
                <div>
                  <p className="font-medium text-yellow-800">Attention</p>
                  <p className="text-yellow-700 text-sm">
                    Vérifiez le SQL généré avant exécution. Cette opération va créer un nouveau restaurant et ses produits en base de données.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

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
            disabled={generating}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Déployer →
          </button>
        </div>
      </div>
    </div>
  );
}