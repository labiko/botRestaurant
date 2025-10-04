'use client';

import { useState, useEffect } from 'react';
import { WorkflowGeneratorV2, UniversalWorkflow, WorkflowStep, OptionItem } from '@/lib/workflow-generator-v2';
import universalTemplate from '@/lib/universal-workflow-template.json';
import WorkflowHelpModal from '@/components/WorkflowHelpModal';
import { useFetch } from '@/hooks/useFetch';

export default function WorkflowUniversalPage() {
  const { fetch: fetchWithEnv } = useFetch();
  const [activeTab, setActiveTab] = useState<'workflow' | 'groups' | 'pizzas' | 'workflow-import'>('workflow');
  const [showHelp, setShowHelp] = useState(false);
  const [productName, setProductName] = useState('MON MENU CUSTOM');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [onSitePrice, setOnSitePrice] = useState(0);
  const [deliveryPrice, setDeliveryPrice] = useState(0);

  // États pour l'administration des groupes
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [availableIcons, setAvailableIcons] = useState<any[]>([]);
  const [iconSearchTerm, setIconSearchTerm] = useState('');
  const [selectedOptionForIcon, setSelectedOptionForIcon] = useState<{groupName: string, optionIndex: number} | null>(null);

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

  // États pour l'import des pizzas
  const [pizzaConfig, setPizzaConfig] = useState({
    priceSeniorOnSite: 9,
    priceSeniorDelivery: 10,
    priceMegaOnSite: 12,
    priceMegaDelivery: 13,
    presetName: 'standard'
  });

  // États séparés pour Workflow Import
  const [workflowImportData, setWorkflowImportData] = useState({
    productName: 'MON MENU CUSTOM',
    selectedRestaurant: null,
    newCategoryName: '',
    onSitePrice: 0,
    deliveryPrice: 0,
    steps: [
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
    ],
    optionGroups: {
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
    }
  });

  // États pour les textes d'import
  const [importTexts, setImportTexts] = useState<Record<string, string>>({});

  // État pour le sélecteur d'icônes (Workflow Import)
  const [selectedOptionForIconImport, setSelectedOptionForIconImport] = useState<{groupName: string, optionIndex: number} | null>(null);


  const [pizzasImportData, setPizzasImportData] = useState({
    categoryName: '',
    categoryIcon: '🍕',
    pizzasText: '',
    parsedPizzas: [] as any[],
    generatedSQL: ''
  });

  // Presets de configuration prix
  const pricePresets = {
    standard: {
      name: "📊 Standard (+1€ partout)",
      description: "Sénior 9€/10€ - Méga 12€/13€",
      priceSeniorOnSite: 9,
      priceSeniorDelivery: 10,
      priceMegaOnSite: 12,
      priceMegaDelivery: 13
    },
    ocv: {
      name: "🍕 Type OCV (+1€/+2€)",
      description: "Sénior 9€/10€ - Méga 12€/14€",
      priceSeniorOnSite: 9,
      priceSeniorDelivery: 10,
      priceMegaOnSite: 12,
      priceMegaDelivery: 14
    },
    custom: {
      name: "⚙️ Personnalisé",
      description: "Configuration manuelle"
    }
  };

  // Charger la liste des restaurants et groupes au démarrage
  useEffect(() => {
    loadRestaurants();
    loadAvailableGroups();
    loadAvailableIcons();
  }, []);

  // Charger les icônes disponibles depuis france_icons
  const loadAvailableIcons = async () => {
    try {
      console.log('🔄 Chargement des icônes...');
      const response = await fetchWithEnv('/api/icons');
      console.log('📡 Réponse API icons:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Icônes chargées:', data.icons?.length || 0);
        setAvailableIcons(data.icons || []);
      } else {
        console.error('❌ Erreur API icons:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erreur chargement icônes:', error);
    }
  };

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

  // Charger les groupes d'options prédéfinis depuis la base
  const loadAvailableGroups = async () => {
    try {
      setLoadingGroups(true);
      console.log('🔄 Chargement des groupes...');
      const response = await fetchWithEnv('/api/option-groups');
      console.log('📡 Réponse API option-groups:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Groupes chargés:', data.groups?.length || 0);
        setAvailableGroups(data.groups || []);
      } else {
        console.error('❌ Erreur API option-groups:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erreur chargement groupes:', error);
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
      // Auto-remplissage intelligent selon le nom du groupe
      const getDefaultOptions = (group: string): OptionItem[] => {
        const lowerGroup = group.toLowerCase();

        if (lowerGroup.includes('viande') || lowerGroup.includes('plat')) {
          return [
            { name: 'Viande au choix', price_modifier: 0, display_order: 1, emoji: '🥩' },
            { name: 'Viande de bœuf', price_modifier: 1, display_order: 2, emoji: '🐄' },
            { name: 'Viande de porc', price_modifier: 0.5, display_order: 3, emoji: '🐷' }
          ];
        }

        if (lowerGroup.includes('boisson') || lowerGroup.includes('drink')) {
          return [
            { name: 'Coca', price_modifier: 0, display_order: 1, emoji: '🥤' },
            { name: 'Eau', price_modifier: -1, display_order: 2, emoji: '💧' },
            { name: 'Jus', price_modifier: 1, display_order: 3, emoji: '🧃' }
          ];
        }

        if (lowerGroup.includes('sauce')) {
          return [
            { name: 'Sauce tomate', price_modifier: 0, display_order: 1, emoji: '🍅' },
            { name: 'Sauce blanche', price_modifier: 0, display_order: 2, emoji: '🥛' },
            { name: 'Sauce épicée', price_modifier: 0.5, display_order: 3, emoji: '🌶️' }
          ];
        }

        // Fallback générique
        return [
          { name: `Option ${group} 1`, price_modifier: 0, display_order: 1, emoji: '⭐' },
          { name: `Option ${group} 2`, price_modifier: 1, display_order: 2, emoji: '✨' }
        ];
      };

      setOptionGroups({
        ...optionGroups,
        [groupName]: getDefaultOptions(groupName)
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

  // Fonction pour ajouter un groupe
  const handleAddGroup = async () => {
    console.log('🔄 Début ajout groupe:', { newGroupName, newGroupIcon });

    if (!newGroupName.trim() || !newGroupIcon.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      // Calculer le prochain display_order
      const nextOrder = availableGroups.length > 0
        ? Math.max(...availableGroups.map(g => g.display_order)) + 1
        : 1;

      console.log('📊 Ordre calculé:', nextOrder, 'Groupes disponibles:', availableGroups.length);

      const requestData = {
        group_name: newGroupName,
        icon: newGroupIcon,
        display_order: nextOrder
      };

      console.log('📤 Envoi des données:', requestData);

      const response = await fetchWithEnv('/api/option-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      console.log('📡 Réponse:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Succès:', result);

        // Recharger la liste
        await loadAvailableGroups();
        // Réinitialiser le formulaire
        setNewGroupName('');
        setNewGroupIcon('');
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur réponse:', errorData);
        alert('Erreur lors de l\'ajout du groupe: ' + (errorData.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('❌ Erreur ajout groupe:', error);
      alert('Erreur lors de l\'ajout du groupe: ' + error.message);
    }
  };

  // Fonction pour supprimer un groupe
  const handleDeleteGroup = async (id: number, groupName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${groupName}" ?`)) {
      return;
    }

    try {
      const response = await fetchWithEnv(`/api/option-groups/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Recharger la liste
        await loadAvailableGroups();
      } else {
        alert('Erreur lors de la suppression du groupe');
      }
    } catch (error) {
      console.error('Erreur suppression groupe:', error);
      alert('Erreur lors de la suppression du groupe');
    }
  };

  // Fermer le sélecteur d'icônes si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowIconPicker(false);
        setSelectedOptionForIcon(null);
      }
    };

    if (showIconPicker || selectedOptionForIcon) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showIconPicker, selectedOptionForIcon]);

  // Fonctions pour l'import des pizzas
  const handleParsePizzas = () => {
    const lines = pizzasImportData.pizzasText
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    const pizzas = [];

    lines.forEach((line) => {
      // Ignorer les lignes avec des prix (ex: "Sénior 9 € | Méga 12 €")
      if (line.match(/Sénior.*€.*Méga.*€/i)) {
        return; // Skip cette ligne
      }

      // Parser les pizzas (format: "Nom : Composition" OU "Nom – Composition")
      const pizzaMatch = line.match(/^(.+?)\s*[:\-–]\s*(.+)$/);

      if (pizzaMatch) {
        const name = pizzaMatch[1].trim();
        const composition = pizzaMatch[2].trim();

        pizzas.push({
          name,
          composition,
          slug: generateSlug(name)
        });
      }
    });

    setPizzasImportData({
      ...pizzasImportData,
      parsedPizzas: pizzas
    });
  };

  const generateSlug = (name: string): string => {
    return name.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Fonctions pour Workflow Import - VERSION SIMPLIFIÉE POUR FIXER LES PRIX
  const parseImportText = (text: string) => {
    if (!text.trim()) return [];

    const lines = text.split('\n').filter(line => line.trim());
    const options = [];

    console.log('🔍 PARSER V4 (FORMAT SIMPLE) - Analyse du texte...');

    // Parser pour format "Nom – Prix €" ou "Nom - Prix €"
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Format 1: "Nom – Prix €" (tiret long)
      const formatSimple1 = trimmedLine.match(/^(.+?)\s*–\s*([\d,]+)\s*€$/);
      if (formatSimple1) {
        const name = formatSimple1[1].trim();
        const price = parseFloat(formatSimple1[2].replace(',', '.'));

        options.push({
          name: name,
          composition: '',
          price_modifier: price,
          emoji: '🍽️'
        });

        console.log(`✅ Format simple détecté: "${name}" - ${price}€`);
        continue;
      }

      // Format 2: "Nom - Prix €" (tiret court)
      const formatSimple2 = trimmedLine.match(/^(.+?)\s*-\s*([\d,]+)\s*€$/);
      if (formatSimple2) {
        const name = formatSimple2[1].trim();
        const price = parseFloat(formatSimple2[2].replace(',', '.'));

        options.push({
          name: name,
          composition: '',
          price_modifier: price,
          emoji: '🍽️'
        });

        console.log(`✅ Format simple détecté: "${name}" - ${price}€`);
        continue;
      }

      // Format 3: "Nom : Composition - Prix €" (format avec composition)
      const formatCompose = trimmedLine.match(/^(.+?)\s*[:–-]\s*(.+?)\s*[-–]\s*([\d,]+)\s*€$/);
      if (formatCompose) {
        const name = formatCompose[1].trim();
        const composition = formatCompose[2].trim();
        const price = parseFloat(formatCompose[3].replace(',', '.'));

        options.push({
          name: name,
          composition: composition,
          price_modifier: price,
          emoji: '🍽️'
        });

        console.log(`✅ Format composé détecté: "${name}" - ${composition} - ${price}€`);
        continue;
      }

      // Format 4: Prix doubles (Sur place: X€ | Livraison: Y€)
      const formatDouble = trimmedLine.match(/^(.+?)\s*[-–:]\s*Sur place\s*:\s*([\d,]+)\s*€\s*\|\s*Livraison\s*:\s*([\d,]+)\s*€$/);
      if (formatDouble) {
        const name = formatDouble[1].trim();
        const priceOnSite = parseFloat(formatDouble[2].replace(',', '.'));
        const priceDelivery = parseFloat(formatDouble[3].replace(',', '.'));
        const maxPrice = Math.max(priceOnSite, priceDelivery);

        options.push({
          name: name,
          composition: '',
          price_modifier: maxPrice,
          emoji: '🍽️'
        });

        console.log(`✅ Format double prix détecté: "${name}" - ${maxPrice}€ (max de ${priceOnSite}€/${priceDelivery}€)`);
        continue;
      }

      console.log(`⚠️ Ligne ignorée (format non reconnu): "${trimmedLine}"`);
    }

    console.log(`📊 Parser V4 (FORMAT SIMPLE) détecté: ${options.length} produits`);
    return options;
  };

  const getEmojiByCategory = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('viande')) return '🥩';
    if (cat.includes('sauce')) return '🥫';
    if (cat.includes('supplément')) return '🧀';
    if (cat.includes('condiment')) return '🥬';
    return '🍔'; // Produits principaux par défaut
  };

  const handleImportGroup = (groupName: string, importText: string) => {
    try {
      const parsedOptions = parseImportText(importText);

      if (parsedOptions.length > 0) {
        console.log(`📊 Import "${groupName}": ${parsedOptions.length} options détectées`);

        // AJUSTEMENT DYNAMIQUE DES OPTIONS
        const currentOptions = workflowImportData.optionGroups[groupName] || [];
        const targetCount = parsedOptions.length;
        const currentCount = currentOptions.length;

        console.log(`📈 Ajustement: ${currentCount} → ${targetCount} options`);

        // CRÉER/AJUSTER LES CHAMPS AUTOMATIQUEMENT
        const adjustedOptions = [];

        for (let i = 0; i < targetCount; i++) {
          const importedOption = parsedOptions[i];

          adjustedOptions.push({
            name: importedOption.name || `Option ${i + 1}`,
            composition: importedOption.composition || '',
            price_modifier: parseFloat(importedOption.price_modifier) || 0,
            emoji: importedOption.emoji || '⭐',
            display_order: i + 1
          });
        }

        // METTRE À JOUR LE GROUPE AVEC TOUTES LES OPTIONS
        setWorkflowImportData(prev => ({
          ...prev,
          optionGroups: {
            ...prev.optionGroups,
            [groupName]: adjustedOptions
          }
        }));

        // FEEDBACK UTILISATEUR
        const added = Math.max(0, targetCount - currentCount);
        const updated = Math.min(currentCount, targetCount);

        let details = [];
        if (updated > 0) details.push(`${updated} options mises à jour`);
        if (added > 0) details.push(`${added} options ajoutées`);
        details.push(`Total: ${targetCount} options`);
      }
    } catch (error) {
      console.error('Erreur d\'import:', error);
    }
  };

  // Compter les lignes d'import détectées
  const countImportLines = (text: string) => {
    if (!text) return 0;
    return text.split('\n').filter(line => line.trim()).length;
  };

  // Vider le texte d'import
  const clearImportText = (groupName: string) => {
    setImportTexts({
      ...importTexts,
      [groupName]: ''
    });
  };

  // Mettre à jour une option après import
  const handleUpdateImportOption = (groupName: string, optionIndex: number, field: string, value: any) => {
    setWorkflowImportData(prev => ({
      ...prev,
      optionGroups: {
        ...prev.optionGroups,
        [groupName]: prev.optionGroups[groupName].map((option, idx) =>
          idx === optionIndex ? { ...option, [field]: value } : option
        )
      }
    }));
  };


  const handleGeneratePizzaSQL = () => {
    if (!selectedRestaurant || !pizzasImportData.categoryName.trim()) {
      alert('Veuillez sélectionner un restaurant et saisir un nom de catégorie');
      return;
    }

    const { categoryName, parsedPizzas } = pizzasImportData;
    const categorySlug = generateSlug(categoryName);

    let sql = `-- ========================================================================
-- SCRIPT PIZZAS - ${selectedRestaurant.name}
-- Configuration: ${pricePresets[pizzaConfig.presetName]?.name || 'Personnalisé'}
-- Sénior: ${pizzaConfig.priceSeniorOnSite}€/${pizzaConfig.priceSeniorDelivery}€
-- Méga: ${pizzaConfig.priceMegaOnSite}€/${pizzaConfig.priceMegaDelivery}€
-- ${parsedPizzas.length} pizzas × 2 tailles = ${parsedPizzas.length * 2} produits
-- Généré le: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}
-- ========================================================================

BEGIN;

DO $$
DECLARE
  v_restaurant_id INTEGER := ${selectedRestaurant.id};
  v_category_id INTEGER;
BEGIN

  RAISE NOTICE '🍕 Restaurant ID: % - Config: ${pizzaConfig.presetName}', v_restaurant_id;

  -- ================================================================
  -- CATÉGORIE
  -- ================================================================

  INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order)
  VALUES (v_restaurant_id, '${categoryName}', '${categorySlug}', '${pizzasImportData.categoryIcon}', 100)
  RETURNING id INTO v_category_id;

  RAISE NOTICE '✅ Catégorie créée - ID: %', v_category_id;

  -- ================================================================
  -- PIZZAS (${parsedPizzas.length} pizzas × 2 tailles = ${parsedPizzas.length * 2} produits)
  -- ================================================================

`;

    parsedPizzas.forEach((pizza, index) => {
      const displayOrder = index * 2 + 1;
      sql += `  -- ${pizza.name}
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_id, '🍕 ${pizza.name} Sénior', '${pizza.composition}', 'simple', ${pizzaConfig.priceSeniorOnSite}, ${pizzaConfig.priceSeniorDelivery}, false, ${displayOrder}),
    (v_restaurant_id, v_category_id, '🍕 ${pizza.name} Méga', '${pizza.composition}', 'simple', ${pizzaConfig.priceMegaOnSite}, ${pizzaConfig.priceMegaDelivery}, false, ${displayOrder + 1});

`;
    });

    sql += `  RAISE NOTICE '✅ ${parsedPizzas.length * 2} pizzas créées !';

END $$;

-- ================================================================
-- VÉRIFICATIONS
-- ================================================================

SELECT
  '✅ Produits créés' AS verification,
  COUNT(*) AS total
FROM france_products
WHERE restaurant_id = ${selectedRestaurant.id}
AND category_id = (
  SELECT id FROM france_menu_categories
  WHERE restaurant_id = ${selectedRestaurant.id}
  AND name = '${categoryName}'
);

SELECT
  c.name AS categorie,
  COUNT(p.id) AS nb_pizzas
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id
WHERE c.restaurant_id = ${selectedRestaurant.id}
AND c.name = '${categoryName}'
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

COMMIT;`;

    setPizzasImportData({
      ...pizzasImportData,
      generatedSQL: sql
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6">
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

      {/* Système de tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workflow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Workflow
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'groups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gérer les groupes
            </button>
            <button
              onClick={() => setActiveTab('pizzas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pizzas'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🍕 Import Pizzas
            </button>
            <button
              onClick={() => setActiveTab('workflow-import')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workflow-import'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔄 Workflow Import
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'workflow' ? (
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
                          value={step.max_selections || 1}
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
                    <div key={optIndex} className="flex flex-wrap gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Nom"
                        value={option.name}
                        onChange={(e) => handleUpdateOption(groupName, optIndex, 'name', e.target.value)}
                        className="flex-1 min-w-[150px] px-3 py-2 border rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Composition"
                        value={option.composition || ''}
                        onChange={(e) => handleUpdateOption(groupName, optIndex, 'composition', e.target.value)}
                        className="flex-1 min-w-[200px] px-3 py-2 border rounded text-sm text-gray-600"
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
                        className="w-24 px-3 py-2 border rounded text-sm"
                      />
                      <div className="relative flex-shrink-0">
                        <input
                          type="text"
                          placeholder="Emoji"
                          value={option.emoji || ''}
                          onClick={() => setSelectedOptionForIcon({groupName, optionIndex: optIndex})}
                          onChange={(e) => handleUpdateOption(groupName, optIndex, 'emoji', e.target.value)}
                          className="w-20 px-3 py-2 border rounded text-sm cursor-pointer text-center"
                          readOnly
                        />

                        {/* Sélecteur d'icônes pour cette option */}
                        {selectedOptionForIcon?.groupName === groupName && selectedOptionForIcon?.optionIndex === optIndex && (
                          <div className="absolute top-full mt-2 left-0 z-50 w-80 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                            <div className="sticky top-0 bg-white p-2 border-b">
                              <input
                                type="text"
                                placeholder="Rechercher une icône..."
                                value={iconSearchTerm}
                                onChange={(e) => setIconSearchTerm(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                              />
                            </div>
                            <div className="p-2">
                              {Object.entries(
                                availableIcons
                                  .filter(icon =>
                                    !iconSearchTerm ||
                                    icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
                                    icon.category.toLowerCase().includes(iconSearchTerm.toLowerCase())
                                  )
                                  .reduce((acc: any, icon) => {
                                    if (!acc[icon.category]) acc[icon.category] = [];
                                    acc[icon.category].push(icon);
                                    return acc;
                                  }, {})
                              ).map(([category, icons]: [string, any[]]) => (
                                <div key={category} className="mb-3">
                                  <div className="text-xs font-semibold text-gray-600 mb-1">{category}</div>
                                  <div className="flex flex-wrap gap-1">
                                    {icons.map((icon, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          handleUpdateOption(groupName, optIndex, 'emoji', icon.emoji);
                                          setSelectedOptionForIcon(null);
                                          setIconSearchTerm('');
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded text-2xl"
                                        title={icon.name}
                                      >
                                        {icon.emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveOption(groupName, optIndex)}
                        className="flex-shrink-0 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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
      ) : activeTab === 'groups' ? (
        /* Onglet Gérer les groupes */
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">➕ Ajouter un groupe</h2>

          {/* Formulaire d'ajout */}
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              placeholder="Nom du groupe"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Icône"
                value={newGroupIcon}
                onChange={(e) => setNewGroupIcon(e.target.value)}
                onClick={() => setShowIconPicker(true)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                readOnly
              />

              {/* Sélecteur d'icônes */}
              {showIconPicker && (
                <div className="absolute top-full mt-2 left-0 z-50 w-80 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="sticky top-0 bg-white p-2 border-b">
                    <input
                      type="text"
                      placeholder="Rechercher une icône..."
                      value={iconSearchTerm}
                      onChange={(e) => setIconSearchTerm(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="p-2">
                    {Object.entries(
                      availableIcons
                        .filter(icon =>
                          !iconSearchTerm ||
                          icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
                          icon.category.toLowerCase().includes(iconSearchTerm.toLowerCase())
                        )
                        .reduce((acc: any, icon) => {
                          if (!acc[icon.category]) acc[icon.category] = [];
                          acc[icon.category].push(icon);
                          return acc;
                        }, {})
                    ).map(([category, icons]: [string, any[]]) => (
                      <div key={category} className="mb-3">
                        <div className="text-xs font-semibold text-gray-600 mb-1">{category}</div>
                        <div className="flex flex-wrap gap-1">
                          {icons.map((icon, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setNewGroupIcon(icon.emoji);
                                setShowIconPicker(false);
                                setIconSearchTerm('');
                              }}
                              className="p-2 hover:bg-gray-100 rounded text-2xl"
                              title={icon.name}
                            >
                              {icon.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleAddGroup}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Ajouter
            </button>
          </div>

          {/* Liste des groupes existants */}
          <h3 className="text-lg font-semibold mb-4">Groupes existants :</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icône
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableGroups.map((group) => (
                  <tr key={group.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-2xl">
                      {group.icon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {group.group_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {group.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteGroup(group.id, group.group_name)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'workflow-import' ? (
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

              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>🔄 WORKFLOW IMPORT</strong> : Interface identique avec système d'import automatique.
                  Collez la sortie ChatGPT dans chaque groupe pour pré-remplir automatiquement.
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
                  value={workflowImportData.productName}
                  onChange={(e) => setWorkflowImportData({...workflowImportData, productName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <select
                  value={workflowImportData.selectedRestaurant?.id || ''}
                  onChange={(e) => {
                    const restaurant = restaurants.find(r => r.id === parseInt(e.target.value));
                    setWorkflowImportData({...workflowImportData, selectedRestaurant: restaurant});
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
                  value={workflowImportData.newCategoryName}
                  onChange={(e) => setWorkflowImportData({...workflowImportData, newCategoryName: e.target.value})}
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
                    value={workflowImportData.onSitePrice}
                    onChange={(e) => setWorkflowImportData({...workflowImportData, onSitePrice: parseFloat(e.target.value) || 0})}
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
                    value={workflowImportData.deliveryPrice}
                    onChange={(e) => setWorkflowImportData({...workflowImportData, deliveryPrice: parseFloat(e.target.value) || 0})}
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
                onClick={() => {
                  const newStep = {
                    step: workflowImportData.steps.length + 1,
                    type: 'options_selection',
                    prompt: 'Nouvelle question',
                    option_groups: ['Nouveau groupe'],
                    required: true,
                    max_selections: 1
                  };
                  setWorkflowImportData({
                    ...workflowImportData,
                    steps: [...workflowImportData.steps, newStep]
                  });
                }}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                + Ajouter étape
              </button>
            </div>

            <div className="space-y-4">
              {workflowImportData.steps.map((step, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">Étape {step.step}</h3>
                    <button
                      onClick={() => {
                        const updatedSteps = workflowImportData.steps.filter((_, i) => i !== index);
                        updatedSteps.forEach((step, i) => {
                          step.step = i + 1;
                        });
                        setWorkflowImportData({...workflowImportData, steps: updatedSteps});
                      }}
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
                      onChange={(e) => {
                        const updatedSteps = [...workflowImportData.steps];
                        updatedSteps[index] = { ...updatedSteps[index], prompt: e.target.value };
                        setWorkflowImportData({...workflowImportData, steps: updatedSteps});
                      }}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />

                    {/* Dropdown avec groupes prédéfinis */}
                    <div className="relative">
                      <select
                        value={step.option_groups[0]}
                        onChange={(e) => {
                          const updatedSteps = [...workflowImportData.steps];
                          updatedSteps[index] = { ...updatedSteps[index], option_groups: [e.target.value] };
                          setWorkflowImportData({...workflowImportData, steps: updatedSteps});

                          // Ajouter le groupe s'il n'existe pas
                          if (!workflowImportData.optionGroups[e.target.value]) {
                            setWorkflowImportData(prev => ({
                              ...prev,
                              optionGroups: {
                                ...prev.optionGroups,
                                [e.target.value]: [
                                  { name: `Option 1`, price_modifier: 0, display_order: 1, emoji: '⭐' }
                                ]
                              }
                            }));
                          }
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
                          onChange={(e) => {
                            const updatedSteps = [...workflowImportData.steps];
                            updatedSteps[index] = { ...updatedSteps[index], required: e.target.checked };
                            setWorkflowImportData({...workflowImportData, steps: updatedSteps});
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Obligatoire</span>
                      </label>

                      <div className="flex items-center">
                        <span className="text-sm mr-2">Max choix:</span>
                        <input
                          type="number"
                          min="1"
                          value={step.max_selections || 1}
                          onChange={(e) => {
                            const updatedSteps = [...workflowImportData.steps];
                            updatedSteps[index] = { ...updatedSteps[index], max_selections: parseInt(e.target.value) };
                            setWorkflowImportData({...workflowImportData, steps: updatedSteps});
                          }}
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

          {/* Options pour chaque groupe AVEC IMPORT */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Options par Groupe avec Import Auto</h2>
            <div className="space-y-4">
              {Object.entries(workflowImportData.optionGroups).map(([groupName, options]) => (
                <div key={groupName} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => {
                        const newGroupName = e.target.value;
                        if (newGroupName !== groupName) {
                          const updatedGroups = {};
                          Object.entries(workflowImportData.optionGroups).forEach(([key, value]) => {
                            if (key === groupName) {
                              updatedGroups[newGroupName] = value;
                            } else {
                              updatedGroups[key] = value;
                            }
                          });
                          setWorkflowImportData({...workflowImportData, optionGroups: updatedGroups});
                        }
                      }}
                      className="font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const group = workflowImportData.optionGroups[groupName] || [];
                          const newOption = {
                            name: `Option ${group.length + 1}`,
                            price_modifier: 0,
                            display_order: group.length + 1,
                            emoji: '⭐'
                          };
                          setWorkflowImportData({
                            ...workflowImportData,
                            optionGroups: {
                              ...workflowImportData.optionGroups,
                              [groupName]: [...group, newOption]
                            }
                          });
                        }}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        + Option
                      </button>
                      <button
                        onClick={() => {
                          const updatedGroups = { ...workflowImportData.optionGroups };
                          delete updatedGroups[groupName];
                          setWorkflowImportData({...workflowImportData, optionGroups: updatedGroups});
                        }}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        title="Supprimer le groupe"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* ZONE D'IMPORT */}
                  <div className="mb-4 p-3 bg-green-50 rounded">
                    <label className="block text-sm font-medium mb-2">
                      📥 Import automatique ({options.length} options actuelles)
                    </label>
                    <textarea
                      value={importTexts[groupName] || ''}
                      onChange={(e) => setImportTexts({
                        ...importTexts,
                        [groupName]: e.target.value
                      })}
                      placeholder="Collez ici la sortie ChatGPT..."
                      className="w-full h-24 p-2 border rounded font-mono text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleImportGroup(groupName, importTexts[groupName])}
                        disabled={!importTexts[groupName]?.trim()}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50"
                      >
                        🤖 Importer & Ajuster ({countImportLines(importTexts[groupName])} détectées)
                      </button>
                      <button
                        onClick={() => clearImportText(groupName)}
                        className="px-3 py-1 border rounded text-sm"
                      >
                        🗑️ Vider
                      </button>
                    </div>
                  </div>

                  {options.map((option, optIndex) => (
                    <div key={optIndex} className="flex flex-wrap gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Nom"
                        value={option.name}
                        onChange={(e) => handleUpdateImportOption(groupName, optIndex, 'name', e.target.value)}
                        className="flex-1 min-w-[150px] px-3 py-2 border rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Composition"
                        value={option.composition || ''}
                        onChange={(e) => handleUpdateImportOption(groupName, optIndex, 'composition', e.target.value)}
                        className="flex-1 min-w-[200px] px-3 py-2 border rounded text-sm text-gray-600"
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Prix"
                        value={option.price_modifier || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value === '' ? 0 : parseFloat(value);
                          handleUpdateImportOption(groupName, optIndex, 'price_modifier', isNaN(numericValue) ? 0 : numericValue);
                        }}
                        className="w-24 px-3 py-2 border rounded text-sm"
                      />
                      <div className="relative flex-shrink-0">
                        <input
                          type="text"
                          placeholder="Emoji"
                          value={option.emoji || ''}
                          onClick={() => setSelectedOptionForIconImport({groupName, optionIndex: optIndex})}
                          onChange={(e) => handleUpdateImportOption(groupName, optIndex, 'emoji', e.target.value)}
                          className="w-20 px-3 py-2 border rounded text-sm cursor-pointer text-center"
                          readOnly
                          title="Cliquez pour choisir une icône"
                        />

                        {/* Sélecteur d'icônes pour cette option */}
                        {selectedOptionForIconImport?.groupName === groupName && selectedOptionForIconImport?.optionIndex === optIndex && (
                          <div className="absolute top-full mt-2 left-0 z-50 w-80 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                            <div className="sticky top-0 bg-white p-2 border-b">
                              <input
                                type="text"
                                placeholder="Rechercher une icône..."
                                value={iconSearchTerm}
                                onChange={(e) => setIconSearchTerm(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                              />
                            </div>
                            <div className="grid grid-cols-6 gap-2 p-2">
                              {availableIcons
                                .filter(icon =>
                                  icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
                                  icon.tags.some((tag: string) => tag.toLowerCase().includes(iconSearchTerm.toLowerCase()))
                                )
                                .map((icon, iconIndex) => (
                                  <button
                                    key={iconIndex}
                                    onClick={() => {
                                      handleUpdateImportOption(groupName, optIndex, 'emoji', icon.emoji);
                                      setSelectedOptionForIconImport(null);
                                    }}
                                    className="p-2 text-2xl hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                                    title={icon.name}
                                  >
                                    {icon.emoji}
                                  </button>
                                ))}
                            </div>
                            <div className="sticky bottom-0 bg-white p-2 border-t">
                              <button
                                onClick={() => setSelectedOptionForIconImport(null)}
                                className="w-full px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                              >
                                Fermer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const updatedOptions = workflowImportData.optionGroups[groupName].filter((_, i) => i !== optIndex);
                          updatedOptions.forEach((option, index) => {
                            option.display_order = index + 1;
                          });
                          setWorkflowImportData({
                            ...workflowImportData,
                            optionGroups: {
                              ...workflowImportData.optionGroups,
                              [groupName]: updatedOptions
                            }
                          });
                        }}
                        className="flex-shrink-0 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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
            onClick={() => {
              if (!workflowImportData.selectedRestaurant) {
                alert('Veuillez sélectionner un restaurant');
                return;
              }
              if (!workflowImportData.newCategoryName.trim()) {
                alert('Veuillez saisir un nom de catégorie');
                return;
              }

              const workflow = {
                productName: workflowImportData.productName,
                restaurantId: workflowImportData.selectedRestaurant.id,
                categoryName: workflowImportData.newCategoryName.trim(),
                onSitePrice: workflowImportData.onSitePrice,
                deliveryPrice: workflowImportData.deliveryPrice,
                steps: workflowImportData.steps,
                optionGroups: workflowImportData.optionGroups
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
            }}
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
      ) : activeTab === 'pizzas' ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🍕 Import Automatique des Pizzas
            </h2>
            <p className="text-gray-600">
              Format : Nom – Composition (génère automatiquement 2 tailles par pizza)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Colonne 1: Configuration */}
            <div>
              <div className="space-y-4">
                {/* Sélection restaurant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant
                  </label>
                  <select
                    value={selectedRestaurant?.id || ''}
                    onChange={(e) => {
                      const rest = restaurants.find(r => r.id === parseInt(e.target.value));
                      setSelectedRestaurant(rest);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionner un restaurant</option>
                    {restaurants.map(restaurant => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nom de catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la catégorie
                  </label>
                  <input
                    type="text"
                    value={pizzasImportData.categoryName}
                    onChange={(e) => setPizzasImportData({
                      ...pizzasImportData,
                      categoryName: e.target.value
                    })}
                    placeholder="Ex: Pizzas Base Tomate"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Icône de catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icône de la catégorie
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pizzasImportData.categoryIcon}
                      onChange={(e) => setPizzasImportData({
                        ...pizzasImportData,
                        categoryIcon: e.target.value
                      })}
                      placeholder="🍅"
                      className="w-20 p-2 border border-gray-300 rounded-lg text-center text-xl"
                    />
                    <div className="flex gap-1">
                      {['🍅', '🥛', '🌶️', '🍕', '🥪', '🍔'].map(icon => (
                        <button
                          key={icon}
                          onClick={() => setPizzasImportData({
                            ...pizzasImportData,
                            categoryIcon: icon
                          })}
                          className={`p-2 text-xl rounded border transition-all hover:bg-gray-100 ${
                            pizzasImportData.categoryIcon === icon
                              ? 'border-purple-500 bg-purple-100'
                              : 'border-gray-300'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    L'icône apparaîtra dans la colonne "icon" de la catégorie
                  </div>
                </div>

                {/* Configuration prix avec presets */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">💰 Configuration Prix</h4>

                  {/* Sélecteur de preset */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuration rapide
                    </label>
                    <div className="space-y-2">
                      {Object.entries(pricePresets).map(([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => {
                            if (key !== 'custom') {
                              setPizzaConfig({
                                ...preset,
                                presetName: key
                              });
                            } else {
                              setPizzaConfig({
                                ...pizzaConfig,
                                presetName: 'custom'
                              });
                            }
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            pizzaConfig.presetName === key
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{preset.name}</div>
                              <div className="text-sm text-gray-600">{preset.description}</div>
                            </div>
                            {pizzaConfig.presetName === key && (
                              <span className="text-purple-600">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Configuration détaillée */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🏪 Sur Place
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-16">Sénior:</span>
                          <input
                            type="number"
                            step="0.5"
                            value={pizzaConfig.priceSeniorOnSite}
                            onChange={(e) => setPizzaConfig({
                              ...pizzaConfig,
                              priceSeniorOnSite: parseFloat(e.target.value),
                              presetName: 'custom'
                            })}
                            className="w-20 p-1 border rounded text-center"
                          />
                          <span className="text-sm">€</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-16">Méga:</span>
                          <input
                            type="number"
                            step="0.5"
                            value={pizzaConfig.priceMegaOnSite}
                            onChange={(e) => setPizzaConfig({
                              ...pizzaConfig,
                              priceMegaOnSite: parseFloat(e.target.value),
                              presetName: 'custom'
                            })}
                            className="w-20 p-1 border rounded text-center"
                          />
                          <span className="text-sm">€</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🚚 Livraison
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-16">Sénior:</span>
                          <input
                            type="number"
                            step="0.5"
                            value={pizzaConfig.priceSeniorDelivery}
                            onChange={(e) => setPizzaConfig({
                              ...pizzaConfig,
                              priceSeniorDelivery: parseFloat(e.target.value),
                              presetName: 'custom'
                            })}
                            className="w-20 p-1 border rounded text-center"
                          />
                          <span className="text-sm">€</span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            +{(pizzaConfig.priceSeniorDelivery - pizzaConfig.priceSeniorOnSite).toFixed(1)}€
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-16">Méga:</span>
                          <input
                            type="number"
                            step="0.5"
                            value={pizzaConfig.priceMegaDelivery}
                            onChange={(e) => setPizzaConfig({
                              ...pizzaConfig,
                              priceMegaDelivery: parseFloat(e.target.value),
                              presetName: 'custom'
                            })}
                            className="w-20 p-1 border rounded text-center"
                          />
                          <span className="text-sm">€</span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            +{(pizzaConfig.priceMegaDelivery - pizzaConfig.priceMegaOnSite).toFixed(1)}€
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Indication du preset actuel */}
                  <div className="mt-3 text-center">
                    <span className="text-sm text-gray-600">
                      Configuration actuelle:
                      <span className="font-medium text-gray-900 ml-1">
                        {pricePresets[pizzaConfig.presetName]?.name || "⚙️ Personnalisé"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Zone de texte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liste des pizzas
                  </label>
                  <div className="text-xs text-gray-500 mb-2">
                    Formats supportés : <code>Nom : Composition</code> ou <code>Nom – Composition</code>
                  </div>
                  <textarea
                    value={pizzasImportData.pizzasText}
                    onChange={(e) => setPizzasImportData({
                      ...pizzasImportData,
                      pizzasText: e.target.value
                    })}
                    placeholder={`Marguerita : Fromage, origan
Reine : Fromage, jambon, champignons
Campione : Fromage, viande hachée, champignons
Pacifique : Fromage, thon, olives, oignons
Calzone : Fromage, viande hachée ou jambon
Orientale : Merguez, œuf, poivrons, olives`}
                    className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleParsePizzas}
                    disabled={!pizzasImportData.pizzasText.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    🔍 Analyser ({pizzasImportData.pizzasText.split('\n').filter(l => l.trim()).length} lignes)
                  </button>

                  {pizzasImportData.parsedPizzas.length > 0 && (
                    <button
                      onClick={handleGeneratePizzaSQL}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      📄 Générer SQL
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne 2: Aperçu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aperçu ({pizzasImportData.parsedPizzas.length * 2} produits)
              </label>

              <div className="border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
                {pizzasImportData.parsedPizzas.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>Cliquez sur "Analyser" pour voir l'aperçu</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pizzasImportData.parsedPizzas.map((pizza, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="font-medium text-gray-900 mb-2">
                          🍕 {pizza.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {pizza.composition}
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            Sénior {pizzaConfig.priceSeniorOnSite}€/{pizzaConfig.priceSeniorDelivery}€
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            Méga {pizzaConfig.priceMegaOnSite}€/{pizzaConfig.priceMegaDelivery}€
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SQL généré */}
          {pizzasImportData.generatedSQL && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SQL Généré (Compatible script OCV)
              </label>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-64 text-sm">
                  {pizzasImportData.generatedSQL}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(pizzasImportData.generatedSQL)}
                  className="absolute top-2 right-2 bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                >
                  📋 Copier
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}


    </div>
  );
}