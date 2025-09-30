// Edge Function: Green API Scheduled Reboot
// Exécution planifiée quotidienne du reboot Green API
// Déclenché via configuration horaire dans green_api_scheduled_reboots

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
    // 1. Vérifier si le reboot planifié est activé
    const { data: config, error: configError } = await supabase
      .from('green_api_scheduled_reboots')
      .select('*')
      .eq('id', 1)
      .single()

    if (configError || !config) {
      return new Response(JSON.stringify({
        error: 'Configuration not found',
        timestamp: new Date().toISOString()
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!config.is_enabled) {
      return new Response(JSON.stringify({
        message: 'Scheduled reboot is disabled',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result: HealthCheckResult = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      reboot_triggered: true, // Toujours true pour un reboot planifié
      support_notified: false
    }

    // 2. Vérifier l'état actuel de l'instance avant reboot
    try {
      const stateResponse = await fetch(
        `${BASE_URL}/waInstance${GREEN_API_INSTANCE}/getStateInstance/${GREEN_API_TOKEN}`,
        { signal: AbortSignal.timeout(10000) }
      )

      result.response_time_ms = Date.now() - startTime

      if (stateResponse.ok) {
        const state = await stateResponse.json()
        result.state_instance = state.stateInstance
      }
    } catch (stateError) {
      console.warn('⚠️ Could not check state before reboot:', stateError.message)
      // Continue avec le reboot même si le check échoue
    }

    // 3. Exécuter le reboot planifié
    console.log('🔄 [Scheduled Reboot] Exécution reboot planifié...')

    try {
      const rebootResponse = await fetch(
        `${BASE_URL}/waInstance${GREEN_API_INSTANCE}/reboot/${GREEN_API_TOKEN}`,
        { signal: AbortSignal.timeout(10000) }
      )

      if (rebootResponse.ok) {
        const rebootData = await rebootResponse.json()
        result.reboot_success = rebootData.isReboot === true

        if (result.reboot_success) {
          result.status = 'rebooted'
          console.log('✅ [Scheduled Reboot] Reboot exécuté avec succès')
        } else {
          // ⚠️ REBOOT ÉCHOUÉ - Notifier support
          result.status = 'critical_failure'
          result.error_message = 'Scheduled reboot command returned false'
          await sendSupportAlert(supabase, {
            type: 'scheduled_reboot_failed',
            instance: GREEN_API_INSTANCE,
            stateInstance: result.state_instance,
            error: 'Reboot command returned false'
          })
          result.support_notified = true
        }
      } else {
        // ⚠️ REBOOT NON ACCESSIBLE - Notifier support
        result.status = 'critical_failure'
        result.reboot_success = false
        result.error_message = `Reboot endpoint returned HTTP ${rebootResponse.status}`
        await sendSupportAlert(supabase, {
          type: 'scheduled_reboot_unreachable',
          instance: GREEN_API_INSTANCE,
          httpStatus: rebootResponse.status
        })
        result.support_notified = true
      }
    } catch (rebootError) {
      // ⚠️ ERREUR COMPLÈTE - Notifier support
      result.status = 'critical_failure'
      result.reboot_success = false
      result.error_message = rebootError.message
      await sendSupportAlert(supabase, {
        type: 'scheduled_reboot_error',
        instance: GREEN_API_INSTANCE,
        error: rebootError.message
      })
      result.support_notified = true
    }

    // 4. Logger dans Supabase avec trigger_type = 'scheduled'
    await logHealthCheck(supabase, result)

    // 5. Mettre à jour la configuration avec last_executed_at
    await supabase
      .from('green_api_scheduled_reboots')
      .update({
        last_executed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: result.status === 'critical_failure' ? 500 : 200
    })

  } catch (error) {
    console.error('❌ [Scheduled Reboot] Fatal error:', error)

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
 * Logger le résultat du reboot planifié
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
      support_notification_sent_at: result.support_notified ? new Date().toISOString() : null,
      trigger_type: 'scheduled' // Reboot planifié quotidien
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

  let message = `🚨 *ALERTE REBOOT PLANIFIÉ* 🚨\n\n`
  message += `⏰ ${timestamp}\n`
  message += `📱 Instance: ${alertData.instance}\n\n`

  switch (alertData.type) {
    case 'scheduled_reboot_failed':
      message += `❌ *REBOOT PLANIFIÉ ÉCHOUÉ*\n\n`
      message += `État détecté: ${alertData.stateInstance}\n`
      message += `Commande reboot exécutée mais retour négatif\n\n`
      message += `⚠️ *ACTION REQUISE:*\n`
      message += `1. Vérifier le dashboard Green API\n`
      message += `2. Tenter reboot manuel si nécessaire\n`
      message += `3. Vérifier la connexion WhatsApp`
      break

    case 'scheduled_reboot_unreachable':
      message += `❌ *ENDPOINT REBOOT INACCESSIBLE*\n\n`
      message += `HTTP Status: ${alertData.httpStatus}\n\n`
      message += `⚠️ *ACTION REQUISE:*\n`
      message += `1. Vérifier l'accès API Green\n`
      message += `2. Contrôler les credentials\n`
      message += `3. Tester manuellement le reboot`
      break

    case 'scheduled_reboot_error':
      message += `🔴 *ERREUR REBOOT PLANIFIÉ*\n\n`
      message += `Erreur: ${alertData.error}\n\n`
      message += `⚠️ *ACTION IMMÉDIATE REQUISE:*\n`
      message += `1. L'instance ne répond plus\n`
      message += `2. Reboot planifié a échoué\n`
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