// API pour la gestion d'une vitrine spécifique - GET/PUT/DELETE
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration PRODUCTION - Même config que restaurants/management
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Récupérer une vitrine par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { id } = params;

    const { data, error } = await supabase
      .from('restaurant_vitrine_settings')
      .select(`
        *,
        restaurant:france_restaurants(
          name, phone, whatsapp_number,
          address, city, business_hours
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Vitrine non trouvée' },
          { status: 404 }
        );
      }
      console.error('Erreur récupération vitrine:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, vitrine: data });
  } catch (error) {
    console.error('Erreur API vitrine GET:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour une vitrine
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { id } = params;
    const body = await request.json();

    // Validation des couleurs si présentes
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (body.primary_color && !colorRegex.test(body.primary_color)) {
      return NextResponse.json(
        { success: false, error: 'Format de couleur invalide pour primary_color' },
        { status: 400 }
      );
    }

    if (body.secondary_color && !colorRegex.test(body.secondary_color)) {
      return NextResponse.json(
        { success: false, error: 'Format de couleur invalide pour secondary_color' },
        { status: 400 }
      );
    }

    // Validation de la note si présente
    if (body.average_rating && (body.average_rating < 0 || body.average_rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'La note doit être entre 0 et 5' },
        { status: 400 }
      );
    }

    // Retirer les champs non modifiables
    const { id: _, created_at, updated_at, restaurant, ...updateData } = body;

    const { data, error } = await supabase
      .from('restaurant_vitrine_settings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Vitrine non trouvée' },
          { status: 404 }
        );
      }

      // Gestion des erreurs de contrainte d'unicité
      if (error.code === '23505' && error.message.includes('slug')) {
        return NextResponse.json(
          { success: false, error: 'Ce slug est déjà utilisé' },
          { status: 409 }
        );
      }

      console.error('Erreur mise à jour vitrine:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, vitrine: data });
  } catch (error) {
    console.error('Erreur API vitrine PUT:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une vitrine
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { id } = params;

    const { error } = await supabase
      .from('restaurant_vitrine_settings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression vitrine:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Vitrine supprimée avec succès' });
  } catch (error) {
    console.error('Erreur API vitrine DELETE:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}