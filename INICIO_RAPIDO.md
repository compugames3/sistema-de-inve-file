# 🚀 GUÍA RÁPIDA - Josimar Cell

## ¿Qué es esto?

**Josimar Cell** es un sistema profesional de gestión de inventario que funciona:
- ✅ En **cualquier navegador moderno** (Chrome, Firefox, Safari, Edge, etc.)
- ✅ Como **aplicación de escritorio** para Windows, macOS y Linux

## 🌐 Opción 1: Usar en Navegador (MÁS FÁCIL)

### Paso 1: Iniciar la aplicación
```bash
npm install
npm run dev
```

### Paso 2: Abrir navegador
Visita: `http://localhost:5173`

### Usuario por defecto
- **Usuario:** admin
- **Contraseña:** admin123

¡Eso es todo! Ya puedes usar la aplicación.

---

## 💻 Opción 2: Aplicación de Escritorio (EJECUTABLE)

### ¿Por qué usar la versión desktop?
- 📴 Funciona **sin internet**
- 💾 Base de datos **guardada en tu computadora**
- ⚡ **Más rápida** que la web
- 🖥️ Se instala como **programa normal**
- 🔒 **Más segura** (datos locales)

### Instalación Automática

#### Windows:
```cmd
setup-desktop.bat
```

#### Mac/Linux:
```bash
chmod +x setup-desktop.sh
./setup-desktop.sh
```

### Instalación Manual:
```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

### Generar Ejecutable:

**Para tu sistema actual:**
```bash
npm run build
npm run electron:build
```

**Para Windows:**
```bash
npm run electron:build:win
```

**Para macOS:**
```bash
npm run electron:build:mac
```

**Para Linux:**
```bash
npm run electron:build:linux
```

Los ejecutables estarán en la carpeta: `release/`

---

## 📋 Compatibilidad de Navegadores

### ✅ Funciona en:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+
- Brave (todas las versiones recientes)
- Samsung Internet 13+

### ❌ NO funciona en:
- Internet Explorer
- Navegadores muy antiguos

Si tu navegador no es compatible, verás un mensaje automático.

---

## 📚 Documentación Completa

- **README_ES.md** - Guía completa en español
- **ELECTRON_SETUP.md** - Detalles sobre aplicación desktop
- **BROWSER_COMPATIBILITY.md** - Lista completa de navegadores
- **PACKAGE_JSON_SCRIPTS.md** - Scripts para package.json
- **ICON_GUIDE.md** - Cómo personalizar el icono
- **PRD.md** - Especificaciones técnicas del proyecto

---

## 🎯 Características Principales

### 👥 Sistema de Usuarios
- Login con usuario y contraseña
- Roles: Administrador y Visitante
- Permisos por producto
- Gestión de usuarios

### 📦 Inventario
- Agregar/editar/eliminar productos
- Búsqueda y filtros
- Alertas de stock bajo
- Exportar a CSV

### 🛒 Ventas y Compras
- Registrar ventas
- Registrar compras
- Historial completo
- Actualización automática de stock

### 📊 Reportes
- Cierre diario
- Análisis financiero
- Top productos
- Exportar a PDF

### 💾 Base de Datos
- Guardado automático
- Backup diario
- Exportar/importar
- Auditoría completa

---

## 🆘 Solución de Problemas

### La app no inicia
```bash
npm cache clean --force
rm -rf node_modules
npm install
npm run dev
```

### Error al generar ejecutable
```bash
npm run build
npm run electron:build
```

### Navegador no compatible
- Actualiza tu navegador a la última versión
- Prueba con Chrome, Firefox o Edge
- O descarga la versión desktop

### Los datos no se guardan
- No uses modo incógnito
- Verifica permisos del navegador
- Usa la versión desktop para mayor persistencia

---

## 📞 Estructura de Archivos

```
josimar-cell/
├── src/                          # Código fuente
│   ├── components/              # Componentes React
│   ├── lib/                     # Utilidades
│   ├── App.tsx                  # Componente principal
│   └── index.css                # Estilos
├── public/                       # Archivos públicos
├── electron.js                   # App desktop (proceso principal)
├── preload.js                    # App desktop (preload)
├── icon.svg                      # Icono de la aplicación
├── setup-desktop.sh/.bat         # Scripts de instalación
├── README_ES.md                  # Esta guía en español
├── ELECTRON_SETUP.md             # Guía desktop detallada
├── BROWSER_COMPATIBILITY.md      # Compatibilidad navegadores
└── package.json                  # Dependencias
```

---

## ⚙️ Configuración Avanzada

### Variables de Entorno
No se necesitan variables de entorno. Todo funciona "out of the box".

### Base de Datos
- **Web:** IndexedDB/LocalStorage (automático)
- **Desktop:** Archivo JSON en disco (automático)

Ubicación desktop:
- Windows: `C:\Users\<Usuario>\AppData\Roaming\josimar-cell-inventory\`
- macOS: `~/Library/Application Support/josimar-cell-inventory/`
- Linux: `~/.config/josimar-cell-inventory/`

### Puerto del servidor
Por defecto: `5173`

Para cambiar:
```bash
npm run dev -- --port 3000
```

---

## 🎨 Personalización

### Cambiar colores
Edita: `src/index.css` (variables CSS en `:root`)

### Cambiar logo
Reemplaza: `src/components/JosimarLogo.tsx`

### Cambiar icono desktop
Sigue instrucciones en: `ICON_GUIDE.md`

---

## 📈 Próximos Pasos

1. ✅ Ejecuta la aplicación (web o desktop)
2. ✅ Cambia la contraseña del admin
3. ✅ Crea usuarios adicionales
4. ✅ Agrega productos al inventario
5. ✅ Registra tu primera venta
6. ✅ Genera tu primer cierre del día
7. ✅ Exporta backup de la base de datos

---

## ✨ ¿Necesitas Ayuda?

1. Lee **README_ES.md** para guía completa
2. Consulta **ELECTRON_SETUP.md** para versión desktop
3. Revisa **BROWSER_COMPATIBILITY.md** para navegadores

---

**Versión:** 2.0.0  
**Última actualización:** 2024  
**Compatible:** ✅ Todos los navegadores modernos + Desktop (Windows/Mac/Linux)
