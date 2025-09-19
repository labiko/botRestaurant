// 🔄 API CLONAGE RESTAURANT - INTELLIGENCE ARTIFICIELLE
// ====================================================

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RestaurantCloneRequest {
  sourceRestaurantId: number;
  targetRestaurantName: string;
  targetRestaurantData: {
    address: string;
    phone: string;
    city: string;
    deliveryZone: number;
    deliveryFee: number;
  };
  menuData: string;
  mappingInstructions?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [CloneRestaurant] Début clonage restaurant...');

    const body: RestaurantCloneRequest = await request.json();
    const { sourceRestaurantId, targetRestaurantName, targetRestaurantData, menuData, mappingInstructions } = body;

    console.log('📋 [CloneRestaurant] Paramètres:', {
      source: sourceRestaurantId,
      target: targetRestaurantName,
      menuLength: menuData.length
    });

    // 1. Charger les données du restaurant source (template)
    console.log('📥 [CloneRestaurant] Chargement template restaurant source...');
    const dataLoader = new SupabaseDataLoader();
    const sourceData = await dataLoader.getRestaurantData(sourceRestaurantId);

    if (!sourceData.restaurant) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant source introuvable',
        confidence: 0
      });
    }

    console.log('✅ [CloneRestaurant] Template chargé:', {
      restaurant: sourceData.restaurant.name,
      categories: sourceData.categories.length,
      products: sourceData.products.length
    });

    // 2. Analyser le nouveau menu (soit JSON ChatGPT, soit texte pour notre IA)
    let aiAnalysis;

    // Vérifier si menuData est déjà du JSON (depuis ChatGPT)
    try {
      // Tenter de parser comme JSON
      const parsed = JSON.parse(menuData);

      // Vérifier que c'est bien notre format attendu
      if (parsed.categories && parsed.products && parsed.confidence) {
        console.log('📋 [CloneRestaurant] JSON ChatGPT détecté - Skip analyse IA');
        console.log(`   - ${parsed.categories.length} catégories`);
        console.log(`   - ${parsed.products.length} produits`);
        console.log(`   - ${parsed.supplements?.length || 0} suppléments`);
        aiAnalysis = parsed;
      } else {
        throw new Error('Format JSON non reconnu');
      }
    } catch (jsonError) {
      // Ce n'est pas du JSON, utiliser notre IA pour analyser
      console.log('🧠 [CloneRestaurant] Format texte détecté - Analyse IA requise...');
      aiAnalysis = await analyzeMenuWithAI(sourceData, menuData, targetRestaurantName, mappingInstructions);
    }

    // 3. Générer le SQL de clonage
    console.log('⚙️ [CloneRestaurant] Génération SQL...');
    const sqlGeneration = generateCloneSQL(sourceData, aiAnalysis, targetRestaurantName, targetRestaurantData);

    console.log('✅ [CloneRestaurant] Clonage analysé avec succès');

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      sql: sqlGeneration.sql,
      preview: sqlGeneration.preview,
      confidence: aiAnalysis.confidence || 85
    });

  } catch (error) {
    console.error('❌ [CloneRestaurant] Erreur:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse du clonage',
      confidence: 0
    }, { status: 500 });
  }
}

/**
 * Analyse le nouveau menu avec l'IA en utilisant le template source
 */
