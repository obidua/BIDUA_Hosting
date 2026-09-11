# BIDUA Hosting — Complete Deployment Guide

> Server: `172.105.123.229` (Linode, Ubuntu 22.04)  
> Domain: `biduahosting.com`  
> Last Updated: **2026-09-12**

---

## 🔴 TOP 10 DEPLOYMENT PITFALLS (Read Before Every Deploy!)

| # | Pitfall | Symptom | Prevention |
|---|---------|---------|------------|
| **1** | **`VITE_API_URL` = localhost** | Calculator/Pricing pe `Failed to fetch` | Build se pehle `grep VITE_API_URL .env` karo — `https://biduahosting.com` hona chahiye |
| **2** | **Function define se pehle use** | `orgJsonLd is not defined` / `ArrowRight is not defined` | Yaad rakho: pehle define, phir use karo |
| **3** | **Browser purana cache** | Deploy ke baad bhi old UI dikhega | Hard refresh: `Cmd+Shift+R` + Cloudflare cache purge |
| **4** | **`.env` file git me ghus jaaye** | GitHub push reject (Push Protection) | `.env` files `.gitignore` me hona chahiye |
| **5** | **Frontend dist sirf Docker me, nginx pe nahi** | Nginx 404 dega ya purana content serve karega | `rsync` karke nginx ke dist folder me copy karo + `nginx -s reload` |
| **6** | **Cloudflare cache API responses** | Price updates reflect nahi hoti | CF Dashboard → Caching → Purge Everything |
| **7** | **Service Worker purana content serve kare** | Deploy ke bhi old page load ho | SW.js me cache-busting version update |
| **8** | **Nginx `/api/` location missing** | `/api/` calls `index.html` return kare | Nginx config me `location /api/` block verify karo |
| **9** | **JS bundle 4hr cache (max-age=14400)** | Browser purana JS use karta hai | HTML ke liye `no-cache`, JS ke liye versioned filename |
| **10** | **Database sync direction galat** | Production data local pe overwrite ho | Hamesha pehle backup lo, phir sync karo |

---

## 🚀 Quick Deploy Checklist (Copy-Paste Ready)

```bash
# ===== STEP 1: Pre-flight Checks (LOCAL MACHINE) =====
cd "/Users/dev/Downloads/Dev Folder/BIDUA Industries/BIDUA Hosting/BIDUA Hostin Live/BIDUA Hosting/BIDUA_Hosting-main"

# CRITICAL #1: Verify .env has PRODUCTION URL
grep VITE_API_URL .env
# MUST show: VITE_API_URL=https://biduahosting.com
# If it shows localhost:8000 → FIX IT FIRST (see Pitfall #1)

# CRITICAL #2: Verify nginx API proxy is configured
ssh root@172.105.123.229 'grep -A5 "location /api/" /etc/nginx/sites-enabled/biduahosting.com'
# MUST show: proxy_pass http://127.0.0.1:8000

# ===== STEP 2: Build Frontend =====
npm run build
# Wait for "build complete" — should take ~5-10 seconds
# Output: dist/assets/index-XXXXX.js (new hash each build)

# ===== STEP 3: Deploy to Server =====
# Backup old dist (rollback ke liye)
ssh root@172.105.123.229 'mv /var/www/biduahostingful/Hosting/hostingfrontend/dist /var/www/biduahostingful/Hosting/hostingfrontend/dist_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null; echo "backup done"'

# Push new build
rsync -az --delete -e ssh dist/ root@172.105.123.229:/var/www/biduahostingful/Hosting/hostingfrontend/dist/

# Reload nginx
ssh root@172.105.123.229 'nginx -s reload'

# ===== STEP 4: Purge Cloudflare Cache (IF configured) =====
# Agar Cloudflare use kar rahe ho:
# Option A: CF Dashboard → Caching → Configuration → Purge Everything
# Option B: CF API call (agar token hai)
# curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
#   -H "Authorization: Bearer {api_token}" \
#   -H "Content-Type: application/json" \
#   --data '{"purge_everything":true}'

# ===== STEP 5: Verify (wait 30s for propagation) =====
sleep 30
curl -s -o /dev/null -w '%{http_code}' https://biduahosting.com/ && echo ' home'
curl -s -o /dev/null -w '%{http_code}' https://biduahosting.com/api/v1/pricing/plans && echo ' api'
curl -s https://biduahosting.com/api/v1/pricing/plans | head -c 100

# Verify new bundle is served
NEW_JS=$(curl -s -A 'Mozilla/5.0' 'https://biduahosting.com/' | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1)
echo "Live bundle: $NEW_JS"
curl -s "https://biduahosting.com/assets/$NEW_JS" | grep -oE 'orgJsonLd|faqJsonLd|ArrowRight' | sort | uniq -c

# ===== STEP 6: Browser Test =====
# Open https://biduahosting.com
# HARD REFRESH: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Check:
#   ✓ Home page loads (no white screen, no errors)
#   ✓ /pricing shows prices
#   ✓ /calculator loads plans (no "Failed to fetch")
#   ✓ /contact shows GSTIN + Noida address
#   ✓ Footer shows official details
```

