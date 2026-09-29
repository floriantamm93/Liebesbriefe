@echo off
setlocal
cd /d "%~dp0"
start "Briefvorschau" cmd /k "node scripts\serve.mjs"
timeout /t 2 /nobreak > nul
start "" "http://127.0.0.1:8000/letter/private/"
