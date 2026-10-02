@echo off
setlocal
cd /d "%~dp0"
if not exist ".preview\handyvorschau.pfx" (
  echo Ein lokales HTTPS-Zertifikat wird vorbereitet ...
  powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\create-preview-certificate.ps1" -Path ".\.preview\handyvorschau.pfx" -Password "Liebesbriefe-Handyvorschau"
  if errorlevel 1 (
    echo Das HTTPS-Zertifikat konnte nicht erstellt werden.
    pause
    exit /b 1
  )
)
set LETTER_HOST=0.0.0.0
set LETTER_PORT=8443
set LETTER_HTTPS_PFX=.preview\handyvorschau.pfx
set LETTER_HTTPS_PASSWORD=Liebesbriefe-Handyvorschau
echo.
echo Die sichere Handyvorschau startet. Dieses Fenster bitte geoeffnet lassen.
echo.
node scripts\serve.mjs
pause
