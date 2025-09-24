import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configuration PRODUCTION - Même config que restaurants/management
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurant_id')

    if (!restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID requis'
      }, { status: 400 })
    }

    const { data: categories, error } = await supabase
      .from('france_menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Erreur récupération catégories:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      categories: categories || []
    })

  } catch (error) {
    console.error('Erreur API categories:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne'
    }, { status: 500 })
  }
}