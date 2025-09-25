// API pour la gestion des vitrines - CRUD principal
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration PRODUCTION - Même config que restaurants/management
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Récupérer toutes les vitrines
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');

    let query = supabase
      .from('restaurant_vitrine_settings')
      .select(`
        *,
        restaurant:france_restaurants(
          name, phone, whatsapp_number,
          address, city, business_hours
        )
      `);

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération vitrines:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, vitrines: data });
  } catch (error) {
    console.error('Erreur API vitrines GET:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle vitrine
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await request.json();

    // Validation des champs requis
    if (!body.restaurant_id || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'restaurant_id et slug sont requis' },
        { status: 400 }
      );
    }

    // Validation des couleurs
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (body.primary_color && !colorRegex.test(body.primary_color)) {
      return NextResponse.json(
        { success: false, error: 'Format de couleur invalide pour primary_color' },
        { status: 400 }
      );
    }

    if (body.secondary_color && !colorRegex.test(body.secondary_color)) {
      return NextResponse.json(
        { success: false, error: 'Format de couleur invalide pour secondary_color' },
        { status: 400 }
      );
    }

    // Vérifier que le restaurant existe
    const { data: restaurant, error: restaurantError } = await supabase
      .from('france_restaurants')
      .select('id, name')
      .eq('id', body.restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    // Insérer la nouvelle vitrine
    const { data, error } = await supabase
      .from('restaurant_vitrine_settings')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Erreur création vitrine:', error);

      // Gestion des erreurs spécifiques
      if (error.code === '23505') { // Contrainte d'unicité
        if (error.message.includes('restaurant_id')) {
          return NextResponse.json(
            { success: false, error: 'Ce restaurant a déjà une vitrine' },
            { status: 409 }
          );
        }
        if (error.message.includes('slug')) {
          return NextResponse.json(
            { success: false, error: 'Ce slug est déjà utilisé' },
            { status: 409 }
          );
        }
      }

      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, vitrine: data }, { status: 201 });
  } catch (error) {
    console.error('Erreur API vitrines POST:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}