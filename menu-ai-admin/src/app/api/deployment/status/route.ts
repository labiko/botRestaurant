import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

export async function PUT(request: NextRequest) {
  try {
    // Utiliser le service centralisé comme les autres APIs
    const supabase = getSupabaseClientForRequest(request);

    const { restaurant_id, deployment_status } = await request.json();

    console.log(`🔗 [API] Mise à jour deployment_status: restaurant ${restaurant_id} → ${deployment_status}`);

    // Validation des données
    if (!restaurant_id || !deployment_status) {
      return NextResponse.json({
        success: false,
        error: 'restaurant_id et deployment_status requis'
      }, { status: 400 });
    }

    // Validation du statut
    const validStatuses = ['development', 'testing', 'production'];
    if (!validStatuses.includes(deployment_status)) {
      return NextResponse.json({
        success: false,
        error: `deployment_status doit être: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    // Récupérer d'abord le nom du restaurant pour le retour
    const { data: restaurant, error: fetchError } = await supabase
      .from('france_restaurants')
      .select('name')
      .eq('id', restaurant_id)
      .single();

    if (fetchError) {
      console.error('❌ [API] Restaurant non trouvé:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Restaurant non trouvé'
      }, { status: 404 });
    }

    // Mettre à jour le deployment_status
    const { error: updateError } = await supabase
      .from('france_restaurants')
      .update({ deployment_status })
      .eq('id', restaurant_id);

    if (updateError) {
      console.error('❌ [API] Erreur mise à jour deployment_status:', updateError);
      return NextResponse.json({
        success: false,
        error: `Erreur mise à jour: ${updateError.message}`
      }, { status: 500 });
    }

    console.log(`✅ [API] deployment_status mis à jour avec succès`);

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour avec succès`,
      restaurant_name: restaurant.name,
      new_status: deployment_status
    });

  } catch (error) {
    console.error('❌ [API] Exception mise à jour deployment_status:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}