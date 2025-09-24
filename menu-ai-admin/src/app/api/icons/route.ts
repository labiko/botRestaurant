import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configuration PRODUCTION - Même config que restaurants/management
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const restaurant = searchParams.get('restaurant')

    let query = supabase
      .from('france_icons')
      .select('*')
      .order('name', { ascending: true })

    // Filtrer par catégorie si spécifié
    if (category && category !== '') {
      query = query.eq('category', category)
    }

    // Recherche dans nom et tags si spécifié
    if (search && search.trim() !== '') {
      const searchTerm = search.trim().toLowerCase()
      query = query.or(`name.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    }

    const { data: icons, error } = await query

    if (error) {
      console.error('Erreur récupération icônes:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Statistiques par catégorie
    const { data: allIcons, error: categoriesError } = await supabase
      .from('france_icons')
      .select('category')

    const categoriesCount = allIcons ? allIcons.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>) : {}

    return NextResponse.json({
      success: true,
      icons: icons || [],
      total: icons?.length || 0,
      categories: categoriesCount
    })

  } catch (error) {
    console.error('Erreur API icons:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json()
    const { emoji, name, category, tags } = body

    if (!emoji || !name || !category) {
      return NextResponse.json({
        success: false,
        error: 'Emoji, nom et catégorie requis'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('france_icons')
      .insert([{ emoji, name, category, tags: tags || [] }])
      .select()
      .single()

    if (error) {
      console.error('Erreur création icône:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      icon: data
    })

  } catch (error) {
    console.error('Erreur API POST icons:', error)
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
    const { id, emoji, name, category, tags } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID requis pour modification'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('france_icons')
      .update({
        emoji,
        name,
        category,
        tags: tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur modification icône:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      icon: data
    })

  } catch (error) {
    console.error('Erreur API PUT icons:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID requis pour suppression'
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('france_icons')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression icône:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Icône supprimée avec succès'
    })

  } catch (error) {
    console.error('Erreur API DELETE icons:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne'
    }, { status: 500 })
  }
}