# 🚨 Production Deployment Troubleshooting

Specific troubleshooting guide for issues that occur after deploying to production environments.

## 📑 Table of Contents

- [Pre-Deployment Verification](#pre-deployment-verification)
- [Hosting Platform Issues](#hosting-platform-issues)
- [SSL/HTTPS Problems](#sslhttps-problems)
- [CDN and Caching Issues](#cdn-and-caching-issues)
- [Data Persistence Issues](#data-persistence-issues)
- [Performance in Production](#performance-in-production)
- [Security Issues](#security-issues)
- [Domain and DNS Problems](#domain-and-dns-problems)
- [Monitoring and Logging](#monitoring-and-logging)

---

## ✅ Pre-Deployment Verification

### Before deploying, verify:

```bash
# 1. Build succeeds locally
npm run build

# 2. Preview works locally
npm run preview
# Open http://localhost:4173 and test all features

# 3. No console errors
# Open DevTools → Console (should be clean)

# 4. Check bundle size
ls -lh dist/assets/
# JS files should be < 500KB each
# CSS files should be < 100KB each
```

### Test locally before deploying:

- [ ] Login works
- [ ] All CRUD operations work
- [ ] Data persists after page refresh
- [ ] All pages/routes load correctly
- [ ] Images and icons display
- [ ] Forms submit correctly
- [ ] Exports (PDF) work
- [ ] No errors in console

---

## 🌐 Hosting Platform Issues

### Netlify

#### Issue: Build fails on Netlify

**Solutions:**

1. **Check Node version**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
   ```

2. **Verify build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: (leave empty)

3. **Check build logs**
   - Go to Deploys → Select failed deploy → View build log
   - Look for specific error messages

#### Issue: Deploy succeeds but site shows 404

**Solutions:**

1. **Create _redirects file**
   ```bash
   # public/_redirects
   /*    /index.html   200
   ```

2. **Or create netlify.toml**
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

---

### Vercel

#### Issue: Build fails on Vercel

**Solutions:**

1. **Check framework preset**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Set Node version**
   ```json
   // package.json
   {
     "engines": {
       "node": "18.x"
     }
   }
   ```

3. **Check environment variables**
   - Project Settings → Environment Variables
   - Add all VITE_ prefixed variables

#### Issue: Functions not working

**This app doesn't use Vercel Functions**, but if you added them:

1. Check functions are in correct directory
2. Verify CORS settings
3. Check function logs in dashboard

---

### GitHub Pages

#### Issue: Blank page on GitHub Pages

**Solutions:**

1. **Set correct base path**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     base: '/repository-name/'  // Your repo name
   })
   ```

2. **Rebuild with correct base**
   ```bash
   npm run build
   npm run deploy
   ```

3. **Check GitHub Pages settings**
   - Settings → Pages
   - Source: gh-pages branch
   - Folder: / (root)

#### Issue: 404 on routes

**GitHub Pages doesn't support SPA routing natively**

**Solution:** Add 404.html that redirects to index.html
```html
<!-- public/404.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='/'">
</head>
</html>
```

---

### VPS (Apache/Nginx)

#### Issue: 500 Internal Server Error

**Solutions:**

1. **Check Apache error logs**
   ```bash
   sudo tail -f /var/log/apache2/error.log
   ```

2. **Verify .htaccess syntax**
   ```bash
   # Test Apache config
   sudo apache2ctl configtest
   ```

3. **Check file permissions**
   ```bash
   # Files should be readable
   sudo chmod -R 755 /var/www/html/josimar-cell
   sudo chown -R www-data:www-data /var/www/html/josimar-cell
   ```

#### Issue: Nginx 403 Forbidden

**Solutions:**

1. **Check Nginx error logs**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Verify permissions**
   ```bash
   sudo chmod -R 755 /var/www/josimar-cell
   sudo chown -R www-data:www-data /var/www/josimar-cell
   ```

3. **Check Nginx config**
   ```bash
   # Test config
   sudo nginx -t
   
   # Reload if OK
   sudo systemctl reload nginx
   ```

4. **Verify root directive**
   ```nginx
   server {
     root /var/www/josimar-cell;  # Must point to dist folder
     index index.html;
   }
   ```

---

## 🔒 SSL/HTTPS Problems

### Issue: Mixed content errors

#### Symptom:
```
Mixed Content: The page at 'https://example.com' was loaded over HTTPS, 
but requested an insecure resource 'http://...'
```

**Solutions:**

1. **Use relative URLs**
   ```typescript
   // ❌ Wrong
   <img src="http://example.com/logo.png" />
   
   // ✅ Correct
   <img src="/logo.png" />
   ```

2. **Use HTTPS for external resources**
   ```html
   <!-- ✅ All external resources use HTTPS -->
   <link href="https://fonts.googleapis.com/css2?family=..." />
   ```

3. **Force HTTPS redirect (Apache)**
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

---

### Issue: SSL certificate not valid

**Solutions:**

1. **For Netlify/Vercel**
   - SSL is automatic - wait a few minutes after deployment
   - Check: Site settings → Domain management → HTTPS

2. **For VPS (Let's Encrypt)**
   ```bash
   # Install certbot
   sudo apt install certbot python3-certbot-apache
   # or for nginx:
   sudo apt install certbot python3-certbot-nginx
   
   # Get certificate
   sudo certbot --apache -d yourdomain.com
   # or for nginx:
   sudo certbot --nginx -d yourdomain.com
   
   # Auto-renewal test
   sudo certbot renew --dry-run
   ```

---

## 💾 CDN and Caching Issues

### Issue: Old version still showing after update

**Solutions:**

1. **Clear CDN cache**
   - **Netlify:** Deploys → Trigger deploy → Clear cache and deploy site
   - **Vercel:** Automatically handles cache invalidation
   - **Cloudflare:** Cache → Purge Everything

2. **Add cache busting to assets**
   ```typescript
   // Vite does this automatically with hash in filenames
   // index-a1b2c3d4.js
   // index-e5f6g7h8.css
   ```

3. **Set appropriate cache headers**
   
   **Nginx:**
   ```nginx
   location /assets/ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   
   location / {
     expires -1;
     add_header Cache-Control "no-cache, no-store, must-revalidate";
   }
   ```
   
   **Apache:**
   ```apache
   <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
     Header set Cache-Control "max-age=31536000, public, immutable"
   </FilesMatch>
   
   <FilesMatch "\.html$">
     Header set Cache-Control "no-cache, no-store, must-revalidate"
   </FilesMatch>
   ```

4. **Force browser cache clear**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Incognito/Private mode

---

### Issue: Assets return 304 but are outdated

**Solutions:**

1. **Check ETag headers**
   ```nginx
   # Nginx - disable ETag for HTML
   location = /index.html {
     add_header Cache-Control "no-cache";
     etag off;
   }
   ```

2. **Use versioned URLs**
   - Vite automatically adds content hashes
   - Example: `index-abc123.js` changes to `index-def456.js` when updated

---

## 💾 Data Persistence Issues

### Issue: Data not persisting in production

**Solutions:**

1. **Check browser storage**
   ```javascript
   // Open DevTools → Application → IndexedDB
   // Should see databases created by useKV
   ```

2. **Verify useKV is used correctly**
   ```typescript
   // ✅ Correct
   const [products, setProducts] = useKV<Product[]>('products', [])
   
   // ❌ Wrong - using localStorage
   localStorage.setItem('products', JSON.stringify(products))
   ```

3. **Check for storage quota errors**
   ```javascript
   // Console might show:
   // QuotaExceededError: The quota has been exceeded
   ```
   
   **Solution:** Clear old data or implement data cleanup

4. **Private browsing mode**
   - IndexedDB may not work in private/incognito mode
   - Inform users to use normal browsing mode

---

### Issue: Data lost on logout/refresh

**Solutions:**

1. **Don't clear storage on logout**
   ```typescript
   // ❌ Wrong
   const handleLogout = () => {
     localStorage.clear()  // This clears ALL data
     setCurrentUser(null)
   }
   
   // ✅ Correct
   const handleLogout = () => {
     setCurrentUser(null)  // Only clear user session
   }
   ```

2. **Use correct keys**
   ```typescript
   // Make sure keys are consistent
   const [products] = useKV('products', [])  // ✅ Consistent key
   const [products] = useKV('product-list', [])  // ❌ Different key = different data
   ```

---

## 🐌 Performance in Production

### Issue: Slow load times

**Solutions:**

1. **Enable compression**
   
   **Check if enabled:**
   ```bash
   curl -H "Accept-Encoding: gzip" -I https://yourdomain.com
   # Look for: Content-Encoding: gzip
   ```
   
   **Enable in Nginx:**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/javascript application/json;
   ```
   
   **Enable in Apache:**
   ```apache
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/css application/javascript
   </IfModule>
   ```

2. **Optimize images**
   ```bash
   # Use tools to compress images before deployment
   # Target: < 100KB per image
   ```

3. **Use CDN for static assets**
   - Netlify/Vercel have built-in CDN
   - For VPS, consider Cloudflare

4. **Check bundle size**
   ```bash
   npm run build
   ls -lh dist/assets/
   # If JS bundles > 500KB, consider code splitting
   ```

---

### Issue: High Time to Interactive (TTI)

**Solutions:**

1. **Lazy load heavy components**
   ```typescript
   import { lazy, Suspense } from 'react'
   
   const Dashboard = lazy(() => import('@/components/Dashboard'))
   
   function App() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <Dashboard />
       </Suspense>
     )
   }
   ```

2. **Defer non-critical JavaScript**
   ```html
   <script defer src="/analytics.js"></script>
   ```

3. **Preload critical resources**
   ```html
   <link rel="preload" href="/fonts/main-font.woff2" as="font" crossorigin>
   ```

---

## 🔐 Security Issues

### Issue: CORS errors in production

#### Symptom:
```
Access to fetch at 'https://api.example.com' has been blocked by CORS policy
```

**Note:** This app doesn't use external APIs by default, but if you added them:

**Solutions:**

1. **Configure CORS on API server**
   ```javascript
   // Express example
   app.use(cors({
     origin: 'https://yourdomain.com'
   }))
   ```

2. **Use proxy in development**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     server: {
       proxy: {
         '/api': 'http://localhost:3000'
       }
     }
   })
   ```

---

### Issue: XSS vulnerabilities

**Solutions:**

1. **Sanitize user input**
   ```typescript
   // React sanitizes by default, but be careful with dangerouslySetInnerHTML
   // ❌ Dangerous
   <div dangerouslySetInnerHTML={{__html: userInput}} />
   
   // ✅ Safe
   <div>{userInput}</div>
   ```

2. **Set security headers**
   
   **Nginx:**
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-Content-Type-Options "nosniff";
   add_header X-XSS-Protection "1; mode=block";
   ```
   
   **Netlify:**
   ```toml
   # netlify.toml
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "SAMEORIGIN"
       X-Content-Type-Options = "nosniff"
       X-XSS-Protection = "1; mode=block"
   ```

---

## 🌍 Domain and DNS Problems

### Issue: Domain not resolving

**Solutions:**

1. **Check DNS propagation**
   ```bash
   # Check DNS
   nslookup yourdomain.com
   
   # Or use online tool:
   # https://www.whatsmydns.net/
   ```

2. **Verify DNS records**
   ```
   Type: A
   Name: @ (or yourdomain.com)
   Value: Your server IP
   
   Type: CNAME
   Name: www
   Value: yourdomain.com
   ```

3. **Wait for propagation**
   - DNS changes can take 24-48 hours
   - Use incognito mode to avoid cache

---

### Issue: WWW vs non-WWW redirects

**Solutions:**

1. **Redirect www to non-www (Nginx)**
   ```nginx
   server {
     server_name www.yourdomain.com;
     return 301 https://yourdomain.com$request_uri;
   }
   ```

2. **Redirect non-www to www (Apache)**
   ```apache
   RewriteEngine On
   RewriteCond %{HTTP_HOST} ^yourdomain\.com [NC]
   RewriteRule ^(.*)$ https://www.yourdomain.com/$1 [L,R=301]
   ```

3. **For Netlify/Vercel**
   - Add both domains in settings
   - Set primary domain
   - Automatic redirect configured

---

## 📊 Monitoring and Logging

### Set up monitoring

1. **Browser errors**
   ```typescript
   // Add error boundary
   window.addEventListener('error', (event) => {
     console.error('Global error:', event.error)
     // Send to logging service
   })
   ```

2. **Server logs (VPS)**
   ```bash
   # Apache
   sudo tail -f /var/log/apache2/access.log
   sudo tail -f /var/log/apache2/error.log
   
   # Nginx
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Performance monitoring**
   ```typescript
   // Web Vitals
   if (window.PerformanceObserver) {
     new PerformanceObserver((list) => {
       list.getEntries().forEach((entry) => {
         console.log('Performance:', entry.name, entry.duration)
       })
     }).observe({ entryTypes: ['navigation', 'paint'] })
   }
   ```

---

### Common production error patterns

#### Error: "Script error"

**Cause:** CORS blocking error details from external scripts

**Solution:**
```html
<script src="external.js" crossorigin="anonymous"></script>
```

#### Error: "ResizeObserver loop limit exceeded"

**Cause:** Harmless warning from React/browser interaction

**Solution:** Safe to ignore, or add error handler:
```typescript
window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop limit exceeded') {
    e.stopPropagation()
  }
})
```

---

## 🆘 Production Emergency Checklist

If site is down:

- [ ] Check if server/hosting is online
- [ ] Check DNS is resolving
- [ ] Check SSL certificate is valid
- [ ] Check server logs for errors
- [ ] Check browser console for errors
- [ ] Try in incognito mode
- [ ] Try different browser
- [ ] Check recent deployments (rollback if needed)
- [ ] Clear CDN cache
- [ ] Verify files are uploaded correctly

---

## 📞 Escalation Steps

1. **Check status pages:**
   - Netlify: https://www.netlifystatus.com/
   - Vercel: https://www.vercel-status.com/
   - Cloudflare: https://www.cloudflarestatus.com/

2. **Contact support:**
   - Hosting provider support
   - DNS provider support
   - Domain registrar support

3. **Community resources:**
   - Stack Overflow
   - GitHub issues for specific packages
   - Platform-specific forums

---

## 🔗 Related Documentation

- [BUILD-TROUBLESHOOTING.md](BUILD-TROUBLESHOOTING.md) - Build-time errors
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md) - Pre-deployment checklist
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide

---

**Last Updated:** 2024  
**Version:** 1.0.0
