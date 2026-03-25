# Josimar Cell - Sistema de Inventario Profesional

Sistema de gestión de inventario profesional con base de datos automática, autenticación de usuarios y seguimiento completo de productos.

## 🎯 ¿Quieres el Ejecutable para Windows?

**👉 Lee primero:** [LEEME_EJECUTABLE.md](./LEEME_EJECUTABLE.md) o [CHECKLIST_EJECUTABLE.txt](./CHECKLIST_EJECUTABLE.txt)

**Inicio rápido:**
1. Ejecuta: `setup-desktop.bat`
2. Convierte el icono (ver [ICON_GUIDE.md](./ICON_GUIDE.md))
3. Ejecuta: `generar-ejecutable.bat`
4. Busca el `.exe` en la carpeta `release/`

## 🌐 Compatibilidad de Navegadores

Esta aplicación es compatible con **TODOS** los navegadores modernos:

- ✅ **Chrome / Edge** 90+
- ✅ **Firefox** 88+
- ✅ **Safari** 14+
- ✅ **Opera** 76+
- ✅ **Brave** (todas las versiones recientes)
- ✅ **Samsung Internet** 13+
- ✅ **Navegadores móviles** (iOS Safari, Chrome Mobile, Firefox Mobile)

## 💻 Versión de Escritorio (Ejecutable)

Esta aplicación puede convertirse en un **programa ejecutable de escritorio** para Windows, macOS y Linux.

### 🚀 Instalación Rápida para Windows

**Opción 1 - Script Automático (Recomendado):**
```batch
# Ejecuta este comando en CMD o PowerShell
setup-desktop.bat
```

**Opción 2 - Manual:**
```bash
# 1. Instalar dependencias de desarrollo
npm install --save-dev electron electron-builder concurrently wait-on

# 2. Generar ejecutable para Windows
npm run electron:build:win
```

### 📦 Generar el Ejecutable

**Forma más fácil:**
```batch
generar-ejecutable.bat
```

**Forma manual:**
```bash
# Windows (genera instalador .exe y versión portable)
npm run electron:build:win

# macOS (genera .dmg y .zip)
npm run electron:build:mac

# Linux (genera AppImage y .deb)
npm run electron:build:linux
```

Los ejecutables se generarán en la carpeta `release/`.

### 📂 Archivos Generados

Después de ejecutar el build, encontrarás en `release/`:

1. **Instalador NSIS** - `Josimar Cell - Sistema de Inventario Setup X.X.X.exe`
   - Instalador completo con asistente
   - Crea accesos directos automáticamente
   - Se puede desinstalar desde Panel de Control

2. **Versión Portable** - `JosimarCell-Portable-X.X.X.exe`
   - No requiere instalación
   - Ejecuta directamente desde cualquier carpeta
   - Perfecto para USB o dispositivos portátiles

### 📖 Documentación Completa

Lee **[COMO_GENERAR_EJECUTABLE.md](./COMO_GENERAR_EJECUTABLE.md)** para:
- Guía paso a paso detallada
- Solución de problemas
- Personalización de iconos y nombres
- Distribución del ejecutable

### Características de la Versión Desktop

- 🗄️ **Base de datos local** - Datos guardados en el disco duro automáticamente
- 🔒 **Sin internet necesario** - Funciona completamente offline
- ⚡ **Rendimiento superior** - Más rápido que la versión web
- 🖥️ **Instalación nativa** - Icono en escritorio y menú inicio
- 💾 **Backup automático** - Respaldo diario de la base de datos

