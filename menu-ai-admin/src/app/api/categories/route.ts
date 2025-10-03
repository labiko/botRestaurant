import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClientForRequest } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClientForRequest(request);

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

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClientForRequest(request);

    const body = await request.json()
    const { id, icon } = body

    if (!id || !icon) {
      return NextResponse.json({
        success: false,
        error: 'ID et icône requis'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('france_menu_categories')
      .update({
        icon: icon
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour catégorie:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      category: data
    })

  } catch (error) {
    console.error('Erreur API PUT categories:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne'
    }, { status: 500 })
  }
}