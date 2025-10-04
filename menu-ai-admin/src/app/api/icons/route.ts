import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClientForRequest(request);

    // Récupérer toutes les icônes depuis france_icons
    const { data: icons, error } = await supabase
      .from("france_icons")
      .select("id, emoji, name, category, tags, created_at, updated_at")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("❌ [API] Erreur récupération icônes:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Erreur récupération icônes",
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      icons: icons || []
    });

  } catch (error) {
    console.error("❌ [API] Erreur serveur icons:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur interne",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emoji, name, category, tags } = body;

    if (!emoji || !name || !category) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClientForRequest(request);

    const { data, error } = await supabase
      .from("france_icons")
      .insert({
        emoji,
        name,
        category,
        tags: tags || []
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [API] Erreur création icône:", error);
      return NextResponse.json(
        { success: false, error: "Erreur création icône", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      icon: data
    });

  } catch (error) {
    console.error("❌ [API] Erreur serveur POST icons:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
