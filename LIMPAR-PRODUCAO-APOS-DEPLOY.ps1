$ErrorActionPreference = 'Stop'
$URL = 'https://ar7-gestao-oficina.onrender.com'

Clear-Host
Write-Host ''
Write-Host '============================================================' -ForegroundColor Red
Write-Host ' AR7 - LIMPEZA DEFINITIVA DO BANCO CENTRAL' -ForegroundColor Red
Write-Host '============================================================' -ForegroundColor Red
Write-Host ''

try {
    $health = Invoke-RestMethod "$URL/health?nocache=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -TimeoutSec 30
    Write-Host "Versao online:          $($health.version)" -ForegroundColor Cyan
    Write-Host "Banco configurado:      $($health.databaseConfigured)" -ForegroundColor Cyan
    Write-Host "Banco conectado:        $($health.databaseConnected)" -ForegroundColor Cyan

    if ($health.version -ne '20.2.6' -or !$health.databaseConfigured -or !$health.databaseConnected) {
        throw 'A limpeza so pode ser executada depois que a V20.2.6 estiver online com o banco conectado.'
    }

    Write-Host ''
    Write-Host 'A V20.2.6 esta pronta para impedir que dispositivos antigos restaurem dados apagados.' -ForegroundColor Green
    Write-Host ''

    $username = Read-Host 'Usuario administrador (ENTER = admin)'
    if ([string]::IsNullOrWhiteSpace($username)) { $username = 'admin' }
    $secure = Read-Host 'Senha do administrador' -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }

    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $loginBody = @{ username = $username; password = $password } | ConvertTo-Json
    $null = Invoke-RestMethod "$URL/api/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody -WebSession $session -TimeoutSec 30
    $password = $null

    Write-Host ''
    Write-Host 'ATENCAO: serao apagados clientes, equipamentos, OS, historico, lixeira, fotos e anexos.' -ForegroundColor Red
    $confirm = Read-Host 'Digite exatamente LIMPAR AR7 para continuar'
    if ($confirm -cne 'LIMPAR AR7') { throw 'Confirmacao cancelada. Nenhum dado foi apagado.' }

    $purgeBody = @{ confirm = 'LIMPAR AR7' } | ConvertTo-Json
    $result = Invoke-RestMethod "$URL/api/admin/purge" -Method Post -ContentType 'application/json' -Body $purgeBody -WebSession $session -TimeoutSec 60

    $state = Invoke-RestMethod "$URL/api/state?nocache=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -WebSession $session -TimeoutSec 30
    $clean = ($state.data.clients.Count -eq 0 -and $state.data.equipment.Count -eq 0 -and $state.data.orders.Count -eq 0 -and $state.data.activity.Count -eq 0 -and $state.data.deletedOrders.Count -eq 0)

    if (!$result.ok -or !$result.purged -or !$clean) { throw 'O servidor respondeu, mas a verificacao final nao confirmou o banco vazio.' }

    Write-Host ''
    Write-Host '============================================================' -ForegroundColor Green
    Write-Host ' LIMPEZA DEFINITIVA CONCLUIDA' -ForegroundColor Green
    Write-Host '============================================================' -ForegroundColor Green
    Write-Host ''
    Write-Host "Clientes:               $($state.data.clients.Count)" -ForegroundColor Green
    Write-Host "Equipamentos:           $($state.data.equipment.Count)" -ForegroundColor Green
    Write-Host "Ordens de servico:      $($state.data.orders.Count)" -ForegroundColor Green
    Write-Host "Historico operacional:  $($state.data.activity.Count)" -ForegroundColor Green
    Write-Host "Lixeira:                 $($state.data.deletedOrders.Count)" -ForegroundColor Green
    Write-Host "Anexos removidos:       $($result.mediaDeleted)" -ForegroundColor Green
    Write-Host ''
    Write-Host 'A configuracao da oficina e o catalogo-base foram preservados.' -ForegroundColor Cyan
    Write-Host 'Recarregue os tablets/celulares antes de iniciar os cadastros reais.' -ForegroundColor Cyan
}
catch {
    Write-Host ''
    Write-Host 'LIMPEZA NAO CONCLUIDA' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ''
Read-Host 'Pressione ENTER para encerrar'
