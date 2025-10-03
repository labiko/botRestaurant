import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Configuration manquante' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("france_icons")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ [API] Erreur suppression icône:", error);
      return NextResponse.json(
        { success: false, error: "Erreur suppression icône", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Icône supprimée"
    });

  } catch (error) {
    console.error("❌ [API] Erreur serveur DELETE icons:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
