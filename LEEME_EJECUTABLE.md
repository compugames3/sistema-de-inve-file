# 🚀 Cómo Generar el Ejecutable de Windows - INICIO AQUÍ

Si quieres convertir esta aplicación en un **programa .exe para Windows**, sigue estos pasos:

## 📋 Paso 1: Preparación

1. **Abre CMD o PowerShell** en esta carpeta
2. **Ejecuta:**
   ```batch
   setup-desktop.bat
   ```
3. **Espera** 5-10 minutos a que termine

## 📦 Paso 2: Convertir el Icono (IMPORTANTE)

Antes de generar el ejecutable, necesitas convertir `icon.svg` a `icon.png`:

1. **Ve a:** https://convertio.co/svg-png/
2. **Sube** el archivo `icon.svg` (está en esta carpeta)
3. **Configura** tamaño: **512x512 píxeles**
4. **Descarga** como `icon.png`
5. **Guarda** `icon.png` en esta misma carpeta

> **Nota:** Si no haces esto, el ejecutable se generará sin icono personalizado (usará el icono predeterminado de Electron, pero funcionará igual).

## 🎯 Paso 3: Generar el Ejecutable

**Ejecuta:**
```batch
generar-ejecutable.bat
```

**O manualmente:**
```bash
npm run electron:build:win
```

## 📂 Paso 4: Encuentra tu Ejecutable

Los archivos estarán en la carpeta **`release/`**:

- ✅ **Instalador:** `Josimar Cell - Sistema de Inventario Setup 1.0.0.exe`
- ✅ **Portable:** `JosimarCell-Portable-1.0.0.exe` (no requiere instalación)

## 🎉 ¡Listo!

Ahora puedes:
- **Instalar** el programa en tu computadora
- **Compartir** el ejecutable con otros usuarios
- **Distribuir** la aplicación sin que necesiten Node.js

---

## 📚 Documentación Detallada

| Documento | Descripción |
|-----------|-------------|
| **[INICIO_RAPIDO_EJECUTABLE.txt](./INICIO_RAPIDO_EJECUTABLE.txt)** | Guía visual paso a paso |
| **[COMO_GENERAR_EJECUTABLE.md](./COMO_GENERAR_EJECUTABLE.md)** | Guía completa con solución de problemas |
| **[ICON_GUIDE.md](./ICON_GUIDE.md)** | Cómo convertir y personalizar el icono |
| **[README_ES.md](./README_ES.md)** | Documentación general del proyecto |
| **[ELECTRON_SETUP.md](./ELECTRON_SETUP.md)** | Documentación técnica de Electron |

---

## ❓ Preguntas Frecuentes

### ¿Necesito internet para generar el ejecutable?
Sí, la primera vez necesitas internet para descargar dependencias. Después funciona offline.

### ¿Los usuarios necesitan Node.js para ejecutar el .exe?
No, el ejecutable es completamente independiente.

### ¿Puedo compartir el ejecutable?
Sí, puedes compartir los archivos de la carpeta `release/` con quien quieras.

### ¿Funciona en Windows 7?
Sí, funciona en Windows 7, 8, 10 y 11.

### ¿El antivirus bloquea el ejecutable?
A veces sí, porque es un archivo nuevo sin firma digital. Agrégalo a excepciones.

---

## 🆘 ¿Problemas?

Lee **[COMO_GENERAR_EJECUTABLE.md](./COMO_GENERAR_EJECUTABLE.md)** - Sección "Solución de Problemas"

---

**¿Listo para empezar?** → Ejecuta `setup-desktop.bat` 🚀
