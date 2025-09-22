// 🎛️ MODALE ÉDITION CATÉGORIE - INTERFACE MODERNE
// =================================================

'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price_on_site_base: number;
  price_delivery_base: number;
  product_type: 'simple' | 'composite' | 'modular';
  display_order: number;
  composition?: string;
  requires_steps: boolean;
  steps_config?: any;
  workflow_type?: string;
  category_id: number;
  restaurant_id: number;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  products: Product[];
  onSave: (changes: any[]) => void;
  selectedRestaurant: { id: number; name: string } | null;
}

export default function CategoryEditModal({
  isOpen,
  onClose,
  category,
  products: initialProducts,
  onSave,
  selectedRestaurant
}: CategoryEditModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [changes, setChanges] = useState<any[]>([]);
  const [nextId, setNextId] = useState(1000); // ID temporaire pour nouveaux produits

  // États pour l'édition inline du nom de catégorie
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (initialProducts) {
      setProducts([...initialProducts]);
      setNextId(Math.max(...initialProducts.map(p => p.id), 999) + 1);
      setChanges([]); // Reset des changements
    }
  }, [initialProducts]);

  // 🔍 DEBUG: Logs à l'ouverture de la modale
  useEffect(() => {
    if (isOpen && category) {
      console.log('🔍 [MODAL DEBUG] Ouverture modale d\'édition:');
      console.log('📂 Category:', category);
      console.log('🏪 Selected Restaurant:', selectedRestaurant);
      console.log('📦 Initial Products:', initialProducts);
      console.log('📋 Products with category_id:', initialProducts?.map(p => ({ name: p.name, category_id: p.category_id, restaurant_id: p.restaurant_id })));
    }
  }, [isOpen, category, selectedRestaurant, initialProducts]);

  if (!isOpen || !category) return null;

  const handleProductChange = (index: number, field: string, value: any) => {
    const updatedProducts = [...products];
    const oldProduct = { ...updatedProducts[index] };

    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };

    // Auto-calcul prix livraison désactivé - modification manuelle désormais
    // if (field === 'price_on_site_base') {
    //   updatedProducts[index].price_delivery_base = parseFloat(value) + 1;
    // }

    setProducts(updatedProducts);

    // Tracker les changements
    const changeIndex = changes.findIndex(c => c.productId === updatedProducts[index].id);
    if (changeIndex >= 0) {
      changes[changeIndex] = {
        ...changes[changeIndex],
        type: updatedProducts[index].id > 900 ? 'ADD' : 'UPDATE',
        productId: updatedProducts[index].id,
        oldProduct,
        newProduct: updatedProducts[index]
      };
    } else {
      changes.push({
        type: updatedProducts[index].id > 900 ? 'ADD' : 'UPDATE',
        productId: updatedProducts[index].id,
        oldProduct,
        newProduct: updatedProducts[index]
      });
    }
    setChanges([...changes]);
  };

  // Fonction pour sauvegarder le nom de catégorie
  const saveCategoryName = async () => {
    if (!category || !selectedRestaurant || !tempName.trim() || tempName.trim() === category.name) {
      setIsEditingName(false);
      return;
    }

    try {
      const response = await fetch('/api/restaurant-categories/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          restaurantId: selectedRestaurant.id,
          newName: tempName.trim()
        })
      });

      if (response.ok) {
        // Mettre à jour le nom de la catégorie localement
        category.name = tempName.trim();
        setIsEditingName(false);
      }
    } catch (error) {
      console.error('Erreur sauvegarde nom:', error);
      setIsEditingName(false);
    }
  };

  const addNewProduct = () => {
    // Analyser les produits existants pour maintenir la cohérence
    const existingProducts = initialProducts.filter(p => p.id <= 900); // Vrais produits (pas les nouveaux)
    const avgPriceOnSite = existingProducts.length > 0
      ? existingProducts.reduce((sum, p) => sum + p.price_on_site_base, 0) / existingProducts.length
      : 9.50;

    // 🔍 DEBUG: Logs avant création du nouveau produit
    console.log('🔍 [ADD PRODUCT DEBUG] Création nouveau produit:');
    console.log('📂 category.id:', category.id);
    console.log('🏪 selectedRestaurant?.id:', selectedRestaurant?.id);
    console.log('📦 existingProducts[0]?.category_id:', existingProducts[0]?.category_id);
    console.log('📦 existingProducts[0]?.restaurant_id:', existingProducts[0]?.restaurant_id);
    console.log('📊 Prix moyen calculé:', avgPriceOnSite);

    const newProduct: Product = {
      id: nextId,
      name: `NOUVEAU ${category.name.slice(0, -1)}`, // NOUVEAU GOURMET au lieu de NOUVEAU PRODUIT
      price_on_site_base: Math.round(avgPriceOnSite * 2) / 2, // Prix moyen arrondi à 0.50
      price_delivery_base: Math.round((avgPriceOnSite + 1) * 2) / 2, // +1€ arrondi à 0.50
      product_type: existingProducts[0]?.product_type || 'simple', // Type cohérent avec catégorie
      display_order: products.length + 1,
      composition: '',
      requires_steps: existingProducts[0]?.requires_steps || false, // Configuration cohérente
      steps_config: existingProducts[0]?.steps_config || {},
      category_id: category.id,
      restaurant_id: selectedRestaurant?.id || existingProducts[0]?.restaurant_id || initialProducts[0]?.restaurant_id || 1, // CRITIQUE: Restaurant sélectionné
      is_active: true // Par défaut activé
    };

    // 🔍 DEBUG: Log du produit créé
    console.log('✨ [ADD PRODUCT DEBUG] Nouveau produit créé:', newProduct);
    console.log('🎯 category_id final:', newProduct.category_id);
    console.log('🏪 restaurant_id final:', newProduct.restaurant_id);

    setProducts([...products, newProduct]);
    setChanges([...changes, {
      type: 'ADD',
      productId: nextId,
      newProduct
    }]);
    setNextId(nextId + 1);
  };

  const deleteProduct = (index: number) => {
    const productToDelete = products[index];
    const updatedProducts = products.filter((_, i) => i !== index);

    // Réorganiser display_order
    updatedProducts.forEach((product, i) => {
      product.display_order = i + 1;
    });

    setProducts(updatedProducts);

    if (productToDelete.id <= 900) {
      setChanges([...changes, {
        type: 'DELETE',
        productId: productToDelete.id,
        oldProduct: productToDelete
      }]);
    }
  };

  const handleSave = () => {
    onSave(changes);
    onClose();
  };

  const getProductIcon = (name: string) => {
    if (name.includes('VERTE')) return '🌿';
    if (name.includes('ROMAINE')) return '🥬';
    if (name.includes('CREVETTE')) return '🦐';
    if (name.includes('NIÇOISE')) return '🍅';
    if (name.includes('CHÈVRE')) return '🧀';
    if (name.includes('CESAR')) return '🥓';
    if (name.includes('PIZZA')) return '🍕';
    if (name.includes('BURGER')) return '🍔';
    if (name.includes('TACO')) return '🌮';
    return '🍽️';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {category.icon} Édition - {
                isEditingName ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={saveCategoryName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveCategoryName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    className="bg-blue-50 border border-blue-300 rounded px-2 py-1 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => {
                      setTempName(category.name);
                      setIsEditingName(true);
                    }}
                    className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    title="Cliquer pour renommer"
                  >
                    {category.name}
                  </span>
                )
              }
            </h2>
            <p className="text-gray-600 mt-1">
              {products.length} produits • {changes.length} modification(s) en attente
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`bg-gray-50 rounded-lg p-4 border transition-all ${
                  product.is_active
                    ? 'border-gray-200 hover:shadow-md'
                    : 'border-red-200 bg-red-50 opacity-75'
                }`}
              >
                {/* Gestion spéciale pour Universal Workflow V2 */}
                {product.workflow_type === 'universal_workflow_v2' ? (
                  // Affichage spécial pour Universal Workflow V2
                  <div className="col-span-13">
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⚡</span>
                          <div>
                            <h4 className="font-bold text-purple-800 text-lg">{product.name}</h4>
                            <p className="text-purple-600 text-sm">
                              🔧 Configuration Universal Workflow V2 - 6 étapes interactives
                            </p>
                            <div className="flex gap-4 mt-2">
                              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700">
                                🏪 Sur place: {product.price_on_site_base}€
                              </span>
                              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700">
                                🚚 Livraison: {product.price_delivery_base}€
                              </span>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {product.is_active ? '✅ Actif' : '❌ Inactif'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const url = `/workflow-edit?edit=${product.id}&restaurant=${selectedRestaurant?.id}`;
                              window.open(url, '_blank');
                            }}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
                          >
                            🔧 Modifier la configuration
                          </button>
                          <button
                            onClick={() => handleProductChange(index, 'is_active', !product.is_active)}
                            className={`px-4 py-2 rounded-lg font-medium ${
                              product.is_active
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {product.is_active ? '❌ Désactiver' : '✅ Activer'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Affichage normal pour les autres produits
                  <div className="grid grid-cols-13 gap-4 items-center">

                    {/* Position */}
                    <div className="col-span-1 text-center">
                      <span className="text-lg font-bold text-gray-600">
                        {getProductIcon(product.name)} {index + 1}
                      </span>
                    </div>

                    {/* Nom */}
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Prix sur place */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.50"
                          value={product.price_on_site_base || ''}
                          onChange={(e) => handleProductChange(index, 'price_on_site_base', parseFloat(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-600">€</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Sur place</div>
                    </div>

                    {/* Prix livraison */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.50"
                          value={product.price_delivery_base || ''}
                          onChange={(e) => handleProductChange(index, 'price_delivery_base', parseFloat(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-600">€</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Livraison</div>
                    </div>

                    {/* Type */}
                    <div className="col-span-2">
                      <select
                        value={product.product_type}
                        disabled
                        className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                      >
                        <option value="simple">Simple</option>
                        <option value="composite">Composite</option>
                        <option value="modular">Modular</option>
                      </select>
                    </div>

                    {/* Toggle Actif/Inactif */}
                    <div className="col-span-1 text-center">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleProductChange(index, 'is_active', !product.is_active)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            product.is_active
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            product.is_active ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                        <div className="text-xs mt-1">
                          {product.is_active ? '✅ Actif' : '❌ Inactif'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => deleteProduct(index)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}

                {/* Composition (expandable) - Seulement pour les produits non-Universal Workflow V2 */}
                {product.workflow_type !== 'universal_workflow_v2' && (
                  <div className="mt-3">
                    <textarea
                      value={product.composition || ''}
                      onChange={(e) => handleProductChange(index, 'composition', e.target.value)}
                      placeholder="Description/composition du produit..."
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bouton Ajouter */}
          <div className="mt-6 text-center">
            <button
              onClick={addNewProduct}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto font-medium"
            >
              ➕ Ajouter un produit
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-600">
            {changes.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {changes.length} modification(s) en attente
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={changes.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              💾 Générer SQL ({changes.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}