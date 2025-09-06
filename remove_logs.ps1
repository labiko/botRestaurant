# Script PowerShell pour supprimer les logs non-DEBUG
$filePath = "botResto\src\app\core\services\france-orders.service.ts"
$content = Get-Content $filePath

# Supprimer les lignes avec console.log [FranceOrders] sauf celles avec [DEBUG]
$filteredContent = $content | Where-Object { 
    -not ($_ -match "console\.log.*\[FranceOrders\]" -and $_ -notmatch "\[DEBUG\]")
}

$filteredContent | Set-Content $filePath