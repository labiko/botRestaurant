import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET: Récupérer la configuration
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('green_api_scheduled_reboots')
      .select('*')
      .single();

    if (error) {
      // Si la table est vide ou la ligne n'existe pas, créer une config par défaut
      if (error.code === 'PGRST116') {
        const defaultConfig = {
          id: 1,
          scheduled_time: '03:00:00',
          timezone: 'Europe/Paris',
          is_enabled: false,
          last_executed_at: null,
          next_execution_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Tenter de créer la ligne par défaut
        const { data: inserted, error: insertError } = await supabase
          .from('green_api_scheduled_reboots')
          .insert(defaultConfig)
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default config:', insertError);
          // Retourner la config par défaut même si l'insertion échoue
          return NextResponse.json(defaultConfig);
        }

        return NextResponse.json(inserted);
      }

      console.error('Error fetching scheduled reboot config:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in scheduled-reboot GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Mettre à jour la configuration
export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await request.json();

    const { scheduled_time, is_enabled } = body;

    if (!scheduled_time || typeof is_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Mettre à jour la configuration (toujours ID 1 - singleton)
    const { data, error } = await supabase
      .from('green_api_scheduled_reboots')
      .update({
        scheduled_time: scheduled_time + ':00', // "03:00" -> "03:00:00"
        is_enabled: is_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      console.error('Error updating scheduled reboot config:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in scheduled-reboot POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}