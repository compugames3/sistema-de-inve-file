# Scripts para agregar a package.json

Para habilitar la funcionalidad de aplicación de escritorio, agrega estos scripts a la sección "scripts" de tu `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
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
      "icon.png",
      "icon.svg"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "icon.png"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "icon.png",
      "category": "public.app-category.business"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "icon.png",
      "category": "Office"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Josimar Cell"
    }
  }
}
```

## Dependencias a instalar

Para usar la versión desktop, instala:

```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

## Uso de los scripts

### Desarrollo Web
```bash
npm run dev        # Inicia servidor de desarrollo (http://localhost:5173)
npm run build      # Construye para producción web
npm run preview    # Vista previa de build de producción
```

### Desarrollo Desktop
```bash
npm run electron:dev    # Inicia app de escritorio en modo desarrollo
```

### Generar Ejecutables Desktop
```bash
npm run electron:build        # Genera ejecutable para tu sistema operativo actual
npm run electron:build:win    # Genera ejecutable para Windows (.exe)
npm run electron:build:mac    # Genera ejecutable para macOS (.dmg)
npm run electron:build:linux  # Genera ejecutable para Linux (AppImage, .deb)
```

## Notas importantes

1. **Primera vez:** Electron puede tardar varios minutos en descargarse
2. **Cross-compilation:** Para compilar para Windows desde Mac/Linux, necesitas `wine`
3. **Tamaño:** Los ejecutables serán de ~150-200MB (incluyen Chromium)
4. **Ubicación:** Los ejecutables se generan en `release/`
5. **Iconos:** Asegúrate de tener `icon.png` (512x512) para mejor calidad

## Archivos creados para Desktop

- `electron.js` - Proceso principal de Electron
- `preload.js` - Script de preload para seguridad
- `icon.svg` / `icon.png` - Icono de la aplicación
- `.browserslistrc` - Configuración de compatibilidad de navegadores
- `setup-desktop.sh` / `setup-desktop.bat` - Scripts de instalación automática
