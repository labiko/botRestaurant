// 🧠 API ANALYSE COMMANDE - INTELLIGENCE ARTIFICIELLE
// ===================================================

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';
import { AIResponse } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Début analyse commande...');

    // Debug de la requête
    const rawBody = await request.text();
    console.log('📋 Body reçu:', rawBody);

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      return NextResponse.json({
        success: false,
        error: 'JSON invalide: ' + parseError.message,
        confidence: 0
      });
    }

    const { command, restaurantId } = parsedBody;
    console.log('📝 Commande:', command);
    console.log('🏪 Restaurant ID:', restaurantId);

    if (!command || !restaurantId) {
      console.log('❌ Paramètres manquants');
      return NextResponse.json({
        success: false,
        error: 'Commande et restaurantId requis',
        confidence: 0
      });
    }

    // Chargement des données depuis Supabase DEV/PROD
    console.log('🔗 Création SupabaseDataLoader...');
    const dataLoader = new SupabaseDataLoader();

    // Chargement des données restaurant depuis la base
    console.log('📊 Chargement données restaurant...');
    const restaurantData = await dataLoader.getRestaurantData(restaurantId);
    console.log('✅ Données chargées:', {
      restaurant: restaurantData.restaurant?.name,
      categories: restaurantData.categories?.length,
      products: restaurantData.products?.length
    });

    // Réduction des données pour limiter les tokens
    const optimizedData = {
      restaurant: restaurantData.restaurant,
      categories: restaurantData.categories, // Toutes les catégories
      products: restaurantData.products.slice(0, 15), // Limiter à 15 produits
      sample_workflows: restaurantData.sample_workflows
    };

    // Création du prompt pour l'IA (ULTRA-INTELLIGENT)
    const systemPrompt = `
Tu es un EXPERT en gestion de base de données restaurant avec une INTELLIGENCE AVANCÉE pour analyser et modifier les menus.

📊 CONTEXTE RESTAURANT COMPLET :
${JSON.stringify(optimizedData, null, 2)}

🧠 INTELLIGENCE CONTEXTUELLE AVANCÉE :
Tu dois analyser le PATTERN des produits existants dans chaque catégorie pour :
1. **DÉTECTER LE STYLE** : Comment les produits sont nommés, structurés, décrits
2. **MAINTENIR LA COHÉRENCE** : Respecter les conventions de nommage, prix, et format
3. **OPTIMISER L'ORDRE** : Calculer automatiquement le display_order suivant
4. **ADAPTER LE TYPE** : Comprendre si c'est simple/composite/modular selon la catégorie

🎯 ANALYSE INTELLIGENTE PAR CATÉGORIE :
- **SALADES** : Format "NOM" simple, prix 7-12€, type 'simple'
- **PIZZAS** : Format descriptif, prix 10-15€, souvent 'composite' avec tailles
- **BURGERS** : Style gourmand, prix 8-14€, type 'simple' ou 'composite'
- **TACOS** : Configuration complexe, 'composite' avec steps_config
- **DESSERTS** : Noms courts, prix 3-8€, type 'simple'

🔧 RÈGLES TECHNIQUES AVANCÉES :
1. **IDs RÉELS OBLIGATOIRES** : Utiliser les vrais IDs de la base
2. **Prix automatiques** : Livraison = Sur place + 1€
3. **Display_order intelligent** : MAX(display_order) + 1 dans la catégorie
4. **Slug généré** : Minuscules, tirets, sans accents (ex: "salade-italienne")
5. **Type auto-détecté** : Selon les patterns de la catégorie
6. **Composition cohérente** : Respecter le style des descriptions existantes

🎨 DÉTECTION DE PATTERNS AVANCÉE :
Analyse les produits existants pour comprendre :
- Style de nommage (MAJUSCULES, Titre, mixte)
- Structure des descriptions (courte/longue, avec/sans ingrédients)
- Gamme de prix par catégorie
- Type de workflow (simple/composite/modular)
- Format des slugs

💡 INTELLIGENCE PRÉDICTIVE :
- Si on ajoute une "Pizza Italienne" → Détecter catégorie "Pizzas", type probable 'composite'
- Si on ajoute un "Burger Végétarien" → Catégorie "BURGERS", style cohérent
- Si on ajoute une "Salade César" → Catégorie "SALADES", format simple

RÉPONSE JSON ULTRA-STRUCTURÉE :
{
  "success": true,
  "sql": "BEGIN; INSERT INTO france_products (name, slug, category_id, restaurant_id, price_on_site_base, price_delivery_base, product_type, display_order, composition, requires_steps, steps_config, created_at, updated_at) VALUES ('Salade Italienne', 'salade-italienne', 15, 1, 9.50, 10.50, 'simple', 7, 'Salade verte, tomates, mozzarella, basilic, vinaigrette italienne', false, '{}', NOW(), NOW()); COMMIT;",
  "explanation": "Ajout intelligent d'une nouvelle salade en respectant le pattern existant : nom simple, prix cohérent, type 'simple', composition détaillée",
  "preview": {
    "action": "Ajout produit",
    "category": "SALADES (ID: 15)",
    "newProduct": "Salade Italienne",
    "position": 7,
    "priceOnSite": "9.50€",
    "priceDelivery": "10.50€",
    "type": "simple",
    "detectedPattern": "Style cohérent avec salades existantes"
  },
  "confidence": 98
}

IMPORTANT : Réponse UNIQUEMENT en JSON valide !
`;

    const userPrompt = `
COMMANDE À ANALYSER :
"${command}"

RESTAURANT ID : ${restaurantId}

Analyse cette commande et génère le SQL correspondant.

RAPPEL : Réponds UNIQUEMENT avec du JSON valide, pas de texte avant ou après !
`;

    console.log('🤖 Envoi requête OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });
    console.log('✅ Réponse OpenAI reçue');

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Pas de réponse de l\'IA');
    }

    // Parse la réponse JSON de l'IA
    let parsedResponse: AIResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      // Si l'IA n'a pas retourné du JSON valide, on crée une réponse par défaut
      parsedResponse = {
        success: false,
        error: 'Réponse IA invalide: ' + aiResponse.substring(0, 200),
        confidence: 0
      };
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Erreur API analyze-command:', error);

    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      confidence: 0
    });
  }
}