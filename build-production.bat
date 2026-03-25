@echo off
REM Script de Build para Producción - Josimar Cell
REM Este script construye la aplicación web optimizada para producción

echo ============================================
echo  Josimar Cell - Build de Producción
echo ============================================
echo.

REM Verificar que Node.js esté instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no está instalado.
    echo Por favor, descarga e instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar que npm esté instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm no está instalado.
    pause
    exit /b 1
)

echo [1/4] Verificando dependencias...
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Error al instalar dependencias
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias ya instaladas
)

echo.
echo [2/4] Limpiando build anterior...
if exist "dist\" (
    rmdir /s /q dist
    echo [OK] Build anterior eliminado
) else (
    echo [INFO] No hay build anterior
)

echo.
echo [3/4] Construyendo aplicación para producción...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al construir la aplicación
    pause
    exit /b 1
)

echo.
echo [4/4] Verificando archivos generados...
if exist "dist\index.html" (
    echo [OK] Build completado exitosamente
    echo.
    echo ============================================
    echo  Build Completado
    echo ============================================
    echo.
    echo La aplicación está lista para producción en la carpeta 'dist\'
    echo.
    echo Próximos pasos:
    echo 1. Sube la carpeta 'dist\' a tu servidor web
    echo 2. Configura tu servidor (Apache/Nginx)
    echo 3. Consulta DEPLOYMENT.md para instrucciones detalladas
    echo.
) else (
    echo [ERROR] El build no generó los archivos esperados
    pause
    exit /b 1
)

echo Presiona cualquier tecla para salir...
pause >nul
