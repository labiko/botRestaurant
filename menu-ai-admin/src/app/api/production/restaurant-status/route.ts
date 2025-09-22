// 🏪 API GESTION STATUT RESTAURANT EN PRODUCTION
// =================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurant_id, is_active } = body;

    // Validation des paramètres
    if (!restaurant_id || typeof is_active !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'Paramètres invalides. restaurant_id et is_active requis.'
      }, { status: 400 });
    }

    // Connexion à la base de production
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration production manquante');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🏪 Mise à jour statut restaurant ${restaurant_id}: is_active = ${is_active}`);

    // Mise à jour directe en production
    const { error } = await supabase
      .from('france_restaurants')
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurant_id);

    if (error) {
      console.error('❌ Erreur mise à jour restaurant:', error);
      throw error;
    }

    console.log(`✅ Statut restaurant ${restaurant_id} mis à jour avec succès`);

    return NextResponse.json({
      success: true,
      message: is_active
        ? 'Restaurant activé et visible dans le bot'
        : 'Restaurant désactivé et ne sera pas visible dans le bot et le scan QRCode échouera'
    });

  } catch (error) {
    console.error('❌ Erreur API restaurant-status:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour du statut restaurant'
    }, { status: 500 });
  }
}