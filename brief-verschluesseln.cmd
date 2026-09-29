@echo off
setlocal
cd /d "%~dp0"
node scripts\prepare-private.mjs ".private\sonderbrief.json"
if errorlevel 1 (
  echo.
  echo Es wurde keine Briefdatei erstellt.
) else (
  echo.
  echo Fertig. Du kannst die private Briefseite jetzt lokal pruefen.
)
pause
