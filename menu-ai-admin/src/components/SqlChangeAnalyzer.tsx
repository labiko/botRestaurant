'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';

interface SqlChange {
  type: 'UPDATE' | 'INSERT' | 'DELETE';
  table: string;
  field: string;
  oldValue?: string | number;
  newValue?: string | number;
  condition: string;
}

interface AnalysisResult {
  productChanges: {
    id: number;
    name?: { old: string; new: string };
    priceOnSite?: { old: number; new: number };
    priceDelivery?: { old: number; new: number };
    stepsConfig?: { changed: boolean };
  };
  optionChanges: {
    byGroup: Record<string, {
      updates: Array<{ optionName: string; field: string; oldValue: any; newValue: any }>;
      inserts: Array<{ optionName: string; priceModifier: number; displayOrder: number }>;
      deletes: Array<{ displayOrders: number[] }>;
    }>;
    summary: {
      totalUpdates: number;
      totalInserts: number;
      totalDeletes: number;
      groupsAffected: number;
    };
  };
  risks: Array<{ level: 'LOW' | 'MEDIUM' | 'HIGH'; message: string }>;
}

export interface SqlChangeAnalyzerRef {
  analyzeChanges: (sql: string, productId: number) => Promise<AnalysisResult>;
}

interface Props {
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export default forwardRef<SqlChangeAnalyzerRef, Props>(function SqlChangeAnalyzer({ onAnalysisComplete }, ref) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Exposer la méthode analyzeChanges
  useImperativeHandle(ref, () => ({
    analyzeChanges
  }));

  // Fonction principale d'analyse
  const analyzeChanges = async (sql: string, productId: number): Promise<AnalysisResult> => {
    console.log('🔍 [SQL-ANALYZER] Début analyse:', {
      productId,
      sqlLength: sql.length,
      sqlPreview: sql.substring(0, 200) + '...'
    });

    setAnalyzing(true);

    try {
      // 1. Charger les données actuelles de la base
      console.log('📊 [SQL-ANALYZER] Chargement données actuelles...');
      const currentData = await fetchCurrentProductData(productId);
      console.log('📊 [SQL-ANALYZER] Données actuelles:', currentData);

      // 2. Parser le SQL pour extraire les changements
      console.log('🔎 [SQL-ANALYZER] Parsing SQL...');
      const parsedChanges = parseSqlScript(sql);
      console.log('🔎 [SQL-ANALYZER] Changements parsés:', parsedChanges);

      // 3. Comparer et identifier les différences
      console.log('⚖️ [SQL-ANALYZER] Comparaison...');
      const analysis = compareChanges(currentData, parsedChanges, productId);
      console.log('⚖️ [SQL-ANALYZER] Résultat analyse:', analysis);

      setAnalysisResult(analysis);
      onAnalysisComplete?.(analysis);

      return analysis;
    } catch (error) {
      console.error('❌ [SQL-ANALYZER] Erreur analyse SQL:', error);
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  // Charger les données actuelles depuis la base
  const fetchCurrentProductData = async (productId: number) => {
    const [productResponse, optionsResponse] = await Promise.all([
      fetch(`/api/products/${productId}/workflow-config`),
      fetch(`/api/products/${productId}/options-grouped`)
    ]);

    const productData = await productResponse.json();
    const optionsData = await optionsResponse.json();

    return {
      product: productData.product,
      options: optionsData.optionGroups || []
    };
  };

  // Parser le script SQL pour extraire les changements
  const parseSqlScript = (sql: string) => {
    const lines = sql.split('\n');
    const changes: SqlChange[] = [];

    let currentGroup = '';
    let currentOption = '';

    for (const line of lines) {
      const trimmed = line.trim();

      // Détecter les groupes
      if (trimmed.startsWith('-- Groupe:')) {
        currentGroup = trimmed.replace('-- Groupe:', '').replace(/\(.*\)/, '').trim();
      }

      // Détecter les options
      if (trimmed.startsWith('-- Option:')) {
        currentOption = trimmed.replace('-- Option:', '').trim();
      }

      // Détecter les UPDATE
      if (trimmed.startsWith('UPDATE france_products')) {
        changes.push({
          type: 'UPDATE',
          table: 'france_products',
          field: 'product',
          condition: 'product update'
        });
      }

      if (trimmed.startsWith('UPDATE france_product_options')) {
        changes.push({
          type: 'UPDATE',
          table: 'france_product_options',
          field: currentOption,
          condition: `${currentGroup} - ${currentOption}`
        });
      }

      // Détecter les INSERT
      if (trimmed.startsWith('INSERT INTO france_product_options')) {
        changes.push({
          type: 'INSERT',
          table: 'france_product_options',
          field: currentOption,
          condition: `${currentGroup} - ${currentOption}`
        });
      }

      // Détecter les DELETE
      if (trimmed.startsWith('DELETE FROM france_product_options')) {
        changes.push({
          type: 'DELETE',
          table: 'france_product_options',
          field: 'orphaned_options',
          condition: currentGroup || 'global cleanup'
        });
      }
    }

    return {
      changes,
      extractedData: extractDataFromSql(sql)
    };
  };

  // Extraire les données du SQL
  const extractDataFromSql = (sql: string) => {
    console.log('🔍 [SQL-EXTRACT] SQL à analyser:', sql);

    const productNameMatch = sql.match(/name = '([^']+)'/);
    const priceOnSiteMatch = sql.match(/price_on_site_base = ([0-9.]+)/);
    const priceDeliveryMatch = sql.match(/price_delivery_base = ([0-9.]+)/);
    const productIdMatch = sql.match(/WHERE id = (\d+)/);

    console.log('🔍 [SQL-EXTRACT] Regex matches:', {
      productNameMatch,
      priceOnSiteMatch,
      priceDeliveryMatch,
      productIdMatch
    });

    const extracted = {
      productId: productIdMatch ? parseInt(productIdMatch[1]) : null,
      productName: productNameMatch ? productNameMatch[1] : null,
      priceOnSite: priceOnSiteMatch ? parseFloat(priceOnSiteMatch[1]) : null,
      priceDelivery: priceDeliveryMatch ? parseFloat(priceDeliveryMatch[1]) : null
    };

    console.log('🔍 [SQL-EXTRACT] Données extraites:', extracted);
    return extracted;
  };

  // Comparer les changements
  const compareChanges = (currentData: any, parsedChanges: any, productId: number): AnalysisResult => {
    const risks: Array<{ level: 'LOW' | 'MEDIUM' | 'HIGH'; message: string }> = [];

    // Analyser les changements produit
    const productChanges: any = { id: productId };

    if (parsedChanges.extractedData.productName &&
        currentData.product?.name !== parsedChanges.extractedData.productName) {
      productChanges.name = {
        old: currentData.product?.name || '',
        new: parsedChanges.extractedData.productName
      };
      risks.push({
        level: 'MEDIUM',
        message: `Nom du produit changé: "${productChanges.name.old}" → "${productChanges.name.new}"`
      });
    }

    if (parsedChanges.extractedData.priceOnSite &&
        currentData.product?.price_on_site_base !== parsedChanges.extractedData.priceOnSite) {
      productChanges.priceOnSite = {
        old: currentData.product?.price_on_site_base || 0,
        new: parsedChanges.extractedData.priceOnSite
      };
      const diff = Math.abs(productChanges.priceOnSite.new - productChanges.priceOnSite.old);
      risks.push({
        level: diff > 5 ? 'HIGH' : 'MEDIUM',
        message: `Prix sur site: ${productChanges.priceOnSite.old}€ → ${productChanges.priceOnSite.new}€ (${diff > 0 ? '+' : ''}${(productChanges.priceOnSite.new - productChanges.priceOnSite.old).toFixed(2)}€)`
      });
    }

    if (parsedChanges.extractedData.priceDelivery &&
        currentData.product?.price_delivery_base !== parsedChanges.extractedData.priceDelivery) {
      productChanges.priceDelivery = {
        old: currentData.product?.price_delivery_base || 0,
        new: parsedChanges.extractedData.priceDelivery
      };
      const diff = Math.abs(productChanges.priceDelivery.new - productChanges.priceDelivery.old);
      risks.push({
        level: diff > 5 ? 'HIGH' : 'MEDIUM',
        message: `Prix livraison: ${productChanges.priceDelivery.old}€ → ${productChanges.priceDelivery.new}€ (${diff > 0 ? '+' : ''}${(productChanges.priceDelivery.new - productChanges.priceDelivery.old).toFixed(2)}€)`
      });
    }

    // Analyser les changements d'options
    const optionChanges = {
      byGroup: {} as any,
      summary: {
        totalUpdates: parsedChanges.changes.filter((c: SqlChange) => c.type === 'UPDATE' && c.table === 'france_product_options').length,
        totalInserts: parsedChanges.changes.filter((c: SqlChange) => c.type === 'INSERT').length,
        totalDeletes: parsedChanges.changes.filter((c: SqlChange) => c.type === 'DELETE').length,
        groupsAffected: new Set(parsedChanges.changes.map((c: SqlChange) => c.condition.split(' - ')[0])).size
      }
    };

    // Ajouter des risques selon le volume de changements
    if (optionChanges.summary.totalDeletes > 5) {
      risks.push({
        level: 'HIGH',
        message: `⚠️ ${optionChanges.summary.totalDeletes} suppressions d'options - Vérifiez les commandes en cours`
      });
    }

    if (optionChanges.summary.totalInserts > 10) {
      risks.push({
        level: 'MEDIUM',
        message: `📦 ${optionChanges.summary.totalInserts} nouvelles options ajoutées`
      });
    }

    if (optionChanges.summary.groupsAffected >= 6) {
      risks.push({
        level: 'HIGH',
        message: `🔄 ${optionChanges.summary.groupsAffected} groupes d'options modifiés - Impact workflow complet`
      });
    }

    // Risque par défaut si aucun changement critique
    if (risks.length === 0) {
      risks.push({
        level: 'LOW',
        message: '✅ Modifications mineures détectées - Risque faible'
      });
    }

    return {
      productChanges,
      optionChanges,
      risks
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          🔍 Analyseur de Changements SQL
        </h3>

        {analyzing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Analyse des changements en cours...</p>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-6">
            {/* Résumé des risques */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">📊 Analyse des Risques</h4>
              <div className="space-y-2">
                {analysisResult.risks.map((risk, index) => (
                  <div key={index} className={`p-3 rounded-lg text-sm ${
                    risk.level === 'HIGH' ? 'bg-red-100 text-red-800 border border-red-200' :
                    risk.level === 'MEDIUM' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                    'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    <span className="font-medium">
                      {risk.level === 'HIGH' ? '🚨' : risk.level === 'MEDIUM' ? '⚠️' : '✅'}
                    </span>
                    {' '}{risk.message}
                  </div>
                ))}
              </div>
            </div>

            {/* Changements du produit */}
            {Object.keys(analysisResult.productChanges).length > 1 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">📝 Changements Produit</h4>
                <div className="space-y-2 text-sm">
                  {analysisResult.productChanges.name && (
                    <div>
                      <span className="font-medium">Nom:</span>{' '}
                      <span className="line-through text-gray-500">{analysisResult.productChanges.name.old}</span>
                      {' → '}
                      <span className="font-medium text-blue-600">{analysisResult.productChanges.name.new}</span>
                    </div>
                  )}
                  {analysisResult.productChanges.priceOnSite && (
                    <div>
                      <span className="font-medium">Prix sur site:</span>{' '}
                      <span className="line-through text-gray-500">{analysisResult.productChanges.priceOnSite.old}€</span>
                      {' → '}
                      <span className="font-medium text-blue-600">{analysisResult.productChanges.priceOnSite.new}€</span>
                    </div>
                  )}
                  {analysisResult.productChanges.priceDelivery && (
                    <div>
                      <span className="font-medium">Prix livraison:</span>{' '}
                      <span className="line-through text-gray-500">{analysisResult.productChanges.priceDelivery.old}€</span>
                      {' → '}
                      <span className="font-medium text-blue-600">{analysisResult.productChanges.priceDelivery.new}€</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Résumé des options */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">🎯 Résumé Options</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{analysisResult.optionChanges.summary.totalUpdates}</div>
                  <div className="text-gray-600">Mises à jour</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{analysisResult.optionChanges.summary.totalInserts}</div>
                  <div className="text-gray-600">Ajouts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{analysisResult.optionChanges.summary.totalDeletes}</div>
                  <div className="text-gray-600">Suppressions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{analysisResult.optionChanges.summary.groupsAffected}</div>
                  <div className="text-gray-600">Groupes affectés</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Export des types pour utilisation externe
export type { AnalysisResult, SqlChange };