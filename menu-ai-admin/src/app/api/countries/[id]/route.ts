// 🌍 API GESTION D'UN PAYS SPÉCIFIQUE
// =====================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/lib/api-helpers';

interface Country {
  id?: number;
  code: string;
  name: string;
  flag: string;
  phone_prefix: string;
  remove_leading_zero: boolean;
  phone_format: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🌍 Modification du pays ID: ${params.id}...`);

    const dataLoader = getSupabaseForRequest(request);
    const body = await request.json();
    const countryId = parseInt(params.id);

    if (isNaN(countryId)) {
      return NextResponse.json({
        success: false,
        error: 'ID du pays invalide'
      }, { status: 400 });
    }

    // Vérifier que le pays existe
    const { data: existingCountry, error: fetchError } = await dataLoader.supabase
      .from('supported_countries')
      .select('*')
      .eq('id', countryId)
      .single();

    if (fetchError || !existingCountry) {
      return NextResponse.json({
        success: false,
        error: 'Pays non trouvé'
      }, { status: 404 });
    }

    // Validation des champs obligatoires si fournis
    if (body.code && !/^[A-Z]{2}$/.test(body.code)) {
      return NextResponse.json({
        success: false,
        error: 'Le code pays doit contenir exactement 2 lettres majuscules'
      }, { status: 400 });
    }

    // Vérifier si le nouveau code pays n'est pas déjà utilisé (si changé)
    if (body.code && body.code !== existingCountry.code) {
      const { data: duplicateCountry } = await dataLoader.supabase
        .from('supported_countries')
        .select('id')
        .eq('code', body.code)
        .neq('id', countryId)
        .single();

      if (duplicateCountry) {
        return NextResponse.json({
          success: false,
          error: `Un autre pays utilise déjà le code ${body.code}`
        }, { status: 409 });
      }
    }

    // Préparer les données de mise à jour
    const updateData: Partial<Country> = {};

    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.flag !== undefined) updateData.flag = body.flag.trim();
    if (body.phone_prefix !== undefined) updateData.phone_prefix = body.phone_prefix.trim();
    if (body.remove_leading_zero !== undefined) updateData.remove_leading_zero = Boolean(body.remove_leading_zero);
    if (body.phone_format !== undefined) updateData.phone_format = body.phone_format.trim();
    if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active);
    if (body.display_order !== undefined) updateData.display_order = parseInt(body.display_order) || 0;

    // Mettre à jour le pays
    const { data: updatedCountry, error } = await dataLoader.supabase
      .from('supported_countries')
      .update(updateData)
      .eq('id', countryId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la modification du pays:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la modification du pays'
      }, { status: 500 });
    }

    console.log(`✅ Pays modifié: ${updatedCountry.name} (${updatedCountry.code})`);

    return NextResponse.json({
      success: true,
      country: updatedCountry,
      message: 'Pays modifié avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur API countries PUT:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🌍 Suppression du pays ID: ${params.id}...`);

    const dataLoader = getSupabaseForRequest(request);
    const countryId = parseInt(params.id);

    if (isNaN(countryId)) {
      return NextResponse.json({
        success: false,
        error: 'ID du pays invalide'
      }, { status: 400 });
    }

    // Vérifier que le pays existe
    const { data: existingCountry, error: fetchError } = await dataLoader.supabase
      .from('supported_countries')
      .select('*')
      .eq('id', countryId)
      .single();

    if (fetchError || !existingCountry) {
      return NextResponse.json({
        success: false,
        error: 'Pays non trouvé'
      }, { status: 404 });
    }

    // Vérifier si le pays est utilisé par des restaurants
    const { data: restaurantsUsingCountry, error: restaurantError } = await dataLoader.supabase
      .from('france_restaurants')
      .select('id, name')
      .eq('country_code', existingCountry.code)
      .limit(1);

    if (restaurantError) {
      console.error('❌ Erreur lors de la vérification des restaurants:', restaurantError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la vérification des dépendances'
      }, { status: 500 });
    }

    if (restaurantsUsingCountry && restaurantsUsingCountry.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Impossible de supprimer ce pays car il est utilisé par des restaurants. Désactivez-le plutôt.`
      }, { status: 409 });
    }

    // Supprimer le pays
    const { error } = await dataLoader.supabase
      .from('supported_countries')
      .delete()
      .eq('id', countryId);

    if (error) {
      console.error('❌ Erreur lors de la suppression du pays:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la suppression du pays'
      }, { status: 500 });
    }

    console.log(`✅ Pays supprimé: ${existingCountry.name} (${existingCountry.code})`);

    return NextResponse.json({
      success: true,
      message: 'Pays supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur API countries DELETE:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}