import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    // Utiliser le service centralisé comme les autres APIs
    const supabase = getSupabaseClientForRequest(request);

    const { data: restaurants, error } = await supabase
      .from('france_restaurants')
      .select('id, name, is_active, created_at, updated_at, city, phone, whatsapp_number, address, password_hash, latitude, longitude, country_code, timezone, currency')
      .order('name');

    if (error) {
      console.error('❌ [API Management] Erreur Supabase:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      restaurants: restaurants || []
    });
  } catch (error) {
    console.error('❌ [API Management] Exception:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors du chargement des restaurants'
    }, { status: 500 });
  }
}