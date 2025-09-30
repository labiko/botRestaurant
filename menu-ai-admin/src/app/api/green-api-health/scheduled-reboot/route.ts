import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET: Récupérer la configuration
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer la première ligne (ordre par ID) au lieu de .single()
    const { data, error } = await supabase
      .from('green_api_scheduled_reboots')
      .select('*')
      .order('id', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error fetching scheduled reboot config:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si aucune ligne n'existe, créer une config par défaut
    if (!data || data.length === 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('green_api_scheduled_reboots')
        .insert({
          scheduled_time: '03:00:00',
          timezone: 'Europe/Paris',
          is_enabled: false
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating default config:', insertError);
        // Retourner la config par défaut même si l'insertion échoue
        return NextResponse.json({
          id: 1,
          scheduled_time: '03:00:00',
          timezone: 'Europe/Paris',
          is_enabled: false,
          last_executed_at: null,
          next_execution_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      return NextResponse.json(inserted);
    }

    // Retourner la première ligne
    return NextResponse.json(data[0]);
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

    // Récupérer la première config existante (ordre par ID)
    const { data: existing, error: fetchError } = await supabase
      .from('green_api_scheduled_reboots')
      .select('*')
      .order('id', { ascending: true })
      .limit(1);

    if (fetchError || !existing || existing.length === 0) {
      console.error('Error fetching config for update:', fetchError);
      return NextResponse.json({ error: 'No configuration found' }, { status: 404 });
    }

    // Mettre à jour la première configuration
    const { data, error } = await supabase
      .from('green_api_scheduled_reboots')
      .update({
        scheduled_time: scheduled_time + ':00', // "03:00" -> "03:00:00"
        is_enabled: is_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing[0].id)
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