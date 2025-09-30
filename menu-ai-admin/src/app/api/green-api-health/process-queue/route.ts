import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Récupérer les reboots en attente
    const { data: pendingReboots, error: fetchError } = await supabase
      .from('green_api_reboot_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching queue:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingReboots || pendingReboots.length === 0) {
      return NextResponse.json({
        message: 'No pending reboots in queue',
        processed: 0
      });
    }

    const reboot = pendingReboots[0];

    // 2. Marquer comme en cours de traitement
    await supabase
      .from('green_api_reboot_queue')
      .update({ status: 'processing' })
      .eq('id', reboot.id);

    // 3. Appeler l'Edge Function green-api-scheduled-reboot
    try {
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/green-api-scheduled-reboot`;
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        }
      });

      if (!response.ok) {
        throw new Error(`Edge function returned ${response.status}`);
      }

      const result = await response.json();

      // 4. Marquer comme complété
      await supabase
        .from('green_api_reboot_queue')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', reboot.id);

      return NextResponse.json({
        success: true,
        processed: 1,
        result
      });

    } catch (error: any) {
      // 5. Marquer comme échoué
      await supabase
        .from('green_api_reboot_queue')
        .update({
          status: 'failed',
          processed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', reboot.id);

      return NextResponse.json({
        error: error.message,
        processed: 0
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in process-queue:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}