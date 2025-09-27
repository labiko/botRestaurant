import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration PRODUCTION - Connexion directe à la base PROD
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { is_active } = await request.json();
    const restaurantId = parseInt(params.id);

    // Validation des paramètres
    if (isNaN(restaurantId)) {
      return NextResponse.json({
        success: false,
        error: 'ID restaurant invalide'
      }, { status: 400 });
    }

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'Statut is_active doit être un booléen'
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Mise à jour avec timestamp automatique
    const { data, error } = await supabase
      .from('france_restaurants')
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurantId)
      .select('id, name, is_active, updated_at')
      .single();

    if (error) {
      console.error('❌ [API Status] Erreur Supabase:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant non trouvé'
      }, { status: 404 });
    }

    const statusText = is_active ? 'activé' : 'désactivé';

    return NextResponse.json({
      success: true,
      restaurant: data,
      message: `Restaurant "${data.name}" ${statusText} avec succès`,
      timestamp: new Date().toISOString(),
      source: 'PRODUCTION'
    });
  } catch (error) {
    console.error('❌ [API Status] Exception:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la mise à jour'
    }, { status: 500 });
  }
}