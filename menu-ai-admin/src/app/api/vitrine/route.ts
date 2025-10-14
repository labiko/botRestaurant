// API pour la gestion des vitrines - CRUD principal
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

// GET - Récupérer toutes les vitrines
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClientForRequest(request);
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');

    // Récupérer les vitrines sans jointure
    let query = supabase
      .from('restaurant_vitrine_settings')
      .select('*');

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data: vitrines, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération vitrines:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Récupérer les infos des restaurants associés
    if (vitrines && vitrines.length > 0) {
      const restaurantIds = vitrines.map(v => v.restaurant_id);
      const { data: restaurants } = await supabase
        .from('france_restaurants')
        .select('id, name, phone, whatsapp_number, address, city, business_hours')
        .in('id', restaurantIds);

      // Combiner vitrines + restaurants
      const vitrinesWithRestaurants = vitrines.map(vitrine => ({
        ...vitrine,
        restaurant: restaurants?.find(r => r.id === vitrine.restaurant_id) || null
      }));

      return NextResponse.json({ success: true, vitrines: vitrinesWithRestaurants });
    }

    return NextResponse.json({ success: true, vitrines: [] });
  } catch (error) {
    console.error('Erreur API vitrines GET:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle vitrine
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClientForRequest(request);
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

    // Insérer la nouvelle vitrine (sans jointure)
    const { data, error } = await supabase
      .from('restaurant_vitrine_settings')
      .insert(body)
      .select('*')  // Sélectionner explicitement toutes les colonnes de la table uniquement
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