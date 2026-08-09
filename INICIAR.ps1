$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
Write-Host 'AR7 Gestao da Oficina V20.2.5'
Write-Host 'Procurando uma porta livre a partir de 8108...'
if (Get-Command node -ErrorAction SilentlyContinue) {
  & node "$PSScriptRoot\server.js" 8108 --open --auto-port
  exit $LASTEXITCODE
}
if (Get-Command py -ErrorAction SilentlyContinue) {
  & py -3 "$PSScriptRoot\server.py" --auto-port --open
  exit $LASTEXITCODE
}
if (Get-Command python -ErrorAction SilentlyContinue) {
  & python "$PSScriptRoot\server.py" --auto-port --open
  exit $LASTEXITCODE
}
Start-Process "$PSScriptRoot\index.html"
