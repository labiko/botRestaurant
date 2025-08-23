# Script de déploiement Bot Restaurant WhatsApp
# PowerShell pour Windows

Write-Host "🚀 Déploiement Bot Restaurant WhatsApp" -ForegroundColor Green

# 1. Vérifier les prérequis
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier si Supabase CLI est installé
if (!(Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI non trouvé. Installation..." -ForegroundColor Red
    npm install -g supabase
} else {
    Write-Host "✅ Supabase CLI trouvé" -ForegroundColor Green
}

# 2. Lier au projet Supabase
Write-Host "🔗 Connexion au projet Supabase..." -ForegroundColor Yellow
$projectRef = "ymlzjvposzzdgpksgvsn"

try {
    supabase link --project-ref $projectRef
    Write-Host "✅ Projet Supabase lié" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erreur lors de la liaison au projet: $_" -ForegroundColor Red
}

# 3. Configurer les secrets
Write-Host "🔐 Configuration des secrets..." -ForegroundColor Yellow

$secrets = @{
    "GREEN_API_TOKEN" = "022e5da3d2e641ab99a3f70539270b187fbfa80635c44b71ad"
    "GREEN_API_INSTANCE_ID" = "7105303512"
    "GREEN_API_BASE_URL" = "https://7105.api.greenapi.com"
    "BOT_PHONE_NUMBER" = "224600000000"
    "DEFAULT_TIMEOUT_MINUTES" = "30"
    "MAX_ITEMS_PER_PAGE" = "5"
    "DEFAULT_CURRENCY" = "GNF"
    "DEFAULT_DELIVERY_RADIUS_KM" = "10"
    "DEFAULT_DELIVERY_FEE_PER_KM" = "3000"
    "DEFAULT_FREE_DELIVERY_THRESHOLD" = "100000"
    "DEFAULT_MINIMUM_ORDER_DELIVERY" = "25000"
    "DENO_ENV" = "production"
    "DEBUG" = "false"
    "LOG_LEVEL" = "info"
}

foreach ($secret in $secrets.GetEnumerator()) {
    try {
        supabase secrets set "$($secret.Key)=$($secret.Value)"
        Write-Host "✅ Secret configuré: $($secret.Key)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur pour le secret $($secret.Key): $_" -ForegroundColor Red
    }
}

# 4. Déployer les migrations
Write-Host "🗄️ Déploiement des migrations de base de données..." -ForegroundColor Yellow

try {
    supabase db push
    Write-Host "✅ Migrations déployées" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du déploiement des migrations: $_" -ForegroundColor Red
}

# 5. Déployer les Edge Functions
Write-Host "⚡ Déploiement des Edge Functions..." -ForegroundColor Yellow

try {
    supabase functions deploy webhook-whatsapp
    Write-Host "✅ Edge Function déployée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du déploiement des fonctions: $_" -ForegroundColor Red
}

# 6. Vérifier le déploiement
Write-Host "🔍 Vérification du déploiement..." -ForegroundColor Yellow

$webhookUrl = "https://$projectRef.supabase.co/functions/v1/webhook-whatsapp/health"
Write-Host "URL de santé: $webhookUrl" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $webhookUrl -Method Get -TimeoutSec 10
    Write-Host "✅ Webhook accessible: $($response.status)" -ForegroundColor Green
    Write-Host "📊 État WhatsApp: $($response.whatsapp_instance_state)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️ Impossible de vérifier le webhook: $_" -ForegroundColor Yellow
}

# 7. Configuration Green API
Write-Host "📱 Configuration Green API..." -ForegroundColor Yellow

$greenApiWebhookUrl = "https://$projectRef.supabase.co/functions/v1/webhook-whatsapp"
Write-Host "URL du webhook à configurer dans Green API:" -ForegroundColor Cyan
Write-Host $greenApiWebhookUrl -ForegroundColor White

# 8. Informations finales
Write-Host "🎉 Déploiement terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Aller sur https://console.green-api.com/" -ForegroundColor White
Write-Host "2. Configurer le webhook: $greenApiWebhookUrl" -ForegroundColor White
Write-Host "3. Activer les événements: incomingMessageReceived, stateInstanceChanged" -ForegroundColor White
Write-Host "4. Scanner le QR code WhatsApp Business" -ForegroundColor White
Write-Host "5. Tester avec un message 'resto' sur WhatsApp" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Liens utiles:" -ForegroundColor Yellow
Write-Host "- Dashboard Supabase: https://supabase.com/dashboard/project/$projectRef" -ForegroundColor Cyan
Write-Host "- Console Green API: https://console.green-api.com/" -ForegroundColor Cyan
Write-Host "- Logs functions: https://supabase.com/dashboard/project/$projectRef/functions" -ForegroundColor Cyan

Write-Host ""
Write-Host "✨ Bot Restaurant WhatsApp est prêt!" -ForegroundColor Green