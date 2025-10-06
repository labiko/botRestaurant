import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Utiliser le service centralisé comme les autres APIs
    const supabase = getSupabaseClientForRequest(request);

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

    // Récupérer les infos du pays depuis supported_countries pour formater les numéros
    let country = null;
    if (data.country_code) {
      const { data: countryData } = await supabase
        .from('supported_countries')
        .select('phone_prefix, remove_leading_zero')
        .eq('code', data.country_code)
        .single();
      country = countryData;
    }

    // Fonction helper pour convertir au format international
    const formatToInternational = (localNumber: string): string => {
      if (!country || !localNumber) return localNumber;

      let cleaned = localNumber.replace(/\s/g, '').trim();

      // Si le numéro commence déjà par le préfixe international, le retourner tel quel
      if (cleaned.startsWith(country.phone_prefix)) {
        return cleaned;
      }

      // Enlever le 0 initial si la règle l'exige
      if (country.remove_leading_zero && cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }

      // Retourner le format international
      return country.phone_prefix + cleaned;
    };

    // Préparer les données à mettre à jour
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Champs optionnels à mettre à jour
    if (data.name !== undefined) updateData.name = data.name;

    // Convertir les numéros au format international avant enregistrement
    if (data.phone !== undefined) {
      updateData.phone = formatToInternational(data.phone);
      console.log(`📞 [API Update] Téléphone converti: ${data.phone} → ${updateData.phone}`);
    }
    if (data.whatsapp_number !== undefined) {
      updateData.whatsapp_number = formatToInternational(data.whatsapp_number);
      console.log(`📱 [API Update] WhatsApp converti: ${data.whatsapp_number} → ${updateData.whatsapp_number}`);
    }
    if (data.city !== undefined) updateData.city = data.city;
    if (data.address !== undefined) updateData.address = data.address;
    // Note: email n'existe pas dans la structure de base
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.country_code !== undefined) updateData.country_code = data.country_code;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.currency !== undefined) updateData.currency = data.currency;

    // Le mot de passe n'est jamais modifié via cette API
    // Utiliser le bouton Reset pour vider le password_hash

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
        country_code,
        timezone,
        currency,
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