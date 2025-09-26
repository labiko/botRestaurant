import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configuration DEV - Même config que products/update
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurant_id')
    const categoryId = searchParams.get('category_id')

    if (!restaurantId || !categoryId) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID et Category ID requis'
      }, { status: 400 })
    }

    const { data: products, error } = await supabase
      .from('france_products')
      .select(`
        *,
        category:france_menu_categories(name, icon)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Erreur récupération produits:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      products: products || []
    })

  } catch (error) {
    console.error('Erreur API products:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json()
    const { id, icon } = body

    if (!id || !icon) {
      return NextResponse.json({
        success: false,
        error: 'ID et icône requis'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('france_products')
      .update({
        icon: icon,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour produit:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      product: data
    })

  } catch (error) {
    console.error('Erreur API PUT products:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne'
    }, { status: 500 })
  }
}