// Edge Function: Green API Health Monitor
// Exécution automatique toutes les 15 minutes via pg_cron
// Vérifie l'état de l'instance Green API, tente reboot si nécessaire, notifie support si échec

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Utilisation des secrets Supabase
const GREEN_API_INSTANCE = Deno.env.get('GREEN_API_INSTANCE_ID') ?? ''
const GREEN_API_TOKEN = Deno.env.get('GREEN_API_TOKEN') ?? ''
const BASE_URL = Deno.env.get('GREEN_API_URL') ?? 'https://7105.api.greenapi.com'

interface HealthCheckResult {
  timestamp: string
  status: 'healthy' | 'unhealthy' | 'rebooted' | 'critical_failure'
  state_instance?: string
  error_message?: string
  reboot_triggered: boolean
  reboot_success?: boolean
  response_time_ms?: number
  support_notified: boolean
}

serve(async (req) => {
  const startTime = Date.now()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const result: HealthCheckResult = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      reboot_triggered: false,
      support_notified: false
    }

    // 1. Vérifier l'état de l'instance (timeout 10s)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
      const stateResponse = await fetch(
        `${BASE_URL}/waInstance${GREEN_API_INSTANCE}/getStateInstance/${GREEN_API_TOKEN}`,
        { signal: controller.signal }
      )
      clearTimeout(timeout)

      result.response_time_ms = Date.now() - startTime

      if (!stateResponse.ok) {
        throw new Error(`HTTP ${stateResponse.status}`)
      }

      const state = await stateResponse.json()
      result.state_instance = state.stateInstance

      // 2. Vérifier si instance autorisée
      if (state.stateInstance !== 'authorized') {
        result.status = 'unhealthy'

        // 3. Tenter reboot automatique
        result.reboot_triggered = true
        const rebootResponse = await fetch(
          `${BASE_URL}/waInstance${GREEN_API_INSTANCE}/reboot/${GREEN_API_TOKEN}`
        )

        if (rebootResponse.ok) {
          const rebootData = await rebootResponse.json()
          result.reboot_success = rebootData.isReboot === true

          if (result.reboot_success) {
            result.status = 'rebooted'
          } else {
            // ⚠️ REBOOT ÉCHOUÉ - Notifier support
            result.status = 'critical_failure'
            await sendSupportAlert(supabase, {
              type: 'reboot_failed',
              instance: GREEN_API_INSTANCE,
              stateInstance: state.stateInstance,
              error: 'Reboot command returned false'
            })
            result.support_notified = true
          }
        } else {
          // ⚠️ REBOOT NON ACCESSIBLE - Notifier support
          result.status = 'critical_failure'
          result.reboot_success = false
          await sendSupportAlert(supabase, {
            type: 'reboot_unreachable',
            instance: GREEN_API_INSTANCE,
            httpStatus: rebootResponse.status
          })
          result.support_notified = true
        }
      }

    } catch (fetchError) {
      clearTimeout(timeout)

      // Erreur réseau ou timeout
      result.status = 'critical_failure'
      result.error_message = fetchError.message
      result.response_time_ms = Date.now() - startTime

      // Tenter reboot en dernier recours
      try {
        result.reboot_triggered = true
        const rebootResponse = await fetch(
          `${BASE_URL}/waInstance${GREEN_API_INSTANCE}/reboot/${GREEN_API_TOKEN}`
        )

        if (rebootResponse.ok) {
          const rebootData = await rebootResponse.json()
          result.reboot_success = rebootData.isReboot === true

          if (!result.reboot_success) {
            // ⚠️ TIMEOUT + REBOOT ÉCHOUÉ - Notifier support
            await sendSupportAlert(supabase, {
              type: 'timeout_and_reboot_failed',
              instance: GREEN_API_INSTANCE,
              error: fetchError.message,
              responseTimeMs: result.response_time_ms
            })
            result.support_notified = true
          }
        } else {
          // ⚠️ TIMEOUT + REBOOT INACCESSIBLE - Notifier support
          result.reboot_success = false
          await sendSupportAlert(supabase, {
            type: 'complete_failure',
            instance: GREEN_API_INSTANCE,
            error: `Timeout: ${fetchError.message} + Reboot HTTP ${rebootResponse.status}`
          })
          result.support_notified = true
        }
      } catch (rebootError) {
        // ⚠️ ÉCHEC TOTAL - Notifier support
        await sendSupportAlert(supabase, {
          type: 'complete_failure',
          instance: GREEN_API_INSTANCE,
          error: `Primary: ${fetchError.message} | Reboot: ${rebootError.message}`
        })
        result.support_notified = true
      }
    }

    // 4. Logger dans Supabase
    await logHealthCheck(supabase, result)

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: result.status === 'critical_failure' ? 500 : 200
    })

  } catch (error) {
    console.error('❌ [Health Monitor] Fatal error:', error)

    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

/**
 * Logger le résultat du health check
 */
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
    })
  } catch (error) {
    console.error('❌ [logHealthCheck] Erreur:', error)
  }
}

