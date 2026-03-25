# 📦 Guía para Crear Ejecutable de Windows - Josimar Cell

Esta guía te ayudará a generar un ejecutable (.exe) de la aplicación Josimar Cell para Windows.

## 🚀 Pasos Rápidos (Recomendado)

### Opción 1: Usando el Script Automático

1. **Abre PowerShell o CMD** en la carpeta del proyecto
2. **Ejecuta el script de instalación:**
   ```batch
   setup-desktop.bat
   ```
3. **Espera** a que se instalen las dependencias (puede tardar 5-10 minutos)
4. **Genera el ejecutable:**
   ```batch
   npm run electron:build:win
   ```

### Opción 2: Instalación Manual

1. **Instala las dependencias de Electron:**
   ```batch
   npm install --save-dev electron electron-builder concurrently wait-on
   ```

2. **Genera el ejecutable:**
   ```batch
   npm run electron:build:win
   ```

## 📂 Dónde Encontrar el Ejecutable

Después de ejecutar el comando de build, encontrarás los archivos en la carpeta **`release/`**:

- **Instalador:** `Josimar Cell - Sistema de Inventario Setup X.X.X.exe`
- **Versión Portable:** `JosimarCell-Portable-X.X.X.exe` (no requiere instalación)

## 🎯 Tipos de Ejecutable Generados

### 1. Instalador (NSIS)
- Archivo: `*.Setup.exe`
- Se instala en `C:\Program Files\Josimar Cell - Sistema de Inventario`
- Crea acceso directo en el escritorio y menú inicio
- Se puede desinstalar desde Panel de Control

### 2. Versión Portable
- Archivo: `*-Portable.exe`
- No requiere instalación
- Se puede ejecutar desde USB o cualquier carpeta
- Perfecto para llevar en dispositivos portátiles

## 💻 Requisitos del Sistema

### Para Generar el Ejecutable (Desarrollo)
- Windows 7 o superior
- Node.js 16 o superior ([Descargar aquí](https://nodejs.org/))
- 2 GB de espacio libre en disco
- Conexión a internet (para la primera instalación)

### Para Ejecutar la Aplicación (Usuario Final)
- Windows 7 o superior
- 100 MB de espacio libre
- No requiere Node.js ni navegador

## 🛠️ Comandos Disponibles

```batch
# Ejecutar en modo desarrollo (navegador web)
npm run dev

# Ejecutar como aplicación de escritorio (desarrollo)
npm run electron:dev

# Construir versión web
npm run build

# Generar ejecutable para Windows (32 y 64 bits)
npm run electron:build:win

# Generar ejecutable para cualquier plataforma
npm run electron:build
```

## ⚙️ Personalización

### Cambiar el Icono de la Aplicación

1. Reemplaza el archivo `icon.png` con tu propio icono (512x512 píxeles)
2. Vuelve a generar el ejecutable

### Cambiar el Nombre del Ejecutable

Edita `package.json`:
```json
"build": {
  "productName": "Tu Nombre de Aplicación",
  "portable": {
    "artifactName": "TuNombre-Portable-${version}.exe"
  }
}
```

## 📊 Datos y Base de Datos

### Ubicación de los Datos (Versión Instalada)
- Windows: `C:\Users\<TuUsuario>\AppData\Roaming\josimar-cell-inventory\`
- Archivo: `josimar-cell-db.json`

### Respaldo de Datos
Los datos se guardan automáticamente en formato JSON. Puedes:
1. Copiar el archivo `josimar-cell-db.json` para hacer respaldo
2. Usar la función de exportación dentro de la aplicación

## 🔧 Solución de Problemas

### Error: "electron-builder not found"
```batch
npm install --save-dev electron-builder
```

### Error: "Cannot find module 'electron'"
```batch
npm install --save-dev electron
```

### Error al compilar: "ENOENT: no such file or directory"
Asegúrate de ejecutar primero:
```batch
npm run build
```

### El ejecutable no inicia
1. Verifica que no haya antivirus bloqueándolo
2. Ejecuta como administrador
3. Verifica los logs en `%APPDATA%\josimar-cell-inventory\logs\`

### Generar solo versión de 64 bits (más rápido)
Edita `package.json`:
```json
"win": {
  "target": [
    {
      "target": "nsis",
      "arch": ["x64"]
    }
  ]
}
```

## 📦 Distribución

### Para Compartir con Otros Usuarios

**Opción 1 - Instalador (Recomendado):**
- Comparte el archivo `*.Setup.exe`
- Los usuarios lo ejecutan y siguen el asistente de instalación

**Opción 2 - Versión Portable:**
- Comparte el archivo `*-Portable.exe`
- Los usuarios lo ejecutan directamente (sin instalación)

### Firmar el Ejecutable (Opcional - Avanzado)

Para evitar advertencias de SmartScreen de Windows:
1. Obtén un certificado de firma de código
2. Configura `electron-builder` con tu certificado
3. Más info: [Documentación de electron-builder](https://www.electron.build/code-signing)

## 🌐 Características de la Versión Desktop

✅ **Funciona completamente offline** - No requiere internet  
✅ **Base de datos local** - Datos guardados en tu computadora  
✅ **Más rápida** - No depende del navegador  
✅ **Ventana nativa** - Experiencia de aplicación real  
✅ **Acceso directo** - En escritorio y menú inicio  
✅ **Actualizaciones** - Puedes actualizar generando nuevo ejecutable  

## 🆚 Comparación Web vs Desktop

| Característica | Versión Web | Versión Desktop |
|----------------|-------------|-----------------|
| Requiere internet | ❌ No | ❌ No |
| Instalación | No requiere | Sí (opcional) |
| Velocidad | Buena | Excelente |
| Datos | navegador | Archivo local |
| Acceso directo | No | Sí |
| Actualizaciones | Automáticas | Manual |

## 📞 Soporte

Si encuentras problemas:
1. Verifica que Node.js esté instalado: `node --version`
2. Actualiza las dependencias: `npm install`
3. Limpia la caché: `npm cache clean --force`
4. Elimina `node_modules` y reinstala: `rm -rf node_modules && npm install`

## 🔄 Actualizar la Aplicación

Para crear una nueva versión:
1. Haz tus cambios en el código
2. Incrementa la versión en `package.json`
3. Ejecuta `npm run electron:build:win`
4. Comparte el nuevo ejecutable

---

**¡Listo!** Ahora puedes distribuir tu aplicación de inventario como un programa de Windows profesional. 🎉
