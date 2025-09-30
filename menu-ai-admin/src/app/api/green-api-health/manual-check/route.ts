import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GREEN_API_INSTANCE = '7105313693';
const GREEN_API_TOKEN = '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693';
const BASE_URL = 'https://7105.api.greenapi.com';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface HealthCheckResult {
  timestamp: string;
  status: 'healthy' | 'unhealthy' | 'rebooted' | 'critical_failure';
  state_instance?: string;
  error_message?: string;
  reboot_triggered: boolean;
  reboot_success?: boolean;
  response_time_ms?: number;
  support_notified: boolean;
}

export async function POST() {
  const startTime = Date.now();
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const result: HealthCheckResult = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      reboot_triggered: false,
      support_notified: false
    };

    // 1. Vérifier l'état de l'instance (timeout 10s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const stateResponse = await fetch(
        `${BASE_URL}/waInstance${GREEN_API_INSTANCE}/getStateInstance/${GREEN_API_TOKEN}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      result.response_time_ms = Date.now() - startTime;

      if (!stateResponse.ok) {
        throw new Error(`HTTP ${stateResponse.status}`);
      }

      const state = await stateResponse.json();
      result.state_instance = state.stateInstance;

      // 2. Vérifier si instance autorisée
      if (state.stateInstance !== 'authorized') {
        result.status = 'unhealthy';

        // 3. Tenter reboot automatique
        result.reboot_triggered = true;
        const rebootResponse = await fetch(
          `${BASE_URL}/waInstance${GREEN_API_INSTANCE}/reboot/${GREEN_API_TOKEN}`
        );

        if (rebootResponse.ok) {
          const rebootData = await rebootResponse.json();
          result.reboot_success = rebootData.isReboot === true;

          if (result.reboot_success) {
            result.status = 'rebooted';
          } else {
            result.status = 'critical_failure';
            result.support_notified = true;
            await sendSupportAlert(supabase, {
              type: 'reboot_failed',
              instance: GREEN_API_INSTANCE,
              stateInstance: state.stateInstance,
              error: 'Reboot command returned false'
            });
          }
        } else {
          result.status = 'critical_failure';
          result.reboot_success = false;
          result.support_notified = true;
          await sendSupportAlert(supabase, {
            type: 'reboot_unreachable',
            instance: GREEN_API_INSTANCE,
            httpStatus: rebootResponse.status
          });
        }
      }

    } catch (fetchError: any) {
      clearTimeout(timeout);

      result.status = 'critical_failure';
      result.error_message = fetchError.message;
      result.response_time_ms = Date.now() - startTime;

      // Tenter reboot en dernier recours
      try {
        result.reboot_triggered = true;
        const rebootResponse = await fetch(
          `${BASE_URL}/waInstance${GREEN_API_INSTANCE}/reboot/${GREEN_API_TOKEN}`
        );

        if (rebootResponse.ok) {
          const rebootData = await rebootResponse.json();
          result.reboot_success = rebootData.isReboot === true;

          if (!result.reboot_success) {
            result.support_notified = true;
            await sendSupportAlert(supabase, {
              type: 'timeout_and_reboot_failed',
              instance: GREEN_API_INSTANCE,
              error: fetchError.message,
              responseTimeMs: result.response_time_ms
            });
          }
        } else {
          result.reboot_success = false;
          result.support_notified = true;
          await sendSupportAlert(supabase, {
            type: 'complete_failure',
            instance: GREEN_API_INSTANCE,
            error: `Timeout: ${fetchError.message} + Reboot HTTP ${rebootResponse.status}`
          });
        }
      } catch (rebootError: any) {
        result.support_notified = true;
        await sendSupportAlert(supabase, {
          type: 'complete_failure',
          instance: GREEN_API_INSTANCE,
          error: `Primary: ${fetchError.message} | Reboot: ${rebootError.message}`
        });
      }
    }

    // 4. Logger dans Supabase
    await logHealthCheck(supabase, result);

    return NextResponse.json(result, {
      status: result.status === 'critical_failure' ? 500 : 200
    });

  } catch (error: any) {
    console.error('Fatal error in manual check:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function logHealthCheck(supabase: any, result: HealthCheckResult) {
  try {
    await supabase.from('green_api_health_logs').insert({
      checked_at: result.timestamp,
      status: result.status,
      state_instance: result.state_instance,
      error_message: result.error_message,
      reboot_triggered: result.reboot_triggered,
      reboot_success: result.reboot_success,
      response_time_ms: result.response_time_ms,
      support_notified: result.support_notified,
      support_notification_sent_at: result.support_notified ? new Date().toISOString() : null
    });
  } catch (error) {
    console.error('Error logging health check:', error);
  }
}

async function sendSupportAlert(supabase: any, alertData: any) {
  try {
    console.log('🚨 Support Alert triggered:', alertData.type);

    // Récupérer les contacts support actifs
    const { data: contacts } = await supabase
      .from('system_support_contacts')
      .select('*')
      .eq('is_active', true)
      .order('notification_priority', { ascending: true });

    if (!contacts?.length) {
      console.error('No support contacts found');
      return false;
    }

    const alertMessage = formatAlertMessage(alertData);

    // Envoyer à tous les contacts
    for (const contact of contacts) {
      try {
        const whatsappResponse = await fetch(
          `${BASE_URL}/waInstance${GREEN_API_INSTANCE}/sendMessage/${GREEN_API_TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: contact.phone_number,
              message: alertMessage
            })
          }
        );

        if (whatsappResponse.ok) {
          console.log(`✅ Alert sent to ${contact.full_name}`);
        } else {
          console.error(`❌ Failed to send to ${contact.full_name}`);
        }
      } catch (error) {
        console.error(`Error sending to ${contact.full_name}:`, error);
      }
    }

    return true;
  } catch (error) {
    console.error('Error in sendSupportAlert:', error);
    return false;
  }
}

