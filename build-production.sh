#!/bin/bash
# Script de Build para Producción - Josimar Cell
# Este script construye la aplicación web optimizada para producción

echo "============================================"
echo " Josimar Cell - Build de Producción"
echo "============================================"
echo ""

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado."
    echo "Por favor, instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm no está instalado."
    exit 1
fi

echo "[1/4] Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "[INFO] Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Error al instalar dependencias"
        exit 1
    fi
else
    echo "[OK] Dependencias ya instaladas"
fi

echo ""
echo "[2/4] Limpiando build anterior..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "[OK] Build anterior eliminado"
else
    echo "[INFO] No hay build anterior"
fi

echo ""
echo "[3/4] Construyendo aplicación para producción..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERROR] Error al construir la aplicación"
    exit 1
fi

echo ""
echo "[4/4] Verificando archivos generados..."
if [ -f "dist/index.html" ]; then
    echo "[OK] Build completado exitosamente"
    echo ""
    echo "============================================"
    echo " Build Completado"
    echo "============================================"
    echo ""
    echo "La aplicación está lista para producción en la carpeta 'dist/'"
    echo ""
    echo "Próximos pasos:"
    echo "1. Sube la carpeta 'dist/' a tu servidor web"
    echo "2. Configura tu servidor (Apache/Nginx)"
    echo "3. Consulta DEPLOYMENT.md para instrucciones detalladas"
    echo ""
else
    echo "[ERROR] El build no generó los archivos esperados"
    exit 1
fi
