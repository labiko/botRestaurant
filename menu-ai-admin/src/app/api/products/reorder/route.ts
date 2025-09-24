import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configuration PRODUCTION - Même config que restaurants/management
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json()
    const { products } = body // [{ id, display_order }]

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'products requis (array avec id et display_order)'
      }, { status: 400 })
    }

    // Validation des données
    for (const product of products) {
      if (!product.id || typeof product.display_order !== 'number') {
        return NextResponse.json({
          success: false,
          error: 'Chaque produit doit avoir un id et display_order'
        }, { status: 400 })
      }
    }

    // Mise à jour en lot
    const results = []
    for (const product of products) {
      const { data, error } = await supabase
        .from('france_products')
        .update({
          display_order: product.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)
        .select('id, display_order')
        .single()

      if (error) {
        console.error(`Erreur mise à jour produit ${product.id}:`, error)
        return NextResponse.json({
          success: false,
          error: `Erreur mise à jour produit ${product.id}: ${error.message}`
        }, { status: 500 })
      }

      results.push(data)
    }

    return NextResponse.json({
      success: true,
      products: results,
      updated_count: results.length
    })

  } catch (error) {
    console.error('Erreur API PUT products reorder:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne'
    }, { status: 500 })
  }
}