async function analyzeMenuWithAI(sourceData: any, menuData: string, targetName: string, instructions?: string): Promise<any> {
  const prompt = `Tu es un expert en clonage de restaurants pour système WhatsApp bot. Tu DOIS traiter TOUS les produits du menu.

RESTAURANT SOURCE (TEMPLATE) : ${sourceData.restaurant.name}
Catégories existantes : ${sourceData.categories.map((c: any) => c.name).join(', ')}
Produits examples : ${sourceData.products.slice(0, 5).map((p: any) => `${p.name} (${p.product_type})`).join(', ')}
Workflows disponibles : ${Object.keys(sourceData.sample_workflows || {}).join(', ')}

NOUVEAU RESTAURANT : ${targetName}
NOUVEAU MENU À ANALYSER :
"""
${menuData}
"""

INSTRUCTIONS SPÉCIALES : ${instructions || 'Aucune'}

DÉTECTION DU FORMAT :
Si le menu contient "TYPE: SIMPLE" ou "TYPE: COMPOSITE", c'est un format structuré ChatGPT.
Pour chaque produit :
- Nom suivi de " — Prix€"
- TYPE: SIMPLE → workflow_type: "simple", requires_steps: false
- TYPE: COMPOSITE → workflow_type: "composite", requires_steps: true
- WORKFLOW: → parser les ÉTAPES en steps_config
- INCLUS: → éléments gratuits automatiques
- SUPPLEMENT: → produits extras avec price_modifier positif

RÈGLES OBLIGATOIRES :
1. 🚨 TRAITER TOUS LES PRODUITS - Ne jamais en omettre un seul
2. 💰 PRIX LIVRAISON = PRIX SUR PLACE + 1€ (règle absolue)
3. 📂 CRÉER UNE CATÉGORIE pour chaque section du menu (🥡, 👨‍👩‍👧‍👦, 🥖, etc.)
4. 🏗️ WORKFLOW INTELLIGENT :
   - "simple" pour produits simples (ex: 4 Hot Wings)
   - "composite" pour menus complets avec choix (ex: Menu Tenders avec boisson)
5. 🔍 EXTRAIRE TOUS LES PRIX au format 9,00 € ou 9.00€
6. ⚙️ GÉNÉRER WORKFLOWS COMPLETS pour tous les produits composite :
   - Étapes de choix (single_choice, multiple_choice)
   - Options disponibles avec prix modificateurs
   - Configuration steps_config complète

ANALYSE DÉTAILLÉE DU MENU :
- Parse le format structuré (TYPE: SIMPLE/COMPOSITE)
- Extrait les WORKFLOW avec leurs ÉTAPES
- Identifie les SUPPLEMENT: comme extras universels
- Détecte INCLUS: pour les éléments automatiques
- Convertit le format texte en structure JSON appropriée

Réponds en JSON avec cette structure exacte (TOUS les produits obligatoires) :
{
  "confidence": 90,
  "categories": [
    {
      "originalName": "PIZZAS",
      "newName": "Les Menus Solo",
      "icon": "menu",
      "mapping": "Catégorie des menus individuels"
    }
  ],
  "products": [
    {
      "newName": "Menu Tenders",
      "price_on_site": 9.00,
      "price_delivery": 10.00,
      "category": "Les Menus Solo",
      "workflow_type": "composite",
      "sourceProduct": "TACOS",
      "requires_steps": true,
      "reasoning": "Menu complet avec choix de boisson",
      "steps_config": {
        "steps": [
          {
            "step_number": 1,
            "step_type": "single_choice",
            "title": "Choisissez votre boisson",
            "is_required": true,
            "options": [
              {"name": "Coca-Cola 33cl", "price_modifier": 0},
              {"name": "Sprite 33cl", "price_modifier": 0}
            ]
          }
        ]
      }
    }
  ],
  "supplements": [
    {
      "name": "4 Hot Wings",
      "price_modifier": 3.50,
      "applicability": "all_composite"
    }
  ],
  "mapping_strategy": "Création de catégories thématiques avec workflows adaptés",
  "estimated_complexity": "Moyen",
  "total_products_found": 21,
  "validation": "Tous les produits du menu ont été traités",
  "format_detected": "ChatGPT structured"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 4000
  });

  const response = completion.choices[0].message.content;
  if (!response) throw new Error('Pas de réponse IA');

  try {
    return JSON.parse(response);
  } catch (parseError) {
    console.error('❌ Erreur parsing IA:', parseError);
    throw new Error('Réponse IA invalide');
  }
}

/**
 * Nettoie et sécurise une chaîne pour SQL
 */
function sanitizeForSQL(str: string): string {
  return str
    .replace(/'/g, "''")  // Échapper les apostrophes
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Supprimer caractères de contrôle
    .trim();
}

/**
 * Génère le SQL de clonage complet
 */
function generateCloneSQL(sourceData: any, aiAnalysis: any, targetName: string, targetData: any): any {
  let sql = `-- 🔄 CLONAGE RESTAURANT : ${sourceData.restaurant.name} → ${targetName}\n`;
  sql += `-- Généré automatiquement par IA\n`;
  sql += `-- ⚠️  IMPORTANT: Vérifier les données avant exécution\n\n`;

  sql += `BEGIN;\n\n`;

  // 1. Créer le nouveau restaurant avec variable temporaire
  sql += `-- 1. CRÉATION RESTAURANT\n`;
  sql += `DO $$\n`;
  sql += `DECLARE\n`;
  sql += `    new_restaurant_id INTEGER;\n`;
  sql += `BEGIN\n\n`;

  sql += `-- Insérer le nouveau restaurant\n`;
  // Générer un code à 6 chiffres par défaut
  const defaultPassword = Math.floor(100000 + Math.random() * 900000).toString();

  // Horaires par défaut : 07h-23h50 tous les jours
  const defaultBusinessHours = JSON.stringify({
    "lundi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "mardi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "mercredi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "jeudi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "vendredi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "samedi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "dimanche": {"isOpen": true, "opening": "07:00", "closing": "23:50"}
  });

  sql += `INSERT INTO france_restaurants (\n`;
  sql += `  name, slug, address, city, phone, whatsapp_number, password_hash, delivery_zone_km, delivery_fee, is_active, business_hours\n`;
  sql += `) VALUES (\n`;
  sql += `  '${sanitizeForSQL(targetName)}',\n`;
  sql += `  '${targetName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-')}',\n`;
  sql += `  '${sanitizeForSQL(targetData.address)}',\n`;
  sql += `  '${sanitizeForSQL(targetData.city)}',\n`;
  sql += `  '${sanitizeForSQL(targetData.phone)}',\n`;
  sql += `  '${sanitizeForSQL(targetData.phone)}',\n`;
  sql += `  '${defaultPassword}',\n`;
  sql += `  ${targetData.deliveryZone},\n`;
  sql += `  ${targetData.deliveryFee},\n`;
  sql += `  true,\n`;
  sql += `  '${defaultBusinessHours}'::jsonb\n`;
  sql += `) RETURNING id INTO new_restaurant_id;\n\n`;

  sql += `RAISE NOTICE 'Restaurant créé avec ID: %', new_restaurant_id;\n\n`;

  // 2. Créer les catégories
  sql += `-- 2. CRÉATION CATÉGORIES\n`;
  aiAnalysis.categories?.forEach((cat: any, index: number) => {
    sql += `INSERT INTO france_menu_categories (\n`;
    sql += `  name, slug, icon, display_order, restaurant_id\n`;
    sql += `) VALUES (\n`;
    sql += `  '${sanitizeForSQL(cat.newName)}',\n`;
    sql += `  '${cat.newName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-')}',\n`;
    sql += `  '${cat.icon}',\n`;
    sql += `  ${index + 1},\n`;
    sql += `  new_restaurant_id\n`;
    sql += `);\n\n`;
  });

  sql += `-- 3. CRÉATION PRODUITS\n`;
  aiAnalysis.products?.forEach((product: any, index: number) => {
    const stepsConfigJson = product.steps_config ? JSON.stringify(product.steps_config).replace(/'/g, "''") : 'NULL';

    sql += `INSERT INTO france_products (\n`;
    sql += `  name, price_on_site_base, price_delivery_base, product_type,\n`;
    sql += `  workflow_type, requires_steps, steps_config, display_order, category_id, restaurant_id\n`;
    sql += `) VALUES (\n`;
    sql += `  '${sanitizeForSQL(product.newName)}',\n`;
    sql += `  ${product.price_on_site},\n`;
    sql += `  ${product.price_delivery},\n`;
    sql += `  '${product.workflow_type || 'simple'}',\n`;
    sql += `  '${product.workflow_type || 'simple'}',\n`;
    sql += `  ${product.requires_steps || false},\n`;
    sql += `  ${stepsConfigJson === 'NULL' ? 'NULL' : `'${stepsConfigJson}'::jsonb`},\n`;
    sql += `  ${index + 1},\n`;
    sql += `  (SELECT id FROM france_menu_categories WHERE name = '${sanitizeForSQL(product.category)}' AND restaurant_id = new_restaurant_id),\n`;
    sql += `  new_restaurant_id\n`;
    sql += `);\n\n`;
  });

  // 4. Création des éléments composites (si nécessaire)
  if (aiAnalysis.fixed_items && aiAnalysis.fixed_items.length > 0) {
    sql += `-- 4. CRÉATION ÉLÉMENTS COMPOSITES FIXES\n`;
    aiAnalysis.fixed_items?.forEach((fixedItem: any) => {
      fixedItem.components?.forEach((component: any) => {
        sql += `INSERT INTO france_composite_items (\n`;
        sql += `  composite_product_id, component_name, quantity, unit\n`;
        sql += `) VALUES (\n`;
        sql += `  (SELECT id FROM france_products WHERE name = '${sanitizeForSQL(fixedItem.product_name)}' AND restaurant_id = new_restaurant_id),\n`;
        sql += `  '${sanitizeForSQL(component.name)}',\n`;
        sql += `  ${component.quantity},\n`;
        sql += `  '${component.unit}'\n`;
        sql += `);\n\n`;
      });
    });
  }

  // 5. Créer les suppléments s'ils existent
  if (aiAnalysis.supplements && aiAnalysis.supplements.length > 0) {
    sql += `-- 5. CRÉATION SUPPLÉMENTS\n`;

    // Créer la catégorie Suppléments si elle n'existe pas déjà
    const hasSupplementCategory = aiAnalysis.categories?.some((cat: any) =>
      cat.newName === 'Suppléments' || cat.newName === 'Extras'
    );

    if (!hasSupplementCategory) {
      sql += `INSERT INTO france_menu_categories (\n`;
      sql += `  name, slug, icon, display_order, restaurant_id\n`;
      sql += `) VALUES (\n`;
      sql += `  'Suppléments',\n`;
      sql += `  'supplements',\n`;
      sql += `  '➕',\n`;
      sql += `  ${(aiAnalysis.categories?.length || 0) + 1},\n`;
      sql += `  new_restaurant_id\n`;
      sql += `);\n\n`;
    }

    // Ajouter chaque supplément comme produit simple
    aiAnalysis.supplements.forEach((supplement: any, index: number) => {
      sql += `INSERT INTO france_products (\n`;
      sql += `  name, price_on_site_base, price_delivery_base, product_type,\n`;
      sql += `  workflow_type, requires_steps, display_order, category_id, restaurant_id\n`;
      sql += `) VALUES (\n`;
      sql += `  '${sanitizeForSQL(supplement.name)}',\n`;
      sql += `  ${supplement.price_on_site},\n`;
      sql += `  ${supplement.price_delivery},\n`;
      sql += `  'simple',\n`;
      sql += `  'simple',\n`;
      sql += `  false,\n`;
      sql += `  ${index + 1},\n`;
      sql += `  (SELECT id FROM france_menu_categories WHERE name = 'Suppléments' AND restaurant_id = new_restaurant_id),\n`;
      sql += `  new_restaurant_id\n`;
      sql += `);\n\n`;
    });
  }

  sql += `-- 5. VÉRIFICATIONS\n`;
  sql += `RAISE NOTICE 'Catégories créées: %', (SELECT COUNT(*) FROM france_menu_categories WHERE restaurant_id = new_restaurant_id);\n`;
  sql += `RAISE NOTICE 'Produits créés: %', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = new_restaurant_id);\n`;
  sql += `RAISE NOTICE 'Suppléments créés: %', (SELECT COUNT(*) FROM france_products WHERE restaurant_id = new_restaurant_id AND category_id = (SELECT id FROM france_menu_categories WHERE name = 'Suppléments' AND restaurant_id = new_restaurant_id));\n`;
  if (aiAnalysis.fixed_items && aiAnalysis.fixed_items.length > 0) {
    sql += `RAISE NOTICE 'Éléments composites créés: %', (SELECT COUNT(*) FROM france_composite_items WHERE composite_product_id IN (SELECT id FROM france_products WHERE restaurant_id = new_restaurant_id));\n`;
  }
  sql += `\n`;

  sql += `END $$;\n\n`;
  sql += `COMMIT;\n\n`;

  sql += `-- 5. VÉRIFICATION FINALE\n`;
  sql += `SELECT 'Restaurant créé:' as type, name, id FROM france_restaurants WHERE name = '${sanitizeForSQL(targetName)}' ORDER BY id DESC LIMIT 1;\n`;
  sql += `SELECT 'Catégories:' as type, name, id FROM france_menu_categories WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE name = '${sanitizeForSQL(targetName)}' ORDER BY id DESC LIMIT 1);\n`;
  sql += `SELECT 'Produits:' as type, name, price_on_site_base, price_delivery_base FROM france_products WHERE restaurant_id = (SELECT id FROM france_restaurants WHERE name = '${sanitizeForSQL(targetName)}' ORDER BY id DESC LIMIT 1);\n`;

  // Aperçu de ce qui sera créé
  const preview = {
    restaurant: {
      name: targetName,
      categories: aiAnalysis.categories?.length || 0,
      products: aiAnalysis.products?.length || 0,
      supplements: aiAnalysis.supplements?.length || 0
    },
    mapping: aiAnalysis.mapping_strategy,
    complexity: aiAnalysis.estimated_complexity
  };

  return { sql, preview };
}