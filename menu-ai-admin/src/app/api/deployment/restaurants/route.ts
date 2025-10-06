import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    // Utiliser le service centralisé comme les autres APIs
    const supabase = getSupabaseClientForRequest(request);

    console.log('🔗 [API] Connexion pour restaurants deployment_status');

    // Récupérer tous les restaurants avec leur deployment_status
    const { data: restaurants, error } = await supabase
      .from('france_restaurants')
      .select(`
        id,
        name,
        deployment_status,
        is_active,
        is_exceptionally_closed,
        phone,
        address
      `)
      .order('name');

    if (error) {
      console.error('❌ [API] Erreur récupération restaurants:', error);
      return NextResponse.json({
        success: false,
        error: `Erreur base: ${error.message}`
      }, { status: 500 });
    }

    console.log(`✅ [API] ${restaurants?.length || 0} restaurants récupérés`);

    return NextResponse.json({
      success: true,
      restaurants: restaurants || []
    });

  } catch (error) {
    console.error(`❌ [API] Exception restaurants:`, error);
    return NextResponse.json({
      success: false,
      error: 'Erreur connexion base de données'
    }, { status: 500 });
  }
}