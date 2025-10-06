// 🌍 API GESTION DES PAYS
// ========================

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

export async function GET(request: NextRequest) {
  try {
    console.log('🌍 Chargement des pays...');

    const dataLoader = getSupabaseForRequest(request);

    // Charger tous les pays depuis la base
    const { data: countries, error } = await dataLoader.supabase
      .from('supported_countries')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('❌ Erreur lors du chargement des pays:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors du chargement des pays'
      }, { status: 500 });
    }

    console.log(`✅ ${countries?.length || 0} pays chargés`);

    return NextResponse.json({
      success: true,
      countries: countries || []
    });

  } catch (error) {
    console.error('❌ Erreur API countries GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🌍 Création d\'un nouveau pays...');

    const dataLoader = getSupabaseForRequest(request);
    const body = await request.json();

    // Validation des champs obligatoires
    const requiredFields = ['code', 'name', 'flag', 'phone_prefix', 'phone_format'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Le champ ${field} est obligatoire`
        }, { status: 400 });
      }
    }

    // Validation du code pays (2 lettres majuscules)
    if (!/^[A-Z]{2}$/.test(body.code)) {
      return NextResponse.json({
        success: false,
        error: 'Le code pays doit contenir exactement 2 lettres majuscules'
      }, { status: 400 });
    }

    // Vérifier si le code pays existe déjà
    const { data: existingCountry } = await dataLoader.supabase
      .from('supported_countries')
      .select('id')
      .eq('code', body.code)
      .single();

    if (existingCountry) {
      return NextResponse.json({
        success: false,
        error: `Un pays avec le code ${body.code} existe déjà`
      }, { status: 409 });
    }

    // Préparer les données du pays
    const countryData: Omit<Country, 'id' | 'created_at'> = {
      code: body.code.toUpperCase(),
      name: body.name.trim(),
      flag: body.flag.trim(),
      phone_prefix: body.phone_prefix.trim(),
      remove_leading_zero: Boolean(body.remove_leading_zero),
      phone_format: body.phone_format.trim(),
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      display_order: parseInt(body.display_order) || 0
    };

    // Insérer le nouveau pays
    const { data: newCountry, error } = await dataLoader.supabase
      .from('supported_countries')
      .insert([countryData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la création du pays:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création du pays'
      }, { status: 500 });
    }

    console.log(`✅ Pays créé: ${newCountry.name} (${newCountry.code})`);

    return NextResponse.json({
      success: true,
      country: newCountry,
      message: 'Pays créé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur API countries POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}