import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Récupérer les 50 derniers logs
    const { data: logs, error: logsError } = await supabase
      .from('green_api_health_logs')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(50);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    // 2. Récupérer les contacts support
    const { data: contacts, error: contactsError } = await supabase
      .from('system_support_contacts')
      .select('*')
      .eq('is_active', true)
      .order('notification_priority', { ascending: true });

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
      return NextResponse.json({ error: contactsError.message }, { status: 500 });
    }

    // 3. Calculer les stats des 24 dernières heures
    const last24h = logs.filter(log => {
      const logDate = new Date(log.checked_at);
      const now = new Date();
      const diff = now.getTime() - logDate.getTime();
      return diff <= 24 * 60 * 60 * 1000; // 24h en millisecondes
    });

    const stats = {
      totalChecks: last24h.length,
      healthyChecks: last24h.filter(l => l.status === 'healthy').length,
      rebootsTriggered: last24h.filter(l => l.reboot_triggered).length,
      supportNotifications: last24h.filter(l => l.support_notified).length,
      uptime: last24h.length > 0
        ? ((last24h.filter(l => l.status === 'healthy').length / last24h.length) * 100).toFixed(2)
        : '0.00'
    };

    return NextResponse.json({
      logs: logs || [],
      contacts: contacts || [],
      stats
    });

  } catch (error) {
    console.error('Error in green-api-health API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}