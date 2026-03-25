# 📦 Guía para Crear Ejecutable de Windows - Josimar Cell

Esta guía te ayudará a generar un ejecutable (.exe) de la aplicación Josimar Cell para Windows.

1. **Abre PowerShell o CMD** en l

   ```

   npm run electron:build:win


   ```batch
   ```
2. **Genera el ejecutable:**
   npm run electron:build:wi

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


- Archivo: `*-Portable.exe`
- No requiere instalación
- Se puede ejecutar desde USB o cualquier carpeta
- Perfecto para llevar en dispositivos portátiles



### Para Generar el Ejecutable (Desarrollo)
- Windows 7 o superior
- Node.js 16 o superior ([Descargar aquí](https://nodejs.org/))
- 2 GB de espacio libre en disco
- Conexión a internet (para la primera instalación)

### Para Ejecutar la Aplicación (Usuario Final)
- Windows 7 o superior
```
- No requiere Node.js ni navegador

## 🛠️ Comandos Disponibles

```batch
# Ejecutar en modo desarrollo (navegador web)
npm run dev

# Ejecutar como aplicación de escritorio (desarrollo)
      "arch": ["x64"

# Construir versión web
npm run build

# Generar ejecutable para Windows (32 y 64 bits)
npm run electron:build:win

# Generar ejecutable para cualquier plataforma
npm run electron:build
Par



✅ **Base de datos local** - Datos gua

1. Reemplaza el archivo `icon.png` con tu propio icono (512x512 píxeles)
2. Vuelve a generar el ejecutable

### Cambiar el Nombre del Ejecutable

Edita `package.json`:

"build": {
  "productName": "Tu Nombre de Aplicación",
  "portable": {
    "artifactName": "TuNombre-Portable-${version}.exe"
  }
1
```

## 📊 Datos y Base de Datos

### Ubicación de los Datos (Versión Instalada)
- Windows: `C:\Users\<TuUsuario>\AppData\Roaming\josimar-cell-inventory\`
- Archivo: `josimar-cell-db.json`

### Respaldo de Datos
Los datos se guardan automáticamente en formato JSON. Puedes:
1. Copiar el archivo `josimar-cell-db.json` para hacer respaldo






npm install --save-dev electron-builder


### Error: "Cannot find module 'electron'"
```batch
npm install --save-dev electron


### Error al compilar: "ENOENT: no such file or directory"
Asegúrate de ejecutar primero:
```batch
npm run build
```

### El ejecutable no inicia
1. Verifica que no haya antivirus bloqueándolo










































































