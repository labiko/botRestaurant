// 🧠 API ANALYSE LISTE MODIFIÉE - DÉTECTION DIFFÉRENCES
// ====================================================

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Analyse des différences de liste...');

    const { originalList, modifiedList, categoryId, restaurantId = 1 } = await request.json();

    if (!originalList || !modifiedList || !categoryId) {
      return NextResponse.json({
        success: false,
        error: 'Liste originale, modifiée et categoryId requis'
      });
    }

    const dataLoader = new SupabaseDataLoader();

    // Chargement du contexte complet de la catégorie
    const categoryData = await dataLoader.getCategoryWithProducts(categoryId);

    console.log('📊 Contexte catégorie chargé:', {
      category: categoryData.category?.name,
      products: categoryData.products?.length,
      patterns: categoryData.productPatterns
    });

    // Prompt ultra-intelligent pour détecter les différences
    const systemPrompt = `
Tu es un EXPERT en détection de changements dans les listes de produits restaurant.

📊 CONTEXTE CATÉGORIE COMPLÈTE :
Catégorie: ${categoryData.category?.name} (ID: ${categoryId})
Produits existants: ${categoryData.products?.length}
Patterns détectés: ${JSON.stringify(categoryData.productPatterns, null, 2)}

🎯 MISSION : Comparer les deux listes et détecter les DIFFÉRENCES

LISTE ORIGINALE :
${originalList}

LISTE MODIFIÉE :
${modifiedList}

🧠 INTELLIGENCE DE DÉTECTION :
1. **NOUVEAUX PRODUITS** : Éléments ajoutés dans la liste modifiée
2. **PRODUITS SUPPRIMÉS** : Éléments retirés de la liste originale
3. **PRIX MODIFIÉS** : Changements de prix sur produits existants
4. **RÉORGANISATION** : Changements d'ordre/position

🔧 GÉNÉRATION SQL INTELLIGENTE :
Pour chaque changement détecté, génère le SQL approprié :
- **AJOUT** : INSERT avec display_order, prix cohérents, type auto-détecté
- **SUPPRESSION** : DELETE ou UPDATE is_active = false
- **MODIFICATION PRIX** : UPDATE price_on_site_base et price_delivery_base
- **RÉORGANISATION** : UPDATE display_order

📋 RÈGLES TECHNIQUES :
- Prix livraison = Prix sur place + 1€
- Display_order = Position dans la liste
- Type de produit = Selon patterns catégorie (${categoryData.productPatterns?.commonType || 'simple'})
- Slug = Nom en minuscules avec tirets
- Restaurant_id = ${restaurantId}
- Category_id = ${categoryId}

RÉPONSE JSON STRUCTURE :
{
  "success": true,
  "changes": [
    {
      "type": "ADD",
      "product": "SALADE ITALIENNE",
      "position": 7,
      "price": 9.50,
      "sql": "INSERT INTO france_products...",
      "explanation": "Ajout nouvelle salade à la position 7"
    }
  ],
  "summary": "1 produit ajouté",
  "confidence": 98
}

IMPORTANT : Réponse UNIQUEMENT en JSON valide !
`;

    const userPrompt = `
Analyse ces deux listes et détecte tous les changements :

ORIGINALE VS MODIFIÉE
Compare ligne par ligne et identifie tous les changements.
`;

    console.log('🤖 Envoi requête OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });
    console.log('✅ Réponse OpenAI reçue');

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Pas de réponse de l\'IA');
    }

    // Parse la réponse JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Réponse IA invalide: ' + aiResponse.substring(0, 200)
      });
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('❌ Erreur analyse liste:', error);

    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}