---

## 🔴 Runtime Errors & Quick Fixes

### Error: `orgJsonLd is not defined` or `ArrowRight is not defined`
**Cause:** Unnamed export or missing function in React component  
**Fix:** Every function/component used in JSX must be exported or defined BEFORE use:
```tsx
// ✅ CORRECT — define before use
const orgJsonLd = () => ({ ... });
function Home() {
  return <script>{JSON.stringify(orgJsonLd())}</script>;
}

// ❌ WRONG — using before defining
function Home() {
  return <script>{JSON.stringify(orgJsonLd())}</script>; // ERROR!
}
const orgJsonLd = () => ({ ... });
```

### Error: `Failed to fetch` on Calculator/Pricing pages
**Cause:** Browser cached old JS bundle OR `VITE_API_URL` still pointing to localhost  
**Fix (try in order):**
1. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. If still failing → check `.env` has `VITE_API_URL=https://biduahosting.com`
3. Rebuild + redeploy (see Quick Deploy Checklist above)

### Error: White screen / "Something went wrong"
**Cause:** Build failed OR error in React component  
**Fix:**
```bash
# Check browser console (F12 → Console) for exact error
# Common causes:
#   - Missing import (component not imported)
#   - Undefined variable (typo in variable name)
#   - Missing export (function not exported from file)
```

### Error: API returns HTML instead of JSON
**Cause:** Nginx not proxying `/api/` to backend  
**Fix:**
```bash
ssh root@172.105.123.229
cat /etc/nginx/sites-enabled/biduahosting.com | grep -A10 "location /api"
# Should show: proxy_pass http://127.0.0.1:8000
# If missing → re-add the location block, then:
nginx -t && nginx -s reload
```

---

## 🔄 Rollback Procedure

### Rollback Frontend (instant):
```bash
ssh root@172.105.123.229
# List backups
ls -lt /var/www/biduahostingful/Hosting/hostingfrontend/dist_backup_* | head -3
# Restore latest backup
rm -rf /var/www/biduahostingful/Hosting/hostingfrontend/dist
mv /var/www/biduahostingful/Hosting/hostingfrontend/dist_backup_YYYYMMDD_HHMMSS /var/www/biduahostingful/Hosting/hostingfrontend/dist
nginx -s reload
echo "✅ Frontend rolled back"
```

### Rollback Database:
```bash
ssh root@172.105.123.229
# Restore from backup
docker exec biduahosting-db-1 psql -U postgres ramaerahostingdb < /root/backup_pricing_20260911/db_backup.sql
```

### Rollback Backend:
```bash
ssh root@172.105.123.229
cd /var/www/biduahostingful/Hosting/hostingbackend
# Revert git
git log --oneline -5
git revert HEAD  # or git reset --hard <commit-hash>
# Restart
docker compose restart backend
```

---

## 🔄 Rollback Procedure

### Rollback Frontend (instant):
```bash
ssh root@172.105.123.229
# List backups
ls -lt /var/www/biduahostingful/Hosting/hostingfrontend/dist_backup_* | head -3
# Restore latest backup
rm -rf /var/www/biduahostingful/Hosting/hostingfrontend/dist
mv /var/www/biduahostingful/Hosting/hostingfrontend/dist_backup_YYYYMMDD_HHMMSS /var/www/biduahostingful/Hosting/hostingfrontend/dist
nginx -s reload
echo "✅ Frontend rolled back"
```

