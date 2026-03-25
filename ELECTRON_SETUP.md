# Guía de Instalación - Josimar Cell Desktop

Esta aplicación web está preparada para ejecutarse como aplicación de escritorio usando Electron.

## Requisitos Previos

- Node.js versión 16 o superior
- npm o yarn

## Instalación de Dependencias para Desktop

Para convertir esta aplicación web en una aplicación de escritorio ejecutable:

### 1. Instalar Electron y herramientas de empaquetado

```bash
npm install --save-dev electron electron-builder
```

### 2. Actualizar package.json

Agregar los siguientes scripts en la sección "scripts":

```json
{
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux"
  }
}
```

### 3. Agregar configuración de electron-builder en package.json

```json
{
  "main": "electron.js",
  "build": {
    "appId": "com.josimarcell.inventory",
    "productName": "Josimar Cell - Sistema de Inventario",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron.js",
      "preload.js",
      "icon.png"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "icon.png"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "icon.png"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### 4. Instalar dependencias adicionales (opcional)

```bash
npm install --save-dev concurrently wait-on
```

## Ejecución

### Modo Desarrollo (web normal)
```bash
npm run dev
```

### Modo Desarrollo Electron (aplicación de escritorio)
```bash
npm run electron:dev
```

### Generar Ejecutable

#### Windows
```bash
npm run electron:build:win
```

Esto generará:
- Instalador NSIS (.exe) en `release/`
- Versión portable (.exe) en `release/`

#### macOS
```bash
npm run electron:build:mac
```

Esto generará:
- Archivo DMG para instalación
- Archivo ZIP

#### Linux
```bash
npm run electron:build:linux
```

Esto generará:
- AppImage (ejecutable universal)
- Paquete DEB (para Debian/Ubuntu)

## Características de la Versión Desktop

✅ **Base de datos local persistente** - Los datos se guardan automáticamente en el disco
✅ **Funciona sin internet** - Aplicación completamente offline
✅ **Instalable** - Se puede instalar como programa nativo
✅ **Multiplataforma** - Windows, macOS, Linux
✅ **Rendimiento mejorado** - Más rápido que la versión web
✅ **Icono de aplicación** - Aparece en el escritorio y menú de inicio

## Notas Importantes

1. La primera vez que ejecutes el build puede tardar varios minutos
2. Los ejecutables se generarán en la carpeta `release/`
3. El archivo `icon.png` debe ser una imagen de 512x512 píxeles para mejor calidad
4. La base de datos se guardará en:
   - Windows: `C:\Users\<Usuario>\AppData\Roaming\josimar-cell-inventory\`
   - macOS: `~/Library/Application Support/josimar-cell-inventory/`
   - Linux: `~/.config/josimar-cell-inventory/`

## Compatibilidad de Navegadores (Versión Web)

La aplicación es compatible con:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+
- ✅ Brave
- ✅ Navegadores móviles modernos

## Solución de Problemas

**Error al compilar para Windows en macOS/Linux:**
- Instala `wine` para compilación cruzada

**Error "Electron failed to install correctly":**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

**La aplicación no inicia:**
- Verifica que Node.js esté actualizado
- Ejecuta `npm run build` antes de `electron:build`