**Ubicación de la base de datos:**
- Windows: `C:\Users\<Usuario>\AppData\Roaming\josimar-cell-inventory\`
- macOS: `~/Library/Application Support/josimar-cell-inventory/`
- Linux: `~/.config/josimar-cell-inventory/`

## 🚀 Ejecución Web (Navegador)

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de la versión de producción
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

## 📋 Características Principales

### 🔐 Sistema de Usuarios
- Autenticación con usuario y contraseña
- Roles: Administrador y Visitante
- Permisos granulares por producto
- Gestión completa de usuarios

### 📦 Gestión de Inventario
- Agregar, editar y eliminar productos
- Búsqueda y filtrado avanzado
- Alertas de stock bajo (≤10 unidades)
- Alertas críticas (≤3 unidades)
- Organización por categorías y proveedores
- Exportación a CSV

### 📊 Órdenes y Transacciones
- Registro de ventas
- Registro de compras
- Historial completo de transacciones
- Actualización automática de inventario
- Eliminación con confirmación

### 📅 Cierre del Día
- Reportes diarios automáticos
- Análisis financiero (ingresos, costos, ganancias)
- Top productos del día
- Historial de cierres
- Exportación a PDF

### 🔍 Auditoría
- Registro completo de cambios
- Seguimiento por usuario
- Historial de modificaciones
- Trazabilidad total

### 💾 Base de Datos
- Guardado automático en el navegador (Web)
- Guardado en disco (Desktop)
- Backup automático diario
- Exportación e importación manual
- Verificación de integridad

## 🎨 Características Técnicas

### Tecnologías
- **React 19** - Framework de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos modernos
- **Shadcn UI** - Componentes profesionales
- **Phosphor Icons** - Iconografía
- **Spark KV** - Persistencia de datos
- **Sonner** - Notificaciones
- **Recharts** - Gráficos (preparado para futuras estadísticas)
- **jsPDF** - Generación de PDFs

### Diseño
- 🎨 Interfaz profesional y moderna
- 📱 Completamente responsive
- 🌈 Paleta de colores corporativa
- ⚡ Animaciones suaves
- ♿ Accesible (WCAG AA)

## 👥 Usuarios por Defecto

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

> ⚠️ **Importante:** Cambia la contraseña del administrador después del primer inicio de sesión.

## 📖 Guía de Uso

### Primer Inicio
1. Inicia sesión con el usuario administrador
2. Ve a la pestaña "Usuarios" y crea usuarios adicionales
3. Configura permisos granulares si es necesario
4. Comienza a agregar productos al inventario

### Agregar Productos
1. Click en "Agregar Producto" (solo admin)
2. Completa el formulario con SKU, nombre, cantidad, precio, etc.
3. Guarda - el producto se agrega automáticamente

### Registrar Ventas/Compras
1. Ve a la pestaña "Órdenes"
2. Click en "Nueva Venta" o "Nueva Compra"
3. Agrega productos y cantidades
4. Confirma - el inventario se actualiza automáticamente

### Generar Cierre del Día
1. Ve a la pestaña "Cierre del Día"
2. Click en "Generar Reporte de Cierre"
3. Revisa el resumen financiero y estadísticas
4. Exporta a PDF si es necesario

### Backup de Datos
- **Automático:** Se realiza diariamente de forma automática
- **Manual:** Click en "Guardar BD" para exportar la base de datos
- **Restaurar:** Click en "Cargar BD" para importar un backup

## 🔧 Solución de Problemas

### La aplicación no carga en el navegador
- Verifica que estés usando un navegador compatible (Chrome 90+, Firefox 88+, Safari 14+)
- Limpia la caché del navegador
- Prueba en modo incógnito

### Los datos no se guardan
- Verifica que el navegador permita almacenamiento local
- No uses modo incógnito/privado
- Revisa que no tengas extensiones que bloqueen almacenamiento

### Error al generar ejecutable desktop
```bash
# Limpia caché y reinstala
npm cache clean --force
rm -rf node_modules
npm install
npm run build
npm run electron:build
```

### El ejecutable no inicia en Windows
- Desactiva temporalmente el antivirus
- Ejecuta como administrador
- Reinstala la aplicación

## 📄 Licencia

Este proyecto está diseñado para uso de Josimar Cell.

## 🆘 Soporte

Para preguntas o problemas:
1. Revisa esta documentación
2. Consulta el archivo `ELECTRON_SETUP.md` para detalles de desktop
3. Contacta al administrador del sistema

---

**Versión:** 2.0.0  
**Última actualización:** 2024  
**Estado:** ✅ Producción - Compatible con todos los navegadores y preparado para ejecutable desktop
