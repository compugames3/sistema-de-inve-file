# Configuración del Icono para Aplicación Desktop

El archivo `icon.svg` es el icono de la aplicación Josimar Cell. Para generar el ejecutable de Windows necesitas un archivo `icon.png`.

## 🎨 Opción 1: Usar Herramientas Online (MÁS FÁCIL)

### Pasos Rápidos:

1. **Ve a:** https://convertio.co/svg-png/

2. **Sube** el archivo `icon.svg` (está en la raíz del proyecto)

3. **Configura** el tamaño de salida: **512x512 píxeles**

4. **Descarga** el archivo convertido como `icon.png`

5. **Guarda** `icon.png` en la **raíz del proyecto** (junto a icon.svg)

6. **Listo** - Ya puedes generar el ejecutable

### Alternativas Online:
- https://cloudconvert.com/svg-to-png
- https://image.online-convert.com/convert-to-png
- https://onlineconvertfree.com/convert-format/svg-to-png/

## 🖼️ Opción 2: Usar Software de Escritorio

### Con Inkscape (Gratis):
1. Descarga Inkscape: https://inkscape.org/
2. Abre `icon.svg`
3. Archivo → Exportar PNG
4. Tamaño: 512x512 píxeles
5. Guardar como `icon.png` en la raíz del proyecto

### Con GIMP (Gratis):
1. Descarga GIMP: https://www.gimp.org/
2. Abre `icon.svg`
3. Imagen → Escalar imagen → 512x512
4. Exportar como `icon.png`

### Con Adobe Illustrator:
1. Abre `icon.svg`
2. Exportar → Exportar como PNG
3. Resolución: 512x512
4. Guardar como `icon.png`

## 📦 Para Todas las Plataformas

Si quieres generar ejecutables para diferentes sistemas:

### Windows
- Formato: `.ico` o `.png`
- Tamaño recomendado: 256x256 o 512x512
- Archivo: `icon.png`

### macOS
- Formato: `.icns` o `.png`
- Tamaño recomendado: 512x512 o 1024x1024
- Herramienta: https://cloudconvert.com/png-to-icns

### Linux
- Formato: `.png`
- Tamaño recomendado: 512x512
- Archivo: `icon.png`

## ⚠️ IMPORTANTE

**Antes de generar el ejecutable, asegúrate de tener `icon.png` en la raíz del proyecto.**

Si no tienes el archivo:
1. El ejecutable se generará sin icono personalizado
2. Usará el icono predeterminado de Electron
3. No habrá errores, pero se verá genérico

## 🎨 Personalizar el Icono

Si quieres cambiar el diseño del icono:

1. Edita `icon.svg` con:
   - Inkscape (gratis)
   - Figma (gratis online)
   - Adobe Illustrator

2. Mantén el tamaño cuadrado (1:1)

3. Usa colores que representen tu marca

4. Exporta a PNG de 512x512 píxeles

## 🔍 Verificar que el Icono Está Listo

Antes de generar el ejecutable:

```batch
# En Windows CMD/PowerShell, verifica que existe:
dir icon.png

# Deberías ver algo como:
# icon.png    (tamaño en bytes)
```

Si no ves el archivo, conviértelo usando las opciones de arriba.

## 📖 Icono Actual

El icono actual de Josimar Cell representa:
- 📱 **Teléfono celular** (Josimar Cell)
- 📦 **Cajas de inventario** (Sistema de Inventario)
- 🎨 **Diseño profesional** (aplicación de negocio)

Puedes mantenerlo o personalizarlo según tus preferencias.

---

**¿Ya tienes icon.png?** ¡Perfecto! Continúa con `generar-ejecutable.bat`
