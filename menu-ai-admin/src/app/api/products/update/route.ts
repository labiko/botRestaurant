import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    console.log('🔄 [API] Début mise à jour produit...');

    const { productId, updates } = await request.json();
    console.log('📝 [API] productId reçu:', productId);
    console.log('📝 [API] updates reçu:', updates);

    if (!productId || !updates) {
      console.error('❌ [API] Champs manquants:', { productId, updates });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Préparer les données pour la mise à jour
    const updateData: any = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.composition !== undefined) {
      updateData.composition = updates.composition;
      updateData.description = updates.composition; // Mettre à jour les deux colonnes
    }

    if (updates.price_onsite !== undefined) {
      updateData.price_on_site_base = parseFloat(updates.price_onsite.toString());
    }

    if (updates.price_delivery !== undefined) {
      updateData.price_delivery_base = parseFloat(updates.price_delivery.toString());
    }

    console.log('🗃️ [API] Données préparées pour mise à jour:', updateData);

    // Mettre à jour le produit dans la base de données
    console.log('📡 [API] Exécution requête Supabase...');
    const { data, error } = await supabase
      .from('france_products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Erreur Supabase lors de la mise à jour:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [API] Produit mis à jour avec succès:', data);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}