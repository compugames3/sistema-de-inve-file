# 🔧 Build & Deployment Troubleshooting Guide

## 📑 Table of Contents

- [Deployment Issues](#

- [Desktop App Issues](#desktop-app-issue




# 1. Clear all caches and reinstall
npm install
# 2. Clear Vite cache specifically

npm

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

     }

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

   }

   ```css
   @th

   ```
---
### Error: Out of memory 
#### Symptom:
FAT


   ```bash
   set NODE_OPTIONS=--max-old
   #
   
2. **Add to
   {
       "build": "NODE_OPTIONS=--max-o
   }

   - R

---
## 🌐 Dep
### Issue: Blank page after deployment
#### Sympto


   `
   exp

   

   ```

   - Check if

   - Open browser DevTools → Console tab




GET https://example.com/ass


   ```
   
   │   ├── ind
   │   └── logo-xyz.png
   ```

   **For Apache (.htaccess
   <IfModu
    
     RewriteCond 
     RewriteRule . /index.html [L]
   ```
   *
   loc


   - Don't upload individual fi
   - Include hidden files if any
---

###



   ```apache

   RewriteRul
   

     try_files

2. **For static hosts (Netlify/Vercel)**
   - No configur
---
### Issue: Environment variables
#### Symptom:
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

   - S





```

1. **Install r


   
     "main": 
       "app
     }
   ```
3. **Build web app first**
   npm
   
---
### Error: E
#### Symptom:


   - R

   - Add exception for the .exe file
3. **Install dep
   # Install .NET Framework
   ```
4. 
   - Recommended: Windows 10/11
---
### Error: App
**Solu

   # Logs location:
   # Mac: ~/Library/Logs/Josim
   ```
2. **Run in dev mode to se



   %APPDATA%\Josimar Cell\




# Vite ver

npm ru

```
---
### Browser DevTools Checklis
1. **C


   - Check
   - Check fi
3. **A



   - Check memory usage

### Common File Issues

**Check:**


# dist
# dist/ic


# Fix permi
```
---

If nothing works, try this in order
- [ ] `rm -rf node_modules package-lock.json`
- [ ] `rm -rf dist .vite`

- [ ] Verify all files uploade
- [ ] Try in in
- [ ] Check serv
---
## 📞 Getting

1. 

   node --version

4. **Build out



- [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECK
- [WINDOWS-GUIDE.md](WINDOWS-GUIDE.md) 
---
**Last












































































































































































