### Rollback Database:
```bash
ssh root@172.105.123.229
# Restore from backup
docker exec biduahosting-db-1 psql -U postgres ramaerahostingdb < /root/backup_pricing_20260911/db_backup.sql
```

### Rollback Backend:
```bash
ssh root@172.105.123.229
cd /var/www/biduahostingful/Hosting/hostingbackend
# Revert git
git log --oneline -5
git revert HEAD  # or git reset --hard <commit-hash>
# Restart
docker compose restart backend
```

---

```
┌─────────────────────────────────────────────────────────┐
│                    USERS / BROWSERS                      │
│                   biduahosting.com                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              NGINX (Host Machine)                        │
│   SSL termination, static file serving, reverse proxy    │
│                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │ biduahosting │  │ api.ramaerah │  │ coupon-nginx │  │
│   │ .com-server  │  │ osting.com   │  │ :8080/:8443  │  │
│   │ (frontend)   │  │ (backend API)│  │ (other site) │  │
│   └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
└─────────┼─────────────────┼─────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│  Static dist/    │  │  Docker Compose  │
│  folder on host  │  │  biduahosting    │
│  (nginx serves)  │  │                  │
│                  │  │  ┌─────────────┐ │
│  /var/www/       │  │  │frontend:3000 │ │
│  biduahostingful/│  │  │backend:8000  │ │
│  Hosting/        │  │  │pgbouncer     │ │
│  hostingfrontend/│  │  │db:5432       │ │
│  dist/           │  │  └─────────────┘ │
└─────────────────┘  └─────────────────┘
```

**IMPORTANT:** Nginx serves frontend from **static dist folder on host** (`/var/www/biduahostingful/Hosting/hostingfrontend/dist/`), NOT from Docker container. Backend API is proxied from nginx to Docker container.

---

## 📁 Directory Structure

