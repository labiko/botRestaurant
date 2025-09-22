// ✅ API CONFIRMATION SYNCHRONISATION PRODUCTION EXÉCUTÉE
// =======================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TimezoneService } from '@/lib/timezone-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const duplicationId = parseInt(params.id);

    if (!duplicationId || isNaN(duplicationId)) {
      return NextResponse.json({
        success: false,
        error: 'ID de duplication invalide'
      }, { status: 400 });
    }

    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'DEV';

    // Cette API ne fonctionne qu'en DEV (table duplication_logs uniquement en DEV)
    if (environment === 'PROD') {
      return NextResponse.json({
        success: false,
        error: 'Cette API ne fonctionne qu\'en environnement DEV'
      }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    console.log(`✅ Marquage synchronisation exécutée pour duplication ${duplicationId}...`);

    // Récupérer d'abord les données actuelles
    const { data: currentData, error: fetchError } = await supabase
      .from('duplication_logs')
      .select('sync_count, target_restaurant:target_restaurant_id(name)')
      .eq('id', duplicationId)
      .single();

    if (fetchError) {
      console.error('❌ Erreur récupération duplication:', fetchError);
      throw fetchError;
    }

    // Mettre à jour le statut de synchronisation
    const { data, error } = await supabase
      .from('duplication_logs')
      .update({
        production_status: 'synced',
        last_production_sync: TimezoneService.getCurrentTimeForDB(),
        sync_count: (currentData.sync_count || 0) + 1
      })
      .eq('id', duplicationId)
      .select('target_restaurant:target_restaurant_id(name), sync_count, last_production_sync')
      .single();

    if (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      throw error;
    }

    console.log(`✅ Synchronisation marquée comme exécutée pour ${data.target_restaurant?.name}`);

    return NextResponse.json({
      success: true,
      message: 'Synchronisation marquée comme exécutée',
      data: {
        restaurant: data.target_restaurant?.name,
        sync_count: data.sync_count,
        last_production_sync: data.last_production_sync
      }
    });

  } catch (error) {
    console.error('❌ Erreur API mark-executed:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la confirmation de synchronisation'
    }, { status: 500 });
  }
}