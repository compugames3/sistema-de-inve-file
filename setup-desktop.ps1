# Script de configuración para Josimar Cell Desktop (PowerShell)
# Este script prepara el proyecto para generar ejecutables

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   Josimar Cell - Configuración para Aplicación Desktop" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando requisitos..." -ForegroundColor Yellow

if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERROR: Node.js no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Se recomienda la versión LTS (Long Term Support)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "✅ Node.js instalado: " -ForegroundColor Green -NoNewline
node --version

Write-Host "✅ npm instalado: " -ForegroundColor Green -NoNewline
npm --version

Write-Host ""
Write-Host "📦 Instalando dependencias para aplicación de escritorio..." -ForegroundColor Yellow
Write-Host "   (Esto puede tardar 5-10 minutos la primera vez)" -ForegroundColor Gray
Write-Host ""

# Instalar dependencias
try {
    npm install --save-dev electron electron-builder concurrently wait-on
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error al instalar dependencias"
    }
    
    Write-Host ""
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "                ✅ Instalación Completa" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📖 Comandos disponibles:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   🌐 Versión Web:" -ForegroundColor Cyan
    Write-Host "      npm run dev              - Ejecutar en navegador (desarrollo)" -ForegroundColor White
    Write-Host "      npm run build            - Construir para producción" -ForegroundColor White
    Write-Host ""
    Write-Host "   💻 Versión Desktop:" -ForegroundColor Cyan
    Write-Host "      npm run electron:dev     - Ejecutar app de escritorio (desarrollo)" -ForegroundColor White
    Write-Host "      npm run electron:build   - Generar ejecutable para tu sistema" -ForegroundColor White
    Write-Host ""
    Write-Host "   📦 Generar ejecutables específicos:" -ForegroundColor Cyan
    Write-Host "      npm run electron:build:win    - Ejecutable para Windows" -ForegroundColor White
    Write-Host "      npm run electron:build:mac    - Ejecutable para macOS" -ForegroundColor White
    Write-Host "      npm run electron:build:linux  - Ejecutable para Linux" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Siguiente paso recomendado:" -ForegroundColor Yellow
    Write-Host "   npm run electron:build:win" -ForegroundColor Green
    Write-Host ""
    Write-Host "📂 Los ejecutables se guardarán en la carpeta: release/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📚 Para más información, consulta: COMO_GENERAR_EJECUTABLE.md" -ForegroundColor Gray
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR al instalar dependencias" -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta ejecutar estos comandos manualmente:" -ForegroundColor Yellow
    Write-Host "  npm cache clean --force" -ForegroundColor White
    Write-Host "  npm install --save-dev electron electron-builder" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Read-Host "Presiona Enter para continuar"
