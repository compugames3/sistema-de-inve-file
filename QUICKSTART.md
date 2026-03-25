# 🚀 Guía Rápida de Despliegue

Esta es una guía simplificada para poner en funcionamiento Josimar Cell en producción.

## 📌 Opciones de Despliegue

Tienes **3 opciones principales**:

### Opción 1: Despliegue Web (Más Fácil) ⭐ RECOMENDADO

**Para publicar en un dominio web:**

#### Windows:
```cmd
build-production.bat
```

#### Mac/Linux:
```bash
chmod +x build-production.sh
./build-production.sh
```

Esto generará una carpeta `dist/` con tu aplicación lista para subir a:
- Netlify (gratis, automático)
- Vercel (gratis, automático)
- Tu propio servidor (Apache/Nginx)

📖 **Instrucciones detalladas:** Ver [DEPLOYMENT.md](DEPLOYMENT.md)

---

### Opción 2: Aplicación de Escritorio Windows 💻

**Para crear un ejecutable .exe:**

#### Método Simple (Windows):
```cmd
generar-ejecutable.bat
```

El ejecutable estará en la carpeta `release/`

#### Método Manual:
```cmd
npm install
npm run build
npm run electron:build:win
```

📖 **Más información:** Ver [DEPLOYMENT.md](DEPLOYMENT.md) sección "Aplicación de Escritorio Windows"

---

### Opción 3: Desarrollo Local 🔧

**Para probar localmente:**

```bash
npm install
npm run dev
```

Abre tu navegador en: http://localhost:5173

---

## 🌐 Navegadores Soportados

La aplicación funciona en:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+
- ✅ Brave (cualquier versión reciente)

---

## 💾 Requisitos del Sistema

### Para Desarrollo:
- Node.js 18 o superior
- npm 8 o superior
- 500 MB de espacio en disco

### Para Producción Web:
- Servidor web (Apache/Nginx) o hosting (Netlify/Vercel)
- Dominio (opcional)

### Para Ejecutable Windows:
- Windows 7 o superior (recomendado Windows 10/11)
- 2 GB RAM mínimo

---

## 📁 Estructura de Archivos Importantes

```
josimar-cell-inventory/
├── dist/                      # Build de producción (generado)
├── release/                   # Ejecutables (generado)
├── src/                       # Código fuente
├── public/                    # Archivos estáticos
├── DEPLOYMENT.md              # Guía completa de despliegue
├── build-production.bat       # Script de build (Windows)
├── build-production.sh        # Script de build (Mac/Linux)
├── generar-ejecutable.bat     # Script ejecutable (Windows)
└── package.json              # Dependencias del proyecto
```

---

## ❓ Preguntas Frecuentes

### ¿Cómo subo mi aplicación a un dominio?

1. Ejecuta `build-production.bat` (Windows) o `build-production.sh` (Mac/Linux)
2. Sube la carpeta `dist/` completa a tu servidor
3. Configura tu servidor web (ver DEPLOYMENT.md)

### ¿Cómo creo un ejecutable para Windows?

1. Ejecuta `generar-ejecutable.bat`
2. Encuentra el .exe en `release/`
3. Distribuye el instalador

### ¿Los datos se pierden al recargar?

No, la aplicación usa almacenamiento local (IndexedDB) que persiste entre sesiones.

### ¿Funciona offline?

- **Web:** No (requiere servidor)
- **Ejecutable:** Sí (funciona completamente offline)

### ¿Puedo usarlo en mi teléfono?

Sí, la aplicación es responsive y funciona en navegadores móviles modernos.

---

## 🆘 Solución Rápida de Problemas

### "npm no se reconoce como comando"
→ Instala Node.js desde https://nodejs.org/

### "Error al construir"
→ Ejecuta: `npm install` primero

### "Página en blanco después del despliegue"
→ Verifica que subiste toda la carpeta `dist/` incluyendo subcarpetas

### "El ejecutable no abre"
→ Ejecuta como administrador o desactiva temporalmente el antivirus

---

## 📞 Más Información

- **Guía Completa:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Documentación Técnica:** [PRD.md](PRD.md)
- **Requisitos del Proyecto:** [README.md](README.md)

---

**Versión:** 1.0.0  
**Última actualización:** 2024
