import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return NextResponse.json(
        { success: false, error: 'Configuration manquante' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer toutes les icônes depuis france_icons
    const { data: icons, error } = await supabase
      .from("france_icons")
      .select("emoji, name, category")
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
