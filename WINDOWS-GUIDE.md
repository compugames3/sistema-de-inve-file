# 🪟 Guía Rápida para Windows

## 🚀 Opción 1: Crear Ejecutable (EXE) para Windows

### Pasos Simples:

1. **Abre PowerShell o CMD** en la carpeta del proyecto
   - Haz clic derecho en la carpeta → "Abrir en Terminal"
   - O usa `cd` para navegar a la carpeta

2. **Ejecuta el script de generación:**
   ```cmd
   generar-ejecutable.bat
   ```

3. **Espera a que termine** (puede tomar 5-10 minutos)

4. **Encuentra tu ejecutable** en la carpeta `release\`:
   - `Josimar Cell - Sistema de Inventario Setup X.X.X.exe` (Instalador)
   - `JosimarCell-Portable-X.X.X.exe` (Versión portable)

### ¿Qué hacer con el ejecutable?

**Instalador (.exe):**
- Haz doble clic para instalar
- Elige la ubicación de instalación
- Se creará un acceso directo en el escritorio
- Usa el desinstalador de Windows para desinstalar

**Portable (.exe):**
- Copia el archivo a cualquier carpeta o USB
- Haz doble clic para ejecutar
- No requiere instalación
- Ideal para usar sin permisos de administrador

---

## 🌐 Opción 2: Crear Build para Subir a un Dominio

### Pasos Simples:

1. **Ejecuta el script de build:**
   ```cmd
   build-production.bat
   ```

2. **Espera a que termine** (1-2 minutos)

3. **Sube la carpeta `dist\`** completa a tu servidor web:
   - Por FTP (FileZilla, WinSCP)
   - Por panel de hosting (cPanel, Plesk)
   - Por Netlify/Vercel (arrastra y suelta)

### ¿Dónde subir los archivos?

#### Opción A: Netlify (Gratis, Fácil) ⭐ RECOMENDADO

1. Ve a https://netlify.com
2. Regístrate gratis
3. Arrastra la carpeta `dist\` a Netlify
4. ¡Listo! Te dan una URL automática
5. Opcional: Conecta tu propio dominio

#### Opción B: Hosting Tradicional (cPanel, GoDaddy, etc.)

1. Accede a tu panel de hosting
2. Ve al administrador de archivos
3. Sube todo el contenido de `dist\` a la carpeta `public_html` o `www`
4. Accede a tu dominio

#### Opción C: GitHub Pages (Gratis)

1. Sube tu código a GitHub
2. Ejecuta:
   ```cmd
   npm install --save-dev gh-pages
   npm run deploy
   ```
3. Activa GitHub Pages en la configuración del repositorio

---

## 📋 Requisitos Previos

Antes de ejecutar los scripts, necesitas:

### 1. Node.js

**¿Cómo verifico si tengo Node.js?**
```cmd
node --version
```

**Si no está instalado:**
1. Descarga desde: https://nodejs.org/
2. Instala la versión LTS (recomendada)
3. Reinicia el CMD/PowerShell

### 2. Dependencias del Proyecto

**Primera vez:**
```cmd
npm install
```

Esto instala todo lo necesario. Solo hazlo una vez.

---

## ❓ Solución de Problemas Comunes

### "npm no se reconoce como comando"

**Solución:**
- Instala Node.js desde https://nodejs.org/
- Reinicia CMD/PowerShell después de instalar
- Cierra y abre Visual Studio Code (si lo estás usando)

### "Error al ejecutar el script"

**Solución:**
1. Asegúrate de estar en la carpeta correcta:
   ```cmd
   cd ruta\a\josimar-cell-inventory
   ```

2. Ejecuta primero:
   ```cmd
   npm install
   ```

3. Intenta de nuevo

### "Electron no está instalado"

**Solución:**
```cmd
npm install --save-dev electron electron-builder concurrently wait-on
```

### "El antivirus bloquea el ejecutable"

**Solución:**
- Es normal, el ejecutable es nuevo y no está firmado digitalmente
- Agrega una excepción en tu antivirus
- O usa "Ejecutar de todas formas"

### "Error de permisos en PowerShell"

**Solución:**
1. Abre PowerShell como Administrador
2. Ejecuta:
   ```powershell
   Set-ExecutionPolicy RemoteSigned
   ```
3. Confirma con "S" (Sí)
4. Intenta ejecutar el script nuevamente

### "El build tarda mucho"

**Es normal:**
- Build web: 1-3 minutos
- Ejecutable: 5-15 minutos (primera vez puede tardar más)
- Ten paciencia y no cierres la ventana

---

## 🎯 Comandos Útiles

### Ver la aplicación en desarrollo (localhost):
```cmd
npm run dev
```
Abre http://localhost:5173 en tu navegador

### Crear build de producción (web):
```cmd
npm run build
```

### Crear ejecutable Windows:
```cmd
npm run electron:build:win
```

### Limpiar y reinstalar dependencias:
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Ver qué está instalado:
```cmd
npm list --depth=0
```

---

## 📁 Estructura de Carpetas Importantes

```
josimar-cell-inventory/
│
├── dist/                          # Build web (se genera)
│   ├── index.html
│   └── assets/
│
├── release/                       # Ejecutables (se genera)
│   ├── Josimar Cell Setup.exe     # Instalador
│   └── JosimarCell-Portable.exe   # Portable
│
├── src/                           # Código fuente
├── public/                        # Archivos estáticos
│
├── build-production.bat           # Script build web
├── generar-ejecutable.bat         # Script ejecutable
│
├── DEPLOYMENT.md                  # Guía completa
├── QUICKSTART.md                  # Guía rápida general
└── WINDOWS-GUIDE.md               # Esta guía
```

---

## 🎓 Tutorial Paso a Paso (Primera Vez)

### Para Crear un Ejecutable:

1. **Descarga/clona el proyecto** a tu PC

2. **Abre CMD en la carpeta del proyecto:**
   - Shift + Clic derecho en la carpeta
   - "Abrir PowerShell aquí" o "Abrir ventana de comandos aquí"

3. **Instala dependencias** (solo primera vez):
   ```cmd
   npm install
   ```
   Espera 2-5 minutos

4. **Genera el ejecutable:**
   ```cmd
   generar-ejecutable.bat
   ```
   Espera 5-15 minutos

5. **Encuentra tu .exe** en `release\`

6. **¡Listo!** Distribuye el ejecutable

### Para Subir a un Dominio:

1. **Ejecuta el build:**
   ```cmd
   build-production.bat
   ```

2. **Sube `dist\` a tu hosting** (Netlify, cPanel, etc.)

3. **Configura tu dominio** (DNS, SSL)

4. **¡Listo!** Accede desde tu navegador

---

## 💡 Tips y Recomendaciones

### Para el Ejecutable:
- ✅ La versión portable es más fácil de distribuir
- ✅ Funciona sin internet (offline)
- ✅ Los datos se guardan localmente
- ⚠️ El antivirus puede dar falsos positivos
- ⚠️ El archivo es grande (100-200 MB)

### Para el Deploy Web:
- ✅ Usa Netlify o Vercel para deploy automático
- ✅ Siempre usa HTTPS (SSL) en producción
- ✅ Haz backup de la carpeta `dist\` antes de sobrescribir
- ⚠️ Los datos se guardan en el navegador (IndexedDB)
- ⚠️ Limpar caché del navegador borra los datos

---

## 📞 ¿Necesitas Más Ayuda?

- 📖 **Guía completa:** [DEPLOYMENT.md](DEPLOYMENT.md)
- 📖 **Guía rápida general:** [QUICKSTART.md](QUICKSTART.md)
- 📖 **Checklist de producción:** [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md)
- 📖 **Documentación técnica:** [PRD.md](PRD.md)

---

**¡Éxito con tu despliegue!** 🚀