```
/var/www/biduahostingful/Hosting/
├── hostingfrontend/              # React + Vite Frontend
│   ├── dist/                     # ← NGINX SERVES THIS FOLDER
---

## ⚠️ CRITICAL: Common Pitfalls & Gotchas

> **Read this section BEFORE deploying** — these issues cost hours of debugging. Every mistake here has been made and fixed already.

### 🔴 Pitfall #1: VITE_API_URL Must Be Production URL

**THE #1 MISTAKE — causes "Failed to fetch" on all API calls in production.**

**Wrong** (in `.env`):
```
VITE_API_URL=http://localhost:8000
```
This gets baked INTO the production JS bundle. Every user's browser tries to connect to `localhost:8000` on THEIR machine → fails.

**Correct**:
```
VITE_API_URL=https://biduahosting.com
```

**How to verify build is correct**:
```bash
# After `npm run build`, check the bundle for localhost references
grep -r "localhost:8000" dist/assets/*.js | head -5
# Should return NOTHING (or only in comments/docs, not actual API calls)
```

**If you messed up**:
1. Fix `.env` to production URL
2. Rebuild: `npm run build`
3. Re-deploy: `rsync -az dist/ root@172.105.123.229:/var/www/biduahostingful/Hosting/hostingfrontend/dist/`

---

### 🔴 Pitfall #2: Nginx Must Proxy /api/ to Backend

**Symptom**: API calls via domain return HTML (SPA fallback) instead of JSON. Backend works on `localhost:8000` but not via domain.

**Root cause**: Missing `/api/` location block in nginx config.

**Fix** — nginx config MUST have this block inside `server { ... }`:
```nginx
# API Backend Proxy
location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # CORS headers (if not set by backend)
    add_header Access-Control-Allow-Origin "https://biduahosting.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    
    # Handle preflight
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

**How to verify**:
```bash
# Via domain — should return JSON, not HTML
curl -s 'https://biduahosting.com/api/v1/pricing/plans' | head -c 100
# Should show: {"plans":[{"name":"G.4GB",...

# Via localhost — should also work
curl -s 'http://127.0.0.1:8000/api/v1/pricing/plans' | head -c 100
```

---

### 🔴 Pitfall #3: Browser Cache Serves Old JS After Deploy

**Symptom**: You deployed new code, but users still see old prices, old errors, or `ReferenceError: ArrowRight is not defined`.

**Root cause**: Browser caches `index.html` + old JS bundle cached for 4+ hours.

**Fix — Add no-cache headers in nginx**:
```nginx
# HTML files — NEVER cache (always fetch fresh)
location ~* \.html$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
}

# JS/CSS bundles — cache with versioned filenames (1 year is fine)
location ~* \.(js|css)$ {
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}
```

**User-side fix**: After ANY deploy, tell users to do **HARD REFRESH**:
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mobile**: Clear browser cache in settings
│   │   ├── index.html
---

### 🔴 Pitfall #4: Nginx Serves Static dist/, Not Docker Container

**Symptom**: You rebuild Docker container, but website doesn't change.

**Why**: Nginx points to `/var/www/biduahostingful/Hosting/hostingfrontend/dist/` (static folder), NOT to the Docker container (port 3000).

**Correct deployment flow**:
```bash
# 1. Build locally (with correct VITE_API_URL)
cd BIDUA_Hosting-main
npm run build

# 2. Sync to server static folder
rsync -az --delete dist/ root@172.105.123.229:/var/www/biduahostingful/Hosting/hostingfrontend/dist/

# 3. Reload nginx (not docker restart!)
ssh root@172.105.123.229 'nginx -s reload'
```

**DO NOT** just `docker compose up -d` and expect frontend changes — that rebuilds the container but nginx doesn't use it.

---

### 🔴 Pitfall #5: GitHub Push Protection Blocks Secrets

**Symptom**: `push declined due to repository rule violations` / `GH013: Repository rule violations`

**Why**: `.env` files with API keys accidentally committed.

**Fix**:
```bash
# Remove from git tracking (keeps local file)
git rm --cached .env .env.server.production

# Add to .gitignore
echo '.env' >> .gitignore
echo '.env.server.production' >> .gitignore

# Amend last commit
git add .gitignore
git commit --amend --no-edit
git push
```

**NEVER** commit files containing:
- API keys (Razorpay, Sendinblue, JWT secret)
- Database passwords
- Private keys

---

### 🔴 Pitfall #6: Build Environment Variables Not Set

**Symptom**: Build succeeds but features don't work, or prices are wrong.

**Check before EVERY build**:
```bash
# Verify .env has correct values
cat .env
# Should show:
# VITE_API_URL=https://biduahosting.com
# VITE_RAZORPAY_KEY_ID=rzp_live_XXXXX  (for production)
```

**For backend** (`hostingbackend/.env`):
```bash
# Verify production settings
cat .env
# Should show:
# DATABASE_URL=postgresql+asyncpg://...
# RAZORPAY_KEY_ID=rzp_live_XXXXX
# CORS_ORIGINS=["https://biduahosting.com"]
```

---

### 🔴 Pitfall #7: Service Worker Caching Stale Content

**Symptom**: Site works for new users but existing users see old version.

**Fix**: Update the service worker file to force cache clear:
```javascript
// In sw.js or service worker registration
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Activate new SW immediately
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName); // Clear all old caches
                })
            );
        })
    );
    self.clients.claim(); // Take control of all open pages
});
```

**Quick fix**: Users can open DevTools → Application → Service Workers → Click "Unregister" → Refresh.

---

### 🔴 Pitfall #8: Forgetting to Reload Nginx After Config Change

**Symptom**: Changed nginx config but nothing happens.

**Always run after config changes**:
```bash
# Test config validity
ssh root@172.105.123.229 'nginx -t'

# If valid, reload
ssh root@172.105.123.229 'nginx -s reload'
```

**If nginx -t fails**: Check for typos, missing semicolons, or wrong paths.

---

### 🔴 Pitfall #9: Database Not Synced After Local Changes

**Symptom**: Local has correct prices, production still shows old prices.

**Fix**: Re-run the pricing update script:
```bash
# SSH to server
ssh root@172.105.123.229

# Re-run pricing update (adjust SQL as needed)
cd /var/www/biduahostingful/Hosting/hostingbackend
docker exec -i biduahosting-db-1 psql -U postgres -d ramaerahostingdb -c "
    UPDATE hosting_plans SET monthly_price = monthly_price * 1.2;
"
```

---

### ✅ Pre-Deploy Checklist

Use this before EVERY deploy:

- [ ] `.env` has `VITE_API_URL=https://biduahosting.com` (not localhost)
- [ ] `npm run build` succeeds with no errors
- [ ] No `localhost` in built JS bundles (`grep -r "localhost" dist/`)
- [ ] Nginx config tested (`nginx -t` passes)
- [ ] Backend containers running (`docker ps | grep bidua`)
- [ ] Database backed up (`pg_dump` to file)
- [ ] Frontend `dist/` backed up on server
- [ ] Git committed and pushed (with no secrets)
- [ ] Told users to hard refresh after deploy
│   │   └── assets/
│   │       ├── index-XXX.js      # Main JS bundle
│   │       └── index-XXX.css     # Styles
│   ├── src/                      # React source code
│   ├── public/                   # Static assets (favicon, etc.)
│   ├── .env                      # Frontend env (API URL, Razorpay key)
│   ├── Dockerfile                # Frontend Docker build
│   ├── nginx.conf                # Frontend container nginx config
│   ├── vite.config.ts            # Vite build config
│   └── package.json
│
├── hostingbackend/               # FastAPI Python Backend
│   ├── app/                      # Main application
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── api/v1/               # API routes
│   │   ├── services/             # Business logic
│   │   ├── models/               # Database models
│   │   └── schemas/              # Pydantic schemas
│   ├── alembic/                  # Database migrations
│   ├── docker-compose.yml        # Docker Compose (frontend+backend+db)
│   ├── Dockerfile                # Backend Docker build
│   ├── .env                      # Backend env (DB credentials, keys)
│   ├── requirements.txt          # Python dependencies
│   └── venv/                     # Python virtual environment
│
├── api.ramaerahosting.com.nginx.conf  # API subdomain nginx config
└── README.md
```

---

## 🐳 Docker Containers

### Container Stack

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| `biduahosting-frontend-1` | `biduahosting-frontend` | 3000 | React frontend (nginx) |
| `biduahosting-backend-1` | `biduahosting-backend` | 8000 | FastAPI backend |
| `biduahosting-pgbouncer-1` | `edoburu/pgbouncer` | 6432 | PostgreSQL connection pooler |
| `biduahosting-db-1` | `postgres:13` | 5432 | PostgreSQL database |
| `coupon-nginx` | `nginx:1.27-alpine` | 8080/8443 | Other project (coupon) |

### Key Docker Commands

```bash
# View all containers
docker ps

# View logs
docker logs biduahosting-backend-1 -f
docker logs biduahosting-frontend-1 -f

# Restart a container
docker compose -f /var/www/biduahostingful/Hosting/hostingbackend/docker-compose.yml restart backend

# Full rebuild and restart
cd /var/www/biduahostingful/Hosting/hostingbackend
docker compose down
docker compose build --no-cache
docker compose up -d
```


---

## 🌐 Nginx Configuration

### Frontend (biduahosting.com)
**File:** `/etc/nginx/sites-enabled/biduahosting.com-server`

```nginx
server {
    server_name www.biduahosting.com biduahosting.com;

    # IMPORTANT: Serves static dist folder directly
    root /var/www/biduahostingful/Hosting/hostingfrontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/biduahosting.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/biduahosting.com/privkey.pem;
}
```

### Backend API (api.ramaerahosting.com)
**File:** `/etc/nginx/sites-enabled/api.ramaerahosting.com-server`

Proxies requests to Docker backend container at `http://127.0.0.1:8000`

### Nginx Management

```bash
# Test nginx config
nginx -t

# Reload nginx (after config changes)
systemctl reload nginx

# Restart nginx
systemctl restart nginx
```

---

## 🚀 Deployment Workflow

### Frontend Deployment

**CRITICAL:** Nginx serves the static `dist/` folder, NOT the Docker container.
You MUST build locally and copy the `dist/` folder to the server.

#### Step 1: Build Locally

```bash
cd "/Users/dev/Downloads/Dev Folder/BIDUA Industries/BIDUA Hosting/BIDUA Hostin Live/BIDUA Hosting/BIDUA_Hosting-main"

# Build for production
npm run build
```

#### Step 2: Deploy to Server

```bash
# Backup old dist on server
ssh root@172.105.123.229 'mv /var/www/biduahostingful/Hosting/hostingfrontend/dist /var/www/biduahostingful/Hosting/hostingfrontend/dist_backup_$(date +%Y%m%d)'

# Copy new dist to server
rsync -az --delete dist/ root@172.105.123.229:/var/www/biduahostingful/Hosting/hostingfrontend/dist/
```

#### Step 3: Verify

```bash
# Check live bundle
curl -s 'https://biduahosting.com/' | grep -oE 'index-[A-Za-z0-9_-]+\.js'

# Verify content

---

## 💰 Price Update Workflow

### Update Process
1. **VMHoster Prices** → Get from https://vmhoster.com/cloud-solution.php
2. **Apply Markup** → Multiply by 1.2 (20% increase)
3. **Update Database** → Run SQL UPDATE
4. **Deploy** → Frontend/backend automatically pick up new prices

### Database Price Update SQL

```sql
-- Example: Update G.8GB plan (VMHoster price + 20%)
UPDATE hosting_plans SET
    monthly_price = 3112.42,      -- VMHoster monthly * 1.2
    quarterly_price = 9336.00,    -- VMHoster quarterly * 1.2
    semiannual_price = 18672.00,  -- VMHoster semi-annual * 1.2
    annual_price = 44352.00,      -- VMHoster annual * 1.2
    biennial_price = 88704.00,    -- VMHoster biennial * 1.2
    triennial_price = 133056.00   -- VMHoster triennial * 1.2
WHERE name = 'G.8GB';

-- Verify
SELECT name, monthly_price, annual_price FROM hosting_plans ORDER BY name;
```

### Database Access

```bash
# Connect to database via Docker
ssh root@172.105.123.229
docker exec -it biduahosting-db-1 psql -U postgres -d ramaerahostingdb

# Or locally (if synced)
psql -h localhost -p 5433 -U apple -d ramaera_hosting
```

### Price Display Logic
- **Market Price** = DB `monthly_price` (strikethrough)
- **Discount**: Monthly 5%, Quarterly 10%, Semi-Annual 15%, Annual 20%, Biennial 25%, Triennial 35%
- **Final Price** = Market Price - Discount (= VMHoster + 20%)

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
POSTGRES_USER=ramaerahostinguser
POSTGRES_DB=ramaerahostingdb
DATABASE_URL=postgresql+asyncpg://ramaerahostinguser:RamaeraHosting_12_34_56@pgbouncer:5432/ramaerahostingdb

# Auth
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SECRET_KEY=your-super-secret-jwt-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_RjxYXvnP7x3l4V
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email (Brevo/Sendinblue)
SENDINBLUE_API_KEY=your_sendinblue_key

# CORS
CORS_ORIGINS=https://biduahosting.com,https://www.biduahosting.com
```

### Frontend (.env)

```env
VITE_API_URL=https://api.ramaerahosting.com
VITE_RAZORPAY_KEY_ID=rzp_test_RjxYXvnP7x3l4V
```

---


---

## 🔄 Git Workflow

### Repository
- **URL:** https://github.com/obidua/BIDUA_Hosting.git
- **Branch:** `main`

### Push Changes

```bash
cd "/Users/dev/Downloads/Dev Folder/BIDUA Industries/BIDUA Hosting/BIDUA Hostin Live/BIDUA Hosting"

# Stage all changes
git add -A

# Commit
git commit -m "Description of changes"

# Push
git push origin main
```

### Pull on Server

```bash
ssh root@172.105.123.229
cd /var/www/biduahostingful/Hosting
git pull origin main

# Then redeploy as needed
```

---

## 📋 Useful Commands

### Server Login
```bash
ssh root@172.105.123.229
```

### Docker Management

```bash
# All containers
docker ps -a

# Container logs
docker logs biduahosting-backend-1 --tail 100 -f

# Container stats
docker stats

# Restart all
cd /var/www/biduahostingful/Hosting/hostingbackend
docker compose restart

# Rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Database Management

```bash
# Backup
docker exec biduahosting-db-1 pg_dump -U postgres ramaerahostingdb > backup_$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker exec -i biduahosting-db-1 psql -U postgres -d ramaerahostingdb

# Connect
docker exec -it biduahosting-db-1 psql -U postgres -d ramaerahostingdb

# Query
docker exec biduahosting-db-1 psql -U postgres -d ramaerahostingdb -c "SELECT name, monthly_price FROM hosting_plans LIMIT 5;"
```

### Database Sync (Server → Local)

```bash
# Dump from server
ssh root@172.105.123.229 "docker exec biduahosting-db-1 pg_dump -U postgres ramaerahostingdb" > prod_dump.sql

# Restore locally
psql -h localhost -p 5433 -U apple -d ramaera_hosting -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -h localhost -p 5433 -U apple -d ramaera_hosting -f prod_dump.sql
```

### Nginx Management

```bash
# Test config
nginx -t

# Reload (no downtime)
systemctl reload nginx

# View error log
tail -f /var/log/nginx/error.log

# View access log
tail -f /var/log/nginx/access.log
```

### SSL Certificate (Let's Encrypt)

```bash
# Renew certificates
certbot renew

# View certificates
certbot certificates
```

---

## 🔍 Health Checks

### Backend Health

```bash
# Local
curl http://127.0.0.1:8000/health

# Live (via nginx API subdomain)
curl https://api.ramaerahosting.com/health

# Pricing endpoint
curl https://api.ramaerahosting.com/api/v1/pricing/plans
```

### Frontend Health

```bash
# HTTP (redirects to HTTPS)
curl -I https://biduahosting.com/

# HTTPS
curl -s https://biduahosting.com/ | head -20
```

### Full System Check

```bash
ssh root@172.105.123.229
echo "=== CONTAINERS ==="
docker ps --format "{{.Names}}: {{.Status}}"
echo "=== NGINX ==="
systemctl is-active nginx
echo "=== SSL ==="
certbot certificates 2>/dev/null | grep -E "Expiry|Domains"
echo "=== DISK ==="
df -h /
echo "=== UPTIME ==="
uptime
```

---

## 🛠️ Troubleshooting

### Issue: Changes Not Reflecting on Live Site
**Cause:** Nginx serves static `dist/` folder, not Docker container.
**Fix:**
```bash
# Rebuild and redeploy dist
npm run build
rsync -az --delete dist/ root@172.105.123.229:/var/www/biduahostingful/Hosting/hostingfrontend/dist/
```

### Issue: Backend API Not Responding
**Fix:**
```bash
ssh root@172.105.123.229
docker logs biduahosting-backend-1 --tail 50
docker compose -f /var/www/biduahostingful/Hosting/hostingbackend/docker-compose.yml restart backend
```

### Issue: Database Connection Error
**Fix:**
```bash
# Check if containers are running
docker ps | grep db

# Restart database stack
cd /var/www/biduahostingful/Hosting/hostingbackend
docker compose restart db pgbouncer backend
```

### Issue: SSL Certificate Expired
**Fix:**
```bash
ssh root@172.105.123.229
certbot renew --force-renewal
systemctl reload nginx
```

### Issue: Nginx Config Error
**Fix:**
```bash
ssh root@172.105.123.229
nginx -t                              # Check for errors
systemctl reload nginx                # Apply if valid
```

---

## 📞 Contact & Business Details

| Field | Value |
|-------|-------|
| **Company** | BIDUA Industries Pvt Ltd |
| **Address** | Suite 209, C-104, Sector 65, Noida, UP 201301, India |
| **GSTIN** | 09AANCB0882D1ZM |
| **Phone** | +91 95129 21903 |
| **Email** | support@biduapods.com |
| **Hours** | Mon-Sat 9:00-18:00 IST |
| **Support** | 24/7 Technical Support |

---

## 💰 Pricing System

### How It Works (Option C — Implemented)

| Component | Description |
|-----------|-------------|
| **Base Price** | VMHoster's current price for each plan |
| **Selling Price** | Base + 20% markup (our cost + margin) |
| **Market Price** | Monthly × 12 (shown as strike-through) |
| **Discount** | Monthly 5% → Quarterly 10% → Semi-Annual 15% → Annual 20% → Biennial 25% → Triennial 35% |
| **Final Price** | Market Price − Discount = exactly VMHoster price |

### Discount Breakdown (G.8GB example)

| Cycle | Market Price | Discount | Final Price |
|-------|-------------|----------|-------------|
| Monthly | ₹2,594 | 5% OFF | **₹2,464** |
| Quarterly | ₹8,213 | 10% OFF | **₹7,392** |
| Semi-Annually | ₹17,393 | 15% OFF | **₹14,784** |
| Annually | ₹36,960 | 20% OFF | **₹29,568** |
| Biennially | ₹78,848 | 25% OFF | **₹59,136** |
| Triennially | ₹1,36,468 | 35% OFF | **₹88,704** |

### Updating Prices (when VMHoster changes)

```bash
# Update database directly
/Library/PostgreSQL/18/bin/psql -h localhost -p 5433 -U apple -d ramaera_hosting -c "
  UPDATE hosting_plans SET monthly_price = monthly_price * 1.2 WHERE plan_type = 'general_purpose';
"
```

---

## 🖥️ Server Infrastructure

### Docker Containers

| Container | Port | Purpose |
|-----------|------|---------|
| `biduahosting-frontend-1` | 3000 | Frontend (not used directly) |
| `biduahosting-backend-1` | 8000 | FastAPI backend |
| `biduahosting-pgbouncer-1` | 6432 | Connection pooler |
| `biduahosting-db-1` | 5432 | PostgreSQL 13 |

---

## 🔙 Rollback Procedure

### Rollback Frontend (within 5 minutes)

```bash
ssh root@172.105.123.229
ls -lt /var/www/biduahostingful/Hosting/hostingfrontend/dist_backup_*
rm -rf /var/www/biduahostingful/Hosting/hostingfrontend/dist
cp -r /var/www/biduahostingful/Hosting/hostingfrontend/dist_backup_YYYYMMDD_HHMMSS /var/www/biduahostingful/Hosting/hostingfrontend/dist
nginx -s reload
```

---

## 📝 Important Notes

1. **Frontend is served as static files** — always build locally and rsync `dist/` to server
2. **Backend runs in Docker** — use `docker compose` to manage
3. **Database is persistent** — stored in Docker volume, survives container restarts
4. **PgBouncer** sits between backend and PostgreSQL for connection pooling
5. **Always backup** before major changes: `mv dist dist_backup_YYYYMMDD`
6. **Git is your friend** — commit often, push to GitHub for version control
7. **Never commit secrets** — `.env` files are in `.gitignore`
8. **SSL auto-renews** via Let's Encrypt certbot
9. **Always verify `.env` has production URL before building**
10. **Hard refresh browser** after every deploy

---

## 📞 Contact & Business Details

| Field | Value |
|-------|-------|
| **Company** | BIDUA Industries Pvt Ltd |
| **Address** | Suite 209, C-104, Sector 65, Noida, UP 201301, India |
| **GSTIN** | 09AANCB0882D1ZM |
| **Phone** | +91 95129 21903 |
| **Email** | support@biduapods.com |
| **Hours** | Mon-Sat 9:00-18:00 IST |
| **Support** | 24/7 Technical Support |

---

## 🔗 Useful Links

| Service | URL |
|---------|-----|
| Live Site | https://biduahosting.com |
| API | https://biduahosting.com/api/v1 |
| VMHoster (pricing source) | https://vmhoster.com/cloud-solution.php |
| GitHub Repo | https://github.com/obidua/BIDUA_Hosting |
| Server IP | 172.105.123.229 |
| SSH Port | 3322 |

---

*Document maintained by: BIDUA Industries Tech Team*  
*Last updated: 2026-09-12*
