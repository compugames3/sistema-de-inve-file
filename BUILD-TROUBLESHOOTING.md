# Build Troubleshooting Guide

A comprehensive guide to diagnosing and fixing common build errors in Spark applications.

## Table of Contents

- [General Debugging Approach](#general-debugging-approach)
- [Common Build Errors](#common-build-errors)
  - [CSS/Tailwind Errors](#csstailwind-erro
  - [Vite Build Errors](#vite-build-errors)
- [Performance Issues](#performance-issues)




2. **Check the file path and line number** 



# Clear node modules and rein

# Clear Vite cache

rm -rf node_modules package-lock.json node_modules/.vite
npm run dev






```
**Causes & Solutions:**
1. **Missing type import**
   // ❌ Wro

   import { Produc
   ```

   - Verify the file
3. **Circular dependencies**
   - Move s
#### Error:
**S



   ```typescript

   }

     id: string


   
   const user = data as User
   

   }

   ```typescript
   const name = 
   // ✅ Corre
   ```
###
**Symptom:**
error TS2344: Type 'string' is not assig



   interface ButtonProps
   }
   // ❌ Wrong

   <Button size="sm" />

   ```typescript

   // ✅ Correct - explicit type

3. **useKV t
   
   
   





```
```
**Causes & Solu
1. *
   
   
   import { Button 

   ```typescript
   i
   // 

   ```
3. **File doesn'
   - Verify f
4. **Missing npm package**
   
   
   npm install package-


```
```

1. **Function not exported**
   // ❌ Wrong
   
   export function formatDate

   ```typescrip
   export default function MyC
   // 

   import MyComponent from './MyComponent'

   ```typesc
   
   import { fn1, fn2 } from './utils'
   

   ```

**Symptom:**
Attempted import


   - View the source file to 

   
   npm instal

   
   import { use
   // ✅ Correct
   ```

### CSS/Tailwind Errors
#### Error: "Unk
**Symptom:**
Unknown at rule @tailwindcss


   - Verify `@tailwindcss/vite` is installed


   @tailwind base;
   @tailwind uti
   /* ✅ Corre
   ```
###
**Symptom:**
The 'bg-primary' class does not exist, but 'bg


   ```

   

     --color-primary: va



   <div clas
   
   ```
3. 

#### Error: "Cannot use

The 'flex-center' class doe


   ```css
   
   }
   /* ✅ Correct */
     @

2. **Applying non-existent utility**
   - Check for t
---
### Dependency Errors
###
**Symptom:**
error when starting dev server:
```
**Causes & Solutions:**
1. **P


   ```bash
   npm install

   - Verify the exact pack


```
```
**Causes & Solutions:**
1. **Usually safe to ignore
   ```

3. **Update dependencies**



```
```

1. **Node-only module i

   
   // Use fetch,

   - `fs`, `path`, `crypto` (use `Web Cr
   
---
### Vite Build Errors
#### E

Failed to resolve import "@/component


   ```typescript
   
   import MyC
   // ✅ Correct
   
2. **Check tsco
   // tsconfig.json
     "

     }
   ```
3. **Restart dev server**


```
err


   - Check the file men

   ```

     return <div>Hello</div>

   // MyComp
   
   ```
3. 

#### Error: "Pre-transf

Pre-transform error: Unexpected



   npm run dev

   - Don't put images dir




```
```
**Causes & Solutions:**
1. 
   // ❌ Wrong
   
   con

   

   // ✅ Correct

#### Error: "Cannot read properties of und

Uncaught Typ


   

   // ✅ Correct - check

2. **Missing default value**
   // ❌ Wrong
   



```
```
**Causes & Solutions:**
1. **Calling setState i
   
     const [count, setCount] = useState
     return <div>{count}<
   

     

     
   

   

   {/* ✅ Correct - pass

   <button onClick={() => handleClick(


```
```
**Causes & Solutions:**
1. *
   
     onUpda
   }
   // ✅ Correct
    
     }






   ```bash
   npm list --depth=0
   # R

2. **Large files in src/**
   - Optimize images before importing
3. **Vite cache issues**

   ```

**Causes & S
1. 
   # Increase file watcher limit
   

   ```bash

   ```
---
## Advanced Debu
### Enable Ver
```bash
npm 
# C

npm --version


   - C

   - Open DevTools (F12)
   - Check Network tab for failed requests
3. **Use TypeScript 

   

   ```

#### App.tsx won't compile

3. Check all


2. Check all CSS variables are defined
4. 

1. Check component is i






- [ ] Clear cache: `rm -rf no
- [ ] Chec
- [ ] Check TypeScript types match usage
- [ ] Validate
- [ ] 

## Getting Help
If you're still stuck after trying these 
1. **Copy the complete error messa

5. **Create a minimal reproduction** -













































































































































































































































































































































































































