#!/bin/bash

# Script de configuración rápida para Josimar Cell Desktop
# Este script prepara el proyecto para generar ejecutables de escritorio

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Josimar Cell - Configuración para Aplicación Desktop    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"
echo "✅ npm detectado: $(npm --version)"
echo ""

# Instalar dependencias de desarrollo para Electron
echo "📦 Instalando dependencias para aplicación de escritorio..."
npm install --save-dev electron electron-builder concurrently wait-on

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Instalación Completa                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Comandos disponibles:"
echo ""
echo "  🌐 Versión Web:"
echo "     npm run dev              - Ejecutar en navegador (desarrollo)"
echo "     npm run build            - Construir para producción"
echo ""
echo "  💻 Versión Desktop:"
echo "     npm run electron:dev     - Ejecutar app de escritorio (desarrollo)"
echo "     npm run electron:build   - Generar ejecutable para tu sistema"
echo ""
echo "  📦 Generar ejecutables específicos:"
echo "     npm run electron:build:win    - Ejecutable para Windows"
echo "     npm run electron:build:mac    - Ejecutable para macOS"
echo "     npm run electron:build:linux  - Ejecutable para Linux"
echo ""
echo "📂 Los ejecutables se guardarán en la carpeta: release/"
echo ""
echo "📖 Para más información, consulta: ELECTRON_SETUP.md y README_ES.md"
echo ""
