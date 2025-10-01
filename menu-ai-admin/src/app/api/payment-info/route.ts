import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Utiliser PROD ou DEV selon NEXT_PUBLIC_ENVIRONMENT uniquement
const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD';

const supabaseUrl = isProduction && process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
  ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
  : process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseKey = isProduction && process.env.SUPABASE_SERVICE_ROLE_KEY_PROD
  ? process.env.SUPABASE_SERVICE_ROLE_KEY_PROD
  : process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Logs de debug pour vérifier l'environnement
    console.log('🔧 [API] Environment Check:');
    console.log('   - NEXT_PUBLIC_ENVIRONMENT:', process.env.NEXT_PUBLIC_ENVIRONMENT);
    console.log('   - NODE_ENV:', process.env.NODE_ENV);
    console.log('   - isProduction:', isProduction);
    console.log('   - Using URL:', supabaseUrl);

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID manquant' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer le payment_link
    const { data: paymentLink, error: linkError } = await supabase
      .from('payment_links')
      .select('order_id')
      .eq('payment_intent_id', sessionId)
      .single();

    if (linkError || !paymentLink) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    // Récupérer les infos de la commande
    const { data: order, error: orderError } = await supabase
      .from('france_orders')
      .select('order_number, total_amount')
      .eq('id', paymentLink.order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Détails commande non trouvés' }, { status: 404 });
    }

    return NextResponse.json({
      order_number: order.order_number,
      total_amount: order.total_amount
    });

  } catch (error) {
    console.error('Erreur API payment-info:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}