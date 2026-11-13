@echo off
rem COATL · inicia el sitio en este equipo y lo abre en el navegador (funciona sin internet,
rem salvo el mapa satelital, las fuentes y el DENUE en vivo).
cd /d "%~dp0"
where node >nul 2>nul || (echo Necesitas Node.js 18 o superior: https://nodejs.org & pause & exit /b 1)
if not exist dist\index.html call npm run build
start "" http://127.0.0.1:8000/
node scripts\servir.mjs 8000 dist
