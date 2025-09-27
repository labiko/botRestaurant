import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration PRODUCTION - Connexion directe à la base PROD
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: restaurants, error } = await supabase
      .from('france_restaurants')
      .select('id, name, is_active, created_at, updated_at, city, phone, whatsapp_number, address, password_hash, latitude, longitude')
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
      restaurants: restaurants || [],
      source: 'PRODUCTION' // Indicateur de la source des données
    });
  } catch (error) {
    console.error('❌ [API Management] Exception:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors du chargement des restaurants'
    }, { status: 500 });
  }
}