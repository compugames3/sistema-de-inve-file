# ⚡ Quick Reference - Deployment & Troubleshooting

Fast reference for common commands, fixes, and checks during deployment and troubleshooting.

---

## 🚀 Essential Commands

### Development
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (localhost:5173)
npm run preview          # Preview production build (localhost:4173)
```

### Production Build
```bash
npm run build            # Build for production (creates dist/)
npm run build -- --mode analyze  # Build with bundle analyzer
```

### Desktop App
```bash
npm run electron:dev              # Test desktop app
npm run electron:build:win        # Build Windows executable
npm run electron:build:mac        # Build macOS app
npm run electron:build:linux      # Build Linux app
```

### Troubleshooting
```bash
# Nuclear option - clean everything
rm -rf node_modules package-lock.json dist .vite
npm install
npm run build

# Clear only caches
rm -rf node_modules/.vite dist

# Check versions
node --version
npm --version

# List installed packages
npm list --depth=0

# Check for outdated packages
npm outdated
```

---

## 🔍 Quick Diagnostics

### Build Failing?
```bash
# 1. Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Clear caches
rm -rf .vite dist

# 3. Try build
npm run build

# 4. If still failing, check:
node --version    # Must be 18+
npm --version     # Must be 8+
```

### Deployment Not Working?
```bash
# 1. Test locally first
npm run build
npm run preview   # Open http://localhost:4173

# 2. Check dist/ contents
ls -R dist/
# Should see: index.html, assets/, icon.svg

# 3. Check file sizes
ls -lh dist/assets/
# JS should be < 500KB, CSS < 100KB
```

### Browser Issues?
```
1. F12 → Open DevTools
2. Console tab → Look for red errors
3. Network tab → Check for 404s
4. Application tab → Check IndexedDB
5. Hard refresh → Ctrl+Shift+R (Win) or Cmd+Shift+R (Mac)
```

---

## 🩹 Quick Fixes

### "npm not recognized"
```bash
# Install Node.js from https://nodejs.org/
# Restart terminal after installation
node --version
```

### "Cannot find module"
```bash
npm install
# If still failing, check import paths use @/ alias
```

### "Blank page after deploy"
```typescript
// vite.config.ts
export default defineConfig({
  base: '/'  // For root domain
  // OR
  base: '/app/'  // For subdirectory
})
```

### "404 for assets"
```bash
# Verify ALL dist/ files uploaded
# Check server config (see Server Configs section)
```

### "Build too slow"
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### "Data not persisting"
```typescript
// Always use functional updates with useKV
const [items, setItems] = useKV('items', [])

// ❌ Wrong
setItems([...items, newItem])

// ✅ Correct
setItems(current => [...current, newItem])
```

---

## 🌐 Server Configurations

### Apache (.htaccess)
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

### Nginx
```nginx
server {
  listen 80;
  server_name yourdomain.com;
  root /var/www/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Enable gzip
  gzip on;
  gzip_types text/plain text/css application/javascript;
}
```

### Netlify (_redirects in public/)
```
/*    /index.html   200
```

### Vercel (vercel.json)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🔐 SSL/HTTPS Quick Setup

### Let's Encrypt (VPS)
```bash
# Apache
sudo certbot --apache -d yourdomain.com

# Nginx
sudo certbot --nginx -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Netlify/Vercel
```
Automatic - wait 5-10 minutes after deployment
Check in dashboard: Domain settings → HTTPS
```

---

## 📦 File Upload Checklist

### What to Upload (from dist/)
- ✅ index.html
- ✅ assets/ (entire folder)
- ✅ icon.svg
- ✅ manifest.json
- ✅ Any other files in dist/

### What NOT to Upload
- ❌ node_modules/
- ❌ src/
- ❌ .env files
- ❌ package.json
- ❌ vite.config.ts
- ❌ Any config files

---

## 🎯 Hosting Platform Quick Setup

### Netlify (Easiest)
```
1. Drag dist/ folder to netlify.com
2. Done! (HTTPS automatic)

OR with Git:
Build command: npm run build
Publish directory: dist
```

### Vercel
```bash
npm install -g vercel
vercel
# Follow prompts
```

### GitHub Pages
```bash
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "npm run build && gh-pages -d dist"

npm run deploy
```

### VPS Upload
```bash
# Via SCP
scp -r dist/* user@server:/var/www/html/

# Via FTP
# Use FileZilla or similar
# Upload dist/ contents to public_html/
```

---

## 📊 Performance Checks

### Bundle Size
```bash
npm run build
ls -lh dist/assets/

# Target sizes:
# JS bundles: < 500KB each
# CSS bundles: < 100KB each
# Total dist/: < 5MB
```

### Load Speed
```
Test at: https://pagespeed.web.dev/
Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
```

### Compression Check
```bash
curl -H "Accept-Encoding: gzip" -I https://yourdomain.com
# Look for: Content-Encoding: gzip
```

---

## 🐛 Common Error Messages

### Build Errors
```
"Cannot find module" → npm install
"Out of memory" → NODE_OPTIONS=--max-old-space-size=4096
"Unknown at rule @tailwindcss" → Check index.css imports
"Type error" → Check TypeScript types
```

### Runtime Errors
```
"Cannot read property of undefined" → Add null checks (?.)
"Maximum update depth exceeded" → Don't setState in render
"404 Not Found" → Check server config for SPA routing
```

### Deployment Errors
```
"Blank page" → Check vite.config.ts base path
"Assets 404" → Verify server config and uploads
"Mixed content" → Use HTTPS for all resources
"CORS error" → Configure API server CORS
```

---

## 🆘 Emergency Contacts

### Documentation
- 🗺️ Start here: [TROUBLESHOOTING-INDEX.md](TROUBLESHOOTING-INDEX.md)
- 🔧 Build issues: [BUILD-TROUBLESHOOTING.md](BUILD-TROUBLESHOOTING.md)
- 🚨 Deploy issues: [PRODUCTION-TROUBLESHOOTING.md](PRODUCTION-TROUBLESHOOTING.md)
- ❓ FAQ: [DEPLOYMENT-FAQ.md](DEPLOYMENT-FAQ.md)

### Status Pages
- Netlify: https://www.netlifystatus.com/
- Vercel: https://www.vercel-status.com/
- Cloudflare: https://www.cloudflarestatus.com/

---

## 💡 Pro Tips

### Before Deploying
- ✅ Test with `npm run preview` first
- ✅ Check browser console (F12) for errors
- ✅ Test in incognito/private mode
- ✅ Review [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md)

### After Deploying
- ✅ Wait 2-5 minutes for DNS/SSL
- ✅ Test in multiple browsers
- ✅ Test on mobile device
- ✅ Hard refresh (Ctrl+Shift+R)

### For Desktop App
- ✅ Build web first: `npm run build`
- ✅ Then build desktop: `npm run electron:build:win`
- ✅ Test installer as normal user (not admin)
- ✅ Check antivirus doesn't block it

---

## 🔗 Quick Links

| Task | Document |
|------|----------|
| First deploy | [QUICKSTART.md](QUICKSTART.md) |
| Full guide | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Windows app | [WINDOWS-GUIDE.md](WINDOWS-GUIDE.md) |
| Pre-deploy check | [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md) |
| Troubleshooting hub | [TROUBLESHOOTING-INDEX.md](TROUBLESHOOTING-INDEX.md) |

---

**Print this page and keep it handy!** 📄

**Last Updated:** 2024 | **Version:** 1.0.0
