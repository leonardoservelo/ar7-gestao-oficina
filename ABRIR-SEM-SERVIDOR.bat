@echo off
setlocal
cd /d "%~dp0"
title AR7 Gestao da Oficina - Modo sem servidor
start "" "%~dp0index.html"
echo.
echo O sistema foi aberto diretamente pelo index.html.
echo Caso o navegador nao abra, abra manualmente o arquivo index.html.
echo.
pause
endlocal
