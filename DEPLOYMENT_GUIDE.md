# BIDUA Hosting — Complete Deployment Guide

> Server: `172.105.123.229` (Linode, Ubuntu 22.04)  
> Domain: `biduahosting.com`  
> Last Updated: 2026-09-12

---

## 🏗️ Architecture Overview

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

## 📝 Important Notes

1. **Frontend is served as static files** — always build locally and rsync `dist/` to server
2. **Backend runs in Docker** — use `docker compose` to manage
3. **Database is persistent** — stored in Docker volume, survives container restarts
4. **PgBouncer** sits between backend and PostgreSQL for connection pooling
5. **Always backup** before major changes: `mv dist dist_backup_YYYYMMDD`
6. **Git is your friend** — commit often, push to GitHub for version control
7. **Never commit secrets** — `.env` files are in `.gitignore`
8. **SSL auto-renews** via Let's Encrypt certbot

---

## 🔗 Useful Links

| Service | URL |
|---------|-----|
| Live Site | https://biduahosting.com |
| API | https://api.ramaerahosting.com |
| VMHoster (pricing source) | https://vmhoster.com/cloud-solution.php |
| GitHub Repo | https://github.com/obidua/BIDUA_Hosting |
| Server IP | 172.105.123.229 |
| SSH Port | 3322 |

---

*Document maintained by: BIDUA Industries Tech Team*  
*Last updated: 2026-09-11*

## 📊 Database Schema

### Key Tables

| Table | Purpose |
|-------|---------|
| `hosting_plans` | Server plans & pricing (36 plans) |
| `services` | Additional services |
| `addons` | Plan add-ons |
| `users_profiles` | User accounts |
| `orders` | Order history |
| `invoices` | Billing invoices |
| `payment_transactions` | Payment records |
| `countries` | Country list (194) |

### Plan Types
- `general_purpose` (G.4GB to G.256GB) — 9 plans
- `cpu_optimized` (C.4GB to C.256GB) — 9 plans
- `memory_optimized` (M.8GB to M.384GB) — 9 plans
- `dedicated_server` (DS-E3, DS-E5, DS-AMD, DS-GOLD, DS-PLATINUM) — 9 plans


curl -s 'https://biduahosting.com/' | head -20
```

### Backend Deployment

#### Option A: Docker Rebuild (recommended)

```bash
ssh root@172.105.123.229
cd /var/www/biduahostingful/Hosting/hostingbackend

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Watch logs
docker logs biduahosting-backend-1 -f
```

#### Option B: Hot Reload (quick fixes)

```bash
# Copy updated files
scp app/api/v1/pricing.py root@172.105.123.229:/var/www/biduahostingful/Hosting/hostingbackend/app/api/v1/

# Restart backend
ssh root@172.105.123.229 'docker compose -f /var/www/biduahostingful/Hosting/hostingbackend/docker-compose.yml restart backend'
```


