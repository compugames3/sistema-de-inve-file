# Build Troubleshooting Guide

A comprehensive guide to diagnosing and fixing common build errors in Spark applications.

## Table of Contents

- [General Debugging Approach](#general-debugging-approach)
- [Common Build Errors](#common-build-errors)
  - [TypeScript Errors](#typescript-errors)
  - [Import/Module Errors](#importmodule-errors)
  - [CSS/Tailwind Errors](#csstailwind-errors)
  - [Dependency Errors](#dependency-errors)
  - [Vite Build Errors](#vite-build-errors)
  - [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)
- [Advanced Debugging](#advanced-debugging)

---

## General Debugging Approach

When encountering a build error, follow these steps:

1. **Read the error message carefully** - The first error in the console is usually the root cause
2. **Check the file path and line number** - Navigate to the exact location mentioned
3. **Review recent changes** - What was the last thing you modified?
4. **Clear caches** - Sometimes stale cache causes issues
5. **Restart the dev server** - Stop and restart `npm run dev`

### Quick Reset Commands

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Full clean restart
rm -rf node_modules package-lock.json node_modules/.vite
npm install
npm run dev
```

---

## Common Build Errors

### TypeScript Errors

#### Error: "Cannot find name 'X'"

**Symptom:**
```
error TS2304: Cannot find name 'Product'.
```

**Causes & Solutions:**

1. **Missing type import**
   ```typescript
   // ❌ Wrong
   const product: Product = {...}
   
   // ✅ Correct
   import { Product } from '@/lib/types'
   const product: Product = {...}
   ```

2. **Type not exported**
   - Check that the type is exported: `export interface Product {...}`
   - Verify the file path is correct

3. **Circular dependencies**
   - Restructure imports to avoid circular references
   - Move shared types to a separate file

#### Error: "Property 'X' does not exist on type 'Y'"

**Symptom:**
```
error TS2339: Property 'username' does not exist on type 'User'.
```

**Causes & Solutions:**

1. **Missing property in interface**
   ```typescript
   // ❌ Wrong - property missing
   interface User {
     id: string
   }
   
   // ✅ Correct
   interface User {
     id: string
     username: string
   }
   ```

2. **Incorrect type assertion**
   ```typescript
   // ❌ Wrong
   const user = data as User
   
   // ✅ Correct - validate the data shape
   const user: User = {
     id: data.id,
     username: data.username || 'unknown'
   }
   ```

3. **Optional property access**
   ```typescript
   // ❌ Wrong - user might be null
   const name = user.username
   
   // ✅ Correct
   const name = user?.username
   ```

#### Error: "Type 'X' is not assignable to type 'Y'"

**Symptom:**
```
error TS2344: Type 'string' is not assignable to type 'number'.
```

**Causes & Solutions:**

1. **Type mismatch in props**
   ```typescript
   // Component definition
   interface ButtonProps {
     size: 'sm' | 'md' | 'lg'
   }
   
   // ❌ Wrong
   <Button size="small" />
   
   // ✅ Correct
   <Button size="sm" />
   ```

2. **useState type mismatch**
   ```typescript
   // ❌ Wrong - infers string[]
   const [items, setItems] = useState([])
   
   // ✅ Correct - explicit type
   const [items, setItems] = useState<Product[]>([])
   ```

3. **useKV type mismatch**
   ```typescript
   // ❌ Wrong
   const [count, setCount] = useKV('count', '0')
   
   // ✅ Correct
   const [count, setCount] = useKV('count', 0)
   // or
   const [count, setCount] = useKV<number>('count', 0)
   ```

---

### Import/Module Errors

#### Error: "Cannot find module 'X'"

**Symptom:**
```
error TS2307: Cannot find module '@/components/MyComponent'.
```

**Causes & Solutions:**

1. **Incorrect path alias**
   ```typescript
   // ❌ Wrong
   import { Button } from 'components/ui/button'
   
   // ✅ Correct
   import { Button } from '@/components/ui/button'
   ```

2. **Missing file extension in import**
   ```typescript
   // ❌ Wrong
   import { utils } from '@/lib/utils'
   
   // ✅ Correct
   import { utils } from '@/lib/utils.ts'
   // or just
   import { utils } from '@/lib/utils'  // works if file exists
   ```

3. **File doesn't exist**
   - Check the file actually exists at that path
   - Verify file name casing (case-sensitive on Linux/Mac)

4. **Missing npm package**
   ```bash
   # Check if package is installed
   npm list package-name
   
   # If not, install it
   npm install package-name
   ```

#### Error: "Module has no exported member 'X'"

**Symptom:**
```
error TS2305: Module '"@/lib/utils"' has no exported member 'formatDate'.
```

**Causes & Solutions:**

1. **Function not exported**
   ```typescript
   // ❌ Wrong
   function formatDate(date: Date) {...}
   
   // ✅ Correct
   export function formatDate(date: Date) {...}
   ```

2. **Named import vs default import**
   ```typescript
   // If exported as default
   export default function MyComponent() {...}
   
   // ❌ Wrong
   import { MyComponent } from './MyComponent'
   
   // ✅ Correct
   import MyComponent from './MyComponent'
   ```

3. **Destructuring error**
   ```typescript
   // ✅ Correct - named exports
   export const fn1 = () => {}
   export const fn2 = () => {}
   import { fn1, fn2 } from './utils'
   
   // ✅ Correct - default export
   const utils = { fn1, fn2 }
   export default utils
   import utils from './utils'
   ```

#### Error: "Attempted import error: 'X' is not exported from 'Y'"

**Symptom:**
```
Attempted import error: 'useKV' is not exported from '@github/spark/hooks'.
```

**Causes & Solutions:**

1. **Check the actual exports**
   - View the source file to see what's actually exported
   - Use the correct import name

2. **Package not installed**
   ```bash
   npm list @github/spark
   npm install  # Reinstall if missing
   ```

3. **Typo in import name**
   ```typescript
   // ❌ Wrong
   import { useKv } from '@github/spark/hooks'
   
   // ✅ Correct
   import { useKV } from '@github/spark/hooks'
   ```

---

### CSS/Tailwind Errors

#### Error: "Unknown at rule @tailwindcss"

**Symptom:**
```
Unknown at rule @tailwindcss
```

**Causes & Solutions:**

1. **Missing Tailwind plugin**
   - Verify `@tailwindcss/vite` is installed
   - Check `vite.config.ts` includes the plugin

2. **Incorrect CSS import structure**
   ```css
   /* ❌ Wrong - old Tailwind v3 syntax */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   /* ✅ Correct - Tailwind v4 syntax */
   @import 'tailwindcss';
   ```

#### Error: "The 'X' class does not exist"

**Symptom:**
```
The 'bg-primary' class does not exist, but 'bg-primary-foreground' does.
```

**Causes & Solutions:**

1. **Missing CSS variable definition**
   ```css
   /* index.css - make sure variables are defined */
   :root {
     --primary: oklch(0.35 0.08 250);
     --primary-foreground: oklch(1 0 0);
   }
   
   @theme {
     --color-primary: var(--primary);
     --color-primary-foreground: var(--primary-foreground);
   }
   ```

2. **Typo in class name**
   ```tsx
   {/* ❌ Wrong */}
   <div className="bg-primry" />
   
   {/* ✅ Correct */}
   <div className="bg-primary" />
   ```

3. **Custom class not configured**
   - Check `tailwind.config.js` for custom classes
   - Verify the theme extension is correct

#### Error: "Cannot use @apply with 'X'"

**Symptom:**
```
The 'flex-center' class does not exist. If 'flex-center' is a custom class, make sure it is defined.
```

**Causes & Solutions:**

1. **Trying to @apply multiple utilities**
   ```css
   /* ❌ Wrong */
   .centered {
     @apply flex-center;
   }
   
   /* ✅ Correct */
   .centered {
     @apply flex items-center justify-center;
   }
   ```

2. **Applying non-existent utility**
   - Make sure the utility class exists in Tailwind
   - Check for typos

---

### Dependency Errors

#### Error: "Cannot find package 'X'"

**Symptom:**
```
error when starting dev server:
Error: Cannot find package 'framer-motion'
```

**Causes & Solutions:**

1. **Package not installed**
   ```bash
   npm install framer-motion
   ```

2. **Corrupted node_modules**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Wrong package name**
   - Verify the exact package name on npm
   - Check for deprecated packages

#### Error: "Peer dependency warnings"

**Symptom:**
```
npm WARN ERESOLVE overriding peer dependency
```

**Causes & Solutions:**

1. **Usually safe to ignore** - These are warnings, not errors
2. **If causing issues:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Update dependencies**
   ```bash
   npm update
   ```

#### Error: "Module not found: Can't resolve 'X'"

**Symptom:**
```
Module not found: Can't resolve 'fs' in '/workspaces/spark-template/src'
```

**Causes & Solutions:**

1. **Node-only module in browser code**
   ```typescript
   // ❌ Wrong - 'fs' is Node-only
   import fs from 'fs'
   
   // ✅ Correct - use browser APIs
   // Use fetch, useKV, or other browser-compatible methods
   ```

2. **Common Node modules that don't work in browser:**
   - `fs`, `path`, `crypto` (use `Web Crypto API`)
   - `os`, `child_process`, `net`
   - Use browser-compatible alternatives

---

### Vite Build Errors

#### Error: "Failed to resolve import"

**Symptom:**
```
Failed to resolve import "@/components/MyComponent" from "src/App.tsx"
```

**Causes & Solutions:**

1. **Case sensitivity**
   ```typescript
   // File is: MyComponent.tsx
   
   // ❌ Wrong on Linux/Mac
   import MyComponent from '@/components/mycomponent'
   
   // ✅ Correct
   import MyComponent from '@/components/MyComponent'
   ```

2. **Check tsconfig paths**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. **Restart dev server**
   - Stop and restart: `npm run dev`

#### Error: "Transform failed with X error"

**Symptom:**
```
Transform failed with 1 error:
error: Expected ")" but found "."
```

**Causes & Solutions:**

1. **Syntax error in code**
   - Check the file mentioned in error
   - Look for missing brackets, parentheses, or commas

2. **JSX in .ts file**
   ```typescript
   // ❌ Wrong - JSX in .ts file
   // MyComponent.ts
   export default function MyComponent() {
     return <div>Hello</div>
   }
   
   // ✅ Correct - use .tsx extension
   // MyComponent.tsx
   export default function MyComponent() {
     return <div>Hello</div>
   }
   ```

3. **Invalid TypeScript syntax**
   - Check for proper type annotations
   - Verify arrow function syntax

#### Error: "Pre-transform error"

**Symptom:**
```
Pre-transform error: Unexpected token
```

**Causes & Solutions:**

1. **Clear Vite cache**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **Check for binary files in src/**
   - Don't put images directly in src without importing
   - Use proper asset imports

---

### Runtime Errors

#### Error: "X is not a function"

**Symptom:**
```
Uncaught TypeError: setTodos is not a function
```

**Causes & Solutions:**

1. **Incorrect destructuring**
   ```typescript
   // ❌ Wrong
   const [todos, setTodos] = useKV('todos')
   
   // ✅ Correct - provide default value
   const [todos, setTodos] = useKV('todos', [])
   ```

2. **Calling wrong variable**
   ```typescript
   // ❌ Wrong
   todos(['new item'])
   
   // ✅ Correct
   setTodos(['new item'])
   ```

#### Error: "Cannot read properties of undefined"

**Symptom:**
```
Uncaught TypeError: Cannot read properties of undefined (reading 'map')
```

**Causes & Solutions:**

1. **Data not loaded yet**
   ```typescript
   // ❌ Wrong
   return <div>{todos.map(...)}</div>
   
   // ✅ Correct - check for undefined
   return <div>{todos?.map(...) ?? 'Loading...'}</div>
   ```

2. **Missing default value**
   ```typescript
   // ❌ Wrong
   const [data, setData] = useState()
   
   // ✅ Correct
   const [data, setData] = useState<Todo[]>([])
   ```

#### Error: "Too many re-renders"

**Symptom:**
```
Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

**Causes & Solutions:**

1. **Calling setState in render**
   ```typescript
   // ❌ Wrong - causes infinite loop
   function MyComponent() {
     const [count, setCount] = useState(0)
     setCount(count + 1)  // Don't do this!
     return <div>{count}</div>
   }
   
   // ✅ Correct - use useEffect or event handler
   function MyComponent() {
     const [count, setCount] = useState(0)
     
     useEffect(() => {
       setCount(count + 1)
     }, [])  // Only on mount
     
     return <div>{count}</div>
   }
   ```

2. **Event handler called immediately**
   ```tsx
   {/* ❌ Wrong - calls immediately */}
   <button onClick={handleClick()}>Click</button>
   
   {/* ✅ Correct - passes function reference */}
   <button onClick={handleClick}>Click</button>
   
   {/* ✅ Also correct - arrow function */}
   <button onClick={() => handleClick()}>Click</button>
   ```

#### Error: "Cannot update component while rendering another"

**Symptom:**
```
Warning: Cannot update a component while rendering a different component
```

**Causes & Solutions:**

1. **setState in render of child component**
   ```typescript
   // ❌ Wrong
   function Child({ onUpdate }) {
     onUpdate('new value')  // Don't call during render
     return <div>Child</div>
   }
   
   // ✅ Correct
   function Child({ onUpdate }) {
     useEffect(() => {
       onUpdate('new value')
     }, [])
     return <div>Child</div>
   }
   ```

---

## Performance Issues

### Build is Very Slow

**Causes & Solutions:**

1. **Too many dependencies**
   ```bash
   # Audit dependencies
   npm list --depth=0
   
   # Remove unused packages
   npm uninstall unused-package
   ```

2. **Large files in src/**
   - Move large assets to `src/assets/`
   - Optimize images before importing

3. **Vite cache issues**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Hot Module Reload (HMR) Not Working

**Causes & Solutions:**

1. **File watcher limit (Linux)**
   ```bash
   # Increase file watcher limit
   echo fs.iwatch.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Restart dev server**
   ```bash
   # Stop current server
   # Then restart
   npm run dev
   ```

---

## Advanced Debugging

### Enable Verbose Logging

```bash
# Vite verbose mode
npm run dev -- --debug

# Check Node version
node --version

# Check npm version
npm --version
```

### Isolate the Problem

1. **Create minimal reproduction**
   - Comment out code until error disappears
   - Identify the specific line causing issues

2. **Check browser console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Use TypeScript strict mode**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true
     }
   }
   ```

### Common File-Specific Issues

#### App.tsx won't compile

1. Check default export exists
2. Verify no JSX syntax errors
3. Check all imports are valid
4. Ensure component returns valid JSX

#### index.css errors

1. Verify `@import 'tailwindcss';` is present
2. Check all CSS variables are defined
3. Ensure `@theme` block is complete
4. Validate OKLCH color values

#### Shadcn component errors

1. Check component is installed in `@/components/ui`
2. Verify correct import path
3. Check for version compatibility
4. Review component docs for required props

---

## Quick Reference Checklist

When you encounter an error:

- [ ] Read the complete error message
- [ ] Check the file and line number mentioned
- [ ] Review what you changed recently
- [ ] Clear cache: `rm -rf node_modules/.vite`
- [ ] Restart dev server
- [ ] Check for typos in imports/exports
- [ ] Verify all dependencies are installed
- [ ] Check TypeScript types match usage
- [ ] Look for missing default exports
- [ ] Validate CSS variable definitions
- [ ] Check browser console for runtime errors
- [ ] Try full reinstall: `rm -rf node_modules && npm install`

---

## Getting Help

If you're still stuck after trying these solutions:

1. **Copy the complete error message** - Include stack trace
2. **Note your Node version** - Run `node --version`
3. **List recent changes** - What did you modify?
4. **Check package versions** - Run `npm list --depth=0`
5. **Create a minimal reproduction** - Isolate the problem

Most build errors fall into these categories and can be solved by carefully reading the error message and checking the solutions above.
