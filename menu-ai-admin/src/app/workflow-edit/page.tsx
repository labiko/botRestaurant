'use client';

import { useState, useEffect, useRef } from 'react';
import { WorkflowGeneratorV2, UniversalWorkflow, WorkflowStep, OptionItem } from '@/lib/workflow-generator-v2';
import WorkflowSqlHistory, { WorkflowSqlHistoryRef } from '@/components/WorkflowSqlHistory';
import { useFetch } from '@/hooks/useFetch';

// Interfaces pour les vraies données
interface RealOption {
  id: number;
  option_name: string;
  price_modifier: number;
  display_order: number;
  is_active: boolean;
}

interface OptionGroup {
  group_order: number;
  group_name: string;
  is_required: boolean;
  max_selections: number;
  options: RealOption[];
}

export default function WorkflowEditPage() {
  const { fetch: fetchWithEnv } = useFetch();
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [onSitePrice, setOnSitePrice] = useState(0);
  const [deliveryPrice, setDeliveryPrice] = useState(0);

  // Données du produit en cours d'édition
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editRestaurantId, setEditRestaurantId] = useState<number | null>(null);

  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [optionGroups, setOptionGroups] = useState<Record<string, OptionItem[]>>({});

  // Nouveaux états pour l'interface générique à onglets
  const [realOptionGroups, setRealOptionGroups] = useState<OptionGroup[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [useGenericInterface, setUseGenericInterface] = useState(false);

  // État pour les onglets principaux de la page
  const [mainActiveTab, setMainActiveTab] = useState('edition'); // 'edition' ou 'historique'

  // États pour modal nouveau groupe
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const [generatedSQL, setGeneratedSQL] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);

  // Référence pour le composant d'historique SQL
  const sqlHistoryRef = useRef<WorkflowSqlHistoryRef>(null);

  // Charger les données au démarrage
  useEffect(() => {
    loadRestaurants();

    // Récupérer les paramètres URL
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const restaurantId = urlParams.get('restaurant');

    if (editId && restaurantId) {
      console.log('🔍 DEBUG_ICONS: ===== DEBUT useEffect =====');
      console.log('🔍 DEBUG_ICONS: editId:', editId, 'restaurantId:', restaurantId);
      console.log('🚀 [DEBUG ORDRE] 0. DEBUT useEffect - Appel loadProductForEdit');
      setEditProductId(parseInt(editId));
      setEditRestaurantId(parseInt(restaurantId));
      loadProductForEdit(parseInt(editId), parseInt(restaurantId));
    } else {
      // Rediriger vers la page principale si pas de paramètres
      window.location.href = '/workflow-universal';
    }
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetchWithEnv('/api/restaurants');
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

  const loadProductForEdit = async (productId: number, restaurantId: number) => {
    try {
      console.log('🔍 DEBUG_ICONS: ===== DEBUT loadProductForEdit =====');
      console.log('🔍 DEBUG_ICONS: productId:', productId, 'restaurantId:', restaurantId);
      setLoading(true);

      // Charger les vraies données depuis l'API
      console.log('🔍 DEBUG_ICONS: Appel workflow-config API...');
      const response = await fetchWithEnv(`/api/products/${productId}/workflow-config`);

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors du chargement');
      }

      console.log('🔍 [WORKFLOW-EDIT] Données chargées:', data);

      // Pré-remplir les champs avec les vraies données
      setProductName(data.product.name);
      setOnSitePrice(data.product.price_on_site_base);
      setDeliveryPrice(data.product.price_delivery_base);
      setCategoryName(data.product.category.name);

      // Sélectionner le restaurant
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant) {
        setSelectedRestaurant(restaurant);
      }

      // Charger la configuration workflow réelle
      if (data.workflowConfig && data.workflowConfig.steps_config && data.workflowConfig.steps_config.steps) {
        console.log('🎯 [DEBUG ORDRE] 1. CHARGEMENT STEPS:', data.workflowConfig.steps_config.steps);
        setSteps(data.workflowConfig.steps_config.steps);
      } else {
        console.log('⚠️ [DEBUG ORDRE] 1. PAS DE STEPS TROUVÉS');
      }

      // Charger les groupes d'options réels
      if (data.optionGroups && Object.keys(data.optionGroups).length > 0) {
        setOptionGroups(data.optionGroups);
      }

      console.log('✅ [WORKFLOW-EDIT] Configuration chargée:', {
        steps: data.workflowConfig.steps_config.steps?.length,
        optionGroups: Object.keys(data.optionGroups || {}).length,
        hasRealOptions: data.debug.has_real_options
      });

      // TOUJOURS essayer de charger les vraies données pour l'interface générique
      console.log('🔍 DEBUG_ICONS: ===== AVANT APPEL loadRealOptionGroups =====');
      console.log('🔍 [WORKFLOW-EDIT] Tentative chargement vraies données pour produit:', productId);
      console.log('🎯 [DEBUG ORDRE] 1.5 APPEL loadRealOptionGroups APRÈS chargement steps');
      console.log('🎯 [DEBUG ORDRE] 1.5 Steps dans state AVANT appel:', steps);
      await loadRealOptionGroups(productId, data.workflowConfig.steps_config.steps);
      console.log('🔍 DEBUG_ICONS: ===== APRÈS APPEL loadRealOptionGroups =====');

    } catch (error) {
      console.error('❌ [WORKFLOW-EDIT] Erreur chargement:', error);

      // Fallback vers des données par défaut en cas d'erreur
      setProductName('FORMULE PIZZA COMPLÈTE');
      setOnSitePrice(18.00);
      setDeliveryPrice(19.00);
      setCategoryName('Formules pizza');

      // Configuration par défaut 2 étapes
      setSteps([
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

      setOptionGroups({
        'Plats principaux': [
          { name: 'Option 1', price_modifier: 0, display_order: 1, emoji: '🍽️' },
          { name: 'Option 2', price_modifier: 1, display_order: 2, emoji: '➕' }
        ],
        'Suppléments': [
          { name: 'Supplément 1', price_modifier: 1, display_order: 1, emoji: '🧀' },
          { name: 'Supplément 2', price_modifier: 2, display_order: 2, emoji: '🥓' }
        ]
      });

    } finally {
      setLoading(false);
    }
  };

  // Charger les vraies données groupées depuis france_product_options
  const loadRealOptionGroups = async (productId: number, stepsData?: any[]) => {
    try {
      console.log('🔍 DEBUG_ICONS: ===== DEBUT loadRealOptionGroups =====');
      console.log('🔍 DEBUG_ICONS: productId:', productId);
      console.log('🎯 [DEBUG ORDRE] 2. DEBUT chargement options groupées');
      console.log('🎯 [DEBUG ORDRE] 2. Steps actuels dans le state:', steps);
      console.log('🎯 [DEBUG ORDRE] 2. Steps passés en paramètre:', stepsData);
      setLoading(true);

      // Validation de l'ID produit
      if (!productId || isNaN(productId) || productId <= 0) {
        console.error('❌ [WORKFLOW-EDIT] ID produit invalide:', productId);
        return;
      }

      // Appel API pour charger les options réelles groupées
      const apiUrl = `/api/products/${productId}/options-grouped`;
      console.log('🔍 DEBUG_ICONS: Appel API:', apiUrl);
      console.log('🔍 [WORKFLOW-EDIT] Appel API:', apiUrl);
      const response = await fetchWithEnv(apiUrl);
      console.log('🔍 DEBUG_ICONS: Réponse API reçue, status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG_ICONS: Données reçues de l\'API:', JSON.stringify(data, null, 2));
        if (data.success && data.optionGroups && data.optionGroups.length > 0) {
          // Synchroniser max_selections depuis steps_config
          let enrichedGroups = data.optionGroups;
          const stepsToUse = stepsData || steps;
          console.log('🔍 [DEBUG] Steps disponibles:', stepsToUse);
          console.log('🔍 [DEBUG] Groupes avant enrichissement:', data.optionGroups);

          if (stepsToUse && stepsToUse.length > 0) {
            enrichedGroups = data.optionGroups.map(group => {
              console.log(`🔍 [DEBUG] Traitement groupe: ${group.group_name}`);

              // Trouver le step correspondant
              const matchingStep = stepsToUse.find(
                step => step.option_groups?.includes(group.group_name)
              );

              console.log(`🔍 [DEBUG] Step trouvé pour ${group.group_name}:`, matchingStep);
              console.log(`🔍 [DEBUG] max_selections du step:`, matchingStep?.max_selections);
              console.log(`🔍 [DEBUG] max_selections du groupe original:`, group.max_selections);

              const finalMaxSelections = matchingStep?.max_selections || group.max_selections || 1;
              console.log(`🔍 [DEBUG] max_selections final pour ${group.group_name}:`, finalMaxSelections);

              return {
                ...group,
                max_selections: finalMaxSelections,
                is_required: matchingStep?.required ?? group.is_required
              };
            });
          } else {
            console.log('⚠️ [DEBUG] Aucun steps disponible pour enrichissement');
          }

          console.log('🔍 [DEBUG] Groupes après enrichissement:', enrichedGroups);
          setRealOptionGroups(enrichedGroups);
          setUseGenericInterface(true); // ACTIVER l'interface générique
          console.log('✅ [WORKFLOW-EDIT] Groupes réels chargés:', enrichedGroups.length, 'groupes');
          console.log('🎯 [WORKFLOW-EDIT] Interface générique ACTIVÉE');
        } else {
          console.log('⚠️ [WORKFLOW-EDIT] Aucun groupe trouvé, interface héritée conservée');
        }
      } else {
        const errorText = await response.text();
        console.log('🔍 DEBUG_ICONS: ERREUR API - status:', response.status);
        console.log('🔍 DEBUG_ICONS: ERREUR API - text:', errorText);
        console.error('❌ [WORKFLOW-EDIT] Erreur API options-grouped:', response.status, errorText);
        console.error('❌ [WORKFLOW-EDIT] URL appelée:', apiUrl);
      }
    } catch (error) {
      console.log('🔍 DEBUG_ICONS: EXCEPTION dans loadRealOptionGroups:', error);
      console.error('❌ [WORKFLOW-EDIT] Erreur chargement groupes:', error);
    } finally {
      setLoading(false);
      console.log('🔍 DEBUG_ICONS: ===== FIN loadRealOptionGroups =====');
    }
  };

  const handleUpdateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
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

  const handleGenerateUpdateSQL = () => {
    if (!editProductId) return;

    // Convertir realOptionGroups vers le format attendu par UniversalWorkflow
    let finalOptionGroups: Record<string, OptionItem[]> = {};

    if (useGenericInterface && realOptionGroups.length > 0) {
      // Convertir les vraies données groupées vers le format OptionItem[]
      realOptionGroups.forEach(group => {
        finalOptionGroups[group.group_name] = group.options.map(option => ({
          name: option.option_name,
          price_modifier: option.price_modifier,
          display_order: option.display_order,
          emoji: (option.icon && option.icon !== 'undefined') ? option.icon : getEmojiForGroup(group.group_name, option.option_name)
        }));
      });

      console.log('📊 [WORKFLOW-EDIT] Options converties pour validation:', {
        groupCount: Object.keys(finalOptionGroups).length,
        groups: Object.keys(finalOptionGroups),
        totalOptions: Object.values(finalOptionGroups).reduce((sum, opts) => sum + opts.length, 0)
      });
    } else {
      // Utiliser les anciennes données si pas d'interface générique
      finalOptionGroups = optionGroups;
    }

    // Générer steps intelligemment en préservant les conditional_max existants
    console.log('🔍 CONDITIONAL_MAX: Steps dans le state avant mapping:', JSON.stringify(steps, null, 2));

    const autoGeneratedSteps = realOptionGroups.map((group, index) => {
      // Chercher le step existant pour ce groupe
      const existingStep = steps.find(s => s.option_groups?.includes(group.group_name));

      console.log(`🔍 CONDITIONAL_MAX: Groupe "${group.group_name}" - existingStep trouvé:`, existingStep ? 'OUI' : 'NON');
      if (existingStep) {
        console.log(`🔍 CONDITIONAL_MAX: existingStep pour "${group.group_name}":`, JSON.stringify(existingStep, null, 2));
        console.log(`🔍 CONDITIONAL_MAX: conditional_max présent:`, existingStep.conditional_max ? 'OUI' : 'NON');
      }

      const stepData: any = {
        step: index + 1,
        type: 'options_selection' as const,
        prompt: existingStep?.prompt || `votre ${group.group_name.toLowerCase()}`,
        option_groups: [group.group_name],
        required: group.is_required,
        max_selections: group.max_selections
      };

      // 🛡️ PRÉSERVER conditional_max si présent dans le step existant
      if (existingStep?.conditional_max) {
        stepData.conditional_max = existingStep.conditional_max;
        console.log(`🔍 CONDITIONAL_MAX: AJOUTÉ à stepData pour "${group.group_name}":`, stepData.conditional_max);
      }

      return stepData;
    });

    console.log('🔍 CONDITIONAL_MAX: autoGeneratedSteps final:', JSON.stringify(autoGeneratedSteps, null, 2));

    const workflow: UniversalWorkflow = {
      productName,
      restaurantId: editRestaurantId || 0,
      categoryName,
      onSitePrice,
      deliveryPrice,
      steps: autoGeneratedSteps,
      optionGroups: finalOptionGroups
    };

    // Valider le workflow
    const validation = WorkflowGeneratorV2.validateForBot(workflow);
    setValidationResult(validation);

    console.log('🔍 [WORKFLOW-EDIT] Résultat validation:', {
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings
    });

    if (validation.valid) {
      console.log('✅ [WORKFLOW-EDIT] Validation OK, génération SQL...');
      // Générer le SQL SMART UPDATE qui préserve les IDs
      const sql = WorkflowGeneratorV2.generateSmartUpdateSQL(workflow, editProductId);
      setGeneratedSQL(sql);

      // Sauvegarder automatiquement dans l'historique via API
      console.log('🔍 [WORKFLOW-EDIT] Vérification avant sauvegarde:', {
        sqlHistoryRef: !!sqlHistoryRef.current,
        editProductId,
        productName,
        sqlLength: sql.length
      });

      if (sqlHistoryRef.current && editProductId) {
        console.log('🔄 [WORKFLOW-EDIT] Appel saveScript:', { editProductId, productName, sqlHistoryRef: !!sqlHistoryRef.current });

        // Appel async de saveScript
        sqlHistoryRef.current.saveScript(sql, productName)
          .then(() => {
            console.log('✅ [WORKFLOW-EDIT] saveScript terminé avec succès');
          })
          .catch((error) => {
            console.error('❌ [WORKFLOW-EDIT] Erreur saveScript:', error);
          });
      } else {
        console.warn('❌ [WORKFLOW-EDIT] Impossible de sauvegarder:', {
          sqlHistoryRef: !!sqlHistoryRef.current,
          sqlHistoryRefType: typeof sqlHistoryRef.current,
          editProductId,
          editProductIdType: typeof editProductId,
          productName
        });
      }
    } else {
      console.warn('❌ [WORKFLOW-EDIT] Validation échouée, pas de sauvegarde:', {
        errors: validation.errors,
        warnings: validation.warnings
      });
    }
  };

  // Fonction pour générer des emojis selon le groupe
  const getEmojiForGroup = (groupName: string, optionName: string = '') => {
    const group = groupName.toLowerCase();
    const option = optionName.toLowerCase();

    if (group.includes('entrée')) {
      if (option.includes('salade')) return '🥗';
      if (option.includes('bruschetta')) return '🍞';
      if (option.includes('carpaccio')) return '🥩';
      if (option.includes('soupe')) return '🍲';
      return '🥗';
    }
    if (group.includes('taille')) {
      if (option.includes('petite')) return '🍕';
      if (option.includes('moyenne')) return '🍕';
      if (option.includes('grande')) return '🍕';
      if (option.includes('géante')) return '🍕';
      return '📏';
    }
    if (group.includes('base')) {
      if (option.includes('tomate')) return '🍅';
      if (option.includes('crème')) return '🥛';
      if (option.includes('sans')) return '⚪';
      return '🍅';
    }
    if (group.includes('garniture')) {
      if (option.includes('fromage')) return '🧀';
      if (option.includes('champignon')) return '🍄';
      if (option.includes('jambon')) return '🥓';
      if (option.includes('pepperoni')) return '🌶️';
      if (option.includes('olive')) return '🫒';
      if (option.includes('oignon')) return '🧅';
      if (option.includes('poivron')) return '🌶️';
      if (option.includes('anchois')) return '🐟';
      return '🧀';
    }
    if (group.includes('boisson')) {
      if (option.includes('coca')) return '🥤';
      if (option.includes('sprite')) return '🥤';
      if (option.includes('eau')) return '💧';
      if (option.includes('bière')) return '🍺';
      if (option.includes('vin')) return '🍷';
      return '🥤';
    }
    if (group.includes('dessert')) {
      if (option.includes('tiramisu')) return '🍰';
      if (option.includes('panna')) return '🍮';
      if (option.includes('glace')) return '🍨';
      if (option.includes('café')) return '☕';
      return '🍰';
    }
    return '🍽️';
  };

  // Nouvelles fonctions pour l'interface générique
  const handleAddOptionToGroup = (groupIndex: number) => {
    const group = realOptionGroups[groupIndex];
    const newOption: RealOption = {
      id: Date.now(), // ID temporaire
      option_name: `Nouvelle option ${group.group_name}`,
      price_modifier: 0,
      display_order: group.options.length + 1,
      is_active: true
    };

    const updatedGroups = [...realOptionGroups];
    updatedGroups[groupIndex].options.push(newOption);
    setRealOptionGroups(updatedGroups);
  };

  const handleToggleRequired = (groupIndex: number) => {
    const updatedGroups = [...realOptionGroups];
    updatedGroups[groupIndex].is_required = !updatedGroups[groupIndex].is_required;
    setRealOptionGroups(updatedGroups);
  };

  const handleUpdateRealOption = (groupIndex: number, optionIndex: number, field: keyof RealOption, value: any) => {
    const updatedGroups = [...realOptionGroups];
    updatedGroups[groupIndex].options[optionIndex] = {
      ...updatedGroups[groupIndex].options[optionIndex],
      [field]: value
    };
    setRealOptionGroups(updatedGroups);
  };

  const handleDeleteRealOption = (groupIndex: number, optionIndex: number) => {
    const updatedGroups = [...realOptionGroups];
    updatedGroups[groupIndex].options.splice(optionIndex, 1);

    // Réorganiser display_order
    updatedGroups[groupIndex].options.forEach((option, index) => {
      option.display_order = index + 1;
    });

    setRealOptionGroups(updatedGroups);
  };

  // Fonction pour ouvrir la modal nouveau groupe
  const handleAddNewGroup = () => {
    setNewGroupName('');
    setShowNewGroupModal(true);
  };

  // Fonction pour créer un nouveau groupe
  const handleCreateNewGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: OptionGroup = {
      group_order: realOptionGroups.length + 1,
      group_name: newGroupName.trim(),
      is_required: false,
      max_selections: 1,
      options: []
    };

    setRealOptionGroups([...realOptionGroups, newGroup]);
    setActiveTabIndex(realOptionGroups.length);
    setShowNewGroupModal(false);
    setNewGroupName('');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <div className="text-lg">Chargement des données...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                ✏️ Édition Produit Workflow Universal V2
              </h1>
              {editProductId && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                  ID: {editProductId}
                </span>
              )}
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                🔒 Mode édition contrainte
              </div>
              <button
                onClick={() => window.location.href = '/workflow-universal'}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <span className="text-lg">↩️</span>
                <span className="font-medium">Retour création</span>
              </button>
            </div>
            <p className="text-gray-600 mt-2">
              <strong>Édition limitée :</strong> Modifiez uniquement les prix, noms et textes. La structure workflow (étapes, obligatoire/optionnel) est fixe.
            </p>
          </div>
        </div>
      </div>

      {/* Onglets principaux */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setMainActiveTab('edition')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                mainActiveTab === 'edition'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ✏️ Édition Produit
            </button>
            <button
              onClick={() => setMainActiveTab('historique')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                mainActiveTab === 'historique'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Historique des Scripts SQL Workflow
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {mainActiveTab === 'edition' && (
        <>
          {/* Interface générique à onglets ou interface héritée */}
          {useGenericInterface ? (
        // NOUVELLE INTERFACE GÉNÉRIQUE À ONGLETS
        <div className="space-y-6">
          {/* Header avec informations produit */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">📝 Informations Produit</h3>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ⚡ Interface générique active
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix sur site (€)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={onSitePrice}
                    onChange={(e) => setOnSitePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix livraison (€)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={deliveryPrice}
                    onChange={(e) => setDeliveryPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Restaurant :</strong> {selectedRestaurant?.name || 'Non défini'}<br/>
                <strong>Catégorie :</strong> {categoryName || 'Non définie'}
              </p>
            </div>
          </div>

          {/* Interface à onglets pour les groupes d'options */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {realOptionGroups.map((group, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTabIndex(index)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTabIndex === index
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {group.group_name}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {group.options.length}
                    </span>
                  </button>
                ))}
                <button
                  onClick={handleAddNewGroup}
                  className="py-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm whitespace-nowrap"
                >
                  + Nouveau groupe
                </button>
              </nav>
            </div>

            {/* Contenu de l'onglet actif */}
            {realOptionGroups[activeTabIndex] && (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                      {realOptionGroups[activeTabIndex].group_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleRequired(activeTabIndex)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            realOptionGroups[activeTabIndex].is_required ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              realOptionGroups[activeTabIndex].is_required ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {realOptionGroups[activeTabIndex].is_required ? '🔒 Obligatoire' : '⭕ Facultatif'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 hidden sm:inline">·</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-sm text-gray-600 whitespace-nowrap">Max :</span>
                        <input
                          type="number"
                          min="1"
                          value={realOptionGroups[activeTabIndex].max_selections}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 1;
                            const updatedGroups = [...realOptionGroups];
                            updatedGroups[activeTabIndex].max_selections = newValue;
                            setRealOptionGroups(updatedGroups);
                          }}
                          className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600 whitespace-nowrap">sélection(s)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddOptionToGroup(activeTabIndex)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
                  >
                    ➕ Ajouter option
                  </button>
                </div>

                {/* Liste des options du groupe avec formatage selon le plan */}
                <div className="space-y-2">
                  {realOptionGroups[activeTabIndex].options.map((option, optionIndex) => {
                    const emoji = (option.icon && option.icon !== 'undefined') ? option.icon : getEmojiForGroup(realOptionGroups[activeTabIndex].group_name, option.option_name);
                    const priceDisplay = option.price_modifier === 0 ? '(gratuit)' :
                                       option.price_modifier > 0 ? `(+${option.price_modifier.toFixed(2)}€)` :
                                       `(${option.price_modifier.toFixed(2)}€)`;

                    return (
                      <div key={option.id} className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          {/* Affichage formaté comme dans le plan */}
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0">{emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option.option_name}
                                  onChange={(e) => handleUpdateRealOption(activeTabIndex, optionIndex, 'option_name', e.target.value)}
                                  className="font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:bg-white focus:border focus:border-green-500 rounded px-2 py-1 flex-1 min-w-0"
                                />
                                <div className="flex items-center space-x-1 flex-shrink-0">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={option.price_modifier}
                                    onChange={(e) => handleUpdateRealOption(activeTabIndex, optionIndex, 'price_modifier', parseFloat(e.target.value) || 0)}
                                    className="w-16 text-sm text-green-600 bg-transparent border-none focus:outline-none focus:bg-white focus:border focus:border-green-500 rounded px-1"
                                  />
                                  <span className="text-sm text-green-600 font-medium whitespace-nowrap">{priceDisplay}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions sur la droite */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleUpdateRealOption(activeTabIndex, optionIndex, 'is_active', !option.is_active)}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                option.is_active
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                              title={option.is_active ? 'Désactiver' : 'Activer'}
                            >
                              {option.is_active ? '✅' : '❌'}
                            </button>
                            <button
                              onClick={() => handleDeleteRealOption(activeTabIndex, optionIndex)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {realOptionGroups[activeTabIndex].options.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune option dans ce groupe</p>
                    <p className="text-sm">Cliquez sur "Ajouter option" pour commencer</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bouton génération SQL */}
          <button
            onClick={handleGenerateUpdateSQL}
            className="w-full px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700"
          >
            🔧 Générer SQL UPDATE pour toutes les modifications
          </button>

          {/* Résultats */}
          {validationResult && (
            <div className={`bg-white rounded-lg shadow-md p-6 ${validationResult.valid ? 'border-green-500' : 'border-red-500'} border-2`}>
              <h3 className="text-lg font-bold mb-4">
                {validationResult.valid ? '✅ Validation réussie' : '❌ Erreurs de validation'}
              </h3>
              {!validationResult.valid && (
                <div className="space-y-2">
                  {validationResult.errors.map((error: string, index: number) => (
                    <div key={index} className="text-red-700 text-sm">• {error}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {generatedSQL && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🗃️ SQL UPDATE Généré</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                {generatedSQL}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(generatedSQL)}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                📋 Copier SQL
              </button>
            </div>
          )}

        </div>
      ) : (
        // INTERFACE HÉRITÉE INCHANGÉE
        <div className="text-center py-8">
          <p>Interface héritée - En cours de chargement...</p>
        </div>
      )}
        </>
      )}

      {/* Onglet Historique SQL */}
      {/* Historique visible selon l'onglet */}
      {mainActiveTab === 'historique' && (
        <div className="space-y-6">
          <WorkflowSqlHistory
            productId={editProductId}
            ref={sqlHistoryRef}
          />
        </div>
      )}

      {/* WorkflowSqlHistory toujours monté mais invisible pour maintenir la ref */}
      {mainActiveTab !== 'historique' && (
        <div style={{ display: 'none' }}>
          <WorkflowSqlHistory
            productId={editProductId}
            ref={sqlHistoryRef}
          />
        </div>
      )}

      {/* Modal nouveau groupe */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nouveau groupe d'options
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du groupe
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Tailles, Bases, Fromages..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateNewGroup}
                  disabled={!newGroupName.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}