function formatAlertMessage(alertData: any): string {
  const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

  let message = `🚨 *ALERTE GREEN API* 🚨\n\n`;
  message += `⏰ ${timestamp}\n`;
  message += `📱 Instance: ${alertData.instance}\n\n`;

  switch (alertData.type) {
    case 'reboot_failed':
      message += `❌ *REBOOT ÉCHOUÉ*\n\n`;
      message += `État détecté: ${alertData.stateInstance}\n`;
      message += `Commande reboot exécutée mais retour négatif\n\n`;
      message += `⚠️ *ACTION REQUISE:*\n`;
      message += `1. Vérifier le dashboard Green API\n`;
      message += `2. Tenter reboot manuel si nécessaire\n`;
      message += `3. Vérifier la connexion WhatsApp`;
      break;

    case 'reboot_unreachable':
      message += `❌ *ENDPOINT REBOOT INACCESSIBLE*\n\n`;
      message += `HTTP Status: ${alertData.httpStatus}\n\n`;
      message += `⚠️ *ACTION REQUISE:*\n`;
      message += `1. Vérifier l'accès API Green\n`;
      message += `2. Contrôler les credentials\n`;
      message += `3. Tester manuellement le reboot`;
      break;

    case 'timeout_and_reboot_failed':
      message += `❌ *TIMEOUT + REBOOT ÉCHOUÉ*\n\n`;
      message += `Erreur: ${alertData.error}\n`;
      message += `Temps réponse: ${alertData.responseTimeMs}ms\n\n`;
      message += `⚠️ *ACTION REQUISE:*\n`;
      message += `1. L'instance ne répond plus\n`;
      message += `2. Reboot automatique a échoué\n`;
      message += `3. Intervention manuelle critique`;
      break;

    case 'complete_failure':
      message += `🔴 *ÉCHEC COMPLET DU SYSTÈME*\n\n`;
      message += `Erreur: ${alertData.error}\n\n`;
      message += `⚠️ *ACTION IMMÉDIATE REQUISE:*\n`;
      message += `1. Instance complètement inaccessible\n`;
      message += `2. Reboot impossible\n`;
      message += `3. Vérifier dashboard Green API\n`;
      message += `4. Contact support Green API si nécessaire`;
      break;

    default:
      message += `❓ Erreur inconnue: ${alertData.type}\n`;
      message += `Détails: ${JSON.stringify(alertData)}`;
  }

  message += `\n\n🔗 Dashboard: https://7105.api.greenapi.com`;

  return message;
}