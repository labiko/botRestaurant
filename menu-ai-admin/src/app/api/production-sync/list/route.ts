// 🔄 API LISTE RESTAURANTS POUR SYNCHRONISATION PRODUCTION
// ===========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'DEV';
    const supabaseUrl = environment === 'PROD'
      ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = environment === 'PROD'
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD
      : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    console.log('🔄 Récupération liste restaurants pour production sync...');

    // Récupérer les duplications de base
    const { data: duplications, error } = await supabase
      .from('duplication_logs')
      .select(`
        id,
        source_restaurant:source_restaurant_id(name),
        target_restaurant:target_restaurant_id(name),
        target_restaurant_id,
        production_status,
        last_production_sync,
        sync_count,
        status,
        created_at
      `)
      .eq('status', 'completed') // Seulement les duplications réussies
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération duplications:', error);
      throw error;
    }

    if (!duplications) {
      throw new Error('Aucune duplication trouvée');
    }

    // Récupérer les actions pour déterminer le type
    const duplicationIds = duplications.map(d => d.id);
    const { data: actions } = await supabase
      .from('duplication_actions')
      .select('duplication_log_id, action_type')
      .in('duplication_log_id', duplicationIds)
      .eq('action_type', 'create_restaurant');

    const restaurantCreations = new Set(actions?.map(a => a.duplication_log_id) || []);

    // Enrichir avec les données de synchronisation et type
    const enrichedData = duplications.map(dup => ({
      ...dup,
      duplication_type: restaurantCreations.has(dup.id) ? 'restaurant' : 'category',
      production_status: dup.production_status || 'dev_only',
      sync_count: dup.sync_count || 0
    }));

    console.log(`✅ ${enrichedData.length} restaurants récupérés pour sync production`);

    return NextResponse.json({
      success: true,
      duplications: enrichedData
    });

  } catch (error) {
    console.error('❌ Erreur API production-sync/list:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des données de production',
      duplications: []
    }, { status: 500 });
  }
}