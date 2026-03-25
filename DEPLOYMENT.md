# 🚀 Guía de Despliegue - Josimar Cell Sistema de Inventario

Esta guía explica cómo desplegar la aplicación en un servidor web y cómo generar ejecutables de escritorio para Windows.

## 📋 Tabla de Contenidos

1. [Despliegue Web (Producción)](#despliegue-web-producción)
2. [Aplicación de Escritorio Windows](#aplicación-de-escritorio-windows)
3. [Requisitos del Sistema](#requisitos-del-sistema)
4. [Verificación Post-Despliegue](#verificación-post-despliegue)

---

## 🌐 Despliegue Web (Producción)

### Preparación del Build

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Construir para producción:**
   ```bash
   npm run build
   ```

   Esto generará una carpeta `dist/` con todos los archivos optimizados y minificados.

### Opciones de Hosting

#### Opción 1: Netlify (Recomendado - Más Fácil)

1. Crea una cuenta en [Netlify](https://netlify.com)
2. Conecta tu repositorio Git o arrastra la carpeta `dist/`
3. Configuración:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base path:** `/` (raíz del dominio)

4. Netlify genera automáticamente:
   - HTTPS gratuito
   - Dominio personalizado
   - CDN global
   - Deploy automático en cada push

#### Opción 2: Vercel

1. Instala Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Despliega:
   ```bash
   vercel
   ```

3. Sigue las instrucciones en pantalla

#### Opción 3: GitHub Pages

1. Instala gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Agrega a `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. Despliega:
   ```bash
   npm run deploy
   ```

#### Opción 4: Servidor VPS (Apache/Nginx)

##### Para Apache:

1. Sube la carpeta `dist/` a tu servidor (ej: `/var/www/html/josimar-cell`)

2. Crea un archivo `.htaccess` en la carpeta `dist/`:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

3. Configura el VirtualHost:
   ```apache
   <VirtualHost *:80>
       ServerName tudominio.com
       DocumentRoot /var/www/html/josimar-cell
       
       <Directory /var/www/html/josimar-cell>
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       ErrorLog ${APACHE_LOG_DIR}/josimar-error.log
       CustomLog ${APACHE_LOG_DIR}/josimar-access.log combined
   </VirtualHost>
   ```

##### Para Nginx:

1. Sube la carpeta `dist/` a tu servidor (ej: `/var/www/josimar-cell`)

2. Configura Nginx:
   ```nginx
   server {
       listen 80;
       server_name tudominio.com;
       root /var/www/josimar-cell;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Caché para assets estáticos
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Compresión gzip
       gzip on;
       gzip_vary on;
       gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
   }
   ```

3. Reinicia Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

#### Opción 5: Cloudflare Pages

1. Sube tu repositorio a GitHub
2. Ve a [Cloudflare Pages](https://pages.cloudflare.com)
3. Conecta tu repositorio
4. Configuración:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`

### Configuración de Dominio Personalizado

1. **Compra un dominio** (GoDaddy, Namecheap, etc.)

2. **Configura DNS:**
   - Tipo: `A` o `CNAME`
   - Nombre: `@` (para root) o `www`
   - Valor: IP del servidor o dominio del hosting

3. **Habilita HTTPS:**
   - Netlify/Vercel: automático
   - VPS: Usa Let's Encrypt:
     ```bash
     sudo certbot --apache -d tudominio.com
     # o para nginx:
     sudo certbot --nginx -d tudominio.com
     ```

---

## 💻 Aplicación de Escritorio Windows

### Método 1: Usando Scripts Incluidos (Más Fácil)

1. **Abre PowerShell como Administrador** en la carpeta del proyecto

2. **Ejecuta el setup:**
   ```powershell
   .\setup-desktop.bat
   ```
   
   Esto instalará todas las dependencias necesarias.

3. **Genera el ejecutable:**
   ```powershell
   .\generar-ejecutable.bat
   ```

4. **Encuentra el ejecutable:**
   - Carpeta: `release/`
   - Instalador: `Josimar Cell - Sistema de Inventario Setup X.X.X.exe`
   - Portable: `JosimarCell-Portable-X.X.X.exe`

### Método 2: Comandos Manuales

1. **Instala Electron Builder:**
   ```bash
   npm install --save-dev electron electron-builder concurrently wait-on
   ```

2. **Construye la aplicación web:**
   ```bash
   npm run build
   ```

3. **Genera ejecutable Windows:**
   ```bash
   npm run electron:build:win
   ```

   Para otros sistemas:
   ```bash
   npm run electron:build:mac   # macOS
   npm run electron:build:linux # Linux
   ```

### Desarrollo Local (Desktop)

Para probar la versión de escritorio antes de compilar:

```bash
npm run electron:dev
```

Esto abrirá la aplicación en una ventana de Electron.

### Distribución del Ejecutable

1. **Instalador (NSIS):**
   - Archivo: `release/Josimar Cell - Sistema de Inventario Setup X.X.X.exe`
   - Permite instalación personalizada
   - Crea accesos directos en escritorio y menú inicio
   - Desinstalador incluido

2. **Portable:**
   - Archivo: `release/JosimarCell-Portable-X.X.X.exe`
   - No requiere instalación
   - Ejecuta directamente desde USB o cualquier carpeta
   - Ideal para uso sin permisos de administrador

---

## 📦 Requisitos del Sistema

### Para Servidor Web

- **Mínimo:**
  - 512 MB RAM
  - 100 MB espacio en disco
  - Servidor web (Apache/Nginx) o hosting estático

- **Recomendado:**
  - 1 GB RAM
  - 500 MB espacio en disco
  - CDN global (Netlify/Vercel/Cloudflare)

### Para Aplicación de Escritorio Windows

- **Sistema Operativo:**
  - Windows 7 o superior (recomendado Windows 10/11)
  - Arquitectura: x64 o x86 (32-bit)

- **Hardware Mínimo:**
  - 2 GB RAM
  - 200 MB espacio en disco
  - Resolución: 1024x768 o superior

- **Hardware Recomendado:**
  - 4 GB RAM
  - 500 MB espacio en disco
  - Resolución: 1920x1080

### Navegadores Soportados (Web)

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+
- Brave (cualquier versión reciente)
- Samsung Internet 13+

---

## ✅ Verificación Post-Despliegue

### Checklist Web:

- [ ] La aplicación carga correctamente en el dominio
- [ ] El login funciona
- [ ] Se pueden crear usuarios
- [ ] Se pueden agregar productos
- [ ] Se pueden crear órdenes
- [ ] Los datos persisten después de recargar
- [ ] HTTPS está habilitado
- [ ] La aplicación funciona en móviles
- [ ] Los iconos y fuentes se cargan correctamente

### Checklist Desktop:

- [ ] El ejecutable se instala correctamente
- [ ] La aplicación abre sin errores
- [ ] El login funciona
- [ ] Los datos se guardan localmente
- [ ] La aplicación funciona offline
- [ ] Los accesos directos se crean correctamente
- [ ] El desinstalador funciona

---

## 🔧 Solución de Problemas

### Problema: "Página en blanco después del despliegue"

**Solución:** Verifica que la base path esté configurada correctamente:
- En `vite.config.ts`, asegúrate de que `base: '/'` para dominio root
- Si despliegas en subcarpeta: `base: '/nombre-carpeta/'`

### Problema: "Los assets no se cargan (404)"

**Solución:**
- Verifica que el servidor esté configurado para servir archivos estáticos
- Asegúrate de que las rutas relativas en el HTML sean correctas
- Revisa la configuración del servidor web (Apache .htaccess o Nginx config)

### Problema: "El ejecutable no abre en Windows"

**Solución:**
- Ejecuta como administrador
- Desactiva temporalmente el antivirus
- Verifica que .NET Framework esté instalado
- Reinstala Microsoft Visual C++ Redistributable

### Problema: "Error de permisos en Windows"

**Solución:**
- Ejecuta PowerShell como administrador
- Permite ejecución de scripts: `Set-ExecutionPolicy RemoteSigned`

---

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs de error en la consola del navegador
2. Verifica los logs del servidor (si aplica)
3. Consulta la documentación específica de tu plataforma de hosting
4. Revisa el archivo `PRD.md` para detalles técnicos adicionales

---

## 🔄 Actualizaciones

Para actualizar la aplicación desplegada:

**Web:**
```bash
npm run build
# Luego sube la nueva carpeta dist/ o haz push a git (si usas auto-deploy)
```

**Desktop:**
```bash
npm run build
npm run electron:build:win
# Distribuye el nuevo ejecutable
```

---

**Última actualización:** 2024
**Versión:** 1.0.0
