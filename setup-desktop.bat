@echo off
REM Script de configuración rápida para Josimar Cell Desktop
REM Este script prepara el proyecto para generar ejecutables de escritorio

echo ================================================================
echo    Josimar Cell - Configuracion para Aplicacion Desktop
echo ================================================================
echo.

REM Verificar que Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo Verificando Node.js instalado: 
node --version
echo Verificando npm instalado: 
npm --version
echo.

REM Instalar dependencias de desarrollo para Electron
echo Instalando dependencias para aplicacion de escritorio...
call npm install --save-dev electron electron-builder concurrently wait-on

if %ERRORLEVEL% NEQ 0 (
    echo ERROR al instalar dependencias
    pause
    exit /b 1
)

echo Dependencias instaladas correctamente
echo.
echo ================================================================
echo                    Instalacion Completa
echo ================================================================
echo.
echo Comandos disponibles:
echo.
echo   Version Web:
echo      npm run dev              - Ejecutar en navegador (desarrollo)
echo      npm run build            - Construir para produccion
echo.
echo   Version Desktop:
echo      npm run electron:dev     - Ejecutar app de escritorio (desarrollo)
echo      npm run electron:build   - Generar ejecutable para tu sistema
echo.
echo   Generar ejecutables especificos:
echo      npm run electron:build:win    - Ejecutable para Windows
echo      npm run electron:build:mac    - Ejecutable para macOS
echo      npm run electron:build:linux  - Ejecutable para Linux
echo.
echo Los ejecutables se guardaran en la carpeta: release/
echo.
echo Para mas informacion, consulta: ELECTRON_SETUP.md y README_ES.md
echo.
pause
