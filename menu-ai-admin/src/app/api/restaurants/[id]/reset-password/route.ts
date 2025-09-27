import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration PRODUCTION
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [Reset Password] Début requête, params:', params);
    const restaurantId = parseInt(params.id);

    console.log('🔍 [Reset Password] Restaurant ID:', restaurantId);
    console.log('🔍 [Reset Password] Variables env:', {
      SUPABASE_URL_PROD: supabaseUrl ? 'Définie' : 'MANQUANTE',
      SUPABASE_KEY_PROD: supabaseKey ? 'Définie' : 'MANQUANTE'
    });

    if (isNaN(restaurantId)) {
      return NextResponse.json({
        success: false,
        error: 'ID restaurant invalide'
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 [Reset Password] Tentative update restaurant ID:', restaurantId);

    // Vider le mot de passe (utiliser chaîne vide au lieu de null)
    const { data, error } = await supabase
      .from('france_restaurants')
      .update({
        password_hash: '',
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurantId)
      .select('id, name')
      .single();

    console.log('🔍 [Reset Password] Résultat Supabase:', { data, error });

    if (error) {
      console.error('❌ [API Reset Password] Erreur Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log(`✅ [API Reset Password] Mot de passe reset pour: ${data.name} (ID: ${data.id})`);

    return NextResponse.json({
      success: true,
      message: `Mot de passe reset pour ${data.name}`,
      restaurant: data
    });

  } catch (error) {
    console.error('❌ [API Reset Password] Exception:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors du reset'
    }, { status: 500 });
  }
}