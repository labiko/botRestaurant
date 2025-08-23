# Script de test du webhook Bot Restaurant WhatsApp
# PowerShell pour Windows

param(
    [string]$ProjectRef = "ymlzjvposzzdgpksgvsn",
    [string]$TestPhone = "224625123456"
)

Write-Host "🧪 Test du Bot Restaurant WhatsApp" -ForegroundColor Green
Write-Host "📱 Numéro de test: $TestPhone" -ForegroundColor Cyan

$baseUrl = "https://$ProjectRef.supabase.co/functions/v1"
$webhookUrl = "$baseUrl/webhook-whatsapp"
$healthUrl = "$baseUrl/webhook-whatsapp/health"

# 1. Test de santé
Write-Host "1️⃣ Test de santé du webhook..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10
    Write-Host "✅ Status: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "📊 État WhatsApp: $($healthResponse.whatsapp_instance_state)" -ForegroundColor Cyan
    Write-Host "🕒 Timestamp: $($healthResponse.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur de santé: $_" -ForegroundColor Red
    exit 1
}

# 2. Test message initial "resto"
Write-Host "2️⃣ Test message 'resto'..." -ForegroundColor Yellow

$testWebhook1 = @{
    typeWebhook = "incomingMessageReceived"
    instanceData = @{
        idInstance = "7105303512"
        wid = "$TestPhone@c.us"
        typeInstance = "whatsapp"
    }
    timestamp = [int](Get-Date -UFormat %s)
    idMessage = "test_msg_001"
    senderData = @{
        chatId = "$TestPhone@c.us"
        sender = "$TestPhone@c.us"
        senderName = "Test User"
    }
    messageData = @{
        typeMessage = "textMessage"
        textMessageData = @{
            textMessage = "resto"
        }
    }
}

try {
    $response1 = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body ($testWebhook1 | ConvertTo-Json -Depth 10) -ContentType "application/json" -TimeoutSec 15
    Write-Host "✅ Message 'resto' traité: $($response1.success)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur message 'resto': $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# 3. Test choix restaurant "1"
Write-Host "3️⃣ Test choix restaurant '1'..." -ForegroundColor Yellow

$testWebhook2 = @{
    typeWebhook = "incomingMessageReceived"
    instanceData = @{
        idInstance = "7105303512"
        wid = "$TestPhone@c.us"
        typeInstance = "whatsapp"
    }
    timestamp = [int](Get-Date -UFormat %s)
    idMessage = "test_msg_002"
    senderData = @{
        chatId = "$TestPhone@c.us"
        sender = "$TestPhone@c.us"
        senderName = "Test User"
    }
    messageData = @{
        typeMessage = "textMessage"
        textMessageData = @{
            textMessage = "1"
        }
    }
}

try {
    $response2 = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body ($testWebhook2 | ConvertTo-Json -Depth 10) -ContentType "application/json" -TimeoutSec 15
    Write-Host "✅ Choix '1' traité: $($response2.success)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur choix '1': $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# 4. Test position (géolocalisation Conakry)
Write-Host "4️⃣ Test position géographique..." -ForegroundColor Yellow

$testWebhook3 = @{
    typeWebhook = "incomingMessageReceived"
    instanceData = @{
        idInstance = "7105303512"
        wid = "$TestPhone@c.us"
        typeInstance = "whatsapp"
    }
    timestamp = [int](Get-Date -UFormat %s)
    idMessage = "test_msg_003"
    senderData = @{
        chatId = "$TestPhone@c.us"
        sender = "$TestPhone@c.us"
        senderName = "Test User"
    }
    messageData = @{
        typeMessage = "locationMessage"
        locationMessageData = @{
            latitude = 9.535747
            longitude = -13.677290
        }
    }
}

try {
    $response3 = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body ($testWebhook3 | ConvertTo-Json -Depth 10) -ContentType "application/json" -TimeoutSec 15
    Write-Host "✅ Position traitée: $($response3.success)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur position: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# 5. Test sélection menu "1,3,3"
Write-Host "5️⃣ Test sélection menu '1,3,3'..." -ForegroundColor Yellow

$testWebhook4 = @{
    typeWebhook = "incomingMessageReceived"
    instanceData = @{
        idInstance = "7105303512"
        wid = "$TestPhone@c.us"
        typeInstance = "whatsapp"
    }
    timestamp = [int](Get-Date -UFormat %s)
    idMessage = "test_msg_004"
    senderData = @{
        chatId = "$TestPhone@c.us"
        sender = "$TestPhone@c.us"
        senderName = "Test User"
    }
    messageData = @{
        typeMessage = "textMessage"
        textMessageData = @{
            textMessage = "1,3,3"
        }
    }
}

try {
    $response4 = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body ($testWebhook4 | ConvertTo-Json -Depth 10) -ContentType "application/json" -TimeoutSec 15
    Write-Host "✅ Sélection menu traitée: $($response4.success)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur sélection menu: $_" -ForegroundColor Red
}

# 6. Test annulation
Write-Host "6️⃣ Test annulation..." -ForegroundColor Yellow

$testWebhook5 = @{
    typeWebhook = "incomingMessageReceived"
    instanceData = @{
        idInstance = "7105303512"
        wid = "$TestPhone@c.us"
        typeInstance = "whatsapp"
    }
    timestamp = [int](Get-Date -UFormat %s)
    idMessage = "test_msg_005"
    senderData = @{
        chatId = "$TestPhone@c.us"
        sender = "$TestPhone@c.us"
        senderName = "Test User"
    }
    messageData = @{
        typeMessage = "textMessage"
        textMessageData = @{
            textMessage = "annuler"
        }
    }
}

try {
    $response5 = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body ($testWebhook5 | ConvertTo-Json -Depth 10) -ContentType "application/json" -TimeoutSec 15
    Write-Host "✅ Annulation traitée: $($response5.success)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur annulation: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Tests terminés!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Pour voir les logs détaillés:" -ForegroundColor Yellow
Write-Host "supabase functions logs webhook-whatsapp --follow" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Vérifiez la table sessions dans Supabase:" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard/project/$ProjectRef/editor" -ForegroundColor Cyan