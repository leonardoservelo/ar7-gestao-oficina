@echo off
setlocal
cd /d "%~dp0"
title AR7 Gestao da Oficina V20
chcp 65001 >nul 2>nul

echo ==============================================================
echo  AR7 Gestao da Oficina V20
echo  Iniciando servidor local...
echo  Se 8108 estiver ocupada, outra porta sera escolhida sozinha.
echo ==============================================================

where node >nul 2>nul
if %errorlevel%==0 (
  node server.js 8108 --open --auto-port
  goto :end
)

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 server.py --auto-port --open
  goto :end
)

where python >nul 2>nul
if %errorlevel%==0 (
  python server.py --auto-port --open
  goto :end
)

echo.
echo Node.js ou Python nao foram encontrados.
echo Abrindo diretamente no navegador como ultimo recurso...
start "" "%~dp0index.html"

:end
endlocal
