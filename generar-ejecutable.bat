@echo off
chcp 65001 >nul
REM Script para generar ejecutable de Windows - Josimar Cell

echo ================================================================
echo         Generando Ejecutable de Windows - Josimar Cell
echo ================================================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo    Instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar que electron-builder está instalado
call npm list electron-builder >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Electron Builder no está instalado. Instalando...
    call npm install --save-dev electron electron-builder concurrently wait-on
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
)

echo ✅ Verificaciones completadas
echo.
echo 🔨 Paso 1/2: Construyendo aplicación web...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error al construir la aplicación
    pause
    exit /b 1
)

echo.
echo ✅ Aplicación web construida correctamente
echo.
echo 📦 Paso 2/2: Generando ejecutable para Windows...
echo    (Esto puede tardar varios minutos)
echo.

call electron-builder --win

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error al generar el ejecutable
    echo.
    echo Soluciones:
    echo   1. Verifica que icon.png existe en la raíz del proyecto
    echo   2. Asegúrate de tener espacio suficiente en disco
    echo   3. Ejecuta: npm cache clean --force
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================================
echo              ✅ ¡Ejecutable Generado Exitosamente!
echo ================================================================
echo.
echo 📂 Ubicación: release/
echo.
echo 📦 Archivos generados:
dir /B release\*.exe 2>nul

echo.
echo 💡 Tipos de ejecutable:
echo    • Instalador: *Setup*.exe (requiere instalación)
echo    • Portable: *Portable*.exe (ejecuta directamente)
echo.
echo 🚀 Puedes compartir estos archivos con otros usuarios
echo    No necesitan tener Node.js instalado para usarlos
echo.
pause
