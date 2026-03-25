# 📦 Josimar Cell - Sistema de Inventario

Sistema profesional de gestión de inventario completamente optimizado para **producción web** y **compatible con Windows** como aplicación de escritorio.

## ✨ Características Principales

- 🔐 **Sistema de autenticación** multi-usuario con roles (Admin/Visitante)
- 📦 **Gestión completa de inventario** (CRUD de productos)
- 🔒 **Permisos granulares** por producto y usuario
- 📊 **Panel de estadísticas** en tiempo real
- 🛒 **Gestión de órdenes** (ventas y compras)
- 📑 **Cierre diario** con reportes automáticos
- 🔍 **Búsqueda y filtros** avanzados
- 📱 **Diseño responsive** para móviles y tablets
- 💾 **Persistencia de datos** local (IndexedDB)
- 📈 **Auditoría completa** de cambios
- 🌐 **Compatible con todos los navegadores modernos**
- 💻 **Ejecutable para Windows** (offline)

## 🚀 Inicio Rápido

### Opción 1: Web (Desarrollo Local)

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en navegador
# http://localhost:5173
```

### Opción 2: Build para Producción Web

**Windows:**
```cmd
build-production.bat
```

**Mac/Linux:**
```bash
chmod +x build-production.sh
./build-production.sh
```

Los archivos optimizados estarán en la carpeta `dist/`

### Opción 3: Ejecutable Windows

```cmd
generar-ejecutable.bat
```

El ejecutable estará en la carpeta `release/`

## 📋 Requisitos

### Para Desarrollo:
- Node.js 18+ 
- npm 8+
- 500 MB de espacio en disco

### Para Producción Web:
- Servidor web (Apache/Nginx) o hosting (Netlify/Vercel)
- Navegadores modernos: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Para Ejecutable Windows:
- Windows 7+ (recomendado Windows 10/11)
- 2 GB RAM mínimo
- Arquitectura x64 o x86

## 📚 Documentación

### Guías de Usuario:
- 📖 **[QUICKSTART.md](QUICKSTART.md)** - Guía rápida de inicio (5 minutos)
- 🪟 **[WINDOWS-GUIDE.md](WINDOWS-GUIDE.md)** - Guía específica para Windows
- 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía completa de despliegue (todas las opciones)

### Documentación Técnica:
- 📋 **[PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md)** - Checklist pre-deployment
- 📘 **[PRD.md](PRD.md)** - Documento de requerimientos del producto
- 📄 **[README_ES.md](README_ES.md)** - README original en español

### Archivos de Configuración:
- ⚙️ **[.env.example](.env.example)** - Variables de entorno
- 🔧 **[vite.config.ts](vite.config.ts)** - Configuración de Vite optimizada
- 🌐 **[nginx.conf](nginx.conf)** - Configuración Nginx
- 🔌 **[public/.htaccess](public/.htaccess)** - Configuración Apache

## 🌐 Opciones de Despliegue Web

### Netlify (Recomendado - Más Fácil)
1. Ejecuta `build-production.bat`
2. Arrastra la carpeta `dist/` a Netlify
3. ¡Listo!

### Vercel
```bash
npm install -g vercel
vercel
```

### Servidor VPS (Apache/Nginx)
1. Ejecuta `build-production.bat`
2. Sube `dist/` a `/var/www/html/`
3. Configura servidor con archivos incluidos

### GitHub Pages
```bash
npm install --save-dev gh-pages
npm run deploy
```

## 💻 Opciones de Aplicación de Escritorio

### Windows (Instalador NSIS)
```cmd
npm run electron:build:win
```
Genera instalador en `release/Josimar Cell - Sistema de Inventario Setup.exe`

### Windows (Portable)
Genera ejecutable portable en `release/JosimarCell-Portable.exe`

## 🛠️ Scripts Disponibles

```bash
npm run dev              # Desarrollo local (puerto 5173)
npm run build            # Build de producción
npm run preview          # Preview del build
npm run lint             # Linter
npm run electron:dev     # Desarrollo Electron
npm run electron:build:win   # Build ejecutable Windows
```

## 📱 Navegadores Soportados

| Navegador | Versión Mínima | Estado |
|-----------|----------------|--------|
| Chrome    | 90+            | ✅ Soportado |
| Firefox   | 88+            | ✅ Soportado |
| Safari    | 14+            | ✅ Soportado |
| Edge      | 90+            | ✅ Soportado |
| Opera     | 76+            | ✅ Soportado |
| Brave     | Cualquiera     | ✅ Soportado |
| Samsung Internet | 13+   | ✅ Soportado |

## 🔧 Tecnologías Utilizadas

- **Frontend:** React 19, TypeScript
- **UI:** Tailwind CSS 4, Shadcn UI v4
- **Iconos:** Phosphor Icons
- **Build:** Vite 7
- **Desktop:** Electron + Electron Builder
- **Persistencia:** IndexedDB (via Spark KV)
- **Forms:** React Hook Form + Zod
- **Notifications:** Sonner

## 📁 Estructura del Proyecto

```
josimar-cell-inventory/
├── dist/                      # Build de producción (generado)
├── release/                   # Ejecutables Windows (generado)
├── src/
│   ├── components/           # Componentes React
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilidades y tipos
│   └── styles/               # Estilos CSS
├── public/
│   ├── .htaccess            # Config Apache
│   ├── compatibility-check.html
│   └── manifest.json        # PWA manifest
├── build-production.bat     # Script build Windows
├── build-production.sh      # Script build Unix
├── generar-ejecutable.bat   # Script ejecutable Windows
├── nginx.conf               # Config Nginx
├── DEPLOYMENT.md            # Guía de despliegue
├── QUICKSTART.md            # Inicio rápido
├── WINDOWS-GUIDE.md         # Guía Windows
└── package.json             # Dependencias
```

## 🔐 Credenciales por Defecto

**Usuario Admin:**
- Usuario: `admin`
- Contraseña: `admin123`

⚠️ **IMPORTANTE:** Cambia las credenciales después del primer login en producción.

## ✅ Características de Producción

- ✅ **Code splitting** automático
- ✅ **Minificación** de JS/CSS
- ✅ **Tree shaking** para reducir tamaño
- ✅ **Compresión gzip** configurada
- ✅ **Caché** de assets estáticos
- ✅ **SEO optimizado** con meta tags
- ✅ **PWA ready** con manifest
- ✅ **SSL/HTTPS ready**
- ✅ **Cross-browser compatible**
- ✅ **Responsive design**
- ✅ **Offline support** (versión desktop)

## 🔄 Actualizaciones

### Web:
```bash
npm run build
# Sube la nueva carpeta dist/
```

### Desktop:
```bash
npm run electron:build:win
# Distribuye el nuevo .exe
```

## 🆘 Soporte

### Problemas Comunes:

**"npm no se reconoce"**
→ Instala Node.js desde https://nodejs.org/

**"Página en blanco"**
→ Verifica que subiste toda la carpeta `dist/` incluyendo `assets/`

**"Ejecutable no abre"**
→ Ejecuta como administrador o desactiva antivirus temporalmente

### Documentación Adicional:
- Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para problemas de despliegue
- Consulta [WINDOWS-GUIDE.md](WINDOWS-GUIDE.md) para problemas en Windows
- Revisa [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md) antes de desplegar

## 📄 Licencia

Ver archivo [LICENSE](LICENSE)

## 🤝 Contribuciones

Este es un proyecto privado para Josimar Cell.

---

## 🎯 Próximos Pasos

1. **Para desarrollo:** `npm install && npm run dev`
2. **Para web:** Ver [QUICKSTART.md](QUICKSTART.md)
3. **Para Windows:** Ver [WINDOWS-GUIDE.md](WINDOWS-GUIDE.md)
4. **Para producción:** Ver [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Versión:** 1.0.0  
**Estado:** ✅ Listo para Producción  
**Plataformas:** Web (todos los navegadores) + Windows Desktop  
**Última actualización:** 2024
