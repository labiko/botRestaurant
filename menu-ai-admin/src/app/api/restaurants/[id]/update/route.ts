import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration PRODUCTION - Connexion directe à la base PROD
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const restaurantId = parseInt(params.id);

    console.log('🔍 [API Update] Données reçues:', JSON.stringify(data, null, 2));
    console.log('🔍 [API Update] Restaurant ID:', restaurantId);

    // Validation des paramètres
    if (isNaN(restaurantId)) {
      return NextResponse.json({
        success: false,
        error: 'ID restaurant invalide'
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Préparer les données à mettre à jour
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Champs optionnels à mettre à jour
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.whatsapp_number !== undefined) updateData.whatsapp_number = data.whatsapp_number;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.address !== undefined) updateData.address = data.address;
    // Note: email n'existe pas dans la structure de base
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;

    // Gestion simple du mot de passe - enregistrer tel quel
    if (data.password && data.password.trim() !== '') {
      updateData.password_hash = data.password.trim();
      console.log('🔐 [API Update] Mot de passe enregistré tel quel');
    }

    // Vérifier que le restaurant existe avant la mise à jour
    const { data: existingRestaurant, error: checkError } = await supabase
      .from('france_restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single();

    if (checkError || !existingRestaurant) {
      console.error('❌ [API Update] Restaurant non trouvé:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Restaurant non trouvé'
      }, { status: 404 });
    }

    console.log('🔍 [API Update] updateData à appliquer:', JSON.stringify(updateData, null, 2));

    // Effectuer la mise à jour
    const { data: updatedRestaurant, error: updateError } = await supabase
      .from('france_restaurants')
      .update(updateData)
      .eq('id', restaurantId)
      .select(`
        id,
        name,
        phone,
        whatsapp_number,
        city,
        address,
        is_active,
        latitude,
        longitude,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('❌ [API Update] Erreur Supabase:', updateError);
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 500 });
    }

    if (!updatedRestaurant) {
      return NextResponse.json({
        success: false,
        error: 'Échec de la mise à jour'
      }, { status: 500 });
    }

    const responseMessage = data.password
      ? `Informations et mot de passe mis à jour pour "${updatedRestaurant.name}"`
      : `Informations mises à jour pour "${updatedRestaurant.name}"`;

    console.log(`✅ [API Update] ${responseMessage}`);

    return NextResponse.json({
      success: true,
      restaurant: updatedRestaurant,
      message: responseMessage,
      timestamp: new Date().toISOString(),
      source: 'PRODUCTION',
      fieldsUpdated: Object.keys(updateData).filter(key => key !== 'updated_at')
    });

  } catch (error) {
    console.error('❌ [API Update] Exception:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la mise à jour des informations'
    }, { status: 500 });
  }
}