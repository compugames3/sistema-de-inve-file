# Configuración del Icono

El archivo `icon.svg` es el icono de la aplicación Josimar Cell. 

## Para la versión Desktop (Electron)

Para generar ejecutables con icono personalizado, necesitas convertir `icon.svg` a los formatos apropiados:

### Windows (.ico)
Necesitas un archivo `icon.ico` de 256x256 píxeles.

**Herramientas recomendadas:**
- https://convertio.co/svg-ico/
- https://cloudconvert.com/svg-to-ico

### macOS (.icns)
Necesitas un archivo `icon.icns`.

**Herramientas recomendadas:**
- https://cloudconvert.com/svg-to-icns
- O usar la aplicación "Icon Composer" en macOS

### Linux (.png)
Linux usa PNG directamente. Exporta `icon.svg` a `icon.png` en 512x512 píxeles.

**Herramientas recomendadas:**
- Inkscape
- GIMP
- Online: https://convertio.co/svg-png/

## Conversión rápida con herramientas online

1. Ve a https://convertio.co/
2. Sube el archivo `icon.svg`
3. Convierte a:
   - `icon.ico` (para Windows)
   - `icon.icns` (para macOS)
   - `icon.png` (512x512 para Linux)
4. Guarda los archivos en la raíz del proyecto

## Actualizar package.json

Una vez tengas los iconos, actualiza la configuración de `electron-builder` en `package.json`:

```json
"build": {
  "win": {
    "icon": "icon.ico"
  },
  "mac": {
    "icon": "icon.icns"
  },
  "linux": {
    "icon": "icon.png"
  }
}
```

## Icono actual

El icono actual representa:
- 📱 Un teléfono celular (Josimar **Cell**)
- 📦 Cajas de inventario (Sistema de **Inventario**)
- 🎨 Gradiente corporativo (profesional y moderno)

Puedes personalizarlo editando `icon.svg` con cualquier editor SVG (Inkscape, Figma, Adobe Illustrator, etc.).
