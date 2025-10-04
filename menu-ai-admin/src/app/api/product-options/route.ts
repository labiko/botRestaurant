import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClientForRequest } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClientForRequest(request);

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'Product ID requis'
      }, { status: 400 })
    }

    const { data: options, error } = await supabase
      .from('france_product_options')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('option_group', { ascending: true })
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Erreur récupération options produit:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      options: options || []
    })

  } catch (error) {
    console.error('Erreur API product-options:', error)
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
        error: 'ID option et icône requis'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('france_product_options')
      .update({
        icon: icon
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour option:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      option: data
    })

  } catch (error) {
    console.error('Erreur API PUT product-options:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne'
    }, { status: 500 })
  }
}