/**
 * ⚠️ Envoyer alerte WhatsApp au support
 */
async function sendSupportAlert(supabase: any, alertData: {
  type: string
  instance: string
  stateInstance?: string
  error?: string
  httpStatus?: number
  responseTimeMs?: number
}) {
  try {
    console.log('🚨 [Support Alert] Déclenchement notification:', alertData.type)

    // 1. Récupérer les contacts support actifs
    const { data: contacts, error: contactsError } = await supabase
      .from('system_support_contacts')
      .select('*')
      .eq('is_active', true)
      .order('notification_priority', { ascending: true })

    if (contactsError || !contacts?.length) {
      console.error('❌ Aucun contact support trouvé:', contactsError)
      return false
    }

    // 2. Préparer le message d'alerte
    const alertMessage = formatAlertMessage(alertData)

    // 3. Envoyer à tous les contacts (priorité haute en premier)
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
        )

        if (whatsappResponse.ok) {
          console.log(`✅ Alerte envoyée à ${contact.full_name} (${contact.phone_number})`)
        } else {
          console.error(`❌ Échec envoi à ${contact.full_name}: HTTP ${whatsappResponse.status}`)
        }
      } catch (error) {
        console.error(`❌ Erreur envoi à ${contact.full_name}:`, error)
      }
    }

    return true
  } catch (error) {
    console.error('❌ [sendSupportAlert] Erreur critique:', error)
    return false
  }
}

/**
 * Formatter le message d'alerte selon le type
 */
function formatAlertMessage(alertData: any): string {
  const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })

  let message = `🚨 *ALERTE GREEN API* 🚨\n\n`
  message += `⏰ ${timestamp}\n`
  message += `📱 Instance: ${alertData.instance}\n\n`

  switch (alertData.type) {
    case 'reboot_failed':
      message += `❌ *REBOOT ÉCHOUÉ*\n\n`
      message += `État détecté: ${alertData.stateInstance}\n`
      message += `Commande reboot exécutée mais retour négatif\n\n`
      message += `⚠️ *ACTION REQUISE:*\n`
      message += `1. Vérifier le dashboard Green API\n`
      message += `2. Tenter reboot manuel si nécessaire\n`
      message += `3. Vérifier la connexion WhatsApp`
      break

    case 'reboot_unreachable':
      message += `❌ *ENDPOINT REBOOT INACCESSIBLE*\n\n`
      message += `HTTP Status: ${alertData.httpStatus}\n\n`
      message += `⚠️ *ACTION REQUISE:*\n`
      message += `1. Vérifier l'accès API Green\n`
      message += `2. Contrôler les credentials\n`
      message += `3. Tester manuellement le reboot`
      break

    case 'timeout_and_reboot_failed':
      message += `❌ *TIMEOUT + REBOOT ÉCHOUÉ*\n\n`
      message += `Erreur: ${alertData.error}\n`
      message += `Temps réponse: ${alertData.responseTimeMs}ms\n\n`
      message += `⚠️ *ACTION REQUISE:*\n`
      message += `1. L'instance ne répond plus\n`
      message += `2. Reboot automatique a échoué\n`
      message += `3. Intervention manuelle critique`
      break

    case 'complete_failure':
      message += `🔴 *ÉCHEC COMPLET DU SYSTÈME*\n\n`
      message += `Erreur: ${alertData.error}\n\n`
      message += `⚠️ *ACTION IMMÉDIATE REQUISE:*\n`
      message += `1. Instance complètement inaccessible\n`
      message += `2. Reboot impossible\n`
      message += `3. Vérifier dashboard Green API\n`
      message += `4. Contact support Green API si nécessaire`
      break

    default:
      message += `❓ Erreur inconnue: ${alertData.type}\n`
      message += `Détails: ${JSON.stringify(alertData)}`
  }

  message += `\n\n🔗 Dashboard: https://7105.api.greenapi.com`

  return message
}