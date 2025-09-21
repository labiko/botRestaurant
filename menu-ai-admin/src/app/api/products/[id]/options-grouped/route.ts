import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID produit invalide' },
        { status: 400 }
      );
    }

    // Charger toutes les options du produit groupées par option_group
    const { data: options, error: optionsError } = await supabase
      .from('france_product_options')
      .select('*')
      .eq('product_id', productId)
      .order('group_order', { ascending: true })
      .order('display_order', { ascending: true });

    if (optionsError) {
      console.error('Erreur chargement options:', optionsError);
      return NextResponse.json(
        { error: 'Erreur lors du chargement des options' },
        { status: 500 }
      );
    }

    if (!options || options.length === 0) {
      return NextResponse.json(
        { error: 'Aucune option trouvée pour ce produit' },
        { status: 404 }
      );
    }

    // Grouper les options par option_group
    const groupedOptions = new Map();

    options.forEach(option => {
      const groupName = option.option_group;

      if (!groupedOptions.has(groupName)) {
        groupedOptions.set(groupName, {
          group_order: option.group_order,
          group_name: groupName,
          is_required: option.is_required,
          max_selections: option.max_selections,
          options: []
        });
      }

      groupedOptions.get(groupName).options.push({
        id: option.id,
        option_name: option.option_name,
        price_modifier: option.price_modifier,
        display_order: option.display_order,
        is_active: option.is_active
      });
    });

    // Convertir en array et trier par group_order
    const optionGroupsArray = Array.from(groupedOptions.values())
      .sort((a, b) => a.group_order - b.group_order);

    return NextResponse.json({
      success: true,
      productId,
      totalGroups: optionGroupsArray.length,
      totalOptions: options.length,
      optionGroups: optionGroupsArray,
      debug: {
        groupNames: optionGroupsArray.map(g => g.group_name),
        optionCounts: optionGroupsArray.map(g => g.options.length)
      }
    });

  } catch (error) {
    console.error('Erreur API options-grouped:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}