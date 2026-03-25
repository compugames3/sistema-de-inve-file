@echo off
chcp 65001 >nul
REM Script de configuración rápida para Josimar Cell Desktop
REM Este script prepara el proyecto para generar ejecutables de escritorio

echo ================================================================
echo    Josimar Cell - Configuración para Aplicación Desktop
echo ================================================================
echo.

REM Verificar que Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo.
    echo Por favor instala Node.js desde https://nodejs.org/
    echo Se recomienda la versión LTS (Long Term Support)
    echo.
    pause
    exit /b 1
)

echo ✅ Verificando Node.js instalado: 
node --version
echo ✅ Verificando npm instalado: 
npm --version
echo.

echo 📦 Instalando dependencias para aplicación de escritorio...
echo    (Esto puede tardar 5-10 minutos la primera vez)
echo.

REM Instalar dependencias de desarrollo para Electron
call npm install --save-dev electron electron-builder concurrently wait-on

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR al instalar dependencias
    echo.
    echo Intenta ejecutar estos comandos manualmente:
    echo   npm cache clean --force
    echo   npm install --save-dev electron electron-builder
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Dependencias instaladas correctamente
echo.
echo ================================================================
echo                    ✅ Instalación Completa
echo ================================================================
echo.
echo 📖 Comandos disponibles:
echo.
echo   🌐 Versión Web:
echo      npm run dev              - Ejecutar en navegador (desarrollo)
echo      npm run build            - Construir para producción
echo.
echo   💻 Versión Desktop:
echo      npm run electron:dev     - Ejecutar app de escritorio (desarrollo)
echo      npm run electron:build   - Generar ejecutable para tu sistema
echo.
echo   📦 Generar ejecutables específicos:
echo      npm run electron:build:win    - Ejecutable para Windows
echo      npm run electron:build:mac    - Ejecutable para macOS
echo      npm run electron:build:linux  - Ejecutable para Linux
echo.
echo 💡 Siguiente paso recomendado:
echo    npm run electron:build:win
echo.
echo 📂 Los ejecutables se guardarán en la carpeta: release/
echo.
echo 📚 Para más información, consulta: COMO_GENERAR_EJECUTABLE.md
echo.
pause
