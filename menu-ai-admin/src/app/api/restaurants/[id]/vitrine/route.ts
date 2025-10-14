// API pour récupérer la vitrine d'un restaurant spécifique
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

// GET - Récupérer la vitrine d'un restaurant par son ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClientForRequest(request);
    const { id } = await params;
    const restaurantId = parseInt(id, 10);

    if (isNaN(restaurantId)) {
      return NextResponse.json(
        { success: false, error: 'ID de restaurant invalide' },
        { status: 400 }
      );
    }

    // Récupérer d'abord les infos du restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('france_restaurants')
      .select('id, name, phone, whatsapp_number, address, city, business_hours')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer la vitrine si elle existe
    const { data: vitrine, error: vitrineError } = await supabase
      .from('restaurant_vitrine_settings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    // Si la vitrine n'existe pas, on retourne les infos du restaurant sans vitrine
    if (vitrineError && vitrineError.code === 'PGRST116') {
      return NextResponse.json({
        success: true,
        vitrine: null,
        restaurant: restaurant
      });
    }

    if (vitrineError) {
      console.error('Erreur récupération vitrine restaurant:', vitrineError);
      return NextResponse.json({ success: false, error: vitrineError.message }, { status: 500 });
    }

    // Combiner les données vitrine + restaurant
    const completeVitrine = {
      ...vitrine,
      restaurant: restaurant
    };

    return NextResponse.json({
      success: true,
      vitrine: completeVitrine,
      restaurant: restaurant
    });

  } catch (error) {
    console.error('Erreur API restaurant vitrine GET:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}