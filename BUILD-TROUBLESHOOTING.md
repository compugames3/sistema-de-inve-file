# 🔧 Build & Deployment Troubleshooting Guide

Comprehensive troubleshooting for production builds, deployment issues, and runtime errors in the Josimar Cell Inventory System.

## 📑 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Build Errors](#build-errors)
- [Deployment Issues](#deployment-issues)
- [Runtime Errors](#runtime-errors)
- [Performance Problems](#performance-problems)
- [Browser Compatibility](#browser-compatibility)
- [Desktop App Issues](#desktop-app-issues)
- [Advanced Debugging](#advanced-debugging)

---

## 🚀 Quick Diagnostics

### First Steps (Always Try These First)

```bash
# 1. Clear all caches and reinstall
rm -rf node_modules package-lock.json dist .vite
npm install

# 2. Clear Vite cache specifically
rm -rf node_modules/.vite

# 3. Try a fresh build
npm run build

# 4. Preview the build locally
npm run preview
```

### Check Your Environment

```bash
# Verify versions
node --version    # Should be 18.x or higher
npm --version     # Should be 8.x or higher

# List installed packages
npm list --depth=0

# Check for outdated packages
npm outdated
```

---

## 🏗️ Build Errors

### Error: `npm run build` fails

#### Symptom:
```
error during build:
[vite]: Rollup failed to resolve import
```

**Solutions:**

1. **Check import paths**
   ```typescript
   // ❌ Wrong - missing extension or incorrect path
   import { Product } from './types'
   
   // ✅ Correct - using @ alias
   import { Product } from '@/lib/types'
   ```

2. **Verify tsconfig.json paths**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. **Clear cache and rebuild**
   ```bash
   rm -rf node_modules/.vite dist
   npm run build
   ```

---

### Error: TypeScript compilation errors

#### Symptom:
```
error TS2307: Cannot find module '@/components/Dashboard'
error TS2322: Type 'string' is not assignable to type 'number'
```

**Solutions:**

1. **Check all imports exist**
   ```typescript
   // Make sure the file actually exists
   import { Dashboard } from '@/components/Dashboard'
   ```

2. **Fix type mismatches**
   ```typescript
   // ❌ Wrong
   const id: number = "123"
   
   // ✅ Correct
   const id: number = 123
   const idString: string = "123"
   ```

3. **Check useKV types**
   ```typescript
   // ❌ Wrong - no type specified
   const [products, setProducts] = useKV('products', [])
   
   // ✅ Correct - explicit type
   const [products, setProducts] = useKV<Product[]>('products', [])
   ```

---

### Error: CSS/Tailwind errors

#### Symptom:
```
Unknown at rule @tailwindcss
The 'bg-primary' class does not exist
```

**Solutions:**

1. **Verify Tailwind is installed**
   ```bash
   npm list @tailwindcss/vite
   ```

2. **Check index.css has correct imports**
   ```css
   @import 'tailwindcss';
   @import "tw-animate-css";
   
   :root {
     --background: oklch(0.98 0 0);
     --primary: oklch(0.35 0.08 250);
     /* ... more variables */
   }
   
   @theme {
     --color-background: var(--background);
     --color-primary: var(--primary);
     /* ... more mappings */
   }
   ```

3. **Ensure @theme block exists**
   ```css
   /* REQUIRED if using @apply border-border */
   @theme {
     --color-border: var(--border);
     /* other color mappings */
   }
   ```

---

### Error: Out of memory during build

#### Symptom:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solutions:**

1. **Increase Node memory**
   ```bash
   # Windows
   set NODE_OPTIONS=--max-old-space-size=4096 && npm run build
   
   # Linux/Mac
   NODE_OPTIONS=--max-old-space-size=4096 npm run build
   ```

2. **Add to package.json**
   ```json
   {
     "scripts": {
       "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
     }
   }
   ```

3. **Optimize large dependencies**
   - Remove unused dependencies
   - Use dynamic imports for heavy components
   - Optimize images before importing

---

## 🌐 Deployment Issues

### Issue: Blank page after deployment

#### Symptom:
Page loads but shows only white screen, no errors in build.

**Solutions:**

1. **Check base path in vite.config.ts**
   ```typescript
   // For root domain (https://example.com)
   export default defineConfig({
     base: '/'
   })
   
   // For subdirectory (https://example.com/app/)
   export default defineConfig({
     base: '/app/'
   })
   ```

2. **Verify index.html loads**
   - Open browser DevTools → Network tab
   - Check if index.html returns 200 status
   - Check if assets/ files return 200 status

3. **Check console for errors**
   - Open browser DevTools → Console tab
   - Look for 404 errors or failed imports

---

### Issue: 404 errors for assets

#### Symptom:
```
GET https://example.com/assets/index-abc123.js 404 (Not Found)
GET https://example.com/assets/index-def456.css 404 (Not Found)
```

**Solutions:**

1. **Verify dist/ folder structure**
   ```
   dist/
   ├── index.html
   ├── assets/
   │   ├── index-abc123.js
   │   ├── index-def456.css
   │   └── logo-xyz.png
   └── icon.svg
   ```

2. **Check server configuration**
   
   **For Apache (.htaccess):**
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
   
   **For Nginx:**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

3. **Upload entire dist/ folder**
   - Don't upload individual files
   - Preserve directory structure
   - Include hidden files if any

---

### Issue: Routing doesn't work (404 on refresh)

#### Symptom:
Direct URLs or page refresh returns 404 error.

**Solutions:**

1. **Configure server for SPA routing**
   
   **Apache (.htaccess):**
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```
   
   **Nginx:**
   ```nginx
   location / {
     try_files $uri /index.html;
   }
   ```

2. **For static hosts (Netlify/Vercel)**
   - These handle SPA routing automatically
   - No configuration needed

---

### Issue: Environment variables not working

#### Symptom:
```
import.meta.env.VITE_API_URL is undefined
```

**Solutions:**

1. **Use VITE_ prefix**
   ```bash
   # .env
   VITE_API_URL=https://api.example.com  # ✅ Works
   API_URL=https://api.example.com        # ❌ Won't work
   ```

2. **Don't commit .env to git**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   ```

3. **Set variables in hosting platform**
   - Netlify: Site settings → Build & deploy → Environment
   - Vercel: Project settings → Environment Variables
   - VPS: Create .env file on server

---

## ⚠️ Runtime Errors

### Error: "Cannot read property of undefined"

#### Symptom:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'map')
```

**Solutions:**

1. **Check for null/undefined before using**
   ```typescript
   // ❌ Wrong
   {products.map(p => <div>{p.name}</div>)}
   
   // ✅ Correct
   {products?.map(p => <div>{p.name}</div>)}
   // or
   {(products || []).map(p => <div>{p.name}</div>)}
   ```

2. **Use default values in useKV**
   ```typescript
   // ❌ Wrong - might be undefined initially
   const [products, setProducts] = useKV('products')
   
   // ✅ Correct - always has default
   const [products, setProducts] = useKV<Product[]>('products', [])
   ```

---

### Error: State not updating correctly

#### Symptom:
Changes to state don't appear or overwrite previous data.

**Solutions:**

1. **CRITICAL: Always use functional updates with useKV**
   ```typescript
   // ❌ WRONG - This causes data loss!
   const [todos, setTodos] = useKV('todos', [])
   setTodos([...todos, newTodo])  // 'todos' is stale!
   
   // ✅ CORRECT - Always use functional form
   setTodos(current => [...current, newTodo])
   ```

2. **Don't mutate state directly**
   ```typescript
   // ❌ Wrong
   products.push(newProduct)
   setProducts(products)
   
   // ✅ Correct
   setProducts(current => [...current, newProduct])
   ```

---

### Error: "Maximum update depth exceeded"

#### Symptom:
```
Uncaught Error: Maximum update depth exceeded
```

**Solutions:**

1. **Don't call setState in render**
   ```typescript
   // ❌ Wrong
   function Component() {
     const [count, setCount] = useState(0)
     setCount(count + 1)  // Infinite loop!
     return <div>{count}</div>
   }
   
   // ✅ Correct
   function Component() {
     const [count, setCount] = useState(0)
     return <button onClick={() => setCount(count + 1)}>{count}</button>
   }
   ```

2. **Use useEffect for side effects**
   ```typescript
   // ✅ Correct
   useEffect(() => {
     setCount(someValue)
   }, [someValue])
   ```

---

## 🐌 Performance Problems

### Issue: Slow initial load

**Solutions:**

1. **Enable compression on server**
   
   **Nginx:**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_types text/plain text/css application/javascript;
   ```
   
   **Apache:**
   ```apache
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/css application/javascript
   </IfModule>
   ```

2. **Use dynamic imports for heavy components**
   ```typescript
   // Split large components
   const Dashboard = lazy(() => import('@/components/Dashboard'))
   
   <Suspense fallback={<div>Loading...</div>}>
     <Dashboard />
   </Suspense>
   ```

3. **Optimize images**
   - Compress before importing
   - Use WebP format when possible
   - Use appropriate sizes

---

### Issue: Large bundle size

**Solutions:**

1. **Analyze bundle**
   ```bash
   npm run build -- --mode analyze
   ```

2. **Remove unused dependencies**
   ```bash
   npm uninstall package-name
   ```

3. **Check for duplicate dependencies**
   ```bash
   npm dedupe
   ```

---

## 🌍 Browser Compatibility

### Issue: App doesn't work in older browsers

**Solutions:**

1. **Check .browserslistrc**
   ```
   > 0.5%
   last 2 versions
   Firefox ESR
   not dead
   not IE 11
   ```

2. **Add compatibility check page**
   - Already included in `public/compatibility-check.html`
   - Redirects unsupported browsers to info page

3. **Test in target browsers**
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

---

### Issue: CSS not working in Safari

**Solutions:**

1. **Check for unsupported CSS features**
   ```css
   /* Some CSS features may need prefixes */
   -webkit-backdrop-filter: blur(10px);
   backdrop-filter: blur(10px);
   ```

2. **Test oklch color support**
   - Safari 15+ supports oklch
   - Fallback colors may be needed for Safari 14

---

## 💻 Desktop App Issues

### Error: Executable won't build

#### Symptom:
```
npm run electron:build:win fails
```

**Solutions:**

1. **Install required dependencies**
   ```bash
   npm install electron electron-builder --save-dev
   ```

2. **Check package.json has electron config**
   ```json
   {
     "main": "electron.js",
     "build": {
       "appId": "com.josimarcell.inventory",
       "productName": "Josimar Cell - Sistema de Inventario"
     }
   }
   ```

3. **Build web app first**
   ```bash
   npm run build
   npm run electron:build:win
   ```

---

### Error: Executable won't run on Windows

#### Symptom:
Double-clicking .exe does nothing or shows error.

**Solutions:**

1. **Run as administrator**
   - Right-click → Run as administrator

2. **Check antivirus**
   - Temporarily disable antivirus
   - Add exception for the .exe file

3. **Install dependencies**
   ```bash
   # Install .NET Framework
   # Install Visual C++ Redistributable
   ```

4. **Check Windows version**
   - Minimum: Windows 7
   - Recommended: Windows 10/11

---

### Error: App crashes on startup (Desktop)

**Solutions:**

1. **Check electron logs**
   ```bash
   # Logs location:
   # Windows: %APPDATA%\Josimar Cell\logs\
   # Mac: ~/Library/Logs/Josimar Cell/
   # Linux: ~/.config/Josimar Cell/logs/
   ```

2. **Run in dev mode to see errors**
   ```bash
   npm run electron:dev
   ```

3. **Clear app data**
   ```bash
   # Windows: Delete folder
   %APPDATA%\Josimar Cell\
   ```

---

## 🔍 Advanced Debugging

### Enable verbose logging

```bash
# Vite verbose mode
npm run dev -- --debug

# Build with source maps
npm run build -- --sourcemap

# Electron with DevTools open
npm run electron:dev
```

---

### Browser DevTools Checklist

1. **Console Tab**
   - Look for red errors
   - Check for warnings about deprecated APIs
   - Note any failed requests

2. **Network Tab**
   - Check for 404 errors
   - Verify assets load (200 status)
   - Check file sizes (should be minified in production)

3. **Application Tab**
   - Check IndexedDB for stored data
   - Verify service worker (if using PWA)
   - Check localStorage/sessionStorage

4. **Performance Tab**
   - Record page load
   - Look for long tasks
   - Check memory usage

---

### Common File Issues

#### Missing files after build

**Check:**
```bash
# Verify dist/ contents
ls -R dist/

# Should see:
# dist/index.html
# dist/assets/
# dist/icon.svg
```

#### Incorrect permissions (Linux/Mac)

```bash
# Fix permissions
chmod -R 755 dist/
```

---

## 🆘 Emergency Checklist

If nothing works, try this in order:

- [ ] `rm -rf node_modules package-lock.json`
- [ ] `npm install`
- [ ] `rm -rf dist .vite`
- [ ] `npm run build`
- [ ] `npm run preview` (test locally)
- [ ] Check console for errors
- [ ] Verify all files uploaded to server
- [ ] Clear browser cache
- [ ] Try in incognito/private window
- [ ] Test in different browser
- [ ] Check server logs (if VPS)

---

## 📞 Getting Help

When asking for help, provide:

1. **Complete error message** (copy full text)
2. **Steps to reproduce** (what you did before the error)
3. **Environment info:**
   ```bash
   node --version
   npm --version
   # OS and browser version
   ```
4. **Build output** (copy terminal output)
5. **Console errors** (from browser DevTools)

---

## 🔗 Related Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md) - Pre-deployment checklist
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [WINDOWS-GUIDE.md](WINDOWS-GUIDE.md) - Windows-specific guide

---

**Last Updated:** 2024  
**Version:** 1.0.0
