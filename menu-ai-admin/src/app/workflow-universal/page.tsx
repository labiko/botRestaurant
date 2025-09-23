'use client';

import { useState, useEffect } from 'react';
import { WorkflowGeneratorV2, UniversalWorkflow, WorkflowStep, OptionItem } from '@/lib/workflow-generator-v2';
import universalTemplate from '@/lib/universal-workflow-template.json';
import WorkflowHelpModal from '@/components/WorkflowHelpModal';

export default function WorkflowUniversalPage() {
  const [showHelp, setShowHelp] = useState(false);
  const [productName, setProductName] = useState('MON MENU CUSTOM');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [onSitePrice, setOnSitePrice] = useState(0);
  const [deliveryPrice, setDeliveryPrice] = useState(0);

  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      step: 1,
      type: 'options_selection',
      prompt: 'Choisissez votre plat principal',
      option_groups: ['Plats principaux'],
      required: true,
      max_selections: 1
    },
    {
      step: 2,
      type: 'options_selection',
      prompt: 'Ajoutez des suppléments (optionnel)',
      option_groups: ['Suppléments'],
      required: false,
      max_selections: 3
    }
  ]);

  const [optionGroups, setOptionGroups] = useState<Record<string, OptionItem[]>>({
    'Plats principaux': [
      { name: 'Pizza Margherita', price_modifier: 0, display_order: 1, emoji: '🍕' },
      { name: 'Burger Classic', price_modifier: 2, display_order: 2, emoji: '🍔' },
      { name: 'Salade César', price_modifier: -1, display_order: 3, emoji: '🥗' }
    ],
    'Suppléments': [
      { name: 'Fromage extra', price_modifier: 1, display_order: 1, emoji: '🧀' },
      { name: 'Bacon', price_modifier: 2, display_order: 2, emoji: '🥓' },
      { name: 'Sauce spéciale', price_modifier: 0.5, display_order: 3, emoji: '🍯' }
    ]
  });

  const [generatedSQL, setGeneratedSQL] = useState('');
  const [botSimulation, setBotSimulation] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Nouveaux états pour les groupes prédéfinis
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Charger la liste des restaurants et groupes au démarrage
  useEffect(() => {
    loadRestaurants();
    loadAvailableGroups();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/restaurants');
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error('Erreur chargement restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les groupes d'options prédéfinis depuis la base
  const loadAvailableGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await fetch('/api/option-groups');
      if (response.ok) {
        const data = await response.json();
        setAvailableGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
      // Fallback sur les groupes par défaut en cas d'erreur
      setAvailableGroups([
        { group_name: 'Plats', icon: '🍽️' },
        { group_name: 'Boissons', icon: '🥤' },
        { group_name: 'Desserts', icon: '🍰' },
        { group_name: 'Suppléments', icon: '➕' }
      ]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      step: steps.length + 1,
      type: 'options_selection',
      prompt: 'Nouvelle question',
      option_groups: ['Nouveau groupe'],
      required: true,
      max_selections: 1
    };
    setSteps([...steps, newStep]);
  };

  const handleUpdateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
  };

  const handleDeleteStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    // Réajuster les numéros de step
    updatedSteps.forEach((step, i) => {
      step.step = i + 1;
    });
    setSteps(updatedSteps);
  };

  const handleAddOptionGroup = (groupName: string) => {
    if (!optionGroups[groupName]) {
      setOptionGroups({
        ...optionGroups,
        [groupName]: [
          { name: 'Option 1', price_modifier: 0, display_order: 1 }
        ]
      });
    }
  };

  const handleAddOption = (groupName: string) => {
    const group = optionGroups[groupName] || [];
    const newOption: OptionItem = {
      name: `Option ${group.length + 1}`,
      price_modifier: 0,
      display_order: group.length + 1
    };
    setOptionGroups({
      ...optionGroups,
      [groupName]: [...group, newOption]
    });
  };

  const handleUpdateOption = (groupName: string, optionIndex: number, field: keyof OptionItem, value: any) => {
    const updatedGroups = { ...optionGroups };
    if (updatedGroups[groupName]) {
      updatedGroups[groupName][optionIndex] = {
        ...updatedGroups[groupName][optionIndex],
        [field]: value
      };
      setOptionGroups(updatedGroups);
    }
  };

  const handleRemoveGroup = (groupName: string) => {
    const updatedGroups = { ...optionGroups };
    delete updatedGroups[groupName];
    setOptionGroups(updatedGroups);
  };

  const handleRemoveOption = (groupName: string, optionIndex: number) => {
    const updatedGroups = { ...optionGroups };
    if (updatedGroups[groupName]) {
      updatedGroups[groupName].splice(optionIndex, 1);
      // Réajuster les display_order
      updatedGroups[groupName].forEach((option, index) => {
        option.display_order = index + 1;
      });
      setOptionGroups(updatedGroups);
    }
  };

  const handleGenerate = () => {
    if (!selectedRestaurant) {
      alert('Veuillez sélectionner un restaurant');
      return;
    }
    if (!newCategoryName.trim()) {
      alert('Veuillez saisir un nom de catégorie');
      return;
    }

    const workflow: UniversalWorkflow = {
      productName,
      restaurantId: selectedRestaurant.id,
      categoryName: newCategoryName.trim(),
      onSitePrice,
      deliveryPrice,
      steps,
      optionGroups
    };

    // Valider le workflow
    const validation = WorkflowGeneratorV2.validateForBot(workflow);
    setValidationResult(validation);

    if (validation.valid) {
      // Générer le SQL
      const sql = WorkflowGeneratorV2.generateCompleteSQL(workflow);
      setGeneratedSQL(sql);

      // Générer la simulation bot
      const simulation = WorkflowGeneratorV2.simulateBotFlow(workflow);
      setBotSimulation(simulation);
    }
  };

  const loadExampleTemplate = (type: string) => {
    if (type === 'simple') {
      setProductName('MENU SIMPLE');
      setNewCategoryName('Menus simples');
      setOnSitePrice(0);
      setDeliveryPrice(0);
      setSteps([
        {
          step: 1,
          type: 'options_selection',
          prompt: 'Choisissez votre plat',
          option_groups: ['Plats'],
          required: true,
          max_selections: 1
        },
        {
          step: 2,
          type: 'options_selection',
          prompt: 'Choisissez votre boisson',
          option_groups: ['Boissons'],
          required: true,
          max_selections: 1
        }
      ]);
      setOptionGroups({
        'Plats': [
          { name: 'Burger', price_modifier: 0, display_order: 1, emoji: '🍔' },
          { name: 'Pizza', price_modifier: 2, display_order: 2, emoji: '🍕' }
        ],
        'Boissons': [
          { name: 'Coca', price_modifier: 0, display_order: 1, emoji: '🥤' },
          { name: 'Eau', price_modifier: -1, display_order: 2, emoji: '💧' }
        ]
      });
    } else if (type === 'complex') {
      setProductName('MENU COMPLEXE');
      setNewCategoryName('Menus complexes');
      setOnSitePrice(0);
      setDeliveryPrice(0);
      setSteps([
        {
          step: 1,
          type: 'options_selection',
          prompt: 'Choisissez votre entrée',
          option_groups: ['Entrées'],
          required: false,
          max_selections: 1
        },
        {
          step: 2,
          type: 'options_selection',
          prompt: 'Choisissez votre plat principal',
          option_groups: ['Plats principaux'],
          required: true,
          max_selections: 1
        },
        {
          step: 3,
          type: 'options_selection',
          prompt: 'Ajoutez des suppléments',
          option_groups: ['Suppléments'],
          required: false,
          max_selections: 5
        },
        {
          step: 4,
          type: 'options_selection',
          prompt: 'Votre boisson',
          option_groups: ['Boissons'],
          required: true,
          max_selections: 1
        }
      ]);
      setOptionGroups({
        'Entrées': [
          { name: 'Salade', price_modifier: 0, display_order: 1, emoji: '🥗' },
          { name: 'Soupe', price_modifier: 1, display_order: 2, emoji: '🍲' }
        ],
        'Plats principaux': [
          { name: 'Steak', price_modifier: 0, display_order: 1, emoji: '🥩' },
          { name: 'Saumon', price_modifier: 3, display_order: 2, emoji: '🐟' }
        ],
        'Suppléments': [
          { name: 'Fromage', price_modifier: 1, display_order: 1, emoji: '🧀' },
          { name: 'Bacon', price_modifier: 2, display_order: 2, emoji: '🥓' }
        ],
        'Boissons': [
          { name: 'Vin', price_modifier: 3, display_order: 1, emoji: '🍷' },
          { name: 'Eau', price_modifier: 0, display_order: 2, emoji: '💧' }
        ]
      });
    } else if (type === 'pizza_complete') {
      setProductName('FORMULE PIZZA COMPLÈTE');
      setNewCategoryName('Formules pizza');
      setOnSitePrice(0);
      setDeliveryPrice(0);
      setSteps([
        {
          step: 1,
          type: 'options_selection',
          prompt: 'Choisissez votre entrée',
          option_groups: ['Entrées'],
          required: false,
          max_selections: 1
        },
        {
          step: 2,
          type: 'options_selection',
          prompt: 'Choisissez la taille de votre pizza',
          option_groups: ['Tailles pizza'],
          required: true,
          max_selections: 1
        },
        {
          step: 3,
          type: 'options_selection',
          prompt: 'Choisissez votre base',
          option_groups: ['Bases pizza'],
          required: true,
          max_selections: 1
        },
        {
          step: 4,
          type: 'options_selection',
          prompt: 'Choisissez vos garnitures (max 5)',
          option_groups: ['Garnitures extra'],
          required: false,
          max_selections: 5
        },
        {
          step: 5,
          type: 'options_selection',
          prompt: 'Choisissez votre boisson (incluse)',
          option_groups: ['Boissons formule'],
          required: true,
          max_selections: 1
        },
        {
          step: 6,
          type: 'options_selection',
          prompt: 'Choisissez votre dessert',
          option_groups: ['Desserts'],
          required: false,
          max_selections: 1
        }
      ]);
      setOptionGroups({
        'Entrées': [
          { name: 'Salade verte', price_modifier: 0, display_order: 1, emoji: '🥗' },
          { name: 'Bruschetta', price_modifier: 2, display_order: 2, emoji: '🍞' },
          { name: 'Carpaccio de bœuf', price_modifier: 4, display_order: 3, emoji: '🥩' },
          { name: 'Soupe du jour', price_modifier: 1, display_order: 4, emoji: '🍲' }
        ],
        'Tailles pizza': [
          { name: 'Petite 26cm', price_modifier: -2, display_order: 1, emoji: '🍕' },
          { name: 'Moyenne 33cm', price_modifier: 0, display_order: 2, emoji: '🍕' },
          { name: 'Grande 40cm', price_modifier: 3, display_order: 3, emoji: '🍕' },
          { name: 'Géante 50cm', price_modifier: 7, display_order: 4, emoji: '🍕' }
        ],
        'Bases pizza': [
          { name: 'Base tomate classique', price_modifier: 0, display_order: 1, emoji: '🍅' },
          { name: 'Base crème fraîche', price_modifier: 0, display_order: 2, emoji: '🥛' },
          { name: 'Base tomate + crème', price_modifier: 1, display_order: 3, emoji: '🍅' },
          { name: 'Sans base', price_modifier: -1, display_order: 4, emoji: '❌' }
        ],
        'Garnitures extra': [
          { name: 'Fromage extra', price_modifier: 1.5, display_order: 1, emoji: '🧀' },
          { name: 'Champignons', price_modifier: 1, display_order: 2, emoji: '🍄' },
          { name: 'Jambon', price_modifier: 2, display_order: 3, emoji: '🍖' },
          { name: 'Pepperoni', price_modifier: 2, display_order: 4, emoji: '🍕' },
          { name: 'Olives', price_modifier: 1, display_order: 5, emoji: '🫒' },
          { name: 'Oignons', price_modifier: 0.5, display_order: 6, emoji: '🧅' },
          { name: 'Poivrons', price_modifier: 1, display_order: 7, emoji: '🫑' },
          { name: 'Anchois', price_modifier: 2, display_order: 8, emoji: '🐟' }
        ],
        'Boissons formule': [
          { name: 'Coca 33cl', price_modifier: 0, display_order: 1, emoji: '🥤' },
          { name: 'Sprite 33cl', price_modifier: 0, display_order: 2, emoji: '🥤' },
          { name: 'Eau 50cl', price_modifier: 0, display_order: 3, emoji: '💧' },
          { name: 'Bière pression 25cl', price_modifier: 2, display_order: 4, emoji: '🍺' },
          { name: 'Vin rouge/blanc 15cl', price_modifier: 3, display_order: 5, emoji: '🍷' }
        ],
        'Desserts': [
          { name: 'Tiramisu maison', price_modifier: 3, display_order: 1, emoji: '🍰' },
          { name: 'Panna cotta', price_modifier: 3, display_order: 2, emoji: '🍮' },
          { name: 'Glace 2 boules', price_modifier: 2, display_order: 3, emoji: '🍨' },
          { name: 'Café gourmand', price_modifier: 4, display_order: 4, emoji: '☕' }
        ]
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                🚀 Workflow Universel - Générateur V2
              </h1>
              <button
                onClick={() => setShowHelp(true)}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors flex items-center gap-1"
                title="Aide et documentation"
              >
                <span className="text-lg">❓</span>
                <span className="font-medium">Guide complet</span>
              </button>
            </div>
            <p className="text-gray-600 mt-2">
              Créez des workflows complexes 100% compatibles avec le bot - Gestion automatique des options obligatoires/optionnelles
            </p>
          </div>
        </div>
      </div>

      {/* Modal d'aide */}
      <WorkflowHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Templates pré-configurés */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">⚡ Templates Pré-configurés</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionnez un template d'exemple
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      loadExampleTemplate(e.target.value);
                      e.target.value = ''; // Reset select
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="" disabled>Choisir un template...</option>
                  <option value="simple">🍽️ Menu Simple (2 étapes obligatoires)</option>
                  <option value="complex">🍱 Menu Complexe (mix obligatoire/optionnel)</option>
                  <option value="pizza_complete">🍕 FORMULE PIZZA COMPLÈTE (6 étapes - Exemple d'entraînement)</option>
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>🍕 FORMULE PIZZA COMPLÈTE</strong> : Template d'entraînement complet avec 6 étapes,
                  mix obligatoire/optionnel, choix multiples, et toutes les options détaillées.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded text-xs">
                <h4 className="font-semibold mb-1">Contenu de la FORMULE PIZZA COMPLÈTE :</h4>
                <ul className="space-y-1">
                  <li>• Étape 1: Entrée (optionnelle) - 4 options</li>
                  <li>• Étape 2: Taille pizza (obligatoire) - 4 tailles</li>
                  <li>• Étape 3: Base pizza (obligatoire) - 4 bases</li>
                  <li>• Étape 4: Garnitures (optionnelle, max 5) - 8 garnitures</li>
                  <li>• Étape 5: Boisson (obligatoire) - 5 boissons</li>
                  <li>• Étape 6: Dessert (optionnelle) - 4 desserts</li>
                  <li>• Prix base: 18€ → Prix livraison: 19€</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📝 Informations Produit</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit
                </label>
                <input
                  type="text"
                  placeholder="Nom du produit"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <select
                  value={selectedRestaurant?.id || ''}
                  onChange={(e) => {
                    const restaurant = restaurants.find(r => r.id === parseInt(e.target.value));
                    setSelectedRestaurant(restaurant);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">
                    {loading ? 'Chargement...' : 'Sélectionnez un restaurant'}
                  </option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} - {restaurant.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la nouvelle catégorie à créer
                </label>
                <input
                  type="text"
                  placeholder="Ex: Formules, Menus, Pizzas..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Une nouvelle catégorie sera créée avec ce nom
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix sur site (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Prix sur site"
                    value={onSitePrice}
                    onChange={(e) => setOnSitePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix livraison (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Prix livraison"
                    value={deliveryPrice}
                    onChange={(e) => setDeliveryPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Conseil</strong> : Le prix de livraison est généralement de +1€ par rapport au prix sur site
                </p>
              </div>
            </div>
          </div>

          {/* Configuration des steps */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🔧 Configuration des Étapes</h2>
              <button
                onClick={handleAddStep}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                + Ajouter étape
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">Étape {step.step}</h3>
                    <button
                      onClick={() => handleDeleteStep(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Question à poser"
                      value={step.prompt}
                      onChange={(e) => handleUpdateStep(index, 'prompt', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />

                    {/* Dropdown avec groupes prédéfinis */}
                    <div className="relative">
                      <select
                        value={step.option_groups[0]}
                        onChange={(e) => {
                          handleUpdateStep(index, 'option_groups', [e.target.value]);
                          handleAddOptionGroup(e.target.value);
                        }}
                        disabled={loadingGroups}
                        className="w-full px-2 py-1 border rounded text-sm bg-white"
                      >
                        <option value="">
                          {loadingGroups ? 'Chargement...' : 'Sélectionnez un groupe'}
                        </option>
                        {availableGroups.map((group) => (
                          <option key={group.id} value={group.group_name}>
                            {group.icon} {group.group_name}
                          </option>
                        ))}
                      </select>

                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={step.required}
                          onChange={(e) => handleUpdateStep(index, 'required', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Obligatoire</span>
                      </label>

                      <div className="flex items-center">
                        <span className="text-sm mr-2">Max choix:</span>
                        <input
                          type="number"
                          min="1"
                          value={step.max_selections}
                          onChange={(e) => handleUpdateStep(index, 'max_selections', parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded text-sm"
                        />
                      </div>
                    </div>

                    {!step.required && (
                      <div className="p-2 bg-yellow-100 rounded text-xs">
                        ⚠️ Le bot affichera : "0️⃣ Passer cette étape"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options pour chaque groupe */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Options par Groupe</h2>
            <div className="space-y-4">
              {Object.entries(optionGroups).map(([groupName, options]) => (
                <div key={groupName} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => {
                        const newGroupName = e.target.value;
                        if (newGroupName !== groupName) {
                          // Renommer le groupe en préservant l'ordre
                          const updatedGroups: Record<string, OptionItem[]> = {};

                          // Reconstruire l'objet en préservant l'ordre original
                          Object.entries(optionGroups).forEach(([key, value]) => {
                            if (key === groupName) {
                              updatedGroups[newGroupName] = value;
                            } else {
                              updatedGroups[key] = value;
                            }
                          });

                          setOptionGroups(updatedGroups);

                          // Mettre à jour les steps qui référencent ce groupe
                          const updatedSteps = steps.map(step => ({
                            ...step,
                            option_groups: step.option_groups.map(group =>
                              group === groupName ? newGroupName : group
                            )
                          }));
                          setSteps(updatedSteps);
                        }
                      }}
                      className="font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddOption(groupName)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        + Option
                      </button>
                      <button
                        onClick={() => handleRemoveGroup(groupName)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        title="Supprimer le groupe"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {options.map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Nom"
                        value={option.name}
                        onChange={(e) => handleUpdateOption(groupName, optIndex, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Prix"
                        value={option.price_modifier || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value === '' ? 0 : parseFloat(value);
                          handleUpdateOption(groupName, optIndex, 'price_modifier', isNaN(numericValue) ? 0 : numericValue);
                        }}
                        className="w-20 px-2 py-1 border rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Emoji"
                        value={option.emoji || ''}
                        onChange={(e) => handleUpdateOption(groupName, optIndex, 'emoji', e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      />
                      <button
                        onClick={() => handleRemoveOption(groupName, optIndex)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        title="Supprimer cette option"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700"
          >
            🚀 Générer SQL & Simulation
          </button>
        </div>

        {/* Résultats */}
        <div className="space-y-6">
          {/* Validation */}
          {validationResult && (
            <div className={`bg-white rounded-lg shadow-md p-6 ${validationResult.valid ? 'border-green-500' : 'border-red-500'} border-2`}>
              <h2 className="text-xl font-semibold mb-4">
                {validationResult.valid ? '✅ Validation Réussie' : '❌ Erreurs de Validation'}
              </h2>
              {validationResult.errors.length > 0 && (
                <div className="space-y-1 mb-4">
                  {validationResult.errors.map((error: string, i: number) => (
                    <p key={i} className="text-red-600 text-sm">{error}</p>
                  ))}
                </div>
              )}
              {validationResult.warnings.length > 0 && (
                <div className="space-y-1">
                  {validationResult.warnings.map((warning: string, i: number) => (
                    <p key={i} className="text-yellow-600 text-sm">{warning}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Simulation Bot */}
          {botSimulation && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">🤖 Simulation Bot WhatsApp</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{botSimulation}</pre>
              </div>
            </div>
          )}

          {/* SQL Généré */}
          {generatedSQL && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">📄 SQL Généré</h2>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedSQL)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  📋 Copier
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                  {generatedSQL}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}