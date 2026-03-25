# ❓ Deployment & Production FAQ

Frequently asked questions about deploying and running the Josimar Cell Inventory System in production.

## 📑 Table of Contents

- [General Questions](#general-questions)
- [Build Questions](#build-questions)
- [Hosting Questions](#hosting-questions)
- [Domain & SSL Questions](#domain--ssl-questions)
- [Performance Questions](#performance-questions)
- [Desktop App Questions](#desktop-app-questions)
- [Data & Security Questions](#data--security-questions)
- [Cost Questions](#cost-questions)

---

## 🌐 General Questions

### Q: What's the difference between development and production?

**A:** 
- **Development** (`npm run dev`): 
  - Fast hot-reload
  - Detailed error messages
  - Unminified code for debugging
  - Runs on localhost
  
- **Production** (`npm run build`):
  - Optimized/minified code
  - Better performance
  - Smaller file sizes
  - Ready for hosting on internet

---

### Q: Can I use this app for free?

**A:** Yes! The app itself is free. Hosting costs depend on your choice:
- **Free options:** Netlify, Vercel, GitHub Pages, Cloudflare Pages
- **Paid options:** VPS ($5-20/month), Custom domain ($10-15/year)

---

### Q: Do I need a database server?

**A:** No! This app uses **browser storage** (IndexedDB) via the Spark KV system. All data is stored locally in the user's browser or in the desktop app. No external database needed.

---

### Q: Can multiple users access the same data?

**A:** 
- **Web version:** Each browser has independent data (isolated by device)
- **Desktop version:** Data is local to each computer
- **For shared data:** You would need to implement a backend API (not included by default)

---

### Q: Is the data stored securely?

**A:** 
- Data is stored in browser IndexedDB (web) or local files (desktop)
- **Passwords are stored in plain text** in the current version
- For production with sensitive data, consider implementing:
  - Password hashing (bcrypt)
  - Encryption for stored data
  - Backend authentication system

---

## 🏗️ Build Questions

### Q: Why does `npm run build` take so long?

**A:** Initial builds are slower because:
- TypeScript compilation
- CSS processing (Tailwind)
- Asset optimization
- Code minification

**Normal times:**
- First build: 30-60 seconds
- Subsequent builds: 15-30 seconds

If it's taking longer, see [BUILD-TROUBLESHOOTING.md](BUILD-TROUBLESHOOTING.md).

---

### Q: How big should my production bundle be?

**A:** Expected sizes:
- **Total dist/ folder:** ~2-5 MB
- **Main JS bundle:** ~200-500 KB (minified)
- **Main CSS bundle:** ~50-150 KB (minified)
- **Vendor chunks:** ~500KB-1MB (React, libraries)

If larger, you may have:
- Large images that need optimization
- Unused dependencies
- Missing tree-shaking

---

### Q: What files do I upload to my server?

**A:** Upload **everything** in the `dist/` folder:
```
dist/
├── index.html          ← Main HTML file
├── assets/             ← All JS, CSS, images
├── icon.svg           ← Favicon
└── manifest.json      ← PWA manifest
```

Do **not** upload:
- `node_modules/`
- `src/`
- `.env` files
- Config files (package.json, vite.config.ts, etc.)

---

### Q: Can I customize the build output?

**A:** Yes, edit `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    outDir: 'dist',              // Output directory
    assetsDir: 'assets',          // Assets subdirectory
    sourcemap: false,             // Set to true for debugging
    minify: 'terser',             // Minification method
    chunkSizeWarningLimit: 1000,  // Warning threshold (KB)
  }
})
```

---

## 🌍 Hosting Questions

### Q: Which hosting is easiest for beginners?

**A:** **Netlify** is the easiest:
1. Drag and drop `dist/` folder
2. Automatic HTTPS
3. Free custom domain support
4. No configuration needed

---

### Q: Which hosting is best for performance?

**A:** All these have excellent performance:
- **Vercel:** Global CDN, edge network
- **Netlify:** Global CDN, instant rollbacks
- **Cloudflare Pages:** Fastest CDN, DDoS protection

For this static app, performance differences are minimal.

---

### Q: Can I host on my own server?

**A:** Yes! You need:
- Web server (Apache or Nginx)
- SSH access
- Basic Linux knowledge

See [DEPLOYMENT.md](DEPLOYMENT.md) for VPS setup instructions.

---

### Q: What about hosting on shared hosting (cPanel)?

**A:** Yes, it works:
1. Build: `npm run build`
2. Upload `dist/` contents to `public_html/`
3. Add `.htaccess` for routing
4. Done!

```apache
# .htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

### Q: Can I use Docker?

**A:** Yes! Here's a basic Dockerfile:

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build
docker build -t josimar-cell .

# Run
docker run -p 80:80 josimar-cell
```

---

### Q: How do I update my deployed site?

**A:**

**For Netlify/Vercel (drag & drop):**
1. `npm run build`
2. Drag new `dist/` folder to dashboard
3. Wait for deployment (~30 seconds)

**For Netlify/Vercel (Git):**
1. Push to repository
2. Auto-deploys in ~1-2 minutes

**For VPS:**
1. `npm run build`
2. Upload `dist/` folder via FTP/SFTP
3. Replace old files

---

## 🔒 Domain & SSL Questions

### Q: Do I need a custom domain?

**A:** No! Free hosting gives you a subdomain:
- Netlify: `your-app.netlify.app`
- Vercel: `your-app.vercel.app`
- GitHub Pages: `username.github.io/repo-name`

Custom domains are optional (~$10-15/year).

---

### Q: How do I add a custom domain?

**A:**

**For Netlify:**
1. Site settings → Domain management
2. Add custom domain
3. Update DNS at domain registrar:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   ```
4. Wait 24-48 hours for DNS propagation

**For Vercel:**
1. Project settings → Domains
2. Add domain
3. Follow DNS instructions
4. Automatic HTTPS after verification

---

### Q: Is HTTPS/SSL included?

**A:** 
- **Netlify/Vercel/Cloudflare:** Automatic & free ✅
- **VPS:** Use Let's Encrypt (free):
  ```bash
  sudo certbot --nginx -d yourdomain.com
  ```
- **Shared hosting:** Usually included, check cPanel

---

### Q: How long does SSL setup take?

**A:**
- **Netlify/Vercel:** Instant to 5 minutes
- **Let's Encrypt (VPS):** ~2 minutes
- **Manual SSL:** Depends on provider

---

## ⚡ Performance Questions

### Q: How fast should my site load?

**A:** Target performance (on fast connection):
- **First load:** < 2 seconds
- **Cached load:** < 0.5 seconds
- **Lighthouse score:** 90+ (Good)

Test with:
- Chrome DevTools → Lighthouse
- https://pagespeed.web.dev/

---

### Q: Why is my site slow?

**A:** Common causes:
1. **No compression** → Enable gzip/brotli
2. **Large images** → Optimize before deploying
3. **No CDN** → Use Netlify/Vercel
4. **Slow server** → Upgrade hosting
5. **No caching** → Configure cache headers

See [PRODUCTION-TROUBLESHOOTING.md](PRODUCTION-TROUBLESHOOTING.md) for solutions.

---

### Q: How can I make it faster?

**A:**

**Easy wins:**
1. Use Netlify/Vercel (automatic CDN)
2. Enable compression (usually automatic)
3. Optimize images before importing

**Advanced:**
1. Lazy load heavy components
2. Code splitting
3. Preload critical resources
4. Use WebP images
5. Implement service worker (PWA)

---

### Q: Should I use a CDN?

**A:** 
- **Already using Netlify/Vercel?** CDN is built-in ✅
- **Using VPS?** Consider Cloudflare (free CDN)
- **Using shared hosting?** CDN adds minimal benefit

---

## 💻 Desktop App Questions

### Q: Can I make a Windows app from this?

**A:** Yes! Included:
```bash
npm run electron:build:win
```

Creates:
- Windows installer (.exe)
- Portable executable

---

### Q: Can I make a Mac or Linux app?

**A:** Yes:
```bash
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

**Note:** Best to build on target platform (Mac app on Mac, etc.)

---

### Q: How big is the desktop executable?

**A:** 
- **Installer:** ~80-150 MB
- **Portable:** ~80-150 MB
- **Installed size:** ~200-300 MB

This includes the Chromium engine (required for Electron).

---

### Q: Does the desktop app need internet?

**A:** No! The desktop app:
- Runs 100% offline
- Stores data locally
- No internet required after installation

---

### Q: Can I distribute the desktop app?

**A:** Yes! You can:
- Share the installer (.exe)
- Upload to file sharing site
- Distribute on USB drives
- Host on your website

**Note:** Windows may show "Unknown Publisher" warning. Code signing ($100-300/year) removes this.

---

### Q: How do users update the desktop app?

**A:** Current version requires:
1. Download new .exe
2. Run installer (overwrites old version)
3. Data persists during update

Auto-update can be implemented with electron-updater (not included by default).

---

## 🔐 Data & Security Questions

### Q: Where is data stored?

**A:**
- **Web:** Browser IndexedDB (local to device)
- **Desktop:** Local files in app data folder:
  - Windows: `%APPDATA%/Josimar Cell/`
  - Mac: `~/Library/Application Support/Josimar Cell/`
  - Linux: `~/.config/Josimar Cell/`

---

### Q: Is data backed up automatically?

**A:** No. Data is only stored locally. Users should:
- Export data regularly
- Keep backups of desktop app data folder
- Consider implementing export/import features

---

### Q: Can I add user authentication?

**A:** Current version has **basic local authentication**:
- Usernames/passwords stored locally
- No server verification
- Suitable for single-user or trusted environments

For real authentication, you'd need:
- Backend server (Node.js, Python, etc.)
- Database (PostgreSQL, MongoDB, etc.)
- JWT or session management
- Password hashing (bcrypt)

---

### Q: Is it safe for sensitive business data?

**A:** Current version:
- ✅ Good for: Internal use, trusted users
- ❌ Not ideal for: Public internet, untrusted users, sensitive data

**Security improvements needed for production:**
- Password hashing
- Data encryption
- HTTPS enforcement
- Session timeouts
- Audit logging
- Access control

---

### Q: Can data be synced between devices?

**A:** Not by default. Each device/browser has independent data.

To implement sync, you'd need:
- Backend API
- Database
- Sync logic

---

## 💰 Cost Questions

### Q: How much does deployment cost?

**A:**

**Free options:**
- Netlify: Free tier (100 GB bandwidth/month)
- Vercel: Free tier (100 GB bandwidth/month)
- GitHub Pages: Free (soft limit 100 GB bandwidth/month)
- Cloudflare Pages: Free (unlimited bandwidth)

**Paid options:**
- VPS: $5-20/month (DigitalOcean, Linode, Vultr)
- Shared hosting: $3-10/month
- Custom domain: $10-15/year

---

### Q: When do I need to upgrade from free hosting?

**A:** Free tier limits:

**Netlify Free:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Good for: ~10,000-50,000 visitors/month

**Vercel Free:**
- 100 GB bandwidth/month
- 100 builds/day
- Good for: ~10,000-50,000 visitors/month

**Cloudflare Pages:**
- Unlimited bandwidth (!)
- 500 builds/month
- Good for: Any traffic level

---

### Q: What are ongoing costs?

**A:**

**Minimal setup:**
- Hosting: $0 (free tier)
- Domain: $10-15/year (optional)
- **Total: $0-15/year**

**Professional setup:**
- Hosting: $5-20/month (VPS)
- Domain: $10-15/year
- SSL: $0 (Let's Encrypt)
- **Total: $70-255/year**

---

### Q: Can I monetize or sell this app?

**A:** Check the LICENSE file. Generally:
- You can use it for your business
- Modifications are yours
- Selling as-is may have restrictions

---

## 🆘 Quick Answers

### Q: Site shows blank page after deploy
**A:** Check `vite.config.ts` base path and verify all `dist/` files uploaded.

### Q: Assets return 404
**A:** Configure server for SPA routing (see [DEPLOYMENT.md](DEPLOYMENT.md)).

### Q: Login doesn't work in production
**A:** Check browser console for errors. Data persistence requires IndexedDB support.

### Q: Changes don't appear after deploy
**A:** Clear CDN cache and hard refresh browser (Ctrl+Shift+R).

### Q: Desktop app won't install
**A:** Run as administrator, disable antivirus temporarily.

### Q: Site is slow
**A:** Enable compression, use CDN (Netlify/Vercel), optimize images.

### Q: Data disappeared
**A:** Check if browser cleared storage. IndexedDB can be cleared by user/browser.

### Q: SSL not working
**A:** Wait a few minutes after deployment. Check hosting dashboard for SSL status.

---

## 📚 More Help

- **Build errors:** [BUILD-TROUBLESHOOTING.md](BUILD-TROUBLESHOOTING.md)
- **Production errors:** [PRODUCTION-TROUBLESHOOTING.md](PRODUCTION-TROUBLESHOOTING.md)
- **Deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Quick start:** [QUICKSTART.md](QUICKSTART.md)
- **Windows specific:** [WINDOWS-GUIDE.md](WINDOWS-GUIDE.md)

---

## 🤔 Didn't find your question?

1. Check the related documentation above
2. Search GitHub issues
3. Check browser console for specific errors
4. Review server/hosting logs

---

**Last Updated:** 2024  
**Version:** 1.0.0
