@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=Get-CimInstance Win32_Process ^| Where-Object { $_.CommandLine -match 'server\.js' -and $_.CommandLine -match 'AR7-Gestao-Oficina' }; if($p){$p ^| ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; Write-Host 'Servidor AR7 encerrado.'} else {Write-Host 'Nenhum servidor AR7 em execucao foi encontrado.'}"
pause
endlocal
