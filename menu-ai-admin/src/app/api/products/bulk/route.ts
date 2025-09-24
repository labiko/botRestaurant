import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configuration PRODUCTION - Même config que restaurants/management
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json()
    const { product_ids, icon } = body

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'product_ids requis (array non vide)'
      }, { status: 400 })
    }

    if (!icon) {
      return NextResponse.json({
        success: false,
        error: 'Icône requise'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('france_products')
      .update({
        icon: icon,
        updated_at: new Date().toISOString()
      })
      .in('id', product_ids)
      .select()

    if (error) {
      console.error('Erreur mise à jour bulk produits:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      products: data,
      updated_count: data?.length || 0
    })

  } catch (error) {
    console.error('Erreur API PUT products bulk:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne'
    }, { status: 500 })
  }
}